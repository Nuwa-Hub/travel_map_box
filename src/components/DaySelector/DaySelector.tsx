import { useState } from "react";
import "./DaySelector.css";
import { DayCell } from "../DayCell/DayCell";
import mapboxgl from "mapbox-gl";
import { MapService } from "../../utils/mapService";
import { waitSeconds } from "../../utils/helpers";

interface DaySelectorProps {
  dates: string[];
  handleDayAnimation: (arg: number) => Promise<void>;
  mapService: MapService;
}

export function DaySelector({
  dates,
  handleDayAnimation,
  mapService,
}: DaySelectorProps) {
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  function handleDateSelection(dateIndex: number) {
    setSelectedDateIndex(dateIndex);
  }

  async function handlePlay() {
    if (isPlaying) {
      mapService.clearCurrentFlag = true;
      await waitSeconds(1);
    }
    setIsPlaying(true);
    await handleDayAnimation(selectedDateIndex);
    setIsPlaying(false);
  }

  return (
    <div className="day-selector">
      {dates.map((date, index) => (
        <DayCell
          key={index}
          date={date}
          isSelected={index === selectedDateIndex}
          onClick={() => handleDateSelection(index)}
          flightIconEnabled={
            index === 0 || index === dates.length - 1 ? true : false
          }
        />
      ))}
      <div className="play-button" onClick={handlePlay}>
        <span className="play-icon">▶</span>
      </div>
    </div>
  );
}
