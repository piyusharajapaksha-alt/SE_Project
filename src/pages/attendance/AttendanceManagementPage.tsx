import {
  useCallback,
  useEffect,
  useMemo,
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
  Activity,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit3,
  Loader2,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  ShieldCheck,
  Square,
  Trash2,
  UserPlus,
  Users,
  X,
  XCircle,
} from 'lucide-react';

import {
  attendanceService,
  employeeService,
} from '@/services/dataServices';

import {
  activateAttendanceMonitor,
  authorizeAttendanceMonitor,
  correctAttendance,
  createManualAttendance,
  deactivateAttendanceMonitor,
  deleteAttendanceRecord,
  getAcceptedAttendanceMonitors,
  getAttendanceEvents,
  getAttendanceRecords,
  getAttendanceSummary,
  rejectAttendanceMonitor,
  rotateAttendanceQr,
  type AttendanceEvent,
  type AttendanceMonitor,
  type AttendanceRecord,
  type AttendanceSummary,
} from '@/services/attendanceQrService';

interface EmployeeOption {
  id: number;
  employeeNumber: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  employmentStatus?: string;
}

interface EditForm {
  checkIn: string;
  checkOut: string;
  status: string;
  reason: string;
}

interface ManualForm {
  employeeNumber: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
  reason: string;
}

const STATUS_OPTIONS = [
  'Present',
  'Late',
  'Absent',
  'On Leave',
  'Half Day',
];

