const MISSING_IMAGE_DATA_URI =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23374151" width="100%" height="100%"/></svg>'
  );

export function imgSrc(url: unknown): string {
  if (url == null) return MISSING_IMAGE_DATA_URI;
  if (typeof url !== "string") return MISSING_IMAGE_DATA_URI;
  const t = url.trim();
  return t.length > 0 ? t : MISSING_IMAGE_DATA_URI;
}
