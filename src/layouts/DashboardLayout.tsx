// ============================================================
// DASHBOARD LAYOUT - Main authenticated layout with sidebar, header
// ============================================================

import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { notificationService } from '@/services/dataServices';
import { getNavigationForRole, type RoleType } from '@/config';
import {
  LayoutDashboard, Users, Clock, CalendarDays, TrendingUp, GraduationCap, Calendar,
  MessageSquareWarning, BarChart3, Bell, User, Settings, ChevronLeft, ChevronRight,
  LogOut, Search, Menu, X, Moon, Sun
} from 'lucide-react';

const iconMap: Record<string, any> = {
  LayoutDashboard, Users, Clock, CalendarDays, TrendingUp, GraduationCap, Calendar,
  MessageSquareWarning, BarChart3, Bell, User, Settings,
};

export default function DashboardLayout() {
  const { user, profile, logout } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  const navItems = user ? getNavigationForRole(user.role as RoleType) : [];

  // Fetch unread notification count
  useEffect(() => {
    if (user) {
      notificationService.getUnreadCount(user.employeeId).then(setUnreadCount);
      const interval = setInterval(() => {
        notificationService.getUnreadCount(user.employeeId).then(setUnreadCount);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Global search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results: any[] = [];
    // Search employees
    if (user?.role !== 'Employee') {
      results.push({ type: 'page', label: 'Employees', path: '/employees' });
    }
    results.push({ type: 'page', label: 'Attendance', path: '/attendance' });
    results.push({ type: 'page', label: 'Leave', path: '/leave' });
    results.push({ type: 'page', label: 'Training', path: '/training' });
    results.push({ type: 'page', label: 'Events', path: '/events' });
    results.push({ type: 'page', label: 'Grievances', path: '/grievances' });
    setSearchResults(results.filter(r => r.label.toLowerCase().includes(q)));
  }, [searchQuery, user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      addToast('info', 'You have been logged out');
    } catch {
      addToast('error', 'Failed to logout');
    }
  };

  const initials = profile ? `${profile.firstName[0]}${profile.lastName[0]}` : '??';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-200">
        <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">SH</span>
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold text-gray-900">StaffHub</h1>
            <p className="text-[10px] text-gray-500 -mt-1">Management System</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <li key={item.key}>
                <NavLink
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 p-3">
        {!sidebarCollapsed && profile && (
          <div className="mb-3 px-3">
            <p className="text-xs text-gray-500 truncate">{profile.role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all w-full ${sidebarCollapsed ? 'justify-center' : ''}`}
          title={sidebarCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col border-r border-gray-200 bg-white transition-all duration-200 ${sidebarCollapsed ? 'w-16' : 'w-60'}`}>
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-20 -right-3 z-10 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 hidden lg:flex"
        >
          {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-white shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:text-gray-700">
              <Menu className="h-5 w-5" />
            </button>
            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-gray-400">Home</span>
              {location.pathname !== '/dashboard' && (
                <>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-700 font-medium capitalize">
                    {location.pathname.split('/').filter(Boolean)[0] || 'Dashboard'}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Search className="h-5 w-5" />
              </button>
              {showSearch && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50">
                  <input
                    type="text"
                    placeholder="Search pages, employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                  {searchResults.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {searchResults.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => { navigate(r.path); setShowSearch(false); setSearchQuery(''); }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2"
                        >
                          <Search className="h-4 w-4 text-gray-400" />
                          <span>{r.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg hidden sm:flex"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <button
              onClick={() => navigate('/notifications')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User avatar */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-semibold">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                  {profile ? `${profile.firstName} ${profile.lastName}` : 'User'}
                </p>
                <p className="text-[10px] text-gray-500 truncate max-w-[120px]">{user?.role}</p>
              </div>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
