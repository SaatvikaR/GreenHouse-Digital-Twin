import { useState, useEffect } from "react";

const API_KEY = "5d00cc4c0875b0d1e012ad02b9831869";
const CITY = "Chennai";
const USE_FAKE = API_KEY === false;

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

  if (!weather) return (
    <div className="card" style={{ marginBottom: "1.5rem" }}>
      <div className="card-title">🌤️ Weather Forecast</div>
      <div style={{ color: "#475569", fontSize: "0.85rem" }}>Loading weather data...</div>
    </div>
  );

  const getEmoji = (icon) =>
    icon === "Rain" ? "🌧️" :
    icon === "Clouds" ? "☁️" :
    icon === "Thunderstorm" ? "⛈️" : "☀️";

  const advice =
    weather.icon === "Rain" ? "Skip irrigation today — rain expected" :
    weather.temp > 35 ? "High heat — activate cooling fans" :
    weather.humidity > 80 ? "High outdoor humidity — monitor ventilation" :
    "Conditions favorable for greenhouse operation";

  return (
    <div className="card" style={{ marginBottom: "1.5rem" }}>
      <div className="card-title">
        🌤️ Weather Forecast — {CITY}
        {USE_FAKE && (
          <span style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 400, marginLeft: 8 }}>
            (demo data — add API key for live weather)
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>

        {/* Current weather */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "2.8rem" }}>{getEmoji(weather.icon)}</span>
          <div>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#e2e8f0", lineHeight: 1 }}>
              {Math.round(weather.temp)}°C
            </div>
            <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>
              {weather.description} · Humidity {weather.humidity}%
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 60, background: "#1e293b" }} />

        {/* Forecast */}
        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          {forecast.map((f, i) => (
            <div key={i} style={{ textAlign: "center", minWidth: 55 }}>
              <div style={{ fontSize: "0.7rem", color: "#475569" }}>{f.time}</div>
              <div style={{ fontSize: "1.3rem" }}>{getEmoji(f.icon)}</div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>
                {f.temp}°C
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 60, background: "#1e293b" }} />

        {/* Advice */}
        <div style={{
          flex: 1, minWidth: 200,
          background: "#0f172a", border: "1px solid #1e293b",
          borderRadius: 10, padding: "0.7rem 1rem",
          fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.5
        }}>
          <span style={{ color: "#4ade80", fontWeight: 600 }}>💡 Farm advice: </span>
          {advice}
        </div>

      </div>
    </div>
  );
}