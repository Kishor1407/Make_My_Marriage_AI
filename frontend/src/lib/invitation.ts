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
