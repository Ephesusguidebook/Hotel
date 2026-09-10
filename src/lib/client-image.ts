/**
 * Browser-side image processing for the media library.
 *
 * Photos are resized and converted to WebP here, in the visitor's browser,
 * rather than on the server. That's a deliberate choice: server-side image
 * libraries (sharp and friends) ship native binaries, and this project's
 * host has already proven it can't load native binaries built against a
 * different glibc. Canvas does the same job with nothing to install, and it
 * moves the CPU cost off the server.
 *
 * Only ever imported from client components.
 */

export type ProcessedImage = {
  blob: Blob;
  width: number;
  height: number;
  /** Extension matching blob.type, e.g. "webp". */
  extension: string;
};

export const MAX_DIMENSION = 2400;
export const WEBP_QUALITY = 0.82;

/** Photos wider or taller than this are scaled down before upload. 2400px
 *  covers full-bleed hero images on a retina display; anything larger is
 *  weight nobody sees. */
export async function processImage(
  file: File,
  maxDimension: number = MAX_DIMENSION,
  quality: number = WEBP_QUALITY
): Promise<ProcessedImage> {
  const source = await loadImage(file);

  const scale = Math.min(
    1,
    maxDimension / Math.max(source.width, source.height)
  );
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    source.close();
    throw new Error("Your browser could not process this image.");
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source.image, 0, 0, width, height);
  source.close();

  let blob = await canvasToBlob(canvas, "image/webp", quality);

  // Very old browsers ignore the WebP request and hand back a PNG, which is
  // far heavier. Fall back to JPEG in that case rather than storing it.
  if (!blob || blob.type !== "image/webp") {
    blob = await canvasToBlob(canvas, "image/jpeg", quality);
  }
  if (!blob) {
    throw new Error("Your browser could not convert this image.");
  }

  return {
    blob,
    width,
    height,
    extension: blob.type === "image/webp" ? "webp" : "jpg",
  };
}

type LoadedImage = {
  image: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
};

/** createImageBitmap honours EXIF rotation, which matters a lot for photos
 *  straight off a phone. Falls back to an <img> element where it isn't
 *  available. */
async function loadImage(file: File): Promise<LoadedImage> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      return {
        image: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        close: () => bitmap.close(),
      };
    } catch {
      // fall through to the <img> path
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("That file isn't a readable image."));
      el.src = url;
    });
    return {
      image: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      close: () => URL.revokeObjectURL(url),
    };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** Turkish letters that NFD normalisation doesn't decompose into an ASCII
 *  base letter plus a combining mark. */
const TURKISH_MAP: Record<string, string> = {
  ı: "i",
  İ: "i",
  ş: "s",
  Ş: "s",
  ğ: "g",
  Ğ: "g",
};

/** "Deniz Manzaralı Oda.JPG" -> "deniz-manzarali-oda.webp" */
export function toWebpFilename(originalName: string, extension: string): string {
  const base = originalName.replace(/\.[^.]+$/, "");
  const slug =
    base
      .replace(/[ıİşŞğĞ]/g, (ch) => TURKISH_MAP[ch] ?? ch)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // strip combining accents: ö -> o, ç -> c
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "photo";
  return `${slug}.${extension}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
