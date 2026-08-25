import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
              <span className="text-white font-bold text-xl">SH</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">StaffHub</h1>
              <p className="text-indigo-200 text-sm">Staff Management System</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Manage your team with confidence</h2>
          <p className="text-indigo-200 text-lg mb-8">
            Streamline attendance, leave management, performance reviews, training, events, and more — all in one place.
          </p>
          <div className="space-y-4">
            {['Comprehensive employee management', 'Smart attendance & leave tracking', 'Performance reviews & growth plans'].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-indigo-100">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
