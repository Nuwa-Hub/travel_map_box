import { Feature, Geometry, Position } from "@turf/turf";
import { TransportType } from "./enum";
import { GeoJsonProperties } from "geojson";

export interface ILocation {
  type: string;
  coordinate: Position;
}

export interface ITransport {
  origin: Position;
  destination: Position;
  type: TransportType;
}

export interface IDay {
  index: number;
  locationArray: ILocation[];
  transportArray: ITransport[];
}

interface IFeature extends Feature<GeoJSON.Geometry, GeoJsonProperties> {
  transportType: TransportType;
}

export interface IRoute extends GeoJSON.FeatureCollection<GeoJSON.Geometry> {
  features: Array<IFeature>;
}
