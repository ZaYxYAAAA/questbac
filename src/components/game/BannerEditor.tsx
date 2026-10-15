"use client";

import { type ChangeEvent, type PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ImagePlus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import {
  BANNER_H,
  BANNER_QUALITY,
  BANNER_THUMB_H,
  BANNER_THUMB_QUALITY,
  BANNER_THUMB_W,
  BANNER_W,
  MAX_BANNER_CHARS,
  MAX_BANNER_THUMB_CHARS,
  bannerSourceRect,
} from "@/lib/game/photo";
import { loadPhoto } from "./PhotoEditor";

export interface BannerResult {
  banner: string;
  bannerThumb: string;
}

function exportBanner(work: HTMLCanvasElement, pos: number, zoom: number, w: number, h: number, quality: number, maxChars: number): string {
  const { sx, sy, sw, sh } = bannerSourceRect(work, pos, zoom);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(work, sx, sy, sw, sh, 0, 0, w, h);
  let q = quality;
  let url = canvas.toDataURL("image/jpeg", q);
  while (url.length > maxChars && q > 0.25) {
    q -= 0.1;
    url = canvas.toDataURL("image/jpeg", q);
  }
  return url;
}

/** Bouton « Envoyer une image » puis recadrage 3:1 (position verticale + zoom). */
export function BannerUpload({ hasImage, onChange }: { hasImage: boolean; onChange: (r: BannerResult | null) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) setFile(f);
  };
  const close = useCallback(() => setFile(null), []);
  return (
    <div className="flex flex-wrap gap-2">
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={pick} aria-hidden tabIndex={-1} />
      <Button variant="secondary" onClick={() => input.current?.click()}>
        <ImagePlus size={17} /> {hasImage ? "Changer d'image" : "Envoyer mon image"}
      </Button>
      {hasImage && (
        <Button variant="ghost" onClick={() => onChange(null)}>
          <Trash2 size={17} /> Retirer
        </Button>
      )}
      {file && (
        <BannerEditor
          file={file}
          onCancel={close}
          onSave={(r) => {
            setFile(null);
            onChange(r);
          }}
        />
      )}
    </div>
  );
}

function BannerEditor({ file, onCancel, onSave }: { file: File; onCancel: () => void; onSave: (r: BannerResult) => void }) {
  const [work, setWork] = useState<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pos, setPos] = useState(0.5);
  const [zoom, setZoom] = useState(1);
  const preview = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ y: number; pos: number } | null>(null);

  useEffect(() => {
    let live = true;
    loadPhoto(file)
      .then((c) => live && setWork(c))
      .catch((e) => live && setError(e instanceof Error ? e.message : "Image illisible."));
    return () => {
      live = false;
    };
  }, [file]);

  useEffect(() => {
    const c = preview.current;
    if (!c || !work) return;
    const ctx = c.getContext("2d")!;
    const { sx, sy, sw, sh } = bannerSourceRect(work, pos, zoom);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(work, sx, sy, sw, sh, 0, 0, c.width, c.height);
  }, [work, pos, zoom]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  // Glisser vers le haut ou le bas pour cadrer.
  const down = (e: PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, pos };
  };
  const move = (e: PointerEvent) => {
    if (!drag.current || !work) return;
    const el = e.currentTarget as HTMLElement;
    const { sh } = bannerSourceRect(work, pos, zoom);
    const free = work.height - sh;
    if (free <= 0) return;
    const scale = sh / el.clientHeight;
    setPos(Math.min(1, Math.max(0, drag.current.pos - ((e.clientY - drag.current.y) * scale) / free)));
  };

  const save = () => {
    if (!work) return;
    onSave({
      banner: exportBanner(work, pos, zoom, BANNER_W, BANNER_H, BANNER_QUALITY, MAX_BANNER_CHARS),
      bannerThumb: exportBanner(work, pos, zoom, BANNER_THUMB_W, BANNER_THUMB_H, BANNER_THUMB_QUALITY, MAX_BANNER_THUMB_CHARS),
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center" role="dialog" aria-label="Recadrer la bannière">
      <div className="qb-backdrop absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="qb-sheet relative w-full max-w-lg space-y-4 rounded-t-3xl border border-white/10 bg-slate-950 p-4 shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <p className="font-black text-white">🖼️ Cadrer ma bannière</p>
          <button type="button" onClick={onCancel} aria-label="Annuler" className="qb-press grid h-9 w-9 place-items-center rounded-full bg-white/10 text-slate-200">
            <X size={18} />
          </button>
        </div>
        {error ? (
          <p className="rounded-xl bg-rose-500/15 p-3 text-sm text-rose-300">{error}</p>
        ) : (
          <>
            <div
              className="relative aspect-[3/1] w-full cursor-grab touch-none overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-white/15 active:cursor-grabbing"
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={() => (drag.current = null)}
              onPointerCancel={() => (drag.current = null)}
            >
              <canvas ref={preview} width={BANNER_W} height={BANNER_H} className="h-full w-full" />
              {!work && <div className="absolute inset-0 animate-pulse bg-slate-800" />}
              <span className="pointer-events-none absolute bottom-2 left-3 rounded-full bg-slate-950/60 px-2 py-0.5 text-[11px] text-white/80">Glisse pour cadrer</span>
            </div>
            <Slider label="Position" value={pos} onChange={setPos} min={0} max={1} step={0.01} format={(v) => `${Math.round(v * 100)} %`} />
            <Slider label="Zoom" value={zoom} onChange={setZoom} min={1} max={3} step={0.05} format={(v) => `×${v.toFixed(2).replace(".", ",")}`} />
          </>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>Annuler</Button>
          <Button onClick={save} disabled={!work}>Utiliser cette bannière</Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
