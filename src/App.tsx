import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ProtectedRoute, PermissionRoute } from '@/routes/ProtectedRoute';

// Layouts
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';

// Dashboard
import DashboardPage from '@/pages/dashboard/DashboardPage';

// Employees
import {
  EmployeeListPage,
  EmployeeDetailPage,
  EmployeeFormPage,
} from '@/pages/employees/EmployeePages';

// Attendance
import AttendancePage from '@/pages/attendance/AttendancePage';
import AttendanceManagementPage from '@/pages/attendance/AttendanceManagementPage';
import AttendanceMonitorPage from '@/pages/attendance/AttendanceMonitorPage';

// Leave
import LeavePage from '@/pages/leave/LeavePage';

// Performance
import PerformancePage from '@/pages/performance/PerformancePage';

// Training
import TrainingPage from '@/pages/training/TrainingPage';

// Events
import EventsPage from '@/pages/events/EventsPage';

// Grievances
import GrievancesPage from '@/pages/grievances/GrievancesPage';

// Notifications
import NotificationsPage from '@/pages/notifications/NotificationsPage';

// Reports
import ReportsPage from '@/pages/reports/ReportsPage';

// Profile
import ProfilePage from '@/pages/profile/ProfilePage';

// Settings
import SettingsPage from '@/pages/settings/SettingsPage';


// ============================================================
// 404
// ============================================================

function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">

      <div className="text-center">

        <h1 className="text-6xl font-bold text-gray-300 mb-4">
          404
        </h1>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Page not found
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          The page you're looking for doesn't exist.
        </p>

        <a
          href="/dashboard"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
        >
          Go to Dashboard
        </a>

      </div>

    </div>
  );
}


// ============================================================
// APPLICATION
// ============================================================

export default function App() {

  return (
    <BrowserRouter>

      <AuthProvider>

        <ToastProvider>

          <Routes>


            {/* ==================================================
                PUBLIC AUTH ROUTES
                ================================================== */}

            <Route element={<AuthLayout />}>

              <Route
                path="/login"
                element={<LoginPage />}
              />

              <Route
                path="/forgot-password"
                element={<ForgotPasswordPage />}
              />

            </Route>


            {/* ==================================================
                PROTECTED APPLICATION
                ================================================== */}

            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >


              {/* ==================================================
                  MAIN - EVERY EMPLOYEE
                  ================================================== */}

              <Route
                path="/dashboard"
                element={<DashboardPage />}
              />

              <Route
                path="/attendance"
                element={<AttendancePage />}
              />

              <Route
                path="/leave"
                element={<LeavePage />}
              />

              <Route
                path="/performance"
                element={<PerformancePage />}
              />

              <Route
                path="/training"
                element={<TrainingPage />}
              />

              <Route
                path="/events"
                element={<EventsPage />}
              />

              <Route
                path="/grievances"
                element={<GrievancesPage />}
              />


              {/* ==================================================
                  PERSONAL - EVERY EMPLOYEE
                  ================================================== */}

              <Route
                path="/notifications"
                element={<NotificationsPage />}
              />

              <Route
                path="/profile"
                element={<ProfilePage />}
              />

              <Route
                path="/settings"
                element={<SettingsPage />}
              />


              {/* ==================================================
                  MANAGEMENT
                  
                  IMPORTANT:
                  These are separate URLs from employee pages.
                  ================================================== */}


              {/* Employee Management */}


              <Route
                path="/management/employees"
                element={
                  <PermissionRoute permission="employees.view">
                    <EmployeeListPage />
                  </PermissionRoute>
                }
              />

              <Route
                path="/management/employees/create"
                element={
                  <PermissionRoute permission="employees.create">
                    <EmployeeFormPage />
                  </PermissionRoute>
                }
              />

              <Route
                path="/management/employees/:id"
                element={
                  <PermissionRoute permission="employees.view">
                    <EmployeeDetailPage />
                  </PermissionRoute>
                }
              />

              <Route
                path="/management/employees/:id/edit"
                element={
                  <PermissionRoute permission="employees.edit">
                    <EmployeeFormPage />
                  </PermissionRoute>
                }
              />


              {/* Attendance Management */}

              <Route
                path="/management/attendance"
                element={
                  <PermissionRoute permission="attendance.view-all">
                    <AttendanceManagementPage />
                  </PermissionRoute>
                }
              />

              <Route
                path="/management/attendance/monitor"
                element={
                  <PermissionRoute permission="attendance.view-all">
                    <AttendanceMonitorPage />
                  </PermissionRoute>
                }
              />


              {/* Leave Management */}

              <Route
                path="/management/leave"
                element={
                  <PermissionRoute permission="leave.view-all">
                    <LeavePage />
                  </PermissionRoute>
                }
              />


              {/* Performance Management */}

              <Route
                path="/management/performance"
                element={
                  <PermissionRoute permission="performance.view-all">
                    <PerformancePage />
                  </PermissionRoute>
                }
              />


              {/* Training Management */}

              <Route
                path="/management/training"
                element={
                  <PermissionRoute permission="training.manage">
                    <TrainingPage />
                  </PermissionRoute>
                }
              />


              {/* Event Management */}

              <Route
                path="/management/events"
                element={
                  <PermissionRoute permission="events.manage">
                    <EventsPage />
                  </PermissionRoute>
                }
              />


              {/* Grievance Management */}

              <Route
                path="/management/grievances"
                element={
                  <PermissionRoute permission="grievances.manage">
                    <GrievancesPage />
                  </PermissionRoute>
                }
              />


              {/* Reports */}

              <Route
                path="/management/reports"
                element={
                  <PermissionRoute permission="reports.view">
                    <ReportsPage />
                  </PermissionRoute>
                }
              />

            </Route>


            {/* ==================================================
                DEFAULT
                ================================================== */}

            <Route
              path="/"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />


            {/* ==================================================
                404
                ================================================== */}

            <Route
              path="*"
              element={<NotFoundPage />}
            />

          </Routes>

        </ToastProvider>

      </AuthProvider>

    </BrowserRouter>
  );
}

