// ============================================================
// STAFFHUB - ATTENDANCE QR SERVICE
// FRONTEND DEMO / MOCK IMPLEMENTATION
//
// HR starts ONE attendance session.
// QR automatically rotates every 10 seconds.
// QR also rotates immediately after a successful scan.
//
// IMPORTANT:
// This currently uses localStorage because the backend is not
// connected yet. For real multi-device usage, this should later
// be replaced with Spring Boot + WebSocket/API.
// ============================================================

export type AttendanceAction =
  | 'CHECK_IN'
  | 'CHECK_OUT';

export type AttendanceEventType =
  | 'CHECK_IN'
  | 'CHECK_OUT';

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

// ============================================================
// STORAGE KEYS
// ============================================================

const SESSION_KEY =
  'staffhub_attendance_session';

const RECORDS_KEY =
  'staffhub_qr_attendance_records';

const EVENTS_KEY =
  'staffhub_attendance_events';

// ============================================================
// SETTINGS
// ============================================================

export const QR_ROTATION_SECONDS = 10;

// ============================================================
// STORAGE EVENT HELPER
// ============================================================

function notifyStorage(key: string): void {
  window.dispatchEvent(
    new StorageEvent('storage', {
      key,
      newValue: localStorage.getItem(key),
      storageArea: localStorage,
    })
  );
}

// ============================================================
// DATE / TIME
// ============================================================

