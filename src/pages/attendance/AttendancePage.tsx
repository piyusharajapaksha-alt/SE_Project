import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  Clock,
  QrCode,
  ScanLine,
  CheckCircle2,
  LogOut,
  UserCheck,
  Play,
  Square,
} from 'lucide-react';

import {
  Html5Qrcode,
} from 'html5-qrcode';

import {
  useAuth,
} from '@/contexts/AuthContext';

import {
  useToast,
} from '@/contexts/ToastContext';

import {
  getEmployeeTodayRecord,
  getEmployeeRecords,
  checkInEmployee,
  checkOutEmployee,
  getAttendanceSession,
  startAttendanceSession,
  stopAttendanceSession,
  type QrAttendanceRecord,
} from '@/services/attendanceQrService';

import {
  PageHeader,
  StatCard,
} from '@/components/ui';

type ScannerStatus =
  | 'idle'
  | 'starting'
  | 'scanning'
  | 'success'
  | 'error';

export default function AttendancePage() {
  const {
    user,
    profile,
  } = useAuth();

  const {
    addToast,
  } = useToast();

  const navigate =
    useNavigate();

  // ==========================================================
  // EMPLOYEE
  // ==========================================================

  const [
    todayRecord,
    setTodayRecord,
  ] =
    useState<QrAttendanceRecord | null>(
      null
    );

  const [
    history,
    setHistory,
  ] =
    useState<QrAttendanceRecord[]>(
      []
    );

  const [
    scannerOpen,
    setScannerOpen,
  ] =
    useState(false);

  const [
    scannerStatus,
    setScannerStatus,
  ] =
    useState<ScannerStatus>(
      'idle'
    );

  const [
    scannerMessage,
    setScannerMessage,
  ] =
    useState('');

  // ==========================================================
  // LOAD EMPLOYEE ATTENDANCE
  // ==========================================================

  const loadAttendance =
    () => {
      if (!user?.employeeId) {
        return;
      }

      setTodayRecord(
        getEmployeeTodayRecord(
          user.employeeId
        )
      );

      setHistory(
        getEmployeeRecords(
          user.employeeId
        )
      );
    };

  useEffect(() => {
    loadAttendance();
  }, [
    user?.employeeId,
  ]);

  // ==========================================================
  // START SCANNER
  // ==========================================================

  const startScanner =
    async () => {
      setScannerOpen(true);

      setScannerStatus(
        'starting'
      );

      setScannerMessage(
        'Starting camera...'
      );

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            300
          )
      );

      try {
        const scanner =
          new Html5Qrcode(
            'staffhub-qr-reader'
          );

        setScannerStatus(
          'scanning'
        );

        setScannerMessage(
          'Point your camera at the attendance QR code.'
        );

        await scanner.start(
          {
            facingMode:
              'environment',
          },
          {
            fps: 10,

            qrbox: {
              width: 250,
              height: 250,
            },
          },
          async (
            decodedText
          ) => {
            try {
              await scanner.stop();

              await scanner.clear();

              await handleScannedQr(
                decodedText
              );
            } catch (
              error
            ) {
              console.error(
                error
              );
            }
          },
          () => {
            // Ignore normal camera frame failures.
          }
        );
      } catch (
        error
      ) {
        console.error(
          error
        );

        setScannerStatus(
          'error'
        );

        setScannerMessage(
          'Camera could not be started. Please allow camera permission.'
        );
      }
    };

  // ==========================================================
  // STOP SCANNER
  // ==========================================================

  const stopScanner =
    () => {
      setScannerOpen(
        false
      );

      setScannerStatus(
        'idle'
      );

      setScannerMessage(
        ''
      );
    };

  // ==========================================================
  // SCAN
  // ==========================================================

  const handleScannedQr =
    async (
      token: string
    ) => {
      if (!user?.employeeId) {
        return;
      }

      try {
        const employeeName =
          `${profile?.firstName || ''} ${
            profile?.lastName || ''
          }`.trim() ||
          'Employee';

        const currentRecord =
          getEmployeeTodayRecord(
            user.employeeId
          );

        if (!currentRecord) {

          const result =
            checkInEmployee(
              user.employeeId,
              employeeName,
              token
            );

          setTodayRecord(
            result.record
          );

          setHistory(
            getEmployeeRecords(
              user.employeeId
            )
          );

          setScannerStatus(
            'success'
          );

          setScannerMessage(
            `Welcome ${employeeName}! Check-in successful at ${result.record.checkIn}.`
          );

          addToast(
            'success',
            'Check-in successful.',
            'success'
          );

        } else if (
          !currentRecord.checkOut
        ) {

          const result =
            checkOutEmployee(
              user.employeeId,
              token
            );

          setTodayRecord(
            result.record
          );

          setHistory(
            getEmployeeRecords(
              user.employeeId
            )
          );

          setScannerStatus(
            'success'
          );

          setScannerMessage(
            `Goodbye ${employeeName}! Check-out successful at ${result.record.checkOut}.`
          );

          addToast(
            'success',
            'Check-out successful.',
            'success'
          );

        } else {

          throw new Error(
            'You have already completed attendance for today.'
          );
        }

        setTimeout(
          () => {
            setScannerOpen(
              false
            );

            setScannerStatus(
              'idle'
            );

            setScannerMessage(
              ''
            );
          },
          2500
        );

      } catch (
        error: any
      ) {
        console.error(
          error
        );

        setScannerStatus(
          'error'
        );

        setScannerMessage(
          error?.message ||
            'Attendance failed.'
        );

        addToast(
          'error',
          error?.message ||
            'Attendance failed.',
          'error'
        );
      }
    };

  // ==========================================================
  // EMPLOYEE VIEW
  // ==========================================================

  return (
    <div className="space-y-6">

      <PageHeader
        title="My Attendance"
        description="Scan the live StaffHub QR code to check in or check out."
      />

      {/* ======================================================
          TODAY STATUS
          ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <StatCard
          title="Check In"
          value={
            todayRecord?.checkIn ||
            '--'
          }
          icon={
            <UserCheck className="h-5 w-5" />
          }
          color="green"
        />

        <StatCard
          title="Check Out"
          value={
            todayRecord?.checkOut ||
            '--'
          }
          icon={
            <LogOut className="h-5 w-5" />
          }
          color="purple"
        />

        <StatCard
          title="Status"
          value={
            todayRecord?.status ||
            'Not Marked'
          }
          icon={
            <Clock className="h-5 w-5" />
          }
          color="blue"
        />

      </div>

      {/* ======================================================
          SCAN CARD
          ====================================================== */}

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="p-6 border-b border-gray-100">

          <h2 className="text-xl font-bold text-gray-900">
            QR Attendance
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Scan the QR code displayed on the attendance monitor.
          </p>

        </div>

        <div className="p-8">

          {!scannerOpen ? (

            <div className="max-w-md mx-auto text-center">

              <div className="mx-auto h-24 w-24 rounded-3xl bg-indigo-50 flex items-center justify-center">

                <QrCode className="h-12 w-12 text-indigo-600" />

              </div>

              <h3 className="mt-6 text-2xl font-bold text-gray-900">
                {todayRecord?.checkOut
                  ? 'Attendance Completed'
                  : todayRecord?.checkIn
                    ? 'Ready for Check-Out'
                    : 'Ready for Check-In'}
              </h3>

              <p className="mt-2 text-gray-500">
                {todayRecord?.checkOut
                  ? 'You have completed your attendance for today.'
                  : 'Open your camera and scan the live QR code.'}
              </p>

              {!todayRecord?.checkOut && (

                <button
                  type="button"
                  onClick={
                    startScanner
                  }
                  className="mt-7 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold"
                >
                  <ScanLine className="h-5 w-5" />

                  {todayRecord?.checkIn
                    ? 'Scan to Check Out'
                    : 'Scan to Check In'}

                </button>

              )}

            </div>

          ) : (

            <div className="max-w-xl mx-auto">

              {scannerStatus ===
                'success' ? (

                <div className="text-center py-10">

                  <div className="mx-auto h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">

                    <CheckCircle2 className="h-12 w-12 text-green-600" />

                  </div>

                  <h3 className="mt-6 text-2xl font-bold text-green-600">
                    Success!
                  </h3>

                  <p className="mt-3 text-lg text-gray-700">
                    {scannerMessage}
                  </p>

                </div>

              ) : (

                <>

                  <div
                    id="staffhub-qr-reader"
                    className="w-full overflow-hidden rounded-2xl"
                  />

                  <div className="mt-5 text-center">

                    <p
                      className={`text-sm ${
                        scannerStatus ===
                        'error'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {scannerMessage}
                    </p>

                    <button
                      type="button"
                      onClick={
                        stopScanner
                      }
                      className="mt-5 px-5 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>

                  </div>

                </>

              )}

            </div>

          )}

        </div>

      </div>

      {/* ======================================================
          HISTORY
          ====================================================== */}

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="p-6 border-b border-gray-100">

          <h2 className="text-lg font-bold text-gray-900">
            Attendance History
          </h2>

        </div>

        {history.length === 0 ? (

          <div className="p-8 text-center text-gray-500">
            No attendance records yet.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left px-6 py-4">
                    Date
                  </th>

                  <th className="text-left px-6 py-4">
                    Check In
                  </th>

                  <th className="text-left px-6 py-4">
                    Check Out
                  </th>

                  <th className="text-left px-6 py-4">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {history.map(
                  (record) => (
                    <tr
                      key={
                        record.id
                      }
                      className="border-t border-gray-100"
                    >

                      <td className="px-6 py-4">
                        {record.date}
                      </td>

                      <td className="px-6 py-4">
                        {record.checkIn ||
                          '--'}
                      </td>

                      <td className="px-6 py-4">
                        {record.checkOut ||
                          '--'}
                      </td>

                      <td className="px-6 py-4">

                        <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                          {record.status}
                        </span>

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




/*import { useState, useEffect } from 'react';
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

  
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <StatCard title="Present" value={summary.present} icon={<UserCheck className="h-5 w-5" />} color="green" />
          <StatCard title="Late" value={summary.late} icon={<Clock className="h-5 w-5" />} color="amber" />
          <StatCard title="Absent" value={summary.absent} icon={<UserX className="h-5 w-5" />} color="red" />
          <StatCard title="On Leave" value={summary.onLeave} icon={<CalendarDays className="h-5 w-5" />} color="purple" />
          <StatCard title="Half Day" value={summary.halfDay} icon={<AlertTriangle className="h-5 w-5" />} color="info" />
        </div>
      )}

     
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
*/