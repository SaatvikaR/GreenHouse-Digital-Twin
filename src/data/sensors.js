export const SENSORS = [
  { id: "temp",     label: "Temperature",  unit: "°C",  min: 15, max: 45, ideal: [20, 30], icon: "thermometer" },
  { id: "humidity", label: "Humidity",     unit: "%",   min: 20, max: 90, ideal: [50, 70], icon: "droplets" },
  { id: "soil",     label: "Soil Moisture",unit: "%",   min: 10, max: 80, ideal: [40, 60], icon: "sprout" },
  { id: "light",    label: "Light Level",  unit: "lux", min: 100,max: 1000,ideal: [400,800],icon: "sun" },
];

export function getInitialReadings() {
  const readings = {};
  SENSORS.forEach(s => {
    readings[s.id] = parseFloat(
      (s.min + (s.max - s.min) * 0.5).toFixed(1)
    );
  });
  return readings;
}

export function getNextReading(current, sensor) {
  const change = (Math.random() - 0.48) * (sensor.max - sensor.min) * 0.04;
  let next = current + change;
  next = Math.max(sensor.min, Math.min(sensor.max, next));
  return parseFloat(next.toFixed(1));
}

export function getStatus(value, sensor) {
  const [low, high] = sensor.ideal;
  if (value < low - 5 || value > high + 5) return "danger";
  if (value < low || value > high) return "warning";
  return "normal";
}

export function generateAlert(value, sensor, status) {
  if (status === "normal") return null;

  if (status === "danger") {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  }

  const direction = value < sensor.ideal[0] ? "too low" : "too high";
  return {
    id: Date.now(),
    sensor: sensor.label,
    message: `${sensor.label} is ${direction}: ${value}${sensor.unit}`,
    status,
    time: new Date().toLocaleTimeString(),
  };
}
export const SCENARIOS = {
  heatwave: { temp: 42, humidity: 22, soil: 15, light: 950 },
  drought:  { temp: 38, humidity: 28, soil: 12, light: 870 },
  normal:   { temp: 25, humidity: 60, soil: 50, light: 600 },
};
export function getCropHealthScore(readings) {
  let total = 0;
  SENSORS.forEach(sensor => {
    const value = readings[sensor.id];
    const [low, high] = sensor.ideal;
    const range = high - low;
    if (value >= low && value <= high) {
      total += 100;
    } else if (value < low) {
      const drop = Math.min(low - value, range);
      total += Math.max(0, 100 - (drop / range) * 100);
    } else {
      const rise = Math.min(value - high, range);
      total += Math.max(0, 100 - (rise / range) * 100);
    }
  });
  return Math.round(total / SENSORS.length);
}