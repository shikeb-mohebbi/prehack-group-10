// ─────────────────────────────────────────────────────────────
// Music Page — full workout playlist manager
//
// Features:
//  • Plays local MP3 files from public/music/ (default tracks)
//  • Users can upload their own MP3 files — these are available
//    for the current browser session only (blob URLs are temporary)
//  • Volume control and prev/next navigation
//  • Animated equaliser bars while playing
// ─────────────────────────────────────────────────────────────

import type { ChangeEvent, FormEvent } from "react";
import { useRef, useState, useEffect } from "react";
import {
  Music2,
  Pause,
  Play,
  Plus,
  SkipBack,
  SkipForward,
  Trash2,
  Volume2,
  FolderOpen,
} from "lucide-react";
import BackButton from "../../../components/BackButton";
import { addTrack, getPlaylist, removeTrack } from "../apis/musicApi";
import type { Track } from "../types/musicTypes";

// ── EqBars ────────────────────────────────────────────────────
// Small animated bars shown next to the active track row.
function EqBars({ playing }: { playing: boolean }) {
  if (!playing) return null;
  return (
    <div className="flex items-end gap-[2px] h-5">
      <span className="eq-bar" style={{ height: 14, animationDelay: "0ms" }} />
      <span className="eq-bar" style={{ height: 10, animationDelay: "150ms" }} />
      <span className="eq-bar" style={{ height: 18, animationDelay: "300ms" }} />
      <span className="eq-bar" style={{ height: 8,  animationDelay: "450ms" }} />
    </div>
  );
}

