/**
 * Safe utility to parse and format Base64 image strings for JSX image rendering.
 * Supports standard HTTP/S URLs, data URLs, and converts raw Base64 strings to appropriate data sources.
 */
export function formatBase64ToImageSource(photoSrc: string | undefined | null): string {
  if (!photoSrc) return "";
  const trimmed = photoSrc.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed;
  }
  // Assume it's a raw base64 string. Default to a valid data URL.
  // We can standardise on PNG or JPEG as fallback.
  return `data:image/jpeg;base64,${trimmed}`;
}
