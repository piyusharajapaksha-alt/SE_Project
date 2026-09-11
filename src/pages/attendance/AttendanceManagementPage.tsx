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



import {
  activateMonitor,
  deactivateMonitor,
  getMonitorState,
  type QrMonitorState,
} from '@/services/attendanceMonitorService';



export default function AttendanceManagementPage() {
  const [
    monitor,
    setMonitor,
  ] = useState<QrMonitorState | null>(
    null
  );

  const [
    monitorKey,
    setMonitorKey,
  ] = useState('');



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

    setMonitor(
      getMonitorState()
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



  const handleActivateMonitor = () => {

    if (
      monitorKey.trim().length !== 6
    ) {

      addToast(
        'error',
        'Enter the 6-digit monitor key.',
        'error'
      );

      return;
    }

    try {

      const activated =
        activateMonitor(
          monitorKey,
          user?.email ||
          'Attendance Manager'
        );

      setMonitor(
        activated
      );

      setMonitorKey('');

      addToast(
        'success',
        'QR Monitor activated successfully.',
        'success'
      );

    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : 'Invalid monitor key.';

      addToast(
        'error',
        message,
        'error'
      );
    }
  };


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

  const handleDeactivateMonitor = () => {

    deactivateMonitor();

    setMonitor(
      getMonitorState()
    );

    addToast(
      'success',
      'QR Monitor deactivated.',
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





      {/* ======================================================
    QR MONITOR CONTROL
    ====================================================== */}

      <div className="
  bg-white
  border
  border-gray-200
  rounded-2xl
  shadow-sm
  overflow-hidden
">

        <div className="
    p-6
    border-b
    border-gray-100
  ">

          <div className="
      flex
      items-center
      gap-3
    ">

            <div className="
        h-11
        w-11
        rounded-xl
        bg-indigo-50
        flex
        items-center
        justify-center
      ">

              <Monitor className="
          h-6
          w-6
          text-indigo-600
        " />

            </div>

            <div>

              <h2 className="
          text-xl
          font-bold
          text-gray-900
        ">
                QR Monitor
              </h2>

              <p className="
          text-sm
          text-gray-500
        ">
                Activate the dedicated office gate QR screen.
              </p>

            </div>

          </div>

        </div>


        <div className="p-6">

          {monitor?.active ? (

            <div className="
        space-y-5
      ">

              {/* ACTIVE STATUS */}

              <div className="
          flex
          flex-col
          md:flex-row
          md:items-center
          md:justify-between
          gap-4
          p-5
          rounded-2xl
          bg-green-50
          border
          border-green-200
        ">

                <div>

                  <div className="
              flex
              items-center
              gap-2
            ">

                    <span className="
                h-3
                w-3
                rounded-full
                bg-green-500
                animate-pulse"
              />

              <h3 className="
                      text-lg
                      font-bold
                      text-green-800
              ">
                    QR Monitor is ACTIVE
                  </h3>

                </div>

                <p className="
              mt-1
              text-sm
              text-green-700
            ">
                  The office gate monitor can display the
                  attendance QR code.
                </p>

              </div>


              <button
                type="button"
                onClick={
                  handleDeactivateMonitor
                }
                className="
              px-5
              py-3
              bg-red-600
              hover:bg-red-700
              text-white
              rounded-xl
              font-semibold
            "
              >
                Deactivate Monitor
              </button>

            </div>


        {/* OPEN MONITOR */}

          <button
            type="button"
            onClick={() =>
              window.open(
                '/qrmonitor',
                '_blank',
                'noopener,noreferrer'
              )
            }
            className="
            w-full
            inline-flex
            items-center
            justify-center
            gap-2
            px-5
            py-4
            bg-indigo-600
            hover:bg-indigo-700
            text-white
            rounded-xl
            font-semibold
          "
          >

            <Monitor className="h-5 w-5" />

            Open QR Monitor

          </button>

        </div>

        ) : (

        <div className="
        space-y-5
      ">

          {/* URL */}

          <div className="
          p-4
          rounded-xl
          bg-gray-50
        ">

            <p className="
            text-xs
            text-gray-500
          ">
              Monitor URL
            </p>

            <p className="
            mt-1
            font-mono
            font-semibold
            text-gray-900
            break-all
          ">
              {window.location.origin}/qrmonitor
            </p>

          </div>


          {/* KEY INPUT */}

          <div>

            <label className="
            block
            text-sm
            font-semibold
            text-gray-700
            mb-2
          ">
              QR Monitor Pairing Key
            </label>

            <div className="
            flex
            flex-col
            sm:flex-row
            gap-3
          ">

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={monitorKey}
                onChange={(event) =>
                  setMonitorKey(
                    event.target.value
                      .replace(/\D/g, '')
                  )
                }
                placeholder="Enter 6-digit key"
                className="
                flex-1
                px-4
                py-3
                border
                border-gray-300
                rounded-xl
                text-lg
                tracking-[0.3em]
                font-bold
                focus:outline-none
                focus:ring-2
                focus:ring-indigo-500
              "
              />

              <button
                type="button"
                onClick={
                  handleActivateMonitor
                }
                className="
                px-6
                py-3
                bg-green-600
                hover:bg-green-700
                text-white
                rounded-xl
                font-semibold
              "
              >
                Activate Monitor
              </button>

            </div>

          </div>


          {/* OPEN MONITOR */}

          <button
            type="button"
            onClick={() =>
              window.open(
                '/qrmonitor',
                '_blank',
                'noopener,noreferrer'
              )
            }
            className="
            w-full
            inline-flex
            items-center
            justify-center
            gap-2
            px-5
            py-4
            border
            border-gray-200
            hover:bg-gray-50
            text-gray-700
            rounded-xl
            font-semibold
          "
          >

            <Monitor className="h-5 w-5" />

            Open QR Monitor

          </button>

        </div>

    )}

      </div>

    </div>

   // </div >





  );
}