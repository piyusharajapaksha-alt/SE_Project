import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

import {
  getAttendanceSession,
  getTodayAttendanceEvents,
  getQrRemainingSeconds,
  type AttendanceSession,
  type AttendanceEvent,
} from '@/services/attendanceQrService';

export default function AttendanceMonitorPage() {
  const [session, setSession] =
    useState<AttendanceSession | null>(null);

  const [remainingSeconds, setRemainingSeconds] =
    useState(0);

  const [welcomeEvent, setWelcomeEvent] =
    useState<AttendanceEvent | null>(null);

  const lastEventId = useRef<string | null>(null);
  const welcomeTimer = useRef<number | null>(null);

  // ==========================================================
  // LOAD MONITOR DATA
  // ==========================================================

  const loadMonitor = () => {
    const currentSession =
      getAttendanceSession();

    const currentEvents =
      getTodayAttendanceEvents();

    setSession(currentSession);

    setRemainingSeconds(
      getQrRemainingSeconds()
    );

    // --------------------------------------------------------
    // Detect a NEW employee scan
    // --------------------------------------------------------

    const latestEvent =
      currentEvents.length > 0
        ? currentEvents[0]
        : null;

    if (
      latestEvent &&
      latestEvent.id !== lastEventId.current
    ) {
      lastEventId.current =
        latestEvent.id;

      setWelcomeEvent(
        latestEvent
      );

      // Clear welcome message after 4 seconds
      if (
        welcomeTimer.current !== null
      ) {
        window.clearTimeout(
          welcomeTimer.current
        );
      }

      welcomeTimer.current =
        window.setTimeout(() => {
          setWelcomeEvent(null);
        }, 4000);
    }
  };

  // ==========================================================
  // MONITOR LOOP
  // ==========================================================

  useEffect(() => {
    loadMonitor();

    // Check every 500ms.
    //
    // This allows:
    // - QR countdown to stay accurate
    // - QR to rotate automatically
    // - New scans to appear quickly
    const interval =
      window.setInterval(() => {
        loadMonitor();
      }, 500);

    return () => {
      window.clearInterval(
        interval
      );

      if (
        welcomeTimer.current !== null
      ) {
        window.clearTimeout(
          welcomeTimer.current
        );
      }
    };
  }, []);

  // ==========================================================
  // CROSS-TAB / SAME-BROWSER LIVE UPDATE
  // ==========================================================

  useEffect(() => {
    const handleStorage = () => {
      loadMonitor();
    };

    window.addEventListener(
      'storage',
      handleStorage
    );

    return () => {
      window.removeEventListener(
        'storage',
        handleStorage
      );
    };
  }, []);

  // ==========================================================
  // FULL SCREEN
  // ==========================================================

  useEffect(() => {
    const enableFullscreen =
      async () => {
        try {
          if (
            !document.fullscreenElement
          ) {
            await document.documentElement.requestFullscreen();
          }
        } catch {
          // Browser may block automatic fullscreen.
          // The monitor still works normally.
        }
      };

    // Browsers normally require a user gesture
    // for fullscreen, so this is best-effort only.
    enableFullscreen();
  }, []);

  // ==========================================================
  // INACTIVE SCREEN
  // ==========================================================

  if (
    !session?.active ||
    !session.currentQr
  ) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900">
            StaffHub
          </div>

          <div className="mt-4 text-xl sm:text-2xl font-semibold text-gray-400">
            Attendance is not active
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // WELCOME SCREEN
  // ==========================================================

  if (welcomeEvent) {
    const isCheckIn =
      welcomeEvent.action ===
      'CHECK_IN';

    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center px-6">
        <div className="text-center">
          {/* Success icon */}

          <div className="mx-auto w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-16 h-16 sm:w-20 sm:h-20 text-green-600"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Message */}

          <div className="mt-8">
            <p className="text-2xl sm:text-3xl font-semibold text-gray-500">
              {isCheckIn
                ? 'Welcome'
                : 'Goodbye'}
            </p>

            <h1 className="mt-2 text-5xl sm:text-7xl font-black tracking-tight text-gray-900">
              {welcomeEvent.employeeName}
            </h1>

            <p className="mt-5 text-xl sm:text-2xl font-semibold text-green-600">
              {isCheckIn
                ? 'Attendance Recorded'
                : 'Check-out Recorded'}
            </p>

            <p className="mt-2 text-lg text-gray-400">
              {welcomeEvent.time}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN QR SCREEN
  // ==========================================================

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center px-6">

      {/* ====================================================
          STAFFHUB
          ==================================================== */}

      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900">
          StaffHub
        </h1>

        <p className="mt-3 text-xl sm:text-2xl md:text-3xl font-semibold text-gray-500">
          Scan to mark attendance
        </p>
      </div>

      {/* ====================================================
          QR CODE
          ==================================================== */}

      <div className="mt-8 sm:mt-10 md:mt-12">
        <div className="bg-white p-5 sm:p-7 md:p-9 rounded-3xl shadow-xl border border-gray-100">

          <QRCodeSVG
            value={
              session.currentQr.token
            }
            size={
              typeof window !== 'undefined' &&
              window.innerWidth < 640
                ? 260
                : 360
            }
            level="H"
            includeMargin
          />

        </div>
      </div>

      {/* ====================================================
          COUNTDOWN
          ==================================================== */}

      <div className="mt-7 text-center">

        <p className="text-base sm:text-lg text-gray-400">
          QR refreshes automatically
        </p>

        <p className="mt-1 text-3xl sm:text-4xl font-bold text-gray-900">
          {remainingSeconds}s
        </p>

      </div>

    </div>
  );
}




