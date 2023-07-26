import { useRef, useEffect, useState } from "react";
import "./Home.css";
import { MapService } from "../../utils/mapService";
import { IDay } from "../../utils/interfaces";
import { getDayArray } from "../../utils/dataReadService";
import { DaySelector } from "../../components/DaySelector/DaySelector";

export function Home() {
  const mapService = useRef<MapService | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const [isMapInitializingFinished, setIsMapInitializingFinished] =
    useState<boolean>(false);
  const [dayArray, setDayArray] = useState<IDay[]>([]);

  function initializeMap() {
    if (mapService.current) return;
    console.log(process.env.REACT_APP_MAP_STYLE);
    if (mapContainer.current) {
      mapService.current = new MapService({
        container: mapContainer.current,
        style:
          process.env.REACT_APP_MAP_STYLE ??
          "mapbox://styles/mapbox/streets-v12",
        center: [0, 0],
        zoom: 15,
        pitch: 40,
      });
      mapService.current!.map!.on("load", async () => {
        setIsMapInitializingFinished(true);
      });
    }
  }

  async function initializeDayArray() {
    const arr = await getDayArray();
    setDayArray(arr);
  }

  async function handleDayAnimation(dayIndex: number) {
    mapService.current!.preprocess({
      transportArray: dayArray![dayIndex].transportArray,
    });
    await mapService.current!.handleMapLoad();
    mapService.current!.reset();
  }

  useEffect(() => {
    initializeMap();
    initializeDayArray();
  }, []);

  return (
    <div className="home">
      <div className="day-selector-box">
        {isMapInitializingFinished && dayArray.length && (
          <DaySelector
            dates={[
              "23 Dec",
              "24 Dec",
              "25 Dec",
              "26 Dec",
              "27 Dec",
              "28 Dec",
              "29 Dec",
            ]}
            handleDayAnimation={handleDayAnimation}
          />
        )}
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
