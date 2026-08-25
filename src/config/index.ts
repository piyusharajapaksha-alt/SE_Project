// ============================================================
// APPLICATION CONFIGURATION
// Centralized config for roles, permissions, navigation, and app settings
// ============================================================

// --- App Configuration ---
export const APP_CONFIG = {
  appName: 'StaffHub',
  appDescription: 'Staff Management System',
  version: '1.0.0',
  // DEVELOPMENT ONLY: This controls whether we use mock data or API
  // When backend is ready, change to 'api' and set VITE_API_BASE_URL
  dataMode: (import.meta.env.VITE_DATA_MODE || 'mock') as 'mock' | 'api',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
};

// --- Role Definitions ---
export const ROLES = {
  EMPLOYEE: 'Employee',
  HR_MANAGER: 'HR Manager',
  DEPT_MANAGER: 'Department Manager',
  TRAINING_COORD: 'Training Coordinator',
  GRIEVANCE_OFFICER: 'Grievance Officer',
  EVENT_ORGANIZER: 'Event Organizer',
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

// --- Permission Definitions ---
// Each permission maps to which roles have access
export const PERMISSIONS = {
  // Employee management
  'employees.view': [ROLES.HR_MANAGER, ROLES.DEPT_MANAGER],
  'employees.create': [ROLES.HR_MANAGER],
  'employees.edit': [ROLES.HR_MANAGER],
  'employees.delete': [ROLES.HR_MANAGER],
  'employees.view-all': [ROLES.HR_MANAGER],
  'employees.view-dept': [ROLES.DEPT_MANAGER],

  // Attendance
  'attendance.view': [ROLES.EMPLOYEE, ROLES.HR_MANAGER, ROLES.DEPT_MANAGER],
  'attendance.view-all': [ROLES.HR_MANAGER, ROLES.DEPT_MANAGER],
  'attendance.edit': [ROLES.HR_MANAGER],
  'attendance.delete': [ROLES.HR_MANAGER],

  // Leave management
  'leave.view': [ROLES.EMPLOYEE, ROLES.HR_MANAGER, ROLES.DEPT_MANAGER],
  'leave.create': [ROLES.EMPLOYEE],
  'leave.approve': [ROLES.HR_MANAGER, ROLES.DEPT_MANAGER],
  'leave.reject': [ROLES.HR_MANAGER, ROLES.DEPT_MANAGER],
  'leave.view-all': [ROLES.HR_MANAGER, ROLES.DEPT_MANAGER],

  // Performance
  'performance.view': [ROLES.EMPLOYEE, ROLES.HR_MANAGER, ROLES.DEPT_MANAGER],
  'performance.create': [ROLES.HR_MANAGER, ROLES.DEPT_MANAGER],
  'performance.edit': [ROLES.HR_MANAGER, ROLES.DEPT_MANAGER],
  'performance.view-all': [ROLES.HR_MANAGER],

  // Training
  'training.view': [ROLES.EMPLOYEE, ROLES.HR_MANAGER, ROLES.TRAINING_COORD],
  'training.create': [ROLES.TRAINING_COORD, ROLES.HR_MANAGER],
  'training.edit': [ROLES.TRAINING_COORD, ROLES.HR_MANAGER],
  'training.delete': [ROLES.TRAINING_COORD, ROLES.HR_MANAGER],
  'training.manage': [ROLES.TRAINING_COORD, ROLES.HR_MANAGER],

  // Events
  'events.view': [ROLES.EMPLOYEE, ROLES.HR_MANAGER, ROLES.EVENT_ORGANIZER],
  'events.create': [ROLES.EVENT_ORGANIZER, ROLES.HR_MANAGER],
  'events.edit': [ROLES.EVENT_ORGANIZER, ROLES.HR_MANAGER],
  'events.delete': [ROLES.EVENT_ORGANIZER, ROLES.HR_MANAGER],
  'events.manage': [ROLES.EVENT_ORGANIZER, ROLES.HR_MANAGER],
  'events.register': [ROLES.EMPLOYEE],

  // Grievances
  'grievances.view': [ROLES.EMPLOYEE, ROLES.HR_MANAGER, ROLES.GRIEVANCE_OFFICER, ROLES.DEPT_MANAGER],
  'grievances.create': [ROLES.EMPLOYEE],
  'grievances.manage': [ROLES.GRIEVANCE_OFFICER, ROLES.HR_MANAGER],
  'grievances.assign': [ROLES.GRIEVANCE_OFFICER, ROLES.HR_MANAGER],

  // Reports
  'reports.view': [ROLES.HR_MANAGER, ROLES.DEPT_MANAGER, ROLES.TRAINING_COORD, ROLES.EVENT_ORGANIZER, ROLES.GRIEVANCE_OFFICER],

  // Notifications
  'notifications.view': [ROLES.EMPLOYEE, ROLES.HR_MANAGER, ROLES.DEPT_MANAGER, ROLES.TRAINING_COORD, ROLES.GRIEVANCE_OFFICER, ROLES.EVENT_ORGANIZER],
} as const;

export type PermissionType = keyof typeof PERMISSIONS;

// --- Permission Checker ---
// Centralized function to check if a role has a permission
export function hasPermission(role: RoleType, permission: PermissionType): boolean {
  const allowedRoles: readonly string[] = PERMISSIONS[permission];
  return allowedRoles.includes(role);
}

// --- Navigation Configuration ---
// Each nav item defines: key, label, icon, path, and required permission
export const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
  { key: 'employees', label: 'Employees', icon: 'Users', path: '/employees', permission: 'employees.view' as PermissionType },
  { key: 'attendance', label: 'Attendance', icon: 'Clock', path: '/attendance' },
  { key: 'leave', label: 'Leave', icon: 'CalendarDays', path: '/leave' },
  { key: 'performance', label: 'Performance', icon: 'TrendingUp', path: '/performance' },
  { key: 'training', label: 'Training', icon: 'GraduationCap', path: '/training' },
  { key: 'events', label: 'Events', icon: 'Calendar', path: '/events' },
  { key: 'grievances', label: 'Grievances', icon: 'MessageSquareWarning', path: '/grievances' },
  { key: 'reports', label: 'Reports', icon: 'BarChart3', path: '/reports', permission: 'reports.view' as PermissionType },
  { key: 'notifications', label: 'Notifications', icon: 'Bell', path: '/notifications' },
  { key: 'profile', label: 'Profile', icon: 'User', path: '/profile' },
  { key: 'settings', label: 'Settings', icon: 'Settings', path: '/settings' },
];

