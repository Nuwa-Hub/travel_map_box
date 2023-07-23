import mapboxgl, { GeoJSONSource, MapboxOptions } from "mapbox-gl";
import * as turf from "@turf/turf";
import { Feature, LineString, Point, Position } from "@turf/turf";
import { IRoute, ITransport } from "./interfaces";
import { TransportType } from "./enum";

interface IMapServiceArgs extends MapboxOptions {
  speedFactor?: number;
}

interface IAnimateArgs {
  counter: number;
  point: GeoJSON.FeatureCollection<GeoJSON.Geometry>;
  index: number;
}

export class MapService {
  speedFactor: number = 0.05;
  routeId = "route";
  pointId = "point";
  route: IRoute = {
    type: "FeatureCollection" as "FeatureCollection",
    features: [],
  };
  point: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
    type: "FeatureCollection" as "FeatureCollection",
    features: [],
  };
  map?: mapboxgl.Map;

  constructor(args: IMapServiceArgs) {
    this.speedFactor = args.speedFactor ?? this.speedFactor;
    this.map = new mapboxgl.Map({ ...args });
  }

  wrapperRequestAnimationFrame(): Promise<void> {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  }

  async animate({ counter, point, index }: IAnimateArgs) {
    const lineDistance = turf.length(this.route.features[index]);
    const steps = lineDistance / this.speedFactor;
    const start = (this.route.features[index].geometry as LineString)
      .coordinates[counter >= steps ? counter - 1 : counter];
    const end = (this.route.features[index].geometry as LineString).coordinates[
      counter >= steps ? counter : counter + 1
    ];
    if (!start || !end) {
      return;
    }
    (point.features[0].geometry as Point).coordinates = (
      this.route.features[index].geometry as LineString
    ).coordinates[counter];
    if (point.features[0].properties) {
      point.features[0].properties.bearing = turf.bearing(
        turf.point(start),
        turf.point(end)
      );
    }
    (this.map!.getSource(this.pointId) as GeoJSONSource).setData(point);
    if (counter < steps) {
      const coordinates = (point.features[0].geometry as Point).coordinates;
      this.map!.setCenter([coordinates[0], coordinates[1]]);
      this.clearLayerSymbol();
      this.addLayerSymbol(this.route.features[index].transportType);
      await this.wrapperRequestAnimationFrame();
      await this.animate({ counter: counter + 1, point, index });
    }
  }

  preprocess({ transportArray }: { transportArray: ITransport[] }): void {
    const origin = transportArray[0].origin;

    transportArray.forEach((transport) => {
      this.route.features.push({
        type: "Feature" as "Feature",
        properties: {},
        geometry: {
          type: "LineString" as "LineString",
          coordinates: [transport.origin, transport.destination],
        },
        transportType: transport.type,
      });
    });

    this.point.features.push({
      type: "Feature" as "Feature",
      properties: {},
      geometry: {
        type: "Point" as "Point",
        coordinates: origin,
      },
    });
    for (let j = 0; j < this.route.features.length; j++) {
      const lineDistance = turf.length(this.route.features[j]);
      const steps = lineDistance / this.speedFactor;
      const arc: Position[] = [];
      for (let i = 0; i < lineDistance; i += lineDistance / steps) {
        const segment = turf.along(
          this.route.features[j] as Feature<LineString>,
          i
        );
        arc.push(segment.geometry.coordinates);
      }
      (this.route.features[j].geometry as LineString).coordinates = arc;
    }
  }

  addSourceRoute() {
    this.map!.addSource(this.routeId, {
      type: "geojson",
      data: this.route,
    });
  }

  clearSourceRoute() {
    if (this.map!.getSource(this.routeId)) {
      this.map!.removeSource(this.routeId);
    }
  }

  addSourcePoint() {
    this.map!.addSource(this.pointId, {
      type: "geojson",
      data: this.point,
    });
  }

  clearSourcePoint() {
    if (this.map!.getSource(this.pointId)) {
      this.map!.removeSource(this.pointId);
    }
  }

  addLayerLine() {
    this.map!.addLayer({
      id: this.routeId,
      source: this.routeId,
      type: "line",
      paint: {
        "line-width": 5,
        "line-color": "#db7916",
      },
    });
  }

  clearLayerLine() {
    if (this.map!.getLayer(this.routeId)) {
      this.map!.removeLayer(this.routeId);
    }
  }

  addLayerSymbol(type: TransportType) {
    this.map!.addLayer({
      id: this.pointId,
      source: this.pointId,
      type: "symbol",
      layout: {
        "icon-image": type,
        "icon-size": 1.5,
        "icon-rotate": ["get", "bearing"],
        "icon-rotation-alignment": "map",
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
    });
  }

  clearLayerSymbol() {
    if (this.map!.getLayer(this.pointId)) {
      this.map!.removeLayer(this.pointId);
    }
  }

  clearAll() {
    this.clearLayerLine();
    this.clearLayerSymbol();
    this.clearSourcePoint();
    this.clearSourceRoute();
    this.route = {
      type: "FeatureCollection" as "FeatureCollection",
      features: [],
    };
    this.point = {
      type: "FeatureCollection" as "FeatureCollection",
      features: [],
    };
  }

  async handleMapLoad() {
    this.addSourceRoute();
    this.addSourcePoint();
    this.addLayerLine();
    for (let i = 0; i < this.route.features.length; i++) {
      await this.animate({ counter: 0, point: this.point, index: i });
    }
  }
}
