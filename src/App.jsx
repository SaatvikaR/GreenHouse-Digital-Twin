import { useState, useEffect, useRef } from "react";
import "./App.css";
import { SENSORS, getInitialReadings, getNextReading, getStatus, generateAlert, SCENARIOS, getCropHealthScore } from "./data/sensors";
import SensorCard from "./components/SensorCard";
import SensorChart from "./components/SensorChart";
import AlertPanel from "./components/AlertPanel";
import ControlPanel from "./components/ControlPanel";
import GreenhouseMap from "./components/GreenhouseMap";
import AIAdvice from "./components/AIAdvice";
import HealthScore from "./components/HealthScore";
import WeatherPanel from "./components/WeatherPanel";
import FarmChat from "./components/FarmChat";

const NAV_ITEMS = [
  { id: "overview",  icon: "🌿", label: "Overview" },
  { id: "sensors",   icon: "📡", label: "Sensors" },
  { id: "analytics", icon: "📊", label: "Analytics" },
  { id: "ai",        icon: "🤖", label: "AI Advice" },
  { id: "alerts",    icon: "🚨", label: "Alerts" },
];

const PAGE_META = {
  overview:  { title: "Overview",           subtitle: "Farm health summary and digital twin map" },
  sensors:   { title: "Sensor Monitoring",  subtitle: "Live sensor readings and manual controls" },
  analytics: { title: "Analytics",          subtitle: "Trends and sensor history" },
  ai:        { title: "AI Recommendations", subtitle: "Smart farming advice based on live sensor data" },
  alerts:    { title: "Alert Centre",       subtitle: "Real-time alert log and notification history" },
};

export default function App() {
  const [activePage, setActivePage] = useState("overview");
  const [readings, setReadings] = useState(getInitialReadings());
  const [history, setHistory] = useState(() => {
    const h = {};
    SENSORS.forEach(s => { h[s.id] = []; });
    return h;
  });
  const [alerts, setAlerts] = useState([]);
  const [clock, setClock] = useState(new Date());
  const manualRef = useRef({});
  const intervalRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleOverride = (id, value) => {
    manualRef.current[id] = value;
    setReadings(prev => ({ ...prev, [id]: value }));
  };

  const handleToggle = (scenario) => {
    const target = scenario === "reset" ? SCENARIOS.normal : SCENARIOS[scenario];
    Object.entries(target).forEach(([id, value]) => {
      manualRef.current[id] = value;
    });
    setReadings(prev => ({ ...prev, ...target }));
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setReadings(prev => {
        const next = {};
        const newAlerts = [];
        SENSORS.forEach(sensor => {
          const manual = manualRef.current[sensor.id];
          const base = manual !== undefined ? manual : prev[sensor.id];
          const newVal = getNextReading(base, sensor);
          next[sensor.id] = newVal;
          manualRef.current[sensor.id] = undefined;
          const status = getStatus(newVal, sensor);
          const alert = generateAlert(newVal, sensor, status);
          if (alert) newAlerts.push(alert);
        });
        setHistory(prevH => {
          const updated = {};
          SENSORS.forEach(s => {
            const arr = [...(prevH[s.id] || []), { time: new Date().toLocaleTimeString(), value: next[s.id] }];
            updated[s.id] = arr.slice(-20);
          });
          return updated;
        });
        if (newAlerts.length > 0) {
          setAlerts(prev => [...newAlerts, ...prev].slice(0, 30));
        }
        return next;
      });
    }, 1500);
    return () => clearInterval(intervalRef.current);
  }, []);

  const dangerCount = alerts.filter(a => a.status === "danger").length;

  return (
    <div className="layout">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>🌿 AgriTwin</h1>
          <p>Digital Twin Dashboard</p>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === "alerts" && dangerCount > 0 && (
                <span style={{
                  marginLeft: "auto", background: "#ef4444",
                  color: "#fff", borderRadius: "99px",
                  fontSize: "0.65rem", padding: "1px 7px", fontWeight: 700
                }}>{dangerCount}</span>
              )}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="live-badge">
            <div className="live-dot" />
            LIVE
          </div>
          <div style={{ marginTop: "0.6rem", fontSize: "0.72rem", color: "#475569" }}>
            {clock.toLocaleTimeString()}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main">

        {/* Topbar */}
        <div className="topbar">
          <div>
            <div className="topbar-title">{PAGE_META[activePage].title}</div>
            <div className="topbar-subtitle">{PAGE_META[activePage].subtitle}</div>
          </div>
          <div className="topbar-right">
            <div className="clock">
              <div className="clock-date">
                {clock.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              </div>
              <div className="clock-time">Last updated: {clock.toLocaleTimeString()}</div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="canvas">

          {/* OVERVIEW PAGE */}
          {activePage === "overview" && (
            <>
              <WeatherPanel />
              <HealthScore score={getCropHealthScore(readings)} />
              <div className="grid-4">
                {SENSORS.map(sensor => (
                  <SensorCard
                    key={sensor.id}
                    sensor={sensor}
                    value={readings[sensor.id]}
                    status={getStatus(readings[sensor.id], sensor)}
                  />
                ))}
              </div>
              <GreenhouseMap readings={readings} />
            </>
          )}

          {/* SENSORS PAGE */}
          {activePage === "sensors" && (
            <>
              <ControlPanel
                sensors={SENSORS}
                readings={readings}
                onOverride={handleOverride}
                onToggle={handleToggle}
              />
              <div className="grid-4">
                {SENSORS.map(sensor => (
                  <SensorCard
                    key={sensor.id}
                    sensor={sensor}
                    value={readings[sensor.id]}
                    status={getStatus(readings[sensor.id], sensor)}
                  />
                ))}
              </div>
            </>
          )}

          {/* ANALYTICS PAGE */}
          {activePage === "analytics" && (
            <>
              <div className="grid-2">
                {SENSORS.map(sensor => (
                  <SensorChart key={sensor.id} sensor={sensor} history={history[sensor.id]} />
                ))}
              </div>
            </>
          )}

          {/* AI ADVICE PAGE */}
          {activePage === "ai" && (
            <>
              <AIAdvice readings={readings} />
              <FarmChat readings={readings} />
            </>
          )}

          {/* ALERTS PAGE */}
          {activePage === "alerts" && (
            <>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                <div className="card" style={{ flex: 1, minWidth: 140, textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", fontWeight: 700, color: "#ef4444" }}>
                    {alerts.filter(a => a.status === "danger").length}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>Danger Alerts</div>
                </div>
                <div className="card" style={{ flex: 1, minWidth: 140, textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", fontWeight: 700, color: "#f59e0b" }}>
                    {alerts.filter(a => a.status === "warning").length}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>Warnings</div>
                </div>
                <div className="card" style={{ flex: 1, minWidth: 140, textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", fontWeight: 700, color: "#4ade80" }}>
                    {alerts.length}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>Total Alerts</div>
                </div>
                <div className="card" style={{ flex: 1, minWidth: 140, textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", fontWeight: 700, color: "#60a5fa" }}>
                    {SENSORS.filter(s => getStatus(readings[s.id], s) === "normal").length}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>Sensors Normal</div>
                </div>
              </div>
              <AlertPanel alerts={alerts} />
            </>
          )}

        </div>
      </div>
    </div>
  );
}