// Get navigation items for a specific role
export function getNavigationForRole(role: RoleType) {
  return NAV_ITEMS.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(role, item.permission);
  });
}

// --- Department List ---
export const DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Finance',
  'Marketing',
  'Operations',
  'Sales',
  'Quality Assurance',
  'Research & Development',
];

// --- Leave Types ---
export const LEAVE_TYPES = ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave'];

// --- Attendance Statuses ---
export const ATTENDANCE_STATUSES = ['Present', 'Late', 'Absent', 'On Leave', 'Half Day'];

// --- Grievance Categories ---
export const GRIEVANCE_CATEGORIES = ['Workplace Issue', 'Harassment', 'Discrimination', 'Safety Concern', 'Policy Violation', 'Compensation', 'Other'];

// --- Grievance Priorities ---
export const GRIEVANCE_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

// --- Grievance Statuses ---
export const GRIEVANCE_STATUSES = ['New', 'Under Review', 'Assigned', 'Resolved', 'Closed'];

// --- Training Categories ---
export const TRAINING_CATEGORIES = ['Technical', 'Leadership', 'Compliance', 'Soft Skills', 'Safety', 'Onboarding'];

// --- Event Categories ---
export const EVENT_CATEGORIES = ['Team Building', 'Conference', 'Workshop', 'Social', 'Celebration', 'Training', 'Meeting'];

// --- Performance Rating Scale ---
export const RATING_SCALE = [1, 2, 3, 4, 5] as const;

// --- Employee Statuses ---
export const EMPLOYEE_STATUSES = ['Active', 'On Leave', 'Probation', 'Terminated'];
