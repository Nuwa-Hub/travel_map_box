import { apiInstance as axiosInstance } from "./axiosService";
import { TransportType } from "./enum";
import { formatDateArray } from "./helpers";
import { IDay } from "./interfaces";
import data from "./sampleResponse.json";

function convertStringToPosition(str: string) {
  return str.split(",").map(Number).reverse();
}

async function getRouteSegments({
  origin,
  destination,
}: {
  origin: number[];
  destination: number[];
}) {
  const coordinatesString = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;
  const queryParams = {
    radiuses: "25;25",
    access_token: process.env.REACT_APP_ACCESS_TOKEN,
    geometries: "geojson",
  };
  try {
    const response = await axiosInstance.get(
      `/mapbox/driving/${coordinatesString}`,
      { params: queryParams }
    );
    if (response.data?.code === "NoMatch") {
      return [{ origin, destination, type: TransportType.Flight }];
    } else if (response.data?.code === "Ok") {
      const listCoordinates = response?.data?.matchings[0].geometry.coordinates;
      const retList = [];
      for (let i = 0; i < listCoordinates.length; i++) {
        if (i === 0) {
          retList.push({
            origin,
            destination: listCoordinates[0],
            type: TransportType.Car,
          });
        }
        if (i === listCoordinates.length - 1) {
          retList.push({
            origin: listCoordinates[i],
            destination,
            type: TransportType.Car,
          });
        } else {
          retList.push({
            origin: listCoordinates[i],
            destination: listCoordinates[i + 1],
            type: TransportType.Car,
          });
        }
      }
      return retList;
    } else {
      return [{ origin, destination, type: TransportType.Flight }];
    }
  } catch (err) {
    return [{ origin, destination, type: TransportType.Flight }];
  }
}

export async function getDayArray(): Promise<IDay[]> {
  const dayArray: IDay[] = [];
  for (let j = 0; j < data.length; j++) {
    const value = data[j];
    const day: IDay = {
      index: value.days,
      locationArray: [],
      transportArray: [],
    };
    for (let i = 1; i < value.place.length; i++) {
      const placeValue = value.place[i];
      if (placeValue.place_type === "transport") {
        if (
          placeValue.meta_data?.origin &&
          placeValue.meta_data?.destionation
        ) {
          const numberOrigin = convertStringToPosition(
            placeValue.meta_data?.origin
          );
          const numberDestination = convertStringToPosition(
            placeValue.meta_data?.destionation
          );
          const segmentArray = await getRouteSegments({
            origin: numberOrigin,
            destination: numberDestination,
          });
          segmentArray.forEach((value) => {
            day.transportArray.push(value);
          });
        } else {
          throw Error(
            "Origin and Destination must be defined for the transport"
          );
        }
      } else {
        if (placeValue.place_coordinate) {
          day.locationArray.push({
            type: placeValue.place_type,
            coordinate: convertStringToPosition(placeValue.place_coordinate),
          });
        } else {
          throw Error("Place co ordinates must be defined for a place");
        }
      }
    }
    dayArray.push(day);
  }
  return dayArray;
}

export function getDateNameArray() {
  return formatDateArray(
    data[0].place[0].meta_data?.lastTicketingDate!,
    data.length
  );
}
