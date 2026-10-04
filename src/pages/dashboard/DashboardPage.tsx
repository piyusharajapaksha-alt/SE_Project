import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/ui';

import {
  employeeService,
  attendanceService,
  leaveService,
  performanceService,
  eventService,
  grievanceService,
} from '@/services/dataServices';

import {
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  CalendarDays,
  GraduationCap,
  Calendar,
  MessageSquareWarning,
  ClipboardCheck,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  UserRoundCheck,
  RefreshCw,
} from 'lucide-react';

/* ============================================================
   TYPES
   ============================================================ */

type DashboardRole =
  | 'Employee'
  | 'HR Manager'
  | 'Department Manager'
  | 'Training Coordinator'
  | 'Event Organizer'
  | 'Grievance Officer'
  | 'Owner';

type DashboardEmployee = {
  id?: number;
  companyId?: number;
  employeeNumber?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: string;
  position?: string;
  role?: string;
  employmentStatus?: string;
};

type AttendanceRecord = {
  id?: number;
  employeeId?: number;
  employeeNumber?: string;
  employeeName?: string;
  department?: string;
  attendanceDate?: string;
  checkIn?: string;
  checkOut?: string;
  status?: string;
};

type LeaveRecord = {
  id?: number;
  employeeId?: string;
  employeeName?: string;
  department?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  reason?: string;
  status?: string;
};

type PerformanceRecord = {
  id?: number;
  employeeId?: string;
  reviewPeriod?: string;
  overallRating?: number;
  status?: string;
  managerFeedback?: string;
};

type TrainingRecord = {
  id?: number;
  title?: string;
  description?: string;
  trainer?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  capacity?: number;
  trainingFor?: string[];
  status?: string;
  assignedEmployeeIds?: string[];
  registeredEmployeeIds?: string[];
  attendance?: Record<string, string>;
  completion?: Record<string, string>;
};

type EventRecord = {
  id?: number;
  title?: string;
  description?: string;
  organizerId?: string;
  organizer?: string;
  category?: string;
  date?: string;
  time?: string;
  endTime?: string;
  location?: string;
  capacity?: number;
  status?: string;
  registeredCount?: number;
  availableSeats?: number;
  registeredIds?: string[];
};

type GrievanceRecord = {
  id?: number;
  employeeId?: string;
  employeeName?: string;
  category?: string;
  priority?: string;
  description?: string;
  status?: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt?: string;
};

type LeaveBalance = {
  total: number;
  used: number;
  remaining: number;
};

type DashboardData = {
  employees: DashboardEmployee[];
  attendance: AttendanceRecord[];
  attendanceSummary: any | null;
  leaves: LeaveRecord[];
  performance: PerformanceRecord[];
  training: TrainingRecord[];
  events: EventRecord[];
  grievances: GrievanceRecord[];
  leaveBalance: {
    annualLeave?: LeaveBalance;
    sickLeave?: LeaveBalance;
    personalLeave?: LeaveBalance;
  } | null;
};

/* ============================================================
   HELPERS
   ============================================================ */

function todayString(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function isFutureDate(date?: string): boolean {
  if (!date) {
    return false;
  }

  return date > todayString();
}

function isToday(date?: string): boolean {
  if (!date) {
    return false;
  }

  return date.startsWith(todayString());
}

function formatDate(date?: string): string {
  if (!date) {
    return '—';
  }

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString();
}

function getEmployeeNumber(employee: DashboardEmployee): string {
  return employee.employeeNumber || '';
}

function getEmployeeName(employee: DashboardEmployee): string {
  const name =
    `${employee.firstName || ''} ${employee.lastName || ''}`.trim();

  return name || employee.employeeNumber || 'Employee';
}

function getStatusClass(status?: string): string {
  const normalized = String(status || '').toLowerCase();

  if (
    normalized.includes('approved') ||
    normalized.includes('present') ||
    normalized.includes('completed') ||
    normalized.includes('active') ||
    normalized.includes('ongoing') ||
    normalized.includes('resolved')
  ) {
    return 'bg-green-50 text-green-700';
  }

  if (
    normalized.includes('pending') ||
    normalized.includes('review') ||
    normalized.includes('scheduled')
  ) {
    return 'bg-amber-50 text-amber-700';
  }

  if (
    normalized.includes('rejected') ||
    normalized.includes('cancelled') ||
    normalized.includes('absent') ||
    normalized.includes('high')
  ) {
    return 'bg-red-50 text-red-700';
  }

  return 'bg-gray-100 text-gray-600';
}

/* ============================================================
   SAFE API HELPER
   ============================================================ */

async function safeRequest<T>(
  request: Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await request;
  } catch {
    return fallback;
  }
}

/* ============================================================
   LOADING
   ============================================================ */

function DashboardLoading() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-10">
      <div className="flex flex-col items-center justify-center text-center">
        <RefreshCw className="h-7 w-7 animate-spin text-indigo-600" />

        <h2 className="mt-4 text-lg font-semibold text-gray-900">
          Loading dashboard
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Loading the latest StaffHub information...
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   ERROR
   ============================================================ */

function DashboardError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />

        <div className="flex-1">
          <h3 className="font-semibold text-red-800">
            Dashboard could not be loaded
          </h3>

          <p className="mt-1 text-sm text-red-700">
            {message}
          </p>

          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
   ============================================================ */

function EmptyState({
  icon,
  title,
  message,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        {icon}
      </div>

      <h4 className="mt-3 text-sm font-semibold text-gray-700">
        {title}
      </h4>

      <p className="mt-1 max-w-sm text-xs text-gray-500">
        {message}
      </p>
    </div>
  );
}

/* ============================================================
   SECTION CARD
   ============================================================ */

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        {icon && (
          <span className="text-gray-500">
            {icon}
          </span>
        )}

        <h3 className="text-lg font-semibold text-gray-900">
          {title}
        </h3>
      </div>

      {children}
    </div>
  );
}

