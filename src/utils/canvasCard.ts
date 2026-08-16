import { DogTranslationResult } from '../types';

export async function generateSocialCardBlob(translation: DogTranslationResult): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 1. Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
  bgGrad.addColorStop(0, '#0F172A'); // slate-900
  bgGrad.addColorStop(0.5, '#1E1B4B'); // indigo-950
  bgGrad.addColorStop(1, '#0F172A');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1080);

  // Decorative ambient circles
  ctx.beginPath();
  ctx.arc(900, 150, 200, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(236, 72, 153, 0.08)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(150, 950, 240, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(99, 102, 241, 0.08)';
  ctx.fill();

  // 2. Header Banner
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('🐕 TRANSLATE MY DOG', 60, 90);

  ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('Powered by Google Gemini 3.7 Vision & ElevenLabs', 60, 125);

  // Personality Chip
  const chipX = 740;
  const chipY = 60;
  const chipW = 280;
  const chipH = 64;
  roundRect(ctx, chipX, chipY, chipW, chipH, 32);
  ctx.fillStyle = '#312E81';
  ctx.fill();
  ctx.strokeStyle = '#6366F1';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#EEF2FF';
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(translation.personalityName || 'Dramatic Diva', chipX + chipW / 2, chipY + 40);
  ctx.textAlign = 'left';

  // 3. Draw Dog Image (rounded rectangle)
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = translation.imageUrl;
    });

    const imgX = 60;
    const imgY = 160;
    const imgW = 960;
    const imgH = 500;
    const radius = 24;

    ctx.save();
    roundRect(ctx, imgX, imgY, imgW, imgH, radius);
    ctx.clip();

    // Scale & center crop
    const imgRatio = img.width / img.height;
    const targetRatio = imgW / imgH;
    let sW = img.width;
    let sH = img.height;
    let sX = 0;
    let sY = 0;

    if (imgRatio > targetRatio) {
      sW = img.height * targetRatio;
      sX = (img.width - sW) / 2;
    } else {
      sH = img.width / targetRatio;
      sY = (img.height - sH) / 2;
    }

    ctx.drawImage(img, sX, sY, sW, sH, imgX, imgY, imgW, imgH);
    ctx.restore();

    // Image border overlay
    roundRect(ctx, imgX, imgY, imgW, imgH, radius);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Mood badge inside image (bottom-left)
    const moodText = `Detected Mood: ${translation.detectedMood || 'Canine Contemplation'}`;
    ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const textWidth = ctx.measureText(moodText).width;
    const moodBadgeW = textWidth + 40;
    const moodBadgeH = 44;
    const moodX = imgX + 24;
    const moodY = imgY + imgH - moodBadgeH - 24;

    roundRect(ctx, moodX, moodY, moodBadgeW, moodBadgeH, 12);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#38BDF8'; // sky-400
    ctx.fillText(moodText, moodX + 20, moodY + 29);
  } catch (err) {
    console.warn('Could not draw image to canvas:', err);
  }

  // 4. Comic Speech Bubble
  const bubbleX = 60;
  const bubbleY = 690;
  const bubbleW = 960;
  const bubbleH = 290;
  const bubbleRadius = 24;

  // Speech bubble body
  roundRect(ctx, bubbleX, bubbleY, bubbleW, bubbleH, bubbleRadius);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Quote icon decoration
  ctx.font = 'bold 72px Georgia, serif';
  ctx.fillStyle = '#E2E8F0';
  ctx.fillText('“', bubbleX + 30, bubbleY + 70);

  // Monologue text wrapping
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  wrapText(ctx, `"${translation.monologue}"`, bubbleX + 50, bubbleY + 90, bubbleW - 100, 42);

  // Canine IQ & Footer note
  ctx.fillStyle = '#64748B';
  ctx.font = '600 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`🧠 Canine IQ: ${translation.canineIqScore || '135 (Galaxy Good Boy)'}`, bubbleX + 50, bubbleY + bubbleH - 30);

  ctx.textAlign = 'right';
  ctx.fillText('dev.to/devteam #DEVWeekendChallenge 🐾', bubbleX + bubbleW - 40, bubbleY + bubbleH - 30);
  ctx.textAlign = 'left';

  // 5. Watermark / Footer
  ctx.fillStyle = '#64748B';
  ctx.font = '500 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Make your dog talk at: Translate My Dog App', 540, 1030);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}
