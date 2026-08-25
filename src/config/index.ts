// ============================================================
// APPLICATION CONFIGURATION
// Centralized config for roles, permissions, navigation, and app settings.
// ============================================================

// ------------------------------------------------------------
// App Configuration
// ------------------------------------------------------------
export const APP_CONFIG = {
  appName: 'StaffHub',
  appDescription: 'Staff Management System',
  version: '1.0.0',
  dataMode: (import.meta.env.VITE_DATA_MODE || 'mock') as 'mock' | 'api',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
};

// ------------------------------------------------------------
// Role Definitions
// ------------------------------------------------------------
export const ROLES = {
  EMPLOYEE: 'Employee',
  HR_MANAGER: 'HR Manager',
  DEPT_MANAGER: 'Department Manager',
  TRAINING_COORD: 'Training Coordinator',
  GRIEVANCE_OFFICER: 'Grievance Officer',
  EVENT_ORGANIZER: 'Event Organizer',
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

// ------------------------------------------------------------
// Permissions
// ------------------------------------------------------------
export const PERMISSIONS = {
  // Employee management
  'employees.view': [ROLES.HR_MANAGER, ROLES.DEPT_MANAGER],
  'employees.create': [ROLES.HR_MANAGER],
  'employees.edit': [ROLES.HR_MANAGER],
  'employees.delete': [ROLES.HR_MANAGER],
  'employees.view-all': [ROLES.HR_MANAGER],
  'employees.view-dept': [ROLES.DEPT_MANAGER],

  // Attendance
  // MAIN / Attendance is intentionally NOT permission-gated here.
  // It is an employee-level page for every authenticated user.
  'attendance.view': [ROLES.EMPLOYEE],
  'attendance.view-all': [ROLES.HR_MANAGER, ROLES.DEPT_MANAGER],
  'attendance.edit': [ROLES.HR_MANAGER],
  'attendance.delete': [ROLES.HR_MANAGER],

  // Leave
  'leave.view': [ROLES.EMPLOYEE, ROLES.HR_MANAGER, ROLES.DEPT_MANAGER, ROLES.TRAINING_COORD, ROLES.GRIEVANCE_OFFICER, ROLES.EVENT_ORGANIZER],
  'leave.create': [ROLES.EMPLOYEE],
  'leave.approve': [ROLES.HR_MANAGER, ROLES.DEPT_MANAGER],
  'leave.reject': [ROLES.HR_MANAGER, ROLES.DEPT_MANAGER],
  'leave.view-all': [ROLES.HR_MANAGER, ROLES.DEPT_MANAGER],

  // Performance
  'performance.view': [ROLES.EMPLOYEE],
  'performance.create': [ROLES.HR_MANAGER, ROLES.DEPT_MANAGER],
  'performance.edit': [ROLES.HR_MANAGER, ROLES.DEPT_MANAGER],
  'performance.view-all': [ROLES.HR_MANAGER],

  // Training
  'training.view': [ROLES.EMPLOYEE],
  'training.create': [ROLES.TRAINING_COORD, ROLES.HR_MANAGER],
  'training.edit': [ROLES.TRAINING_COORD, ROLES.HR_MANAGER],
  'training.delete': [ROLES.TRAINING_COORD, ROLES.HR_MANAGER],
  'training.manage': [ROLES.TRAINING_COORD, ROLES.HR_MANAGER],

  // Events
  'events.view': [ROLES.EMPLOYEE],
  'events.create': [ROLES.EVENT_ORGANIZER, ROLES.HR_MANAGER],
  'events.edit': [ROLES.EVENT_ORGANIZER, ROLES.HR_MANAGER],
  'events.delete': [ROLES.EVENT_ORGANIZER, ROLES.HR_MANAGER],
  'events.manage': [ROLES.EVENT_ORGANIZER, ROLES.HR_MANAGER],
  'events.register': [ROLES.EMPLOYEE],

  // Grievances
  'grievances.view': [ROLES.EMPLOYEE],
  'grievances.create': [ROLES.EMPLOYEE],
  'grievances.manage': [ROLES.GRIEVANCE_OFFICER, ROLES.HR_MANAGER],
  'grievances.assign': [ROLES.GRIEVANCE_OFFICER, ROLES.HR_MANAGER],

  // Reports
  'reports.view': [
    ROLES.HR_MANAGER,
    ROLES.DEPT_MANAGER,
    ROLES.TRAINING_COORD,
    ROLES.EVENT_ORGANIZER,
    ROLES.GRIEVANCE_OFFICER,
  ],

  // Notifications
  'notifications.view': [
    ROLES.EMPLOYEE,
    ROLES.HR_MANAGER,
    ROLES.DEPT_MANAGER,
    ROLES.TRAINING_COORD,
    ROLES.GRIEVANCE_OFFICER,
    ROLES.EVENT_ORGANIZER,
  ],
} as const;

export type PermissionType = keyof typeof PERMISSIONS;

export function hasPermission(
  role: RoleType,
  permission: PermissionType
): boolean {
  return (PERMISSIONS[permission] as readonly string[]).includes(role);
}

// ------------------------------------------------------------
// Navigation
// ------------------------------------------------------------
export type NavigationGroup = 'main' | 'management' | 'personal';

export interface NavigationItem {
  key: string;
  label: string;
  icon: string;
  path: string;
  group: NavigationGroup;
  permission?: PermissionType;
}

// IMPORTANT:
// MAIN and PERSONAL are common navigation for every authenticated user.
// Management items use DIFFERENT /management/* paths and permissions.
export const NAV_ITEMS: NavigationItem[] = [
  // MAIN - employee-level pages for every authenticated user
  { key: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard', group: 'main' },
  { key: 'attendance', label: 'Attendance', icon: 'Clock', path: '/attendance', group: 'main' },
  { key: 'leave', label: 'Leave', icon: 'CalendarDays', path: '/leave', group: 'main' },
  { key: 'performance', label: 'Performance', icon: 'TrendingUp', path: '/performance', group: 'main' },
  { key: 'training', label: 'Training', icon: 'GraduationCap', path: '/training', group: 'main' },
  { key: 'events', label: 'Events', icon: 'Calendar', path: '/events', group: 'main' },
  { key: 'grievances', label: 'Grievances', icon: 'MessageSquareWarning', path: '/grievances', group: 'main' },

  // MANAGEMENT - role/permission based pages
  { key: 'employees-management', label: 'Employees', icon: 'Users', path: '/management/employees', group: 'management', permission: 'employees.view' },
  { key: 'attendance-management', label: 'Attendance Management', icon: 'Clock', path: '/management/attendance', group: 'management', permission: 'attendance.view-all' },
  { key: 'leave-management', label: 'Leave Management', icon: 'CalendarDays', path: '/management/leave', group: 'management', permission: 'leave.view-all' },
  { key: 'performance-management', label: 'Performance Management', icon: 'TrendingUp', path: '/management/performance', group: 'management', permission: 'performance.view-all' },
  { key: 'training-management', label: 'Training Management', icon: 'GraduationCap', path: '/management/training', group: 'management', permission: 'training.manage' },
  { key: 'event-management', label: 'Event Management', icon: 'Calendar', path: '/management/events', group: 'management', permission: 'events.manage' },
  { key: 'grievance-management', label: 'Grievance Management', icon: 'MessageSquareWarning', path: '/management/grievances', group: 'management', permission: 'grievances.manage' },
  { key: 'reports', label: 'Reports', icon: 'BarChart3', path: '/management/reports', group: 'management', permission: 'reports.view' },

  // PERSONAL - every authenticated user
  { key: 'notifications', label: 'Notifications', icon: 'Bell', path: '/notifications', group: 'personal' },
  { key: 'profile', label: 'Profile', icon: 'User', path: '/profile', group: 'personal' },
  { key: 'settings', label: 'Settings', icon: 'Settings', path: '/settings', group: 'personal' },
];

export function getManagementLabel(role: RoleType): string | null {
  switch (role) {
    case ROLES.HR_MANAGER:
      return 'HR MANAGEMENT';
    case ROLES.DEPT_MANAGER:
      return 'DEPARTMENT MANAGEMENT';
    case ROLES.TRAINING_COORD:
      return 'TRAINING MANAGEMENT';
    case ROLES.GRIEVANCE_OFFICER:
      return 'GRIEVANCE MANAGEMENT';
    case ROLES.EVENT_ORGANIZER:
      return 'EVENT MANAGEMENT';
    case ROLES.EMPLOYEE:
    default:
      return null;
  }
}

export function getNavigationForRole(role: RoleType): NavigationItem[] {
  return NAV_ITEMS.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(role, item.permission);
  });
}

