/**
 * Helper to extract mimeType and pure base64 data string from any data URI or raw base64 string.
 */
export function extractBase64Payload(input: string): { mimeType: string; base64Data: string } {
  if (!input || typeof input !== 'string') {
    return { mimeType: 'image/jpeg', base64Data: '' };
  }

  let mimeType = 'image/jpeg';
  let base64Data = input.trim();

  if (input.includes(';base64,')) {
    const parts = input.split(';base64,');
    const header = parts[0];
    base64Data = parts[1] || '';

    const mimeMatch = header.match(/data:([a-zA-Z0-9.+/_-]+)/);
    if (mimeMatch && mimeMatch[1]) {
      mimeType = mimeMatch[1];
    }
  }

  // Remove any remaining newlines or carriage returns that might corrupt the payload
  base64Data = base64Data.replace(/[\r\n\s]+/g, '');

  return { mimeType, base64Data };
}

/**
 * Validates whether a file is an acceptable image type.
 */
export function isValidImageFile(file: { type?: string; name?: string; size?: number }): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  const type = file.type?.toLowerCase() || '';

  const hasValidType = validTypes.includes(type) || type.startsWith('image/');
  if (!hasValidType) {
    return { valid: false, error: 'Please upload a valid image file (JPEG, PNG, WEBP, GIF).' };
  }

  // Max 25MB raw file limit before compression
  const maxBytes = 25 * 1024 * 1024;
  if (file.size && file.size > maxBytes) {
    return { valid: false, error: 'Image file exceeds the 25MB limit. Please choose a smaller photo.' };
  }

  return { valid: true };
}

/**
 * Optimizes/compresses client-side image files before upload to ensure fast transmission
 * and eliminate browser memory crashes.
 */
export function optimizeImageFile(
  file: File,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.88
): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (!src) {
        return reject(new Error('Empty file content.'));
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data.'));
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // If canvas context unavailable, fallback to original dataUrl
          return resolve({ dataUrl: src, width: img.width, height: img.height });
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({ dataUrl, width, height });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
