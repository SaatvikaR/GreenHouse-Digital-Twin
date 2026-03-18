import { SENSORS, getStatus } from "../data/sensors";

const ZONE_COLORS = {
  normal:  { fill: "#14532d", stroke: "#4ade80", text: "#4ade80" },
  warning: { fill: "#451a03", stroke: "#f59e0b", text: "#f59e0b" },
  danger:  { fill: "#450a0a", stroke: "#ef4444", text: "#ef4444" },
};

const ZONES = [
  { id: "A", label: "Zone A", x: 60,  y: 80,  w: 160, h: 120, sensors: ["temp", "humidity"] },
  { id: "B", label: "Zone B", x: 260, y: 80,  w: 160, h: 120, sensors: ["light", "soil"] },
  { id: "C", label: "Zone C", x: 460, y: 80,  w: 160, h: 120, sensors: ["temp", "soil"] },
  { id: "D", label: "Zone D", x: 160, y: 250, w: 160, h: 120, sensors: ["humidity", "light"] },
  { id: "E", label: "Zone E", x: 360, y: 250, w: 160, h: 120, sensors: ["temp", "humidity"] },
];

function getZoneStatus(zone, readings) {
  const statuses = zone.sensors.map(sid => {
    const sensor = SENSORS.find(s => s.id === sid);
    return getStatus(readings[sid], sensor);
  });
  if (statuses.includes("danger"))  return "danger";
  if (statuses.includes("warning")) return "warning";
  return "normal";
}

export default function GreenhouseMap({ readings }) {
  return (
    <div className="card" style={{ marginBottom: "1.5rem" }}>
      <div className="card-title">🗺️ Greenhouse Floor Map
        <span style={{ fontSize: "0.75rem", color: "#475569", fontWeight: 400, marginLeft: 8 }}>
          zones color-coded by sensor status
        </span>
      </div>

      <svg width="100%" viewBox="0 0 680 420" style={{ borderRadius: 8 }}>
        {/* Background */}
        <rect x="0" y="0" width="680" height="420" fill="#0f172a" rx="8"/>

        {/* Greenhouse outline */}
        <rect x="30" y="30" width="620" height="360" rx="12"
          fill="none" stroke="#1e3a2f" strokeWidth="2" strokeDasharray="8 4"/>

        {/* Roof line */}
        <polyline points="30,30 340,8 650,30"
          fill="none" stroke="#1e3a2f" strokeWidth="1.5"/>

        {/* Center path */}
        <rect x="220" y="60" width="20" height="310" fill="#0f172a" opacity="0.6"/>
        <rect x="60"  y="215" width="560" height="20" fill="#0f172a" opacity="0.6"/>

        {/* Label: paths */}
        <text x="228" y="390" fill="#1e3a5f" fontSize="10" fontFamily="sans-serif">walkway</text>
        <text x="350" y="228" fill="#1e3a5f" fontSize="10" fontFamily="sans-serif">walkway</text>

        {/* Zones */}
        {ZONES.map(zone => {
          const status = getZoneStatus(zone, readings);
          const colors = ZONE_COLORS[status];
          const cx = zone.x + zone.w / 2;
          const cy = zone.y + zone.h / 2;

          return (
            <g key={zone.id}>
              <rect
                x={zone.x} y={zone.y}
                width={zone.w} height={zone.h}
                rx="8"
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="1.5"
                opacity="0.9"
              />
              {/* Zone label */}
              <text
                x={cx} y={cy - 18}
                textAnchor="middle"
                fill={colors.text}
                fontSize="13"
                fontWeight="700"
                fontFamily="sans-serif"
              >
                {zone.label}
              </text>

              {/* Sensor readings inside zone */}
              {zone.sensors.map((sid, i) => {
                const sensor = SENSORS.find(s => s.id === sid);
                const val = readings[sid];
                return (
                  <text
                    key={sid}
                    x={cx} y={cy + 2 + i * 18}
                    textAnchor="middle"
                    fill={colors.text}
                    fontSize="11"
                    fontFamily="sans-serif"
                    opacity="0.85"
                  >
                    {sensor.label}: {val}{sensor.unit}
                  </text>
                );
              })}

              {/* Status dot */}
              <circle
                cx={zone.x + zone.w - 14}
                cy={zone.y + 14}
                r="5"
                fill={colors.stroke}
                opacity={status === "normal" ? 0.6 : 1}
              />
            </g>
          );
        })}

        {/* Entry door */}
        <rect x="310" y="368" width="60" height="22" rx="4"
          fill="#1e293b" stroke="#334155" strokeWidth="1"/>
        <text x="340" y="383" textAnchor="middle"
          fill="#475569" fontSize="10" fontFamily="sans-serif">ENTRY</text>

        {/* Legend */}
        <g>
          <circle cx="50"  cy="400" r="5" fill="#4ade80"/>
          <text x="60"  y="404" fill="#64748b" fontSize="10" fontFamily="sans-serif">Normal</text>
          <circle cx="130" cy="400" r="5" fill="#f59e0b"/>
          <text x="140" y="404" fill="#64748b" fontSize="10" fontFamily="sans-serif">Warning</text>
          <circle cx="215" cy="400" r="5" fill="#ef4444"/>
          <text x="225" y="404" fill="#64748b" fontSize="10" fontFamily="sans-serif">Danger</text>
        </g>
      </svg>
    </div>
  );
}