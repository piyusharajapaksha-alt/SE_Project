// ============================================================
// STAFFHUB API CLIENT
// Handles communication between React and Spring Boot backend
// ============================================================

const getDefaultApiBaseUrl = (): string => {
  // If VITE_API_BASE_URL is configured, always use it.
  const configuredUrl =
    import.meta.env.VITE_API_BASE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '');
  }

  // IMPORTANT:
  // Using "localhost" breaks when the frontend is opened
  // from another laptop/phone.
  //
  // Example:
  // Frontend: http://172.28.10.25:5173
  // Backend:  http://172.28.10.25:8080
  //
  // window.location.hostname automatically becomes
  // 172.28.10.25.
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:8080`;
  }

  // Fallback for non-browser environments.
  return 'http://localhost:8080';
};

export const API_BASE_URL = getDefaultApiBaseUrl();

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  status: number;
  responseBody: unknown;

  constructor(
    message: string,
    status: number,
    responseBody: unknown = null
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.responseBody = responseBody;
  }
}

// ============================================================
// API REQUEST
// ============================================================

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;

  const url =
    `${API_BASE_URL}${cleanEndpoint}`;

  const method =
    options.method || 'GET';

  console.log(
    `[StaffHub API] ${method} ${url}`
  );

  let response: Response;

  try {
    response = await fetch(url, {
      method,

      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },

      body:
        options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
    });
  } catch (error) {
    console.error(
      '[StaffHub API] Network error:',
      error
    );

    throw new ApiError(
      `Cannot connect to StaffHub backend at ${API_BASE_URL}. ` +
        'Make sure the backend is running and accessible from this device.',
      0,
      null
    );
  }

  // ==========================================================
  // ERROR RESPONSE
  // ==========================================================

  if (!response.ok) {
    const responseText =
      await response.text();

    let responseBody: any = null;

    try {
      responseBody = responseText
        ? JSON.parse(responseText)
        : null;
    } catch {
      responseBody = responseText;
    }

    const backendMessage =
      responseBody &&
      typeof responseBody === 'object' &&
      typeof responseBody.message === 'string'
        ? responseBody.message
        : typeof responseBody === 'string'
          ? responseBody
          : `API request failed with status ${response.status}`;

    console.error(
      `[StaffHub API] ${response.status} ${method} ${url}`,
      responseBody
    );

    throw new ApiError(
      backendMessage,
      response.status,
      responseBody
    );
  }

  // ==========================================================
  // NO CONTENT
  // ==========================================================

  if (response.status === 204) {
    return undefined as T;
  }

  const responseText =
    await response.text();

  if (!responseText.trim()) {
    return undefined as T;
  }

  // ==========================================================
  // JSON RESPONSE
  // ==========================================================

  try {
    return JSON.parse(responseText) as T;
  } catch {
    // Backend returned plain text.
    return responseText as T;
  }
}

// ============================================================
// GET FULL API URL
// ============================================================

export function getApiUrl(
  endpoint: string
): string {
  const cleanEndpoint =
    endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`;

  return `${API_BASE_URL}${cleanEndpoint}`;
}

export default {
  apiRequest,
  getApiUrl,
  API_BASE_URL,
};