import { Thermometer, Droplets, Sprout, Sun } from "lucide-react";

const ICONS = {
  thermometer: Thermometer,
  droplets: Droplets,
  sprout: Sprout,
  sun: Sun,
};

export default function SensorCard({ sensor, value, status }) {
  const Icon = ICONS[sensor.icon];
  return (
    <div className={`card ${status}`}>
      <div className="sensor-label">
        {Icon && <Icon size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />}
        {sensor.label}
      </div>
      <div className={`sensor-value ${status}`}>
        {value}<span style={{ fontSize: "1rem", fontWeight: 400 }}>{sensor.unit}</span>
      </div>
      <span className={`status-badge ${status}`}>{status}</span>
    </div>
  );
}