const getDefaultApiBaseUrl = (): string => {
  /*
   * ============================================================
   * PRODUCTION
   * ============================================================
   *
   * When StaffHub is hosted on HTTPS/Vercel, API requests must
   * use the same origin:
   *
   *   https://sestaffhub.vercel.app/api/...
   *
   * Vercel rewrites /api/* to the Spring Boot backend.
   *
   * IMPORTANT:
   * Do NOT use:
   *
   *   http://sestaffhub.vercel.app:8080
   *
   * in production.
   */

  if (typeof window !== 'undefined') {

    const hostname =
      window.location.hostname;

    /*
     * Local development.
     */
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1'
    ) {

      const configuredUrl =
        import.meta.env.VITE_API_BASE_URL?.trim();

      if (configuredUrl) {
        return configuredUrl.replace(
          /\/+$/,
          ''
        );
      }

      return `http://${hostname}:8080`;
    }

    /*
     * Production / Vercel.
     *
     * Empty base URL means:
     *
     *   /api/auth/login
     *
     * instead of:
     *
     *   http://hostname:8080/api/auth/login
     */
    return '';
  }

  return '';
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

    this.name =
      'ApiError';

    this.status =
      status;

    this.responseBody =
      responseBody;
  }
}


// ============================================================
// CSRF TOKEN
// ============================================================

let csrfToken:
  string | null = null;


export function setCsrfToken(
  token: string | null
): void {

  csrfToken =
    token;
}


export function getCsrfToken():
  string | null {

  return csrfToken;
}


export function clearCsrfToken(): void {

  csrfToken =
    null;
}


// ============================================================
// API REQUEST
// ============================================================

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {

  const cleanEndpoint =
    endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`;


  /*
   * ==========================================================
   * IMPORTANT
   * ==========================================================
   *
   * Production:
   *
   * API_BASE_URL = ''
   *
   * Therefore:
   *
   *   /api/auth/me
   *
   * remains:
   *
   *   /api/auth/me
   *
   * Vercel then rewrites that request to the Spring Boot
   * backend through Cloudflare Tunnel.
   */

  const url =
    `${API_BASE_URL}${cleanEndpoint}`;


  const method =
    options.method || 'GET';


  const headers:
    Record<string, string> = {

    'Content-Type':
      'application/json',

    Accept:
      'application/json',

    ...options.headers,
  };


  // ==========================================================
  // CSRF
  // ==========================================================

  const unsafeMethods = [
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
  ];


  if (
    unsafeMethods.includes(
      method.toUpperCase()
    )
  ) {

    const token =
      getCsrfToken();


    if (token) {

      headers[
        'X-CSRF-TOKEN'
      ] = token;
    }
  }


  // ==========================================================
  // FETCH
  // ==========================================================

  let response: Response;


  try {

    response =
      await fetch(
        url,
        {
          method,

          headers,

          /*
           * Required for Spring Security
           * JSESSIONID authentication.
           */
          credentials:
            'include',

          body:
            options.body !== undefined
              ? JSON.stringify(
                  options.body
                )
              : undefined,
        }
      );

  } catch (error) {

    console.error(
      '[StaffHub API] Network error:',
      error
    );


    throw new ApiError(

      `Cannot connect to StaffHub backend. ` +
      `Make sure the backend and Cloudflare Tunnel are running.`,

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


    let responseBody:
      unknown = null;


    try {

      responseBody =
        responseText
          ? JSON.parse(
              responseText
            )
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

  if (
    response.status === 204
  ) {

    return undefined as T;
  }


  const responseText =
    await response.text();


  if (
    !responseText.trim()
  ) {

    return undefined as T;
  }


  // ==========================================================
  // JSON
  // ==========================================================

  try {

    return JSON.parse(
      responseText
    ) as T;

  } catch {

    return responseText as T;
  }
}


// ============================================================
// API URL
// ============================================================

export function getApiUrl(
  endpoint: string
): string {

  const cleanEndpoint =
    endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`;


  return `${
    API_BASE_URL
  }${cleanEndpoint}`;
}


export default {

  apiRequest,

  getApiUrl,

  API_BASE_URL,

  getCsrfToken,

  setCsrfToken,

  clearCsrfToken,
};