/*import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  QRCodeSVG,
} from 'qrcode.react';

import {
  Clock,
  QrCode,
  Users,
  UserCheck,
  UserX,
  LogOut,
  Play,
  Square,
  RefreshCw,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  useAuth,
} from '@/contexts/AuthContext';

import {
  useToast,
} from '@/contexts/ToastContext';

import {
  PageHeader,
  StatCard,
} from '@/components/ui';

import {
  getAttendanceSession,
  getQrRemainingSeconds,
  startAttendanceSession,
  stopAttendanceSession,
  rotateQr,
  getTodayQrAttendance,
  getTodayAttendanceEvents,
  type AttendanceSession,
  type QrAttendanceRecord,
  type AttendanceEvent,
} from '@/services/attendanceQrService';

export default function AttendanceMonitorPage() {
  const {
    user,
  } = useAuth();

  const {
    addToast,
  } = useToast();

  const navigate =
    useNavigate();

  const [
    session,
    setSession,
  ] =
    useState<AttendanceSession | null>(
      null
    );

  const [
    remainingSeconds,
    setRemainingSeconds,
  ] =
    useState(0);

  const [
    records,
    setRecords,
  ] =
    useState<QrAttendanceRecord[]>(
      []
    );

  const [
    events,
    setEvents,
  ] =
    useState<AttendanceEvent[]>(
      []
    );

  // ==========================================================
  // LOAD
  // ==========================================================

  const loadData = () => {
    setSession(
      getAttendanceSession()
    );

    setRemainingSeconds(
      getQrRemainingSeconds()
    );

    setRecords(
      getTodayQrAttendance()
    );

    setEvents(
      getTodayAttendanceEvents()
    );
  };

  useEffect(() => {
    loadData();

    const interval =
      window.setInterval(
        () => {
          const current =
            getAttendanceSession();

          setSession(
            current
          );

          setRemainingSeconds(
            getQrRemainingSeconds()
          );

          setRecords(
            getTodayQrAttendance()
          );

          setEvents(
            getTodayAttendanceEvents()
          );
        },
        1000
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, []);

  // ==========================================================
  // LIVE STORAGE UPDATE
  // ==========================================================

  useEffect(() => {
    const handleStorage =
      () => {
        loadData();
      };

    window.addEventListener(
      'storage',
      handleStorage
    );

    return () =>
      window.removeEventListener(
        'storage',
        handleStorage
      );
  }, []);

  // ==========================================================
  // START
  // ==========================================================

  const handleStart =
    () => {
      const name =
        user?.email ||
        'HR Manager';

      const newSession =
        startAttendanceSession(
          name
        );

      setSession(
        newSession
      );

      setRemainingSeconds(
        getQrRemainingSeconds()
      );

      addToast(
        'success',
        'Attendance session started.',
        'success'
      );
    };

  // ==========================================================
  // STOP
  // ==========================================================

  const handleStop =
    () => {
      stopAttendanceSession();

      setSession(
        null
      );

      setRemainingSeconds(
        0
      );

      addToast(
        'success',
        'Attendance session stopped.',
        'success'
      );
    };

  // ==========================================================
  // MANUAL ROTATE
  // ==========================================================

  const handleRotate =
    () => {
      const updated =
        rotateQr(
          'manual'
        );

      if (updated) {
        setSession(
          updated
        );

        setRemainingSeconds(
          getQrRemainingSeconds()
        );
      }
    };

  // ==========================================================
  // STATS
  // ==========================================================

  const stats =
    useMemo(() => {
      const checkedIn =
        records.filter(
          (record) =>
            Boolean(
              record.checkIn
            )
        ).length;

      const checkedOut =
        records.filter(
          (record) =>
            Boolean(
              record.checkOut
            )
        ).length;

      const late =
        records.filter(
          (record) =>
            record.status ===
            'Late'
        ).length;

      const currentlyPresent =
        records.filter(
          (record) =>
            record.checkIn &&
            !record.checkOut
        ).length;

      return {
        checkedIn,
        checkedOut,
        late,
        currentlyPresent,
      };
    }, [records]);

  // ==========================================================
  // LAST EVENT
  // ==========================================================

  const lastEvent =
    events.length > 0
      ? events[0]
      : null;

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="space-y-6">

      <PageHeader
        title="Attendance QR Monitor"
        description="Live attendance QR display for employees."
      />

     

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div
              className={`h-3 w-3 rounded-full ${
                session?.active
                  ? 'bg-green-500 animate-pulse'
                  : 'bg-gray-400'
              }`}
            />

            <div>

              <p className="font-semibold text-gray-900">
                {session?.active
                  ? 'Attendance is LIVE'
                  : 'Attendance is STOPPED'}
              </p>

              <p className="text-sm text-gray-500">
                {session?.active
                  ? 'Employees can scan the QR code.'
                  : 'Start attendance from this screen.'}
              </p>

            </div>

          </div>

          <div className="flex flex-wrap gap-3">

            {!session?.active ? (

              <button
                type="button"
                onClick={handleStart}
                className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold"
              >
                <Play className="h-5 w-5" />
                Start Attendance
              </button>

            ) : (

              <>
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      '/management/attendance'
                    )
                  }
                  className="px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50"
                >
                  Attendance Management
                </button>

                <button
                  type="button"
                  onClick={handleStop}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold"
                >
                  <Square className="h-4 w-4" />
                  Stop Attendance
                </button>
              </>

            )}

          </div>

        </div>

      </div>

     

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          title="Checked In"
          value={stats.checkedIn}
          icon={
            <UserCheck className="h-5 w-5" />
          }
          color="green"
        />

        <StatCard
          title="Currently Present"
          value={
            stats.currentlyPresent
          }
          icon={
            <Users className="h-5 w-5" />
          }
          color="blue"
        />

        <StatCard
          title="Late"
          value={stats.late}
          icon={
            <Clock className="h-5 w-5" />
          }
          color="amber"
        />

        <StatCard
          title="Checked Out"
          value={stats.checkedOut}
          icon={
            <LogOut className="h-5 w-5" />
          }
          color="purple"
        />

      </div>

     

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

       

        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="p-6 border-b border-gray-100">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Scan Attendance QR
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  This QR automatically changes every 10 seconds.
                </p>

              </div>

              {session?.active && (
                <div className="px-3 py-2 rounded-lg bg-green-50 text-green-700 font-semibold text-sm">
                  LIVE
                </div>
              )}

            </div>

          </div>

          <div className="p-8">

            {!session?.active ||
            !session.currentQr ? (

              <div className="min-h-[450px] flex flex-col items-center justify-center text-center">

                <div className="h-24 w-24 rounded-3xl bg-indigo-50 flex items-center justify-center">

                  <QrCode className="h-12 w-12 text-indigo-600" />

                </div>

                <h3 className="mt-6 text-2xl font-bold text-gray-900">
                  Attendance Not Started
                </h3>

                <p className="mt-2 max-w-md text-gray-500">
                  HR Manager must start the attendance session before employees can scan.
                </p>

                <button
                  type="button"
                  onClick={handleStart}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold"
                >
                  <Play className="h-5 w-5" />
                  Start Attendance
                </button>

              </div>

            ) : (

              <div className="flex flex-col items-center">

                <div className="p-5 bg-white border-4 border-gray-100 rounded-3xl shadow-lg">

                  <QRCodeSVG
                    value={
                      session.currentQr.token
                    }
                    size={330}
                    level="H"
                    includeMargin
                  />

                </div>

              

                <div className="mt-6 text-center">

                  <div className="text-sm text-gray-500">
                    QR changes automatically
                  </div>

                  <div className="mt-1 text-4xl font-bold text-indigo-600">
                    {remainingSeconds}s
                  </div>

                  <div className="text-xs text-gray-400 mt-1">
                    QR #{session.currentQr.sequence}
                  </div>

                </div>

                <button
                  type="button"
                  onClick={handleRotate}
                  className="mt-5 inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Change QR Now
                </button>

              </div>

            )}

          </div>

        </div>

      

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="p-6 border-b border-gray-100">

            <h2 className="font-bold text-gray-900">
              Live Activity
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Latest employee scan
            </p>

          </div>

          <div className="p-6">

            {lastEvent ? (

              <div className="text-center">

                <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">

                  <CheckCircle2 className="h-10 w-10 text-green-600" />

                </div>

                <p className="mt-5 text-sm text-green-600 font-semibold">
                  {lastEvent.action ===
                  'CHECK_IN'
                    ? 'CHECK-IN SUCCESSFUL'
                    : 'CHECK-OUT SUCCESSFUL'}
                </p>

                <h3 className="mt-2 text-2xl font-bold text-gray-900">
                  Welcome,
                </h3>

                <h3 className="text-2xl font-bold text-indigo-600">
                  {lastEvent.employeeName}
                </h3>

                <div className="mt-5 p-4 rounded-xl bg-gray-50">

                  <div className="flex justify-between text-sm">

                    <span className="text-gray-500">
                      Time
                    </span>

                    <span className="font-semibold text-gray-900">
                      {lastEvent.time}
                    </span>

                  </div>

                  <div className="flex justify-between text-sm mt-2">

                    <span className="text-gray-500">
                      Action
                    </span>

                    <span className="font-semibold text-gray-900">
                      {lastEvent.action ===
                      'CHECK_IN'
                        ? 'Check In'
                        : 'Check Out'}
                    </span>

                  </div>

                </div>

              </div>

            ) : (

              <div className="min-h-[300px] flex flex-col items-center justify-center text-center">

                <Smartphone className="h-12 w-12 text-gray-300" />

                <p className="mt-4 font-semibold text-gray-700">
                  Waiting for employee...
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Scan activity will appear here.
                </p>

              </div>

            )}

          </div>

        </div>

      </div>

     

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="p-6 border-b border-gray-100">

          <h2 className="text-lg font-bold text-gray-900">
            Today's Attendance Activity
          </h2>

        </div>

        {events.length === 0 ? (

          <div className="p-10 text-center text-gray-500">
            No attendance scans yet.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    Employee
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    Action
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    Time
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    QR
                  </th>

                </tr>

              </thead>

              <tbody>

                {events.map(
                  (event) => (
                    <tr
                      key={
                        event.id
                      }
                      className="border-t border-gray-100"
                    >

                      <td className="px-6 py-4 font-medium text-gray-900">
                        {event.employeeName}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                            event.action ===
                            'CHECK_IN'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {event.action ===
                          'CHECK_IN'
                            ? 'Check In'
                            : 'Check Out'}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {event.time}
                      </td>

                      <td className="px-6 py-4 text-gray-500">
                        #{event.qrSequence}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

*/