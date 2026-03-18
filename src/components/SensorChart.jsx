import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function SensorChart({ sensor, history }) {
  const [low, high] = sensor.ideal;

  return (
    <div className="card">
      <div className="card-title">📈 {sensor.label} — last 20 readings</div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={history}>
          <defs>
            <linearGradient id={`grad-${sensor.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#4ade80" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <YAxis domain={[sensor.min, sensor.max]} hide />
          <Tooltip
            contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#94a3b8" }}
          />
          <ReferenceLine y={low}  stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1} />
          <ReferenceLine y={high} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#4ade80"
            strokeWidth={2}
            fill={`url(#grad-${sensor.id})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ fontSize: "0.72rem", color: "#475569", marginTop: "0.3rem" }}>
        Ideal range: {low}–{high}{sensor.unit}
      </div>
    </div>
  );
}