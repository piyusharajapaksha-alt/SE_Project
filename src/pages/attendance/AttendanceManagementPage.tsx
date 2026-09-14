import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { PageHeader, StatCard } from '@/components/ui';
import { Clock, QrCode, Users, Play, Square } from 'lucide-react';
import { getAttendanceSession, getTodayQrAttendance, startAttendanceSession, stopAttendanceSession, type AttendanceSession, type QrAttendanceRecord } from '@/services/attendanceQrService';

export default function AttendanceManagementPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [records, setRecords] = useState<QrAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [currentSession, todayRecords] = await Promise.all([
        getAttendanceSession(),
        getTodayQrAttendance(),
      ]);
      setSession(currentSession);
      setRecords(todayRecords);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const start = async () => {
    if (!user) return;
    try {
      await startAttendanceSession(user.employeeId);
      addToast('success', 'Attendance session started');
      await load();
    } catch (error: any) {
      addToast('error', error?.message || 'Attendance backend is not available');
    }
  };

  const stop = async () => {
    try {
      await stopAttendanceSession();
      addToast('success', 'Attendance session stopped');
      await load();
    } catch (error: any) {
      addToast('error', error?.message || 'Attendance backend is not available');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance Management" description="Manage the backend QR attendance session." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Session" value={session?.active ? 'Active' : 'Inactive'} icon={<QrCode className="h-5 w-5" />} color="blue" />
        <StatCard title="Today's Records" value={records.length} icon={<Users className="h-5 w-5" />} color="green" />
        <StatCard title="QR Status" value={session?.currentQr ? 'Available' : 'Unavailable'} icon={<Clock className="h-5 w-5" />} color="purple" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">QR Attendance Session</h2>
            <p className="text-sm text-gray-500 mt-1">The frontend no longer stores or generates attendance data locally.</p>
          </div>
          <div className="flex gap-3">
            {!session?.active ? (
              <button onClick={start} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"><Play className="h-4 w-4" />Start Session</button>
            ) : (
              <button onClick={stop} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"><Square className="h-4 w-4" />Stop Session</button>
            )}
          </div>
        </div>
        {!session && <p className="mt-5 text-sm text-amber-600">No backend attendance session is currently available.</p>}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-900">Today's QR Attendance</h2></div>
        {records.length === 0 ? <div className="p-8 text-center text-gray-500">No attendance records available.</div> : (
          <table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="text-left px-6 py-4">Employee</th><th className="text-left px-6 py-4">Check In</th><th className="text-left px-6 py-4">Check Out</th><th className="text-left px-6 py-4">Status</th></tr></thead><tbody>{records.map((record) => <tr key={record.id} className="border-t border-gray-100"><td className="px-6 py-4">{record.employeeName}</td><td className="px-6 py-4">{record.checkIn || '--'}</td><td className="px-6 py-4">{record.checkOut || '--'}</td><td className="px-6 py-4">{record.status}</td></tr>)}</tbody></table>
        )}
      </div>
    </div>
  );
}
