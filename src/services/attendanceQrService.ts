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
// QR MONITOR STORAGE
// ============================================================

const ATTENDANCE_MONITOR_STORAGE_KEY =
  'staffhub_attendance_monitor_id';

function getStoredMonitorId(): number | undefined {
  try {
    const stored =
      window.localStorage.getItem(
        ATTENDANCE_MONITOR_STORAGE_KEY
      );

    if (!stored) {
      return undefined;
    }

    const parsed =
      Number(stored);

    if (
      !Number.isInteger(parsed) ||
      parsed <= 0
    ) {
      window.localStorage.removeItem(
        ATTENDANCE_MONITOR_STORAGE_KEY
      );

      return undefined;
    }

    return parsed;
  } catch (error) {
    console.warn(
      'Unable to read attendance monitor ID from localStorage.',
      error
    );

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
  } catch (error) {
    console.warn(
      'Unable to save attendance monitor ID.',
      error
    );
  }
}

function clearStoredMonitorId(): void {
  try {
    window.localStorage.removeItem(
      ATTENDANCE_MONITOR_STORAGE_KEY
    );
  } catch (error) {
    console.warn(
      'Unable to clear attendance monitor ID.',
      error
    );
  }
}

// ============================================================
// QR MONITOR
// ============================================================

/**
 * Get the physical attendance monitor.
 *
 * The monitor ID is stored in localStorage so that:
 *
 * 1. Refreshing the page keeps the same monitor.
 * 2. The monitor does not create a new DB row every poll.
 * 3. The same activation code remains associated with the
 *    physical browser/device.
 *
 * If there is no stored monitor ID, the backend creates a
 * new monitor and this function stores its ID.
 */
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

  let result: AttendanceMonitor | undefined;

  try {

    result =
      await apiRequest<AttendanceMonitor>(
        `/api/attendance/monitor${query}`
      );

  } catch (error) {

    /*
     * If the stored monitor ID became invalid,
     * clear it so the next request can create a
     * fresh physical monitor.
     */
    if (storedMonitorId !== undefined) {
      clearStoredMonitorId();
    }

    throw error;
  }

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

  /*
   * Always save the ID returned by the backend.
   *
   * This is important because the backend can create
   * a replacement monitor when the old ID no longer exists.
   */
  saveStoredMonitorId(
    result.id
  );

  return result;
}

/**
 * Forget the physical monitor stored in this browser.
 *
 * Normally this should not be called by the monitor page.
 * It is provided for troubleshooting/resetting a device.
 */
export function clearAttendanceMonitorStorage(): void {
  clearStoredMonitorId();
}

/**
 * Get all monitors accepted by the
 * currently authenticated company.
 */
export async function getAcceptedAttendanceMonitors(): Promise<
  AttendanceMonitor[]
> {
  return apiRequest<AttendanceMonitor[]>(
    '/api/attendance/monitor/accepted'
  );
}

/**
 * Accept a new physical monitor using
 * its temporary six-digit activation code.
 */
export async function authorizeAttendanceMonitor(
  code: string
): Promise<AttendanceMonitor> {

  return apiRequest<AttendanceMonitor>(
    '/api/attendance/monitor/authorize',
    {
      method: 'POST',
      body: {
        code,
      },
    }
  );
}

/**
 * Activate an already-authorized monitor.
 */
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

/**
 * Deactivate an already-authorized monitor.
 */
export async function deactivateAttendanceMonitor(
  monitorId: number
): Promise<void> {

  await apiRequest(
    '/api/attendance/monitor/deactivate',
    {
      method: 'POST',
      body: {
        monitorId,
      },
    }
  );
}

/**
 * Permanently reject/unlink a monitor
 * from the current company.
 */
export async function rejectAttendanceMonitor(
  monitorId: number
): Promise<void> {

  await apiRequest(
    '/api/attendance/monitor/reject',
    {
      method: 'POST',
      body: {
        monitorId,
      },
    }
  );
}

/**
 * Rotate QR for an already-authorized
 * active monitor.
 */
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
    date
      ? `?date=${encodeURIComponent(date)}`
      : '';

  return apiRequest<AttendanceRecord[]>(
    `/api/attendance/records${query}`
  );
}

export async function getAttendanceSummary(
  date?: string
): Promise<AttendanceSummary> {

  const query =
    date
      ? `?date=${encodeURIComponent(date)}`
      : '';

  return apiRequest<AttendanceSummary>(
    `/api/attendance/summary${query}`
  );
}

export async function getAttendanceEvents(
  limit = 50
): Promise<AttendanceEvent[]> {

  const safeLimit =
    Math.max(
      1,
      Math.min(
        Number(limit) || 50,
        200
      )
    );

  return apiRequest<AttendanceEvent[]>(
    `/api/attendance/events?limit=${safeLimit}`
  );
}

// ============================================================
// ATTENDANCE CORRECTION
// ============================================================

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

  await apiRequest(
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

