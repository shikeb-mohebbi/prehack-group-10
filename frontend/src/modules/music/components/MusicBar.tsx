// ─────────────────────────────────────────────────────────────
// MusicBar — compact now-playing widget
//
// Rendered inside the sidebar (desktop) and the mobile drawer.
// Uses the same localStorage-backed playlist as MusicPage.
// The `compact` prop is always true here but kept for flexibility.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ListMusic, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { getPlaylist } from "../apis/musicApi";

// ── EqBars ────────────────────────────────────────────────────
// Animated equaliser bars shown while a track is playing.
// When paused, three static short bars are displayed instead.
function EqBars({ playing }: { playing: boolean }) {
  if (!playing) {
    return (
      <div className="flex items-end gap-[2px] h-4">
        {[3, 6, 4].map((h, i) => (
          <span key={i} className="inline-block w-[3px] rounded-full bg-accent/40" style={{ height: h }} />
        ))}
      </div>
    );
  }
  return (
    <div className="flex items-end gap-[2px] h-4">
      <span className="eq-bar" style={{ height: 14, animationDelay: "0ms" }} />
      <span className="eq-bar" style={{ height: 10, animationDelay: "150ms" }} />
      <span className="eq-bar" style={{ height: 18, animationDelay: "300ms" }} />
    </div>
  );
}

// ── MusicBar ──────────────────────────────────────────────────
// Compact audio player bar embedded in the sidebar.
// Reads the playlist from localStorage via getPlaylist().
export default function MusicBar({ compact = false }: { compact?: boolean }) {
  // Load the playlist once on mount (defaults + any custom tracks).
  const [playlist] = useState(getPlaylist);
  const audioRef     = useRef<HTMLAudioElement>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing,    setPlaying]    = useState(false);
  const [volume,     setVolume]     = useState(0.35);

  // Current track object based on the active index.
  const track = playlist[trackIndex];

  // Sync volume changes to the audio element immediately.
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // When the user skips to a new track, restart playback if playing.
  useEffect(() => {
    if (!audioRef.current || !playing) return;
    audioRef.current.play().catch(() => setPlaying(false));
  }, [trackIndex, playing]);

  // ── toggle ─────────────────────────────────────────────────
  // Play or pause the current track.
  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try { await audio.play(); setPlaying(true); }
      catch { setPlaying(false); }
    }
  };

  // Advance to the next / previous track (wraps around).
  const next     = () => setTrackIndex((i) => (i + 1) % playlist.length);
  const previous = () => setTrackIndex((i) => (i - 1 + playlist.length) % playlist.length);

  // Nothing to show if the playlist is empty.
  if (!track) return null;

  return (
    <div className={`rounded-xl border transition-all ${
      playing
        ? "bg-accent/10 border-accent/30 shadow-glow-xs"
        : "bg-panel2 border-border"
    } p-3`}>
      {/* The hidden <audio> element that does the actual playback.
          onEnded advances to the next track automatically.
          onError fires when a local file is missing — stops playback gracefully. */}
      <audio
        ref={audioRef}
        src={track.src}
        preload="none"
        onEnded={next}
        onError={() => setPlaying(false)}
      />

      <div className="flex items-center gap-2">
        {/* Left side: animated EQ bars + track title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <EqBars playing={playing} />
          <div className="min-w-0">
            <div className="text-[10px] text-muted uppercase tracking-wider">Workout music</div>
            <div className="font-bold text-xs truncate text-fg">{track.title}</div>
          </div>
        </div>

        {/* Right side: prev / play-pause / next controls + link to full page */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={previous} className="h-6 w-6 rounded-lg flex items-center justify-center text-muted hover:text-fg transition" title="Prev">
            <SkipBack className="h-3 w-3" />
          </button>
          <button
            onClick={toggle}
            className={`h-7 w-7 rounded-lg flex items-center justify-center transition ${
              playing ? "bg-accent text-white shadow-glow-xs" : "bg-panel border border-border text-fg"
            }`}
            title={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </button>
          <button onClick={next} className="h-6 w-6 rounded-lg flex items-center justify-center text-muted hover:text-fg transition" title="Next">
            <SkipForward className="h-3 w-3" />
          </button>
          {/* Opens the full Music page */}
          <Link
            to="/music"
            title="Open playlist"
            className="h-6 w-6 rounded-lg flex items-center justify-center text-muted hover:text-accent transition ml-1"
          >
            <ListMusic className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Volume slider — uses the browser's accent-color defined in index.css */}
      <input
        aria-label="Volume"
        className="w-full mt-2.5"
        max={1} min={0} step={0.05}
        type="range"
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        style={{ height: 3 }}
      />
    </div>
  );
}
