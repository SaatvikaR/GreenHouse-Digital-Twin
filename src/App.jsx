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

export default function App() {
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

  return (
    <div className="app">
      <div className="header">
        <div>
          <h1>AgriTwin</h1>
          <p>Real-time sensor monitoring · Smart alerts · AI recommendations</p>
        </div>
        <div className="header-right">
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 600 }}>
              {clock.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#475569" }}>
              Last updated: {clock.toLocaleTimeString()}
            </div>
          </div>
          <div className="live-badge">
            <div className="live-dot" />
            LIVE
          </div>
        </div>
      </div>

      <HealthScore score={getCropHealthScore(readings)} />

      <WeatherPanel />

      <ControlPanel
        sensors={SENSORS}
        readings={readings}
        onOverride={handleOverride}
        onToggle={handleToggle}
      />

      <GreenhouseMap readings={readings} />

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

      <div className="grid-2">
        {SENSORS.map(sensor => (
          <SensorChart key={sensor.id} sensor={sensor} history={history[sensor.id]} />
        ))}
      </div>

      <AIAdvice readings={readings} />

      <AlertPanel alerts={alerts} />
    </div>
  );
}
