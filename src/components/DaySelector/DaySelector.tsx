import { useState } from "react";
import "./DaySelector.css";
import { DayCell } from "../DayCell/DayCell";
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
  const [playingDateIndex, setPlayingDateIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  function handleDateSelection(dateIndex: number) {
    setSelectedDateIndex(dateIndex);
  }

  async function handlePlay() {
    setIsPlaying(true);
    setPlayingDateIndex(selectedDateIndex);
    await handleDayAnimation(selectedDateIndex);
    setIsPlaying(false);
    setPlayingDateIndex(-1);
  }

  async function handlePlayButtonClick() {
    if (isPlaying) {
      if (isPaused) {
        mapService.continueAnimation();
        if (selectedDateIndex !== playingDateIndex) {
          mapService.clearCurrentFlag = true;
          await waitSeconds(1);
          await handlePlay();
        }
      } else {
        mapService.pauseAnimation();
      }
      setIsPaused(!isPaused);
    } else {
      await handlePlay();
    }
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
      <div className="play-button" onClick={handlePlayButtonClick}>
        <span className="play-icon">{!isPlaying || isPaused ? "▶" : "||"}</span>
      </div>
    </div>
  );
}
