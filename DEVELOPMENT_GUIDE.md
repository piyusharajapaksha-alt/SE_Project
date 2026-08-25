# Development Guide

This guide explains the architecture of StaffHub and how to extend it.

## How Routing Works

Routing is defined in `src/App.tsx` using React Router.

### Route Structure

```
/                      → Redirects to /dashboard
/login                 → Login page (public)
/forgot-password       → Forgot password (public)
/dashboard             → Role-specific dashboard (protected)
/employees             → Employee list (protected)
/employees/create      → Create employee (protected)
/employees/:id         → Employee detail (protected)
/employees/:id/edit    → Edit employee (protected)
/attendance            → Attendance (protected)
/leave                 → Leave management (protected)
/performance           → Performance (protected)
/training              → Training (protected)
/events                → Events (protected)
/grievances            → Grievances (protected)
/notifications         → Notifications (protected)
/reports               → Reports (protected)
/profile               → Profile (protected)
/settings              → Settings (protected)
```

### Adding a New Page

1. Create a new file in `src/pages/yourModule/YourPage.tsx`
2. Import it in `src/App.tsx`
3. Add a `<Route>` inside the protected routes section
4. Add a navigation item in `src/config/index.ts` NAV_ITEMS array

### Protected Routes

Use `<ProtectedRoute>` to require authentication:

```tsx
<Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
  {/* Protected routes go here */}
</Route>
```

For permission-specific routes, use `<PermissionRoute>`:

```tsx
<Route path="/employees/create" element={
  <PermissionRoute permission="employees.create">
    <EmployeeFormPage />
  </PermissionRoute>
} />
```

## How Authentication Works

### Current (Mock)

1. User enters credentials on `/login`
2. `authService.login()` checks against mock users
3. On success, `AuthContext` stores the user and profile
4. Session is saved to `localStorage` for persistence
5. `ProtectedRoute` redirects to `/login` if not authenticated

### Auth Context

Access authentication state in any component:

```tsx
const { user, profile, isAuthenticated, login, logout, checkPermission } = useAuth();
```

- `user` - Current auth user (id, email, role, employeeId)
- `profile` - Full user profile (name, department, position, etc.)
- `isAuthenticated` - Whether user is logged in
- `checkPermission(permission)` - Check if user has a specific permission

## How Role Permissions Work

### Centralized Configuration

All permissions are defined in `src/config/index.ts`:

```typescript
export const PERMISSIONS = {
  'employees.view': [ROLES.HR_MANAGER, ROLES.DEPT_MANAGER],
  'employees.create': [ROLES.HR_MANAGER],
  // ...
};
```

### Checking Permissions

In components, use the `checkPermission` function from `useAuth()`:

```tsx
const { checkPermission } = useAuth();

// Show a button only if user has permission
{checkPermission('employees.create') && (
  <button>Create Employee</button>
)}
```

### Adding a New Permission

1. Add the permission to `PERMISSIONS` in `src/config/index.ts`
2. Specify which roles have this permission
3. Use `checkPermission('your.new.permission')` in components

### Adding a New Role

1. Add the role to `ROLES` in `src/config/index.ts`
2. Add the role to relevant `PERMISSIONS` entries
3. Add a mock user with this role in `src/data/mock/index.ts`
4. Add role-specific dashboard section in `src/pages/dashboard/DashboardPage.tsx`

## How Mock Data Works

### Data Location

All mock data is in `src/data/mock/index.ts`:

- `mockUsers` - Login accounts
- `mockEmployees` - Employee records
- `mockDepartments` - Department records
- `mockAttendance` - Attendance records
- `mockLeaveRequests` - Leave requests
- `mockPerformance` - Performance reviews
- `mockTraining` - Training programs
- `mockEvents` - Events
- `mockGrievances` - Grievances
- `mockNotifications` - Notifications
- `mockDashboardStats` - Dashboard statistics

### Data Relationships

All mock data uses IDs to create relationships:

```
Employee EMP001 → Attendance records with employeeId: "EMP001"
Employee EMP001 → Leave requests with employeeId: "EMP001"
Training TRN001 → Participants: ["EMP001", "EMP006", ...]
Event EVT001 → registeredIds: ["EMP001", "EMP002", ...]
```

This makes future backend integration easier.

### Modifying Mock Data

Edit `src/data/mock/index.ts` and add/modify records. Make sure IDs and relationships are consistent.

## How Services Work

### Service Layer

Services in `src/services/` are the **only** way components access data. This abstraction allows switching from mock data to real API without changing any UI code.

### Service Pattern

```typescript
// Current: Mock implementation
async getAll(filters?: {...}) {
  await delay(); // Simulate network
  let result = clone(_data); // Deep clone to avoid mutation
  // Apply filters
  return result;
}

// Future: API implementation
async getAll(filters?: {...}) {
  const response = await fetch(`${API_BASE_URL}/endpoint`);
  return response.json();
}
```

### Adding a New Service

1. Add mock data to `src/data/mock/index.ts`
2. Add service methods to `src/services/dataServices.ts`
3. Import and use the service in your page component
4. Add comments marking where to replace with API calls

## How to Add a New Page

1. Create the page component in `src/pages/yourModule/YourPage.tsx`
2. Use the `PageHeader`, `SearchInput`, `SelectFilter`, `Badge`, `Pagination`, etc. from `@/components/ui`
3. Call your service methods for data
4. Add the route in `src/App.tsx`
5. Add navigation in `src/config/index.ts`

Example minimal page:

```tsx
import { useState, useEffect } from 'react';
import { PageHeader, LoadingState } from '@/components/ui';

export default function MyPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    myService.getAll().then(result => {
      setData(result);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="My Page" description="My page description" />
      {/* Your content */}
    </div>
  );
}
```

## How to Connect the Future Backend

1. Create `.env` with `VITE_API_BASE_URL=http://localhost:8080/api`
2. In each service, replace mock implementations with fetch calls
3. Add authorization headers using the JWT token
4. Handle errors consistently (throw Error with message)
5. Test each endpoint integration one at a time

See `API_INTEGRATION.md` for detailed endpoint documentation.

## How to Edit the Design

### Colors

The design uses Tailwind CSS. Key color references:

- **Primary**: `indigo-600` (buttons, links, active states)
- **Success**: `green-600` (approved, present, completed)
- **Warning**: `amber-600` (pending, late)
- **Danger**: `red-600` (rejected, absent, delete)
- **Background**: `gray-50` (page background)
- **Cards**: `white` with `border-gray-200`

### Key Reusable Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `PageHeader` | `components/ui` | Page title + action button |
| `StatCard` | `components/ui` | Dashboard statistic card |
| `Badge` | `components/ui` | Status badges |
| `Modal` | `components/ui` | Dialog/modal |
| `ConfirmDialog` | `components/ui` | Delete/action confirmation |
| `SearchInput` | `components/ui` | Search box |
| `SelectFilter` | `components/ui` | Dropdown filter |
| `Pagination` | `components/ui` | Page navigation |
| `LoadingState` | `components/ui` | Loading spinner |
| `EmptyState` | `components/ui` | No data message |
| `Tabs` | `components/ui` | Tab navigation |

### Adding Global Styles

Edit `src/index.css` for global Tailwind customizations.

## Tips

- Use `useToast()` for user notifications (success, error, warning, info)
- Use `ConfirmDialog` before destructive actions (delete, cancel)
- Use `LoadingState` while fetching data
- Use `EmptyState` when no data matches filters
- Use `Badge` with `dot` prop for status indicators
- Filter and paginate data on the frontend for mock mode
- Backend should handle filtering and pagination in API mode
