// ─────────────────────────────────────────────────────────────
// Music Types & Default Playlist
//
// Tracks are loaded from the local /public/music/ folder.
// To hear the default tracks, place MP3 files with these exact
// filenames inside  frontend/public/music/
//   warmup-pulse.mp3 · strength-focus.mp3 · cooldown-flow.mp3
//   power-drive.mp3  · endurance-run.mp3
//
// Custom tracks added from the Music page use a temporary
// browser blob URL and are available until the page refreshes.
// ─────────────────────────────────────────────────────────────

// Shape of a single playlist track.
export interface Track {
  id: string;
  title: string;
  bpm?: number;
  src: string;       // local path (/music/file.mp3) or session blob URL
  custom?: boolean;  // true = added by the user at runtime
}

// Five default workout tracks pointing to local public/music/ files.
// Replace the MP3 files on disk to change what plays.
export const DEFAULT_TRACKS: Track[] = [
  {
    id: "default-1",
    title: "Warmup Pulse",
    bpm: 116,
    src: "/music/warmup-pulse.mp3",
  },
  {
    id: "default-2",
    title: "Strength Focus",
    bpm: 128,
    src: "/music/strength-focus.mp3",
  },
  {
    id: "default-3",
    title: "Cooldown Flow",
    bpm: 96,
    src: "/music/cooldown-flow.mp3",
  },
  {
    id: "default-4",
    title: "Power Drive",
    bpm: 140,
    src: "/music/power-drive.mp3",
  },
  {
    id: "default-5",
    title: "Endurance Run",
    bpm: 132,
    src: "/music/endurance-run.mp3",
  },
];

// localStorage key used to persist the user's custom track list.
export const STORAGE_KEY = "fitai-playlist";
