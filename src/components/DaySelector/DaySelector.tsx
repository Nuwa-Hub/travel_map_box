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
        setIsPaused(false);
        if (selectedDateIndex !== playingDateIndex) {
          mapService.clearCurrentFlag = true;
          setIsPlaying(false);
          await waitSeconds(1);
          await handlePlay();
        }
      } else {
        mapService.pauseAnimation();
        setIsPaused(true);
      }
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
        {!isPlaying || isPaused ? (
          <img src="/icons/play-button.png" alt="Play" className="play-icon" />
        ) : (
          <img src="/icons/pause-button.png" alt="Stop" className="play-icon" />
        )}
      </div>
    </div>
  );
}
