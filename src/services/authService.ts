import { apiRequest } from '@/services/apiClient';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  employeeId: string;
}

export interface CurrentUser extends AuthUser {
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  phone: string;
  avatar: string | null;
  status: string;
}

interface BackendAuthUser {
  id: number;
  employeeId: number;
  email: string;
  role: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  phone: string;
  status: string;
}

interface LoginResponse extends BackendAuthUser {}

const AUTH_USER_KEY = 'staffhub_auth';

function mapBackendUser(user: BackendAuthUser): CurrentUser {
  return {
    id: String(user.id),
    email: user.email,
    role: user.role,
    employeeId: user.employeeNumber || String(user.employeeId),

    firstName: user.firstName,
    lastName: user.lastName,
    department: user.department,
    position: user.position,
    phone: user.phone || '',
    avatar: null,
    status: user.status || 'Active',
  };
}

// ============================================================
// CSRF
// ============================================================

function getCookie(name: string): string | null {
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.trim().split('=');

    if (key === name) {
      return decodeURIComponent(valueParts.join('='));
    }
  }

  return null;
}

export async function initializeCsrf(): Promise<void> {
  await apiRequest<void>('/api/auth/csrf', {
    method: 'GET',
  });
}

export function getCsrfToken(): string | null {
  return getCookie('XSRF-TOKEN');
}

// ============================================================
// LOGIN
// ============================================================

export async function login(
  email: string,
  password: string,
): Promise<{
  user: AuthUser;
}> {

  // Make sure the browser has a CSRF token
  // before the login POST request.
  await initializeCsrf();

  const csrfToken = getCsrfToken();

  const result = await apiRequest<LoginResponse>(
    '/api/auth/login',
    {
      method: 'POST',

      headers: csrfToken
        ? {
            'X-XSRF-TOKEN': csrfToken,
          }
        : undefined,

      body: {
        email: email.trim().toLowerCase(),
        password,
      },
    }
  );

  const user = mapBackendUser(result);

  saveUser(user);

  // Spring Security rotates/clears the CSRF token
  // around authentication, so obtain a fresh one.
  await initializeCsrf();

  return { user };
}

// ============================================================
// CURRENT USER
// ============================================================

export async function getCurrentUser(): Promise<CurrentUser> {

  const result = await apiRequest<BackendAuthUser>(
    '/api/auth/me',
    {
      method: 'GET',
    }
  );

  const user = mapBackendUser(result);

  saveUser(user);

  return user;
}

// ============================================================
// LOGOUT
// ============================================================

export async function logout(): Promise<void> {

  const csrfToken = getCsrfToken();

  try {

    await apiRequest<void>(
      '/api/auth/logout',
      {
        method: 'POST',

        headers: csrfToken
          ? {
              'X-XSRF-TOKEN': csrfToken,
            }
          : undefined,
      }
    );

  } finally {

    localStorage.removeItem(AUTH_USER_KEY);

    document.cookie =
      'XSRF-TOKEN=; Max-Age=0; path=/;';
  }
}

// ============================================================
// LOCAL USER CACHE
// ============================================================

export function saveUser(user: AuthUser): void {

  localStorage.setItem(
    AUTH_USER_KEY,
    JSON.stringify(user)
  );
}

export function getSavedUser(): AuthUser | null {

  const value =
    localStorage.getItem(AUTH_USER_KEY);

  if (!value) {
    return null;
  }

  try {

    return JSON.parse(value) as AuthUser;

  } catch {

    localStorage.removeItem(AUTH_USER_KEY);

    return null;
  }
}

export function clearSavedUser(): void {
  localStorage.removeItem(AUTH_USER_KEY);
}

export function hasSession(): boolean {
  return Boolean(getSavedUser());
}

// ============================================================
// PASSWORD RESET
// ============================================================
//
// Password reset is intentionally not mocked anymore.
// A real email/reset-token workflow should be connected before
// showing "reset link sent" as a real email operation.
// ============================================================

export async function forgotPassword(
  _email: string
): Promise<{
  success: boolean;
  message: string;
}> {

  throw new Error(
    'Password reset email service is not configured yet. Please contact your HR administrator.'
  );
}

export async function resetPassword(
  _token: string,
  _newPassword: string
): Promise<{
  success: boolean;
}> {

  throw new Error(
    'Password reset service is not configured yet.'
  );
}