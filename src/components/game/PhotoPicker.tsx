"use client";

import { type ChangeEvent, useCallback, useRef, useState } from "react";
import { Camera, ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PhotoEditor, type PhotoResult } from "./PhotoEditor";

/**
 * Boutons « Prendre une photo » / « Choisir une image » / « Retirer la photo »,
 * puis recadrage dans une modale. `onChange(null)` revient à l'emoji.
 */
export function PhotoPicker({ hasPhoto, onChange }: { hasPhoto: boolean; onChange: (result: PhotoResult | null) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  function pick(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = ""; // permet de reprendre le même fichier
    if (f) setFile(f);
  }

  const close = useCallback(() => setFile(null), []);

  return (
    <div className="flex flex-wrap gap-2">
      <input ref={cameraRef} type="file" accept="image/*" capture="user" className="hidden" onChange={pick} aria-hidden tabIndex={-1} />
      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={pick} aria-hidden tabIndex={-1} />
      <Button variant="secondary" onClick={() => cameraRef.current?.click()}>
        <Camera size={17} /> Prendre une photo
      </Button>
      <Button variant="secondary" onClick={() => galleryRef.current?.click()}>
        <ImagePlus size={17} /> Choisir une image
      </Button>
      {hasPhoto && (
        <Button variant="ghost" onClick={() => onChange(null)}>
          <Trash2 size={17} /> Retirer la photo
        </Button>
      )}
      {file && (
        <PhotoEditor
          file={file}
          onCancel={close}
          onSave={(result) => {
            setFile(null);
            onChange(result);
          }}
        />
      )}
    </div>
  );
}
