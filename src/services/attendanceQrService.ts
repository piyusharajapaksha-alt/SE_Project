import { apiRequest } from './apiClient';

export interface AttendanceMonitor {
  id: number;
  activationCode: string;
  active: boolean;
  activationType: 'MANUAL' | 'SCHEDULE' | string;
  activatedBy: string | null;
  activatedAt: string | null;
  deactivatedAt: string | null;
  currentQrToken: string | null;
  qrSequence: number;
  qrCreatedAt: string | null;
  qrExpiresAt: string | null;
}

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeNumber: string;
  employeeName: string;
  department: string;
  attendanceDate: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  checkInMethod: string | null;
  checkOutMethod: string | null;
  qrSessionId: number | null;
  manualCorrection: boolean;
  correctionReason: string | null;
}

export interface AttendanceEvent {
  id: number;
  monitorId: number | null;
  attendanceRecordId: number | null;
  employeeId: number | null;
  action: string;
  eventTime: string | null;
  qrSequence: number | null;
  performedBy: string | null;
  details: string | null;
  employeeNumber: string | null;
  employeeName: string | null;
}

export interface AttendanceSummary {
  date: string;
  activeEmployees: number;
  employeesOnLeave: number;
  expectedEmployees: number;
  attended: number;
  checkedOut: number;
  currentlyWorking: number;
  late: number;
}

export interface AttendanceSchedule {
  id: number;
  scheduleName: string;
  scheduleType: 'ONCE' | 'DAILY' | 'WEEKLY' | string;
  scheduleDate: string | null;
  dayOfWeek: string | null;
  startTime: string;
  endTime: string;
  enabled: boolean;
  createdBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export async function getAttendanceMonitor(): Promise<AttendanceMonitor> {
  return apiRequest<AttendanceMonitor>(
    '/api/attendance/monitor'
  );
}

export async function activateAttendanceMonitor(
  code: string,
  user: string,
  type: 'MANUAL' | 'SCHEDULE' = 'MANUAL'
): Promise<AttendanceMonitor> {
  return apiRequest<AttendanceMonitor>(
    '/api/attendance/monitor/activate',
    {
      method: 'POST',
      body: {
        code,
        user,
        type,
      },
    }
  );
}

export async function deactivateAttendanceMonitor(
  user?: string,
  type: 'MANUAL' | 'SCHEDULE' = 'MANUAL'
): Promise<void> {
  await apiRequest(
    '/api/attendance/monitor/deactivate',
    {
      method: 'POST',
      body: {
        user: user || 'SYSTEM',
        type,
      },
    }
  );
}

export async function rotateAttendanceQr(): Promise<AttendanceMonitor> {
  return apiRequest<AttendanceMonitor>(
    '/api/attendance/monitor/rotate',
    {
      method: 'POST',
    }
  );
}

/*
 * Employee QR scan.
 *
 * employeeId may be:
 * - numeric database ID
 * - EMP001 style employee number
 *
 * Backend will resolve both.
 */
export async function scanAttendanceQr(
  employeeId: string | number,
  token: string
): Promise<AttendanceRecord> {
  return apiRequest<AttendanceRecord>(
    '/api/attendance/scan',
    {
      method: 'POST',
      body: {
        employeeId,
        token,
      },
    }
  );
}

export async function getEmployeeTodayAttendance(
  employeeId: string | number
): Promise<AttendanceRecord | null> {
  try {
    return await apiRequest<AttendanceRecord | null>(
      `/api/attendance/employee/${encodeURIComponent(
        String(employeeId)
      )}/today`
    );
  } catch {
    return null;
  }
}

export async function getEmployeeAttendanceHistory(
  employeeId: string | number
): Promise<AttendanceRecord[]> {
  return apiRequest<AttendanceRecord[]>(
    `/api/attendance/employee/${encodeURIComponent(
      String(employeeId)
    )}`
  );
}

export async function getAttendanceRecords(
  date?: string
): Promise<AttendanceRecord[]> {
  const query = date
    ? `?date=${encodeURIComponent(date)}`
    : '';

  return apiRequest<AttendanceRecord[]>(
    `/api/attendance/records${query}`
  );
}

export async function getAttendanceSummary(
  date?: string
): Promise<AttendanceSummary> {
  const query = date
    ? `?date=${encodeURIComponent(date)}`
    : '';

  return apiRequest<AttendanceSummary>(
    `/api/attendance/summary${query}`
  );
}

export async function getAttendanceEvents(
  limit = 50
): Promise<AttendanceEvent[]> {
  return apiRequest<AttendanceEvent[]>(
    `/api/attendance/events?limit=${limit}`
  );
}

export async function correctAttendance(
  id: number,
  data: {
    checkIn: string | null;
    checkOut: string | null;
    status: string;
    reason: string;
  }
): Promise<void> {
  await apiRequest(
    `/api/attendance/records/${id}`,
    {
      method: 'PUT',
      body: data,
    }
  );
}

export async function getAttendanceSchedules(): Promise<
  AttendanceSchedule[]
> {
  return apiRequest<AttendanceSchedule[]>(
    '/api/attendance/schedules'
  );
}

export async function createAttendanceSchedule(
  schedule: Omit<
    AttendanceSchedule,
    'id' | 'createdAt' | 'updatedAt'
  >
): Promise<AttendanceSchedule> {
  return apiRequest<AttendanceSchedule>(
    '/api/attendance/schedules',
    {
      method: 'POST',
      body: schedule,
    }
  );
}

export async function updateAttendanceSchedule(
  id: number,
  schedule: Omit<
    AttendanceSchedule,
    'id' | 'createdAt' | 'updatedAt'
  >
): Promise<AttendanceSchedule> {
  return apiRequest<AttendanceSchedule>(
    `/api/attendance/schedules/${id}`,
    {
      method: 'PUT',
      body: schedule,
    }
  );
}

export async function deleteAttendanceSchedule(
  id: number
): Promise<void> {
  await apiRequest(
    `/api/attendance/schedules/${id}`,
    {
      method: 'DELETE',
    }
  );
}

export const QR_ROTATION_SECONDS = 10;