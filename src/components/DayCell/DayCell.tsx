import "./DayCell.css";

interface DayCellProps {
  date: string;
  isSelected: boolean;
  onClick: () => void;
  upFlightIconEnabled?: boolean;
  downFlightIconEnabled?: boolean;
}

export function DayCell({
  date,
  isSelected,
  onClick,
  upFlightIconEnabled = false,
  downFlightIconEnabled = false,
}: DayCellProps) {
  return (
    <div
      className={`day-cell ${isSelected ? "selected" : ""}`}
      style={{
        paddingLeft:
          upFlightIconEnabled || downFlightIconEnabled ? "2px" : "5px",
      }}
      onClick={onClick}
    >
      {upFlightIconEnabled && !isSelected && (
        <img src="/icons/plane-up-grey.png" alt="Plane" className="plane-icon" />
      )}
      {upFlightIconEnabled && isSelected && (
        <img src="/icons/plane-up-tosca.png" alt="Plane" className="plane-icon" />
      )}
      {downFlightIconEnabled && !isSelected && (
        <img
          src="/icons/plane-down-grey.png"
          alt="Plane"
          className="plane-icon"
        />
      )}
      {downFlightIconEnabled && isSelected && (
        <img
          src="/icons/plane-down-tosca.png"
          alt="Plane"
          className="plane-icon"
        />
      )}

      <div className="date">
        <span className="day">{date.slice(0, 2)}</span>
        <span className="month">{date.slice(3)}</span>
      </div>
    </div>
  );
}
