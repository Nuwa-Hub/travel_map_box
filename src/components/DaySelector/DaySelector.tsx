import { useState } from "react";
import "./DaySelector.css";
import { DayCell } from "../DayCell/DayCell";

interface DaySelectorProps {
  dates: string[];
  handleDayAnimation: (arg: number) => Promise<void>;
}

export function DaySelector({ dates, handleDayAnimation }: DaySelectorProps) {
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  function handleDateSelection(dateIndex: number) {
    setSelectedDateIndex(dateIndex);
  }

  async function handlePlay() {
    if (isPlaying) {
      console.error("Already playing");
    } else {
      setIsPlaying(true);
      await handleDayAnimation(selectedDateIndex);
      setIsPlaying(false);
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
      <div className="play-button" onClick={handlePlay}>
        <span className="play-icon">▶</span>
      </div>
    </div>
  );
}
