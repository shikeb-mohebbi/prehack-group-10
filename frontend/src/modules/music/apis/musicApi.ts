// ─────────────────────────────────────────────────────────────
// Music API (client-side only — no backend involved)
//
// The playlist lives entirely in the browser:
//   • Default tracks are defined in musicTypes.ts and reference
//     local files in public/music/.
//   • Custom tracks are stored in localStorage (STORAGE_KEY).
//   • Blob URLs created from uploaded files are session-only;
//     they are NOT persisted and will stop working after a refresh.
// ─────────────────────────────────────────────────────────────

import { DEFAULT_TRACKS, STORAGE_KEY, type Track } from "../types/musicTypes";

// ── loadPlaylist (private) ────────────────────────────────────
// Reads custom tracks from localStorage and merges them with the
// default tracks. Defaults always come first; custom tracks follow.
function loadPlaylist(): Track[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_TRACKS];

    const custom: Track[] = JSON.parse(raw);
    // Remove any default track that the user may have overridden.
    const customIds = new Set(custom.map((t) => t.id));
    const defaults = DEFAULT_TRACKS.filter((t) => !customIds.has(t.id));
    // Only keep tracks flagged as custom (safety check).
    return [...defaults, ...custom.filter((t) => t.custom)];
  } catch {
    // If localStorage is corrupted, fall back to defaults silently.
    return [...DEFAULT_TRACKS];
  }
}

// ── saveCustomTracks (private) ────────────────────────────────
// Persists only the user-added (custom) tracks to localStorage.
// Default tracks are never stored — they come from musicTypes.ts.
function saveCustomTracks(all: Track[]) {
  const custom = all.filter((t) => t.custom);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
}

// ── getPlaylist ───────────────────────────────────────────────
// Returns the full current playlist (defaults + custom tracks).
export function getPlaylist(): Track[] {
  return loadPlaylist();
}

// ── addTrack ──────────────────────────────────────────────────
// Adds a new custom track (with a blob URL from a local file upload)
// to the end of the playlist and saves it to localStorage.
// NOTE: blob URLs are session-only — the track entry survives a
// refresh but the audio will not play until the file is re-uploaded.
export function addTrack(title: string, src: string, bpm?: number): Track[] {
  const current = loadPlaylist();
  const newTrack: Track = {
    id: `custom-${Date.now()}`,
    title: title.trim(),
    src: src.trim(),
    bpm: bpm || undefined,
    custom: true,
  };
  const updated = [...current, newTrack];
  saveCustomTracks(updated);
  return updated;
}

// ── removeTrack ───────────────────────────────────────────────
// Removes a track by id and persists the updated custom list.
// Default tracks cannot be permanently removed this way because
// they are rebuilt from DEFAULT_TRACKS on every load.
export function removeTrack(id: string): Track[] {
  const current = loadPlaylist();
  const updated = current.filter((t) => t.id !== id);
  saveCustomTracks(updated);
  return updated;
}
