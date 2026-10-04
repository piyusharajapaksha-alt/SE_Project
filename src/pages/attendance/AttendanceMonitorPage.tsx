import {
  useEffect,
  useState,
} from 'react';

import { QRCodeSVG } from 'qrcode.react';

import {
  RefreshCw,
  ShieldCheck,
  Wifi,
  Building2,
} from 'lucide-react';

import {
  getAttendanceMonitor,
  type AttendanceMonitor,
} from '@/services/attendanceQrService';

const QR_SECONDS = 10;

const STORAGE_KEY =
  'staffhub_attendance_monitor_id';

export default function AttendanceMonitorPage() {
  const [monitor, setMonitor] =
    useState<AttendanceMonitor | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [seconds, setSeconds] =
    useState(QR_SECONDS);

  const [error, setError] =
    useState('');

  // ============================================================
  // GET LOCAL MONITOR ID
  // ============================================================

  const getStoredMonitorId = (): number | undefined => {
    const value =
      window.localStorage.getItem(
        STORAGE_KEY
      );

    if (!value) {
      return undefined;
    }

    const id =
      Number(value);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      window.localStorage.removeItem(
        STORAGE_KEY
      );

      return undefined;
    }

    return id;
  };

  // ============================================================
  // LOAD MONITOR
  // ============================================================

  const loadMonitor = async () => {
    try {
      setError('');

      const monitorId =
        getStoredMonitorId();

      const result =
        await getAttendanceMonitor(
          monitorId
        );

      /*
       * First visit:
       *
       * backend creates monitor.
       *
       * Store its ID permanently in this
       * browser/device.
       */
      if (
        monitorId === undefined &&
        result.id
      ) {
        window.localStorage.setItem(
          STORAGE_KEY,
          String(result.id)
        );
      }

      setMonitor(result);

      updateCountdown(result);
    } catch (err: any) {
      console.error(
        'Attendance monitor error:',
        err
      );

      setError(
        err?.message ||
          'Unable to connect to Attendance Monitor'
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // COUNTDOWN
  // ============================================================

  const updateCountdown = (
    result: AttendanceMonitor
  ) => {
    if (
      !result.active ||
      !result.qrExpiresAt
    ) {
      setSeconds(
        QR_SECONDS
      );

      return;
    }

    const remaining =
      Math.ceil(
        (
          new Date(
            result.qrExpiresAt
          ).getTime() -
          Date.now()
        ) / 1000
      );

    setSeconds(
      Math.max(
        0,
        remaining
      )
    );
  };

  // ============================================================
  // INITIAL LOAD / POLLING
  // ============================================================

  useEffect(() => {
    void loadMonitor();

    const timer =
      window.setInterval(
        () => {
          void loadMonitor();
        },
        2000
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, []);

  // ============================================================
  // COUNTDOWN TIMER
  // ============================================================

  useEffect(() => {
    if (
      !monitor?.active ||
      !monitor.qrExpiresAt
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          updateCountdown(
            monitor
          );
        },
        500
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [
    monitor?.active,
    monitor?.qrExpiresAt,
  ]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">

          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />

          <p>
            Loading Attendance Monitor...
          </p>

        </div>
      </div>
    );
  }

  // ============================================================
  // CONNECTION ERROR
  // ============================================================

  if (error && !monitor) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">

        <div className="text-center max-w-lg">

          <div className="flex justify-center mb-8">

            <div className="h-16 w-16 rounded-2xl bg-red-600 flex items-center justify-center">

              <ShieldCheck className="h-9 w-9" />

            </div>

          </div>

          <p className="text-indigo-400 font-semibold uppercase tracking-[0.25em] text-sm">
            StaffHub
          </p>

          <h1 className="mt-4 text-4xl font-black">
            Attendance Monitor
          </h1>

          <p className="mt-5 text-slate-400">
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void loadMonitor();
            }}
            className="mt-8 px-6 py-3 rounded-xl bg-indigo-600 font-semibold"
          >
            Retry
          </button>

        </div>

      </div>
    );
  }

  // ============================================================
  // INACTIVE / NOT AUTHORIZED
  // ============================================================

  if (
    !monitor ||
    !monitor.authorized ||
    !monitor.active ||
    !monitor.currentQrToken
  ) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">

        <div className="text-center max-w-4xl w-full">

          <div className="flex justify-center mb-8">

            <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center">

              <ShieldCheck className="h-9 w-9" />

            </div>

          </div>

          <p className="text-indigo-400 font-semibold uppercase tracking-[0.25em] text-sm">
            StaffHub
          </p>

          <h1 className="mt-4 text-4xl md:text-6xl font-black">
            Attendance Monitor
          </h1>

          {monitor.authorized &&
            monitor.companyName && (
              <div className="mt-5 flex items-center justify-center gap-2 text-slate-300">

                <Building2 className="h-5 w-5" />

                <span className="font-semibold">
                  {monitor.companyName}
                </span>

              </div>
            )}

          <p className="mt-4 text-slate-400">
            {monitor.authorized
              ? 'This monitor is authorized but currently inactive.'
              : 'Enter this temporary code in Attendance Management to authorize this monitor.'}
          </p>

          <div className="mt-10 rounded-3xl bg-white text-slate-950 px-8 md:px-12 py-10 shadow-2xl">

            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              {monitor.authorized
                ? 'Monitor Status'
                : 'Temporary Activation Code'}
            </p>

            {!monitor.authorized ? (

              <div className="mt-5 text-6xl md:text-8xl font-black tracking-[0.2em]">

                {monitor.activationCode ||
                  '------'}

              </div>

            ) : (

              <div className="mt-5 text-4xl md:text-5xl font-black">

                INACTIVE

              </div>

            )}

          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">

            <RefreshCw className="h-4 w-4 animate-spin" />

            <span>
              Waiting for authorized activation
            </span>

          </div>

          <p className="mt-4 text-xs text-slate-500">
            Monitor ID: {monitor.id}
          </p>

        </div>

      </div>
    );
  }

  // ============================================================
  // QR DATA
  // ============================================================

  const qrValue =
    JSON.stringify({
      monitorId: monitor.id,
      token: monitor.currentQrToken,
    });

  // ============================================================
  // ACTIVE MONITOR
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">

      <div className="text-center">

        <p className="text-indigo-400 font-semibold uppercase tracking-[0.3em]">
          StaffHub
        </p>

        <h1 className="mt-4 text-4xl md:text-6xl font-black uppercase">
          Scan to Mark Attendance
        </h1>

        {/* COMPANY */}

        {monitor.companyName && (
          <div className="mt-5 flex items-center justify-center gap-2 text-slate-300">

            <Building2 className="h-5 w-5" />

            <span className="font-semibold">
              {monitor.companyName}
            </span>

          </div>
        )}

        {/* QR */}

        <div className="mt-10 bg-white p-8 rounded-[2rem] shadow-2xl inline-block">

          <QRCodeSVG
            value={qrValue}
            size={380}
            includeMargin
          />

        </div>

        {/* LIVE */}

        <div className="mt-8 flex justify-center items-center gap-3">

          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />

          <span className="font-semibold">
            Attendance is LIVE
          </span>

        </div>

        {/* COUNTDOWN */}

        <div className="mt-5 flex items-center justify-center gap-2 text-slate-400">

          <Wifi className="h-4 w-4" />

          <span>
            QR refreshes in {seconds}s
          </span>

        </div>

        {/* DETAILS */}

        <p className="mt-3 text-xs text-slate-500">
          QR sequence #{monitor.qrSequence}
        </p>

        <p className="mt-1 text-xs text-slate-600">
          Monitor #{monitor.id}
        </p>

      </div>

    </div>
  );
}