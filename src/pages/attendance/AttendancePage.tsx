//import type { ReactNode } from 'react';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useLocation,
} from 'react-router-dom';

import {
  Clock,
  QrCode,
  ScanLine,
  CheckCircle2,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  Timer,
  Smartphone,
  XCircle,
} from 'lucide-react';

import {
  QRCodeSVG,
} from 'qrcode.react';

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
  attendanceService,
} from '@/services/dataServices';

import {
  createQrSession,
  getCurrentQrSession,
  getRemainingSeconds,
  getEmployeeTodayRecord,
  getEmployeeRecords,
  getTodayQrAttendance,
  checkInEmployee,
  checkOutEmployee,
  deactivateQrSession,
  type AttendanceQrSession,
  type QrAttendanceRecord,
} from '@/services/attendanceQrService';

import {
  PageHeader,
  Badge,
  StatCard,
  LoadingState,
  EmptyState,
} from '@/components/ui';


// ============================================================
// TYPES
// ============================================================

type ScannerStatus =
  | 'idle'
  | 'starting'
  | 'scanning'
  | 'success'
  | 'error';


// ============================================================
// MAIN PAGE
// ============================================================

export default function AttendancePage() {
  const {
    user,
    profile,
  } = useAuth();

  const {
    addToast,
  } = useToast();

  const location = useLocation();

  const isManagementView =
    location.pathname.startsWith(
      '/management/'
    );

  // ----------------------------------------------------------
  // Employee state
  // ----------------------------------------------------------

  const [
    todayRecord,
    setTodayRecord,
  ] = useState<QrAttendanceRecord | null>(null);

  const [
    employeeHistory,
    setEmployeeHistory,
  ] = useState<QrAttendanceRecord[]>([]);

  const [
    scannerOpen,
    setScannerOpen,
  ] = useState(false);

  const [
    scannerStatus,
    setScannerStatus,
  ] = useState<ScannerStatus>('idle');

  const [
    scannerMessage,
    setScannerMessage,
  ] = useState('');

  // ----------------------------------------------------------
  // Management state
  // ----------------------------------------------------------

  const [
    qrSession,
    setQrSession,
  ] = useState<AttendanceQrSession | null>(
    null
  );

  const [
    remainingSeconds,
    setRemainingSeconds,
  ] = useState(0);

  const [
    managementRecords,
    setManagementRecords,
  ] = useState<QrAttendanceRecord[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);


  // ==========================================================
  // EMPLOYEE DATA
  // ==========================================================

  const loadEmployeeAttendance =
    () => {
      if (!user?.employeeId) return;

      const record =
        getEmployeeTodayRecord(
          user.employeeId
        );

      setTodayRecord(record);

      setEmployeeHistory(
        getEmployeeRecords(
          user.employeeId
        )
      );
    };


  // ==========================================================
  // MANAGEMENT DATA
  // ==========================================================

  const loadManagementAttendance =
    async () => {
      setLoading(true);

      try {
        const qrRecords =
          getTodayQrAttendance();

        setManagementRecords(
          qrRecords
        );
      } finally {
        setLoading(false);
      }
    };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    if (isManagementView) {
      loadManagementAttendance();
    } else {
      loadEmployeeAttendance();
      setLoading(false);
    }
  }, [
    isManagementView,
    user?.employeeId,
  ]);


  // ==========================================================
  // QR SESSION TIMER
  // ==========================================================

  useEffect(() => {
    if (!isManagementView) return;

    const existing =
      getCurrentQrSession();

    if (existing) {
      setQrSession(existing);
      setRemainingSeconds(
        getRemainingSeconds()
      );
    }

    const timer =
      window.setInterval(() => {
        const seconds =
          getRemainingSeconds();

        setRemainingSeconds(
          seconds
        );

        if (seconds === 0) {
          setQrSession(null);
        }
      }, 1000);

    return () =>
      window.clearInterval(timer);
  }, [isManagementView]);


  // ==========================================================
  // GENERATE QR
  // ==========================================================

  const generateQr = () => {
    deactivateQrSession();

    const session =
      createQrSession();

    setQrSession(session);

    setRemainingSeconds(60);

    addToast('success',
      'Attendance QR code generated.',
      'success'
    );
  };


  // ==========================================================
  // CLOSE QR
  // ==========================================================

  const closeQr = () => {
    deactivateQrSession();

    setQrSession(null);

    setRemainingSeconds(0);
  };


  // ==========================================================
  // START SCANNER
  // ==========================================================

  const startScanner = async () => {
    setScannerOpen(true);

    setScannerStatus(
      'starting'
    );

    setScannerMessage(
      'Starting camera...'
    );

    await new Promise(
      (resolve) =>
        setTimeout(resolve, 300)
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
          facingMode: 'environment',
        },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
        },
        async (decodedText) => {
          try {
            await scanner.stop();

            await scanner.clear();

            handleScannedQr(
              decodedText
            );
          } catch (error) {
            console.error(
              error
            );
          }
        },
        () => {
          // Ignore normal scanner
          // frame failures.
        }
      );
    } catch (error) {
      console.error(
        'Camera error:',
        error
      );

      setScannerStatus(
        'error'
      );

      setScannerMessage(
        'Camera could not be started. Please allow camera permission and try again.'
      );
    }
  };


  // ==========================================================
  // STOP SCANNER
  // ==========================================================

  const stopScanner = async () => {
    try {
      const scanner =
        new Html5Qrcode(
          'staffhub-qr-reader'
        );

      if (
        scanner.getState() === 2
      ) {
        await scanner.stop();
      }
    } catch {
      // Scanner may already
      // have been stopped.
    }

    setScannerOpen(false);

    setScannerStatus(
      'idle'
    );

    setScannerMessage('');
  };


  // ==========================================================
  // HANDLE QR
  // ==========================================================

  const handleScannedQr = (
    token: string
  ) => {
    if (!user?.employeeId) {
      addToast('error',
        'Employee information is not available.',
        'error'
      );

      return;
    }

    try {
      const employeeName =
        `${profile?.firstName || ''} ${
          profile?.lastName || ''
        }`.trim() ||
        'Employee';

      let record;

      if (!todayRecord) {
        record =
          checkInEmployee(
            user.employeeId,
            employeeName,
            token
          );

        addToast('success',
          `Check-in successful at ${record.checkIn}.`,
          'success'
        );
      } else {
        record =
          checkOutEmployee(
            user.employeeId,
            token
          );

        addToast('success',
          `Check-out successful at ${record.checkOut}.`,
          'success'
        );
      }

      setTodayRecord(
        record
      );

      setEmployeeHistory(
        getEmployeeRecords(
          user.employeeId
        )
      );

      setScannerStatus(
        'success'
      );

      setScannerMessage(
        !todayRecord
          ? 'Check-in completed successfully.'
          : 'Check-out completed successfully.'
      );

      setTimeout(() => {
        setScannerOpen(false);
        setScannerStatus('idle');
      }, 1200);

    } catch (error: any) {
      setScannerStatus(
        'error'
      );

      setScannerMessage(
        error?.message ||
          'Unable to record attendance.'
      );

      addToast(
        error?.message ||
          'Attendance failed.',
        'error'
      );
    }
  };


  // ==========================================================
  // MANAGEMENT STATS
  // ==========================================================

  const managementStats =
    useMemo(() => {
      const present =
        managementRecords.filter(
          (r) =>
            r.status === 'Present'
        ).length;

      const late =
        managementRecords.filter(
          (r) =>
            r.status === 'Late'
        ).length;

      const checkedOut =
        managementRecords.filter(
          (r) =>
            !!r.checkOut
        ).length;

      return {
        present,
        late,
        checkedOut,
      };
    }, [
      managementRecords,
    ]);


  // ==========================================================
  // EMPLOYEE VIEW
  // ==========================================================

  if (!isManagementView) {
    return (
      <EmployeeAttendanceView
        todayRecord={todayRecord}
        history={employeeHistory}
        scannerOpen={scannerOpen}
        scannerStatus={scannerStatus}
        scannerMessage={scannerMessage}
        onOpenScanner={startScanner}
        onCloseScanner={stopScanner}
      />
    );
  }


  // ==========================================================
  // MANAGEMENT VIEW
  // ==========================================================

  return (
    <div className="space-y-6">

      <PageHeader
        title="Attendance Management"
        description="Generate secure QR codes and monitor employee attendance."
      />

      {/* =====================================================
          MANAGEMENT STATS
          ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <StatCard
          title="Checked In"
          value={managementStats.present}
          icon={
            <UserCheck className="h-5 w-5" />
          }
          color="green"
        />

        <StatCard
          title="Late"
          value={managementStats.late}
          icon={
            <Clock className="h-5 w-5" />
          }
          color="amber"
        />

        <StatCard
          title="Checked Out"
          value={managementStats.checkedOut}
          icon={
            <LogOut className="h-5 w-5" />
          }
          color="purple"
        />

      </div>


      {/* =====================================================
          QR GENERATOR
          ===================================================== */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        <div className="p-6 border-b border-gray-100 flex items-center justify-between gap-4">

          <div>

            <div className="flex items-center gap-2">

              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">

                <QrCode className="h-5 w-5 text-indigo-600" />

              </div>

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Attendance QR Code
                </h2>

                <p className="text-sm text-gray-500">
                  Employees scan this code to record attendance.
                </p>

              </div>

            </div>

          </div>


          {qrSession && remainingSeconds > 0 && (

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium">

              <Timer className="h-4 w-4" />

              Active · {remainingSeconds}s

            </div>

          )}

        </div>


        <div className="p-6">

          {!qrSession || remainingSeconds <= 0 ? (

            <div className="text-center py-10">

              <div className="mx-auto h-20 w-20 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5">

                <QrCode className="h-10 w-10 text-indigo-600" />

              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                No active QR code
              </h3>

              <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
                Generate a temporary QR code for employees to scan.
                Each QR code automatically expires after 60 seconds.
              </p>

              <button
                type="button"
                onClick={generateQr}
                className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition"
              >
                <QrCode className="h-5 w-5" />
                Generate QR Code
              </button>

            </div>

          ) : (

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

              {/* QR */}

              <div className="flex flex-col items-center">

                <div className="p-5 bg-white rounded-2xl border-2 border-gray-100 shadow-sm">

                  <QRCodeSVG
                    value={qrSession.token}
                    size={280}
                    level="H"
                    includeMargin
                  />

                </div>

                <div className="mt-5 text-center">

                  <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">

                    <CheckCircle2 className="h-5 w-5" />

                    QR Code Active

                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    Expires in {remainingSeconds} seconds
                  </p>

                </div>

                <div className="flex gap-3 mt-5">

                  <button
                    type="button"
                    onClick={generateQr}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    New QR
                  </button>

                  <button
                    type="button"
                    onClick={closeQr}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Stop
                  </button>

                </div>

              </div>


              {/* Instructions */}

              <div>

                <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-5">

                  <div className="flex items-start gap-3">

                    <ShieldCheck className="h-6 w-6 text-indigo-600 mt-0.5" />

                    <div>

                      <h3 className="font-semibold text-gray-900">
                        Secure attendance session
                      </h3>

                      <p className="text-sm text-gray-600 mt-1">
                        This QR code contains a temporary
                        attendance token. It expires automatically
                        after 60 seconds.
                      </p>

                    </div>

                  </div>

                </div>


                <div className="mt-5 space-y-4">

                  <Instruction
                    number="1"
                    icon={
                      <Smartphone className="h-5 w-5" />
                    }
                    title="Employee opens Attendance"
                    text="The employee opens the Attendance page after logging in."
                  />

                  <Instruction
                    number="2"
                    icon={
                      <ScanLine className="h-5 w-5" />
                    }
                    title="Employee scans QR"
                    text="The employee uses the phone camera scanner to scan this QR code."
                  />

                  <Instruction
                    number="3"
                    icon={
                      <CheckCircle2 className="h-5 w-5" />
                    }
                    title="Attendance recorded"
                    text="The system records check-in or check-out with the current time."
                  />

                </div>

              </div>

            </div>

          )}

        </div>

      </div>


      {/* =====================================================
          TODAY'S RECORDS
          ===================================================== */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        <div className="p-6 border-b border-gray-100 flex items-center justify-between">

          <div>

            <h2 className="text-lg font-semibold text-gray-900">
              Today's QR Attendance
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Employees who recorded attendance using QR.
            </p>

          </div>

          <button
            type="button"
            onClick={() => {
              loadManagementAttendance();

              addToast('success',
                'Attendance records refreshed.',
                'success'
              );
            }}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

        </div>


        {loading ? (

          <div className="p-8">
            <LoadingState />
          </div>

        ) : managementRecords.length === 0 ? (

          <div className="p-8">

            <EmptyState
              icon={
                <Users className="h-6 w-6" />
              }
              title="No QR attendance yet"
            />

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left py-3 px-5 font-medium text-gray-600">
                    Employee
                  </th>

                  <th className="text-left py-3 px-5 font-medium text-gray-600">
                    Employee ID
                  </th>

                  <th className="text-left py-3 px-5 font-medium text-gray-600">
                    Check In
                  </th>

                  <th className="text-left py-3 px-5 font-medium text-gray-600">
                    Check Out
                  </th>

                  <th className="text-left py-3 px-5 font-medium text-gray-600">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {managementRecords.map(
                  (record) => (

                    <tr
                      key={record.id}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >

                      <td className="py-4 px-5">

                        <div className="font-medium text-gray-900">
                          {record.employeeName}
                        </div>

                      </td>

                      <td className="py-4 px-5 text-gray-600">
                        {record.employeeId}
                      </td>

                      <td className="py-4 px-5 text-gray-600">
                        {record.checkIn || '-'}
                      </td>

                      <td className="py-4 px-5 text-gray-600">
                        {record.checkOut || '-'}
                      </td>

                      <td className="py-4 px-5">

                        <Badge
                          variant={
                            record.status === 'Present'
                              ? 'success'
                              : record.status === 'Late'
                              ? 'warning'
                              : 'danger'
                          }
                          dot
                        >
                          {record.status}
                        </Badge>

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


// ============================================================
// EMPLOYEE ATTENDANCE VIEW
// ============================================================

function EmployeeAttendanceView({
  todayRecord,
  history,
  scannerOpen,
  scannerStatus,
  scannerMessage,
  onOpenScanner,
  onCloseScanner,
}: {
  todayRecord: QrAttendanceRecord | null;
  history: QrAttendanceRecord[];
  scannerOpen: boolean;
  scannerStatus: ScannerStatus;
  scannerMessage: string;
  onOpenScanner: () => void;
  onCloseScanner: () => void;
}) {

  const canCheckIn =
    !todayRecord?.checkIn;

  const canCheckOut =
    !!todayRecord?.checkIn &&
    !todayRecord?.checkOut;


  return (
    <div className="space-y-6">

      <PageHeader
        title="My Attendance"
        description="Record your daily attendance by scanning the StaffHub QR code."
      />


      {/* =====================================================
          TODAY
          ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

          <div className="flex items-start justify-between gap-4">

            <div>

              <p className="text-sm text-gray-500">
                Today's attendance
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                {todayRecord
                  ? todayRecord.status
                  : 'Not Checked In'}
              </h2>

            </div>

            <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center">

              {todayRecord ? (
                <CheckCircle2 className="h-6 w-6 text-indigo-600" />
              ) : (
                <Clock className="h-6 w-6 text-indigo-600" />
              )}

            </div>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Check In
              </p>

              <p className="text-xl font-semibold text-gray-900 mt-1">
                {todayRecord?.checkIn || '--:--'}
              </p>

            </div>


            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Check Out
              </p>

              <p className="text-xl font-semibold text-gray-900 mt-1">
                {todayRecord?.checkOut || '--:--'}
              </p>

            </div>

          </div>


          {/* Action */}

          <div className="mt-6">

            {canCheckIn && (

              <button
                type="button"
                onClick={onOpenScanner}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition"
              >
                <ScanLine className="h-5 w-5" />
                Scan QR to Check In
              </button>

            )}


            {canCheckOut && (

              <button
                type="button"
                onClick={onOpenScanner}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition"
              >
                <ScanLine className="h-5 w-5" />
                Scan QR to Check Out
              </button>

            )}


            {!canCheckIn &&
              !canCheckOut && (

                <div className="inline-flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-xl font-medium">

                  <CheckCircle2 className="h-5 w-5" />

                  Attendance completed for today

                </div>

              )}

          </div>

        </div>


        {/* Status */}

        <div className="bg-indigo-600 rounded-2xl p-6 text-white">

          <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center">

            <QrCode className="h-6 w-6" />

          </div>

          <h3 className="text-lg font-semibold mt-5">
            QR Attendance
          </h3>

          <p className="text-sm text-indigo-100 mt-2 leading-6">
            Scan the temporary QR code displayed
            by your HR manager or department manager.
          </p>

          <div className="mt-6 space-y-3 text-sm">

            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Secure temporary QR
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Automatic time recording
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Check-in and check-out
            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          SCANNER
          ===================================================== */}

      {scannerOpen && (

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          <div className="p-5 border-b border-gray-100 flex items-center justify-between">

            <div>

              <h2 className="font-semibold text-gray-900">
                Scan Attendance QR
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Position the QR code inside the camera box.
              </p>

            </div>

            <button
              type="button"
              onClick={onCloseScanner}
              className="h-9 w-9 rounded-lg hover:bg-gray-100 flex items-center justify-center"
            >
              <XCircle className="h-5 w-5 text-gray-500" />
            </button>

          </div>


          <div className="p-6">

            <div className="max-w-md mx-auto">

              <div
                id="staffhub-qr-reader"
                className="overflow-hidden rounded-2xl border border-gray-200"
              />


              {scannerStatus === 'success' && (

                <div className="mt-4 p-4 rounded-xl bg-green-50 text-green-700 flex items-center gap-3">

                  <CheckCircle2 className="h-5 w-5" />

                  <span className="text-sm font-medium">
                    {scannerMessage}
                  </span>

                </div>

              )}


              {scannerStatus === 'error' && (

                <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-700 flex items-center gap-3">

                  <XCircle className="h-5 w-5" />

                  <span className="text-sm font-medium">
                    {scannerMessage}
                  </span>

                </div>

              )}


              {scannerStatus === 'scanning' && (

                <div className="mt-4 p-4 rounded-xl bg-indigo-50 text-indigo-700 flex items-center gap-3">

                  <ScanLine className="h-5 w-5" />

                  <span className="text-sm">
                    {scannerMessage}
                  </span>

                </div>

              )}

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          HISTORY
          ===================================================== */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        <div className="p-6 border-b border-gray-100">

          <h2 className="text-lg font-semibold text-gray-900">
            QR Attendance History
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Attendance records recorded through QR scanning.
          </p>

        </div>


        {history.length === 0 ? (

          <div className="p-8">

            <EmptyState
              icon={
                <Clock className="h-6 w-6" />
              }
              title="No QR attendance records yet"
            />

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left py-3 px-5 font-medium text-gray-600">
                    Date
                  </th>

                  <th className="text-left py-3 px-5 font-medium text-gray-600">
                    Check In
                  </th>

                  <th className="text-left py-3 px-5 font-medium text-gray-600">
                    Check Out
                  </th>

                  <th className="text-left py-3 px-5 font-medium text-gray-600">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {history.map(
                  (record) => (

                    <tr
                      key={record.id}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >

                      <td className="py-4 px-5 text-gray-700">
                        {record.date}
                      </td>

                      <td className="py-4 px-5 text-gray-700">
                        {record.checkIn || '-'}
                      </td>

                      <td className="py-4 px-5 text-gray-700">
                        {record.checkOut || '-'}
                      </td>

                      <td className="py-4 px-5">

                        <Badge
                          variant={
                            record.status === 'Present'
                              ? 'success'
                              : record.status === 'Late'
                              ? 'warning'
                              : 'danger'
                          }
                          dot
                        >
                          {record.status}
                        </Badge>

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


// ============================================================
// INSTRUCTION COMPONENT
// ============================================================

function Instruction({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {

  return (
    <div className="flex gap-4">

      <div className="relative">

        <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">
          {number}
        </div>

      </div>

      <div className="flex-1">

        <div className="flex items-center gap-2">

          <span className="text-indigo-600">
            {icon}
          </span>

          <h4 className="font-medium text-gray-900">
            {title}
          </h4>

        </div>

        <p className="text-sm text-gray-500 mt-1 leading-5">
          {text}
        </p>

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