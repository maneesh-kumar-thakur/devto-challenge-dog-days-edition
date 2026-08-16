import { jsPDF } from 'jspdf';
import { DogTranslationResult } from '../types';

/**
 * Generates and downloads a beautifully styled PDF keepsake of the Canine Thought Diary.
 * Ensures strict word-wrapping within page margins and dynamic pagination.
 */
export async function exportDiaryToPdf(
  entries: DogTranslationResult[],
  petName?: string
): Promise<void> {
  if (!entries || entries.length === 0) {
    throw new Error('No diary entries to export');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const innerCardWidth = contentWidth - 8;

  // Title Page / Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 44, 'F');

  // Decorative header line
  doc.setDrawColor(99, 102, 241); // indigo-500
  doc.setLineWidth(1.5);
  doc.line(0, 44, pageWidth, 44);

  // Header Title with wrapping if long
  doc.setTextColor(248, 250, 252); // slate-50
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  const titleText = petName ? `${petName}'s Canine Thought Diary` : 'Canine Thought Diary & Keepsake';
  const titleLines = doc.splitTextToSize(titleText, contentWidth);
  doc.text(titleLines, margin, 16);

  // Header Subtitle
  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const subtitleText = `Official Mind-Reading Chronicles • ${entries.length} Logged Entries • Exported on ${new Date().toLocaleDateString()}`;
  const subtitleLines = doc.splitTextToSize(subtitleText, contentWidth);
  doc.text(subtitleLines, margin, 27);

  // Watermark / Tagline
  doc.setTextColor(129, 140, 248); // indigo-400
  doc.setFontSize(8.5);
  doc.text('Powered by AI Dog Mind-Reader • Google Gemini Vision', margin, 36);

  let currentY = 52;

  // Helper to ensure header is on subsequent pages
  const addPageHeaderIfNeeded = () => {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Canine Thought Diary — Keepsake Edition`, margin, 12);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, 15, pageWidth - margin, 15);
  };

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const dateStr = new Date(entry.timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const entryName = entry.dogName || petName || `Entry #${i + 1}`;
    const personalityLabel = entry.personalityName || entry.personality;

    // Pre-calculate wrapped text lines and card height
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const moodLines = doc.splitTextToSize(entry.detectedMood || 'Unknown mood', innerCardWidth - 28);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    const monologueLines = doc.splitTextToSize(`"${entry.monologue}"`, innerCardWidth - 6);
    const monologueBoxHeight = monologueLines.length * 4.8 + 6;

    let breedLines: string[] = [];
    let insightLines: string[] = [];
    if (entry.identifiedBreed) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      breedLines = doc.splitTextToSize(`Breed: ${entry.identifiedBreed}`, innerCardWidth);
    }
    if (entry.breedInsight) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      insightLines = doc.splitTextToSize(`Heritage: "${entry.breedInsight}"`, innerCardWidth);
    }

    let clueLines: string[] = [];
    if (entry.visualClues && entry.visualClues.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const cluesText = entry.visualClues.slice(0, 4).join('  •  ');
      clueLines = doc.splitTextToSize(cluesText, innerCardWidth - 36);
    }

    let noteLines: string[] = [];
    if (entry.ownerNotes) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      noteLines = doc.splitTextToSize(`Owner Note: "${entry.ownerNotes}"`, innerCardWidth);
    }

    let actionLines: string[] = [];
    if (entry.suggestedAction) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      actionLines = doc.splitTextToSize(`Prescribed Action: ${entry.suggestedAction}`, innerCardWidth);
    }

    // Estimate total card height
    let estimatedHeight = 12 + 4; // header bar + gap
    estimatedHeight += Math.max(moodLines.length * 4.2, 5) + 3; // mood
    if (breedLines.length > 0) estimatedHeight += breedLines.length * 4 + 2;
    if (insightLines.length > 0) estimatedHeight += insightLines.length * 3.8 + 2;
    estimatedHeight += monologueBoxHeight + 4; // monologue
    if (clueLines.length > 0) estimatedHeight += Math.max(clueLines.length * 3.8, 4.5) + 2;
    if (noteLines.length > 0) estimatedHeight += noteLines.length * 3.8 + 2;
    if (actionLines.length > 0) estimatedHeight += actionLines.length * 3.8 + 2;
    estimatedHeight += 4; // bottom padding

    // Page overflow check
    if (currentY + estimatedHeight > pageHeight - 16) {
      doc.addPage();
      currentY = 22;
      addPageHeaderIfNeeded();
    }

    const cardStartY = currentY;

    // Card Header Bar
    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(margin, currentY, contentWidth, 10, 2, 2, 'F');

    // Title & Personality on Left
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(`${i + 1}. ${entryName}`, margin + 3, currentY + 6.8);

    const nameWidth = doc.getTextWidth(`${i + 1}. ${entryName}`);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text(`[${personalityLabel}]`, margin + 3 + nameWidth + 3, currentY + 6.8);

    // Timestamp on Right
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFontSize(7.5);
    doc.text(dateStr, pageWidth - margin - 3, currentY + 6.8, { align: 'right' });

    currentY += 14;

    // Mood Badge Row (with text wrapping)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('Detected Mood:', margin + 4, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(2, 132, 199); // sky-600
    doc.text(moodLines, margin + 30, currentY);
    currentY += Math.max(moodLines.length * 4.2, 5) + 2;

    // Breed & Insight (with text wrapping)
    if (breedLines.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(79, 70, 229); // indigo-600
      doc.text(breedLines, margin + 4, currentY);
      currentY += breedLines.length * 4 + 1;
    }

    if (insightLines.length > 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(insightLines, margin + 4, currentY);
      currentY += insightLines.length * 3.8 + 2;
    }

    // Inner Monologue Box (with text wrapping)
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.5);
    doc.roundedRect(margin + 2, currentY, contentWidth - 4, monologueBoxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(monologueLines, margin + 5, currentY + 5);

    currentY += monologueBoxHeight + 4;

    // Visual Clues (with text wrapping)
    if (clueLines.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text('Visual Clues:', margin + 4, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(clueLines, margin + 26, currentY);
      currentY += Math.max(clueLines.length * 3.8, 4.5) + 2;
    }

    // Owner Notes (with text wrapping)
    if (noteLines.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(217, 119, 6); // amber-600
      doc.text(noteLines, margin + 4, currentY);
      currentY += noteLines.length * 3.8 + 2;
    }

    // Suggested Action (with text wrapping)
    if (actionLines.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(16, 185, 129); // emerald-600
      doc.text(actionLines, margin + 4, currentY);
      currentY += actionLines.length * 3.8 + 2;
    }

    // Outer card stroke border
    const cardHeight = currentY - cardStartY + 2;
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, cardStartY, contentWidth, cardHeight, 2, 2, 'D');

    currentY += 7; // spacing before next card
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Canine Mind-Reader Keepsake Edition • Page ${p} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  const sanitizedFileName = (petName || 'canine-thought-diary')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-');
  doc.save(`${sanitizedFileName}-keepsake.pdf`);
}
