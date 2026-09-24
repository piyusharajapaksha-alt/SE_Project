import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, StatCard } from '@/components/ui';
import {
  Clock,
  QrCode,
  UserCheck,
  LogOut,
  Camera,
  X,
  RefreshCw,
} from 'lucide-react';
import {
  getEmployeeTodayAttendance,
  getEmployeeAttendanceHistory,
  scanAttendanceQr,
  type AttendanceRecord,
} from '@/services/attendanceQrService';
import { Html5Qrcode } from 'html5-qrcode';

export default function AttendancePage() {
  const { user } = useAuth();

  const [today, setToday] =
    useState<AttendanceRecord | null>(null);

  const [history, setHistory] =
    useState<AttendanceRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [scannerOpen, setScannerOpen] =
    useState(false);

  const [scanning, setScanning] =
    useState(false);

  const [scanMessage, setScanMessage] =
    useState('');

  const scannerRef =
    useRef<Html5Qrcode | null>(null);

  const loadingRef =
    useRef(false);

  const employeeIdentifier =
    user?.employeeId
      ? String(user.employeeId)
      : '';

  const loadAttendance = async () => {
    if (!employeeIdentifier) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [
        todayRecord,
        attendanceHistory,
      ] = await Promise.all([
        getEmployeeTodayAttendance(
          employeeIdentifier
        ),
        getEmployeeAttendanceHistory(
          employeeIdentifier
        ),
      ]);

      setToday(todayRecord);
      setHistory(attendanceHistory);
    } catch (error) {
      console.error(
        'Failed to load attendance:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [employeeIdentifier]);

  const stopScanner = async () => {
    const scanner =
      scannerRef.current;

    if (!scanner) {
      setScannerOpen(false);
      setScanning(false);
      return;
    }

    try {
      const state =
        scanner.getState();

      if (state === 2) {
        await scanner.stop();
      }
    } catch (error) {
      console.warn(
        'Failed to stop QR scanner:',
        error
      );
    }

    try {
      scanner.clear();
    } catch (error) {
      console.warn(
        'Failed to clear QR scanner:',
        error
      );
    }

    scannerRef.current = null;

    setScanning(false);
    setScannerOpen(false);
  };

  const handleQrScan = async (
    decodedText: string
  ) => {
    if (
      loadingRef.current ||
      !employeeIdentifier
    ) {
      return;
    }

    loadingRef.current = true;

    try {
      setScanMessage(
        'Processing attendance...'
      );

      /*
       * The QR contains the current backend-generated
       * QR token.
       *
       * Backend resolves EMP001 / EMP002 etc.
       * to the numeric employees.id.
       */
      const record =
        await scanAttendanceQr(
          employeeIdentifier,
          decodedText.trim()
        );

      setToday(record);

      setScanMessage(
        record.checkOut
          ? 'Attendance check-out recorded successfully.'
          : 'Attendance check-in recorded successfully.'
      );

      await stopScanner();

      /*
       * Reload the latest history after
       * successful check-in/check-out.
       */
      await loadAttendance();
    } catch (error) {
      console.error(
        'QR attendance error:',
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : 'Unable to mark attendance.';

      setScanMessage(message);
    } finally {
      loadingRef.current = false;
    }
  };

  const startScanner = async () => {
    if (!employeeIdentifier) {
      setScanMessage(
        'Employee ID is not available.'
      );
      return;
    }

    setScanMessage('');
    setScannerOpen(true);
    setScanning(false);

    /*
     * Give the scanner container time to
     * appear in the DOM.
     */
    window.setTimeout(async () => {
      try {
        const scanner =
          new Html5Qrcode(
            'attendance-qr-reader'
          );

        scannerRef.current =
          scanner;

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
            aspectRatio: 1,
          },
          async (
            decodedText
          ) => {
            await handleQrScan(
              decodedText
            );
          },
          () => {
            /*
             * Ignore normal QR scan-frame
             * errors while the camera is searching.
             */
          }
        );

        setScanning(true);
      } catch (error) {
        console.error(
          'Unable to start QR scanner:',
          error
        );

        setScanMessage(
          'Unable to access the camera. Please allow camera permission and try again.'
        );

        try {
          scannerRef.current?.clear();
        } catch {
          // Ignore cleanup errors.
        }

        scannerRef.current = null;
        setScanning(false);
      }
    }, 100);
  };

  useEffect(() => {
    return () => {
      const scanner =
        scannerRef.current;

      if (scanner) {
        try {
          if (scanner.getState() === 2) {
            scanner.stop().catch(() => {});
          }
        } catch {
          // Ignore cleanup errors.
        }
      }
    };
  }, []);

  const formatTime = (
    value: string | null
  ) => {
    if (!value) {
      return '--';
    }

    const date =
      new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleTimeString(
      [],
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  const formatDate = (
    value: string
  ) => {
    if (!value) {
      return '--';
    }

    const date =
      new Date(
        `${value}T00:00:00`
      );

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      [],
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }
    );
  };

  return (
    <div className="space-y-6">

      <PageHeader
        title="My Attendance"
        description="View your attendance records and mark attendance using the StaffHub QR monitor."
      />

      {/* =======================================================
          TODAY SUMMARY
      ======================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <StatCard
          title="Check In"
          value={formatTime(
            today?.checkIn ?? null
          )}
          icon={
            <UserCheck className="h-5 w-5" />
          }
          color="green"
        />

        <StatCard
          title="Check Out"
          value={formatTime(
            today?.checkOut ?? null
          )}
          icon={
            <LogOut className="h-5 w-5" />
          }
          color="purple"
        />

        <StatCard
          title="Status"
          value={
            today?.status ||
            'Not Marked'
          }
          icon={
            <Clock className="h-5 w-5" />
          }
          color="blue"
        />

      </div>

      {/* =======================================================
          QR ATTENDANCE
      ======================================================= */}

      <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">

        <div className="mx-auto h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
          <QrCode className="h-7 w-7 text-indigo-600" />
        </div>

        <h2 className="mt-4 text-xl font-bold text-gray-900">
          QR Attendance
        </h2>

        <p className="mt-2 text-sm text-gray-500 max-w-lg mx-auto">
          Scan the QR code displayed on the
          Attendance Monitor to check in or
          check out.
        </p>

        <button
          type="button"
          onClick={startScanner}
          disabled={
            !employeeIdentifier ||
            scannerOpen
          }
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Camera className="h-5 w-5" />

          Scan Attendance QR
        </button>

        {scanMessage && (
          <div className="mt-4 mx-auto max-w-lg rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-600">
            {scanMessage}
          </div>
        )}

      </div>

      {/* =======================================================
          QR SCANNER
      ======================================================= */}

      {scannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">

          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Scan Attendance QR
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Position the QR code inside
                  the scanning area.
                </p>
              </div>

              <button
                type="button"
                onClick={stopScanner}
                className="h-9 w-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="p-6">

              <div
                id="attendance-qr-reader"
                className="w-full overflow-hidden rounded-xl"
              />

              {!scanning && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Starting camera...
                </div>
              )}

              {scanMessage && (
                <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 text-center">
                  {scanMessage}
                </div>
              )}

            </div>

            <div className="px-6 pb-6">

              <button
                type="button"
                onClick={stopScanner}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =======================================================
          HISTORY
      ======================================================= */}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            Attendance History
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading attendance...
          </div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No attendance records available.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left px-6 py-4 font-semibold text-gray-700">
                    Date
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-gray-700">
                    Check In
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-gray-700">
                    Check Out
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-gray-700">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {history.map(
                  (record) => (
                    <tr
                      key={record.id}
                      className="border-t border-gray-100"
                    >

                      <td className="px-6 py-4 text-gray-900">
                        {formatDate(
                          record.attendanceDate
                        )}
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {formatTime(
                          record.checkIn
                        )}
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {formatTime(
                          record.checkOut
                        )}
                      </td>

                      <td className="px-6 py-4">

                        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
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