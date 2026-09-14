import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/ui';
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
} from 'lucide-react';

type DashboardRole =
  | 'Employee'
  | 'HR Manager'
  | 'Department Manager'
  | 'Training Coordinator'
  | 'Event Organizer'
  | 'Grievance Officer';

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

      <h4 className="mt-3 text-sm font-semibold text-gray-700">{title}</h4>

      <p className="mt-1 max-w-sm text-xs text-gray-500">{message}</p>
    </div>
  );
}

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
        {icon && <span className="text-gray-500">{icon}</span>}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      {children}
    </div>
  );
}

function EmptyList({
  title,
  message,
  icon,
}: {
  title: string;
  message: string;
  icon: React.ReactNode;
}) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      message={message}
    />
  );
}

/* =========================================================
   MAIN DASHBOARD
   ========================================================= */

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

/* =========================================================
   EMPLOYEE DASHBOARD
   ========================================================= */

function EmployeeDashboard({ user }: { user: any }) {
  const fullName =
    `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
    'Employee';

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">
        My Dashboard
      </h1>

      <p className="mb-6 text-sm text-gray-500">
        Welcome back, {fullName}. Here's your personal overview.
      </p>

      {/* Personal statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Attendance"
          value="—"
          icon={<Clock className="h-5 w-5" />}
          color="blue"
        />

        <StatCard
          title="Present Days"
          value="—"
          icon={<UserCheck className="h-5 w-5" />}
          color="green"
        />

        <StatCard
          title="Late Days"
          value="—"
          icon={<AlertTriangle className="h-5 w-5" />}
          color="amber"
        />

        <StatCard
          title="Leave Remaining"
          value="—"
          icon={<CalendarDays className="h-5 w-5" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="My Leave Balance"
          icon={<CalendarDays className="h-5 w-5" />}
        >
          <div className="space-y-4">
            {['Annual Leave', 'Sick Leave', 'Personal Leave'].map(
              (leaveType) => (
                <div key={leaveType}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {leaveType}
                    </span>

                    <span className="text-sm font-medium text-gray-900">
                      —
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div className="h-2 w-0 rounded-full bg-indigo-500" />
                  </div>
                </div>
              ),
            )}
          </div>

          <p className="mt-4 text-xs text-gray-400">
            Leave balance will appear here when leave data is available.
          </p>
        </SectionCard>

        <SectionCard
          title="Recent Leave Requests"
          icon={<ClipboardCheck className="h-5 w-5" />}
        >
          <EmptyList
            icon={<ClipboardCheck className="h-5 w-5" />}
            title="No leave requests"
            message="Your recent leave requests will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Upcoming Training"
          icon={<GraduationCap className="h-5 w-5" />}
        >
          <EmptyList
            icon={<GraduationCap className="h-5 w-5" />}
            title="No upcoming training"
            message="Your registered training programs will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Upcoming Events"
          icon={<Calendar className="h-5 w-5" />}
        >
          <EmptyList
            icon={<Calendar className="h-5 w-5" />}
            title="No upcoming events"
            message="Events you register for will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Performance"
          icon={<BarChart3 className="h-5 w-5" />}
        >
          <EmptyList
            icon={<BarChart3 className="h-5 w-5" />}
            title="No performance data"
            message="Your performance information will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Notifications"
          icon={<Bell className="h-5 w-5" />}
        >
          <EmptyList
            icon={<Bell className="h-5 w-5" />}
            title="No new notifications"
            message="Your latest notifications will appear here."
          />
        </SectionCard>
      </div>
    </div>
  );
}

/* =========================================================
   HR MANAGER DASHBOARD
   ========================================================= */

function HRDashboard() {
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
          value="—"
          icon={<Users className="h-5 w-5" />}
          color="indigo"
        />

        <StatCard
          title="Present Today"
          value="—"
          icon={<UserCheck className="h-5 w-5" />}
          color="green"
        />

        <StatCard
          title="Late Today"
          value="—"
          icon={<Clock className="h-5 w-5" />}
          color="amber"
        />

        <StatCard
          title="On Leave"
          value="—"
          icon={<CalendarDays className="h-5 w-5" />}
          color="purple"
        />

        <StatCard
          title="Pending Leaves"
          value="—"
          icon={<AlertTriangle className="h-5 w-5" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Attendance Overview"
          icon={<UserCheck className="h-5 w-5" />}
        >
          <EmptyList
            icon={<UserCheck className="h-5 w-5" />}
            title="No attendance data"
            message="Employee attendance information will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Leave Overview"
          icon={<CalendarDays className="h-5 w-5" />}
        >
          <EmptyList
            icon={<CalendarDays className="h-5 w-5" />}
            title="No leave data"
            message="Leave requests and statistics will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Employee Status"
          icon={<Users className="h-5 w-5" />}
        >
          <EmptyList
            icon={<Users className="h-5 w-5" />}
            title="No employee data"
            message="Employee status information will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Training Overview"
          icon={<GraduationCap className="h-5 w-5" />}
        >
          <EmptyList
            icon={<GraduationCap className="h-5 w-5" />}
            title="No training data"
            message="Organization training information will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Upcoming Events"
          icon={<Calendar className="h-5 w-5" />}
        >
          <EmptyList
            icon={<Calendar className="h-5 w-5" />}
            title="No upcoming events"
            message="Upcoming organization events will appear here."
          />
        </SectionCard>

        <SectionCard
          title="HR Activity"
          icon={<BriefcaseBusiness className="h-5 w-5" />}
        >
          <EmptyList
            icon={<BriefcaseBusiness className="h-5 w-5" />}
            title="No recent activity"
            message="Recent HR activities will appear here."
          />
        </SectionCard>
      </div>
    </div>
  );
}

/* =========================================================
   DEPARTMENT MANAGER DASHBOARD
   ========================================================= */

function DepartmentManagerDashboard({ user }: { user: any }) {
  const department = user.department || 'Department';

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">
        {department} Dashboard
      </h1>

      <p className="mb-6 text-sm text-gray-500">
        Department overview and team information.
      </p>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Team Members"
          value="—"
          icon={<Users className="h-5 w-5" />}
          color="indigo"
        />

        <StatCard
          title="Present Today"
          value="—"
          icon={<UserCheck className="h-5 w-5" />}
          color="green"
        />

        <StatCard
          title="Late / Absent"
          value="—"
          icon={<AlertTriangle className="h-5 w-5" />}
          color="amber"
        />

        <StatCard
          title="Pending Leaves"
          value="—"
          icon={<CalendarDays className="h-5 w-5" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Team Attendance"
          icon={<UserCheck className="h-5 w-5" />}
        >
          <EmptyList
            icon={<UserCheck className="h-5 w-5" />}
            title="No attendance data"
            message="Your department's attendance information will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Pending Leave Approvals"
          icon={<ClipboardCheck className="h-5 w-5" />}
        >
          <EmptyList
            icon={<ClipboardCheck className="h-5 w-5" />}
            title="No pending requests"
            message="Leave requests requiring your approval will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Team Members"
          icon={<Users className="h-5 w-5" />}
        >
          <EmptyList
            icon={<Users className="h-5 w-5" />}
            title="No team data"
            message="Employees in your department will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Team Performance"
          icon={<BarChart3 className="h-5 w-5" />}
        >
          <EmptyList
            icon={<BarChart3 className="h-5 w-5" />}
            title="No performance data"
            message="Team performance information will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Department Training"
          icon={<GraduationCap className="h-5 w-5" />}
        >
          <EmptyList
            icon={<GraduationCap className="h-5 w-5" />}
            title="No training data"
            message="Training programs for your department will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Department Activity"
          icon={<Bell className="h-5 w-5" />}
        >
          <EmptyList
            icon={<Bell className="h-5 w-5" />}
            title="No recent activity"
            message="Recent department activity will appear here."
          />
        </SectionCard>
      </div>
    </div>
  );
}

/* =========================================================
   TRAINING COORDINATOR DASHBOARD
   ========================================================= */

function TrainingCoordinatorDashboard() {
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
          value="—"
          icon={<GraduationCap className="h-5 w-5" />}
          color="indigo"
        />

        <StatCard
          title="Upcoming Programs"
          value="—"
          icon={<Calendar className="h-5 w-5" />}
          color="blue"
        />

        <StatCard
          title="Completed Programs"
          value="—"
          icon={<UserCheck className="h-5 w-5" />}
          color="green"
        />

        <StatCard
          title="Total Participants"
          value="—"
          icon={<Users className="h-5 w-5" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Training Programs"
          icon={<GraduationCap className="h-5 w-5" />}
        >
          <EmptyList
            icon={<GraduationCap className="h-5 w-5" />}
            title="No training programs"
            message="Training programs will appear here when available."
          />
        </SectionCard>

        <SectionCard
          title="Upcoming Training"
          icon={<Calendar className="h-5 w-5" />}
        >
          <EmptyList
            icon={<Calendar className="h-5 w-5" />}
            title="No upcoming training"
            message="Upcoming training sessions will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Participant Overview"
          icon={<Users className="h-5 w-5" />}
        >
          <EmptyList
            icon={<Users className="h-5 w-5" />}
            title="No participant data"
            message="Training participant information will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Training Capacity"
          icon={<BarChart3 className="h-5 w-5" />}
        >
          <EmptyList
            icon={<BarChart3 className="h-5 w-5" />}
            title="No capacity data"
            message="Training capacity information will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Recent Training Activity"
          icon={<Bell className="h-5 w-5" />}
        >
          <EmptyList
            icon={<Bell className="h-5 w-5" />}
            title="No recent activity"
            message="Recent training activity will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Training Performance"
          icon={<BarChart3 className="h-5 w-5" />}
        >
          <EmptyList
            icon={<BarChart3 className="h-5 w-5" />}
            title="No performance data"
            message="Training performance information will appear here."
          />
        </SectionCard>
      </div>
    </div>
  );
}

/* =========================================================
   EVENT ORGANIZER DASHBOARD
   ========================================================= */

function EventOrganizerDashboard() {
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
          value="—"
          icon={<Calendar className="h-5 w-5" />}
          color="indigo"
        />

        <StatCard
          title="Upcoming Events"
          value="—"
          icon={<CalendarDays className="h-5 w-5" />}
          color="blue"
        />

        <StatCard
          title="Registrations"
          value="—"
          icon={<UserCheck className="h-5 w-5" />}
          color="green"
        />

        <StatCard
          title="Available Capacity"
          value="—"
          icon={<Users className="h-5 w-5" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Upcoming Events"
          icon={<Calendar className="h-5 w-5" />}
        >
          <EmptyList
            icon={<Calendar className="h-5 w-5" />}
            title="No upcoming events"
            message="Upcoming events will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Event Registration"
          icon={<UserCheck className="h-5 w-5" />}
        >
          <EmptyList
            icon={<UserCheck className="h-5 w-5" />}
            title="No registration data"
            message="Event registration information will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Event Capacity"
          icon={<Users className="h-5 w-5" />}
        >
          <EmptyList
            icon={<Users className="h-5 w-5" />}
            title="No capacity data"
            message="Event capacity information will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Recent Event Activity"
          icon={<Bell className="h-5 w-5" />}
        >
          <EmptyList
            icon={<Bell className="h-5 w-5" />}
            title="No recent activity"
            message="Recent event activity will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Event Performance"
          icon={<BarChart3 className="h-5 w-5" />}
        >
          <EmptyList
            icon={<BarChart3 className="h-5 w-5" />}
            title="No performance data"
            message="Event performance information will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Event Calendar"
          icon={<CalendarDays className="h-5 w-5" />}
        >
          <EmptyList
            icon={<CalendarDays className="h-5 w-5" />}
            title="No scheduled events"
            message="Your event schedule will appear here."
          />
        </SectionCard>
      </div>
    </div>
  );
}

/* =========================================================
   GRIEVANCE OFFICER DASHBOARD
   ========================================================= */

function GrievanceOfficerDashboard() {
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
          value="—"
          icon={<MessageSquareWarning className="h-5 w-5" />}
          color="indigo"
        />

        <StatCard
          title="Under Review"
          value="—"
          icon={<Clock className="h-5 w-5" />}
          color="blue"
        />

        <StatCard
          title="Assigned"
          value="—"
          icon={<UserRoundCheck className="h-5 w-5" />}
          color="purple"
        />

        <StatCard
          title="Resolved"
          value="—"
          icon={<UserCheck className="h-5 w-5" />}
          color="green"
        />

        <StatCard
          title="High Priority"
          value="—"
          icon={<AlertTriangle className="h-5 w-5" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Recent Grievances"
          icon={<MessageSquareWarning className="h-5 w-5" />}
        >
          <EmptyList
            icon={<MessageSquareWarning className="h-5 w-5" />}
            title="No grievances"
            message="Recent employee grievances will appear here."
          />
        </SectionCard>

        <SectionCard
          title="High-Priority Cases"
          icon={<AlertTriangle className="h-5 w-5" />}
        >
          <EmptyList
            icon={<AlertTriangle className="h-5 w-5" />}
            title="No high-priority cases"
            message="High-priority grievance cases will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Grievance Status"
          icon={<BarChart3 className="h-5 w-5" />}
        >
          <EmptyList
            icon={<BarChart3 className="h-5 w-5" />}
            title="No grievance data"
            message="Grievance status information will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Resolution Activity"
          icon={<UserCheck className="h-5 w-5" />}
        >
          <EmptyList
            icon={<UserCheck className="h-5 w-5" />}
            title="No resolution activity"
            message="Grievance resolution activity will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Assigned Cases"
          icon={<UserRoundCheck className="h-5 w-5" />}
        >
          <EmptyList
            icon={<UserRoundCheck className="h-5 w-5" />}
            title="No assigned cases"
            message="Grievances assigned to you will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Recent Activity"
          icon={<Bell className="h-5 w-5" />}
        >
          <EmptyList
            icon={<Bell className="h-5 w-5" />}
            title="No recent activity"
            message="Recent grievance activity will appear here."
          />
        </SectionCard>
      </div>
    </div>
  );
}

