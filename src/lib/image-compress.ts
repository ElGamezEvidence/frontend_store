/** Compress an image file in the browser and return a JPEG data URL. */
export async function compressImageFile(
  file: File,
  options?: { maxWidth?: number; maxHeight?: number; quality?: number },
): Promise<string> {
  const maxWidth = options?.maxWidth ?? 1400;
  const maxHeight = options?.maxHeight ?? 1400;
  const quality = options?.quality ?? 0.82;

  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(maxWidth / bitmap.width, maxHeight / bitmap.height, 1);
  const width = Math.round(bitmap.width * ratio);
  const height = Math.round(bitmap.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", quality);
}
