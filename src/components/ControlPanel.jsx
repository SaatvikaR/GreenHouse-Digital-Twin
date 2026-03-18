export default function ControlPanel({ sensors, readings, onOverride, overrides, onToggle }) {
  return (
    <div className="card" style={{ marginBottom: "1.5rem" }}>
      <div className="card-title">🎛️ Manual Override Controls
        <span style={{ fontSize: "0.75rem", color: "#475569", fontWeight: 400, marginLeft: 8 }}>
          drag to simulate conditions
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.2rem" }}>
        {sensors.map(sensor => (
          <div key={sensor.id}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
              <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>{sensor.label}</span>
              <span style={{ fontSize: "0.82rem", color: "#e2e8f0", fontWeight: 600 }}>
                {readings[sensor.id]}{sensor.unit}
              </span>
            </div>
            <input
              type="range"
              min={sensor.min}
              max={sensor.max}
              step="0.5"
              value={readings[sensor.id]}
              onChange={e => onOverride(sensor.id, parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "#4ade80", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#475569" }}>
              <span>{sensor.min}{sensor.unit}</span>
              <span style={{ color: "#64748b" }}>ideal: {sensor.ideal[0]}–{sensor.ideal[1]}</span>
              <span>{sensor.max}{sensor.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "1.2rem", display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
        <button onClick={() => onToggle("heatwave")}
          style={btnStyle("#7f1d1d", "#ef4444")}>
          🔥 Simulate Heatwave
        </button>
        <button onClick={() => onToggle("drought")}
          style={btnStyle("#78350f", "#f59e0b")}>
          🏜️ Simulate Drought
        </button>
        <button onClick={() => onToggle("reset")}
          style={btnStyle("#14532d", "#4ade80")}>
          ✅ Reset to Normal
        </button>
      </div>
    </div>
  );
}

function btnStyle(bg, color) {
  return {
    background: bg, color, border: `1px solid ${color}`,
    borderRadius: "8px", padding: "0.4rem 1rem",
    fontSize: "0.82rem", cursor: "pointer", fontWeight: 600
  };
}