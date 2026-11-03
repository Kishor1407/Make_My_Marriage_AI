/**
 * Captures a DOM node and exports it as a high-resolution downloadable image.
 * Dynamically loaded in the browser to prevent SSR build issues.
 */
export async function downloadInvitationAsImage(
  element: HTMLElement,
  fileName: string = 'wedding-invitation.png'
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const html2canvas = (await import('html2canvas')).default;

    const canvas = await html2canvas(element, {
      scale: 2, // High DPI export
      useCORS: true,
      backgroundColor: null
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to generate invitation image:', error);
    throw error;
  }
}

/**
 * Generates and downloads a bespoke high-resolution Table Standee PNG.
 */
export async function generateAndDownloadStandee({
  marriageCode,
  coupleNames,
  tableNumber,
  qrDataUrl
}: {
  marriageCode: string;
  coupleNames: string;
  tableNumber: string;
  qrDataUrl?: string;
}): Promise<void> {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, 1600);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(1, '#FBF8FF');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1200, 1600);

  // Outer Decorative Borders
  ctx.strokeStyle = '#A20025';
  ctx.lineWidth = 12;
  ctx.strokeRect(40, 40, 1120, 1520);

  ctx.strokeStyle = '#C5A880';
  ctx.lineWidth = 3;
  ctx.strokeRect(60, 60, 1080, 1480);

  // Top Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#A20025';
  ctx.font = 'bold 24px sans-serif';
  ctx.letterSpacing = '6px';
  ctx.fillText('MAKE MY MARRIAGE • ARCHIVAL TABLE STANDEE', 600, 140);

  // Couple Names
  ctx.fillStyle = '#1A1B22';
  ctx.font = 'bold 54px Georgia, serif';
  ctx.fillText(coupleNames || 'Wedding Celebration', 600, 240);

  // Divider
  ctx.strokeStyle = '#C5A880';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(350, 280);
  ctx.lineTo(850, 280);
  ctx.stroke();

  // Table Badge
  ctx.fillStyle = '#A20025';
  ctx.beginPath();
  ctx.roundRect(320, 320, 560, 80, 40);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText(`TABLE ${tableNumber.padStart(2, '0')} • HONORED GUEST`, 600, 372);

  // QR Code
  let qrImg: HTMLImageElement | null = null;
  if (qrDataUrl) {
    try {
      qrImg = await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = qrDataUrl;
      });
    } catch {}
  }

  if (qrImg) {
    // Draw white container for QR
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.roundRect(325, 460, 550, 550, 24);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.drawImage(qrImg, 350, 485, 500, 500);
  } else {
    // Fallback QR box
    ctx.fillStyle = '#F4F2FC';
    ctx.fillRect(350, 485, 500, 500);
    ctx.fillStyle = '#A20025';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('SCAN WITH CAMERA', 600, 740);
  }

  // Passcode Pill
  ctx.fillStyle = '#F4F2FC';
  ctx.beginPath();
  ctx.roundRect(360, 1070, 480, 80, 16);
  ctx.fill();

  ctx.fillStyle = '#5F5E60';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('VAULT PASSKEY', 600, 1105);

  ctx.fillStyle = '#C81E38';
  ctx.font = 'bold 34px monospace';
  ctx.fillText(marriageCode, 600, 1140);

  // Instructions
  ctx.fillStyle = '#1A1B22';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('Scan to Share Candid Photos & Watch Live Ceremony Stream', 600, 1230);

  ctx.fillStyle = '#71717A';
  ctx.font = '20px sans-serif';
  ctx.fillText('Photos sync instantly to the couple\'s archival leather album', 600, 1275);
  ctx.fillText('No app download required • Zero-compression 4K delivery', 600, 1315);

  // Footer Seal
  ctx.fillStyle = '#A20025';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('SOVEREIGN MATRIMONIAL ATELIER • ENCRYPTED QR PROTOCOL', 600, 1480);

  // Download Trigger
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${marriageCode.toLowerCase()}-table-${tableNumber}-standee.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates and downloads a bespoke high-resolution Ceremonial Invitation Monograph PNG.
 */
