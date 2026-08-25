import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { attendanceService } from '@/services/dataServices';
import { PageHeader, SearchInput, SelectFilter, Badge, Pagination, LoadingState, EmptyState, StatCard } from '@/components/ui';
import { DEPARTMENTS, ATTENDANCE_STATUSES } from '@/config';
import { Clock, UserCheck, AlertTriangle, UserX, CalendarDays, Pencil, Trash2 } from 'lucide-react';

export default function AttendancePage() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const { addToast } = useToast();
  // The URL decides the data scope. A manager using MAIN must still see only their own records.
  const isManagementView = location.pathname.startsWith('/management/');
  const isEmployeeView = !isManagementView;
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('2024-12-16');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => { loadData(); }, [search, statusFilter, deptFilter, dateFilter, user, isManagementView]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isEmployeeView && user) {
        // MAIN / Attendance: only the currently logged-in employee.
        const data = await attendanceService.getByEmployee(user.employeeId);
        const enriched = data.map((a: any) => ({
          ...a,
          employeeName: `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Me',
          department: profile?.department || '',
        }));
        setRecords(enriched);

        // Employee summary must also be calculated from that employee's records.
        const dayRecords = enriched.filter((a: any) => a.date === dateFilter);
        setSummary({
          present: dayRecords.filter((a: any) => a.status === 'Present').length,
          late: dayRecords.filter((a: any) => a.status === 'Late').length,
          absent: dayRecords.filter((a: any) => a.status === 'Absent').length,
          onLeave: dayRecords.filter((a: any) => a.status === 'On Leave').length,
          halfDay: dayRecords.filter((a: any) => a.status === 'Half Day').length,
          total: dayRecords.length,
        });
      } else {
        // MANAGEMENT / Attendance: authorized managers can see staff records.
        const data = await attendanceService.getAll({ date: dateFilter, status: statusFilter, department: deptFilter, search });
        setRecords(data);
        setSummary(await attendanceService.getSummary(dateFilter));
      }
    } catch { } finally { setLoading(false); }
  };

  const statusBadge = (s: string) => s === 'Present' ? 'success' : s === 'Late' ? 'warning' : s === 'Absent' ? 'danger' : s === 'On Leave' ? 'info' : 'purple';

  const paged = records.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(records.length / perPage);

  return (
    <div>
      <PageHeader title={isEmployeeView ? 'My Attendance' : 'Attendance Management'} description={isEmployeeView ? 'View your attendance records' : 'Track and manage employee attendance'} />

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <StatCard title="Present" value={summary.present} icon={<UserCheck className="h-5 w-5" />} color="green" />
          <StatCard title="Late" value={summary.late} icon={<Clock className="h-5 w-5" />} color="amber" />
          <StatCard title="Absent" value={summary.absent} icon={<UserX className="h-5 w-5" />} color="red" />
          <StatCard title="On Leave" value={summary.onLeave} icon={<CalendarDays className="h-5 w-5" />} color="purple" />
          <StatCard title="Half Day" value={summary.halfDay} icon={<AlertTriangle className="h-5 w-5" />} color="info" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {!isEmployeeView && <div className="flex-1"><SearchInput value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="Search employees..." /></div>}
        {!isEmployeeView && <SelectFilter value={deptFilter} onChange={(v) => { setDeptFilter(v); setCurrentPage(1); }} options={DEPARTMENTS} placeholder="All Departments" />}
        <SelectFilter value={statusFilter} onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }} options={ATTENDANCE_STATUSES} />
        <input type="date" value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
      </div>

      {loading ? <LoadingState /> : records.length === 0 ? <EmptyState icon={<Clock className="h-6 w-6" />} title="No attendance records found" /> : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {!isEmployeeView && <th className="text-left py-3 px-4 font-medium text-gray-600">Employee</th>}
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Check In</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 hidden sm:table-cell">Check Out</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 hidden md:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((r: any) => (
                    <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                      {!isEmployeeView && <td className="py-3 px-4 font-medium text-gray-900">{r.employeeName}</td>}
                      <td className="py-3 px-4 text-gray-600">{r.date}</td>
                      <td className="py-3 px-4"><Badge variant={statusBadge(r.status) as any} dot>{r.status}</Badge></td>
                      <td className="py-3 px-4 text-gray-600">{r.checkIn || '-'}</td>
                      <td className="py-3 px-4 text-gray-600 hidden sm:table-cell">{r.checkOut || '-'}</td>
                      <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{r.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  );
}
