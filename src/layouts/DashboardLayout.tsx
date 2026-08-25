import React, { useMemo, useState } from 'react';
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';

import {
  getNavigationForRole,
  getManagementLabel,
  type RoleType,
} from '@/config';

import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  TrendingUp,
  GraduationCap,
  Calendar,
  MessageSquareWarning,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Menu,
  X,
  ChevronDown,
  User,
  Building2,
} from 'lucide-react';


// ============================================================
// ICON MAP
// ============================================================

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  TrendingUp,
  GraduationCap,
  Calendar,
  MessageSquareWarning,
  Bell,
  BarChart3,
  Settings,
  User,
};


// ============================================================
// DASHBOARD LAYOUT
// ============================================================

export default function DashboardLayout() {

  const location = useLocation();
  const navigate = useNavigate();

  const {
    user,
    profile,
    logout,
    checkPermission,
  } = useAuth();


  // ==========================================================
  // STATE
  // ==========================================================

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');


  // ==========================================================
  // ROLE NAVIGATION
  // ==========================================================

  const allNavItems = user
    ? getNavigationForRole(user.role as RoleType)
    : [];


  // ==========================================================
  // MAIN
  //
  // ALWAYS AVAILABLE TO ALL EMPLOYEES.
  // ==========================================================

  const mainItems = allNavItems.filter(
    (item) => item.group === 'main'
  );


  // ==========================================================
  // MANAGEMENT
  //
  // ONLY ITEMS ALLOWED BY ROLE/PERMISSION.
  // ==========================================================

  const managementItems = allNavItems.filter(
    (item) => item.group === 'management'
  );


  // ==========================================================
  // PERSONAL
  //
  // ALWAYS AVAILABLE TO ALL EMPLOYEES.
  // ==========================================================

  const personalItems = allNavItems.filter(
    (item) => item.group === 'personal'
  );


  // ==========================================================
  // MANAGEMENT TITLE
  // ==========================================================

  const managementLabel = user
    ? getManagementLabel(user.role as RoleType)
    : null;


  // ==========================================================
  // PAGE TITLE
  // ==========================================================

  const pageTitle = useMemo(() => {

    const allItems = [
      ...mainItems,
      ...managementItems,
      ...personalItems,
    ];

    const currentItem = allItems.find(
      (item) =>
        location.pathname === item.path ||
        location.pathname.startsWith(item.path + '/')
    );

    return currentItem?.label || 'Dashboard';

  }, [
    location.pathname,
    mainItems,
    managementItems,
    personalItems,
  ]);


  // ==========================================================
  // SEARCH
  // ==========================================================

  const searchResults = useMemo(() => {

    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return [];
    }

    const allItems = [
      ...mainItems,
      ...managementItems,
      ...personalItems,
    ];

    return allItems
      .filter((item) =>
        item.label.toLowerCase().includes(query)
      )
      .map((item) => ({
        type: 'page' as const,
        label: item.label,
        path: item.path,
      }));

  }, [
    searchQuery,
    mainItems,
    managementItems,
    personalItems,
  ]);


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = async () => {

    setProfileMenuOpen(false);

    try {

      await logout();

      navigate('/login', {
        replace: true,
      });

    } catch (error) {

      console.error('Logout failed:', error);

    }
  };


  // ==========================================================
  // NAVIGATION ITEM
  // ==========================================================

  const renderNavItem = (item: {
    key: string;
    label: string;
    icon: string;
    path: string;
  }) => {

    const Icon =
      iconMap[item.icon] || LayoutDashboard;

    const isActive =
      location.pathname === item.path ||
      location.pathname.startsWith(item.path + '/');

    return (
      <li key={item.key}>

        <NavLink
          to={item.path}
          onClick={() => {
            setMobileSidebarOpen(false);
            setSearchOpen(false);
          }}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            isActive
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          } ${
            sidebarCollapsed
              ? 'justify-center'
              : ''
          }`}
          title={
            sidebarCollapsed
              ? item.label
              : undefined
          }
        >

          <Icon className="h-5 w-5 flex-shrink-0" />

          {!sidebarCollapsed && (
            <span className="truncate">
              {item.label}
            </span>
          )}

        </NavLink>

      </li>
    );
  };


  // ==========================================================
  // USER DISPLAY
  // ==========================================================

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : user?.email || 'User';

  const displayEmail =
    user?.email || '';

  const displayRole =
    user?.role || 'Employee';

  const initials = profile
    ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase()
    : 'U';


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50">


      {/* ======================================================
          MOBILE OVERLAY
          ====================================================== */}

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() =>
            setMobileSidebarOpen(false)
          }
        />
      )}


      {/* ======================================================
          SIDEBAR
          ====================================================== */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          flex-col
          bg-white
          border-r
          border-gray-200
          transition-all
          duration-300

          ${
            sidebarCollapsed
              ? 'w-20'
              : 'w-64'
          }

          ${
            mobileSidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full lg:translate-x-0'
          }
        `}
      >


        {/* ====================================================
            BRAND
            ==================================================== */}

        <div
          className={`
            flex
            items-center
            h-16
            px-4
            border-b
            border-gray-200

            ${
              sidebarCollapsed
                ? 'justify-center'
                : 'justify-between'
            }
          `}
        >

          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
                <Building2 className="h-5 w-5 text-white" />
              </div>

              <div>

                <h1 className="text-lg font-bold text-gray-900">
                  STAFFHUB
                </h1>

                <p className="text-[10px] text-gray-400">
                  Staff Management
                </p>

              </div>

            </div>
          )}

          {sidebarCollapsed && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
              <Building2 className="h-5 w-5 text-white" />
            </div>
          )}

        </div>


        {/* ====================================================
            NAVIGATION
            ==================================================== */}

        <nav className="flex-1 overflow-y-auto py-4">


          {/* ==================================================
              MAIN
              ================================================== */}

          {mainItems.length > 0 && (
            <div className="px-3 mb-6">

              {!sidebarCollapsed && (
                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Main
                </p>
              )}

              <ul className="space-y-1">
                {mainItems.map(renderNavItem)}
              </ul>

            </div>
          )}


          {/* ==================================================
              MANAGEMENT
              ================================================== */}

          {managementItems.length > 0 && (
            <div className="px-3 mb-6">

              {!sidebarCollapsed && (
                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {managementLabel || 'Management'}
                </p>
              )}

              <ul className="space-y-1">
                {managementItems.map(renderNavItem)}
              </ul>

            </div>
          )}


          {/* ==================================================
              PERSONAL
              ================================================== */}

          {personalItems.length > 0 && (
            <div className="px-3">

              {!sidebarCollapsed && (
                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Personal
                </p>
              )}

              <ul className="space-y-1">
                {personalItems.map(renderNavItem)}
              </ul>

            </div>
          )}

        </nav>


        {/* ====================================================
            SIDEBAR COLLAPSE
            ==================================================== */}

        <div className="hidden lg:block border-t border-gray-200 p-3">

          <button
            type="button"
            onClick={() =>
              setSidebarCollapsed(
                !sidebarCollapsed
              )
            }
            className="flex w-full items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
            title={
              sidebarCollapsed
                ? 'Expand sidebar'
                : 'Collapse sidebar'
            }
          >

            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}

          </button>

        </div>

      </aside>


      {/* ======================================================
          MAIN CONTENT
          ====================================================== */}

      <div
        className={`
          min-h-screen
          transition-all
          duration-300

          ${
            sidebarCollapsed
              ? 'lg:pl-20'
              : 'lg:pl-64'
          }
        `}
      >


        {/* ====================================================
            HEADER
            ==================================================== */}

        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200">

          <div className="flex h-full items-center justify-between px-4 sm:px-6">


            {/* LEFT */}

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  setMobileSidebarOpen(true)
                }
                className="lg:hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>

              <h2 className="text-lg font-semibold text-gray-900">
                {pageTitle}
              </h2>

            </div>


            {/* RIGHT */}

            <div className="flex items-center gap-2">


              {/* ==================================================
                  SEARCH
                  ================================================== */}

              <div className="relative">

                <button
                  type="button"
                  onClick={() => {

                    setSearchOpen(!searchOpen);

                    if (searchOpen) {
                      setSearchQuery('');
                    }

                  }}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Search"
                >

                  {searchOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}

                </button>


                {searchOpen && (
                  <div className="absolute right-0 top-12 w-80 rounded-xl border border-gray-200 bg-white shadow-lg">

                    <div className="p-3">

                      <div className="relative">

                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                        <input
                          type="text"
                          autoFocus
                          value={searchQuery}
                          onChange={(event) =>
                            setSearchQuery(
                              event.target.value
                            )
                          }
                          placeholder="Search pages..."
                          className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />

                      </div>


                      {searchQuery && (
                        <div className="mt-2 max-h-72 overflow-y-auto">

                          {searchResults.length === 0 ? (

                            <p className="px-3 py-4 text-center text-sm text-gray-500">
                              No results found
                            </p>

                          ) : (

                            <ul className="space-y-1">

                              {searchResults.map(
                                (result, index) => (

                                  <li
                                    key={`${result.path}-${index}`}
                                  >

                                    <button
                                      type="button"
                                      onClick={() => {

                                        navigate(
                                          result.path
                                        );

                                        setSearchOpen(false);
                                        setSearchQuery('');

                                      }}
                                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                    >

                                      <Search className="h-4 w-4 text-gray-400" />

                                      <span>
                                        {result.label}
                                      </span>

                                    </button>

                                  </li>

                                )
                              )}

                            </ul>

                          )}

                        </div>
                      )}

                    </div>

                  </div>
                )}

              </div>


              {/* ==================================================
                  NOTIFICATIONS
                  ================================================== */}

              <button
                type="button"
                onClick={() =>
                  navigate('/notifications')
                }
                className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Notifications"
              >

                <Bell className="h-5 w-5" />

              </button>


              {/* ==================================================
                  PROFILE
                  ================================================== */}

              <div className="relative">

                <button
                  type="button"
                  onClick={() =>
                    setProfileMenuOpen(
                      !profileMenuOpen
                    )
                  }
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100"
                >

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">

                    <User className="h-4 w-4 text-indigo-700" />

                  </div>

                  <div className="hidden text-left sm:block">

                    <p className="max-w-[150px] truncate text-sm font-medium text-gray-900">
                      {displayName}
                    </p>

                    <p className="text-xs text-gray-500">
                      {displayRole}
                    </p>

                  </div>

                  <ChevronDown className="hidden h-4 w-4 text-gray-400 sm:block" />

                </button>


                {profileMenuOpen && (
                  <div className="absolute right-0 top-12 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">


                    <div className="border-b border-gray-100 px-4 py-3">

                      <p className="truncate text-sm font-medium text-gray-900">
                        {displayName}
                      </p>

                      <p className="truncate text-xs text-gray-500">
                        {displayEmail}
                      </p>

                    </div>


                    <button
                      type="button"
                      onClick={() => {

                        navigate('/profile');
                        setProfileMenuOpen(false);

                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                    >

                      <User className="h-4 w-4" />

                      Profile

                    </button>


                    <button
                      type="button"
                      onClick={() => {

                        navigate('/settings');
                        setProfileMenuOpen(false);

                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                    >

                      <Settings className="h-4 w-4" />

                      Settings

                    </button>


                    <div className="my-1 border-t border-gray-100" />


                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >

                      <LogOut className="h-4 w-4" />

                      Logout

                    </button>

                  </div>
                )}

              </div>

            </div>

          </div>

        </header>


        {/* ====================================================
            PAGE CONTENT
            ==================================================== */}

        <main className="p-4 sm:p-6">

          <Outlet />

        </main>

      </div>

    </div>
  );
}
