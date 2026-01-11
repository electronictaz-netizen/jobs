// API Configuration
// In production, this will be set via environment variable VITE_API_URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// If no API URL is set, use relative paths (works with proxy in development)
export const getApiUrl = (path: string): string => {
  if (API_BASE_URL) {
    return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  }
  return path.startsWith('/') ? path : `/${path}`;
};
