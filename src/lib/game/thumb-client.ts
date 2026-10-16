"use client";

import { MAX_THUMB_CHARS, THUMB_QUALITY, THUMB_SIZE } from "./photo";

const load = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

/**
 * Les anciennes miniatures faisaient 64 px (floues sur les grands avatars) :
 * on en refait une à la bonne taille à partir de la photo, si besoin.
 * Renvoie la nouvelle miniature, ou null si rien à faire.
 */
export async function upgradeThumb(photo: string, thumb: string | undefined): Promise<string | null> {
  try {
    if (thumb && (await load(thumb)).naturalWidth >= THUMB_SIZE) return null;
    const img = await load(photo);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = THUMB_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, THUMB_SIZE, THUMB_SIZE);
    let q = THUMB_QUALITY;
    let url = canvas.toDataURL("image/jpeg", q);
    while (url.length > MAX_THUMB_CHARS && q > 0.3) {
      q -= 0.15;
      url = canvas.toDataURL("image/jpeg", q);
    }
    return url.length <= MAX_THUMB_CHARS ? url : null;
  } catch {
    return null;
  }
}
