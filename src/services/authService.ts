import {
  apiRequest,
  setCsrfToken,
  clearCsrfToken,
} from '@/services/apiClient';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  ownerId?: string;
  accountType: 'OWNER' | 'EMPLOYEE';
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
  employeeId: number | null;
  ownerId: number | null;
  email: string;
  role: string;
  employeeNumber: string | null;
  firstName: string;
  lastName: string;
  department: string | null;
  position: string | null;
  phone: string | null;
  status: string;
  accountType: 'OWNER' | 'EMPLOYEE';
}

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

const AUTH_USER_KEY =
  'staffhub_auth';

function mapBackendUser(
  user: BackendAuthUser
): CurrentUser {

  return {
    id: String(user.id),

    email: user.email,

    role: user.role,

    employeeId:
      user.employeeNumber
        ? user.employeeNumber
        : '',

    ownerId:
      user.ownerId != null
        ? String(user.ownerId)
        : undefined,

    accountType:
      user.accountType,

    firstName:
      user.firstName,

    lastName:
      user.lastName,

    department:
      user.department || '',

    position:
      user.position || '',

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

export async function initializeCsrf(): Promise<void> {

  const result =
    await apiRequest<CsrfResponse>(
      '/api/auth/csrf',
      {
        method: 'GET',
      }
    );

  if (!result?.token) {

    throw new Error(
      'StaffHub backend did not return a CSRF token.'
    );
  }

  setCsrfToken(result.token);
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

  await initializeCsrf();

  const result =
    await apiRequest<BackendAuthUser>(
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

  await initializeCsrf();

  return {
    user,
  };
}

// ============================================================
// REGISTER OWNER
// ============================================================

export async function register(
  payload: RegisterPayload,
): Promise<{
  user: AuthUser;
}> {

  await initializeCsrf();

  const result =
    await apiRequest<BackendAuthUser>(
      '/api/auth/register',
      {
        method: 'POST',
        body: payload,
      }
    );

  const user =
    mapBackendUser(result);

  saveUser(user);

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

    clearSavedUser();
    clearCsrfToken();
  }
}

// ============================================================
// LOCAL CACHE
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

    clearSavedUser();

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