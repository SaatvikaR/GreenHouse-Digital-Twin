import { useState, useRef, useEffect } from "react";
import { SENSORS, getStatus } from "../data/sensors";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export default function FarmChat({ readings }) {
  const [messages, setMessages] = useState([
    {
      role: "model",
      content: "Hello! I'm your AgriTwin AI assistant 🌿 I can see your live sensor data and help you make smart farming decisions. Ask me anything about your crops, irrigation, or current conditions!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getSensorContext = () => {
    return SENSORS.map(sensor => {
      const value = readings[sensor.id];
      const status = getStatus(value, sensor);
      return `${sensor.label}: ${value}${sensor.unit} (${status})`;
    }).join(", ");
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const systemPrompt = `You are AgriTwin AI, a smart farming assistant embedded in a Digital Twin dashboard for precision irrigation and crop monitoring.

Current live sensor readings from the farm:
${getSensorContext()}

Your role:
- Answer farming questions clearly and practically
- Reference the current sensor data when relevant
- Give specific actionable advice
- Keep responses concise and farmer-friendly
- Focus on irrigation, crop health, temperature management, and soil care
- If conditions are dangerous, highlight urgency`;

      const history = updatedMessages.slice(0, -1).map(m => ({
        role: m.role === "assistant" ? "model" : m.role,
        parts: [{ text: m.content }],
      }));

      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            ...history,
            { role: "user", parts: [{ text: input.trim() }] },
          ],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
          },
        }),
      });

      const data = await response.json();
      console.log("Gemini response:", data);

      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I could not process that. Please try again.";

      setMessages(prev => [...prev, { role: "model", content: reply }]);
    } catch (err) {
      console.error("Gemini error:", err);
      setMessages(prev => [
        ...prev,
        {
          role: "model",
          content: "Sorry, I'm having trouble connecting right now. Please try again.",
        },
      ]);
    }

    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const QUICK_QUESTIONS = [
    "Should I irrigate now?",
    "Is temperature safe for crops?",
    "What's causing low soil moisture?",
    "How can I improve humidity?",
  ];

  return (
    <div className="card" style={{ marginBottom: "1.5rem" }}>
      <div className="card-title">
        💬 Farm AI Assistant
        <span style={{ fontSize: "0.72rem", color: "#475569", fontWeight: 400, marginLeft: 8 }}>
          powered by Gemini AI · knows your live sensor data
        </span>
      </div>

      {/* Quick questions */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        {QUICK_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => setInput(q)}
            style={{
              background: "rgba(74, 222, 128, 0.08)",
              border: "1px solid rgba(74, 222, 128, 0.2)",
              borderRadius: "99px",
              padding: "4px 12px",
              fontSize: "0.75rem",
              color: "#4ade80",
              cursor: "pointer",
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div style={{
        height: 340,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "0.8rem",
        marginBottom: "1rem",
        padding: "0.5rem 0",
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
          }}>
            {msg.role === "model" && (
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "rgba(74, 222, 128, 0.15)",
                border: "1px solid rgba(74, 222, 128, 0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.8rem", marginRight: "0.5rem", flexShrink: 0, marginTop: 2,
              }}>🤖</div>
            )}
            <div style={{
              maxWidth: "75%",
              padding: "0.6rem 1rem",
              borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: msg.role === "user"
                ? "rgba(74, 222, 128, 0.15)"
                : "rgba(255, 255, 255, 0.05)",
              border: msg.role === "user"
                ? "1px solid rgba(74, 222, 128, 0.25)"
                : "1px solid rgba(255, 255, 255, 0.08)",
              fontSize: "0.83rem",
              color: "#cbd5e1",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}>
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "rgba(74, 222, 128, 0.15)",
                border: "1px solid rgba(74, 222, 128, 0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.8rem", marginLeft: "0.5rem", flexShrink: 0, marginTop: 2,
              }}>👤</div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "rgba(74, 222, 128, 0.15)",
              border: "1px solid rgba(74, 222, 128, 0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.8rem",
            }}>🤖</div>
            <div style={{
              padding: "0.6rem 1rem",
              borderRadius: "14px 14px 14px 4px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: "0.83rem", color: "#475569",
            }}>
              Analysing your farm data...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: "0.6rem" }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask anything about your farm..."
          disabled={loading}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            padding: "0.7rem 1rem",
            fontSize: "0.85rem",
            color: "#e2e8f0",
            outline: "none",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? "rgba(74,222,128,0.1)" : "rgba(74,222,128,0.2)",
            border: "1px solid rgba(74,222,128,0.3)",
            borderRadius: "10px",
            padding: "0.7rem 1.2rem",
            fontSize: "0.85rem",
            color: "#4ade80",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "..." : "Send →"}
        </button>
      </div>
    </div>
  );
}