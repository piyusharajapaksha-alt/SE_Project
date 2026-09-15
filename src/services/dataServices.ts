import { apiRequest } from './apiClient';

type Filters = Record<string, string | boolean | number | undefined>;

const queryString = (filters?: Filters) => {
  if (!filters) return '';
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== 'All') {
      params.set(key, String(value));
    }
  });
  const query = params.toString();
  return query ? `?${query}` : '';
};

const empty = async <T,>(request: Promise<T>, fallback: T): Promise<T> => {
  try {
    return await request;
  } catch (error) {
    console.error('API request failed:', error);
    return fallback;
  }
};

export const employeeService = {
  getAll: (filters?: Filters) => empty(apiRequest<any[]>(`/api/employees${queryString(filters)}`), []),
  getById: (id: string | number) => empty(apiRequest<any>(`/api/employees/${id}`), null),
  create: (data: any) => apiRequest<any>('/api/employees', { method: 'POST', body: data }),
  update: (id: string | number, data: any) => apiRequest<any>(`/api/employees/${id}`, { method: 'PUT', body: data }),
  delete: (id: string | number) => apiRequest<void>(`/api/employees/${id}`, { method: 'DELETE' }),
};

export const attendanceService = {
  getAll: (filters?: Filters) => empty(apiRequest<any[]>(`/api/attendance${queryString(filters)}`), []),
  getByEmployee: (employeeId: string) => empty(apiRequest<any[]>(`/api/attendance/employee/${employeeId}`), []),
  getSummary: (employeeId: string) => empty(apiRequest<any>(`/api/attendance/employee/${employeeId}/summary`), {}),
};

export const leaveService = {
  getAll: (filters?: Filters) =>
    apiRequest<any[]>(
      `/api/leave${queryString(filters)}`
    ),

  getBalance: (employeeId: string) =>
    apiRequest<any>(
      `/api/leave/balance/${employeeId}`
    ),

  create: (data: any) =>
    apiRequest<any>(
      '/api/leave',
      {
        method: 'POST',
        body: data,
      }
    ),

  approve: (
    id: string | number,
    comment = '',
    approverId = ''
  ) =>
    apiRequest<any>(
      `/api/leave/${id}/approve`,
      {
        method: 'PUT',
        body: {
          comment,
          approverId,
        },
      }
    ),

  reject: (
    id: string | number,
    comment = '',
    approverId = ''
  ) =>
    apiRequest<any>(
      `/api/leave/${id}/reject`,
      {
        method: 'PUT',
        body: {
          comment,
          approverId,
        },
      }
    ),

  cancel: (id: string | number) =>
    apiRequest<any>(
      `/api/leave/${id}/cancel`,
      {
        method: 'PUT',
      }
    ),
};

export const performanceService = {
  getAll: (filters?: Filters) => empty(apiRequest<any[]>(`/api/performance${queryString(filters)}`), []),
  getByEmployee: (employeeId: string) => empty(apiRequest<any[]>(`/api/performance/employee/${employeeId}`), []),
};

export const eventService = {
  getAll: (filters?: Filters) => empty(apiRequest<any[]>(`/api/events${queryString(filters)}`), []),
  getById: (id: string | number) => empty(apiRequest<any>(`/api/events/${id}`), null),
  create: (data: any) => apiRequest<any>('/api/events', { method: 'POST', body: data }),
  update: (id: string | number, data: any) => apiRequest<any>(`/api/events/${id}`, { method: 'PUT', body: data }),
  delete: (id: string | number) => apiRequest<void>(`/api/events/${id}`, { method: 'DELETE' }),
  register: (id: string | number, employeeId: string) => apiRequest<any>(`/api/events/${id}/register`, { method: 'POST', body: { employeeId } }),
  unregister: (id: string | number, employeeId: string) => apiRequest<any>(`/api/events/${id}/register/${employeeId}`, { method: 'DELETE' }),
};

export const grievanceService = {
  getAll: (filters?: Filters) => empty(apiRequest<any[]>(`/api/grievances${queryString(filters)}`), []),
  create: (data: any) => apiRequest<any>('/api/grievances', { method: 'POST', body: data }),
  addResponse: (id: string | number, employeeId: string, response: string) => apiRequest<any>(`/api/grievances/${id}/responses`, { method: 'POST', body: { employeeId, response } }),
  updateStatus: (id: string | number, status: string) => apiRequest<any>(`/api/grievances/${id}/status`, { method: 'PUT', body: { status } }),
};

export const notificationService = {
  getAll: (employeeId: string, filters?: Filters) => empty(apiRequest<any[]>(`/api/notifications/${employeeId}${queryString(filters)}`), []),
  markRead: (id: string | number) => apiRequest<any>(`/api/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: (employeeId: string) => apiRequest<any>(`/api/notifications/${employeeId}/read-all`, { method: 'PUT' }),
};

export const dashboardService = {
  getEmployeeDashboard: (employeeId: string) => empty(apiRequest<any>(`/api/dashboard/employee/${employeeId}`), {
    todayAttendance: null,
    attendanceSummary: {},
    leaveBalance: {},
    recentLeaveRequests: [],
    upcomingTraining: [],
    upcomingEvents: [],
  }),
};
