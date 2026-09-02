import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  Clock,
  Play,
  Square,
  QrCode,
  Monitor,
  Users,
  CheckCircle2,
} from 'lucide-react';

import {
  useAuth,
} from '@/contexts/AuthContext';

import {
  useToast,
} from '@/contexts/ToastContext';

import {
  getAttendanceSession,
  getTodayQrAttendance,
  startAttendanceSession,
  stopAttendanceSession,
  type AttendanceSession,
  type QrAttendanceRecord,
} from '@/services/attendanceQrService';

import {
  PageHeader,
  StatCard,
} from '@/components/ui';

export default function AttendanceManagementPage() {
  const {
    user,
  } = useAuth();

  const {
    addToast,
  } = useToast();

  const navigate =
    useNavigate();

  const [
    session,
    setSession,
  ] =
    useState<AttendanceSession | null>(
      null
    );

  const [
    records,
    setRecords,
  ] =
    useState<QrAttendanceRecord[]>(
      []
    );

  const loadData = () => {
    setSession(
      getAttendanceSession()
    );

    setRecords(
      getTodayQrAttendance()
    );
  };

  useEffect(() => {
    loadData();

    const timer =
      window.setInterval(
        loadData,
        1000
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, []);

  useEffect(() => {
    const handleStorage =
      () => loadData();

    window.addEventListener(
      'storage',
      handleStorage
    );

    return () =>
      window.removeEventListener(
        'storage',
        handleStorage
      );
  }, []);

  const handleStart =
    () => {
      const startedBy =
        user?.email ||
        'HR Manager';

      const newSession =
        startAttendanceSession(
          startedBy
        );

      setSession(
        newSession
      );

      addToast(
        'success',
        'Attendance session started.',
        'success'
      );
    };

  const handleStop =
    () => {
      stopAttendanceSession();

      setSession(
        getAttendanceSession()
      );

      addToast(
        'success',
        'Attendance session stopped.',
        'success'
      );
    };

  const checkedIn =
    records.filter(
      (record) =>
        Boolean(
          record.checkIn
        )
    ).length;

  const checkedOut =
    records.filter(
      (record) =>
        Boolean(
          record.checkOut
        )
    ).length;

  const currentlyPresent =
    records.filter(
      (record) =>
        record.checkIn &&
        !record.checkOut
    ).length;

  return (
    <div className="space-y-6">

      <PageHeader
        title="Attendance Management"
        description="Start and stop the employee QR attendance session."
      />

      {/* ======================================================
          SESSION CONTROL
          ====================================================== */}

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="p-6 border-b border-gray-100">

          <div className="flex items-center gap-3">

            <div className="h-11 w-11 rounded-xl bg-indigo-50 flex items-center justify-center">

              <QrCode className="h-6 w-6 text-indigo-600" />

            </div>

            <div>

              <h2 className="text-xl font-bold text-gray-900">
                QR Attendance Session
              </h2>

              <p className="text-sm text-gray-500">
                HR controls the attendance session from here.
              </p>

            </div>

          </div>

        </div>

        <div className="p-6">

          {session?.active ? (

            <div className="space-y-6">

              {/* ACTIVE */}

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 p-5 rounded-2xl bg-green-50 border border-green-200">

                <div className="flex items-center gap-4">

                  <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">

                    <CheckCircle2 className="h-7 w-7 text-green-600" />

                  </div>

                  <div>

                    <div className="flex items-center gap-2">

                      <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />

                      <h3 className="text-lg font-bold text-green-800">
                        Attendance is LIVE
                      </h3>

                    </div>

                    <p className="text-sm text-green-700 mt-1">
                      Employees can scan the QR code now.
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    handleStop
                  }
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold"
                >
                  <Square className="h-4 w-4" />
                  Stop Attendance
                </button>

              </div>

              {/* SESSION INFORMATION */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="p-4 rounded-xl bg-gray-50">

                  <p className="text-xs text-gray-500">
                    Started By
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {session.startedBy}
                  </p>

                </div>

                <div className="p-4 rounded-xl bg-gray-50">

                  <p className="text-xs text-gray-500">
                    Started At
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {new Date(
                      session.startedAt
                    ).toLocaleTimeString()}
                  </p>

                </div>

              </div>

              {/* MONITOR BUTTON */}

              <div className="flex flex-col md:flex-row gap-3">

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      '/management/attendance/monitor'
                    )
                  }
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold"
                >

                  <Monitor className="h-5 w-5" />

                  Open QR Monitor

                </button>

              </div>

            </div>

          ) : (

            <div className="text-center py-10">

              <div className="mx-auto h-20 w-20 rounded-2xl bg-gray-100 flex items-center justify-center">

                <QrCode className="h-10 w-10 text-gray-500" />

              </div>

              <h3 className="mt-5 text-xl font-bold text-gray-900">
                Attendance is not running
              </h3>

              <p className="mt-2 max-w-lg mx-auto text-sm text-gray-500">
                Start the attendance session when employees
                should begin checking in.
              </p>

              <button
                type="button"
                onClick={
                  handleStart
                }
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold"
              >

                <Play className="h-5 w-5" />

                Start Attendance

              </button>

            </div>

          )}

        </div>

      </div>

      {/* ======================================================
          TODAY STATS
          ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <StatCard
          title="Checked In"
          value={checkedIn}
          icon={
            <Users className="h-5 w-5" />
          }
          color="green"
        />

        <StatCard
          title="Currently Present"
          value={currentlyPresent}
          icon={
            <Clock className="h-5 w-5" />
          }
          color="blue"
        />

        <StatCard
          title="Checked Out"
          value={checkedOut}
          icon={
            <CheckCircle2 className="h-5 w-5" />
          }
          color="purple"
        />

      </div>

    </div>
  );
}