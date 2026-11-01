import html2canvas from 'html2canvas';

/**
 * Captures a DOM node and exports it as a high-resolution downloadable image.
 * Requires 0 backend compute resources.
 */
export async function downloadInvitationAsImage(
  element: HTMLElement,
  fileName: string = 'wedding-invitation.png'
): Promise<void> {
  try {
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

