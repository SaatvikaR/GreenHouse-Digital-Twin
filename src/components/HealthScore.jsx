export default function HealthScore({ score }) {
  const color = score >= 75 ? "#4ade80" : score >= 50 ? "#f59e0b" : "#ef4444";
  const bg    = score >= 75 ? "#14532d" : score >= 50 ? "#451a03" : "#450a0a";
  const label = score >= 75 ? "Healthy" : score >= 50 ? "Needs Attention" : "Critical";

  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="card" style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>

      {/* Circle gauge */}
      <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="36" fill="none" stroke="#1e293b" strokeWidth="8"/>
          <circle
            cx="50" cy="50" r="36"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center"
        }}>
          <span style={{ fontSize: "1.4rem", fontWeight: 700, color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: "0.6rem", color: "#475569" }}>/ 100</span>
        </div>
      </div>

      {/* Text info */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.3rem" }}>
          Overall Crop Health Score
        </div>
        <div style={{ fontSize: "1.4rem", fontWeight: 700, color, marginBottom: "0.4rem" }}>
          {label}
        </div>
        <div style={{
          display: "inline-block", fontSize: "0.75rem",
          background: bg, color, border: `1px solid ${color}`,
          borderRadius: "99px", padding: "3px 12px", fontWeight: 600
        }}>
          {score >= 75 ? "✅ All zones operating normally"
         : score >= 50 ? "⚠️ Some zones need attention"
         : "🚨 Immediate intervention required"}
        </div>
      </div>

      {/* Per-sensor mini bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: 180 }}>
        {["Temperature", "Humidity", "Soil Moisture", "Light Level"].map((name, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.72rem", color: "#64748b", width: 90 }}>{name}</span>
            <div style={{ flex: 1, height: 5, background: "#1e293b", borderRadius: 99 }}>
              <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.8s ease" }}/>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}