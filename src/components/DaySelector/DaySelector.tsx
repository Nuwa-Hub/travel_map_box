import { useState } from "react";
import "./DaySelector.css";
import { DayCell } from "../DayCell/DayCell";
import { MapService } from "../../utils/mapService";
import { waitSeconds } from "../../utils/helpers";
import ProgressBar from "@ramonak/react-progress-bar";

interface DaySelectorProps {
  dates: string[];
  handleDayAnimation: (arg: number) => Promise<void>;
  mapService: MapService;
  progressPercentage: number;
}

export function DaySelector({
  dates,
  handleDayAnimation,
  mapService,
  progressPercentage,
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
      <div className="day-selector-row">
        {dates.map((date, index) => (
          <DayCell
            key={index}
            date={date}
            isSelected={index === selectedDateIndex}
            onClick={() => handleDateSelection(index)}
            downFlightIconEnabled={index === 0}
            upFlightIconEnabled={index === dates.length - 1}
          />
        ))}

        <div className="play-button" onClick={handlePlayButtonClick}>
          {!isPlaying || isPaused ? (
            <img
              src="/icons/play-button.png"
              alt="Play"
              className="play-icon"
            />
          ) : (
            <img
              src="/icons/pause-button.png"
              alt="Stop"
              className="play-icon"
            />
          )}
        </div>
      </div>
      <ProgressBar
        completed={progressPercentage}
        bgColor="#00ccff"
        isLabelVisible={false}
        height="5px"
      />
    </div>
  );
}
