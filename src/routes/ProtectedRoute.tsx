import {
  Navigate,
  useLocation,
} from 'react-router-dom';

import {
  useAuth,
} from '@/contexts/AuthContext';

import {
  hasPermission,
  type PermissionType,
  type RoleType,
} from '@/config';

import type {
  ReactNode,
} from 'react';

function LoadingScreen() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">

      <div className="flex flex-col items-center gap-3">

        <div
          className="
            w-9 h-9
            border-2
            border-indigo-600
            border-t-transparent
            rounded-full
            animate-spin
          "
        />

        <p className="text-sm text-gray-500">
          Checking your StaffHub session...
        </p>

      </div>

    </div>
  );
}

// ============================================================
// GENERAL PROTECTED ROUTE
// ============================================================

export function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {

  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  const location =
    useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {

    return (
      <Navigate
        to="/login"
        state={{
          from: location,
        }}
        replace
      />
    );
  }

  return <>{children}</>;
}

// ============================================================
// EMPLOYEE PORTAL ROUTE
// ============================================================

export function EmployeeRoute({
  children,
}: {
  children: ReactNode;
}) {

  const {
    user,
    isLoading,
  } = useAuth();

  const location =
    useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {

    return (
      <Navigate
        to="/login"
        state={{
          from: location,
        }}
        replace
      />
    );
  }

  if (user.accountType === 'OWNER') {

    return (
      <Navigate
        to="/owner"
        replace
      />
    );
  }

  return <>{children}</>;
}

// ============================================================
// PERMISSION ROUTE
// ============================================================

export function PermissionRoute({
  children,
  permission,
}: {
  children: ReactNode;
  permission: PermissionType;
}) {

  const {
    user,
    isLoading,
  } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    !hasPermission(
      user.role as RoleType,
      permission)
  ) {

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">

        <div className="text-center">

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>

          <p className="text-sm text-gray-500">
            You don't have permission to access this page.
          </p>

        </div>

      </div>
    );
  }

  return <>{children}</>;
}