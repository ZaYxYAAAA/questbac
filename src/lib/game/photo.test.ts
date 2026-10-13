import { describe, expect, it } from "vitest";
import { MAX_THUMB_CHARS, clampCrop, displaySize, fitWithin, isHeic, isPhotoDataUrl, sourceRect, zoomAround } from "./photo";

const landscape = { width: 1200, height: 800 };
const FRAME = 200;

describe("recadrage de la photo", () => {
  it("couvre le cadre avec le petit côté", () => {
    expect(displaySize(landscape, FRAME, 1)).toEqual({ width: 300, height: 200 });
    expect(displaySize(landscape, FRAME, 2)).toEqual({ width: 600, height: 400 });
  });

  it("sans décalage, garde le carré central", () => {
    expect(sourceRect(landscape, FRAME, { zoom: 1, offset: { x: 0, y: 0 } })).toEqual({ sx: 200, sy: 0, size: 800 });
    expect(sourceRect(landscape, FRAME, { zoom: 2, offset: { x: 0, y: 0 } })).toEqual({ sx: 400, sy: 200, size: 400 });
  });

  it("bloque le décalage aux bords de l'image (jamais de vide)", () => {
    const c = clampCrop(landscape, FRAME, { zoom: 1, offset: { x: 999, y: 50 } });
    expect(c.offset).toEqual({ x: 50, y: 0 });
    // Image déplacée à droite au maximum : on voit son bord gauche.
    expect(sourceRect(landscape, FRAME, { zoom: 1, offset: { x: 999, y: 0 } }).sx).toBe(0);
    expect(sourceRect(landscape, FRAME, { zoom: 1, offset: { x: -999, y: 0 } }).sx).toBe(400);
  });

  it("borne le zoom et ignore les valeurs absurdes", () => {
    expect(clampCrop(landscape, FRAME, { zoom: 0.2, offset: { x: 0, y: 0 } }).zoom).toBe(1);
    expect(clampCrop(landscape, FRAME, { zoom: 40, offset: { x: 0, y: 0 } }).zoom).toBe(4);
    expect(clampCrop(landscape, FRAME, { zoom: Number.NaN, offset: { x: Number.NaN, y: 0 } })).toEqual({ zoom: 1, offset: { x: 0, y: 0 } });
  });

  it("zoome autour du point visé", () => {
    // On zoome ×2 sur le point situé 40 px à droite du centre : il ne bouge pas.
    const c = zoomAround(landscape, FRAME, { zoom: 1, offset: { x: 0, y: 0 } }, 2, { x: 40, y: 0 });
    expect(c).toEqual({ zoom: 2, offset: { x: -40, y: 0 } });
    const r = sourceRect(landscape, FRAME, c);
    const scale = FRAME / r.size;
    const before = sourceRect(landscape, FRAME, { zoom: 1, offset: { x: 0, y: 0 } });
    expect(r.sx + (FRAME / 2 + 40) / scale).toBeCloseTo(before.sx + (FRAME / 2 + 40) / (FRAME / before.size));
  });

  it("réduit les grandes photos en gardant les proportions", () => {
    expect(fitWithin({ width: 4032, height: 3024 }, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin({ width: 300, height: 500 }, 1600)).toEqual({ width: 300, height: 500 });
  });
});

describe("validation des photos", () => {
  it("accepte une image en data URL et refuse le reste", () => {
    expect(isPhotoDataUrl("data:image/jpeg;base64,/9j/4AAQSkZJRg==")).toBe(true);
    expect(isPhotoDataUrl("data:image/svg+xml;base64,PHN2Zz4=")).toBe(false);
    expect(isPhotoDataUrl("javascript:alert(1)")).toBe(false);
    expect(isPhotoDataUrl("https://exemple.fr/photo.jpg")).toBe(false);
    expect(isPhotoDataUrl(42)).toBe(false);
    expect(isPhotoDataUrl(`data:image/jpeg;base64,${"A".repeat(MAX_THUMB_CHARS)}`, MAX_THUMB_CHARS)).toBe(false);
  });

  it("reconnaît les photos HEIC", () => {
    expect(isHeic({ type: "image/heic", name: "IMG_0001.HEIC" })).toBe(true);
    expect(isHeic({ type: "", name: "IMG_0001.heif" })).toBe(true);
    expect(isHeic({ type: "image/jpeg", name: "IMG_0001.jpg" })).toBe(false);
  });
});