export async function generateAndDownloadCeremonyInvite({
  marriageCode,
  coupleNames,
  riteTitle,
  date,
  venue,
  qrDataUrl
}: {
  marriageCode: string;
  coupleNames: string;
  riteTitle: string;
  date?: string;
  venue?: string;
  qrDataUrl?: string;
}): Promise<void> {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, 1600);
  grad.addColorStop(0, '#FFFDF8');
  grad.addColorStop(1, '#F8F2E8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1200, 1600);

  // Double Border in Royal Crimson & Gold
  ctx.strokeStyle = '#9A1830';
  ctx.lineWidth = 14;
  ctx.strokeRect(36, 36, 1128, 1528);

  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 4;
  ctx.strokeRect(56, 56, 1088, 1488);

  ctx.textAlign = 'center';

  // Auspicious Invocation
  ctx.fillStyle = '#9A1830';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('॥ श्री गणेशाय नमः ॥ • ॥ शुभम् भवतु ॥', 600, 140);

  // Monogram / Crown
  ctx.fillStyle = '#D4AF37';
  ctx.font = '36px sans-serif';
  ctx.fillText('⚜', 600, 200);

  // Rite Title
  ctx.fillStyle = '#9A1830';
  ctx.font = 'bold 44px Georgia, serif';
  ctx.letterSpacing = '3px';
  ctx.fillText(riteTitle.toUpperCase(), 600, 270);

  // Invitation Greeting
  ctx.fillStyle = '#5A4A42';
  ctx.font = 'italic 24px Georgia, serif';
  ctx.fillText('Together with our families, we cordially invite your gracious presence to celebrate', 600, 340);

  // Couple Names
  ctx.fillStyle = '#1A1B22';
  ctx.font = 'bold 58px Georgia, serif';
  ctx.fillText(coupleNames || 'Raj & Simran', 600, 430);

  // Gold Divider
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(350, 480);
  ctx.lineTo(850, 480);
  ctx.stroke();

  // Date & Muhurat
  ctx.fillStyle = '#9A1830';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('DATE & AUSPICIOUS MUHURAT', 600, 550);

  ctx.fillStyle = '#1A1B22';
  ctx.font = '30px Georgia, serif';
  ctx.fillText(date || 'Sunday, December 15, 2026 • 11:30 AM Onwards', 600, 600);

  // Venue
  ctx.fillStyle = '#9A1830';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('CEREMONIAL VENUE', 600, 680);

  ctx.fillStyle = '#1A1B22';
  ctx.font = '28px Georgia, serif';
  ctx.fillText(venue || 'The Oberoi Amarvilas Grand Ballroom, Taj East Gate Road', 600, 730);

  // Blessing Message
  ctx.fillStyle = '#5A4A42';
  ctx.font = 'italic 24px Georgia, serif';
  ctx.fillText('“May sacred blessings shower the bond of love and auspicious union.”', 600, 830);

  // QR Code Card
  let qrImg: HTMLImageElement | null = null;
  if (qrDataUrl) {
    try {
      qrImg = await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = qrDataUrl;
      });
    } catch {}
  }

  if (qrImg) {
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0,0,0,0.08)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.roundRect(430, 910, 340, 340, 16);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.drawImage(qrImg, 450, 930, 300, 300);
  }

  // Passcode Pill
  ctx.fillStyle = '#9A1830';
  ctx.beginPath();
  ctx.roundRect(380, 1300, 440, 64, 12);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(`VAULT PASSKEY: ${marriageCode}`, 600, 1342);

  // Footer Compliments
  ctx.fillStyle = '#7A6B63';
  ctx.font = '20px sans-serif';
  ctx.fillText('With Best Compliments: Family & Relatives • RSVP & Live Stream Access Enabled', 600, 1420);

  ctx.fillStyle = '#D4AF37';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('MAKE MY MARRIAGE • HIGH-FASHION MATRIMONIAL ATELIER', 600, 1500);

  // Download Trigger
  const cleanRite = riteTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${marriageCode.toLowerCase()}-${cleanRite}-invitation.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

