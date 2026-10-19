"use client";

import { type KeyboardEvent, type PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import {
  type Crop,
  type Point,
  MAX_PHOTO_CHARS,
  MAX_THUMB_CHARS,
  MAX_ZOOM,
  MIN_ZOOM,
  PHOTO_QUALITY,
  PHOTO_SIZE,
  THUMB_QUALITY,
  THUMB_SIZE,
  clampCrop,
  fitWithin,
  isHeic,
  sourceRect,
  zoomAround,
} from "@/lib/game/photo";

export interface PhotoResult {
  photo: string;
  photoThumb: string;
}

const MAX_FILE_BYTES = 30 * 1024 * 1024;
const HEIC_MESSAGE =
  "Cette photo est au format HEIC (iPhone), que ce navigateur ne sait pas lire. Choisis-la depuis Safari, envoie-la en JPEG, ou règle Réglages › Appareil photo › Formats sur « Le plus compatible ».";

function decodeWithImg(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("illisible"));
    };
    img.src = url;
  });
}

/**
 * Décode le fichier dans le bon sens (orientation EXIF des photos de téléphone)
 * et le réduit pour l'édition. Lève une erreur au message lisible si impossible.
 */
export async function loadPhoto(file: File): Promise<HTMLCanvasElement> {
  if (file.size > MAX_FILE_BYTES) throw new Error("Cette image est trop lourde (30 Mo maximum).");
  if (file.type && !file.type.startsWith("image/")) throw new Error("Ce fichier n'est pas une image.");
  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // Anciens Safari : pas d'options pour createImageBitmap ; <img> applique déjà l'orientation.
    try {
      source = await decodeWithImg(file);
    } catch {
      throw new Error(isHeic(file) ? HEIC_MESSAGE : "Impossible de lire cette image. Essaie une photo JPEG ou PNG.");
    }
  }
  const width = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
  const height = source instanceof HTMLImageElement ? source.naturalHeight : source.height;
  if (!width || !height) throw new Error("Impossible de lire cette image.");
  const size = fitWithin({ width, height });
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Ton navigateur ne permet pas de modifier les images.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, size.width, size.height);
  if (!(source instanceof HTMLImageElement)) source.close();
  return canvas;
}

/** Exporte la zone recadrée en carré JPEG ; baisse la qualité si le fichier dépasse `maxChars`. */
function exportSquare(work: HTMLCanvasElement, frame: number, crop: Crop, size: number, quality: number, maxChars: number): string {
  const { sx, sy, size: side } = sourceRect(work, frame, crop);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#0f172a"; // fond des images transparentes
  ctx.fillRect(0, 0, size, size);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(work, sx, sy, side, side, 0, 0, size, size);
  let q = quality;
  let url = canvas.toDataURL("image/jpeg", q);
  while (url.length > maxChars && q > 0.3) {
    q -= 0.15;
    url = canvas.toDataURL("image/jpeg", q);
  }
  return url;
}

const START: Crop = { zoom: 1, offset: { x: 0, y: 0 } };

