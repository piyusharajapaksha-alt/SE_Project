import {
  useEffect,
  useState,
} from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

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
} from 'lucide-react';

import {
  getAttendanceMonitor,
  activateAttendanceMonitor,
  deactivateAttendanceMonitor,
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
  const { addToast } = useToast();

  const [monitor, setMonitor] =
    useState<AttendanceMonitor | null>(null);

  const [records, setRecords] =
    useState<AttendanceRecord[]>([]);

  const [summary, setSummary] =
    useState<AttendanceSummary | null>(null);

  const [events, setEvents] =
    useState<AttendanceEvent[]>([]);

  const [schedules, setSchedules] =
    useState<AttendanceSchedule[]>([]);

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
    useState<'ONCE' | 'DAILY' | 'WEEKLY'>(
      'DAILY'
    );

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

  const load = async () => {
    try {
      setLoading(true);

      const [
        monitorData,
        recordsData,
        summaryData,
        eventsData,
        schedulesData,
      ] = await Promise.all([
        getAttendanceMonitor(),
        getAttendanceRecords(selectedDate),
        getAttendanceSummary(selectedDate),
        getAttendanceEvents(50),
        getAttendanceSchedules(),
      ]);

      setMonitor(monitorData);
      setRecords(recordsData);
      setSummary(summaryData);
      setEvents(eventsData);
      setSchedules(schedulesData);
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
  };

  useEffect(() => {
    load();
  }, [selectedDate]);

  useEffect(() => {
    const timer =
      window.setInterval(
        load,
        5000
      );

    return () =>
      window.clearInterval(timer);
  }, [selectedDate]);

  const activate = async () => {
    if (!user?.employeeId) {
      addToast(
        'error',
        'Authorized user information was not found'
      );
      return;
    }

    if (
      !activationCode.trim()
    ) {
      addToast(
        'error',
        'Enter the six-digit activation code'
      );
      return;
    }

    try {
      const result =
        await activateAttendanceMonitor(
          activationCode.trim(),
          user.employeeId,
          'MANUAL'
        );

      setMonitor(result);
      setActivationCode('');

      addToast(
        'success',
        'Attendance monitor activated successfully'
      );

      await load();
    } catch (error: any) {
      addToast(
        'error',
        error?.message ||
          'Invalid activation code'
      );
    }
  };

  const deactivate = async () => {
    try {
      await deactivateAttendanceMonitor(
        user?.employeeId || 'SYSTEM',
        'MANUAL'
      );

      addToast(
        'success',
        'Attendance monitor deactivated'
      );

      await load();
    } catch (error: any) {
      addToast(
        'error',
        error?.message ||
          'Unable to deactivate attendance monitor'
      );
    }
  };

  const rotate = async () => {
    try {
      const result =
        await rotateAttendanceQr();

      setMonitor(result);

      addToast(
        'success',
        'QR code rotated successfully'
      );

      await load();
    } catch (error: any) {
      addToast(
        'error',
        error?.message ||
          'Unable to rotate QR code'
      );
    }
  };

  const createSchedule = async () => {
    if (!scheduleName.trim()) {
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

    try {
      setCreatingSchedule(true);

      await createAttendanceSchedule({
        scheduleName:
          scheduleName.trim(),
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
          user?.employeeId || 'SYSTEM',
      });

      addToast(
        'success',
        'Attendance schedule created'
      );

      setScheduleName('');

      await load();
    } catch (error: any) {
      addToast(
        'error',
        error?.message ||
          'Unable to create schedule'
      );
    } finally {
      setCreatingSchedule(false);
    }
  };

  const removeSchedule = async (
    id: number
  ) => {
    try {
      await deleteAttendanceSchedule(id);

      addToast(
        'success',
        'Schedule deleted'
      );

      await load();
    } catch (error: any) {
      addToast(
        'error',
        error?.message ||
          'Unable to delete schedule'
      );
    }
  };

  return (
    <div className="space-y-6">

      <PageHeader
        title="Attendance Management"
        description="Manage the StaffHub QR attendance monitor, schedules and daily attendance records."
      />

      {/* =====================================================
          SUMMARY
          ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          title="Expected Today"
          value={
            summary?.expected ?? 0
          }
          icon={
            <Users className="h-5 w-5" />
          }
          color="blue"
        />

        <StatCard
          title="Attended"
          value={
            summary?.attended ?? 0
          }
          icon={
            <Clock className="h-5 w-5" />
          }
          color="green"
        />

        <StatCard
          title="Currently Working"
          value={
            summary?.currentlyWorking ?? 0
          }
          icon={
            <Activity className="h-5 w-5" />
          }
          color="purple"
        />

        <StatCard
          title="On Leave"
          value={
            summary?.onLeave ?? 0
          }
          icon={
            <CalendarClock className="h-5 w-5" />
          }
          color="purple"
        />

      </div>

      {/* =====================================================
          MONITOR CONTROL
          ===================================================== */}

      <div className="bg-white border border-gray-200 rounded-2xl p-6">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          <div>

            <div className="flex items-center gap-3">

              <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <QrCode className="h-5 w-5 text-indigo-600" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Attendance QR Monitor
                </h2>

                <p className="text-sm text-gray-500">
                  {monitor?.active
                    ? 'The attendance monitor is currently live.'
                    : 'The attendance monitor is waiting for activation.'}
                </p>
              </div>

            </div>

          </div>

          <div className="flex items-center gap-2">

            <span
              className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                monitor?.active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {monitor?.active
                ? 'LIVE'
                : 'INACTIVE'}
            </span>

          </div>

        </div>

        {!monitor?.active ? (
          <div className="mt-6">

            <p className="text-sm font-medium text-gray-700 mb-2">
              Temporary Activation Code
            </p>

            <div className="flex flex-col sm:flex-row gap-3">

              <input
                value={activationCode}
                onChange={(event) =>
                  setActivationCode(
                    event.target.value
                      .replace(/\D/g, '')
                      .slice(0, 6)
                  )
                }
                maxLength={6}
                placeholder="Enter 6-digit code"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 tracking-[0.25em] font-bold"
              />

              <button
                onClick={activate}
                disabled={
                  loading ||
                  activationCode.length !== 6
                }
                className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                Activate Monitor
              </button>

            </div>

            <p className="mt-3 text-xs text-gray-500">
              Open the standalone Attendance Monitor page to see the current temporary activation code.
            </p>

          </div>
        ) : (
          <div className="mt-6 flex flex-col sm:flex-row gap-3">

            <button
              onClick={deactivate}
              className="px-5 py-3 bg-red-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Square className="h-4 w-4" />
              Deactivate Monitor
            </button>

            <button
              onClick={rotate}
              className="px-5 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Rotate QR
            </button>

          </div>
        )}

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
          ATTENDANCE TABLE
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
                          {record.employeeName}
                        </div>

                        <div className="text-xs text-gray-500">
                          {record.employeeNumber}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {record.department || '--'}
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
                        {record.status}
                      </td>

                      <td className="px-6 py-4">
                        {record.checkInMethod || '--'}
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
          SCHEDULES
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
              ].map((day) => (
                <option
                  key={day}
                  value={day}
                >
                  {day}
                </option>
              ))}
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
            onClick={createSchedule}
            disabled={creatingSchedule}
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
                      key={schedule.id}
                      className="border-t border-gray-100"
                    >

                      <td className="px-4 py-3">
                        {schedule.scheduleName}
                      </td>

                      <td className="px-4 py-3">
                        {schedule.scheduleType}
                      </td>

                      <td className="px-4 py-3">
                        {schedule.startTime}
                        {' - '}
                        {schedule.endTime}
                      </td>

                      <td className="px-4 py-3">
                        {schedule.enabled
                          ? 'Yes'
                          : 'No'}
                      </td>

                      <td className="px-4 py-3 text-right">

                        <button
                          onClick={() =>
                            removeSchedule(
                              schedule.id
                            )
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
          ACTIVITY LOG
          ===================================================== */}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        <div className="p-6 border-b border-gray-100">

          <h2 className="text-lg font-bold text-gray-900">
            Activity Log
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Monitor activation, QR rotation and attendance activity.
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
                  key={event.id}
                  className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >

                  <div>

                    <div className="font-semibold text-gray-900">
                      {event.action}
                    </div>

                    <div className="text-sm text-gray-500">
                      {event.details || '--'}
                    </div>

                  </div>

                  <div className="text-sm text-gray-500 text-left md:text-right">

                    <div>
                      {event.employeeName ||
                        event.performedBy ||
                        '--'}
                    </div>

                    <div>
                      {event.eventTime
                        ? formatDateTime(
                            event.eventTime
                          )
                        : '--'}
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