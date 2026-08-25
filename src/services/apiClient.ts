// ============================================================
// API CLIENT - Base configuration for backend API communication
// Currently uses mock data. When backend is ready, this will
// handle all HTTP requests to the Spring Boot API.
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

// Future: This will make real HTTP requests to the backend
// For now, it's a placeholder that shows the API structure
export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  // FUTURE BACKEND:
  // Replace this with actual fetch/axios calls:
  // const response = await fetch(`${API_BASE_URL}${endpoint}`, {
  //   method: options.method || 'GET',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     ...options.headers,
  //   },
  //   body: options.body ? JSON.stringify(options.body) : undefined,
  // });
  // if (!response.ok) throw new Error(`API Error: ${response.status}`);
  // return response.json();

  // DEVELOPMENT: Mock mode - requests go through service layer instead
  throw new Error('API mode is not yet configured. Set VITE_DATA_MODE=mock for development.');
}

export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

export default { apiRequest, getApiUrl };