export default function AttendanceManagementPage() {

  const {
    user,
    checkPermission,
  } = useAuth();

  const {
    addToast,
  } = useToast();

  const canEdit =
    checkPermission(
      'attendance.edit'
    );

  const canDelete =
    checkPermission(
      'attendance.delete'
    );

  // ==========================================================
  // STATE
  // ==========================================================

  const [monitors, setMonitors] =
    useState<AttendanceMonitor[]>([]);

  const [records, setRecords] =
    useState<AttendanceRecord[]>([]);

  const [summary, setSummary] =
    useState<AttendanceSummary | null>(null);

  const [events, setEvents] =
    useState<AttendanceEvent[]>([]);

  const [employees, setEmployees] =
    useState<EmployeeOption[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [employeesLoading, setEmployeesLoading] =
    useState(false);

  const [selectedDate, setSelectedDate] =
    useState(
      new Date()
        .toISOString()
        .slice(0, 10)
    );

  const [activationCode, setActivationCode] =
    useState('');

  const [monitorActionId, setMonitorActionId] =
    useState<number | null>(null);

  const [recordSearch, setRecordSearch] =
    useState('');

  const [recordStatusFilter, setRecordStatusFilter] =
    useState('ALL');

  const [recordMethodFilter, setRecordMethodFilter] =
    useState('ALL');

  const [showManualModal, setShowManualModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [editingRecord, setEditingRecord] =
    useState<AttendanceRecord | null>(null);

  const [deletingRecord, setDeletingRecord] =
    useState<AttendanceRecord | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [manualEmployeeSearch, setManualEmployeeSearch] =
    useState('');

  const [manualForm, setManualForm] =
    useState<ManualForm>({
      employeeNumber: '',
      date:
        new Date()
          .toISOString()
          .slice(0, 10),
      checkIn: '',
      checkOut: '',
      status: 'Present',
      reason: '',
    });

  const [editForm, setEditForm] =
    useState<EditForm>({
      checkIn: '',
      checkOut: '',
      status: 'Present',
      reason: '',
    });

  const [deleteVerification, setDeleteVerification] =
    useState('');

  // ==========================================================
  // LOAD MAIN DATA
  // ==========================================================

  const load = useCallback(
    async () => {

      try {

        setLoading(true);

        const [
          monitorData,
          recordsData,
          summaryData,
          eventsData,
        ] = await Promise.all([
          getAcceptedAttendanceMonitors(),

          getAttendanceRecords(
            selectedDate
          ),

          getAttendanceSummary(
            selectedDate
          ),

          getAttendanceEvents(
            100
          ),
        ]);

        setMonitors(
          Array.isArray(monitorData)
            ? monitorData
            : []
        );

        setRecords(
          Array.isArray(recordsData)
            ? recordsData
            : []
        );

        setSummary(
          summaryData
        );

        setEvents(
          Array.isArray(eventsData)
            ? eventsData
            : []
        );

      } catch (error: any) {

        console.error(
          'Attendance management load error:',
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

  // ==========================================================
  // LOAD EMPLOYEES
  // ==========================================================

  const loadEmployees = useCallback(
    async () => {

      try {

        setEmployeesLoading(true);

        const result =
          await employeeService.getAll();

        const list =
          Array.isArray(result)
            ? result
            : [];

        setEmployees(
          list.map(
            (employee: any) => ({
              id:
                Number(employee.id),

              employeeNumber:
                employee.employeeNumber ||
                '',

              firstName:
                employee.firstName ||
                '',

              lastName:
                employee.lastName ||
                '',

              department:
                employee.department ||
                '',

              employmentStatus:
                employee.employmentStatus ||
                '',
            })
          )
        );

      } catch (error) {

        console.error(
          'Employee loading error:',
          error
        );

      } finally {

        setEmployeesLoading(false);
      }

    },
    []
  );

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  // ==========================================================
  // AUTO REFRESH
  // ==========================================================

  useEffect(() => {

    const timer =
      window.setInterval(
        () => {
          void load();
        },
        10000
      );

    return () => {
      window.clearInterval(timer);
    };

  }, [load]);

  // ==========================================================
  // MONITOR
  // ==========================================================

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

      setMonitorActionId(-1);

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

      addToast(
        'error',
        error?.message ||
          'Unable to accept monitor'
      );

    } finally {

      setMonitorActionId(null);
    }
  };

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

      addToast(
        'error',
        error?.message ||
          'Unable to activate monitor'
      );

    } finally {

      setMonitorActionId(null);
    }
  };

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

      addToast(
        'error',
        error?.message ||
          'Unable to deactivate monitor'
      );

    } finally {

      setMonitorActionId(null);
    }
  };

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

      addToast(
        'error',
        error?.message ||
          'Unable to rotate QR code'
      );

    } finally {

      setMonitorActionId(null);
    }
  };

  const reject = async (
    monitorId: number
  ) => {

    if (
      !window.confirm(
        'Reject this attendance monitor?'
      )
    ) {
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

      addToast(
        'error',
        error?.message ||
          'Unable to reject monitor'
      );

    } finally {

      setMonitorActionId(null);
    }
  };

  // ==========================================================
  // FILTER RECORDS
  // ==========================================================

  const filteredRecords =
    useMemo(() => {

      const query =
        recordSearch
          .trim()
          .toLowerCase();

      return records.filter(
        (record) => {

          const matchesSearch =
            !query ||
            record.employeeNumber
              ?.toLowerCase()
              .includes(query) ||
            record.employeeName
              ?.toLowerCase()
              .includes(query) ||
            record.department
              ?.toLowerCase()
              .includes(query);

          const matchesStatus =
            recordStatusFilter === 'ALL' ||
            record.status ===
              recordStatusFilter;

          const matchesMethod =
            recordMethodFilter === 'ALL' ||
            (
              record.checkInMethod ||
              ''
            ).toUpperCase() ===
              recordMethodFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesMethod
          );
        }
      );

    }, [
      records,
      recordSearch,
      recordStatusFilter,
      recordMethodFilter,
    ]);

  // ==========================================================
  // MANUAL EMPLOYEE SEARCH
  // ==========================================================

  const matchingEmployees =
    useMemo(() => {

      const query =
        manualEmployeeSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return employees
          .filter(
            (employee) =>
              !employee.employmentStatus ||
              employee.employmentStatus
                .toLowerCase() ===
                'active'
          )
          .slice(0, 8);
      }

      return employees
        .filter(
          (employee) => {

            const name =
              `${employee.firstName || ''} ${
                employee.lastName || ''
              }`
                .trim()
                .toLowerCase();

            return (
              employee.employeeNumber
                ?.toLowerCase()
                .includes(query) ||
              name.includes(query)
            );
          }
        )
        .filter(
          (employee) =>
            !employee.employmentStatus ||
            employee.employmentStatus
              .toLowerCase() ===
              'active'
        )
        .slice(0, 8);

    }, [
      employees,
      manualEmployeeSearch,
    ]);

  // ==========================================================
  // MANUAL CREATE
  // ==========================================================

  const openManualModal = () => {

    if (!canEdit) {

      addToast(
        'error',
        'You are not authorized to create manual attendance'
      );

      return;
    }

    setManualForm({
      employeeNumber: '',
      date: selectedDate,
      checkIn: '',
      checkOut: '',
      status: 'Present',
      reason: '',
    });

    setManualEmployeeSearch('');

    setShowManualModal(true);
  };

  const submitManualAttendance = async () => {

    if (
      !manualForm.employeeNumber
    ) {

      addToast(
        'error',
        'Select an employee'
      );

      return;
    }

    if (
      !manualForm.reason.trim()
    ) {

      addToast(
        'error',
        'Enter a reason for the manual attendance'
      );

      return;
    }

    try {

      setSaving(true);

      await createManualAttendance({
        employeeNumber:
          manualForm.employeeNumber,

        date:
          manualForm.date,

        checkIn:
          manualForm.checkIn
            ? manualForm.checkIn
            : null,

        checkOut:
          manualForm.checkOut
            ? manualForm.checkOut
            : null,

        status:
          manualForm.status,

        reason:
          manualForm.reason.trim(),
      });

      addToast(
        'success',
        'New attendance record created successfully'
      );

      setShowManualModal(false);

      await load();

    } catch (error: any) {

      addToast(
        'error',
        error?.message ||
          'Unable to create manual attendance'
      );

    } finally {

      setSaving(false);
    }
  };

  // ==========================================================
  // EDIT
  // ==========================================================

  const openEdit = (
    record: AttendanceRecord
  ) => {

    if (!canEdit) {

      addToast(
        'error',
        'You are not authorized to edit attendance'
      );

      return;
    }

    setEditingRecord(
      record
    );

    setEditForm({
      checkIn:
        toDateTimeLocal(
          record.checkIn
        ),

      checkOut:
        toDateTimeLocal(
          record.checkOut
        ),

      status:
        record.status ||
        'Present',

      reason:
        record.correctionReason ||
        '',
    });

    setShowEditModal(true);
  };

  const submitEdit = async () => {

    if (!editingRecord) {
      return;
    }

    if (
      !editForm.reason.trim()
    ) {

      addToast(
        'error',
        'Enter a correction reason'
      );

      return;
    }

    try {

      setSaving(true);

      await correctAttendance(
        editingRecord.id,
        {
          checkIn:
            editForm.checkIn
              ? new Date(
                  editForm.checkIn
                ).toISOString()
              : null,

          checkOut:
            editForm.checkOut
              ? new Date(
                  editForm.checkOut
                ).toISOString()
              : null,

          status:
            editForm.status,

          reason:
            editForm.reason.trim(),
        }
      );

      addToast(
        'success',
        'Attendance record updated successfully'
      );

      setShowEditModal(false);

      setEditingRecord(null);

      await load();

    } catch (error: any) {

      addToast(
        'error',
        error?.message ||
          'Unable to update attendance record'
      );

    } finally {

      setSaving(false);
    }
  };

  // ==========================================================
  // DELETE
  // ==========================================================

  const openDelete = (
    record: AttendanceRecord
  ) => {

    if (!canDelete) {

      addToast(
        'error',
        'You are not authorized to delete attendance records'
      );

      return;
    }

    setDeletingRecord(
      record
    );

    setDeleteVerification('');

    setShowDeleteModal(true);
  };

  const submitDelete = async () => {

    if (!deletingRecord) {
      return;
    }

    if (
      deleteVerification
        .trim()
        .toUpperCase() !==
      'DELETE'
    ) {

      addToast(
        'error',
        'Type DELETE to verify permanent deletion'
      );

      return;
    }

    try {

      setDeleting(true);

      await deleteAttendanceRecord(
        deletingRecord.id,
        'DELETE'
      );

      addToast(
        'success',
        'Attendance record permanently deleted from the database'
      );

      setShowDeleteModal(false);

      setDeletingRecord(null);

      setDeleteVerification('');

      await load();

    } catch (error: any) {

      addToast(
        'error',
        error?.message ||
          'Unable to delete attendance record'
      );

    } finally {

      setDeleting(false);
    }
  };

  // ==========================================================
  // CHART DATA
  // ==========================================================

  const statusChart = useMemo(
    () => {

      const attended =
        summary?.attended ?? 0;

      const late =
        summary?.late ?? 0;

      const checkedOut =
        summary?.checkedOut ?? 0;

      const working =
        summary?.currentlyWorking ?? 0;

      const onLeave =
        summary?.onLeave ?? 0;

      const absent =
        Math.max(
          0,
          (
            summary?.expected ?? 0
          ) -
          attended -
          onLeave
        );

      return [
        {
          label: 'Present',
          value:
            Math.max(
              0,
              attended - late
            ),
        },

        {
          label: 'Late',
          value: late,
        },

        {
          label: 'Working',
          value: working,
        },

        {
          label: 'Checked Out',
          value: checkedOut,
        },

        {
          label: 'On Leave',
          value: onLeave,
        },

        {
          label: 'Not Attended',
          value: absent,
        },
      ];

    },
    [summary]
  );

  const maxChartValue =
    Math.max(
      1,
      ...statusChart.map(
        (item) => item.value
      )
    );

  // ==========================================================
  // ACTIVITY SUMMARY
  // ==========================================================

  const summarizedEvents =
    useMemo(
      () => {

        const qrRotations =
          events.filter(
            (event) =>
              event.action
                ?.toUpperCase()
                .includes('QR_ROTAT')
          );

        const nonRotationEvents =
          events.filter(
            (event) =>
              !event.action
                ?.toUpperCase()
                .includes('QR_ROTAT')
          );

        const result: Array<{
          key: string;
          action: string;
          details: string;
          performedBy: string;
          eventTime: string | null;
        }> = [];

        if (
          qrRotations.length > 0
        ) {

          const monitorIds =
            Array.from(
              new Set(
                qrRotations
                  .map(
                    (event) =>
                      event.monitorId
                  )
                  .filter(
                    (
                      value
                    ): value is number =>
                      value !== null
                  )
              )
            );

          result.push({
            key:
              'qr-rotation-summary',

            action:
              'QR ROTATIONS',

            details:
              `${qrRotations.length} QR refresh${
                qrRotations.length === 1
                  ? ''
                  : 'es'
              } recorded${
                monitorIds.length > 0
                  ? ` across ${monitorIds.length} monitor${
                      monitorIds.length === 1
                        ? ''
                        : 's'
                    }`
                  : ''
              }. Individual automatic QR rotations are grouped.`,

            performedBy:
              qrRotations[0]
                ?.performedBy ||
              'SYSTEM',

            eventTime:
              qrRotations[0]
                ?.eventTime ||
              null,
          });
        }

        nonRotationEvents
          .slice(0, 30)
          .forEach(
            (event) => {

              result.push({
                key:
                  `event-${event.id}`,

                action:
                  formatEventAction(
                    event.action
                  ),

                details:
                  event.details ||
                  '--',

                performedBy:
                  event.employeeName ||
                  event.performedBy ||
                  '--',

                eventTime:
                  event.eventTime,
              });

            }
          );

        return result.slice(
          0,
          31
        );

      },
      [events]
    );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">

      <PageHeader
        title="Attendance Management"
        description="Manage attendance monitors, review attendance, correct records and manually record attendance."
      />

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          title="Expected"
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
            <CheckCircle2 className="h-5 w-5" />
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
            <CalendarDays className="h-5 w-5" />
          }
          color="purple"
        />

      </div>

      {/* ======================================================
          ATTENDANCE CHART
      ====================================================== */}

      <section className="bg-white border border-gray-200 rounded-2xl p-6">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">

              <BarChart3 className="h-5 w-5 text-indigo-600" />

            </div>

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                Attendance Overview
              </h2>

              <p className="text-sm text-gray-500">
                Attendance distribution for {selectedDate}.
              </p>

            </div>

          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(event) =>
              setSelectedDate(
                event.target.value
              )
            }
            className="px-4 py-2.5 border border-gray-300 rounded-xl"
          />

        </div>

        <div className="mt-8">

          <div className="flex items-end gap-3 h-64 overflow-x-auto pb-2">

            {statusChart.map(
              (item) => {

                const height =
                  Math.max(
                    8,
                    (
                      item.value /
                      maxChartValue
                    ) * 210
                  );

                return (
                  <div
                    key={
                      item.label
                    }
                    className="min-w-[90px] flex-1 h-full flex flex-col items-center justify-end"
                  >

                    <div className="text-sm font-bold text-gray-900 mb-2">
                      {
                        item.value
                      }
                    </div>

                    <div
                      className="w-full max-w-[70px] rounded-t-xl bg-indigo-500 transition-all"
                      style={{
                        height:
                          `${height}px`,
                      }}
                      title={`${item.label}: ${item.value}`}
                    />

                    <div className="mt-3 text-xs text-gray-500 text-center">
                      {
                        item.label
                      }
                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>

      </section>

      {/* ======================================================
          QR MONITORS
      ====================================================== */}

      <section className="bg-white border border-gray-200 rounded-2xl p-6">

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
                Accept and control physical attendance monitors.
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

        {/* ACCEPT */}

        <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">

          <div className="flex items-start gap-3">

            <ShieldCheck className="h-5 w-5 text-indigo-600 mt-0.5" />

            <div className="flex-1">

              <h3 className="font-semibold text-gray-900">
                Accept New Monitor
              </h3>

              <p className="text-sm text-gray-600 mt-1">
                Enter the six-digit activation code shown on the physical monitor.
              </p>

            </div>

          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">

            <input
              value={activationCode}
              onChange={(event) =>
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
                )
              }
              maxLength={6}
              inputMode="numeric"
              placeholder="Enter 6-digit code"
              className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl tracking-[0.25em] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="button"
              onClick={authorize}
              disabled={
                monitorActionId === -1 ||
                activationCode.length !== 6
              }
              className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >

              {monitorActionId === -1 ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}

              Accept Monitor

            </button>

          </div>

        </div>

        {/* MONITORS */}

        <div className="mt-6">

          {monitors.length === 0 ? (

            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">

              <QrCode className="h-8 w-8 text-gray-400 mx-auto" />

              <p className="mt-3 text-sm text-gray-500">
                No attendance monitors have been accepted.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

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
                            QR Status
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {monitor.active
                              ? 'Refreshing automatically'
                              : 'Inactive'}
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
                              <CheckCircle2 className="h-4 w-4" />
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

      </section>

      {/* ======================================================
          ATTENDANCE RECORDS
      ====================================================== */}

      <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        <div className="p-6 border-b border-gray-100">

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                Attendance Records
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Search, edit, delete or manually add attendance.
              </p>

            </div>

            {canEdit && (

              <button
                type="button"
                onClick={
                  openManualModal
                }
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              >

                <UserPlus className="h-4 w-4" />

                Manual Attendance

              </button>

            )}

          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">

            <div className="relative">

              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

              <input
                value={recordSearch}
                onChange={(event) =>
                  setRecordSearch(
                    event.target.value
                  )
                }
                placeholder="Employee number or name"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl"
              />

            </div>

            <select
              value={
                recordStatusFilter
              }
              onChange={(event) =>
                setRecordStatusFilter(
                  event.target.value
                )
              }
              className="px-4 py-2.5 border border-gray-300 rounded-xl"
            >

              <option value="ALL">
                All statuses
              </option>

              {STATUS_OPTIONS.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}

            </select>

            <select
              value={
                recordMethodFilter
              }
              onChange={(event) =>
                setRecordMethodFilter(
                  event.target.value
                )
              }
              className="px-4 py-2.5 border border-gray-300 rounded-xl"
            >

              <option value="ALL">
                All methods
              </option>

              <option value="MANUAL">
                Manual
              </option>

              <option value="QR">
                QR
              </option>

            </select>

            <button
              type="button"
              onClick={() =>
                void load()
              }
              className="px-4 py-2.5 border border-gray-300 rounded-xl font-semibold flex items-center justify-center gap-2"
            >

              <RefreshCw className="h-4 w-4" />

              Refresh

            </button>

          </div>

        </div>

        {loading ? (

          <div className="p-12 flex justify-center">

            <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />

          </div>

        ) : filteredRecords.length === 0 ? (

          <div className="p-12 text-center text-gray-500">

            No attendance records match your filters.

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left px-5 py-4">
                    Employee
                  </th>

                  <th className="text-left px-5 py-4">
                    Department
                  </th>

                  <th className="text-left px-5 py-4">
                    Check In
                  </th>

                  <th className="text-left px-5 py-4">
                    Check Out
                  </th>

                  <th className="text-left px-5 py-4">
                    Status
                  </th>

                  <th className="text-left px-5 py-4">
                    Method
                  </th>

                  {(canEdit ||
                    canDelete) && (

                    <th className="text-right px-5 py-4">
                      Actions
                    </th>
                  )}

                </tr>

              </thead>

              <tbody>

                {filteredRecords.map(
                  (record) => (

                    <tr
                      key={
                        record.id
                      }
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >

                      <td className="px-5 py-4">

                        <div className="font-semibold text-gray-900">
                          {
                            record.employeeName ||
                            '--'
                          }
                        </div>

                        <div className="text-xs text-gray-500">
                          {
                            record.employeeNumber ||
                            '--'
                          }
                        </div>

                      </td>

                      <td className="px-5 py-4">
                        {
                          record.department ||
                          '--'
                        }
                      </td>

                      <td className="px-5 py-4">
                        {
                          formatDateTime(
                            record.checkIn
                          )
                        }
                      </td>

                      <td className="px-5 py-4">
                        {
                          formatDateTime(
                            record.checkOut
                          )
                        }
                      </td>

                      <td className="px-5 py-4">

                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          {
                            record.status ||
                            '--'
                          }
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <span className="text-xs font-semibold">
                          {
                            record.checkInMethod ||
                            '--'
                          }
                        </span>

                      </td>

                      {(canEdit ||
                        canDelete) && (

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            {canEdit && (

                              <button
                                type="button"
                                onClick={() =>
                                  openEdit(
                                    record
                                  )
                                }
                                className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50"
                                title="Edit attendance"
                              >

                                <Edit3 className="h-4 w-4" />

                              </button>
                            )}

                            {canDelete && (

                              <button
                                type="button"
                                onClick={() =>
                                  openDelete(
                                    record
                                  )
                                }
                                className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                                title="Delete attendance"
                              >

                                <Trash2 className="h-4 w-4" />

                              </button>
                            )}

                          </div>

                        </td>
                      )}

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* ======================================================
          ACTIVITY
      ====================================================== */}

      <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        <div className="p-6 border-b border-gray-100">

          <div className="flex items-center gap-3">

            <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">

              <Activity className="h-5 w-5 text-gray-600" />

            </div>

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                Activity Log
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                QR refreshes are grouped instead of displaying every automatic rotation.
              </p>

            </div>

          </div>

        </div>

        {summarizedEvents.length === 0 ? (

          <div className="p-8 text-center text-gray-500">
            No activity recorded yet.
          </div>

        ) : (

          <div className="divide-y divide-gray-100">

            {summarizedEvents.map(
              (event) => (

                <div
                  key={
                    event.key
                  }
                  className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >

                  <div>

                    <div className="font-semibold text-gray-900">
                      {
                        event.action
                      }
                    </div>

                    <div className="text-sm text-gray-500 mt-1">
                      {
                        event.details
                      }
                    </div>

                  </div>

                  <div className="text-sm text-gray-500 md:text-right">

                    <div>
                      {
                        event.performedBy
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

      </section>

      {/* ======================================================
          MANUAL ATTENDANCE MODAL
      ====================================================== */}

      {showManualModal && (

        <Modal
          title="Manual Attendance"
          icon={
            <UserPlus className="h-5 w-5" />
          }
          onClose={() =>
            setShowManualModal(false)
          }
        >

          <div className="space-y-5">

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Find Employee
              </label>

              <div className="relative">

                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                <input
                  value={
                    manualEmployeeSearch
                  }
                  onChange={(event) => {

                    const value =
                      event.target.value;

                    setManualEmployeeSearch(
                      value
                    );

                    setManualForm(
                      (previous) => ({
                        ...previous,
                        employeeNumber:
                          '',
                      })
                    );
                  }}
                  placeholder="Search employee number or name"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl"
                />

              </div>

              {manualEmployeeSearch && (

                <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">

                  {employeesLoading ? (

                    <div className="p-4 text-sm text-gray-500">
                      Loading employees...
                    </div>

                  ) : matchingEmployees.length === 0 ? (

                    <div className="p-4 text-sm text-gray-500">
                      No active employee found.
                    </div>

                  ) : (

                    matchingEmployees.map(
                      (employee) => (

                        <button
                          key={
                            employee.id
                          }
                          type="button"
                          onClick={() => {

                            setManualForm(
                              (previous) => ({
                                ...previous,
                                employeeNumber:
                                  employee.employeeNumber,
                              })
                            );

                            setManualEmployeeSearch(
                              `${employee.employeeNumber} - ${employee.firstName || ''} ${employee.lastName || ''}`.trim()
                            );
                          }}
                          className="w-full text-left p-3 hover:bg-indigo-50 border-b last:border-b-0 border-gray-100"
                        >

                          <div className="font-semibold text-gray-900">
                            {
                              employee.employeeNumber
                            }
                          </div>

                          <div className="text-sm text-gray-500">
                            {
                              `${employee.firstName || ''} ${employee.lastName || ''}`.trim()
                            }
                            {employee.department
                              ? ` • ${employee.department}`
                              : ''}
                          </div>

                        </button>
                      )
                    )
                  )}

                </div>
              )}

            </div>

            {manualForm.employeeNumber && (

              <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 text-sm">

                <span className="font-semibold">
                  Employee:
                </span>{' '}

                {manualForm.employeeNumber}

              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <Field
                label="Attendance Date"
                type="date"
                value={
                  manualForm.date
                }
                onChange={(value) =>
                  setManualForm(
                    (previous) => ({
                      ...previous,
                      date: value,
                    })
                  )
                }
              />

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>

                <select
                  value={
                    manualForm.status
                  }
                  onChange={(event) =>
                    setManualForm(
                      (previous) => ({
                        ...previous,
                        status:
                          event.target.value,
                      })
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                >

                  {STATUS_OPTIONS.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    )
                  )}

                </select>

              </div>

              <Field
                label="Check In"
                type="datetime-local"
                value={
                  manualForm.checkIn
                }
                onChange={(value) =>
                  setManualForm(
                    (previous) => ({
                      ...previous,
                      checkIn: value,
                    })
                  )
                }
              />

              <Field
                label="Check Out"
                type="datetime-local"
                value={
                  manualForm.checkOut
                }
                onChange={(value) =>
                  setManualForm(
                    (previous) => ({
                      ...previous,
                      checkOut: value,
                    })
                  )
                }
              />

            </div>

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason
              </label>

              <textarea
                value={
                  manualForm.reason
                }
                onChange={(event) =>
                  setManualForm(
                    (previous) => ({
                      ...previous,
                      reason:
                        event.target.value,
                    })
                  )
                }
                rows={3}
                placeholder="Why is this attendance being manually recorded?"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none"
              />

            </div>

            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowManualModal(false)
                }
                className="px-4 py-2.5 border border-gray-300 rounded-xl font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  submitManualAttendance
                }
                disabled={saving}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
              >

                {saving && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                Create Attendance

              </button>

            </div>

          </div>

        </Modal>
      )}

      {/* ======================================================
          EDIT MODAL
      ====================================================== */}

      {showEditModal &&
        editingRecord && (

        <Modal
          title="Edit Attendance"
          icon={
            <Edit3 className="h-5 w-5" />
          }
          onClose={() =>
            setShowEditModal(false)
          }
        >

          <div className="space-y-5">

            <div className="rounded-xl bg-gray-50 p-4">

              <div className="font-semibold text-gray-900">
                {
                  editingRecord.employeeName
                }
              </div>

              <div className="text-sm text-gray-500">
                {
                  editingRecord.employeeNumber
                }
                {' • '}
                {
                  editingRecord.attendanceDate
                }
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <Field
                label="Check In"
                type="datetime-local"
                value={
                  editForm.checkIn
                }
                onChange={(value) =>
                  setEditForm(
                    (previous) => ({
                      ...previous,
                      checkIn: value,
                    })
                  )
                }
              />

              <Field
                label="Check Out"
                type="datetime-local"
                value={
                  editForm.checkOut
                }
                onChange={(value) =>
                  setEditForm(
                    (previous) => ({
                      ...previous,
                      checkOut: value,
                    })
                  )
                }
              />

            </div>

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>

              <select
                value={
                  editForm.status
                }
                onChange={(event) =>
                  setEditForm(
                    (previous) => ({
                      ...previous,
                      status:
                        event.target.value,
                    })
                  )
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              >

                {STATUS_OPTIONS.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  )
                )}

              </select>

            </div>

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correction Reason
              </label>

              <textarea
                value={
                  editForm.reason
                }
                onChange={(event) =>
                  setEditForm(
                    (previous) => ({
                      ...previous,
                      reason:
                        event.target.value,
                    })
                  )
                }
                rows={3}
                placeholder="Reason for changing this record"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none"
              />

            </div>

            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowEditModal(false)
                }
                className="px-4 py-2.5 border border-gray-300 rounded-xl font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  submitEdit
                }
                disabled={saving}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
              >

                {saving && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                Save Changes

              </button>

            </div>

          </div>

        </Modal>
      )}

      {/* ======================================================
          DELETE MODAL
      ====================================================== */}

      {showDeleteModal &&
        deletingRecord && (

        <Modal
          title="Delete Attendance Record"
          icon={
            <Trash2 className="h-5 w-5 text-red-600" />
          }
          onClose={() =>
            setShowDeleteModal(false)
          }
        >

          <div className="space-y-5">

            <div className="rounded-xl border border-red-200 bg-red-50 p-4">

              <div className="font-bold text-red-800">
                Permanent database deletion
              </div>

              <p className="text-sm text-red-700 mt-1">
                This will permanently remove the attendance record from the database. This action cannot be undone.
              </p>

            </div>

            <div className="rounded-xl bg-gray-50 p-4">

              <div className="font-semibold text-gray-900">
                {
                  deletingRecord.employeeName
                }
              </div>

              <div className="text-sm text-gray-500">
                {
                  deletingRecord.employeeNumber
                }
                {' • '}
                {
                  deletingRecord.attendanceDate
                }
              </div>

              <div className="text-sm text-gray-500 mt-1">
                Record ID:
                {' '}
                {
                  deletingRecord.id
                }
              </div>

            </div>

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Type DELETE to confirm
              </label>

              <input
                value={
                  deleteVerification
                }
                onChange={(event) =>
                  setDeleteVerification(
                    event.target.value
                  )
                }
                placeholder="DELETE"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl font-bold tracking-wider"
              />

            </div>

            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowDeleteModal(false)
                }
                className="px-4 py-2.5 border border-gray-300 rounded-xl font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  submitDelete
                }
                disabled={
                  deleting ||
                  deleteVerification
                    .trim()
                    .toUpperCase() !==
                    'DELETE'
                }
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
              >

                {deleting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                Permanently Delete

              </button>

            </div>

          </div>

        </Modal>
      )}

    </div>
  );
}

// ============================================================
// FIELD
// ============================================================

function Field({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {

  return (
    <div>

      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full px-4 py-3 border border-gray-300 rounded-xl"
      />

    </div>
  );
}

// ============================================================
// MODAL
// ============================================================

function Modal({
  title,
  icon,
  children,
  onClose,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
}) {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">

        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="h-9 w-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">

              {icon}

            </div>

            <h2 className="font-bold text-gray-900">
              {title}
            </h2>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >

            <X className="h-5 w-5 text-gray-500" />

          </button>

        </div>

        <div className="p-6">
          {children}
        </div>

      </div>

    </div>
  );
}

// ============================================================
// EVENT ACTION FORMATTER
// ============================================================

function formatEventAction(
  action: string
): string {

  if (!action) {
    return 'ACTIVITY';
  }

  
  return action
  .replace(/_/g, " ")
  .toLowerCase()
  .replace(/\b\w/g, (letter: string) => letter.toUpperCase());
}

// ============================================================
// DATE FORMATTERS
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

function toDateTimeLocal(
  value: string | null
): string {

  if (!value) {
    return '';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '';
  }

  const pad =
    (number: number) =>
      String(number)
        .padStart(2, '0');

  return (
    `${date.getFullYear()}-` +
    `${pad(date.getMonth() + 1)}-` +
    `${pad(date.getDate())}T` +
    `${pad(date.getHours())}:` +
    `${pad(date.getMinutes())}`
  );
}

