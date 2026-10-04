import { apiRequest } from './apiClient';

// ============================================================
// TYPES
// ============================================================

export interface AttendanceMonitor {
  id: number;

  companyId: number | null;
  companyName: string | null;

  authorized: boolean;
  authorizedBy: string | null;
  authorizedAt: string | null;

  activationCode: string | null;

  active: boolean;

  activationType: string | null;

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
  department: string | null;

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

  expected: number;
  attended: number;
  notAttended: number;

  onLeave: number;

  late: number;

  checkedOut: number;
  currentlyWorking: number;
}

export interface AttendanceSchedule {
  id: number;

  scheduleName: string;

  scheduleType:
    | 'ONCE'
    | 'DAILY'
    | 'WEEKLY'
    | string;

  scheduleDate: string | null;

  dayOfWeek: string | null;

  startTime: string;
  endTime: string;

  enabled: boolean;

  createdBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

// ============================================================
// MANUAL ATTENDANCE
// ============================================================

export interface ManualAttendancePayload {
  employeeNumber: string;

  date: string;

  checkIn: string | null;

  checkOut: string | null;

  status: string;

  reason: string;
}

// ============================================================
// QR MONITOR STORAGE
// ============================================================

const ATTENDANCE_MONITOR_STORAGE_KEY =
  'staffhub_attendance_monitor_id';

function getStoredMonitorId(): number | undefined {
  try {
    const value =
      window.localStorage.getItem(
        ATTENDANCE_MONITOR_STORAGE_KEY
      );

    if (!value) {
      return undefined;
    }

    const id = Number(value);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      window.localStorage.removeItem(
        ATTENDANCE_MONITOR_STORAGE_KEY
      );

      return undefined;
    }

    return id;
  } catch {
    return undefined;
  }
}

function saveStoredMonitorId(
  monitorId: number
): void {
  try {
    if (
      Number.isInteger(monitorId) &&
      monitorId > 0
    ) {
      window.localStorage.setItem(
        ATTENDANCE_MONITOR_STORAGE_KEY,
        String(monitorId)
      );
    }
  } catch {
    // Ignore localStorage errors.
  }
}

function clearStoredMonitorId(): void {
  try {
    window.localStorage.removeItem(
      ATTENDANCE_MONITOR_STORAGE_KEY
    );
  } catch {
    // Ignore localStorage errors.
  }
}

export function clearAttendanceMonitorStorage(): void {
  clearStoredMonitorId();
}

// ============================================================
// ATTENDANCE MONITOR
// ============================================================

export async function getAttendanceMonitor(
  monitorId?: number
): Promise<AttendanceMonitor> {
  const storedMonitorId =
    monitorId !== undefined
      ? monitorId
      : getStoredMonitorId();

  const query =
    storedMonitorId !== undefined
      ? `?monitorId=${encodeURIComponent(
          String(storedMonitorId)
        )}`
      : '';

  try {
    const result =
      await apiRequest<AttendanceMonitor>(
        `/api/attendance/monitor${query}`
      );

    if (!result) {
      throw new Error(
        'Attendance monitor API returned an empty response.'
      );
    }

    if (
      !Number.isInteger(result.id) ||
      result.id <= 0
    ) {
      throw new Error(
        'Attendance monitor API returned an invalid monitor ID.'
      );
    }

    saveStoredMonitorId(result.id);

    return result;
  } catch (error) {
    if (storedMonitorId !== undefined) {
      clearStoredMonitorId();
    }

    throw error;
  }
}

export async function getAcceptedAttendanceMonitors(): Promise<
  AttendanceMonitor[]
> {
  return apiRequest<AttendanceMonitor[]>(
    '/api/attendance/monitor/accepted'
  );
}

export async function authorizeAttendanceMonitor(
  code: string
): Promise<AttendanceMonitor> {
  const cleanCode = code.trim();

  if (!cleanCode) {
    throw new Error(
      'Activation code is required.'
    );
  }

  return apiRequest<AttendanceMonitor>(
    '/api/attendance/monitor/authorize',
    {
      method: 'POST',
      body: {
        code: cleanCode,
      },
    }
  );
}

export async function activateAttendanceMonitor(
  monitorId: number
): Promise<AttendanceMonitor> {
  return apiRequest<AttendanceMonitor>(
    '/api/attendance/monitor/activate',
    {
      method: 'POST',
      body: {
        monitorId,
      },
    }
  );
}

export async function deactivateAttendanceMonitor(
  monitorId: number
): Promise<void> {
  await apiRequest<void>(
    '/api/attendance/monitor/deactivate',
    {
      method: 'POST',
      body: {
        monitorId,
      },
    }
  );
}

export async function rejectAttendanceMonitor(
  monitorId: number
): Promise<void> {
  await apiRequest<void>(
    '/api/attendance/monitor/reject',
    {
      method: 'POST',
      body: {
        monitorId,
      },
    }
  );
}

