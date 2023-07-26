import "./DayCell.css";

interface DayCellProps {
  date: string;
  isSelected: boolean;
  onClick: () => void;
  flightIconEnabled?: boolean;
}

export function DayCell({
  date,
  isSelected,
  onClick,
  flightIconEnabled = false,
}: DayCellProps) {
  return (
    <div
      className={`day-cell ${isSelected ? "selected" : ""}`}
      style={{ paddingLeft: flightIconEnabled ? "2px" : "5px" }}
      onClick={onClick}
    >
      {flightIconEnabled ? <span className="icon">✈️</span> : <div />}
      <div className="date">
        <span className="day">{date.slice(0, 2)}</span>
        <span className="month">{date.slice(3)}</span>
      </div>
    </div>
  );
}
