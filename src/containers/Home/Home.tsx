import { useRef, useEffect, useState } from "react";
import "./Home.css";
import { MapService } from "../../utils/mapService";
import { IDay } from "../../utils/interfaces";
import { getDateNameArray, getDayArray } from "../../utils/dataReadService";
import { DaySelector } from "../../components/DaySelector/DaySelector";

export function Home() {
  const mapService = useRef<MapService | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const [isMapInitializingFinished, setIsMapInitializingFinished] =
    useState<boolean>(false);
  const [dayArray, setDayArray] = useState<IDay[]>([]);
  const [datesArray, setDatesArray] = useState<string[]>([]);
  const [progressPercentage, setProgressPrecentage] = useState<number>(0);

  function initializeMap() {
    if (mapService.current) return;
    if (mapContainer.current) {
      mapService.current = new MapService({
        container: mapContainer.current,
        style:
          process.env.REACT_APP_MAP_STYLE ??
          "mapbox://styles/mapbox/streets-v12",
        center: [0, 0],
        zoom: 15,
        pitch: 40,
        attributionControl: false,
        setProgressPrecentage,
      });
      mapService.current!.map!.on("load", async () => {
        setIsMapInitializingFinished(true);
      });
    }
  }

  async function initializeDayArray() {
    const arr = await getDayArray();
    setDatesArray(getDateNameArray());
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
        {isMapInitializingFinished &&
          dayArray.length &&
          datesArray &&
          mapService.current && (
            <DaySelector
              dates={datesArray}
              handleDayAnimation={handleDayAnimation}
              mapService={mapService.current!}
              progressPercentage={progressPercentage}
            />
          )}
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