// ------------------------------------------------------------
// Static Lists
// ------------------------------------------------------------
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

export const LEAVE_TYPES = [
  'Annual Leave',
  'Sick Leave',
  'Personal Leave',
  'Maternity Leave',
  'Paternity Leave',
  'Unpaid Leave',
];

export const ATTENDANCE_STATUSES = [
  'Present',
  'Late',
  'Absent',
  'On Leave',
  'Half Day',
];

export const GRIEVANCE_CATEGORIES = [
  'Workplace Issue',
  'Harassment',
  'Discrimination',
  'Safety Concern',
  'Policy Violation',
  'Compensation',
  'Other',
];

export const GRIEVANCE_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
export const GRIEVANCE_STATUSES = ['New', 'Under Review', 'Assigned', 'Resolved', 'Closed'];
export const TRAINING_CATEGORIES = ['Technical', 'Leadership', 'Compliance', 'Soft Skills', 'Safety', 'Onboarding'];
export const EVENT_CATEGORIES = ['Team Building', 'Conference', 'Workshop', 'Social', 'Celebration', 'Training', 'Meeting'];
export const RATING_SCALE = [1, 2, 3, 4, 5] as const;
export const EMPLOYEE_STATUSES = ['Active', 'On Leave', 'Probation', 'Terminated'];
