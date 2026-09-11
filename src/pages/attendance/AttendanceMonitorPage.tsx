import {
  useEffect,
  useState,
} from 'react';

import {
  QRCodeSVG,
} from 'qrcode.react';

import {
  getAttendanceSession,
  getQrRemainingSeconds,
  getTodayAttendanceEvents,
  type AttendanceSession,
  type AttendanceEvent,
} from '@/services/attendanceQrService';

import {
  createMonitorKey,
  getMonitorState,
  type QrMonitorState,
} from '@/services/attendanceMonitorService';


// ============================================================
// QR MONITOR PAGE
//
// IMPORTANT:
// This page is intentionally completely independent from
// StaffHub DashboardLayout.
//
// No:
// - Sidebar
// - Navigation
// - Login page
// - Profile
// - Settings
// ============================================================

export default function AttendanceMonitorPage() {

  const [
    monitor,
    setMonitor,
  ] = useState<QrMonitorState | null>(
    null
  );

  const [
    session,
    setSession,
  ] = useState<AttendanceSession | null>(
    null
  );

  const [
    remainingSeconds,
    setRemainingSeconds,
  ] = useState(0);

  const [
    welcomeEvent,
    setWelcomeEvent,
  ] = useState<AttendanceEvent | null>(
    null
  );

  const [
    keyRemaining,
    setKeyRemaining,
  ] = useState(0);


  // ==========================================================
  // LOAD MONITOR
  // ==========================================================

  const loadMonitor = () => {

    const currentMonitor =
      getMonitorState();

    setMonitor(
      currentMonitor
    );

    if (
      currentMonitor &&
      !currentMonitor.active
    ) {

      const remaining =
        Math.max(
          0,
          Math.ceil(
            (
              new Date(
                currentMonitor.expiresAt
              ).getTime() -
              Date.now()
            ) / 1000
          )
        );

      setKeyRemaining(
        remaining
      );
    }

    const currentSession =
      getAttendanceSession();

    setSession(
      currentSession
    );

    setRemainingSeconds(
      getQrRemainingSeconds()
    );
  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    let current =
      getMonitorState();

    if (!current) {
      current =
        createMonitorKey();
    }

    setMonitor(current);

    loadMonitor();

  }, []);


  // ==========================================================
  // MONITOR LOOP
  // ==========================================================

  useEffect(() => {

    const interval =
      window.setInterval(() => {

        loadMonitor();

      }, 500);

    return () => {

      window.clearInterval(
        interval
      );

    };

  }, []);


  // ==========================================================
  // STORAGE UPDATE
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
  // AUTOMATIC KEY REFRESH
  // ==========================================================

  useEffect(() => {

    if (
      !monitor ||
      monitor.active
    ) {
      return;
    }

    if (
      keyRemaining > 0
    ) {
      return;
    }

    const newMonitor =
      createMonitorKey();

    setMonitor(
      newMonitor
    );

    setKeyRemaining(
      120
    );

  }, [
    keyRemaining,
    monitor,
  ]);


  // ==========================================================
  // FULLSCREEN
  // ==========================================================

  useEffect(() => {

    const enableFullscreen =
      async () => {

        try {

          if (
            !document.fullscreenElement
          ) {

            await document.documentElement
              .requestFullscreen();

          }

        } catch {
          // Browser may block automatic fullscreen.
        }

      };

    enableFullscreen();

  }, []);


  // ==========================================================
  // WAITING SCREEN
  // ==========================================================

  if (
    !monitor?.active
  ) {

    return (
      <div className="
        min-h-screen
        w-full
        bg-white
        flex
        items-center
        justify-center
        px-6
      ">

        <div className="
          text-center
          w-full
          max-w-2xl
        ">

          {/* BRAND */}

          <h1 className="
            text-5xl
            sm:text-6xl
            md:text-7xl
            font-black
            tracking-tight
            text-gray-900
          ">
            StaffHub
          </h1>


          {/* TITLE */}

          <p className="
            mt-5
            text-xl
            sm:text-2xl
            font-semibold
            text-gray-500
          ">
            QR Monitor
          </p>


          {/* STATUS */}

          <div className="
            mt-10
            inline-flex
            items-center
            gap-3
            px-5
            py-3
            rounded-full
            bg-gray-100
            text-gray-600
            font-semibold
          ">

            <span className="
              h-3
              w-3
              rounded-full
              bg-gray-400"
            />

            Waiting for activation

          </div>


          {/* PAIRING KEY */}

          <div className="
            mt-10
            bg-gray-50
            border
            border-gray-200
            rounded-3xl
            p-8
            sm:p-10
          ">

            <p className="
              text-sm
              sm:text-base
              font-medium
              text-gray-500
            ">
              Enter this key in Attendance Management
            </p>


            <div
              className="
    mt-5
    text-6xl
    sm:text-7xl
    md:text-8xl
    font-black
    tracking-[0.2em]
    text-gray-900
  "
            >
              {monitor?.pairingKey}
            </div>


            <div className="
              mt-5
              text-sm
              sm:text-base
              text-gray-400
            ">

              Key expires in{' '}

              <span className="
                font-bold
                text-gray-700
              ">
                {keyRemaining}s
              </span>

            </div>

          </div>


          {/* INSTRUCTION */}

          <p className="
            mt-8
            text-sm
            sm:text-base
            text-gray-400
          ">
            Ask an authorized Attendance Manager
            to activate this monitor.
          </p>

        </div>

      </div>
    );
  }


  // ==========================================================
  // ATTENDANCE SESSION NOT ACTIVE
  // ==========================================================

  if (
    !session?.active ||
    !session.currentQr
  ) {

    return (
      <div className="
        min-h-screen
        w-full
        bg-white
        flex
        items-center
        justify-center
        px-6
      ">

        <div className="
          text-center
        ">

          <h1 className="
            text-5xl
            sm:text-6xl
            font-black
            text-gray-900
          ">
            StaffHub
          </h1>


          <div className="
            mt-6
            inline-flex
            items-center
            gap-3
            px-5
            py-3
            rounded-full
            bg-yellow-50
            text-yellow-700
            font-semibold
          ">

            <span className="
              h-3
              w-3
              rounded-full
              bg-yellow-500"
            />

            Attendance is not active

          </div>


          <p className="
            mt-5
            text-gray-400
          ">
            Waiting for Attendance Management
            to start attendance.
          </p>

        </div>

      </div>
    );
  }


  // ==========================================================
  // ACTIVE QR MONITOR
  // ==========================================================

  return (
    <div className="
      min-h-screen
      w-full
      bg-white
      flex
      flex-col
      items-center
      justify-center
      px-6
    ">


      {/* ======================================================
          STAFFHUB
          ====================================================== */}

      <h1 className="
        text-5xl
        sm:text-6xl
        md:text-7xl
        font-black
        tracking-tight
        text-gray-900
      ">
        StaffHub
      </h1>


      {/* ======================================================
          TITLE
          ====================================================== */}

      <p className="
        mt-4
        text-2xl
        sm:text-3xl
        md:text-4xl
        font-semibold
        text-gray-500
        uppercase
        tracking-wide
      ">
        Scan to mark attendance
      </p>


      {/* ======================================================
          QR
          ====================================================== */}

      <div className="
        mt-10
        sm:mt-12
        bg-white
        p-6
        sm:p-8
        md:p-10
        rounded-3xl
        shadow-xl
        border
        border-gray-100
      ">

        <QRCodeSVG
          value={
            session.currentQr.token
          }
          size={
            typeof window !== 'undefined' &&
              window.innerWidth < 640
              ? 280
              : 420
          }
          level="H"
          includeMargin
        />

      </div>


      {/* ======================================================
          LIVE STATUS
          ====================================================== */}

      <div className="
        mt-8
        flex
        items-center
        gap-3
      ">

        <span className="
          h-4
          w-4
          rounded-full
          bg-green-500
          animate-pulse"
        />

        <span className="
          text-xl
          sm:text-2xl
          font-bold
          text-green-600
        ">
          Attendance is LIVE
        </span>

      </div>


      {/* ======================================================
          COUNTDOWN
          ====================================================== */}

      <p className="
        mt-3
        text-lg
        sm:text-xl
        text-gray-400
      ">

        QR refreshes in{' '}

        <span className="
          font-bold
          text-gray-700
        ">
          {remainingSeconds}s
        </span>

      </p>

    </div>
  );
}