/**
 * Photos de profil : limites, validation et calcul du recadrage (fonctions pures,
 * partagées entre l'éditeur, la sauvegarde et le serveur).
 */

/** Photo du profil : carré 256 × 256 en JPEG. */
export const PHOTO_SIZE = 256;
/** Miniature publique (classement) : carré 64 × 64. */
export const THUMB_SIZE = 64;
export const PHOTO_QUALITY = 0.8;
export const THUMB_QUALITY = 0.75;

/** Tailles maximales acceptées (en caractères de data URL), avec une bonne marge. */
export const MAX_PHOTO_CHARS = 150_000;
export const MAX_THUMB_CHARS = 16_000;

/** Côté maximal de l'image de travail dans l'éditeur (limite la mémoire sur mobile). */
export const WORK_MAX_SIDE = 1600;

const DATA_URL = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

/** Vrai pour une image encodée en data URL (JPEG, PNG ou WebP) de taille raisonnable. */
export function isPhotoDataUrl(value: unknown, maxChars = MAX_PHOTO_CHARS): value is string {
  return typeof value === "string" && value.length <= maxChars && DATA_URL.test(value);
}

/** Formats que les navigateurs (hors Safari) ne savent pas décoder : photos iPhone en HEIC. */
export function isHeic(file: { type: string; name: string }): boolean {
  return /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

export interface Size {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Crop {
  /** Zoom relatif (1 = l'image remplit juste le cadre). */
  zoom: number;
  /** Décalage du centre de l'image par rapport au centre du cadre, en pixels du cadre. */
  offset: Point;
}

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;

/** Dimensions d'affichage de l'image pour qu'elle couvre un cadre carré de côté `frame`. */
export function displaySize(image: Size, frame: number, zoom: number): Size {
  const scale = (frame / Math.min(image.width, image.height)) * zoom;
  return { width: image.width * scale, height: image.height * scale };
}

export const clampZoom = (zoom: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number.isFinite(zoom) ? zoom : MIN_ZOOM));

/** Empêche de faire apparaître du vide dans le cadre : le décalage reste dans les bords de l'image. */
export function clampCrop(image: Size, frame: number, crop: Crop): Crop {
  const zoom = clampZoom(crop.zoom);
  const d = displaySize(image, frame, zoom);
  const maxX = Math.max(0, (d.width - frame) / 2);
  const maxY = Math.max(0, (d.height - frame) / 2);
  const clamp = (v: number, max: number) => (Number.isFinite(v) ? Math.min(max, Math.max(-max, v)) : 0);
  return { zoom, offset: { x: clamp(crop.offset.x, maxX), y: clamp(crop.offset.y, maxY) } };
}

/**
 * Zoom autour d'un point du cadre (doigts, molette) : le point de l'image sous
 * `focus` (relatif au centre du cadre) reste au même endroit.
 */
export function zoomAround(image: Size, frame: number, crop: Crop, nextZoom: number, focus: Point = { x: 0, y: 0 }): Crop {
  const zoom = clampZoom(nextZoom);
  const k = zoom / clampZoom(crop.zoom);
  return clampCrop(image, frame, {
    zoom,
    offset: { x: focus.x - (focus.x - crop.offset.x) * k, y: focus.y - (focus.y - crop.offset.y) * k },
  });
}

/** Zone de l'image d'origine visible dans le cadre (pour `drawImage`). */
export function sourceRect(image: Size, frame: number, crop: Crop): { sx: number; sy: number; size: number } {
  const { zoom, offset } = clampCrop(image, frame, crop);
  const scale = (frame / Math.min(image.width, image.height)) * zoom;
  const d = displaySize(image, frame, zoom);
  const size = frame / scale;
  const sx = ((d.width - frame) / 2 - offset.x) / scale;
  const sy = ((d.height - frame) / 2 - offset.y) / scale;
  // Les arrondis ne doivent jamais faire sortir la zone de l'image.
  return {
    sx: Math.min(Math.max(0, sx), image.width - size),
    sy: Math.min(Math.max(0, sy), image.height - size),
    size,
  };
}

/** Dimensions de l'image de travail : réduite si besoin, proportions conservées. */
export function fitWithin(image: Size, maxSide = WORK_MAX_SIDE): Size {
  const k = Math.min(1, maxSide / Math.max(image.width, image.height));
  return { width: Math.max(1, Math.round(image.width * k)), height: Math.max(1, Math.round(image.height * k)) };
}

// ───────────── Bannière de profil ─────────────

/** Bannière : 720 × 240 (3:1) en JPEG, et sa miniature pour les lignes du classement. */
export const BANNER_W = 720;
export const BANNER_H = 240;
export const BANNER_THUMB_W = 240;
export const BANNER_THUMB_H = 80;
export const BANNER_QUALITY = 0.78;
export const BANNER_THUMB_QUALITY = 0.6;
export const MAX_BANNER_CHARS = 180_000;
export const MAX_BANNER_THUMB_CHARS = 12_000;

/** Partie de l'image (taille `image`) gardée pour un cadre 3:1 ; `pos` de 0 (haut/gauche) à 1 (bas/droite), `zoom` ≥ 1. */
export function bannerSourceRect(image: Size, pos: number, zoom = 1): { sx: number; sy: number; sw: number; sh: number } {
  const ratio = BANNER_W / BANNER_H;
  const z = clampZoom(zoom);
  let sw = image.width, sh = image.width / ratio;
  if (sh > image.height) {
    sh = image.height;
    sw = sh * ratio;
  }
  sw /= z;
  sh /= z;
  const p = Math.min(1, Math.max(0, Number.isFinite(pos) ? pos : 0.5));
  const sx = (image.width - sw) / 2;
  const sy = (image.height - sh) * p;
  return { sx, sy, sw, sh };
}
