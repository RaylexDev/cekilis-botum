import ms from "ms";

export function parseTime(str) {
  const result = ms(str);
  if (!result || isNaN(result)) return null;
  return result;
}

export function formatTime(ms) {
  if (ms < 0) return "0s";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}g ${h % 24}s ${m % 60}dk`;
  if (h > 0) return `${h}s ${m % 60}dk ${s % 60}sn`;
  if (m > 0) return `${m}dk ${s % 60}sn`;
  return `${s}sn`;
}

export function formatRelative(ms) {
  return `<t:${Math.floor(ms / 1000)}:R>`;
}

export function formatFull(ms) {
  return `<t:${Math.floor(ms / 1000)}:F>`;
}
