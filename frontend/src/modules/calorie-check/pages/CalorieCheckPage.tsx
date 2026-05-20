// ─────────────────────────────────────────────────────────────
// Calorie Check Page — AI Meal Analyzer
//
// Lets users get calorie and macro estimates for a meal using:
//   • File upload mode  — pick an image from disk
//   • Camera mode       — use the device camera to take a photo
//   • Text description  — describe the meal in words (no image)
//
// The image is converted to a base64 data URL and sent to the
// backend, which forwards it to a Groq vision AI model.
//
// Key state:
//   imageDataUrl — base64 data URL of the selected/captured image
//   imageName    — filename shown in the UI
//   mode         — "upload" | "camera"
//   cameraActive — true while the camera stream is running
//
// Camera flow:
//   startCamera  → getUserMedia → attach stream to <video>
//   capturePhoto → draw frame to <canvas> → toDataURL → imageDataUrl
//   stopCamera   → stop all media tracks
//
// Results are stored in the database and shown below the form,
// each card showing: meal name, confidence, kcal, protein,
// carbs, fat, notes, and individual item breakdown.
// ─────────────────────────────────────────────────────────────

import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  Flame,
  Loader2,
  Trash2,
  Upload,
  Utensils,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import BackButton from "../../../components/BackButton";
import EmptyState from "../../../components/ui/EmptyState";
import AiGeneratingState from "../../../components/ui/AiGeneratingState";
import ErrorState from "../../../components/ui/ErrorState";
import { getApiErrorMessage } from "../../../lib/errors";
import {
  analyzeMealPhoto,
  deleteCalorieAnalysis,
  getCalorieAnalyses,
} from "../apis/calorieApi";
import { calorieAnalyzeSchema } from "../schemas/calorieSchemas";

type InputMode = "upload" | "camera";