export async function rotateAttendanceQr(
  monitorId: number
): Promise<AttendanceMonitor> {
  return apiRequest<AttendanceMonitor>(
    '/api/attendance/monitor/rotate',
    {
      method: 'POST',
      body: {
        monitorId,
      },
    }
  );
}

// ============================================================
// QR SCAN
// ============================================================

export async function scanAttendanceQr(
  employeeId: string | number,
  monitorId: number,
  token: string
): Promise<AttendanceRecord> {
  return apiRequest<AttendanceRecord>(
    '/api/attendance/scan',
    {
      method: 'POST',
      body: {
        employeeId,
        monitorId,
        token,
      },
    }
  );
}

// ============================================================
// EMPLOYEE ATTENDANCE
// ============================================================

export async function getEmployeeTodayAttendance(
  employeeId: string | number
): Promise<AttendanceRecord | null> {
  return apiRequest<AttendanceRecord | null>(
    `/api/attendance/employee/${encodeURIComponent(
      String(employeeId)
    )}/today`
  );
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

// ============================================================
// MANAGEMENT RECORDS
// ============================================================

export async function getAttendanceRecords(
  date?: string
): Promise<AttendanceRecord[]> {
  const query =
    date && date.trim()
      ? `?date=${encodeURIComponent(
          date.trim()
        )}`
      : '';

  return apiRequest<AttendanceRecord[]>(
    `/api/attendance/records${query}`
  );
}

export async function getAttendanceSummary(
  date?: string
): Promise<AttendanceSummary> {
  const query =
    date && date.trim()
      ? `?date=${encodeURIComponent(
          date.trim()
        )}`
      : '';

  return apiRequest<AttendanceSummary>(
    `/api/attendance/summary${query}`
  );
}

export async function getAttendanceEvents(
  limit = 100
): Promise<AttendanceEvent[]> {
  const safeLimit = Math.max(
    1,
    Math.min(
      Number.isFinite(limit)
        ? Math.floor(limit)
        : 100,
      200
    )
  );

  return apiRequest<AttendanceEvent[]>(
    `/api/attendance/events?limit=${safeLimit}`
  );
}

// ============================================================
// CORRECT EXISTING ATTENDANCE
// ============================================================

export interface AttendanceCorrectionPayload {
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  reason: string;
}

export async function correctAttendance(
  id: number,
  data: AttendanceCorrectionPayload
): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      'Invalid attendance record ID.'
    );
  }

  if (!data.reason.trim()) {
    throw new Error(
      'A reason is required for attendance correction.'
    );
  }

  await apiRequest<void>(
    `/api/attendance/records/${id}`,
    {
      method: 'PUT',
      body: {
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        status: data.status,
        reason: data.reason.trim(),
      },
    }
  );
}

// ============================================================
// CREATE BRAND-NEW MANUAL ATTENDANCE
// ============================================================

export async function createManualAttendance(
  data: ManualAttendancePayload
): Promise<AttendanceRecord> {
  if (!data.employeeNumber.trim()) {
    throw new Error(
      'Employee number is required.'
    );
  }

  if (!data.date.trim()) {
    throw new Error(
      'Attendance date is required.'
    );
  }

  if (!data.status.trim()) {
    throw new Error(
      'Attendance status is required.'
    );
  }

  if (!data.reason.trim()) {
    throw new Error(
      'A reason is required for manual attendance.'
    );
  }

  return apiRequest<AttendanceRecord>(
    '/api/attendance/management/manual',
    {
      method: 'POST',
      body: {
        employeeNumber:
          data.employeeNumber.trim(),

        date:
          data.date.trim(),

        checkIn:
          data.checkIn || null,

        checkOut:
          data.checkOut || null,

        status:
          data.status.trim(),

        reason:
          data.reason.trim(),
      },
    }
  );
}

// ============================================================
// REAL DATABASE DELETE
// ============================================================

export async function deleteAttendanceRecord(
  id: number,
  verification: string
): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      'Invalid attendance record ID.'
    );
  }

  if (
    verification.trim().toUpperCase() !==
    'DELETE'
  ) {
    throw new Error(
      'Deletion verification failed.'
    );
  }

  await apiRequest<void>(
    `/api/attendance/management/records/${id}`,
    {
      method: 'DELETE',
      body: {
        verification:
          verification.trim().toUpperCase(),
      },
    }
  );
}

// ============================================================
// SCHEDULES
// ============================================================

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
  await apiRequest<void>(
    `/api/attendance/schedules/${id}`,
    {
      method: 'DELETE',
    }
  );
}

// ============================================================
// QR SETTINGS
// ============================================================

export const QR_ROTATION_SECONDS = 10;

