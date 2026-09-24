import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  RefreshCw,
  ShieldCheck,
  Wifi,
} from 'lucide-react';

import {
  getAttendanceMonitor,
  type AttendanceMonitor,
} from '@/services/attendanceQrService';

const QR_SECONDS = 10;

export default function AttendanceMonitorPage() {
  const [monitor, setMonitor] =
    useState<AttendanceMonitor | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [seconds, setSeconds] =
    useState(QR_SECONDS);

  const loadMonitor = async () => {
    try {
      const result =
        await getAttendanceMonitor();

      setMonitor(result);

      updateCountdown(result);
    } catch (error) {
      console.error(
        'Attendance monitor error:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = (
    result: AttendanceMonitor
  ) => {
    if (
      !result.active ||
      !result.qrExpiresAt
    ) {
      setSeconds(QR_SECONDS);
      return;
    }

    const remaining = Math.ceil(
      (
        new Date(
          result.qrExpiresAt
        ).getTime() -
        Date.now()
      ) / 1000
    );

    setSeconds(
      Math.max(0, remaining)
    );
  };

  useEffect(() => {
    loadMonitor();

    const timer =
      window.setInterval(
        loadMonitor,
        2000
      );

    return () =>
      window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (
      !monitor?.active ||
      !monitor.qrExpiresAt
    ) {
      return;
    }

    const timer =
      window.setInterval(() => {
        updateCountdown(monitor);
      }, 500);

    return () =>
      window.clearInterval(timer);
  }, [
    monitor?.active,
    monitor?.qrExpiresAt,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading Attendance Monitor...
      </div>
    );
  }

  /*
   * ============================================================
   * INACTIVE MONITOR
   * ============================================================
   */

  if (
    !monitor ||
    !monitor.active ||
    !monitor.currentQrToken
  ) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center">

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

          <p className="mt-4 text-slate-400">
            Enter this temporary code in Attendance Management
            to activate the monitor.
          </p>

          <div className="mt-10 rounded-3xl bg-white text-slate-950 px-12 py-10 shadow-2xl">

            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              Temporary Activation Code
            </p>

            <div className="mt-5 text-6xl md:text-8xl font-black tracking-[0.2em]">
              {monitor?.activationCode || '------'}
            </div>

          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">

            <RefreshCw className="h-4 w-4" />

            <span>
              Waiting for authorized activation
            </span>

          </div>

        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * ACTIVE MONITOR
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">

      <div className="text-center">

        <p className="text-indigo-400 font-semibold uppercase tracking-[0.3em]">
          StaffHub
        </p>

        <h1 className="mt-4 text-4xl md:text-6xl font-black uppercase">
          Scan to Mark Attendance
        </h1>

        <div className="mt-10 bg-white p-8 rounded-[2rem] shadow-2xl inline-block">

          <QRCodeSVG
            value={monitor.currentQrToken}
            size={380}
            includeMargin
          />

        </div>

        <div className="mt-8 flex justify-center items-center gap-3">

          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />

          <span className="font-semibold">
            Attendance is LIVE
          </span>

        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-slate-400">

          <Wifi className="h-4 w-4" />

          <span>
            QR refreshes in {seconds}s
          </span>

        </div>

        <p className="mt-3 text-xs text-slate-500">
          QR sequence #{monitor.qrSequence}
        </p>

      </div>

    </div>
  );
}