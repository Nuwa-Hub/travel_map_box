import { Position } from "@turf/turf";
import { TransportType } from "./enum";

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
