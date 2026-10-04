import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { QRCodeSVG } from 'qrcode.react';

import {
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Wifi,
} from 'lucide-react';

import {
  getAttendanceMonitor,
  type AttendanceMonitor,
} from '@/services/attendanceQrService';

const QR_SECONDS = 10;
const POLL_INTERVAL = 2000;

export default function AttendanceMonitorPage() {
  const [monitor, setMonitor] =
    useState<AttendanceMonitor | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [seconds, setSeconds] =
    useState(QR_SECONDS);

  const mountedRef =
    useRef(true);

  // ============================================================
  // SAFE COUNTDOWN
  // ============================================================

  const updateCountdown = useCallback(
    (
      result:
        | AttendanceMonitor
        | null
        | undefined
    ) => {
      if (
        !result ||
        !result.active ||
        !result.qrExpiresAt
      ) {
        if (mountedRef.current) {
          setSeconds(QR_SECONDS);
        }

        return;
      }

      const expiryTime =
        new Date(
          result.qrExpiresAt
        ).getTime();

      if (
        Number.isNaN(expiryTime)
      ) {
        if (mountedRef.current) {
          setSeconds(QR_SECONDS);
        }

        return;
      }

      const remaining =
        Math.ceil(
          (
            expiryTime -
            Date.now()
          ) / 1000
        );

      if (mountedRef.current) {
        setSeconds(
          Math.max(
            0,
            remaining
          )
        );
      }
    },
    []
  );

  // ============================================================
  // LOAD MONITOR
  // ============================================================

  const loadMonitor =
    useCallback(
      async (
        showLoading = false
      ) => {
        if (
          showLoading &&
          mountedRef.current
        ) {
          setLoading(true);
        }

        try {
          setError(null);

          /*
           * getAttendanceMonitor() automatically:
           *
           * 1. Reads the monitor ID from localStorage.
           * 2. Sends it to the backend.
           * 3. Creates a monitor if no ID exists.
           * 4. Saves the returned monitor ID.
           */
          const result =
            await getAttendanceMonitor();

          if (!result) {
            throw new Error(
              'Attendance monitor API returned an empty response.'
            );
          }

          if (
            !mountedRef.current
          ) {
            return;
          }

          setMonitor(result);

          updateCountdown(result);
        } catch (err) {
          console.error(
            'Attendance monitor error:',
            err
          );

          if (
            !mountedRef.current
          ) {
            return;
          }

          /*
           * Keep the existing monitor visible if a
           * temporary polling request fails.
           */
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load attendance monitor.'
          );
        } finally {
          if (
            showLoading &&
            mountedRef.current
          ) {
            setLoading(false);
          }
        }
      },
      [updateCountdown]
    );

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    mountedRef.current = true;

    void loadMonitor(true);

    return () => {
      mountedRef.current = false;
    };
  }, [loadMonitor]);

  // ============================================================
  // POLLING
  //
  // The same monitor ID is reused.
  //
  // This allows the page to detect:
  //
  // 1. Authorization
  // 2. Activation
  // 3. Deactivation
  // 4. QR rotation
  // ============================================================

  useEffect(() => {
    const timer =
      window.setInterval(
        () => {
          void loadMonitor(false);
        },
        POLL_INTERVAL
      );

    return () => {
      window.clearInterval(timer);
    };
  }, [loadMonitor]);

  // ============================================================
  // COUNTDOWN
  // ============================================================

  useEffect(() => {
    if (
      !monitor ||
      !monitor.active ||
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
      window.clearInterval(timer);
    };
  }, [
    monitor,
    updateCountdown,
  ]);

  // ============================================================
  // LOADING
  // ============================================================

  if (
    loading &&
    !monitor
  ) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="h-9 w-9" />
            </div>
          </div>

          <p className="text-indigo-400 font-semibold uppercase tracking-[0.25em] text-sm">
            StaffHub
          </p>

          <h1 className="mt-4 text-3xl md:text-5xl font-black">
            Attendance Monitor
          </h1>

          <div className="mt-8 flex items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="h-5 w-5 animate-spin" />

            <span>
              Connecting to monitor...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // NO MONITOR
  // ============================================================

  if (!monitor) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="w-full max-w-2xl text-center">
          <div className="flex justify-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center">
              <AlertCircle className="h-9 w-9 text-red-400" />
            </div>
          </div>

          <p className="text-indigo-400 font-semibold uppercase tracking-[0.25em] text-sm">
            StaffHub
          </p>

          <h1 className="mt-4 text-4xl md:text-6xl font-black">
            Attendance Monitor
          </h1>

          <p className="mt-5 text-slate-400">
            The attendance monitor could not be loaded.
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-left">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />

                <div>
                  <p className="font-semibold text-red-300">
                    Connection error
                  </p>

                  <p className="mt-1 text-sm text-red-200/80 break-words">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              void loadMonitor(true);
            }}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold transition hover:bg-indigo-500"
          >
            <RefreshCw className="h-4 w-4" />

            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // WAITING FOR AUTHORIZATION / ACTIVATION
  // ============================================================

  if (
    !monitor.active ||
    !monitor.currentQrToken
  ) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="w-full max-w-4xl text-center">
          <div className="flex justify-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="h-9 w-9" />
            </div>
          </div>

          <p className="text-indigo-400 font-semibold uppercase tracking-[0.25em] text-sm">
            StaffHub
          </p>

          <h1 className="mt-4 text-4xl md:text-6xl font-black">
            Attendance Monitor
          </h1>

          <p className="mt-5 text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Enter this temporary activation code in

            <span className="text-white font-semibold">
              {' '}Attendance Management
            </span>

            {' '}to authorize this monitor.
          </p>

          {/* ====================================================
              ACTIVATION CODE
             ==================================================== */}

          <div className="mt-10 rounded-3xl bg-white text-slate-950 px-8 md:px-16 py-10 shadow-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
              Temporary Activation Code
            </p>

            <div className="mt-5 text-5xl sm:text-7xl md:text-8xl font-black tracking-[0.18em] font-mono">
              {monitor.activationCode || '------'}
            </div>

            {monitor.activationCode && (
              <p className="mt-5 text-sm text-slate-500">
                Give this 6-digit code to the authorized
                company administrator.
              </p>
            )}
          </div>

          {/* ====================================================
              STATUS
             ==================================================== */}

          <div className="mt-8 flex items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="h-4 w-4 animate-spin" />

            <span>
              Waiting for authorized activation
            </span>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
            <span>
              Monitor ID:
            </span>

            <span className="font-mono text-slate-400">
              {monitor.id}
            </span>
          </div>

          {error && (
            <p className="mt-5 text-xs text-amber-400">
              Connection temporarily unavailable.
              Retrying automatically...
            </p>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // QR PAYLOAD
  // ============================================================
  //
  // IMPORTANT:
  //
  // The backend scanner expects the QR to contain:
  //
  // {
  //   "monitorId": 123,
  //   "token": "..."
  // }
  //
  // Previously only currentQrToken was encoded.
  // That caused the phone scanner to show:
  //
  // "Invalid StaffHub attendance QR code."
  //
  // ============================================================

  const qrPayload = JSON.stringify({
    monitorId: monitor.id,
    token: monitor.currentQrToken,
  });

  // ============================================================
  // ACTIVE QR MONITOR
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="text-center w-full max-w-5xl">
        <p className="text-indigo-400 font-semibold uppercase tracking-[0.3em]">
          StaffHub
        </p>

        <h1 className="mt-4 text-4xl md:text-6xl font-black uppercase">
          Scan to Mark Attendance
        </h1>

        {monitor.companyName && (
          <p className="mt-3 text-slate-400">
            {monitor.companyName}
          </p>
        )}

        {/* ======================================================
            QR CODE
           ====================================================== */}

        <div className="mt-10 bg-white p-8 rounded-[2rem] shadow-2xl inline-block">
          <QRCodeSVG
            value={qrPayload}
            size={380}
            includeMargin
          />
        </div>

        {/* ======================================================
            LIVE STATUS
           ====================================================== */}

        <div className="mt-8 flex justify-center items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />

          <span className="font-semibold">
            Attendance is LIVE
          </span>
        </div>

        {/* ======================================================
            QR COUNTDOWN
           ====================================================== */}

        <div className="mt-5 flex items-center justify-center gap-2 text-slate-400">
          <Wifi className="h-4 w-4" />

          <span>
            QR refreshes in {seconds}s
          </span>
        </div>

        {/* ======================================================
            MONITOR INFORMATION
           ====================================================== */}

        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span>
            Monitor #{monitor.id}
          </span>

          <span>
            QR sequence #{monitor.qrSequence}
          </span>
        </div>

        {error && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-300">
            <RefreshCw className="h-3.5 w-3.5" />

            Connection temporarily unavailable.
            Reconnecting...
          </div>
        )}
      </div>
    </div>
  );
}

