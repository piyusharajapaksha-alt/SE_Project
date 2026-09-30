import { Navigate, useNavigate } from 'react-router-dom';
import { Building2, LogIn, UserPlus, ShieldCheck, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="bg-indigo-600 p-8 lg:p-12 text-white">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="font-bold">SH</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">StaffHub</h1>
                  <p className="text-indigo-200 text-sm">Staff Management System</p>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-4">Manage your team with confidence</h2>
              <p className="text-indigo-100 leading-7 mb-8">
                Bring your company staff, attendance, leave, performance, training and events together in one place.
              </p>

              <div className="space-y-4 text-sm text-indigo-100">
                <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5" />Secure staff management</div>
                <div className="flex items-center gap-3"><Users className="w-5 h-5" />Organize your employees</div>
                <div className="flex items-center gap-3"><BarChart3 className="w-5 h-5" />Track company activity</div>
              </div>
            </div>

            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center mb-5">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to StaffHub</h2>
              <p className="text-sm text-gray-500 mb-8">
                Sign in to your existing account or create a new company owner account.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> Sign in
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full py-3 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" /> Create company account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
