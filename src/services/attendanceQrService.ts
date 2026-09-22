import { apiRequest } from './apiClient';

export interface AttendanceMonitor {
  id: number;
  activationCode: string;
  active: boolean;
  activationType: 'MANUAL' | 'SCHEDULE';
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

export async function getAttendanceMonitor() {
  return apiRequest<AttendanceMonitor>(
    '/api/attendance/monitor'
  );
}

export async function activateAttendanceMonitor(
  code: string,
  user: string,
  type: 'MANUAL' | 'SCHEDULE' = 'MANUAL'
) {
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

export async function deactivateAttendanceMonitor() {
  return apiRequest<void>(
    '/api/attendance/monitor/deactivate',
    {
      method: 'POST',
    }
  );
}

export async function rotateAttendanceQr() {
  return apiRequest<AttendanceMonitor>(
    '/api/attendance/monitor/rotate',
    {
      method: 'POST',
    }
  );
}

export async function scanAttendanceQr(
  employeeId: string | number,
  token: string
) {
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
  employeeId: string
) {
  try {
    return await apiRequest<AttendanceRecord | null>(
      `/api/attendance/employee/${employeeId}/today`
    );
  } catch {
    return null;
  }
}

export async function getEmployeeAttendanceHistory(
  employeeId: string
) {
  return apiRequest<AttendanceRecord[]>(
    `/api/attendance/employee/${employeeId}`
  );
}

export async function getAttendanceRecords(
  date?: string
) {
  const query = date
    ? `?date=${encodeURIComponent(date)}`
    : '';

  return apiRequest<AttendanceRecord[]>(
    `/api/attendance/records${query}`
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
) {
  return apiRequest<void>(
    `/api/attendance/records/${id}`,
    {
      method: 'PUT',
      body: data,
    }
  );
}

export const QR_ROTATION_SECONDS = 10;