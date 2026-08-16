import { jsPDF } from 'jspdf';
import { DogTranslationResult } from '../types';

/**
 * Generates and downloads a beautifully styled PDF keepsake of the Canine Thought Diary.
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
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Title Page / Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Decorative header line
  doc.setDrawColor(99, 102, 241); // indigo-500
  doc.setLineWidth(1.5);
  doc.line(0, 42, pageWidth, 42);

  // Header Title
  doc.setTextColor(248, 250, 252); // slate-50
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  const titleText = petName ? `${petName}'s Canine Thought Diary` : 'Canine Thought Diary & Keepsake';
  doc.text(titleText, margin, 18);

  // Header Subtitle
  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(
    `Official Mind-Reading Chronicles • ${entries.length} Logged Entries • Exported on ${new Date().toLocaleDateString()}`,
    margin,
    27
  );

  // Watermark / Tagline
  doc.setTextColor(129, 140, 248); // indigo-400
  doc.setFontSize(9);
  doc.text('Powered by AI Dog Mind-Reader • Google Gemini Vision', margin, 35);

  let currentY = 52;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const dateStr = new Date(entry.timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Check if we need a new page
    if (currentY > pageHeight - 65) {
      doc.addPage();
      currentY = 25;

      // Small running top header on subsequent pages
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Canine Thought Diary — Page ${doc.getNumberOfPages()}`, margin, 15);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, 18, pageWidth - margin, 18);
    }

    // Card Container Background
    const cardStartY = currentY;
    
    // Card header bar
    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(margin, currentY, contentWidth, 12, 2, 2, 'F');

    // Entry Number & Personality
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59); // slate-800
    const entryName = entry.dogName || petName || `Entry #${i + 1}`;
    doc.text(`${i + 1}. ${entryName}`, margin + 4, currentY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text(`[${entry.personalityName || entry.personality}]`, margin + 50, currentY + 8);

    // Timestamp right-aligned
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text(dateStr, pageWidth - margin - 4, currentY + 8, { align: 'right' });

    currentY += 16;

    // Mood Badge Row
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Detected Mood:', margin + 4, currentY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(2, 132, 199); // sky-600
    doc.text(entry.detectedMood, margin + 30, currentY);

    currentY += 6;

    // Breed & Insight (if available)
    if (entry.identifiedBreed || entry.breedInsight) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(79, 70, 229); // indigo-600
      doc.text(`Breed: ${entry.identifiedBreed || 'Canine Good Boy'}`, margin + 4, currentY);

      if (entry.breedInsight) {
        currentY += 5;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        const insightLines = doc.splitTextToSize(`Heritage: "${entry.breedInsight}"`, contentWidth - 8);
        doc.text(insightLines, margin + 4, currentY);
        currentY += insightLines.length * 4;
      } else {
        currentY += 5;
      }
    }

    // Inner Monologue
    currentY += 2;
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.5);

    const monologueLines = doc.splitTextToSize(`"${entry.monologue}"`, contentWidth - 12);
    const boxHeight = monologueLines.length * 5 + 6;
    
    doc.roundedRect(margin + 2, currentY, contentWidth - 4, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(monologueLines, margin + 6, currentY + 5.5);

    currentY += boxHeight + 5;

    // Visual Clues & Suggested Action
    if (entry.visualClues && entry.visualClues.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Visual Clues Observed:', margin + 4, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const cluesText = entry.visualClues.slice(0, 3).join('  •  ');
      const clueLines = doc.splitTextToSize(cluesText, contentWidth - 42);
      doc.text(clueLines, margin + 38, currentY);
      currentY += Math.max(clueLines.length * 4, 5);
    }

    // Owner Notes if present
    if (entry.ownerNotes) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(217, 119, 6); // amber-600
      doc.text(`Owner Note: "${entry.ownerNotes}"`, margin + 4, currentY);
      currentY += 5;
    }

    // Suggested Action
    if (entry.suggestedAction) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(16, 185, 129); // emerald-600
      doc.text(`Prescribed Action: ${entry.suggestedAction}`, margin + 4, currentY);
      currentY += 5;
    }

    // Card outer border
    const totalCardHeight = currentY - cardStartY + 2;
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, cardStartY, contentWidth, totalCardHeight, 2, 2, 'D');

    currentY += 8; // space between cards
  }

  // Footer on final page
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
