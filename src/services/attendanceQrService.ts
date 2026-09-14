import { apiRequest } from './apiClient';

export type AttendanceAction = 'CHECK_IN' | 'CHECK_OUT';
export type AttendanceEventType = 'CHECK_IN' | 'CHECK_OUT';

export interface AttendanceQr {
  token: string;
  sequence: number;
  createdAt: string;
  expiresAt: string;
}

export interface AttendanceSession {
  id: string;
  startedAt: string;
  startedBy: string;
  active: boolean;
  currentQr: AttendanceQr | null;
}

export interface QrAttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'Present' | 'Late' | 'Absent' | 'Half Day';
  qrSessionId: string;
  createdAt: string;
}

export interface AttendanceEvent {
  id: string;
  sessionId: string;
  employeeId: string;
  employeeName: string;
  action: AttendanceEventType;
  timestamp: string;
  time: string;
  qrSequence: number;
  recordId: string;
}

export const QR_ROTATION_SECONDS = 10;

export async function startAttendanceSession(startedBy: string): Promise<AttendanceSession> {
  return apiRequest<AttendanceSession>('/api/attendance/qr/session', {
    method: 'POST',
    body: { startedBy },
  });
}

export async function stopAttendanceSession(): Promise<void> {
  await apiRequest<void>('/api/attendance/qr/session', { method: 'DELETE' });
}

export async function getAttendanceSession(): Promise<AttendanceSession | null> {
  try {
    return await apiRequest<AttendanceSession>('/api/attendance/qr/session');
  } catch {
    return null;
  }
}

export async function isAttendanceActive(): Promise<boolean> {
  const session = await getAttendanceSession();
  return Boolean(session?.active);
}

export async function rotateQr(reason: 'timer' | 'scan' | 'manual' = 'timer'): Promise<AttendanceSession | null> {
  try {
    return await apiRequest<AttendanceSession>('/api/attendance/qr/session/rotate', {
      method: 'POST',
      body: { reason },
    });
  } catch {
    return null;
  }
}

export async function getQrRemainingSeconds(): Promise<number> {
  const session = await getAttendanceSession();
  if (!session?.currentQr) return 0;
  return Math.max(0, Math.ceil((new Date(session.currentQr.expiresAt).getTime() - Date.now()) / 1000));
}

export async function validateQrToken(token: string): Promise<AttendanceSession> {
  return apiRequest<AttendanceSession>('/api/attendance/qr/validate', {
    method: 'POST',
    body: { token },
  });
}

export async function getEmployeeTodayRecord(employeeId: string): Promise<QrAttendanceRecord | null> {
  try {
    return await apiRequest<QrAttendanceRecord>(`/api/attendance/qr/employee/${employeeId}/today`);
  } catch {
    return null;
  }
}

export async function getEmployeeRecords(employeeId: string): Promise<QrAttendanceRecord[]> {
  try {
    return await apiRequest<QrAttendanceRecord[]>(`/api/attendance/qr/employee/${employeeId}`);
  } catch {
    return [];
  }
}

export async function checkInEmployee(employeeId: string, employeeName: string, qrToken: string) {
  return apiRequest<{ record: QrAttendanceRecord; event: AttendanceEvent; session: AttendanceSession }>('/api/attendance/qr/check-in', {
    method: 'POST',
    body: { employeeId, employeeName, qrToken },
  });
}

export async function checkOutEmployee(employeeId: string, qrToken: string) {
  return apiRequest<{ record: QrAttendanceRecord; event: AttendanceEvent; session: AttendanceSession }>('/api/attendance/qr/check-out', {
    method: 'POST',
    body: { employeeId, qrToken },
  });
}

export async function getTodayAttendanceEvents(): Promise<AttendanceEvent[]> {
  try {
    return await apiRequest<AttendanceEvent[]>('/api/attendance/qr/events/today');
  } catch {
    return [];
  }
}

export async function getAllQrAttendance(): Promise<QrAttendanceRecord[]> {
  try {
    return await apiRequest<QrAttendanceRecord[]>('/api/attendance/qr/records');
  } catch {
    return [];
  }
}

export async function getTodayQrAttendance(): Promise<QrAttendanceRecord[]> {
  try {
    return await apiRequest<QrAttendanceRecord[]>('/api/attendance/qr/records/today');
  } catch {
    return [];
  }
}
