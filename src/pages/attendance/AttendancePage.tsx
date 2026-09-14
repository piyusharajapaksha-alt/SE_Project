import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, StatCard } from '@/components/ui';
import { Clock, QrCode, UserCheck, LogOut } from 'lucide-react';
import { getEmployeeTodayRecord, getEmployeeRecords, type QrAttendanceRecord } from '@/services/attendanceQrService';

export default function AttendancePage() {
  const { user } = useAuth();
  const [today, setToday] = useState<QrAttendanceRecord | null>(null);
  const [history, setHistory] = useState<QrAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user?.employeeId) return;
      setLoading(true);
      try {
        const [todayRecord, records] = await Promise.all([
          getEmployeeTodayRecord(user.employeeId),
          getEmployeeRecords(user.employeeId),
        ]);
        if (!cancelled) {
          setToday(todayRecord);
          setHistory(records);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [user?.employeeId]);

  return (
    <div className="space-y-6">
      <PageHeader title="My Attendance" description="Attendance records provided by the backend." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Check In" value={today?.checkIn || '--'} icon={<UserCheck className="h-5 w-5" />} color="green" />
        <StatCard title="Check Out" value={today?.checkOut || '--'} icon={<LogOut className="h-5 w-5" />} color="purple" />
        <StatCard title="Status" value={today?.status || 'Not Marked'} icon={<Clock className="h-5 w-5" />} color="blue" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
        <QrCode className="h-12 w-12 mx-auto text-indigo-600" />
        <h2 className="mt-4 text-xl font-bold text-gray-900">QR Attendance</h2>
        <p className="mt-2 text-sm text-gray-500 max-w-lg mx-auto">
          QR attendance is now backend-only. No attendance records or QR sessions are created in the frontend.
          The scanner will be enabled when the Spring Boot QR endpoints are available.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Attendance History</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading attendance...</div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No attendance records available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr>
                <th className="text-left px-6 py-4">Date</th>
                <th className="text-left px-6 py-4">Check In</th>
                <th className="text-left px-6 py-4">Check Out</th>
                <th className="text-left px-6 py-4">Status</th>
              </tr></thead>
              <tbody>
                {history.map((record) => (
                  <tr key={record.id} className="border-t border-gray-100">
                    <td className="px-6 py-4">{record.date}</td>
                    <td className="px-6 py-4">{record.checkIn || '--'}</td>
                    <td className="px-6 py-4">{record.checkOut || '--'}</td>
                    <td className="px-6 py-4">{record.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
