import { useState, useEffect } from "react";
import { SENSORS, getStatus } from "../data/sensors";

function generateAdvice(readings) {
  const advice = [];

  SENSORS.forEach(sensor => {
    const value = readings[sensor.id];
    const status = getStatus(value, sensor);
    const [low, high] = sensor.ideal;

    if (status === "normal") return;

    if (sensor.id === "temp") {
      if (value > high) advice.push({
        priority: "high",
        icon: "🌡️",
        title: "High Temperature Alert",
        action: "Activate cooling fans immediately. Open roof vents. Consider shade netting for afternoon hours.",
        impact: "Prevents crop wilting and heat stress"
      });
      else advice.push({
        priority: "medium",
        icon: "❄️",
        title: "Low Temperature Warning",
        action: "Close all vents. Switch on heating system. Monitor overnight temperature closely.",
        impact: "Prevents frost damage to seedlings"
      });
    }

    if (sensor.id === "humidity") {
      if (value > high) advice.push({
        priority: "high",
        icon: "💧",
        title: "Excess Humidity Detected",
        action: "Increase air circulation. Run dehumidifier. Space out plants to improve airflow.",
        impact: "Prevents fungal disease and mold growth"
      });
      else advice.push({
        priority: "medium",
        icon: "🚿",
        title: "Low Humidity Warning",
        action: "Mist plants with water spray. Place water trays near heat sources. Check ventilation.",
        impact: "Prevents leaf curl and dry stress"
      });
    }

    if (sensor.id === "soil") {
      if (value < low) advice.push({
        priority: "high",
        icon: "🌱",
        title: "Soil Too Dry — Irrigate Now",
        action: "Trigger drip irrigation for 20 minutes. Check for blocked irrigation lines. Mulch soil surface.",
        impact: "Prevents root dehydration and crop loss"
      });
      else advice.push({
        priority: "medium",
        icon: "🪣",
        title: "Soil Moisture Too High",
        action: "Pause irrigation immediately. Improve drainage channels. Check for waterlogging in Zone C.",
        impact: "Prevents root rot and oxygen depletion"
      });
    }

    if (sensor.id === "light") {
      if (value < low) advice.push({
        priority: "medium",
        icon: "💡",
        title: "Insufficient Light Levels",
        action: "Switch on grow lights for 4 hours. Clean dusty greenhouse panels. Reposition shade cloth.",
        impact: "Ensures proper photosynthesis rate"
      });
      else advice.push({
        priority: "low",
        icon: "🌤️",
        title: "Light Intensity Too High",
        action: "Deploy shade netting over sensitive crops. Increase misting frequency to cool canopy.",
        impact: "Prevents leaf scorch on delicate plants"
      });
    }
  });

  if (advice.length === 0) {
    advice.push({
      priority: "good",
      icon: "✅",
      title: "All conditions optimal",
      action: "No action required. Greenhouse is operating within ideal parameters for all zones.",
      impact: "Expected yield: normal"
    });
  }

  return advice;
}

const PRIORITY_STYLE = {
  high:   { bg: "#450a0a", border: "#ef4444", badge: "#ef4444", badgeBg: "#7f1d1d", label: "HIGH" },
  medium: { bg: "#451a03", border: "#f59e0b", badge: "#f59e0b", badgeBg: "#78350f", label: "MEDIUM" },
  low:    { bg: "#1e293b", border: "#60a5fa", badge: "#60a5fa", badgeBg: "#1e3a5f", label: "LOW" },
  good:   { bg: "#14532d", border: "#4ade80", badge: "#4ade80", badgeBg: "#166534", label: "GOOD" },
};

export default function AIAdvice({ readings }) {
  const [advice, setAdvice] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const runAnalysis = () => {
    setLoading(true);
    setTimeout(() => {
      setAdvice(generateAdvice(readings));
      setLastUpdate(new Date().toLocaleTimeString());
      setLoading(false);
    }, 1200);
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  return (
    <div className="card" style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <div className="card-title" style={{ margin: 0 }}>🤖 AI Recommendations</div>
        <span style={{ fontSize: "0.75rem", color: "#475569", marginLeft: 8 }}>
          {lastUpdate ? `last analysed: ${lastUpdate}` : ""}
        </span>
        <button
          onClick={runAnalysis}
          disabled={loading}
          style={{
            marginLeft: "auto",
            background: loading ? "#1e293b" : "#14532d",
            color: loading ? "#475569" : "#4ade80",
            border: "1px solid #4ade80",
            borderRadius: "8px",
            padding: "0.3rem 0.9rem",
            fontSize: "0.8rem",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "Analysing..." : "🔍 Re-analyse"}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#475569" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🤖</div>
          <div style={{ fontSize: "0.85rem" }}>Analysing sensor data across all zones...</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.8rem" }}>
          {advice.map((item, i) => {
            const style = PRIORITY_STYLE[item.priority];
            return (
              <div key={i} style={{
                background: style.bg,
                border: `1px solid ${style.border}`,
                borderRadius: "10px",
                padding: "1rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: style.badge }}>{item.title}</span>
                  <span style={{
                    marginLeft: "auto", fontSize: "0.65rem", fontWeight: 700,
                    background: style.badgeBg, color: style.badge,
                    padding: "2px 7px", borderRadius: "99px"
                  }}>{style.label}</span>
                </div>
                <div style={{ fontSize: "0.82rem", color: "#cbd5e1", marginBottom: "0.5rem", lineHeight: 1.5 }}>
                  <strong style={{ color: "#94a3b8" }}>Action: </strong>{item.action}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  💡 {item.impact}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}