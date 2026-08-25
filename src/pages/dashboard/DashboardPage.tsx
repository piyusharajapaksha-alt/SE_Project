import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService } from '@/services/dataServices';
import { StatCard, Badge, LoadingState } from '@/components/ui';
import { Users, UserCheck, Clock, AlertTriangle, CalendarDays, GraduationCap, Calendar, TrendingUp, MessageSquareWarning, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const CHART_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      if (!user) return;
      // MAIN / Dashboard is always the employee-level dashboard.
      // A user may have a management role, but that role must not change
      // the data shown on the common MAIN navigation.
      setData(await dashboardService.getEmployeeDashboard(user.employeeId));
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (!data) return <div>Unable to load dashboard data.</div>;

  // MAIN / Dashboard is always the employee-level dashboard.
  return <EmployeeDashboard data={data} />;
}

// --- Employee Dashboard ---
function EmployeeDashboard({ data }: { data: any }) {
  const attSummary = data.attendanceSummary || {};
  const leaveBal = data.leaveBalance || {};

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Welcome back! Here's your personal overview.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Today's Status" value={data.todayAttendance?.status || 'Not Recorded'} icon={<Clock className="h-5 w-5" />} color="blue" />
        <StatCard title="Present This Month" value={attSummary.present || 0} icon={<UserCheck className="h-5 w-5" />} color="green" />
        <StatCard title="Late Days" value={attSummary.late || 0} icon={<AlertTriangle className="h-5 w-5" />} color="amber" />
        <StatCard title="Leave Remaining" value={leaveBal.annualLeave?.remaining || 0} icon={<CalendarDays className="h-5 w-5" />} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Balance */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Balance</h3>
          <div className="space-y-3">
            {[
              { label: 'Annual Leave', ...leaveBal.annualLeave },
              { label: 'Sick Leave', ...leaveBal.sickLeave },
              { label: 'Personal Leave', ...leaveBal.personalLeave },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="text-gray-900 font-medium">{item.used}/{item.total} used</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-indigo-600 rounded-full h-2" style={{ width: `${(item.used / item.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Leave Requests */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Leave Requests</h3>
          {data.recentLeaveRequests?.length > 0 ? (
            <div className="space-y-3">
              {data.recentLeaveRequests.map((req: any) => (
                <div key={req.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{req.type}</p>
                    <p className="text-xs text-gray-500">{req.startDate} to {req.endDate}</p>
                  </div>
                  <Badge variant={req.status === 'Approved' ? 'success' : req.status === 'Rejected' ? 'danger' : 'warning'} dot>{req.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No leave requests found.</p>
          )}
        </div>

        {/* Upcoming Training */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Training</h3>
          {data.upcomingTraining?.length > 0 ? (
            <div className="space-y-3">
              {data.upcomingTraining.map((t: any) => (
                <div key={t.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                  <GraduationCap className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.title}</p>
                    <p className="text-xs text-gray-500">{t.startDate} • {t.location}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No upcoming training.</p>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
          {data.upcomingEvents?.length > 0 ? (
            <div className="space-y-3">
              {data.upcomingEvents.map((e: any) => (
                <div key={e.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                  <Calendar className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{e.title}</p>
                    <p className="text-xs text-gray-500">{e.date} • {e.location}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No upcoming events.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// --- HR Manager Dashboard ---
function HRDashboard({ data }: { data: any }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">HR Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Organization overview and key metrics.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard title="Total Employees" value={data.totalEmployees} icon={<Users className="h-5 w-5" />} color="indigo" />
        <StatCard title="Present Today" value={data.presentToday} icon={<UserCheck className="h-5 w-5" />} color="green" />
        <StatCard title="Late Today" value={data.lateToday} icon={<Clock className="h-5 w-5" />} color="amber" />
        <StatCard title="On Leave" value={data.onLeaveToday} icon={<CalendarDays className="h-5 w-5" />} color="purple" />
        <StatCard title="Pending Leaves" value={data.pendingLeaveRequests} icon={<AlertTriangle className="h-5 w-5" />} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Attendance Trend Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="present" fill="#4f46e5" radius={[2, 2, 0, 0]} name="Present" />
              <Bar dataKey="late" fill="#f59e0b" radius={[2, 2, 0, 0]} name="Late" />
              <Bar dataKey="absent" fill="#ef4444" radius={[2, 2, 0, 0]} name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leave Distribution Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.leaveDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                {data.leaveDistribution.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-5 w-5 text-indigo-500" />
            <span className="text-sm font-medium text-gray-600">Active Training</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.activeTraining}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">Upcoming Events</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.upcomingEvents}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquareWarning className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium text-gray-600">Open Grievances</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.openGrievances}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {data.recentActivity?.map((a: any) => (
            <div key={a.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
              <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
              <p className="text-sm text-gray-700 flex-1">{a.message}</p>
              <span className="text-xs text-gray-400 flex-shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Department Manager Dashboard ---
function DeptManagerDashboard({ data }: { data: any }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{data.department} Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Department overview for {data.department}.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard title="Team Members" value={data.totalEmployees} icon={<Users className="h-5 w-5" />} color="indigo" />
        <StatCard title="Present Today" value={data.presentToday} icon={<UserCheck className="h-5 w-5" />} color="green" />
        <StatCard title="Late/Absent" value={data.lateToday + data.absentToday} icon={<AlertTriangle className="h-5 w-5" />} color="amber" />
        <StatCard title="Pending Leaves" value={data.pendingLeaveRequests} icon={<CalendarDays className="h-5 w-5" />} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Leave Requests</h3>
          {data.pendingLeaveList?.length > 0 ? (
            <div className="space-y-3">
              {data.pendingLeaveList.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{l.employeeName}</p>
                    <p className="text-xs text-gray-500">{l.type}: {l.startDate} - {l.endDate}</p>
                  </div>
                  <Badge variant="warning" dot>Pending</Badge>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-500">No pending requests.</p>}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.employees?.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold">
                    {e.firstName[0]}{e.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{e.firstName} {e.lastName}</p>
                    <p className="text-xs text-gray-500">{e.position}</p>
                  </div>
                </div>
                <Badge variant={e.status === 'Active' ? 'success' : 'warning'} dot>{e.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Training Coordinator Dashboard ---
function TrainingCoordDashboard({ data }: { data: any }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Training Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Manage and monitor training programs.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard title="Active Programs" value={data.activeTraining} icon={<GraduationCap className="h-5 w-5" />} color="indigo" />
        <StatCard title="Completed" value={data.completedTraining} icon={<UserCheck className="h-5 w-5" />} color="green" />
        <StatCard title="Total Participants" value={data.totalParticipants} icon={<Users className="h-5 w-5" />} color="blue" />
        <StatCard title="Total Capacity" value={data.totalCapacity} icon={<BarChart3 className="h-5 w-5" />} color="purple" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Training Programs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-3 font-medium text-gray-600">Program</th>
                <th className="text-left py-3 px-3 font-medium text-gray-600">Category</th>
                <th className="text-left py-3 px-3 font-medium text-gray-600">Start Date</th>
                <th className="text-left py-3 px-3 font-medium text-gray-600">Enrolled</th>
                <th className="text-left py-3 px-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.trainingList?.map((t: any) => (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium text-gray-900">{t.title}</td>
                  <td className="py-3 px-3 text-gray-600">{t.category}</td>
                  <td className="py-3 px-3 text-gray-600">{t.startDate}</td>
                  <td className="py-3 px-3 text-gray-600">{t.registeredCount}/{t.capacity}</td>
                  <td className="py-3 px-3">
                    <Badge variant={t.status === 'Upcoming' ? 'info' : 'success'} dot>{t.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Event Organizer Dashboard ---
function EventOrganizerDashboard({ data }: { data: any }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Events Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Manage and track organizational events.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Events" value={data.totalEvents} icon={<Calendar className="h-5 w-5" />} color="indigo" />
        <StatCard title="Upcoming" value={data.upcomingEvents} icon={<CalendarDays className="h-5 w-5" />} color="blue" />
        <StatCard title="Total Registrations" value={data.totalRegistrations} icon={<Users className="h-5 w-5" />} color="green" />
        <StatCard title="Total Capacity" value={data.totalCapacity} icon={<BarChart3 className="h-5 w-5" />} color="purple" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Events</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-3 font-medium text-gray-600">Event</th>
                <th className="text-left py-3 px-3 font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-3 font-medium text-gray-600">Location</th>
                <th className="text-left py-3 px-3 font-medium text-gray-600">Registered</th>
                <th className="text-left py-3 px-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.eventList?.map((e: any) => (
                <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium text-gray-900">{e.title}</td>
                  <td className="py-3 px-3 text-gray-600">{e.date}</td>
                  <td className="py-3 px-3 text-gray-600">{e.location}</td>
                  <td className="py-3 px-3 text-gray-600">{e.registeredCount}/{e.capacity}</td>
                  <td className="py-3 px-3">
                    <Badge variant={e.status === 'Upcoming' ? 'info' : e.status === 'Completed' ? 'success' : 'neutral'} dot>{e.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Grievance Officer Dashboard ---
function GrievanceOfficerDashboard({ data }: { data: any }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Grievance Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Track and resolve employee grievances.</p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <StatCard title="New" value={data.newGrievances} icon={<MessageSquareWarning className="h-5 w-5" />} color="red" />
        <StatCard title="Under Review" value={data.underReview} icon={<Clock className="h-5 w-5" />} color="amber" />
        <StatCard title="Assigned" value={data.assigned} icon={<Users className="h-5 w-5" />} color="blue" />
        <StatCard title="Resolved" value={data.resolved} icon={<UserCheck className="h-5 w-5" />} color="green" />
        <StatCard title="High Priority" value={data.highPriority} icon={<AlertTriangle className="h-5 w-5" />} color="red" />
      </div>

      {/* Grievance status chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Grievances</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-3 font-medium text-gray-600">ID</th>
                <th className="text-left py-3 px-3 font-medium text-gray-600">Employee</th>
                <th className="text-left py-3 px-3 font-medium text-gray-600">Category</th>
                <th className="text-left py-3 px-3 font-medium text-gray-600">Priority</th>
                <th className="text-left py-3 px-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.grievanceList?.map((g: any) => (
                <tr key={g.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium text-gray-900">{g.id}</td>
                  <td className="py-3 px-3 text-gray-600">{g.employeeName}</td>
                  <td className="py-3 px-3 text-gray-600">{g.category}</td>
                  <td className="py-3 px-3">
                    <Badge variant={g.priority === 'High' || g.priority === 'Critical' ? 'danger' : g.priority === 'Medium' ? 'warning' : 'neutral'}>{g.priority}</Badge>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={g.status === 'New' ? 'info' : g.status === 'Resolved' ? 'success' : g.status === 'Under Review' ? 'warning' : 'neutral'} dot>{g.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
