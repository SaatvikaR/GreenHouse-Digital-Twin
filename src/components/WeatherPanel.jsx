import { useState, useEffect } from "react";

const API_KEY = "5d00cc4c0875b0d1e012ad02b9831869";
const CITY = "Chennai";
const USE_FAKE = false;

const FAKE_WEATHER = {
  temp: 32,
  humidity: 68,
  description: "partly cloudy",
  icon: "Clouds",
};

const FAKE_FORECAST = [
  { time: "12:00 PM", temp: 33, icon: "Clouds" },
  { time: "03:00 PM", temp: 35, icon: "Clear" },
  { time: "06:00 PM", temp: 31, icon: "Rain" },
  { time: "09:00 PM", temp: 28, icon: "Clouds" },
];

export default function WeatherPanel() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    if (USE_FAKE) {
      setWeather(FAKE_WEATHER);
      setForecast(FAKE_FORECAST);
      return;
    }

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`)
      .then(r => r.json())
      .then(d => {
        if (d.main) {
          setWeather({
            temp: d.main.temp,
            humidity: d.main.humidity,
            description: d.weather?.[0]?.description || "",
            icon: d.weather?.[0]?.main || "Clear",
          });
        }
      })
      .catch(() => {
        setWeather(FAKE_WEATHER);
        setForecast(FAKE_FORECAST);
      });

    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&appid=${API_KEY}&units=metric&cnt=4`)
      .then(r => r.json())
      .then(d => {
        if (d.list) {
          setForecast(d.list.map(f => ({
            time: new Date(f.dt * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            temp: Math.round(f.main.temp),
            icon: f.weather?.[0]?.main || "Clear",
          })));
        }
      })
      .catch(() => setForecast(FAKE_FORECAST));
  }, []);

  if (!weather) return null;

  const getEmoji = (icon) =>
    icon === "Rain" ? "🌧️" :
    icon === "Clouds" ? "☁️" :
    icon === "Thunderstorm" ? "⛈️" : "☀️";

  const advice =
    weather.icon === "Rain" ? "Skip irrigation — rain expected" :
    weather.temp > 35 ? "High heat — activate cooling fans" :
    weather.humidity > 80 ? "High humidity — monitor ventilation" :
    "Conditions favorable for greenhouse operation";

  const adviceColor =
    weather.icon === "Rain" ? "#60a5fa" :
    weather.temp > 35 ? "#ef4444" :
    weather.humidity > 80 ? "#f59e0b" :
    "#4ade80";

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "14px",
      padding: "0.8rem 1.2rem",
      marginBottom: "1.5rem",
      flexWrap: "wrap",
    }}>

      {/* Current weather icon + temp */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ fontSize: "1.8rem" }}>{getEmoji(weather.icon)}</span>
        <div>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#e2e8f0", lineHeight: 1 }}>
            {Math.round(weather.temp)}°C
          </div>
          <div style={{ fontSize: "0.68rem", color: "#64748b" }}>{CITY}</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.08)" }} />

      {/* Humidity */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "1rem" }}>💧</div>
        <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>{weather.humidity}%</div>
        <div style={{ fontSize: "0.65rem", color: "#475569" }}>Humidity</div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.08)" }} />

      {/* Forecast icons */}
      <div style={{ display: "flex", gap: "0.7rem" }}>
        {forecast.map((f, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.65rem", color: "#475569" }}>{f.time}</div>
            <div style={{ fontSize: "1rem" }}>{getEmoji(f.icon)}</div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600 }}>{f.temp}°C</div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.08)" }} />

      {/* Farm advice */}
      <div style={{
        flex: 1, minWidth: 160,
        fontSize: "0.78rem",
        color: adviceColor,
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: "0.4rem"
      }}>
        <span>💡</span>
        <span>{advice}</span>
      </div>

    </div>
  );
}