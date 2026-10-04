import { apiRequest } from './apiClient';

type Filters = Record<
  string,
  string | boolean | number | undefined
>;

// ============================================================
// QUERY STRING
// ============================================================

const queryString = (
  filters?: Filters
): string => {
  if (!filters) {
    return '';
  }

  const params = new URLSearchParams();

  Object.entries(filters).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== '' &&
        value !== 'All'
      ) {
        params.set(
          key,
          String(value)
        );
      }
    }
  );

  const query =
    params.toString();

  return query
    ? `?${query}`
    : '';
};

// ============================================================
// EMPLOYEE
// ============================================================

export const employeeService = {
  getAll: (
    filters?: Filters
  ) =>
    apiRequest<any[]>(
      `/api/employees${queryString(filters)}`
    ),

  getById: (
    id: string | number
  ) =>
    apiRequest<any>(
      `/api/employees/${id}`
    ),

  // ----------------------------------------------------------
  // Get recommended next employee number
  // ----------------------------------------------------------

  getNextNumber: () =>
    apiRequest<{
      employeeNumber: string;
    }>(
      '/api/employees/next-number'
    ),

  // ----------------------------------------------------------
  // Create
  // ----------------------------------------------------------

  create: (
    data: any
  ) =>
    apiRequest<any>(
      '/api/employees',
      {
        method: 'POST',
        body: data,
      }
    ),

  // ----------------------------------------------------------
  // Update
  // ----------------------------------------------------------

  update: (
    id: string | number,
    data: any
  ) =>
    apiRequest<any>(
      `/api/employees/${id}`,
      {
        method: 'PUT',
        body: data,
      }
    ),

  // ----------------------------------------------------------
  // Delete
  // ----------------------------------------------------------

  delete: (
    id: string | number
  ) =>
    apiRequest<void>(
      `/api/employees/${id}`,
      {
        method: 'DELETE',
      }
    ),
};

// ============================================================
// ATTENDANCE
// ============================================================

export const attendanceService = {
  /*
   * IMPORTANT
   *
   * The backend does NOT expose:
   *
   * GET /api/attendance
   *
   * The correct endpoint for date-based attendance records is:
   *
   * GET /api/attendance/records?date=YYYY-MM-DD
   *
   * This method is kept because existing dashboard and
   * management pages already use attendanceService.getAll().
   */

  getAll: (
    filters?: Filters
  ) =>
    apiRequest<any[]>(
      `/api/attendance/records${queryString(filters)}`
    ),

  // ----------------------------------------------------------
  // Company attendance records
  // ----------------------------------------------------------

  getRecords: (
    date?: string
  ) =>
    apiRequest<any[]>(
      `/api/attendance/records${
        date
          ? `?date=${encodeURIComponent(date)}`
          : ''
      }`
    ),

  // ----------------------------------------------------------
  // Employee attendance history
  // ----------------------------------------------------------

  getByEmployee: (
    employeeId: string
  ) =>
    apiRequest<any[]>(
      `/api/attendance/employee/${encodeURIComponent(
        employeeId
      )}`
    ),

  // ----------------------------------------------------------
  // Employee today's attendance
  // ----------------------------------------------------------

  getToday: (
    employeeId: string
  ) =>
    apiRequest<any>(
      `/api/attendance/employee/${encodeURIComponent(
        employeeId
      )}/today`
    ),

  // ----------------------------------------------------------
  // Company attendance summary
  // ----------------------------------------------------------

  getSummary: (
    date?: string
  ) =>
    apiRequest<any>(
      `/api/attendance/summary${
        date
          ? `?date=${encodeURIComponent(date)}`
          : ''
      }`
    ),
};

// ============================================================
// LEAVE
// ============================================================

export const leaveService = {
  getAll: (
    filters?: Filters
  ) =>
    apiRequest<any[]>(
      `/api/leave${queryString(filters)}`
    ),

  getBalance: (
    employeeId: string
  ) =>
    apiRequest<any>(
      `/api/leave/balance/${encodeURIComponent(
        employeeId
      )}`
    ),

  create: (
    data: {
      employeeId: string;
      type: string;
      startDate: string;
      endDate: string;
      reason: string;
      approverId?: string;
    }
  ) =>
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

  cancel: (
    id: string | number
  ) =>
    apiRequest<any>(
      `/api/leave/${id}/cancel`,
      {
        method: 'PUT',
      }
    ),
};

// ============================================================
// PERFORMANCE
// ============================================================

export const performanceService = {
  getAll: (
    filters?: Filters
  ) =>
    apiRequest<any[]>(
      `/api/performance${queryString(filters)}`
    ),

  getByEmployee: (
    employeeId: string
  ) =>
    apiRequest<any[]>(
      `/api/performance/employee/${encodeURIComponent(
        employeeId
      )}`
    ),
};

// ============================================================
// TRAINING
// ============================================================