function getToday(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(
    now.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    now.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getCurrentTime(): string {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

// ============================================================
// TOKEN
// ============================================================

function generateToken(): string {
  const randomPart =
    Math.random()
      .toString(36)
      .substring(2, 12)
      .toUpperCase();

  return [
    'STAFFHUB',
    Date.now(),
    randomPart,
  ].join('-');
}

// ============================================================
// STORAGE READERS
// ============================================================

function readSession(): AttendanceSession | null {
  try {
    const value =
      localStorage.getItem(
        SESSION_KEY
      );

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  } catch {
    return null;
  }
}

function saveSession(
  session: AttendanceSession
): void {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session)
  );

  notifyStorage(SESSION_KEY);
}

function readRecords(): QrAttendanceRecord[] {
  try {
    const value =
      localStorage.getItem(
        RECORDS_KEY
      );

    if (!value) {
      return [];
    }

    return JSON.parse(value);
  } catch {
    return [];
  }
}

function saveRecords(
  records: QrAttendanceRecord[]
): void {
  localStorage.setItem(
    RECORDS_KEY,
    JSON.stringify(records)
  );

  notifyStorage(RECORDS_KEY);
}

function readEvents(): AttendanceEvent[] {
  try {
    const value =
      localStorage.getItem(
        EVENTS_KEY
      );

    if (!value) {
      return [];
    }

    return JSON.parse(value);
  } catch {
    return [];
  }
}

function saveEvents(
  events: AttendanceEvent[]
): void {
  localStorage.setItem(
    EVENTS_KEY,
    JSON.stringify(events)
  );

  notifyStorage(EVENTS_KEY);
}

// ============================================================
// CREATE QR
// ============================================================

function createQr(
  sequence: number
): AttendanceQr {
  const now = Date.now();

  return {
    token: generateToken(),

    sequence,

    createdAt:
      new Date(now).toISOString(),

    expiresAt:
      new Date(
        now +
          QR_ROTATION_SECONDS *
            1000
      ).toISOString(),
  };
}

// ============================================================
// START ATTENDANCE SESSION
// ============================================================

export function startAttendanceSession(
  startedBy: string
): AttendanceSession {
  const existing =
    readSession();

  if (
    existing?.active
  ) {
    return existing;
  }

  const now = Date.now();

  const session: AttendanceSession = {
    id: `SESSION-${now}`,

    startedAt:
      new Date(now).toISOString(),

    startedBy,

    active: true,

    currentQr:
      createQr(1),
  };

  saveSession(session);

  return session;
}

// ============================================================
// STOP ATTENDANCE
// ============================================================

export function stopAttendanceSession(): void {
  const session =
    readSession();

  if (!session) {
    return;
  }

  saveSession({
    ...session,
    active: false,
    currentQr: null,
  });
}

// ============================================================
// GET SESSION
// ============================================================

export function getAttendanceSession():
  AttendanceSession | null {
  const session =
    readSession();

  if (!session) {
    return null;
  }

  if (!session.active) {
    return session;
  }

  if (
    session.currentQr &&
    new Date(
      session.currentQr.expiresAt
    ).getTime() <= Date.now()
  ) {
    return rotateQr('timer');
  }

  return session;
}

// ============================================================
// IS ACTIVE
// ============================================================

export function isAttendanceActive(): boolean {
  const session =
    getAttendanceSession();

  return Boolean(
    session?.active
  );
}

// ============================================================
// QR ROTATION
// ============================================================

export function rotateQr(
  reason:
    | 'timer'
    | 'scan'
    | 'manual' = 'timer'
): AttendanceSession | null {
  const session =
    readSession();

  if (
    !session ||
    !session.active
  ) {
    return null;
  }

  const oldSequence =
    session.currentQr
      ?.sequence || 0;

  const nextSequence =
    oldSequence + 1;

  const updated: AttendanceSession = {
    ...session,

    currentQr:
      createQr(nextSequence),
  };

  saveSession(updated);

  console.log(
    `Attendance QR rotated: ${reason}`
  );

  return updated;
}

// ============================================================
// REMAINING QR TIME
// ============================================================

export function getQrRemainingSeconds(): number {
  const session =
    getAttendanceSession();

  if (
    !session?.active ||
    !session.currentQr
  ) {
    return 0;
  }

  const remaining =
    new Date(
      session.currentQr.expiresAt
    ).getTime() -
    Date.now();

  return Math.max(
    0,
    Math.ceil(
      remaining / 1000
    )
  );
}

// ============================================================
// VALIDATE QR
// ============================================================

export function validateQrToken(
  token: string
): AttendanceSession {
  const session =
    readSession();

  if (
    !session ||
    !session.active
  ) {
    throw new Error(
      'Attendance is not active.'
    );
  }

  if (!session.currentQr) {
    throw new Error(
      'No active QR code.'
    );
  }

  if (
    new Date(
      session.currentQr.expiresAt
    ).getTime() <= Date.now()
  ) {
    rotateQr('timer');

    throw new Error(
      'This QR code has expired. Please scan the new QR code.'
    );
  }

  if (
    session.currentQr.token !==
    token.trim()
  ) {
    throw new Error(
      'Invalid attendance QR code.'
    );
  }

  return session;
}

// ============================================================
// EMPLOYEE TODAY RECORD
// ============================================================

export function getEmployeeTodayRecord(
  employeeId: string
): QrAttendanceRecord | null {
  const records =
    readRecords();

  return (
    records.find(
      (record) =>
        record.employeeId ===
          employeeId &&
        record.date ===
          getToday()
    ) || null
  );
}

// ============================================================
// EMPLOYEE HISTORY
// ============================================================

export function getEmployeeRecords(
  employeeId: string
): QrAttendanceRecord[] {
  return readRecords()
    .filter(
      (record) =>
        record.employeeId ===
        employeeId
    )
    .sort(
      (a, b) =>
        b.date.localeCompare(
          a.date
        )
    );
}

// ============================================================
// CHECK-IN
// ============================================================

export function checkInEmployee(
  employeeId: string,
  employeeName: string,
  qrToken: string
): {
  record: QrAttendanceRecord;
  event: AttendanceEvent;
  session: AttendanceSession;
} {
  const session =
    validateQrToken(
      qrToken
    );

  const records =
    readRecords();

  const existing =
    records.find(
      (record) =>
        record.employeeId ===
          employeeId &&
        record.date ===
          getToday()
    );

  if (existing?.checkIn) {
    throw new Error(
      'You have already checked in today.'
    );
  }

  const now =
    new Date();

  const hour =
    now.getHours();

  const minute =
    now.getMinutes();

  const status =
    hour > 9 ||
    (
      hour === 9 &&
      minute >= 15
    )
      ? 'Late'
      : 'Present';

  const record: QrAttendanceRecord = {
    id: `ATT-${Date.now()}`,

    employeeId,

    employeeName,

    date: getToday(),

    checkIn:
      getCurrentTime(),

    checkOut: null,

    status,

    qrSessionId:
      session.id,

    createdAt:
      now.toISOString(),
  };

  saveRecords([
    ...records,
    record,
  ]);

  const event: AttendanceEvent = {
    id: `EVENT-${Date.now()}`,

    sessionId:
      session.id,

    employeeId,

    employeeName,

    action:
      'CHECK_IN',

    timestamp:
      now.toISOString(),

    time:
      getCurrentTime(),

    qrSequence:
      session.currentQr
        ?.sequence || 0,

    recordId:
      record.id,
  };

  saveEvents([
    event,
    ...readEvents(),
  ]);

  const updatedSession =
    rotateQr('scan');

  if (!updatedSession) {
    throw new Error(
      'Attendance session was stopped.'
    );
  }

  return {
    record,
    event,
    session:
      updatedSession,
  };
}

// ============================================================
// CHECK-OUT
// ============================================================

export function checkOutEmployee(
  employeeId: string,
  qrToken: string
): {
  record: QrAttendanceRecord;
  event: AttendanceEvent;
  session: AttendanceSession;
} {
  const session =
    validateQrToken(
      qrToken
    );

  const records =
    readRecords();

  const index =
    records.findIndex(
      (record) =>
        record.employeeId ===
          employeeId &&
        record.date ===
          getToday()
    );

  if (index === -1) {
    throw new Error(
      'You have not checked in today.'
    );
  }

  if (
    records[index].checkOut
  ) {
    throw new Error(
      'You have already checked out today.'
    );
  }

  const updatedRecord: QrAttendanceRecord = {
    ...records[index],

    checkOut:
      getCurrentTime(),
  };

  records[index] =
    updatedRecord;

  saveRecords(records);

  const now =
    new Date();

  const event: AttendanceEvent = {
    id: `EVENT-${Date.now()}`,

    sessionId:
      session.id,

    employeeId,

    employeeName:
      updatedRecord.employeeName,

    action:
      'CHECK_OUT',

    timestamp:
      now.toISOString(),

    time:
      getCurrentTime(),

    qrSequence:
      session.currentQr
        ?.sequence || 0,

    recordId:
      updatedRecord.id,
  };

  saveEvents([
    event,
    ...readEvents(),
  ]);

  const updatedSession =
    rotateQr('scan');

  if (!updatedSession) {
    throw new Error(
      'Attendance session was stopped.'
    );
  }

  return {
    record:
      updatedRecord,

    event,

    session:
      updatedSession,
  };
}

// ============================================================
// EVENTS
// ============================================================

export function getTodayAttendanceEvents():
  AttendanceEvent[] {
  return readEvents()
    .filter(
      (event) => {
        const date =
          new Date(
            event.timestamp
          );

        return (
          date
            .toISOString()
            .split('T')[0] ===
          getToday()
        );
      }
    )
    .sort(
      (a, b) =>
        new Date(
          b.timestamp
        ).getTime() -
        new Date(
          a.timestamp
        ).getTime()
    );
}

// ============================================================
// ALL RECORDS
// ============================================================

export function getAllQrAttendance():
  QrAttendanceRecord[] {
  return readRecords()
    .sort(
      (a, b) =>
        `${b.date}${b.checkIn || ''}`
          .localeCompare(
            `${a.date}${a.checkIn || ''}`
          )
    );
}

// ============================================================
// TODAY RECORDS
// ============================================================

export function getTodayQrAttendance():
  QrAttendanceRecord[] {
  return readRecords()
    .filter(
      (record) =>
        record.date ===
        getToday()
    );
}

// ============================================================
// DEMO RESET
// ============================================================

export function clearAttendanceDemoData(): void {
  localStorage.removeItem(
    SESSION_KEY
  );

  localStorage.removeItem(
    RECORDS_KEY
  );

  localStorage.removeItem(
    EVENTS_KEY
  );

  notifyStorage(SESSION_KEY);
  notifyStorage(RECORDS_KEY);
  notifyStorage(EVENTS_KEY);
}