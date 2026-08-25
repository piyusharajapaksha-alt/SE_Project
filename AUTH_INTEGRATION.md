# Auth Integration Guide

## Current Authentication (Development Only)

The application currently uses **mock authentication**. User credentials are defined in `src/data/mock/index.ts` and authenticated through `src/services/authService.ts`.

### Mock User Accounts

```javascript
// src/data/mock/index.ts
export const mockUsers = [
  { id: 'USR001', email: 'employee@staffhub.com', password: 'demo123', role: 'Employee', employeeId: 'EMP001' },
  { id: 'USR002', email: 'hr@staffhub.com', password: 'demo123', role: 'HR Manager', employeeId: 'EMP002' },
  // ... more accounts
];
```

> ⚠️ NEVER use these credentials in production. They are for development/testing only.

### Session Storage (Development)

- User session is stored in `localStorage` under `staffhub_auth`
- Mock token is stored under `staffhub_token`
- This is NOT secure - it's only for development convenience

### Auth Flow (Current)

1. User enters email + password on `/login`
2. `authService.login()` checks against `mockUsers`
3. On success, saves to `localStorage` and `AuthContext`
4. `AuthContext` provides `user`, `profile`, `isAuthenticated`, `checkPermission()`
5. `ProtectedRoute` redirects unauthenticated users to `/login`

## Future Backend Authentication

### 1. Login API

```typescript
// src/services/authService.ts

// FUTURE: Replace mock login with API call
async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  
  const data = await response.json();
  // data should contain: { token, user: { id, email, role, employeeId } }
  return data;
}
```

### 2. Token Management

```typescript
// Store JWT token securely
function saveSession(user: AuthUser, token: string) {
  // Consider using httpOnly cookies instead of localStorage
  // for better security in production
  localStorage.setItem('staffhub_token', token);
  localStorage.setItem('staffhub_auth', JSON.stringify(user));
}

// Include token in API requests
function getAuthHeaders() {
  const token = localStorage.getItem('staffhub_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}
```

### 3. Session Validation

```typescript
// On app load, validate the token
async function validateSession() {
  const token = localStorage.getItem('staffhub_token');
  if (!token) return null;
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      // Token expired or invalid
      clearSession();
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
}
```

### 4. Logout

```typescript
async function logout() {
  // Call logout endpoint to invalidate token server-side
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  
  // Clear local session
  localStorage.removeItem('staffhub_auth');
  localStorage.removeItem('staffhub_token');
}
```

## Role-Based Access

### Role Definitions

Roles are defined in `src/config/index.ts`:

| Role | Description |
|------|-------------|
| Employee | Basic employee access |
| HR Manager | Full access to all modules |
| Department Manager | Department-level management |
| Training Coordinator | Training program management |
| Grievance Officer | Grievance resolution |
| Event Organizer | Event management |

### Permission System

Permissions are centralized in `src/config/index.ts`. **Never scatter role checks** like `if (user.role === 'HR Manager')` throughout the code. Instead use:

```typescript
// In components:
const { checkPermission } = useAuth();

// Check specific permission:
if (checkPermission('employees.create')) {
  // Show create button
}

// In route protection:
<PermissionRoute permission="employees.create">
  <CreateEmployeePage />
</PermissionRoute>
```

### Where to Update for Backend

1. **`src/services/authService.ts`** - Replace mock login/logout with API calls
2. **`src/contexts/AuthContext.tsx`** - Update to validate tokens on mount
3. **`src/services/apiClient.ts`** - Add authorization headers to all requests
4. **`src/routes/ProtectedRoute.tsx`** - Add token validation logic

### Security Notes

- Frontend role protection is **only for UI/UX**
- Real authorization MUST be enforced by the backend
- Never trust client-side permission checks for sensitive operations
- JWT tokens should have short expiration times
- Consider refresh token rotation for better security
