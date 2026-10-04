import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  useAuth,
} from '@/contexts/AuthContext';

import {
  useToast,
} from '@/contexts/ToastContext';

import {
  PageHeader,
  StatCard,
} from '@/components/ui';

import {
  Clock,
  QrCode,
  Users,
  Play,
  Square,
  RefreshCw,
  CalendarClock,
  Activity,
  Trash2,
  ShieldCheck,
  XCircle,
  Building2,
} from 'lucide-react';

import {
  getAcceptedAttendanceMonitors,
  authorizeAttendanceMonitor,
  activateAttendanceMonitor,
  deactivateAttendanceMonitor,
  rejectAttendanceMonitor,
  rotateAttendanceQr,
  getAttendanceRecords,
  getAttendanceSummary,
  getAttendanceEvents,
  getAttendanceSchedules,
  createAttendanceSchedule,
  deleteAttendanceSchedule,
  type AttendanceMonitor,
  type AttendanceRecord,
  type AttendanceSummary,
  type AttendanceEvent,
  type AttendanceSchedule,
} from '@/services/attendanceQrService';

export default function AttendanceManagementPage() {
  const { user } = useAuth();

  const { addToast } =
    useToast();

  // ============================================================
  // STATE
  // ============================================================

  const [monitors, setMonitors] =
    useState<AttendanceMonitor[]>(
      []
    );

  const [records, setRecords] =
    useState<AttendanceRecord[]>(
      []
    );

  const [summary, setSummary] =
    useState<AttendanceSummary | null>(
      null
    );

  const [events, setEvents] =
    useState<AttendanceEvent[]>(
      []
    );

  const [schedules, setSchedules] =
    useState<AttendanceSchedule[]>(
      []
    );

  const [loading, setLoading] =
    useState(true);

  const [activationCode, setActivationCode] =
    useState('');

  const [selectedDate, setSelectedDate] =
    useState(
      new Date()
        .toISOString()
        .slice(0, 10)
    );

  const [scheduleName, setScheduleName] =
    useState('');

  const [scheduleType, setScheduleType] =
    useState<
      'ONCE' |
      'DAILY' |
      'WEEKLY'
    >('DAILY');

  const [scheduleDate, setScheduleDate] =
    useState('');

  const [dayOfWeek, setDayOfWeek] =
    useState('MONDAY');

  const [startTime, setStartTime] =
    useState('08:00');

  const [endTime, setEndTime] =
    useState('17:00');

  const [creatingSchedule, setCreatingSchedule] =
    useState(false);

  const [monitorActionId, setMonitorActionId] =
    useState<number | null>(
      null
    );

  // ============================================================
  // LOAD
  // ============================================================

  const load = useCallback(
    async () => {
      try {
        setLoading(true);

        const [
          monitorData,
          recordsData,
          summaryData,
          eventsData,
          schedulesData,
        ] =
          await Promise.all([
            getAcceptedAttendanceMonitors(),

            getAttendanceRecords(
              selectedDate
            ),

            getAttendanceSummary(
              selectedDate
            ),

            getAttendanceEvents(
              50
            ),

            getAttendanceSchedules(),
          ]);

        setMonitors(
          Array.isArray(
            monitorData
          )
            ? monitorData
            : []
        );

        setRecords(
          Array.isArray(
            recordsData
          )
            ? recordsData
            : []
        );

        setSummary(
          summaryData
        );

        setEvents(
          Array.isArray(
            eventsData
          )
            ? eventsData
            : []
        );

        setSchedules(
          Array.isArray(
            schedulesData
          )
            ? schedulesData
            : []
        );
      } catch (error: any) {
        console.error(
          'Attendance management error:',
          error
        );

        addToast(
          'error',
          error?.message ||
            'Unable to load attendance management data'
        );
      } finally {
        setLoading(false);
      }
    },
    [
      selectedDate,
      addToast,
    ]
  );

  useEffect(() => {
    void load();
  }, [load]);

  // ============================================================
  // AUTO REFRESH
  // ============================================================

  useEffect(() => {
    const timer =
      window.setInterval(
        () => {
          void load();
        },
        5000
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [load]);

  // ============================================================
  // AUTHORIZE MONITOR
  // ============================================================

  const authorize = async () => {
    const code =
      activationCode.trim();

    if (
      !/^\d{6}$/.test(code)
    ) {
      addToast(
        'error',
        'Enter the six-digit monitor activation code'
      );

      return;
    }

    try {
      setMonitorActionId(
        -1
      );

      await authorizeAttendanceMonitor(
        code
      );

      setActivationCode('');

      addToast(
        'success',
        'Attendance monitor accepted successfully'
      );

      await load();
    } catch (error: any) {
      console.error(
        'Authorize monitor error:',
        error
      );

      addToast(
        'error',
        error?.message ||
          'Invalid or already accepted monitor code'
      );
    } finally {
      setMonitorActionId(
        null
      );
    }
  };

  // ============================================================
  // ACTIVATE
  // ============================================================

  const activate = async (
    monitorId: number
  ) => {
    try {
      setMonitorActionId(
        monitorId
      );

      await activateAttendanceMonitor(
        monitorId
      );

      addToast(
        'success',
        'Attendance monitor activated'
      );

      await load();
    } catch (error: any) {
      console.error(
        'Activate monitor error:',
        error
      );

      addToast(
        'error',
        error?.message ||
          'Unable to activate attendance monitor'
      );
    } finally {
      setMonitorActionId(
        null
      );
    }
  };

  // ============================================================
  // DEACTIVATE
  // ============================================================

  const deactivate = async (
    monitorId: number
  ) => {
    try {
      setMonitorActionId(
        monitorId
      );

      await deactivateAttendanceMonitor(
        monitorId
      );

      addToast(
        'success',
        'Attendance monitor deactivated'
      );

      await load();
    } catch (error: any) {
      console.error(
        'Deactivate monitor error:',
        error
      );

      addToast(
        'error',
        error?.message ||
          'Unable to deactivate attendance monitor'
      );
    } finally {
      setMonitorActionId(
        null
      );
    }
  };

  // ============================================================
  // ROTATE
  // ============================================================

  const rotate = async (
    monitorId: number
  ) => {
    try {
      setMonitorActionId(
        monitorId
      );

      await rotateAttendanceQr(
        monitorId
      );

      addToast(
        'success',
        'QR code rotated successfully'
      );

      await load();
    } catch (error: any) {
      console.error(
        'Rotate QR error:',
        error
      );

      addToast(
        'error',
        error?.message ||
          'Unable to rotate QR code'
      );
    } finally {
      setMonitorActionId(
        null
      );
    }
  };

  // ============================================================
  // REJECT
  // ============================================================

  const reject = async (
    monitorId: number
  ) => {
    const confirmed =
      window.confirm(
        'Reject this attendance monitor? It will no longer belong to this company and must be accepted again using its new activation code.'
      );

    if (!confirmed) {
      return;
    }

    try {
      setMonitorActionId(
        monitorId
      );

      await rejectAttendanceMonitor(
        monitorId
      );

      addToast(
        'success',
        'Attendance monitor rejected'
      );

      await load();
    } catch (error: any) {
      console.error(
        'Reject monitor error:',
        error
      );

      addToast(
        'error',
        error?.message ||
          'Unable to reject attendance monitor'
      );
    } finally {
      setMonitorActionId(
        null
      );
    }
  };

  // ============================================================
  // CREATE SCHEDULE
  // ============================================================

  const createSchedule = async () => {
    const name =
      scheduleName.trim();

    if (!name) {
      addToast(
        'error',
        'Enter a schedule name'
      );

      return;
    }

    if (
      scheduleType === 'ONCE' &&
      !scheduleDate
    ) {
      addToast(
        'error',
        'Select a schedule date'
      );

      return;
    }

    if (
      !startTime ||
      !endTime
    ) {
      addToast(
        'error',
        'Select start and end times'
      );

      return;
    }

    try {
      setCreatingSchedule(
        true
      );

      await createAttendanceSchedule(
        {
          scheduleName:
            name,

          scheduleType,

          scheduleDate:
            scheduleType === 'ONCE'
              ? scheduleDate
              : null,

          dayOfWeek:
            scheduleType === 'WEEKLY'
              ? dayOfWeek
              : null,

          startTime,

          endTime,

          enabled: true,

          createdBy:
            user?.employeeId
              ? String(
                  user.employeeId
                )
              : user?.email ||
                'SYSTEM',
        }
      );

      addToast(
        'success',
        'Attendance schedule created'
      );

      setScheduleName('');

      setScheduleDate('');

      await load();
    } catch (error: any) {
      console.error(
        'Create schedule error:',
        error
      );

      addToast(
        'error',
        error?.message ||
          'Unable to create schedule'
      );
    } finally {
      setCreatingSchedule(
        false
      );
    }
  };

  // ============================================================
  // DELETE SCHEDULE
  // ============================================================

  const removeSchedule = async (
    id: number
  ) => {
    try {
      await deleteAttendanceSchedule(
        id
      );

      addToast(
        'success',
        'Schedule deleted'
      );

      await load();
    } catch (error: any) {
      console.error(
        'Delete schedule error:',
        error
      );

      addToast(
        'error',
        error?.message ||
          'Unable to delete schedule'
      );
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">

      <PageHeader
        title="Attendance Management"
        description="Manage company attendance monitors, schedules and daily attendance records."
      />

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          title="Expected Today"
          value={
            summary?.expected ??
            0
          }
          icon={
            <Users className="h-5 w-5" />
          }
          color="blue"
        />

        <StatCard
          title="Attended"
          value={
            summary?.attended ??
            0
          }
          icon={
            <Clock className="h-5 w-5" />
          }
          color="green"
        />

        <StatCard
          title="Currently Working"
          value={
            summary?.currentlyWorking ??
            0
          }
          icon={
            <Activity className="h-5 w-5" />
          }
          color="purple"
        />

        <StatCard
          title="On Leave"
          value={
            summary?.onLeave ??
            0
          }
          icon={
            <CalendarClock className="h-5 w-5" />
          }
          color="purple"
        />

      </div>

      {/* =====================================================
          QR MONITOR MANAGEMENT
      ===================================================== */}

      <div className="bg-white border border-gray-200 rounded-2xl p-6">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          <div className="flex items-center gap-3">

            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">

              <QrCode className="h-5 w-5 text-indigo-600" />

            </div>

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                QR Monitor Management
              </h2>

              <p className="text-sm text-gray-500">
                Accept physical attendance monitors and manage their company access.
              </p>

            </div>

          </div>

          <div className="text-sm text-gray-500">

            {monitors.length}{' '}
            accepted monitor
            {monitors.length === 1
              ? ''
              : 's'}

          </div>

        </div>

        {/* AUTHORIZE */}

        <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">

          <div className="flex items-start gap-3">

            <ShieldCheck className="h-5 w-5 text-indigo-600 mt-0.5" />

            <div className="flex-1">

              <h3 className="font-semibold text-gray-900">
                Accept New Monitor
              </h3>

              <p className="text-sm text-gray-600 mt-1">
                Open the Attendance Monitor page on the physical monitor. Enter the six-digit code shown there.
              </p>

            </div>

          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">

            <input
              value={activationCode}
              onChange={(event) => {
                setActivationCode(
                  event.target.value
                    .replace(
                      /\D/g,
                      ''
                    )
                    .slice(
                      0,
                      6
                    )
                );
              }}
              maxLength={6}
              inputMode="numeric"
              placeholder="Enter 6-digit code"
              className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl tracking-[0.25em] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="button"
              onClick={authorize}
              disabled={
                monitorActionId ===
                  -1 ||
                activationCode.length !==
                  6
              }
              className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >

              {monitorActionId ===
              -1 ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}

              Accept Monitor

            </button>

          </div>

        </div>

        {/* ACCEPTED MONITORS */}

        <div className="mt-6">

          <h3 className="text-base font-bold text-gray-900">
            Accepted Monitors
          </h3>

          {monitors.length === 0 ? (

            <div className="mt-4 rounded-xl border border-dashed border-gray-300 p-8 text-center">

              <QrCode className="h-8 w-8 text-gray-400 mx-auto" />

              <p className="mt-3 text-sm text-gray-500">
                No attendance monitor has been accepted by this company.
              </p>

            </div>

          ) : (

            <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">

              {monitors.map(
                (monitor) => {

                  const busy =
                    monitorActionId ===
                    monitor.id;

                  return (
                    <div
                      key={
                        monitor.id
                      }
                      className="border border-gray-200 rounded-2xl p-5"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex items-center gap-3">

                          <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">

                            <QrCode className="h-5 w-5 text-gray-600" />

                          </div>

                          <div>

                            <h4 className="font-bold text-gray-900">
                              Monitor #
                              {monitor.id}
                            </h4>

                            <div className="flex items-center gap-1 text-sm text-gray-500">

                              <Building2 className="h-3.5 w-3.5" />

                              {monitor.companyName ||
                                'Current company'}

                            </div>

                          </div>

                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            monitor.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {monitor.active
                            ? 'LIVE'
                            : 'INACTIVE'}
                        </span>

                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">

                        <div className="rounded-xl bg-gray-50 p-3">

                          <p className="text-xs text-gray-500">
                            Authorized By
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900 truncate">
                            {monitor.authorizedBy ||
                              '--'}
                          </p>

                        </div>

                        <div className="rounded-xl bg-gray-50 p-3">

                          <p className="text-xs text-gray-500">
                            QR Sequence
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            #
                            {monitor.qrSequence}
                          </p>

                        </div>

                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">

                        {!monitor.active ? (

                          <button
                            type="button"
                            onClick={() =>
                              activate(
                                monitor.id
                              )
                            }
                            disabled={busy}
                            className="px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                          >

                            {busy ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}

                            Activate

                          </button>

                        ) : (

                          <button
                            type="button"
                            onClick={() =>
                              deactivate(
                                monitor.id
                              )
                            }
                            disabled={busy}
                            className="px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                          >

                            <Square className="h-4 w-4" />

                            Deactivate

                          </button>

                        )}

                        <button
                          type="button"
                          onClick={() =>
                            rotate(
                              monitor.id
                            )
                          }
                          disabled={
                            busy ||
                            !monitor.active
                          }
                          className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                        >

                          <RefreshCw className="h-4 w-4" />

                          Rotate QR

                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            reject(
                              monitor.id
                            )
                          }
                          disabled={busy}
                          className="px-4 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-red-50 disabled:opacity-50"
                        >

                          <XCircle className="h-4 w-4" />

                          Reject

                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          DATE
      ===================================================== */}

      <div className="bg-white border border-gray-200 rounded-2xl p-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>

            <h2 className="text-lg font-bold text-gray-900">
              Daily Attendance
            </h2>

            <p className="text-sm text-gray-500">
              View attendance records for a selected date.
            </p>

          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(event) =>
              setSelectedDate(
                event.target.value
              )
            }
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />

        </div>

      </div>

      {/* =====================================================
          RECORDS
      ===================================================== */}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        <div className="p-6 border-b border-gray-100">

          <h2 className="text-lg font-bold text-gray-900">
            Attendance Records
          </h2>

        </div>

        {records.length === 0 ? (

          <div className="p-8 text-center text-gray-500">
            No attendance records for this date.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left px-6 py-4">
                    Employee
                  </th>

                  <th className="text-left px-6 py-4">
                    Department
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

                  <th className="text-left px-6 py-4">
                    Method
                  </th>

                </tr>

              </thead>

              <tbody>

                {records.map(
                  (record) => (

                    <tr
                      key={record.id}
                      className="border-t border-gray-100"
                    >

                      <td className="px-6 py-4">

                        <div className="font-semibold text-gray-900">
                          {record.employeeName ||
                            '--'}
                        </div>

                        <div className="text-xs text-gray-500">
                          {record.employeeNumber ||
                            '--'}
                        </div>

                      </td>

                      <td className="px-6 py-4">
                        {record.department ||
                          '--'}
                      </td>

                      <td className="px-6 py-4">
                        {formatDateTime(
                          record.checkIn
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {formatDateTime(
                          record.checkOut
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {record.status ||
                          '--'}
                      </td>

                      <td className="px-6 py-4">
                        {record.checkInMethod ||
                          '--'}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =====================================================
          SCHEDULE
      ===================================================== */}

      <div className="bg-white border border-gray-200 rounded-2xl p-6">

        <div className="flex items-center gap-3 mb-6">

          <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">

            <CalendarClock className="h-5 w-5 text-indigo-600" />

          </div>

          <div>

            <h2 className="text-lg font-bold text-gray-900">
              Automatic Monitor Schedule
            </h2>

            <p className="text-sm text-gray-500">
              Automatically activate and deactivate the attendance monitor.
            </p>

          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          <input
            value={scheduleName}
            onChange={(event) =>
              setScheduleName(
                event.target.value
              )
            }
            placeholder="Schedule name"
            className="px-4 py-3 border border-gray-300 rounded-xl"
          />

          <select
            value={scheduleType}
            onChange={(event) =>
              setScheduleType(
                event.target.value as
                  | 'ONCE'
                  | 'DAILY'
                  | 'WEEKLY'
              )
            }
            className="px-4 py-3 border border-gray-300 rounded-xl"
          >

            <option value="DAILY">
              Daily
            </option>

            <option value="WEEKLY">
              Weekly
            </option>

            <option value="ONCE">
              Once
            </option>

          </select>

          {scheduleType === 'ONCE' ? (

            <input
              type="date"
              value={scheduleDate}
              onChange={(event) =>
                setScheduleDate(
                  event.target.value
                )
              }
              className="px-4 py-3 border border-gray-300 rounded-xl"
            />

          ) : scheduleType === 'WEEKLY' ? (

            <select
              value={dayOfWeek}
              onChange={(event) =>
                setDayOfWeek(
                  event.target.value
                )
              }
              className="px-4 py-3 border border-gray-300 rounded-xl"
            >

              {[
                'MONDAY',
                'TUESDAY',
                'WEDNESDAY',
                'THURSDAY',
                'FRIDAY',
                'SATURDAY',
                'SUNDAY',
              ].map(
                (day) => (
                  <option
                    key={day}
                    value={day}
                  >
                    {day}
                  </option>
                )
              )}

            </select>

          ) : (

            <div />

          )}

          <input
            type="time"
            value={startTime}
            onChange={(event) =>
              setStartTime(
                event.target.value
              )
            }
            className="px-4 py-3 border border-gray-300 rounded-xl"
          />

          <input
            type="time"
            value={endTime}
            onChange={(event) =>
              setEndTime(
                event.target.value
              )
            }
            className="px-4 py-3 border border-gray-300 rounded-xl"
          />

          <button
            type="button"
            onClick={
              createSchedule
            }
            disabled={
              creatingSchedule
            }
            className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-semibold disabled:opacity-50"
          >

            {creatingSchedule
              ? 'Creating...'
              : 'Create Schedule'}

          </button>

        </div>

        {schedules.length > 0 && (

          <div className="mt-6 overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left px-4 py-3">
                    Name
                  </th>

                  <th className="text-left px-4 py-3">
                    Type
                  </th>

                  <th className="text-left px-4 py-3">
                    Time
                  </th>

                  <th className="text-left px-4 py-3">
                    Enabled
                  </th>

                  <th className="text-right px-4 py-3">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {schedules.map(
                  (schedule) => (

                    <tr
                      key={
                        schedule.id
                      }
                      className="border-t border-gray-100"
                    >

                      <td className="px-4 py-3">
                        {
                          schedule.scheduleName
                        }
                      </td>

                      <td className="px-4 py-3">
                        {
                          schedule.scheduleType
                        }
                      </td>

                      <td className="px-4 py-3">
                        {
                          schedule.startTime
                        }
                        {' - '}
                        {
                          schedule.endTime
                        }
                      </td>

                      <td className="px-4 py-3">
                        {
                          schedule.enabled
                            ? 'Yes'
                            : 'No'
                        }
                      </td>

                      <td className="px-4 py-3 text-right">

                        <button
                          type="button"
                          onClick={() =>
                            removeSchedule(
                              schedule.id
                            )
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete schedule"
                        >

                          <Trash2 className="h-4 w-4" />

                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =====================================================
          ACTIVITY
      ===================================================== */}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        <div className="p-6 border-b border-gray-100">

          <h2 className="text-lg font-bold text-gray-900">
            Activity Log
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Monitor authorization, activation, QR rotation and attendance activity.
          </p>

        </div>

        {events.length === 0 ? (

          <div className="p-8 text-center text-gray-500">
            No activity recorded yet.
          </div>

        ) : (

          <div className="divide-y divide-gray-100">

            {events.map(
              (event) => (

                <div
                  key={
                    event.id
                  }
                  className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >

                  <div>

                    <div className="font-semibold text-gray-900">
                      {
                        event.action
                      }
                    </div>

                    <div className="text-sm text-gray-500">
                      {
                        event.details ||
                        '--'
                      }
                    </div>

                  </div>

                  <div className="text-sm text-gray-500 text-left md:text-right">

                    <div>
                      {
                        event.employeeName ||
                        event.performedBy ||
                        '--'
                      }
                    </div>

                    <div>
                      {
                        event.eventTime
                          ? formatDateTime(
                              event.eventTime
                            )
                          : '--'
                      }
                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}

// ============================================================
// DATE FORMATTER
// ============================================================

function formatDateTime(
  value: string | null
): string {
  if (!value) {
    return '--';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString();
}