export const trainingService = {
  getAll: () =>
    apiRequest<any[]>(
      '/api/training'
    ),

  getById: (
    id: string | number
  ) =>
    apiRequest<any>(
      `/api/training/${id}`
    ),

  getEmployees: (
    id: string | number
  ) =>
    apiRequest<any[]>(
      `/api/training/${id}/employees`
    ),

  create: (
    data: any
  ) =>
    apiRequest<any>(
      '/api/training',
      {
        method: 'POST',
        body: data,
      }
    ),

  update: (
    id: string | number,
    data: any
  ) =>
    apiRequest<any>(
      `/api/training/${id}`,
      {
        method: 'PUT',
        body: data,
      }
    ),

  delete: (
    id: string | number
  ) =>
    apiRequest<void>(
      `/api/training/${id}`,
      {
        method: 'DELETE',
      }
    ),

  register: (
    id: string | number,
    employeeId: string
  ) =>
    apiRequest<void>(
      `/api/training/${id}/register`,
      {
        method: 'POST',
        body: {
          employeeId,
        },
      }
    ),

  unregister: (
    id: string | number,
    employeeId: string
  ) =>
    apiRequest<void>(
      `/api/training/${id}/register/${encodeURIComponent(
        employeeId
      )}`,
      {
        method: 'DELETE',
      }
    ),
};

// ============================================================
// EVENTS
// ============================================================

export const eventService = {
  getAll: (
    filters?: Filters
  ) =>
    apiRequest<any[]>(
      `/api/events${queryString(filters)}`
    ),

  getById: (
    id: string | number,
    employeeId?: string
  ) =>
    apiRequest<any>(
      `/api/events/${id}${queryString({
        employeeId,
      })}`
    ),

  create: (
    data: any
  ) =>
    apiRequest<any>(
      '/api/events',
      {
        method: 'POST',
        body: data,
      }
    ),

  update: (
    id: string | number,
    data: any
  ) =>
    apiRequest<any>(
      `/api/events/${id}`,
      {
        method: 'PUT',
        body: data,
      }
    ),

  delete: (
    id: string | number
  ) =>
    apiRequest<void>(
      `/api/events/${id}`,
      {
        method: 'DELETE',
      }
    ),

  register: (
    id: string | number,
    employeeId: string
  ) =>
    apiRequest<void>(
      `/api/events/${id}/register`,
      {
        method: 'POST',
        body: {
          employeeId,
        },
      }
    ),

  unregister: (
    id: string | number,
    employeeId: string
  ) =>
    apiRequest<void>(
      `/api/events/${id}/register/${encodeURIComponent(
        employeeId
      )}`,
      {
        method: 'DELETE',
      }
    ),
};

// ============================================================
// GRIEVANCES
// ============================================================

export const grievanceService = {
  getAll: (
    filters?: Filters
  ) =>
    apiRequest<any[]>(
      `/api/grievances${queryString(filters)}`
    ),

  create: (
    data: any
  ) =>
    apiRequest<any>(
      '/api/grievances',
      {
        method: 'POST',
        body: data,
      }
    ),

  addResponse: (
    id: string | number,
    employeeId: string,
    response: string
  ) =>
    apiRequest<any>(
      `/api/grievances/${id}/responses`,
      {
        method: 'POST',
        body: {
          employeeId,
          text: response,
        },
      }
    ),

  updateStatus: (
    id: string | number,
    status: string,
    updatedBy = ''
  ) =>
    apiRequest<any>(
      `/api/grievances/${id}/status`,
      {
        method: 'PUT',
        body: {
          status,
          updatedBy,
        },
      }
    ),
};

// ============================================================
// NOTIFICATIONS
// ============================================================
//
// Kept for compatibility with existing frontend code.
// The current backend does not expose a working notification
// controller, so existing pages should not depend on these
// methods for dashboard loading.
//

export const notificationService = {
  getAll: (
    employeeId: string,
    filters?: Filters
  ) =>
    apiRequest<any[]>(
      `/api/notifications/${encodeURIComponent(
        employeeId
      )}${queryString(filters)}`
    ),

  markRead: (
    id: string | number
  ) =>
    apiRequest<any>(
      `/api/notifications/${id}/read`,
      {
        method: 'PUT',
      }
    ),

  markAllRead: (
    employeeId: string
  ) =>
    apiRequest<any>(
      `/api/notifications/${encodeURIComponent(
        employeeId
      )}/read-all`,
      {
        method: 'PUT',
      }
    ),
};

// ============================================================
// DASHBOARD
// ============================================================
//
// The current backend does not expose:
//
// /api/dashboard/employee/{employeeId}
//
// Therefore the dashboard is assembled from the existing
// module APIs.
//

export const dashboardService = {
  getEmployeeDashboard: async (
    employeeId: string
  ) => {
    const [
      attendance,
      leaves,
      balance,
      performance,
      training,
      events,
      grievances,
    ] = await Promise.all([
      attendanceService.getByEmployee(
        employeeId
      ),

      leaveService.getAll({
        employeeId,
      }),

      leaveService.getBalance(
        employeeId
      ),

      performanceService.getByEmployee(
        employeeId
      ),

      trainingService.getAll(),

      eventService.getAll({
        employeeId,
      }),

      grievanceService.getAll({
        employeeId,
      }),
    ]);

    return {
      attendance,
      leaves,
      balance,
      performance,
      training,
      events,
      grievances,
    };
  },
};