/** Modale de recadrage : aperçu rond, zoom (curseur, molette, pincement) et déplacement. */
export function PhotoEditor({ file, onCancel, onSave }: { file: File; onCancel: () => void; onSave: (result: PhotoResult) => void }) {
  const [work, setWork] = useState<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [crop, setCropState] = useState<Crop>(START);
  const [frame, setFrame] = useState(0);
  const cropRef = useRef<Crop>(START);
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Point>());
  // Fermeture au clic sur le fond seulement si le clic y a commencé (pas en fin de glissé).
  const downOnBackdrop = useRef(false);

  useEffect(() => {
    let alive = true;
    loadPhoto(file)
      .then((canvas) => alive && setWork(canvas))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [file]);

  const setCrop = useCallback(
    (next: Crop) => {
      if (!work || !frame) return;
      const clamped = clampCrop(work, frame, next);
      cropRef.current = clamped;
      setCropState(clamped);
    },
    [work, frame],
  );

  // Taille réelle du cadre (dépend de l'écran).
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setFrame(el.clientWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, [work]);

  useEffect(() => {
    if (work && frame) setCrop(cropRef.current);
  }, [work, frame, setCrop]);

  // Aperçu : même calcul que l'export.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !work || !frame) return;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    const px = Math.round(frame * dpr);
    if (canvas.width !== px) canvas.width = canvas.height = px;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { sx, sy, size } = sourceRect(work, frame, crop);
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, px, px);
    ctx.drawImage(work, sx, sy, size, size, 0, 0, px, px);
  }, [work, frame, crop]);

  // Échap pour fermer, page figée derrière la modale.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onCancel]);

  // Molette : écouteur non passif pour ne pas faire défiler la page.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || !work) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const focus = { x: e.clientX - rect.left - rect.width / 2, y: e.clientY - rect.top - rect.height / 2 };
      setCrop(zoomAround(work, frame, cropRef.current, cropRef.current.zoom * Math.exp(-e.deltaY / 300), focus));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [work, frame, setCrop]);

  const relative = (e: PointerEvent<HTMLDivElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left - rect.width / 2, y: e.clientY - rect.top - rect.height / 2 };
  };

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, relative(e));
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const map = pointers.current;
    const prev = map.get(e.pointerId);
    if (!prev || !work) return;
    const before = [...map.values()];
    map.set(e.pointerId, relative(e));
    const after = [...map.values()];
    const c = cropRef.current;
    if (after.length === 1) {
      const p = after[0];
      setCrop({ zoom: c.zoom, offset: { x: c.offset.x + p.x - prev.x, y: c.offset.y + p.y - prev.y } });
      return;
    }
    // Deux doigts : pincement (zoom) + déplacement du milieu.
    const [a0, b0] = before;
    const [a1, b1] = after;
    const d0 = Math.hypot(a0.x - b0.x, a0.y - b0.y) || 1;
    const d1 = Math.hypot(a1.x - b1.x, a1.y - b1.y) || 1;
    const m0 = { x: (a0.x + b0.x) / 2, y: (a0.y + b0.y) / 2 };
    const m1 = { x: (a1.x + b1.x) / 2, y: (a1.y + b1.y) / 2 };
    const zoomed = zoomAround(work, frame, c, c.zoom * (d1 / d0), m0);
    setCrop({ zoom: zoomed.zoom, offset: { x: zoomed.offset.x + m1.x - m0.x, y: zoomed.offset.y + m1.y - m0.y } });
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(e.pointerId);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const c = cropRef.current;
    const step = e.shiftKey ? 30 : 8;
    const moves: Record<string, Point> = { ArrowLeft: { x: step, y: 0 }, ArrowRight: { x: -step, y: 0 }, ArrowUp: { x: 0, y: step }, ArrowDown: { x: 0, y: -step } };
    if (moves[e.key]) setCrop({ zoom: c.zoom, offset: { x: c.offset.x + moves[e.key].x, y: c.offset.y + moves[e.key].y } });
    else if ((e.key === "+" || e.key === "=") && work) setCrop(zoomAround(work, frame, c, c.zoom * 1.15));
    else if (e.key === "-" && work) setCrop(zoomAround(work, frame, c, c.zoom / 1.15));
    else return;
    e.preventDefault();
  }

  function save() {
    if (!work || !frame) return;
    onSave({
      photo: exportSquare(work, frame, cropRef.current, PHOTO_SIZE, PHOTO_QUALITY, MAX_PHOTO_CHARS),
      photoThumb: exportSquare(work, frame, cropRef.current, THUMB_SIZE, THUMB_QUALITY, MAX_THUMB_CHARS),
    });
  }

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/80 backdrop-blur-sm sm:items-center sm:p-4"
      onPointerDown={(e) => (downOnBackdrop.current = e.target === e.currentTarget)}
      onClick={(e) => e.target === e.currentTarget && downOnBackdrop.current && onCancel()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-editor-title"
        tabIndex={-1}
        className="qb-pop w-full max-w-sm space-y-4 rounded-t-3xl border border-white/10 bg-slate-900 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] outline-none sm:rounded-3xl sm:pb-5"
      >
        <div className="flex items-center justify-between">
          <h2 id="photo-editor-title" className="text-lg font-black text-white">Ta photo de profil</h2>
          <button type="button" onClick={onCancel} aria-label="Fermer" className="grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:bg-white/5 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {error ? (
          <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-3 text-sm text-rose-200">{error}</p>
        ) : (
          <>
            <div
              ref={viewportRef}
              tabIndex={0}
              role="application"
              aria-label="Recadrage : fais glisser pour déplacer la photo, pince ou utilise le curseur pour zoomer (flèches et + / − au clavier)."
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={onKeyDown}
              className="relative mx-auto aspect-square w-[min(72vw,18rem)] cursor-grab touch-none overflow-hidden rounded-2xl bg-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-violet-400 active:cursor-grabbing"
            >
              {work ? (
                <canvas ref={canvasRef} className="h-full w-full" aria-hidden />
              ) : (
                <div className="h-full w-full animate-pulse bg-slate-800" />
              )}
              {/* Masque : seul le rond sera visible dans l'appli. */}
              <div className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_999px_rgba(2,6,23,0.65)] ring-2 ring-white/70" />
            </div>
            <Slider label="Zoom" value={crop.zoom} min={MIN_ZOOM} max={MAX_ZOOM} step={0.01} onChange={(z) => work && setCrop(zoomAround(work, frame, cropRef.current, z))} format={(v) => `×${v.toFixed(1).replace(".", ",")}`} />
            <p className="text-center text-xs text-slate-500">Fais glisser la photo pour la centrer.</p>
          </>
        )}

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onCancel}>Annuler</Button>
          {!error && (
            <Button className="flex-1" disabled={!work || !frame} onClick={save}>
              <Check size={18} /> Valider
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
