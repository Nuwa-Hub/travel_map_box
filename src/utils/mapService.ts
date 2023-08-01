import mapboxgl, { GeoJSONSource, MapboxOptions } from "mapbox-gl";
import * as turf from "@turf/turf";
import { Feature, LineString, Point, Position } from "@turf/turf";
import { IRoute, ITransport } from "./interfaces";
import { TransportType } from "./enum";
import { waitSeconds } from "./helpers";

interface IMapServiceArgs extends MapboxOptions {
  speedFactor?: number;
}

interface IAnimateArgs {
  counter: number;
  point: GeoJSON.FeatureCollection<GeoJSON.Geometry>;
  index: number;
}

export class MapService {
  speedFactor: number = 0.005;
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
  passedRoute: IRoute = {
    type: "FeatureCollection" as "FeatureCollection",
    features: [],
  };
  dynamicRoute: IRoute = {
    type: "FeatureCollection" as "FeatureCollection",
    features: [
      {
        type: "Feature" as "Feature",
        properties: {},
        geometry: {
          type: "LineString" as "LineString",
          coordinates: [],
        },
        transportType: TransportType.Car,
      },
    ],
  };
  dynamicLineCount = 0;
  lineCount = 0;
  clearCurrentFlag = false;
  pauseCurrentFlag = false;

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

  getDynamicId() {
    this.dynamicLineCount = (this.dynamicLineCount + 1) % 5;
    return `dynamic_${this.dynamicLineCount}`;
  }

  getRouteId() {
    this.lineCount = (this.lineCount + 1) % 5;
    return `route_${this.lineCount}`;
  }

  pauseAnimation() {
    this.pauseCurrentFlag = true;
  }

  continueAnimation() {
    this.pauseCurrentFlag = false;
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
      this.clearLayerSymbol({ id: this.pointId });
      this.addLayerSymbol({
        id: this.pointId,
        type: this.route.features[index].transportType,
      });

      (this.dynamicRoute.features[0].geometry as LineString).coordinates.push(
        coordinates
      );
      const id = this.getDynamicId();
      this.addSourceRoute({
        id,
        route: this.dynamicRoute,
      });
      this.addLayerLine({
        id,
      });
      if (this.clearCurrentFlag) {
        this.reset();
        this.clearCurrentFlag = false;
        return;
      } else {
        while (this.pauseCurrentFlag) {
          await waitSeconds(1);
        }
        await this.wrapperRequestAnimationFrame();
        await this.animate({ counter: counter + 1, point, index });
      }
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

  addSourceRoute({ id, route }: { id: string; route: IRoute }) {
    this.clearSourceRoute({ id });
    this.map!.addSource(id, {
      type: "geojson",
      data: route,
    });
  }

  clearSourceRoute({ id }: { id: string }) {
    this.clearLayerLine({ id });
    if (this.map!.getSource(id)) {
      this.map!.removeSource(id);
    }
  }

  addSourcePoint({
    id,
    point,
  }: {
    id: string;
    point: GeoJSON.FeatureCollection<GeoJSON.Geometry>;
  }) {
    this.map!.addSource(id, {
      type: "geojson",
      data: point,
    });
  }

  clearSourcePoint({ id }: { id: string }) {
    this.clearLayerSymbol({ id });
    if (this.map!.getSource(id)) {
      this.map!.removeSource(id);
    }
  }

  addLayerLine({ id }: { id: string }) {
    this.clearLayerLine({ id });
    this.map!.addLayer({
      id,
      source: id,
      type: "line",
      paint: {
        "line-width": 5,
        "line-color": "#db7916",
      },
    });
  }

  clearLayerLine({ id }: { id: string }) {
    if (this.map!.getLayer(id)) {
      this.map!.removeLayer(id);
    }
  }

  addLayerSymbol({ type, id }: { type: TransportType; id: string }) {
    this.map!.addLayer({
      id,
      source: id,
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

  clearLayerSymbol({ id }: { id: string }) {
    if (this.map!.getLayer(id)) {
      this.map!.removeLayer(id);
    }
  }

  reset() {
    this.clearSourcePoint({ id: this.pointId });
    for (let i = 0; i < 5; i++) {
      this.clearSourceRoute({ id: this.getDynamicId() });
      this.clearSourceRoute({ id: this.getRouteId() });
    }
    this.route = {
      type: "FeatureCollection" as "FeatureCollection",
      features: [],
    };
    this.point = {
      type: "FeatureCollection" as "FeatureCollection",
      features: [],
    };
    this.passedRoute = {
      type: "FeatureCollection" as "FeatureCollection",
      features: [],
    };
    this.dynamicRoute = {
      type: "FeatureCollection" as "FeatureCollection",
      features: [
        {
          type: "Feature" as "Feature",
          properties: {},
          geometry: {
            type: "LineString" as "LineString",
            coordinates: [],
          },
          transportType: TransportType.Car,
        },
      ],
    };
  }

  async handleMapLoad() {
    this.continueAnimation();
    this.addSourcePoint({ id: this.pointId, point: this.point });
    for (let i = 0; i < this.route.features.length; i++) {
      (this.dynamicRoute.features[0].geometry as LineString).coordinates = [];
      await this.animate({ counter: 0, point: this.point, index: i });
      this.passedRoute.features.push(this.route.features[i]);
      const id = this.getRouteId();
      this.addSourceRoute({
        id,
        route: this.passedRoute,
      });
      this.addLayerLine({
        id,
      });
    }
  }
}
