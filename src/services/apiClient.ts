const getDefaultApiBaseUrl = (): string => {

  const configuredUrl =
    import.meta.env.VITE_API_BASE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:8080`;
  }

  return 'http://localhost:8080';
};

export const API_BASE_URL =
  getDefaultApiBaseUrl();

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

    this.responseBody =
      responseBody;
  }
}

function getCsrfToken(): string | null {

  const cookie =
    document.cookie
      .split(';')
      .map((item) => item.trim())
      .find((item) =>
        item.startsWith('XSRF-TOKEN=')
      );

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(
    cookie.substring('XSRF-TOKEN='.length)
  );
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {

  const cleanEndpoint =
    endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`;

  const url =
    `${API_BASE_URL}${cleanEndpoint}`;

  const method =
    options.method || 'GET';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  // ==========================================================
  // CSRF HEADER
  // ==========================================================

  const unsafeMethods = [
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
  ];

  if (unsafeMethods.includes(method.toUpperCase())) {

    const csrfToken =
      getCsrfToken();

    if (csrfToken) {
      headers['X-XSRF-TOKEN'] =
        csrfToken;
    }
  }

  let response: Response;

  try {

    response = await fetch(
      url,
      {
        method,

        headers,

        // IMPORTANT:
        // Sends JSESSIONID cookie to Spring Boot.
        credentials: 'include',

        body:
          options.body !== undefined
            ? JSON.stringify(options.body)
            : undefined,
      }
    );

  } catch (error) {

    console.error(
      '[StaffHub API] Network error:',
      error
    );

    throw new ApiError(
      `Cannot connect to StaffHub backend at ${API_BASE_URL}. ` +
      'Make sure the backend is running and accessible.',
      0,
      null
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (!response.ok) {

    const responseText =
      await response.text();

    let responseBody: unknown = null;

    try {

      responseBody =
        responseText
          ? JSON.parse(responseText)
          : null;

    } catch {

      responseBody =
        responseText;
    }

    let message =
      `API request failed with status ${response.status}`;

    if (
      responseBody &&
      typeof responseBody === 'object' &&
      'message' in responseBody &&
      typeof responseBody.message === 'string'
    ) {

      message =
        responseBody.message;
    }

    throw new ApiError(
      message,
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

  try {

    return JSON.parse(
      responseText
    ) as T;

  } catch {

    return responseText as T;
  }
}

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