export default function AlertPanel({ alerts }) {
  return (
    <div className="card" style={{ maxHeight: 320, overflowY: "auto" }}>
      <div className="card-title">🚨 Alert Log</div>
      {alerts.length === 0
        ? <div className="no-alerts">✅ All systems normal</div>
        : alerts.map(a => (
            <div key={a.id} className="alert-item">
              <div className={`alert-dot ${a.status}`} />
              <span>{a.message}</span>
              <span className="alert-time">{a.time}</span>
            </div>
          ))
      }
    </div>
  );
}