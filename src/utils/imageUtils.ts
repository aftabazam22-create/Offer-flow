/**
 * Compresses an uploaded image file to a lightweight data URL safe for Firestore (< 350 KB).
 */
export const compressImageFile = (
  file: File,
  maxSize = 720,
  initialQuality = 0.78,
  maxBytes = 320000
): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve((e.target?.result as string) || '');
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        let quality = initialQuality;
        let output = canvas.toDataURL('image/webp', quality);
        if (!output.startsWith('data:image/webp')) {
          output = canvas.toDataURL('image/jpeg', quality);
        }

        while (output.length > maxBytes && quality > 0.3) {
          quality -= 0.12;
          output = canvas.toDataURL('image/jpeg', quality);
        }

        // Final resize fallback if still larger than maxBytes
        if (output.length > maxBytes) {
          const smallCanvas = document.createElement('canvas');
          smallCanvas.width = Math.round(canvas.width * 0.65);
          smallCanvas.height = Math.round(canvas.height * 0.65);
          const sctx = smallCanvas.getContext('2d');
          if (sctx) {
            sctx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
            output = smallCanvas.toDataURL('image/jpeg', 0.65);
          }
        }

        resolve(output);
      };
      img.onerror = () => resolve((e.target?.result as string) || '');
      img.src = (e.target?.result as string) || '';
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};
