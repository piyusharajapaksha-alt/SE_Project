// ============================================================
// API CLIENT
// Handles communication between React and Spring Boot backend
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body
      ? JSON.stringify(options.body)
      : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || `API Error: ${response.status}`
    );
  }

  // Some DELETE/PUT requests may not return JSON
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

export default {
  apiRequest,
  getApiUrl,
};