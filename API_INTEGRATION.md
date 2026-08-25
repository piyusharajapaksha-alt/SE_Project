# API Integration Guide

## Current Architecture

The frontend currently operates in **MOCK MODE**. All data comes from `src/data/mock/index.ts` and is served through the service layer in `src/services/`.

### Data Flow (Current)

```
React Component → Service → Mock Data
```

### Data Flow (Future with Backend)

```
React Component → Service → REST API → Spring Boot → Database
```

## How to Switch to API Mode

### 1. Set Environment Variable

Create a `.env` file:

```env
VITE_DATA_MODE=api
VITE_API_BASE_URL=http://localhost:8080/api
```

### 2. Update Each Service

Each service in `src/services/` has comments marking where to replace mock implementations with API calls.

Example for `employeeService`:

```typescript
// CURRENT (Mock):
async getAll(filters?: {...}) {
  await delay();
  let result = clone(_employees);
  // ... filter logic ...
  return result;
}

// FUTURE (API):
async getAll(filters?: {...}) {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.department) params.set('department', filters.department);
  if (filters?.status) params.set('status', filters.status);
  const response = await fetch(`${API_BASE_URL}/employees?${params}`);
  if (!response.ok) throw new Error('Failed to fetch employees');
  return response.json();
}
```

## Required Backend API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/logout` | Invalidate session |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET | `/api/auth/me` | Get current user |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List employees (with query filters) |
| GET | `/api/employees/:id` | Get employee details |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance` | List attendance records |
| GET | `/api/attendance/employee/:id` | Get employee attendance |
| PUT | `/api/attendance/:id` | Update attendance record |
| DELETE | `/api/attendance/:id` | Delete attendance record |

### Leave
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leave` | List leave requests |
| GET | `/api/leave/balance/:employeeId` | Get leave balance |
| POST | `/api/leave` | Create leave request |
| PUT | `/api/leave/:id/approve` | Approve leave request |
| PUT | `/api/leave/:id/reject` | Reject leave request |
| PUT | `/api/leave/:id/cancel` | Cancel leave request |

### Performance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/performance` | List performance reviews |
| GET | `/api/performance/employee/:id` | Get employee reviews |
| POST | `/api/performance` | Create review |
| PUT | `/api/performance/:id` | Update review |

### Training
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/training` | List training programs |
| GET | `/api/training/:id` | Get training details |
| POST | `/api/training` | Create training |
| PUT | `/api/training/:id` | Update training |
| DELETE | `/api/training/:id` | Delete training |
| POST | `/api/training/:id/register` | Register for training |
| POST | `/api/training/:id/unregister` | Unregister from training |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List events |
| GET | `/api/events/:id` | Get event details |
| POST | `/api/events` | Create event |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |
| POST | `/api/events/:id/register` | Register for event |
| POST | `/api/events/:id/unregister` | Unregister from event |

### Grievances
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/grievances` | List grievances |
| GET | `/api/grievances/:id` | Get grievance details |
| POST | `/api/grievances` | Submit grievance |
| PUT | `/api/grievances/:id/status` | Update status |
| POST | `/api/grievances/:id/respond` | Add response |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get role-specific dashboard data |

## Service Files Location

| Service | File | Current Mode |
|---------|------|-------------|
| Auth | `src/services/authService.ts` | Mock |
| Employees | `src/services/dataServices.ts` | Mock |
| Attendance | `src/services/dataServices.ts` | Mock |
| Leave | `src/services/dataServices.ts` | Mock |
| Performance | `src/services/dataServices.ts` | Mock |
| Training | `src/services/dataServices.ts` | Mock |
| Events | `src/services/dataServices.ts` | Mock |
| Grievances | `src/services/dataServices.ts` | Mock |
| Notifications | `src/services/dataServices.ts` | Mock |
| Dashboard | `src/services/dataServices.ts` | Mock |

## Important Notes

1. **Components don't know the data source** - They only call services
2. **Mock data is interconnected** - IDs reference real employees
3. **Mock CRUD updates state** - Changes persist during the session
4. **API client is ready** - `src/services/apiClient.ts` has the base setup