export default function CalorieCheckPage() {
  const queryClient = useQueryClient();

  // ── Form state ────────────────────────────────────────────
  const [description,  setDescription]  = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName,    setImageName]    = useState("");
  const [error,        setError]        = useState("");
  const [mode,         setMode]         = useState<InputMode>("upload");

  // ── Camera state & refs ───────────────────────────────────
  // videoRef   — the <video> element that shows the live camera feed
  // canvasRef  — an off-screen canvas used to capture a single frame
  // streamRef  — holds the MediaStream so we can stop all tracks later
  const videoRef     = useRef<HTMLVideoElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const streamRef    = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError,  setCameraError]  = useState("");

  // ── Data fetching ─────────────────────────────────────────
  const analyses = useQuery({
    queryKey: ["calorie-analyses"],
    queryFn:  getCalorieAnalyses,
  });

  // ── Mutations ─────────────────────────────────────────────

  // analyze — sends image + description to the AI and saves result
  const analyze = useMutation({
    mutationFn: analyzeMealPhoto,
    onSuccess: () => {
      setDescription("");
      setImageDataUrl("");
      setImageName("");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["calorie-analyses"] });
    },
    onError: (err: any) =>
      setError(getApiErrorMessage(err, "Failed to analyze meal. Try describing it in text if no image is uploaded.")),
  });

  // remove — deletes a saved calorie analysis
  const remove = useMutation({
    mutationFn: deleteCalorieAnalysis,
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ["calorie-analyses"] }),
    onError:    (err) =>
      setError(getApiErrorMessage(err, "Could not delete that calorie check. Please try again.")),
  });

  // ── Image preview label ───────────────────────────────────
  const previewName = useMemo(() => imageName || "Upload food photo", [imageName]);

  // ── File upload handler ───────────────────────────────────
  // Validates file type (PNG/JPG/WebP) and size (max 5.5 MB),
  // then converts the file to a base64 data URL for preview and submission.
  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setImageName(""); setImageDataUrl("");
      setError("Upload a PNG, JPG, or WebP image.");
      return;
    }
    if (file.size > 5_500_000) {
      setImageName(""); setImageDataUrl("");
      setError("Image must be under 5.5 MB.");
      return;
    }
    try {
      setImageName(file.name);
      setImageDataUrl(await fileToDataUrl(file));
    } catch {
      setImageName(""); setImageDataUrl("");
      setError("Could not read that image. Try another file.");
    }
  };

  // ── Camera controls ───────────────────────────────────────

  // startCamera — requests camera permission and begins the live preview.
  // facingMode: "environment" prefers the rear camera on mobile devices.
  const startCamera = useCallback(async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setCameraError("Could not access camera. Please allow camera permission and try again.");
    }
  }, []);

  // stopCamera — releases all camera tracks and hides the video element.
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  // capturePhoto — draws the current video frame to a canvas, scales it
  // down if larger than 1280px, and converts it to a JPEG data URL.
  const capturePhoto = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    if (!video.videoWidth || !video.videoHeight) {
      setCameraError("Camera is still warming up. Try again in a moment.");
      return;
    }
    const maxSize = 1280;
    const scale   = Math.min(1, maxSize / Math.max(video.videoWidth, video.videoHeight));
    canvas.width  = Math.round(video.videoWidth  * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setImageDataUrl(dataUrl);
    setImageName("camera-capture.jpg");
    setError("");
    stopCamera();
  }, [stopCamera]);

  // ── Helpers ───────────────────────────────────────────────

  const clearImage = () => { setImageDataUrl(""); setImageName(""); setError(""); };

  // switchMode — stops camera (if running), clears image, and changes mode
  const switchMode = (next: InputMode) => {
    if (cameraActive) stopCamera();
    clearImage();
    setMode(next);
    setCameraError("");
  };

  // ── Form submission ───────────────────────────────────────
  // Validates that either an image or a text description is provided,
  // then fires the analyze mutation.
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const parsed = calorieAnalyzeSchema.safeParse({
      imageDataUrl: imageDataUrl || undefined,
      imageName:    imageName    || undefined,
      description:  description  || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Check the meal details and try again.");
      return;
    }
    analyze.mutate(parsed.data);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <BackButton />
      <header>
        <p className="section-label mb-1">Smart Calories</p>
        <h1 className="text-3xl font-extrabold text-fg">AI Calorie Check</h1>
        <p className="text-muted text-sm mt-1">
          Upload a meal photo, take a photo with your camera, or describe the meal.
        </p>
      </header>

      {/* ── Mode toggle: Upload vs Camera ── */}
      <div className="flex gap-2">
        <button type="button" onClick={() => switchMode("upload")} className={`btn ${mode === "upload" ? "btn-primary" : "btn-ghost"}`}>
          <Upload className="h-4 w-4" /> Upload Photo
        </button>
        <button type="button" onClick={() => switchMode("camera")} className={`btn ${mode === "camera" ? "btn-primary" : "btn-ghost"}`}>
          <Camera className="h-4 w-4" /> Take Photo
        </button>
      </div>

      {/* ── Camera panel (shown only in camera mode) ── */}
      {mode === "camera" && (
        <div className="card space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-black min-h-64 flex items-center justify-center">
            {/* Live video preview — hidden when camera is off */}
            <video ref={videoRef} className={`w-full rounded-xl ${cameraActive ? "block" : "hidden"}`} playsInline muted />
            {/* Off-screen canvas used only for frame capture */}
            <canvas ref={canvasRef} className="hidden" />
            {!cameraActive && !imageDataUrl && (
              <div className="flex flex-col items-center gap-3 py-12 text-muted">
                <VideoOff className="h-10 w-10" />
                <span className="text-sm">Camera is off</span>
              </div>
            )}
            {/* Show the captured photo after capture */}
            {!cameraActive && imageDataUrl && (
              <img src={imageDataUrl} alt="Captured" className="w-full rounded-xl object-contain max-h-72" />
            )}
          </div>

          {cameraError && <p className="text-red-400 text-sm">{cameraError}</p>}

          {/* Camera controls: Start / Capture / Cancel / Retake */}
          <div className="flex gap-3">
            {!cameraActive ? (
              <>
                <button type="button" onClick={startCamera} className="btn-primary flex-1">
                  <Video className="h-4 w-4" /> Start Camera
                </button>
                {imageDataUrl && (
                  <button type="button" onClick={clearImage} className="btn-ghost">
                    <X className="h-4 w-4" /> Retake
                  </button>
                )}
              </>
            ) : (
              <>
                <button type="button" onClick={capturePhoto} className="btn-primary flex-1">
                  <Camera className="h-4 w-4" /> Capture Photo
                </button>
                <button type="button" onClick={stopCamera} className="btn-ghost">
                  <X className="h-4 w-4" /> Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Analyze form ── */}
      <form onSubmit={onSubmit} className="card grid lg:grid-cols-[240px_1fr] gap-5">

        {/* Image preview column */}
        {mode === "upload" ? (
          // Clickable label acts as the file picker trigger
          <label className="rounded-xl border border-dashed border-border bg-panel2 p-4 flex flex-col items-center justify-center text-center min-h-52 cursor-pointer hover:border-accent/70 transition relative">
            {imageDataUrl ? (
              <>
                <img src={imageDataUrl} alt={previewName} className="h-36 w-36 rounded-xl object-cover border border-border" />
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); clearImage(); }}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-panel border border-border flex items-center justify-center hover:border-red-400 hover:text-red-400 transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <div className="h-16 w-16 rounded-xl bg-panel border border-border flex items-center justify-center text-accent mb-3">
                <Upload className="h-7 w-7" />
              </div>
            )}
            <span className="mt-3 text-sm font-semibold">{previewName}</span>
            <span className="text-xs text-muted mt-1">PNG, JPG, or WebP · max 5.5 MB</span>
            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onFileChange} />
          </label>
        ) : (
          // Camera mode: show the captured image or a placeholder
          <div className="rounded-xl border border-dashed border-border bg-panel2 p-4 flex flex-col items-center justify-center text-center min-h-52">
            {imageDataUrl ? (
              <img src={imageDataUrl} alt="Captured" className="h-36 w-36 rounded-xl object-cover border border-border" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted">
                <Camera className="h-10 w-10" />
                <span className="text-sm">Use camera above to capture</span>
              </div>
            )}
          </div>
        )}

        {/* Meal description + submit */}
        <div className="space-y-4">
          <div>
            <label className="label">Meal notes (optional)</label>
            <textarea
              className="input min-h-32 resize-none"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Example: chicken rice with egg, no sauce"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {/* Disabled until at least an image or description is provided */}
          <button
            className="btn-primary w-full"
            disabled={analyze.isPending || (!imageDataUrl && !description.trim())}
          >
            {analyze.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Camera className="h-4 w-4" /> Analyze meal</>
            )}
          </button>
        </div>
      </form>

      {/* ── AI analyzing overlay ── */}
      {analyze.isPending && (
        <div className="card border-accent/25">
          <AiGeneratingState label="Analyzing your meal…" />
        </div>
      )}

      {/* ── Results list ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-fg">Recent calorie checks</h2>

        {analyses.isLoading && <div className="card h-32 animate-pulse" />}

        {analyses.isError && (
          <div className="card">
            <ErrorState
              message={getApiErrorMessage(analyses.error, "Could not load calorie checks.")}
              onRetry={() => void analyses.refetch()}
            />
          </div>
        )}

        {!analyses.isLoading && !analyses.isError && analyses.data?.length === 0 && (
          <div className="card">
            <EmptyState
              icon={Camera}
              title="No calorie checks yet"
              description="Upload a photo or describe your meal to get instant calorie and macro estimates."
            />
          </div>
        )}

        {/* Result cards — one per saved analysis */}
        <div className="grid md:grid-cols-2 gap-4">
          {!analyses.isError && analyses.data?.map((analysis) => (
            <article key={analysis.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-lg">{analysis.mealName}</h3>
                  <p className="text-xs text-muted mt-1">Confidence: {analysis.confidence}</p>
                </div>
                <button onClick={() => remove.mutate(analysis.id)} className="btn-ghost !p-2" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Macro metrics grid */}
              <div className="grid grid-cols-4 gap-2 my-4">
                <Metric label="kcal"    value={analysis.calories}      icon={Flame} />
                <Metric label="protein" value={analysis.protein ?? 0} />
                <Metric label="carbs"   value={analysis.carbs   ?? 0} />
                <Metric label="fat"     value={analysis.fat     ?? 0} />
              </div>

              <p className="text-sm text-muted">{analysis.notes}</p>

              {/* Per-item breakdown (if the AI identified individual items) */}
              {analysis.items.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {analysis.items.map((item, index) => (
                    <li
                      key={`${item.name}-${index}`}
                      className="flex justify-between gap-3 rounded-xl bg-panel2 border border-border px-3 py-2 text-sm"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-accent" /> {item.name}
                      </span>
                      <span className="text-muted">{item.calories} kcal</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── Metric ────────────────────────────────────────────────────
// Small centred tile showing one macro value (kcal, protein, etc.)
function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon?: typeof Flame;
}) {
  return (
    <div className="rounded-xl bg-panel2 border border-border p-3 text-center">
      <div className="flex justify-center text-accent mb-1">
        {Icon ? <Icon className="h-4 w-4" /> : null}
      </div>
      <div className="font-extrabold">{Math.round(value)}</div>
      <div className="text-[11px] text-muted">{label}</div>
    </div>
  );
}

// ── fileToDataUrl ─────────────────────────────────────────────
// Wraps the FileReader API in a Promise so it can be awaited.
// Reads the file as a base64 data URL suitable for <img src> or
// sending to the backend as a JSON string.
function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
