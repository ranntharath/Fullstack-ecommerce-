export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/";
  // Extract host by removing the trailing /api/ or /api
  const host = apiUrl.replace(/\/api\/?$/, "");
  
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${host}${cleanPath}`;
}
