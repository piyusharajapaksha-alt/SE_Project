// ============================================================
// AUTH SERVICE - Authentication and session management
// DEVELOPMENT ONLY: Currently uses mock data for authentication.
// WHEN THE BACKEND IS READY, replace mock implementations with:
//   POST /api/auth/login
//   POST /api/auth/logout
//   POST /api/auth/forgot-password
//   POST /api/auth/reset-password
//   GET  /api/auth/me (current user)
// ============================================================

import { mockUsers, mockEmployees } from '@/data/mock';

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

// Simulate network delay for realistic UX
/*
function delay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
  example for how to use this funtion -  await delay(800);
*/
  

// DEVELOPMENT ONLY: Mock login
// FUTURE BACKEND: POST /api/auth/login with { email, password }
// The backend should return a JWT token and user info
export async function login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  

  const mockUser = mockUsers.find((u) => u.email === email && u.password === password);
  if (!mockUser) {
    throw new Error('Invalid email or password');
  }

  // DEVELOPMENT ONLY: Generate a fake token
  // FUTURE BACKEND: Use real JWT token from the server
  const token = `mock-token-${mockUser.id}-${Date.now()}`;

  return {
    user: {
      id: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
      employeeId: mockUser.employeeId,
    },
    token,
  };
}

// Get full current user profile
// FUTURE BACKEND: GET /api/auth/me (with Authorization header)
export async function getCurrentUser(employeeId: string): Promise<CurrentUser> {
  

  const employee = mockEmployees.find((e) => e.id === employeeId);
  if (!employee) {
    throw new Error('Employee not found');
  }

  return {
    id: employeeId,
    email: employee.email,
    role: employee.role,
    employeeId: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    department: employee.department,
    position: employee.position,
    phone: employee.phone,
    avatar: employee.avatar,
    status: employee.status,
  };
}

// Logout
// FUTURE BACKEND: POST /api/auth/logout (invalidate token)
export async function logout(): Promise<void> {
 
  // Clear development session from localStorage
  localStorage.removeItem('staffhub_auth');
  localStorage.removeItem('staffhub_token');
}

// Forgot password
// FUTURE BACKEND: POST /api/auth/forgot-password with { email }
export async function forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
  
  const user = mockUsers.find((u) => u.email === email);
  if (!user) {
    // Don't reveal whether email exists for security
    return { success: true, message: 'If an account with this email exists, a reset link has been sent.' };
  }
  return { success: true, message: 'If an account with this email exists, a reset link has been sent.' };
}

// Reset password
// FUTURE BACKEND: POST /api/auth/reset-password with { token, newPassword }
export async function resetPassword(_token: string, _newPassword: string): Promise<{ success: boolean }> {
 
  // DEVELOPMENT: Always succeeds
  return { success: true };
}

// Save development session
// DEVELOPMENT ONLY - Replace with secure token storage when backend is ready
export function saveSession(user: AuthUser, token: string): void {
  localStorage.setItem('staffhub_auth', JSON.stringify(user));
  localStorage.setItem('staffhub_token', token);
}

// Get saved session
// DEVELOPMENT ONLY
export function getSavedSession(): { user: AuthUser; token: string } | null {
  const authStr = localStorage.getItem('staffhub_auth');
  const token = localStorage.getItem('staffhub_token');
  if (authStr && token) {
    try {
      return { user: JSON.parse(authStr), token };
    } catch {
      return null;
    }
  }
  return null;
}

// Check if session exists
export function hasSession(): boolean {
  return !!localStorage.getItem('staffhub_auth');
}

// Get demo accounts for development
// DEVELOPMENT ONLY - Remove in production
export function getDemoAccounts(): { email: string; role: string }[] {
  return mockUsers.map((u) => ({ email: u.email, role: u.role }));
}
