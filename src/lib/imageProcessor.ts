const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface ProcessedUpload {
  url: string;
}

export async function compressAndUploadImage(
  file: File,
  onProgress?: (pct: number) => void
): Promise<ProcessedUpload> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Only JPG, PNG, and WebP images are allowed.');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('File exceeds the 15 MB maximum upload limit.');
  }

  onProgress?.(15);

  const dataUrl = await resizeImageInBrowser(file, 1920, 0.85);
  onProgress?.(55);

  const outputMime = dataUrl.startsWith('data:image/webp')
    ? 'image/webp'
    : dataUrl.startsWith('data:image/png')
      ? 'image/png'
      : 'image/jpeg';

  const res = await fetch('/api/uploads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      mimeType: outputMime,
      dataUrl,
    }),
  });

  onProgress?.(90);

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || 'Image upload failed.');
  }

  onProgress?.(100);
  return { url: json.url };
}

function resizeImageInBrowser(file: File, maxDimension: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const targetMime = file.type === 'image/png' ? 'image/webp' : 'image/webp';
        const compressed = canvas.toDataURL(targetMime, quality);
        // Fallback to JPEG if browser canvas doesn't encode WebP
        if (!compressed.startsWith('data:image/webp')) {
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(compressed);
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
