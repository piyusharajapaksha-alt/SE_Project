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

  // No content returned
  if (response.status === 204) {
    return undefined as T;
  }

  // Read the response as text first.
  // Backend may return either JSON or plain text.
  const responseText = await response.text();

  // Empty response
  if (!responseText) {
    return undefined as T;
  }

  // Try JSON first
  try {
    return JSON.parse(responseText) as T;
  } catch {
    // Backend returned plain text
    return responseText as T;
  }
}

export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

export default {
  apiRequest,
  getApiUrl,
};