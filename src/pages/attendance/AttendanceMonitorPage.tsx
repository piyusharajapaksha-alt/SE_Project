import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getAttendanceSession, type AttendanceSession } from '@/services/attendanceQrService';

export default function AttendanceMonitorPage() {
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setSession(await getAttendanceSession());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 2000);
    return () => window.clearInterval(timer);
  }, []);

  if (loading && !session) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-gray-500">Connecting to attendance server...</div>;
  }

  if (!session?.active || !session.currentQr) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Monitor</h1>
          <p className="mt-3 text-gray-500">No active backend attendance session.</p>
          <p className="mt-1 text-sm text-gray-400">Start a session from Attendance Management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">StaffHub Attendance</p>
      <h1 className="mt-3 text-4xl font-black text-gray-900">Scan to Mark Attendance</h1>
      <div className="mt-10 rounded-3xl border border-gray-200 p-8 bg-white shadow-sm">
        <QRCodeSVG value={session.currentQr.token} size={360} includeMargin />
      </div>
      <p className="mt-6 text-sm text-gray-500">Session: {session.id}</p>
      <p className="mt-1 text-sm text-gray-400">QR sequence: {session.currentQr.sequence}</p>
    </div>
  );
}
