import {
  apiRequest,
  setCsrfToken,
  clearCsrfToken,
} from '@/services/apiClient';

// ============================================================
// TYPES
// ============================================================

export interface AuthUser {

  id: string;

  email: string;

  role: string;

  employeeId: string;
}

export interface CurrentUser
  extends AuthUser {

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

interface LoginResponse
  extends BackendAuthUser { }

export interface RegisterPayload {

  companyName: string;

  companyEmail: string;

  companyPhone: string;

  companyAddress: string;

  industry: string;

  ownerFirstName: string;

  ownerLastName: string;

  ownerEmail: string;

  ownerPhone: string;

  password: string;

  confirmPassword: string;
}

interface CsrfResponse {

  token: string;
}

// ============================================================
// LOCAL USER CACHE
// ============================================================

const AUTH_USER_KEY =
  'staffhub_auth';

// ============================================================
// MAP BACKEND USER
// ============================================================

function mapBackendUser(
  user: BackendAuthUser
): CurrentUser {

  return {

    id: String(user.id),

    email: user.email,

    role: user.role,

    employeeId:
      user.employeeNumber ||
      String(user.employeeId),

    firstName:
      user.firstName,

    lastName:
      user.lastName,

    department:
      user.department,

    position:
      user.position,

    phone:
      user.phone || '',

    avatar:
      null,

    status:
      user.status || 'Active',
  };
}

// ============================================================
// CSRF
// ============================================================
//
// Always call this:
//
// 1. when application starts
// 2. after login
// 3. after registration
//
// Spring Security can clear the CSRF token during
// authentication, so obtaining a fresh token afterward
// is important.
// ============================================================

export async function initializeCsrf(): Promise<void> {

  const result =
    await apiRequest<CsrfResponse>(
      '/api/auth/csrf',
      {
        method: 'GET',
      }
    );

  if (
    !result ||
    !result.token
  ) {

    throw new Error(
      'StaffHub backend did not return a CSRF token.'
    );
  }

  setCsrfToken(
    result.token
  );
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

  // CSRF is not required by the backend
  // for /api/auth/login, but initializing it
  // here ensures the application has a token.
  await initializeCsrf();

  const result =
    await apiRequest<LoginResponse>(
      '/api/auth/login',
      {
        method: 'POST',

        body: {

          email:
            email
              .trim()
              .toLowerCase(),

          password,
        },
      }
    );

  const user =
    mapBackendUser(result);

  saveUser(user);

  // IMPORTANT:
  //
  // Spring Security authentication can clear
  // the previous CSRF token.
  //
  // Therefore obtain a fresh token after login.
  await initializeCsrf();

  return {
    user,
  };
}

// ============================================================
// REGISTER COMPANY OWNER
// ============================================================

export async function register(
  payload: RegisterPayload,
): Promise<{
  user: AuthUser;
}> {

  // Prepare a CSRF token/session before
  // registration.
  await initializeCsrf();

  const result =
    await apiRequest<LoginResponse>(
      '/api/auth/register',
      {
        method: 'POST',

        body: payload,
      }
    );

  const user =
    mapBackendUser(result);

  saveUser(user);

  // Registration creates the authenticated
  // session, so get a fresh CSRF token.
  await initializeCsrf();

  return {
    user,
  };
}

// ============================================================
// CURRENT USER
// ============================================================

export async function getCurrentUser():
  Promise<CurrentUser> {

  const result =
    await apiRequest<BackendAuthUser>(
      '/api/auth/me',
      {
        method: 'GET',
      }
    );

  const user =
    mapBackendUser(result);

  saveUser(user);

  // Restore CSRF token after a browser refresh.
  // The CSRF token is intentionally kept only in memory.
  await initializeCsrf();

  return user;
}

// ============================================================
// LOGOUT
// ============================================================

export async function logout():
  Promise<void> {

  try {

    await apiRequest<void>(
      '/api/auth/logout',
      {
        method: 'POST',
      }
    );

  } finally {

    localStorage.removeItem(
      AUTH_USER_KEY
    );

    clearCsrfToken();
  }
}

// ============================================================
// LOCAL USER CACHE
// ============================================================

export function saveUser(
  user: AuthUser
): void {

  localStorage.setItem(
    AUTH_USER_KEY,
    JSON.stringify(user)
  );
}

export function getSavedUser():
  AuthUser | null {

  const value =
    localStorage.getItem(
      AUTH_USER_KEY
    );

  if (!value) {

    return null;
  }

  try {

    return JSON.parse(
      value
    ) as AuthUser;

  } catch {

    localStorage.removeItem(
      AUTH_USER_KEY
    );

    return null;
  }
}

export function clearSavedUser(): void {

  localStorage.removeItem(
    AUTH_USER_KEY
  );
}

export function hasSession(): boolean {

  return Boolean(
    getSavedUser()
  );
}

// ============================================================
// PASSWORD RESET
// ============================================================
//
// Password reset is intentionally not mocked.
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