// Helper to get a relevant image for an exercise or meal name.
// Uses loremflickr (works without API key) with topic keywords.
// Falls back via onError to picsum.

export function exerciseImage(name: string, size = 80): string {
  const k = name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join(",");
  const tag = k || "fitness";
  return `https://loremflickr.com/${size}/${size}/fitness,${tag}?lock=${hash(name)}`;
}

export function mealImage(name: string, size = 80): string {
  const k = name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join(",");
  const tag = k || "meal";
  return `https://loremflickr.com/${size}/${size}/food,${tag}?lock=${hash(name)}`;
}

export function fallbackImage(seed: string, size = 80): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${size}/${size}`;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 10000;
}