// ── MusicPage ─────────────────────────────────────────────────
export default function MusicPage() {
  // ── State ──────────────────────────────────────────────────
  // Playlist loaded from localStorage + default tracks.
  const [playlist,     setPlaylist]     = useState<Track[]>(getPlaylist);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing,      setPlaying]      = useState(false);
  const [volume,       setVolume]       = useState(0.35);
  const audioRef = useRef<HTMLAudioElement>(null);

  // "Add song" form fields.
  const [title,        setTitle]        = useState("");
  const [bpm,          setBpm]          = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formError,    setFormError]    = useState("");

  // The currently active track object (undefined if playlist is empty).
  const track = playlist[currentIndex] as Track | undefined;

  // ── Effects ────────────────────────────────────────────────

  // Keep the audio element volume in sync with the slider.
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Reload the audio source and resume playback when the track index changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    if (playing) audio.play().catch(() => setPlaying(false));
  }, [currentIndex]);

  // Respond to play/pause state changes (e.g. pressing the main button).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [playing]);

  // ── Playback helpers ───────────────────────────────────────

  // Toggle play / pause on the current track.
  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else {
      try { await audio.play(); setPlaying(true); }
      catch { setPlaying(false); }
    }
  };

  // Jump to next / previous track and begin playing.
  const next     = () => { setCurrentIndex((i) => (i + 1) % playlist.length); setPlaying(true); };
  const previous = () => { setCurrentIndex((i) => (i - 1 + playlist.length) % playlist.length); setPlaying(true); };

  // Click a row in the playlist to start that track.
  const playTrack = (index: number) => {
    setCurrentIndex(index);
    setPlaying(true);
  };

  // ── Playlist management ────────────────────────────────────

  // Remove a custom track and clamp the current index so it stays in bounds.
  const handleRemove = (id: string) => {
    const updated = removeTrack(id);
    setPlaylist(updated);
    setCurrentIndex((i) => Math.min(i, updated.length - 1));
  };

  // Called when the user picks a file from the file input.
  // Creates a temporary blob URL for playback this session,
  // and auto-fills the title from the filename if left blank.
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file && !title.trim()) {
      // Strip the file extension to use as a default title.
      setTitle(file.name.replace(/\.[^.]+$/, ""));
    }
  };

  // "Add to playlist" form submission.
  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!selectedFile) {
      setFormError("Please choose an MP3 file first.");
      return;
    }

    // createObjectURL gives a temporary URL the <audio> element can play.
    // It is only valid for this browser session — not persisted to localStorage.
    const blobUrl = URL.createObjectURL(selectedFile);
    const trackTitle = title.trim() || selectedFile.name.replace(/\.[^.]+$/, "");
    const updated = addTrack(trackTitle, blobUrl, bpm ? Number(bpm) : undefined);

    setPlaylist(updated);
    // Reset form after successful add.
    setTitle("");
    setBpm("");
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <BackButton />

      {/* ── Page header ── */}
      <header>
        <p className="section-label mb-1">Focus Mode</p>
        <h1 className="text-3xl font-extrabold text-fg">Workout Playlist</h1>
        <p className="text-muted text-sm mt-1">
          Add your own MP3 files and keep your training locked in.
        </p>
      </header>

      {/* ── Player card (only shown when a track is loaded) ── */}
      {track && (
        <div className="relative rounded-2xl bg-grad-primary overflow-hidden shadow-glow p-6 text-white">
          {/* Subtle radial highlight in the top-right corner */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15)_0%,transparent_60%)] pointer-events-none" />

          {/* The hidden <audio> element — onError fires when a local file is missing */}
          <audio
            ref={audioRef}
            src={track.src}
            loop={false}
            preload="none"
            onEnded={next}
            onError={() => setPlaying(false)}
          />

          <div className="relative z-10">
            {/* Track info + animated equaliser bars */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest opacity-75 mb-1">
                  {playing ? "Now playing" : "Paused"}
                </div>
                <div className="text-xl font-extrabold truncate">{track.title}</div>
                {track.bpm && (
                  <div className="text-sm opacity-75 mt-0.5">{track.bpm} BPM</div>
                )}
              </div>
              {/* Animated bars when playing, static bars when paused */}
              <div className="flex items-end gap-[3px] h-8 shrink-0">
                {playing ? (
                  <>
                    <span className="eq-bar !bg-white/80" style={{ height: 16, animationDelay: "0ms" }} />
                    <span className="eq-bar !bg-white/80" style={{ height: 12, animationDelay: "150ms" }} />
                    <span className="eq-bar !bg-white/80" style={{ height: 20, animationDelay: "300ms" }} />
                    <span className="eq-bar !bg-white/80" style={{ height: 10, animationDelay: "450ms" }} />
                  </>
                ) : (
                  <>
                    {[14, 8, 18, 10].map((h, i) => (
                      <span key={i} className="inline-block w-[3px] rounded-full bg-white/30" style={{ height: h }} />
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Playback controls: previous / play-pause / next */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <button onClick={previous} className="h-11 w-11 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition active:scale-95" title="Previous">
                <SkipBack className="h-5 w-5" />
              </button>
              <button
                onClick={toggle}
                className="h-14 w-14 rounded-2xl bg-white/25 flex items-center justify-center hover:bg-white/35 transition active:scale-95 shadow-inner"
                title="Play/Pause"
              >
                {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
              </button>
              <button onClick={next} className="h-11 w-11 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition active:scale-95" title="Next">
                <SkipForward className="h-5 w-5" />
              </button>
            </div>

            {/* Volume slider */}
            <label className="flex items-center gap-3 opacity-80">
              <Volume2 className="h-4 w-4 shrink-0" />
              <input
                type="range" min={0} max={1} step={0.05} value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full" aria-label="Volume"
              />
            </label>
          </div>
        </div>
      )}

      {/* ── Playlist ── */}
      <div className="card">
        <h2 className="font-bold text-fg mb-4 flex items-center gap-2">
          <Music2 className="h-5 w-5 text-accent" />
          Playlist
          <span className="chip-accent ml-1">{playlist.length} tracks</span>
        </h2>

        {/* Each row shows the track title, BPM, and a remove button for custom tracks */}
        <ul className="space-y-2">
          {playlist.map((t, i) => {
            const active = i === currentIndex;
            return (
              <li
                key={t.id}
                onClick={() => playTrack(i)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${
                  active
                    ? "bg-accent/10 border-accent/40"
                    : "bg-panel2 border-border hover:border-accent/30 hover:bg-panel"
                }`}
              >
                {/* Play / Pause icon for this row */}
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  active ? "bg-grad-primary text-white shadow-glow-xs" : "bg-panel border border-border text-muted"
                }`}>
                  {active && playing
                    ? <Pause className="h-4 w-4" />
                    : <Play className={`h-4 w-4 ${active ? "" : "ml-0.5"}`} />}
                </div>

                {/* Track title and BPM */}
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm truncate ${active ? "text-accent" : "text-fg"}`}>{t.title}</div>
                  {t.bpm && <div className="text-xs text-muted">{t.bpm} BPM</div>}
                </div>

                {/* Equaliser animation on the active playing row */}
                {active && playing && <EqBars playing={playing} />}

                {/* "custom" badge and delete button — only for user-added tracks */}
                {t.custom && <span className="chip text-[10px] shrink-0">custom</span>}
                {t.custom && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(t.id); }}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-muted hover:text-red-400 hover:bg-red-400/10 transition shrink-0"
                    title="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Add local MP3 form ── */}
      <div className="card">
        <h2 className="font-bold text-fg mb-3 flex items-center gap-2">
          <Plus className="h-5 w-5 text-accent" /> Add Local MP3
        </h2>

        {/* Info banner explaining how default tracks and custom tracks work */}
        <div className="mb-4 rounded-xl bg-panel2 border border-border px-4 py-3 text-xs text-muted space-y-1">
          <p>
            <span className="text-fg font-semibold">Default tracks</span> — place MP3 files in{" "}
            <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded">frontend/public/music/</code>{" "}
            using the exact filenames shown in the playlist above.
          </p>
          <p>
            <span className="text-fg font-semibold">Custom tracks</span> — uploaded files play for this
            session only. After a page refresh you will need to re-upload them.
          </p>
        </div>

        <form onSubmit={handleAdd} className="grid sm:grid-cols-[1fr_90px] gap-3">
          {/* Optional custom title — auto-filled from filename if left blank */}
          <div>
            <label className="label">Song title (optional)</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Auto-detected from filename"
            />
          </div>

          {/* BPM field — optional metadata displayed in the playlist row */}
          <div>
            <label className="label">BPM</label>
            <input
              className="input"
              type="number"
              min={60}
              max={220}
              value={bpm}
              onChange={(e) => setBpm(e.target.value)}
              placeholder="128"
            />
          </div>

          {/* File picker — accepts MP3 files only */}
          <div className="sm:col-span-2">
            <label className="label">MP3 File</label>
            <label className="flex items-center gap-3 input cursor-pointer hover:border-accent/60 transition">
              <FolderOpen className="h-4 w-4 text-accent shrink-0" />
              <span className="text-muted text-sm truncate flex-1">
                {selectedFile ? selectedFile.name : "Click to choose an MP3 file…"}
              </span>
              <input
                type="file"
                accept="audio/mpeg,audio/mp3,.mp3"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {/* Validation error shown below the file picker */}
          {formError && (
            <p className="sm:col-span-2 text-red-400 text-sm">{formError}</p>
          )}

          {/* Submit — disabled until a file is selected */}
          <button
            type="submit"
            className="btn-primary sm:col-span-2"
            disabled={!selectedFile}
          >
            <Plus className="h-4 w-4" /> Add to playlist
          </button>
        </form>
      </div>
    </div>
  );
}
