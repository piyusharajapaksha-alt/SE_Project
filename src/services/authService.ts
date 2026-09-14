// ============================================================
// STAFFHUB AUTH SERVICE
// DEVELOPMENT ONLY: authentication remains mocked until the
// Spring Boot authentication API is ready.
// No application/business data is mocked here.
// ============================================================

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

interface MockAuthAccount extends AuthUser {
  password: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  phone: string;
  avatar: string | null;
  status: string;
}

// The ONLY mock data intentionally kept in the frontend.
// These accounts exist only so the UI can be tested before backend auth exists.
const mockAuthAccounts: MockAuthAccount[] = [
  {
    id: 'USR001',
    email: 'employee@staffhub.com',
    password: 'demo123',
    role: 'Employee',
    employeeId: 'EMP001',
    firstName: 'Demo',
    lastName: 'Employee',
    department: 'Engineering',
    position: 'Software Engineer',
    phone: '',
    avatar: null,
    status: 'Active',
  },
  {
    id: 'USR002',
    email: 'hr@staffhub.com',
    password: 'demo123',
    role: 'HR Manager',
    employeeId: 'EMP002',
    firstName: 'Demo',
    lastName: 'HR Manager',
    department: 'Human Resources',
    position: 'HR Manager',
    phone: '',
    avatar: null,
    status: 'Active',
  },
  {
    id: 'USR003',
    email: 'manager@staffhub.com',
    password: 'demo123',
    role: 'Department Manager',
    employeeId: 'EMP003',
    firstName: 'Demo',
    lastName: 'Department Manager',
    department: 'Human Resources',
    position: 'Department Manager',
    phone: '',
    avatar: null,
    status: 'Active',
  },
  {
  id: 'USR004',
  email: 'training@staffhub.com',
  password: 'demo123',
  role: 'Training Coordinator',
  employeeId: 'EMP004',
  firstName: 'Demo',
  lastName: 'Training Coordinator',
  department: 'Human Resources',
  position: 'Training Coordinator',
  phone: '',
  avatar: null,
  status: 'Active',
},
{
  id: 'USR005',
  email: 'grievance@staffhub.com',
  password: 'demo123',
  role: 'Grievance Officer',
  employeeId: 'EMP005',
  firstName: 'Demo',
  lastName: 'Grievance Officer',
  department: 'Human Resources',
  position: 'Grievance Officer',
  phone: '',
  avatar: null,
  status: 'Active',
},
{
  id: 'USR006',
  email: 'event@staffhub.com',
  password: 'demo123',
  role: 'Event Organizer',
  employeeId: 'EMP006',
  firstName: 'Demo',
  lastName: 'Event Organizer',
  department: 'Human Resources',
  position: 'Event Organizer',
  phone: '',
  avatar: null,
  status: 'Active',
},
];

export async function login(
  email: string,
  password: string,
): Promise<{ user: AuthUser; token: string }> {
  const account = mockAuthAccounts.find(
    (item) => item.email === email.trim().toLowerCase() && item.password === password,
  );

  if (!account) {
    throw new Error('Invalid email or password');
  }

  const { password: _password, ...user } = account;

  return {
    user,
    token: `mock-auth-token-${account.id}`,
  };
}

export async function getCurrentUser(employeeId: string): Promise<CurrentUser> {
  const account = mockAuthAccounts.find((item) => item.employeeId === employeeId);

  if (!account) {
    throw new Error('Authenticated user profile not found');
  }

  const { password: _password, ...profile } = account;
  return profile;
}

export async function logout(): Promise<void> {
  localStorage.removeItem('staffhub_auth');
  localStorage.removeItem('staffhub_token');
}

export async function forgotPassword(_email: string): Promise<{ success: boolean; message: string }> {
  return {
    success: true,
    message: 'If an account with this email exists, a reset link has been sent.',
  };
}

export async function resetPassword(_token: string, _newPassword: string): Promise<{ success: boolean }> {
  return { success: true };
}

export function saveSession(user: AuthUser, token: string): void {
  localStorage.setItem('staffhub_auth', JSON.stringify(user));
  localStorage.setItem('staffhub_token', token);
}

export function getSavedSession(): { user: AuthUser; token: string } | null {
  const authStr = localStorage.getItem('staffhub_auth');
  const token = localStorage.getItem('staffhub_token');

  if (!authStr || !token) return null;

  try {
    return { user: JSON.parse(authStr) as AuthUser, token };
  } catch {
    return null;
  }
}

export function hasSession(): boolean {
  return Boolean(localStorage.getItem('staffhub_auth'));
}

export function getDemoAccounts(): { email: string; role: string }[] {
  return mockAuthAccounts.map(({ email, role }) => ({ email, role }));
}
