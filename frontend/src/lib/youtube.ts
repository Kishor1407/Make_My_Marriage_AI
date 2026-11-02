/**
 * Parses any YouTube link format (standard watch, short youtu.be, live stream, or embed)
 * and produces a high-fidelity embed URL for responsive iframes.
 */
export function getYouTubeEmbedUrl(url: string | null | undefined): string {
  if (!url || !url.trim()) {
    // Default high-res luxury Indian wedding royalty-free stream / video
    return 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0&rel=0';
  }

  const cleanUrl = url.trim();

  // If already an embed URL
  if (cleanUrl.includes('youtube.com/embed/')) {
    const hasParams = cleanUrl.includes('?');
    return cleanUrl.includes('autoplay')
      ? cleanUrl
      : `${cleanUrl}${hasParams ? '&' : '?'}autoplay=1&mute=0&rel=0&enablejsapi=1`;
  }

  let videoId = '';

  // 1. Check standard watch?v= format
  const watchMatch = cleanUrl.match(/[?&]v=([^&#]+)/);
  if (watchMatch) {
    videoId = watchMatch[1];
  }

  // 2. Check youtu.be/ format
  if (!videoId) {
    const shortMatch = cleanUrl.match(/youtu\.be\/([^?&#]+)/);
    if (shortMatch) {
      videoId = shortMatch[1];
    }
  }

  // 3. Check /live/ format
  if (!videoId) {
    const liveMatch = cleanUrl.match(/\/live\/([^?&#]+)/);
    if (liveMatch) {
      videoId = liveMatch[1];
    }
  }

  // 4. Fallback if plain 11-char ID was passed
  if (!videoId && /^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    videoId = cleanUrl;
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&enablejsapi=1`;
  }

  return cleanUrl;
}

