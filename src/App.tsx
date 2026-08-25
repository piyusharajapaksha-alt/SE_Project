import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

// Layouts
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';

// Dashboard
import DashboardPage from '@/pages/dashboard/DashboardPage';

// Employee Pages
import { EmployeeListPage, EmployeeDetailPage, EmployeeFormPage } from '@/pages/employees/EmployeePages';

// Attendance
import AttendancePage from '@/pages/attendance/AttendancePage';

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

// 404 Page
function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Page not found</h2>
        <p className="text-sm text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
        <a href="/dashboard" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Auth Routes (public) */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* Protected Routes (authenticated) */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Employees */}
              <Route path="/employees" element={<EmployeeListPage />} />
              <Route path="/employees/create" element={<EmployeeFormPage />} />
              <Route path="/employees/:id" element={<EmployeeDetailPage />} />
              <Route path="/employees/:id/edit" element={<EmployeeFormPage />} />

              {/* Attendance */}
              <Route path="/attendance" element={<AttendancePage />} />

              {/* Leave */}
              <Route path="/leave" element={<LeavePage />} />

              {/* Performance */}
              <Route path="/performance" element={<PerformancePage />} />

              {/* Training */}
              <Route path="/training" element={<TrainingPage />} />

              {/* Events */}
              <Route path="/events" element={<EventsPage />} />

              {/* Grievances */}
              <Route path="/grievances" element={<GrievancesPage />} />

              {/* Notifications */}
              <Route path="/notifications" element={<NotificationsPage />} />

              {/* Reports */}
              <Route path="/reports" element={<ReportsPage />} />

              {/* Profile */}
              <Route path="/profile" element={<ProfilePage />} />

              {/* Settings */}
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