/* ============================================================
   MAIN DASHBOARD
   ============================================================ */

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Unable to load dashboard
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Please sign in again to access your dashboard.
        </p>
      </div>
    );
  }

  const role = user.role as DashboardRole;

  switch (role) {
    case 'Owner':
      return <Navigate to="/owner" replace />;

    case 'HR Manager':
      return <HRDashboard />;

    case 'Department Manager':
      return <DepartmentManagerDashboard user={user} />;

    case 'Training Coordinator':
      return <TrainingCoordinatorDashboard />;

    case 'Event Organizer':
      return <EventOrganizerDashboard />;

    case 'Grievance Officer':
      return <GrievanceOfficerDashboard />;

    case 'Employee':
    default:
      return <EmployeeDashboard user={user} />;
  }
}

/* ============================================================
   SHARED DASHBOARD DATA HOOK
   ============================================================ */

function useDashboardData(user: any) {
  const [data, setData] =
    useState<DashboardData>({
      employees: [],
      attendance: [],
      attendanceSummary: null,
      leaves: [],
      performance: [],
      training: [],
      events: [],
      grievances: [],
      leaveBalance: null,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const employeeId =
        String(user.employeeId || '');

      const department =
        String(user.department || '');

      const today =
        todayString();

      const [
        employees,
        attendance,
        attendanceSummary,
        leaves,
        performance,
        training,
        events,
        grievances,
        leaveBalance,
      ] = await Promise.all([
        safeRequest(
          employeeService.getAll(),
          [],
        ),

        safeRequest(
          attendanceService.getAll({
            date: today,
          }),
          [],
        ),

        safeRequest(
          // IMPORTANT:
          // The old dashboard called a nonexistent
          // employee summary endpoint.
          //
          // This is the real backend endpoint.
          //
          // /api/attendance/summary?date=YYYY-MM-DD
          import('@/services/apiClient').then(
            ({ apiRequest }) =>
              apiRequest<any>(
                `/api/attendance/summary?date=${today}`,
              ),
          ),
          null,
        ),

        safeRequest(
          leaveService.getAll(),
          [],
        ),

        safeRequest(
          performanceService.getAll(),
          [],
        ),

        safeRequest(
          import('@/services/apiClient').then(
            ({ apiRequest }) =>
              apiRequest<any[]>(
                '/api/training',
              ),
          ),
          [],
        ),

        safeRequest(
          eventService.getAll(),
          [],
        ),

        safeRequest(
          grievanceService.getAll(),
          [],
        ),

        employeeId
          ? safeRequest(
              leaveService.getBalance(employeeId),
              null,
            )
          : Promise.resolve(null),
      ]);

      setData({
        employees:
          Array.isArray(employees)
            ? employees
            : [],

        attendance:
          Array.isArray(attendance)
            ? attendance
            : [],

        attendanceSummary,

        leaves:
          Array.isArray(leaves)
            ? leaves
            : [],

        performance:
          Array.isArray(performance)
            ? performance
            : [],

        training:
          Array.isArray(training)
            ? training
            : [],

        events:
          Array.isArray(events)
            ? events
            : [],

        grievances:
          Array.isArray(grievances)
            ? grievances
            : [],

        leaveBalance,
      });

      /*
       * We intentionally do not fail the complete dashboard
       * when one optional module has no data.
       *
       * The existing backend can legitimately return an
       * empty list for a module.
       */
      void department;
    } catch (requestError) {
      console.error(
        'StaffHub dashboard loading error:',
        requestError,
      );

      setError(
        'Please check that the StaffHub backend is running and that your login session is still valid.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [
    user.employeeId,
    user.department,
    user.role,
  ]);

  return {
    data,
    loading,
    error,
    reload: loadData,
  };
}

/* ============================================================
   EMPLOYEE DASHBOARD
   ============================================================ */

function EmployeeDashboard({
  user,
}: {
  user: any;
}) {
  const {
    data,
    loading,
    error,
    reload,
  } = useDashboardData(user);

  const fullName =
    `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
    'Employee';

  if (loading) {
    return <DashboardLoading />;
  }

  if (error) {
    return (
      <DashboardError
        message={error}
        onRetry={reload}
      />
    );
  }

  const employeeNumber =
    String(user.employeeId || '');

  const myAttendance =
    data.attendance.filter(
      (record) =>
        String(record.employeeNumber || '')
          .toLowerCase() ===
        employeeNumber.toLowerCase(),
    );

  const myLeaves =
    data.leaves.filter(
      (leave) =>
        String(leave.employeeId || '')
          .toLowerCase() ===
        employeeNumber.toLowerCase(),
    );

  const myPerformance =
    data.performance.filter(
      (review) =>
        String(review.employeeId || '')
          .toLowerCase() ===
        employeeNumber.toLowerCase(),
    );

  const myTraining =
    data.training.filter((training) => {
      const assigned =
        training.assignedEmployeeIds || [];

      const registered =
        training.registeredEmployeeIds || [];

      return (
        assigned.some(
          (id) =>
            String(id).toLowerCase() ===
            employeeNumber.toLowerCase(),
        ) ||
        registered.some(
          (id) =>
            String(id).toLowerCase() ===
            employeeNumber.toLowerCase(),
        )
      );
    });

  const myEvents =
    data.events.filter((event) =>
      (event.registeredIds || []).some(
        (id) =>
          String(id).toLowerCase() ===
          employeeNumber.toLowerCase(),
      ),
    );

  const todayAttendance =
    myAttendance.find(
      (record) =>
        isToday(record.attendanceDate),
    );

  const presentDays =
    myAttendance.filter((record) => {
      const status =
        String(record.status || '').toLowerCase();

      return (
        status.includes('present') ||
        Boolean(record.checkIn)
      );
    }).length;

  const lateDays =
    myAttendance.filter((record) =>
      String(record.status || '')
        .toLowerCase()
        .includes('late'),
    ).length;

  const totalRemaining =
    (data.leaveBalance?.annualLeave?.remaining || 0) +
    (data.leaveBalance?.sickLeave?.remaining || 0) +
    (data.leaveBalance?.personalLeave?.remaining || 0);

  const upcomingTraining =
    myTraining
      .filter(
        (training) =>
          isFutureDate(training.startDate) &&
          training.status !== 'Cancelled' &&
          training.status !== 'Completed',
      )
      .sort(
        (a, b) =>
          String(a.startDate || '').localeCompare(
            String(b.startDate || ''),
          ),
      )
      .slice(0, 5);

  const upcomingEvents =
    myEvents
      .filter(
        (event) =>
          isFutureDate(event.date) &&
          event.status !== 'Cancelled',
      )
      .sort(
        (a, b) =>
          String(a.date || '').localeCompare(
            String(b.date || ''),
          ),
      )
      .slice(0, 5);

  const latestPerformance =
    [...myPerformance]
      .sort(
        (a, b) =>
          String(b.reviewPeriod || '').localeCompare(
            String(a.reviewPeriod || ''),
          ),
      )
      .slice(0, 3);

  const recentLeaves =
    [...myLeaves]
      .sort(
        (a, b) =>
          String(b.startDate || '').localeCompare(
            String(a.startDate || ''),
          ),
      )
      .slice(0, 5);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">
        My Dashboard
      </h1>

      <p className="mb-6 text-sm text-gray-500">
        Welcome back, {fullName}. Here's your personal overview.
      </p>

      {/* ======================================================
          PERSONAL STATISTICS
          ====================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Attendance"
          value={
            todayAttendance?.status ||
            (todayAttendance?.checkIn
              ? 'Present'
              : 'Not marked')
          }
          icon={<Clock className="h-5 w-5" />}
          color="blue"
        />

        <StatCard
          title="Present Days"
          value={String(presentDays)}
          icon={<UserCheck className="h-5 w-5" />}
          color="green"
        />

        <StatCard
          title="Late Days"
          value={String(lateDays)}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="amber"
        />

        <StatCard
          title="Leave Remaining"
          value={String(totalRemaining)}
          icon={<CalendarDays className="h-5 w-5" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ==================================================
            LEAVE BALANCE
            ================================================== */}

        <SectionCard
          title="My Leave Balance"
          icon={<CalendarDays className="h-5 w-5" />}
        >
          <div className="space-y-4">
            {[
              {
                name: 'Annual Leave',
                balance:
                  data.leaveBalance?.annualLeave,
              },
              {
                name: 'Sick Leave',
                balance:
                  data.leaveBalance?.sickLeave,
              },
              {
                name: 'Personal Leave',
                balance:
                  data.leaveBalance?.personalLeave,
              },
            ].map((item) => {
              const total =
                item.balance?.total || 0;

              const remaining =
                item.balance?.remaining || 0;

              const used =
                item.balance?.used || 0;

              const percentage =
                total > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (used / total) * 100,
                      ),
                    )
                  : 0;

              return (
                <div key={item.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {item.name}
                    </span>

                    <span className="text-sm font-medium text-gray-900">
                      {remaining} remaining / {total}
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-indigo-500"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* ==================================================
            RECENT LEAVE
            ================================================== */}

        <SectionCard
          title="Recent Leave Requests"
          icon={<ClipboardCheck className="h-5 w-5" />}
        >
          {recentLeaves.length === 0 ? (
            <EmptyState
              icon={<ClipboardCheck className="h-5 w-5" />}
              title="No leave requests"
              message="Your recent leave requests will appear here."
            />
          ) : (
            <div className="space-y-3">
              {recentLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="rounded-lg border border-gray-100 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {leave.type || 'Leave'}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(leave.startDate)} -{' '}
                        {formatDate(leave.endDate)}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                        leave.status,
                      )}`}
                    >
                      {leave.status || 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ==================================================
            TRAINING
            ================================================== */}

        <SectionCard
          title="Upcoming Training"
          icon={<GraduationCap className="h-5 w-5" />}
        >
          {upcomingTraining.length === 0 ? (
            <EmptyState
              icon={<GraduationCap className="h-5 w-5" />}
              title="No upcoming training"
              message="Your registered or assigned training programs will appear here."
            />
          ) : (
            <div className="space-y-3">
              {upcomingTraining.map((training) => (
                <div
                  key={training.id}
                  className="rounded-lg border border-gray-100 p-3"
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {training.title || 'Training'}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {formatDate(training.startDate)}
                    {training.location
                      ? ` • ${training.location}`
                      : ''}
                  </p>

                  {training.trainer && (
                    <p className="mt-1 text-xs text-gray-500">
                      Trainer: {training.trainer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ==================================================
            EVENTS
            ================================================== */}

        <SectionCard
          title="Upcoming Events"
          icon={<Calendar className="h-5 w-5" />}
        >
          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-5 w-5" />}
              title="No upcoming events"
              message="Events you register for will appear here."
            />
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border border-gray-100 p-3"
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {event.title || 'Event'}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {formatDate(event.date)}
                    {event.time
                      ? ` • ${event.time}`
                      : ''}
                  </p>

                  {event.location && (
                    <p className="mt-1 text-xs text-gray-500">
                      {event.location}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ==================================================
            PERFORMANCE
            ================================================== */}

        <SectionCard
          title="Performance"
          icon={<BarChart3 className="h-5 w-5" />}
        >
          {latestPerformance.length === 0 ? (
            <EmptyState
              icon={<BarChart3 className="h-5 w-5" />}
              title="No performance data"
              message="Your performance reviews will appear here."
            />
          ) : (
            <div className="space-y-3">
              {latestPerformance.map((review) => (
                <div
                  key={review.id}
                  className="rounded-lg border border-gray-100 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {review.reviewPeriod || 'Review'}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {review.status || 'Pending Review'}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-600">
                        {review.overallRating != null
                          ? review.overallRating.toFixed(2)
                          : '—'}
                      </p>

                      <p className="text-xs text-gray-400">
                        / 5
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ==================================================
            NOTIFICATIONS
            ================================================== */}

        <SectionCard
          title="Notifications"
          icon={<Bell className="h-5 w-5" />}
        >
          <EmptyState
            icon={<Bell className="h-5 w-5" />}
            title="Notifications"
            message="The current backend does not expose a working notification GET endpoint, so no fake notification data is displayed."
          />
        </SectionCard>
      </div>
    </div>
  );
}

/* ============================================================
   HR MANAGER DASHBOARD
   ============================================================ */

function HRDashboard() {
  const { user } = useAuth();

  const {
    data,
    loading,
    error,
    reload,
  } = useDashboardData(user);

  if (loading) {
    return <DashboardLoading />;
  }

  if (error) {
    return (
      <DashboardError
        message={error}
        onRetry={reload}
      />
    );
  }

  const employees =
    data.employees;

  const activeEmployees =
    employees.filter(
      (employee) =>
        String(employee.employmentStatus || '')
          .toLowerCase() === 'active',
    );

  const todayAttendance =
    data.attendance;

  const presentToday =
    todayAttendance.filter((record) => {
      const status =
        String(record.status || '').toLowerCase();

      return (
        status.includes('present') ||
        Boolean(record.checkIn)
      );
    }).length;

  const lateToday =
    todayAttendance.filter((record) =>
      String(record.status || '')
        .toLowerCase()
        .includes('late'),
    ).length;

  const onLeaveToday =
    data.leaves.filter((leave) => {
      const status =
        String(leave.status || '').toLowerCase();

      return (
        status.includes('approved') &&
        Boolean(leave.startDate) &&
        Boolean(leave.endDate) &&
        leave.startDate! <= todayString() &&
        leave.endDate! >= todayString()
      );
    }).length;

  const pendingLeaves =
    data.leaves.filter(
      (leave) =>
        String(leave.status || '')
          .toLowerCase() === 'pending',
    );

  const upcomingEvents =
    data.events
      .filter(
        (event) =>
          isFutureDate(event.date) &&
          event.status !== 'Cancelled',
      )
      .sort(
        (a, b) =>
          String(a.date || '').localeCompare(
            String(b.date || ''),
          ),
      )
      .slice(0, 5);

  const activeTraining =
    data.training.filter(
      (training) =>
        training.status === 'Active' ||
        training.status === 'Ongoing',
    );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">
        HR Dashboard
      </h1>

      <p className="mb-6 text-sm text-gray-500">
        Organization overview and key workforce information.
      </p>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Employees"
          value={String(employees.length)}
          icon={<Users className="h-5 w-5" />}
          color="indigo"
        />

        <StatCard
          title="Present Today"
          value={String(presentToday)}
          icon={<UserCheck className="h-5 w-5" />}
          color="green"
        />

        <StatCard
          title="Late Today"
          value={String(lateToday)}
          icon={<Clock className="h-5 w-5" />}
          color="amber"
        />

        <StatCard
          title="On Leave"
          value={String(onLeaveToday)}
          icon={<CalendarDays className="h-5 w-5" />}
          color="purple"
        />

        <StatCard
          title="Pending Leaves"
          value={String(pendingLeaves.length)}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Attendance Overview"
          icon={<UserCheck className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <MetricRow
              label="Expected Employees"
              value={
                data.attendanceSummary?.expected ??
                activeEmployees.length
              }
            />

            <MetricRow
              label="Attended"
              value={
                data.attendanceSummary?.attended ??
                presentToday
              }
            />

            <MetricRow
              label="Late"
              value={
                data.attendanceSummary?.late ??
                lateToday
              }
            />

            <MetricRow
              label="On Leave"
              value={
                data.attendanceSummary?.onLeave ??
                onLeaveToday
              }
            />

            <MetricRow
              label="Currently Working"
              value={
                data.attendanceSummary?.currentlyWorking ??
                0
              }
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Leave Overview"
          icon={<CalendarDays className="h-5 w-5" />}
        >
          {pendingLeaves.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="h-5 w-5" />}
              title="No pending requests"
              message="There are currently no pending leave requests."
            />
          ) : (
            <div className="space-y-3">
              {pendingLeaves.slice(0, 5).map((leave) => (
                <DashboardListItem
                  key={leave.id}
                  title={
                    leave.employeeName ||
                    leave.employeeId ||
                    'Employee'
                  }
                  subtitle={`${leave.type || 'Leave'} • ${formatDate(
                    leave.startDate,
                  )}`}
                  status={leave.status || 'Pending'}
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Employee Status"
          icon={<Users className="h-5 w-5" />}
        >
          <div className="space-y-3">
            {employees.slice(0, 8).map((employee) => (
              <DashboardListItem
                key={
                  employee.id ||
                  employee.employeeNumber
                }
                title={getEmployeeName(employee)}
                subtitle={`${employee.employeeNumber || ''}${
                  employee.department
                    ? ` • ${employee.department}`
                    : ''
                }`}
                status={
                  employee.employmentStatus ||
                  'Active'
                }
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Training Overview"
          icon={<GraduationCap className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <MetricRow
              label="Total Programs"
              value={data.training.length}
            />

            <MetricRow
              label="Active Programs"
              value={activeTraining.length}
            />

            <MetricRow
              label="Upcoming Programs"
              value={
                data.training.filter(
                  (training) =>
                    isFutureDate(
                      training.startDate,
                    ),
                ).length
              }
            />

            <MetricRow
              label="Completed Programs"
              value={
                data.training.filter(
                  (training) =>
                    training.status ===
                    'Completed',
                ).length
              }
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Upcoming Events"
          icon={<Calendar className="h-5 w-5" />}
        >
          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-5 w-5" />}
              title="No upcoming events"
              message="Upcoming organization events will appear here."
            />
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <DashboardListItem
                  key={event.id}
                  title={event.title || 'Event'}
                  subtitle={`${formatDate(event.date)}${
                    event.location
                      ? ` • ${event.location}`
                      : ''
                  }`}
                  status={
                    event.status || 'Scheduled'
                  }
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="HR Activity"
          icon={<BriefcaseBusiness className="h-5 w-5" />}
        >
          <div className="space-y-3">
            <DashboardListItem
              title="Employee records"
              subtitle={`${employees.length} employee records available`}
              status="Available"
            />

            <DashboardListItem
              title="Leave requests"
              subtitle={`${data.leaves.length} leave requests`}
              status="Available"
            />

            <DashboardListItem
              title="Performance reviews"
              subtitle={`${data.performance.length} reviews`}
              status="Available"
            />

            <DashboardListItem
              title="Training programs"
              subtitle={`${data.training.length} programs`}
              status="Available"
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

/* ============================================================
   DEPARTMENT MANAGER DASHBOARD
   ============================================================ */

function DepartmentManagerDashboard({
  user,
}: {
  user: any;
}) {
  const {
    data,
    loading,
    error,
    reload,
  } = useDashboardData(user);

  if (loading) {
    return <DashboardLoading />;
  }

  if (error) {
    return (
      <DashboardError
        message={error}
        onRetry={reload}
      />
    );
  }

  const department =
    String(user.department || '').trim();

  const teamEmployees =
    data.employees.filter(
      (employee) =>
        String(employee.department || '')
          .toLowerCase() ===
        department.toLowerCase(),
    );

  const teamNumbers =
    new Set(
      teamEmployees
        .map(
          (employee) =>
            employee.employeeNumber,
        )
        .filter(Boolean)
        .map((value) =>
          String(value).toLowerCase(),
        ),
    );

  const teamAttendance =
    data.attendance.filter((record) =>
      teamNumbers.has(
        String(
          record.employeeNumber || '',
        ).toLowerCase(),
      ),
    );

  const presentToday =
    teamAttendance.filter((record) => {
      const status =
        String(record.status || '').toLowerCase();

      return (
        status.includes('present') ||
        Boolean(record.checkIn)
      );
    }).length;

  const lateToday =
    teamAttendance.filter((record) =>
      String(record.status || '')
        .toLowerCase()
        .includes('late'),
    ).length;

  const teamLeaves =
    data.leaves.filter(
      (leave) =>
        teamNumbers.has(
          String(
            leave.employeeId || '',
          ).toLowerCase(),
        ),
    );

  const pendingLeaves =
    teamLeaves.filter(
      (leave) =>
        String(leave.status || '')
          .toLowerCase() === 'pending',
    );

  const teamPerformance =
    data.performance.filter(
      (review) =>
        teamNumbers.has(
          String(
            review.employeeId || '',
          ).toLowerCase(),
        ),
    );

  const teamTraining =
    data.training.filter((training) => {
      const ids = [
        ...(training.assignedEmployeeIds || []),
        ...(training.registeredEmployeeIds || []),
      ];

      return ids.some((id) =>
        teamNumbers.has(
          String(id).toLowerCase(),
        ),
      );
    });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">
        {department || 'Department'} Dashboard
      </h1>

      <p className="mb-6 text-sm text-gray-500">
        Department overview and team information.
      </p>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Team Members"
          value={String(teamEmployees.length)}
          icon={<Users className="h-5 w-5" />}
          color="indigo"
        />

        <StatCard
          title="Present Today"
          value={String(presentToday)}
          icon={<UserCheck className="h-5 w-5" />}
          color="green"
        />

        <StatCard
          title="Late / Absent"
          value={String(lateToday)}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="amber"
        />

        <StatCard
          title="Pending Leaves"
          value={String(pendingLeaves.length)}
          icon={<CalendarDays className="h-5 w-5" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Team Attendance"
          icon={<UserCheck className="h-5 w-5" />}
        >
          <div className="space-y-3">
            <MetricRow
              label="Team members"
              value={teamEmployees.length}
            />

            <MetricRow
              label="Attendance records today"
              value={teamAttendance.length}
            />

            <MetricRow
              label="Present"
              value={presentToday}
            />

            <MetricRow
              label="Late"
              value={lateToday}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Pending Leave Approvals"
          icon={<ClipboardCheck className="h-5 w-5" />}
        >
          {pendingLeaves.length === 0 ? (
            <EmptyState
              icon={<ClipboardCheck className="h-5 w-5" />}
              title="No pending requests"
              message="There are no pending leave requests for your department."
            />
          ) : (
            <div className="space-y-3">
              {pendingLeaves.slice(0, 6).map((leave) => (
                <DashboardListItem
                  key={leave.id}
                  title={
                    leave.employeeName ||
                    leave.employeeId ||
                    'Employee'
                  }
                  subtitle={`${leave.type || 'Leave'} • ${formatDate(
                    leave.startDate,
                  )}`}
                  status={leave.status || 'Pending'}
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Team Members"
          icon={<Users className="h-5 w-5" />}
        >
          {teamEmployees.length === 0 ? (
            <EmptyState
              icon={<Users className="h-5 w-5" />}
              title="No team data"
              message="No employees were found in your department."
            />
          ) : (
            <div className="space-y-3">
              {teamEmployees.slice(0, 8).map((employee) => (
                <DashboardListItem
                  key={
                    employee.id ||
                    employee.employeeNumber
                  }
                  title={getEmployeeName(employee)}
                  subtitle={
                    employee.position ||
                    employee.employeeNumber ||
                    'Employee'
                  }
                  status={
                    employee.employmentStatus ||
                    'Active'
                  }
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Team Performance"
          icon={<BarChart3 className="h-5 w-5" />}
        >
          {teamPerformance.length === 0 ? (
            <EmptyState
              icon={<BarChart3 className="h-5 w-5" />}
              title="No performance data"
              message="Team performance reviews will appear here."
            />
          ) : (
            <div className="space-y-3">
              {teamPerformance
                .sort(
                  (a, b) =>
                    String(
                      b.reviewPeriod || '',
                    ).localeCompare(
                      String(
                        a.reviewPeriod || '',
                      ),
                    ),
                )
                .slice(0, 6)
                .map((review) => (
                  <DashboardListItem
                    key={review.id}
                    title={
                      review.employeeId ||
                      'Employee'
                    }
                    subtitle={
                      review.reviewPeriod ||
                      'Review'
                    }
                    status={
                      review.overallRating != null
                        ? `${review.overallRating.toFixed(
                            2,
                          )} / 5`
                        : review.status ||
                          'Pending'
                    }
                  />
                ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Department Training"
          icon={<GraduationCap className="h-5 w-5" />}
        >
          {teamTraining.length === 0 ? (
            <EmptyState
              icon={<GraduationCap className="h-5 w-5" />}
              title="No training data"
              message="Training programs assigned to your department will appear here."
            />
          ) : (
            <div className="space-y-3">
              {teamTraining.slice(0, 6).map((training) => (
                <DashboardListItem
                  key={training.id}
                  title={
                    training.title ||
                    'Training'
                  }
                  subtitle={formatDate(
                    training.startDate,
                  )}
                  status={
                    training.status ||
                    'Scheduled'
                  }
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Department Activity"
          icon={<Bell className="h-5 w-5" />}
        >
          <div className="space-y-3">
            <DashboardListItem
              title="Team members"
              subtitle={`${teamEmployees.length} employees`}
              status="Available"
            />

            <DashboardListItem
              title="Leave requests"
              subtitle={`${teamLeaves.length} requests`}
              status="Available"
            />

            <DashboardListItem
              title="Performance reviews"
              subtitle={`${teamPerformance.length} reviews`}
              status="Available"
            />

            <DashboardListItem
              title="Training"
              subtitle={`${teamTraining.length} programs`}
              status="Available"
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

/* ============================================================
   TRAINING COORDINATOR DASHBOARD
   ============================================================ */

function TrainingCoordinatorDashboard() {
  const { user } = useAuth();

  const {
    data,
    loading,
    error,
    reload,
  } = useDashboardData(user);

  if (loading) {
    return <DashboardLoading />;
  }

  if (error) {
    return (
      <DashboardError
        message={error}
        onRetry={reload}
      />
    );
  }

  const activePrograms =
    data.training.filter(
      (training) =>
        training.status === 'Active' ||
        training.status === 'Ongoing',
    );

  const upcomingPrograms =
    data.training.filter(
      (training) =>
        isFutureDate(training.startDate) &&
        training.status !== 'Cancelled' &&
        training.status !== 'Completed',
    );

  const completedPrograms =
    data.training.filter(
      (training) =>
        training.status === 'Completed',
    );

  const totalParticipants =
    data.training.reduce(
      (total, training) =>
        total +
        (training.registeredEmployeeIds?.length || 0),
      0,
    );

  const totalCapacity =
    data.training.reduce(
      (total, training) =>
        total +
        Number(training.capacity || 0),
      0,
    );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">
        Training Dashboard
      </h1>

      <p className="mb-6 text-sm text-gray-500">
        Manage training programs, participants, and training activity.
      </p>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Programs"
          value={String(activePrograms.length)}
          icon={<GraduationCap className="h-5 w-5" />}
          color="indigo"
        />

        <StatCard
          title="Upcoming Programs"
          value={String(upcomingPrograms.length)}
          icon={<Calendar className="h-5 w-5" />}
          color="blue"
        />

        <StatCard
          title="Completed Programs"
          value={String(completedPrograms.length)}
          icon={<UserCheck className="h-5 w-5" />}
          color="green"
        />

        <StatCard
          title="Total Participants"
          value={String(totalParticipants)}
          icon={<Users className="h-5 w-5" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Training Programs"
          icon={<GraduationCap className="h-5 w-5" />}
        >
          {data.training.length === 0 ? (
            <EmptyState
              icon={<GraduationCap className="h-5 w-5" />}
              title="No training programs"
              message="Training programs will appear here when available."
            />
          ) : (
            <div className="space-y-3">
              {data.training.slice(0, 8).map((training) => (
                <DashboardListItem
                  key={training.id}
                  title={
                    training.title ||
                    'Training'
                  }
                  subtitle={formatDate(
                    training.startDate,
                  )}
                  status={
                    training.status ||
                    'Scheduled'
                  }
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Upcoming Training"
          icon={<Calendar className="h-5 w-5" />}
        >
          {upcomingPrograms.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-5 w-5" />}
              title="No upcoming training"
              message="Upcoming training sessions will appear here."
            />
          ) : (
            <div className="space-y-3">
              {upcomingPrograms
                .slice(0, 6)
                .map((training) => (
                  <DashboardListItem
                    key={training.id}
                    title={
                      training.title ||
                      'Training'
                    }
                    subtitle={`${formatDate(
                      training.startDate,
                    )}${
                      training.location
                        ? ` • ${training.location}`
                        : ''
                    }`}
                    status={
                      training.status ||
                      'Scheduled'
                    }
                  />
                ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Participant Overview"
          icon={<Users className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <MetricRow
              label="Total participants"
              value={totalParticipants}
            />

            <MetricRow
              label="Training capacity"
              value={totalCapacity}
            />

            <MetricRow
              label="Available places"
              value={Math.max(
                0,
                totalCapacity -
                  totalParticipants,
              )}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Training Capacity"
          icon={<BarChart3 className="h-5 w-5" />}
        >
          {data.training.length === 0 ? (
            <EmptyState
              icon={<BarChart3 className="h-5 w-5" />}
              title="No capacity data"
              message="Training capacity information will appear here."
            />
          ) : (
            <div className="space-y-3">
              {data.training.slice(0, 6).map((training) => {
                const capacity =
                  Number(
                    training.capacity || 0,
                  );

                const registered =
                  training.registeredEmployeeIds
                    ?.length || 0;

                const percentage =
                  capacity > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (registered /
                            capacity) *
                            100,
                        ),
                      )
                    : 0;

                return (
                  <div key={training.id}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-gray-600">
                        {training.title ||
                          'Training'}
                      </span>

                      <span className="font-medium text-gray-900">
                        {registered} / {capacity}
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-indigo-500"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Recent Training Activity"
          icon={<Bell className="h-5 w-5" />}
        >
          <div className="space-y-3">
            <DashboardListItem
              title="Training programs"
              subtitle={`${data.training.length} programs available`}
              status="Available"
            />

            <DashboardListItem
              title="Participants"
              subtitle={`${totalParticipants} registrations`}
              status="Available"
            />

            <DashboardListItem
              title="Completed"
              subtitle={`${completedPrograms.length} completed programs`}
              status="Available"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Training Performance"
          icon={<BarChart3 className="h-5 w-5" />}
        >
          <EmptyState
            icon={<BarChart3 className="h-5 w-5" />}
            title="Training performance"
            message="The current training API provides program, registration, attendance and completion data, but no separate performance score endpoint."
          />
        </SectionCard>
      </div>
    </div>
  );
}

/* ============================================================
   EVENT ORGANIZER DASHBOARD
   ============================================================ */

function EventOrganizerDashboard() {
  const { user } = useAuth();

  const {
    data,
    loading,
    error,
    reload,
  } = useDashboardData(user);

  if (loading) {
    return <DashboardLoading />;
  }

  if (error) {
    return (
      <DashboardError
        message={error}
        onRetry={reload}
      />
    );
  }

  const upcomingEvents =
    data.events
      .filter(
        (event) =>
          isFutureDate(event.date) &&
          event.status !== 'Cancelled',
      )
      .sort(
        (a, b) =>
          String(a.date || '').localeCompare(
            String(b.date || ''),
          ),
      );

  const totalRegistrations =
    data.events.reduce(
      (total, event) =>
        total +
        Number(
          event.registeredCount ??
            event.registeredIds?.length ??
            0,
        ),
      0,
    );

  const totalCapacity =
    data.events.reduce(
      (total, event) =>
        total +
        Number(event.capacity || 0),
      0,
    );

  const availableCapacity =
    data.events.reduce(
      (total, event) =>
        total +
        Number(
          event.availableSeats ??
            Math.max(
              0,
              Number(event.capacity || 0) -
                Number(
                  event.registeredCount ??
                    event.registeredIds?.length ??
                    0,
                ),
            ),
        ),
      0,
    );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">
        Event Dashboard
      </h1>

      <p className="mb-6 text-sm text-gray-500">
        Manage organization events, registrations, and capacity.
      </p>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Events"
          value={String(data.events.length)}
          icon={<Calendar className="h-5 w-5" />}
          color="indigo"
        />

        <StatCard
          title="Upcoming Events"
          value={String(upcomingEvents.length)}
          icon={<CalendarDays className="h-5 w-5" />}
          color="blue"
        />

        <StatCard
          title="Registrations"
          value={String(totalRegistrations)}
          icon={<UserCheck className="h-5 w-5" />}
          color="green"
        />

        <StatCard
          title="Available Capacity"
          value={String(availableCapacity)}
          icon={<Users className="h-5 w-5" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Upcoming Events"
          icon={<Calendar className="h-5 w-5" />}
        >
          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-5 w-5" />}
              title="No upcoming events"
              message="Upcoming events will appear here."
            />
          ) : (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 8).map((event) => (
                <DashboardListItem
                  key={event.id}
                  title={event.title || 'Event'}
                  subtitle={`${formatDate(event.date)}${
                    event.location
                      ? ` • ${event.location}`
                      : ''
                  }`}
                  status={
                    event.status ||
                    'Scheduled'
                  }
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Event Registration"
          icon={<UserCheck className="h-5 w-5" />}
        >
          {data.events.length === 0 ? (
            <EmptyState
              icon={<UserCheck className="h-5 w-5" />}
              title="No registration data"
              message="Event registration information will appear here."
            />
          ) : (
            <div className="space-y-3">
              {data.events.slice(0, 6).map((event) => (
                <DashboardListItem
                  key={event.id}
                  title={
                    event.title ||
                    'Event'
                  }
                  subtitle={`${Number(
                    event.registeredCount ??
                      event.registeredIds
                        ?.length ??
                      0,
                  )} registrations`}
                  status="Available"
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Event Capacity"
          icon={<Users className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <MetricRow
              label="Total capacity"
              value={totalCapacity}
            />

            <MetricRow
              label="Total registrations"
              value={totalRegistrations}
            />

            <MetricRow
              label="Available capacity"
              value={availableCapacity}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Recent Event Activity"
          icon={<Bell className="h-5 w-5" />}
        >
          <div className="space-y-3">
            <DashboardListItem
              title="Events"
              subtitle={`${data.events.length} events available`}
              status="Available"
            />

            <DashboardListItem
              title="Registrations"
              subtitle={`${totalRegistrations} total registrations`}
              status="Available"
            />

            <DashboardListItem
              title="Upcoming"
              subtitle={`${upcomingEvents.length} upcoming events`}
              status="Available"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Event Performance"
          icon={<BarChart3 className="h-5 w-5" />}
        >
          {data.events.length === 0 ? (
            <EmptyState
              icon={<BarChart3 className="h-5 w-5" />}
              title="No performance data"
              message="Event performance information will appear here."
            />
          ) : (
            <div className="space-y-3">
              {data.events.slice(0, 6).map((event) => {
                const capacity =
                  Number(event.capacity || 0);

                const registered =
                  Number(
                    event.registeredCount ??
                      event.registeredIds
                        ?.length ??
                      0,
                  );

                const percentage =
                  capacity > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (registered /
                            capacity) *
                            100,
                        ),
                      )
                    : 0;

                return (
                  <div key={event.id}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-gray-600">
                        {event.title ||
                          'Event'}
                      </span>

                      <span className="font-medium text-gray-900">
                        {percentage}%
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-indigo-500"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Event Calendar"
          icon={<CalendarDays className="h-5 w-5" />}
        >
          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="h-5 w-5" />}
              title="No scheduled events"
              message="Your event schedule will appear here."
            />
          ) : (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 6).map((event) => (
                <DashboardListItem
                  key={event.id}
                  title={
                    event.title ||
                    'Event'
                  }
                  subtitle={`${formatDate(
                    event.date,
                  )}${
                    event.time
                      ? ` • ${event.time}`
                      : ''
                  }`}
                  status={
                    event.status ||
                    'Scheduled'
                  }
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

/* ============================================================
   GRIEVANCE OFFICER DASHBOARD
   ============================================================ */

function GrievanceOfficerDashboard() {
  const { user } = useAuth();

  const {
    data,
    loading,
    error,
    reload,
  } = useDashboardData(user);

  if (loading) {
    return <DashboardLoading />;
  }

  if (error) {
    return (
      <DashboardError
        message={error}
        onRetry={reload}
      />
    );
  }

  const newGrievances =
    data.grievances.filter(
      (grievance) =>
        String(grievance.status || '')
          .toLowerCase() === 'new',
    );

  const underReview =
    data.grievances.filter(
      (grievance) =>
        String(grievance.status || '')
          .toLowerCase()
          .includes('review'),
    );

  const assigned =
    data.grievances.filter(
      (grievance) =>
        Boolean(grievance.assignedTo),
    );

  const resolved =
    data.grievances.filter(
      (grievance) =>
        String(grievance.status || '')
          .toLowerCase()
          .includes('resolved'),
    );

  const highPriority =
    data.grievances.filter(
      (grievance) =>
        String(grievance.priority || '')
          .toLowerCase() === 'high',
    );

  const recentGrievances =
    [...data.grievances]
      .sort(
        (a, b) =>
          String(b.createdAt || '').localeCompare(
            String(a.createdAt || ''),
          ),
      )
      .slice(0, 8);

  const assignedCases =
    data.grievances.filter(
      (grievance) =>
        grievance.assignedTo ||
        grievance.assignedToName,
    );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">
        Grievance Dashboard
      </h1>

      <p className="mb-6 text-sm text-gray-500">
        Monitor grievances, priority cases, and resolution activity.
      </p>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="New Grievances"
          value={String(newGrievances.length)}
          icon={<MessageSquareWarning className="h-5 w-5" />}
          color="indigo"
        />

        <StatCard
          title="Under Review"
          value={String(underReview.length)}
          icon={<Clock className="h-5 w-5" />}
          color="blue"
        />

        <StatCard
          title="Assigned"
          value={String(assigned.length)}
          icon={<UserRoundCheck className="h-5 w-5" />}
          color="purple"
        />

        <StatCard
          title="Resolved"
          value={String(resolved.length)}
          icon={<UserCheck className="h-5 w-5" />}
          color="green"
        />

        <StatCard
          title="High Priority"
          value={String(highPriority.length)}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Recent Grievances"
          icon={<MessageSquareWarning className="h-5 w-5" />}
        >
          {recentGrievances.length === 0 ? (
            <EmptyState
              icon={<MessageSquareWarning className="h-5 w-5" />}
              title="No grievances"
              message="Recent employee grievances will appear here."
            />
          ) : (
            <div className="space-y-3">
              {recentGrievances.map((grievance) => (
                <DashboardListItem
                  key={grievance.id}
                  title={
                    grievance.employeeName ||
                    grievance.employeeId ||
                    'Employee'
                  }
                  subtitle={
                    grievance.category ||
                    'General grievance'
                  }
                  status={
                    grievance.status ||
                    'New'
                  }
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="High-Priority Cases"
          icon={<AlertTriangle className="h-5 w-5" />}
        >
          {highPriority.length === 0 ? (
            <EmptyState
              icon={<AlertTriangle className="h-5 w-5" />}
              title="No high-priority cases"
              message="High-priority grievance cases will appear here."
            />
          ) : (
            <div className="space-y-3">
              {highPriority.slice(0, 8).map((grievance) => (
                <DashboardListItem
                  key={grievance.id}
                  title={
                    grievance.employeeName ||
                    grievance.employeeId ||
                    'Employee'
                  }
                  subtitle={
                    grievance.category ||
                    'Grievance'
                  }
                  status="High"
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Grievance Status"
          icon={<BarChart3 className="h-5 w-5" />}
        >
          <div className="space-y-3">
            <MetricRow
              label="Total"
              value={data.grievances.length}
            />

            <MetricRow
              label="New"
              value={newGrievances.length}
            />

            <MetricRow
              label="Under Review"
              value={underReview.length}
            />

            <MetricRow
              label="Assigned"
              value={assigned.length}
            />

            <MetricRow
              label="Resolved"
              value={resolved.length}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Resolution Activity"
          icon={<UserCheck className="h-5 w-5" />}
        >
          <div className="space-y-3">
            <MetricRow
              label="Resolved cases"
              value={resolved.length}
            />

            <MetricRow
              label="Open cases"
              value={
                Math.max(
                  0,
                  data.grievances.length -
                    resolved.length,
                )
              }
            />

            <MetricRow
              label="High priority"
              value={highPriority.length}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Assigned Cases"
          icon={<UserRoundCheck className="h-5 w-5" />}
        >
          {assignedCases.length === 0 ? (
            <EmptyState
              icon={<UserRoundCheck className="h-5 w-5" />}
              title="No assigned cases"
              message="Assigned grievance cases will appear here."
            />
          ) : (
            <div className="space-y-3">
              {assignedCases.slice(0, 8).map((grievance) => (
                <DashboardListItem
                  key={grievance.id}
                  title={
                    grievance.employeeName ||
                    grievance.employeeId ||
                    'Employee'
                  }
                  subtitle={
                    grievance.assignedToName ||
                    grievance.assignedTo ||
                    'Assigned'
                  }
                  status={
                    grievance.status ||
                    'Assigned'
                  }
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Recent Activity"
          icon={<Bell className="h-5 w-5" />}
        >
          <div className="space-y-3">
            <DashboardListItem
              title="Total grievances"
              subtitle={`${data.grievances.length} cases`}
              status="Available"
            />

            <DashboardListItem
              title="New cases"
              subtitle={`${newGrievances.length} new cases`}
              status="Available"
            />

            <DashboardListItem
              title="Resolved cases"
              subtitle={`${resolved.length} resolved`}
              status="Available"
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

/* ============================================================
   SMALL DASHBOARD COMPONENTS
   ============================================================ */

function MetricRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-gray-600">
        {label}
      </span>

      <span className="text-sm font-semibold text-gray-900">
        {value}
      </span>
    </div>
  );
}

function DashboardListItem({
  title,
  subtitle,
  status,
}: {
  title: string;
  subtitle: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">
          {title}
        </p>

        <p className="mt-1 truncate text-xs text-gray-500">
          {subtitle}
        </p>
      </div>

      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
          status,
        )}`}
      >
        {status}
      </span>
    </div>
  );
}