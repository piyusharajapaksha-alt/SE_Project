
// ============================================================
// ATTENDANCE QR SERVICE
// FRONTEND DEMO / MOCK IMPLEMENTATION
//
// This service temporarily stores QR sessions and QR attendance
// records in localStorage.
//
// When Spring Boot backend is ready, replace these functions
// with API calls.
// ============================================================

export interface AttendanceQrSession {
  id: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  active: boolean;
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

const SESSION_KEY = 'staffhub_attendance_qr_session';
const RECORDS_KEY = 'staffhub_qr_attendance_records';

const QR_VALIDITY_SECONDS = 60;

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getCurrentTime(): string {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function generateToken(): string {
  const randomPart = Math.random()
    .toString(36)
    .substring(2, 12)
    .toUpperCase();

  return `STAFFHUB-${Date.now()}-${randomPart}`;
}

function readSession(): AttendanceQrSession | null {
  try {
    const value = localStorage.getItem(SESSION_KEY);

    if (!value) return null;

    return JSON.parse(value);
  } catch {
    return null;
  }
}

function saveSession(session: AttendanceQrSession): void {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session)
  );
}

function readRecords(): QrAttendanceRecord[] {
  try {
    const value = localStorage.getItem(RECORDS_KEY);

    if (!value) return [];

    return JSON.parse(value);
  } catch {
    return [];
  }
}

function saveRecords(records: QrAttendanceRecord[]): void {
  localStorage.setItem(
    RECORDS_KEY,
    JSON.stringify(records)
  );
}

// ------------------------------------------------------------
// QR SESSION
// ------------------------------------------------------------

export function createQrSession(): AttendanceQrSession {
  const now = Date.now();

  const session: AttendanceQrSession = {
    id: `QR-${now}`,
    token: generateToken(),
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(
      now + QR_VALIDITY_SECONDS * 1000
    ).toISOString(),
    active: true,
  };

  saveSession(session);

  return session;
}

export function getCurrentQrSession(): AttendanceQrSession | null {
  const session = readSession();

  if (!session) return null;

  if (
    !session.active ||
    new Date(session.expiresAt).getTime() <= Date.now()
  ) {
    const expired = {
      ...session,
      active: false,
    };

    saveSession(expired);

    return expired;
  }

  return session;
}

export function getRemainingSeconds(): number {
  const session = getCurrentQrSession();

  if (!session) return 0;

  const remaining =
    new Date(session.expiresAt).getTime() -
    Date.now();

  return Math.max(
    0,
    Math.ceil(remaining / 1000)
  );
}

export function deactivateQrSession(): void {
  const session = readSession();

  if (!session) return;

  saveSession({
    ...session,
    active: false,
  });
}

export function validateQrToken(
  token: string
): AttendanceQrSession | null {
  const session = readSession();

  if (!session) {
    throw new Error('No active attendance QR code.');
  }

  if (!session.active) {
    throw new Error('This QR code is no longer active.');
  }

  if (
    new Date(session.expiresAt).getTime() <= Date.now()
  ) {
    saveSession({
      ...session,
      active: false,
    });

    throw new Error(
      'This QR code has expired. Please scan the new QR code.'
    );
  }

  if (session.token !== token.trim()) {
    throw new Error(
      'Invalid attendance QR code.'
    );
  }

  return session;
}

// ------------------------------------------------------------
// EMPLOYEE ATTENDANCE
// ------------------------------------------------------------

export function getEmployeeTodayRecord(
  employeeId: string
): QrAttendanceRecord | null {
  const records = readRecords();

  return (
    records.find(
      (record) =>
        record.employeeId === employeeId &&
        record.date === getToday()
    ) || null
  );
}

export function getEmployeeRecords(
  employeeId: string
): QrAttendanceRecord[] {
  return readRecords()
    .filter(
      (record) =>
        record.employeeId === employeeId
    )
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date)
    );
}

export function checkInEmployee(
  employeeId: string,
  employeeName: string,
  qrToken: string
): QrAttendanceRecord {
  const session = validateQrToken(qrToken);

  if (!session) {
    throw new Error('Invalid QR session.');
  }

  const records = readRecords();

  const existing = records.find(
    (record) =>
      record.employeeId === employeeId &&
      record.date === getToday()
  );

  if (existing?.checkIn) {
    throw new Error(
      'You have already checked in today.'
    );
  }

  const currentTime = getCurrentTime();

  // Simple demo rule:
  // Before 09:15 = Present
  // 09:15 or later = Late
  const now = new Date();

  const hour = now.getHours();
  const minute = now.getMinutes();

  const status =
    hour > 9 ||
    (hour === 9 && minute >= 15)
      ? 'Late'
      : 'Present';

  const record: QrAttendanceRecord = {
    id: `QRA-${Date.now()}`,
    employeeId,
    employeeName,
    date: getToday(),
    checkIn: currentTime,
    checkOut: null,
    status,
    qrSessionId: session.id,
    createdAt: new Date().toISOString(),
  };

  saveRecords([
    ...records,
    record,
  ]);

  return record;
}

export function checkOutEmployee(
  employeeId: string,
  qrToken: string
): QrAttendanceRecord {
  const session = validateQrToken(qrToken);

  if (!session) {
    throw new Error('Invalid QR session.');
  }

  const records = readRecords();

  const index = records.findIndex(
    (record) =>
      record.employeeId === employeeId &&
      record.date === getToday()
  );

  if (index === -1) {
    throw new Error(
      'You have not checked in today.'
    );
  }

  if (records[index].checkOut) {
    throw new Error(
      'You have already checked out today.'
    );
  }

  const updated = {
    ...records[index],
    checkOut: getCurrentTime(),
  };

  records[index] = updated;

  saveRecords(records);

  return updated;
}

// ------------------------------------------------------------
// MANAGEMENT
// ------------------------------------------------------------

export function getAllQrAttendance(): QrAttendanceRecord[] {
  return readRecords().sort(
    (a, b) =>
      `${b.date}${b.checkIn || ''}`.localeCompare(
        `${a.date}${a.checkIn || ''}`
      )
  );
}

export function getTodayQrAttendance(): QrAttendanceRecord[] {
  return readRecords().filter(
    (record) => record.date === getToday()
  );
}

