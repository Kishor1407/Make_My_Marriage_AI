export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

/**
 * Aggressively shrinks image files before uploading to respect MongoDB Atlas 512MB limits.
 * Dynamically imported to ensure client-only execution.
 */
export async function compressImage(
  file: File,
  customOptions?: CompressionOptions
): Promise<File> {
  if (typeof window === 'undefined') return file;

  const options = {
    maxSizeMB: 0.5, // Target max 500KB per image
    maxWidthOrHeight: 1600, // Limit resolution to HD
    useWebWorker: true,
    ...customOptions
  };

  try {
    const imageCompression = (await import('browser-image-compression')).default;
    const compressedFile = await imageCompression(file, options);
    console.log(
      `Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB -> Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`
    );
    return compressedFile;
  } catch (error) {
    console.warn('Image compression failed, falling back to original:', error);
    return file;
  }
}
