// ============================================================
// MOCK DATA - DEVELOPMENT ONLY
// This file contains all mock data for the application.
// In production, this data will come from the backend API.
// ============================================================

// --- Mock Users (for authentication) ---
// DEVELOPMENT ONLY - Replace with real backend authentication later.
// Never use these credentials in production.
export const mockUsers = [
  { id: 'USR001', email: 'employee@staffhub.com', password: 'demo123', role: 'Employee', employeeId: 'EMP001' },
  { id: 'USR002', email: 'hr@staffhub.com', password: 'demo123', role: 'HR Manager', employeeId: 'EMP002' },
  { id: 'USR003', email: 'manager@staffhub.com', password: 'demo123', role: 'Department Manager', employeeId: 'EMP003' },
  { id: 'USR004', email: 'training@staffhub.com', password: 'demo123', role: 'Training Coordinator', employeeId: 'EMP012' },
  { id: 'USR005', email: 'grievance@staffhub.com', password: 'demo123', role: 'Grievance Officer', employeeId: 'EMP013' },
  { id: 'USR006', email: 'events@staffhub.com', password: 'demo123', role: 'Event Organizer', employeeId: 'EMP014' },
];

// --- Departments ---
export const mockDepartments = [
  { id: 'DEPT01', name: 'Engineering', managerId: 'EMP003', description: 'Software development and engineering', employeeCount: 8 },
  { id: 'DEPT02', name: 'Human Resources', managerId: 'EMP002', description: 'HR management and employee relations', employeeCount: 3 },
  { id: 'DEPT03', name: 'Finance', managerId: 'EMP005', description: 'Financial planning and accounting', employeeCount: 3 },
  { id: 'DEPT04', name: 'Marketing', managerId: 'EMP008', description: 'Marketing strategy and brand management', employeeCount: 3 },
  { id: 'DEPT05', name: 'Operations', managerId: 'EMP010', description: 'Operations and logistics management', employeeCount: 3 },
  { id: 'DEPT06', name: 'Sales', managerId: 'EMP015', description: 'Sales and client relations', employeeCount: 2 },
  { id: 'DEPT07', name: 'Quality Assurance', managerId: 'EMP016', description: 'Quality testing and assurance', employeeCount: 2 },
  { id: 'DEPT08', name: 'Research & Development', managerId: 'EMP017', description: 'R&D and innovation', employeeCount: 2 },
];

// --- Employees ---
export const mockEmployees = [
  { id: 'EMP001', firstName: 'James', lastName: 'Wilson', email: 'james.wilson@staffhub.com', phone: '+1-555-0101', department: 'Engineering', departmentId: 'DEPT01', position: 'Software Engineer', role: 'Employee', status: 'Active', hireDate: '2022-03-15', avatar: null, address: '123 Oak Street, Springfield', emergencyContact: 'Mary Wilson - +1-555-0102', salary: 85000 },
  { id: 'EMP002', firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@staffhub.com', phone: '+1-555-0102', department: 'Human Resources', departmentId: 'DEPT02', position: 'HR Manager', role: 'HR Manager', status: 'Active', hireDate: '2020-06-01', avatar: null, address: '456 Maple Ave, Riverside', emergencyContact: 'Tom Chen - +1-555-0103', salary: 95000 },
  { id: 'EMP003', firstName: 'Michael', lastName: 'Rodriguez', email: 'michael.rodriguez@staffhub.com', phone: '+1-555-0103', department: 'Engineering', departmentId: 'DEPT01', position: 'Engineering Manager', role: 'Department Manager', status: 'Active', hireDate: '2019-01-10', avatar: null, address: '789 Pine Rd, Lakewood', emergencyContact: 'Ana Rodriguez - +1-555-0104', salary: 110000 },
  { id: 'EMP004', firstName: 'Emily', lastName: 'Thompson', email: 'emily.thompson@staffhub.com', phone: '+1-555-0104', department: 'Engineering', departmentId: 'DEPT01', position: 'Senior Developer', role: 'Employee', status: 'Active', hireDate: '2021-08-20', avatar: null, address: '321 Elm St, Oakville', emergencyContact: 'David Thompson - +1-555-0105', salary: 98000 },
  { id: 'EMP005', firstName: 'David', lastName: 'Park', email: 'david.park@staffhub.com', phone: '+1-555-0105', department: 'Finance', departmentId: 'DEPT03', position: 'Finance Manager', role: 'Department Manager', status: 'Active', hireDate: '2020-02-15', avatar: null, address: '654 Birch Ln, Maplewood', emergencyContact: 'Susan Park - +1-555-0106', salary: 105000 },
  { id: 'EMP006', firstName: 'Lisa', lastName: 'Kumar', email: 'lisa.kumar@staffhub.com', phone: '+1-555-0106', department: 'Engineering', departmentId: 'DEPT01', position: 'Frontend Developer', role: 'Employee', status: 'Active', hireDate: '2022-09-01', avatar: null, address: '987 Cedar Dr, Pineville', emergencyContact: 'Raj Kumar - +1-555-0107', salary: 82000 },
  { id: 'EMP007', firstName: 'Robert', lastName: 'Johnson', email: 'robert.johnson@staffhub.com', phone: '+1-555-0107', department: 'Human Resources', departmentId: 'DEPT02', position: 'HR Specialist', role: 'Employee', status: 'Active', hireDate: '2021-05-10', avatar: null, address: '147 Walnut St, Cedarville', emergencyContact: 'Jane Johnson - +1-555-0108', salary: 72000 },
  { id: 'EMP008', firstName: 'Amanda', lastName: 'Foster', email: 'amanda.foster@staffhub.com', phone: '+1-555-0108', department: 'Marketing', departmentId: 'DEPT04', position: 'Marketing Manager', role: 'Department Manager', status: 'Active', hireDate: '2020-11-01', avatar: null, address: '258 Spruce Ave, Walnut Creek', emergencyContact: 'Mark Foster - +1-555-0109', salary: 92000 },
  { id: 'EMP009', firstName: 'Kevin', lastName: 'O\'Brien', email: 'kevin.obrien@staffhub.com', phone: '+1-555-0109', department: 'Engineering', departmentId: 'DEPT01', position: 'Backend Developer', role: 'Employee', status: 'Active', hireDate: '2023-01-15', avatar: null, address: '369 Ash Blvd, Sprucetown', emergencyContact: 'Megan O\'Brien - +1-555-0110', salary: 80000 },
  { id: 'EMP010', firstName: 'Patricia', lastName: 'Nguyen', email: 'patricia.nguyen@staffhub.com', phone: '+1-555-0110', department: 'Operations', departmentId: 'DEPT05', position: 'Operations Manager', role: 'Department Manager', status: 'Active', hireDate: '2019-07-20', avatar: null, address: '741 Poplar Way, Ashtown', emergencyContact: 'Hai Nguyen - +1-555-0111', salary: 97000 },
  { id: 'EMP011', firstName: 'Christopher', lastName: 'Lee', email: 'christopher.lee@staffhub.com', phone: '+1-555-0111', department: 'Finance', departmentId: 'DEPT03', position: 'Financial Analyst', role: 'Employee', status: 'Active', hireDate: '2022-04-01', avatar: null, address: '852 Hickory Ct, Poplar Hills', emergencyContact: 'Grace Lee - +1-555-0112', salary: 75000 },
  { id: 'EMP012', firstName: 'Jessica', lastName: 'Martinez', email: 'jessica.martinez@staffhub.com', phone: '+1-555-0112', department: 'Human Resources', departmentId: 'DEPT02', position: 'Training Coordinator', role: 'Training Coordinator', status: 'Active', hireDate: '2021-09-15', avatar: null, address: '963 Sycamore Pl, Hickory Heights', emergencyContact: 'Carlos Martinez - +1-555-0113', salary: 78000 },
  { id: 'EMP013', firstName: 'Daniel', lastName: 'Brown', email: 'daniel.brown@staffhub.com', phone: '+1-555-0113', department: 'Human Resources', departmentId: 'DEPT02', position: 'Grievance Officer', role: 'Grievance Officer', status: 'Active', hireDate: '2021-01-20', avatar: null, address: '159 Chestnut Rd, Sycamore Park', emergencyContact: 'Linda Brown - +1-555-0114', salary: 76000 },
  { id: 'EMP014', firstName: 'Rachel', lastName: 'Green', email: 'rachel.green@staffhub.com', phone: '+1-555-0114', department: 'Marketing', departmentId: 'DEPT04', position: 'Event Organizer', role: 'Event Organizer', status: 'Active', hireDate: '2022-02-10', avatar: null, address: '357 Willow St, Chestnut Ridge', emergencyContact: 'Ben Green - +1-555-0115', salary: 73000 },
  { id: 'EMP015', firstName: 'Andrew', lastName: 'Kim', email: 'andrew.kim@staffhub.com', phone: '+1-555-0115', department: 'Sales', departmentId: 'DEPT06', position: 'Sales Manager', role: 'Department Manager', status: 'Active', hireDate: '2020-08-01', avatar: null, address: '468 Magnolia Dr, Willowbrook', emergencyContact: 'Suki Kim - +1-555-0116', salary: 95000 },
  { id: 'EMP016', firstName: 'Michelle', lastName: 'Davis', email: 'michelle.davis@staffhub.com', phone: '+1-555-0116', department: 'Quality Assurance', departmentId: 'DEPT07', position: 'QA Manager', role: 'Department Manager', status: 'Active', hireDate: '2021-03-15', avatar: null, address: '579 Redwood Ln, Magnolia Bay', emergencyContact: 'Peter Davis - +1-555-0117', salary: 90000 },
  { id: 'EMP017', firstName: 'Thomas', lastName: 'Wright', email: 'thomas.wright@staffhub.com', phone: '+1-555-0117', department: 'Research & Development', departmentId: 'DEPT08', position: 'R&D Manager', role: 'Department Manager', status: 'Active', hireDate: '2020-04-10', avatar: null, address: '680 Sequoia Ave, Redwood City', emergencyContact: 'Karen Wright - +1-555-0118', salary: 108000 },
  { id: 'EMP018', firstName: 'Nicole', lastName: 'Harris', email: 'nicole.harris@staffhub.com', phone: '+1-555-0118', department: 'Marketing', departmentId: 'DEPT04', position: 'Content Specialist', role: 'Employee', status: 'Active', hireDate: '2023-03-01', avatar: null, address: '791 Juniper St, Sequoia Valley', emergencyContact: 'George Harris - +1-555-0119', salary: 65000 },
  { id: 'EMP019', firstName: 'Steven', lastName: 'Clark', email: 'steven.clark@staffhub.com', phone: '+1-555-0119', department: 'Operations', departmentId: 'DEPT05', position: 'Operations Analyst', role: 'Employee', status: 'On Leave', hireDate: '2022-07-15', avatar: null, address: '802 Cypress Blvd, Juniper Falls', emergencyContact: 'Diane Clark - +1-555-0120', salary: 70000 },
  { id: 'EMP020', firstName: 'Karen', lastName: 'Lewis', email: 'karen.lewis@staffhub.com', phone: '+1-555-0120', department: 'Engineering', departmentId: 'DEPT01', position: 'DevOps Engineer', role: 'Employee', status: 'Active', hireDate: '2021-11-01', avatar: null, address: '913 Hemlock Way, Cypress Grove', emergencyContact: 'Paul Lewis - +1-555-0121', salary: 90000 },
  { id: 'EMP021', firstName: 'Jason', lastName: 'Walker', email: 'jason.walker@staffhub.com', phone: '+1-555-0121', department: 'Finance', departmentId: 'DEPT03', position: 'Accountant', role: 'Employee', status: 'Active', hireDate: '2022-06-01', avatar: null, address: '124 Beech Ct, Hemlock Heights', emergencyContact: 'Sara Walker - +1-555-0122', salary: 68000 },
  { id: 'EMP022', firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@staffhub.com', phone: '+1-555-0122', department: 'Sales', departmentId: 'DEPT06', position: 'Sales Representative', role: 'Employee', status: 'Active', hireDate: '2023-02-15', avatar: null, address: '235 Alder Pl, Beechwood', emergencyContact: 'Luis Garcia - +1-555-0123', salary: 62000 },
  { id: 'EMP023', firstName: 'Brian', lastName: 'Taylor', email: 'brian.taylor@staffhub.com', phone: '+1-555-0123', department: 'Quality Assurance', departmentId: 'DEPT07', position: 'QA Engineer', role: 'Employee', status: 'Probation', hireDate: '2024-01-10', avatar: null, address: '346 Dogwood Rd, Alder Park', emergencyContact: 'Amy Taylor - +1-555-0124', salary: 72000 },
  { id: 'EMP024', firstName: 'Samantha', lastName: 'Moore', email: 'samantha.moore@staffhub.com', phone: '+1-555-0124', department: 'Research & Development', departmentId: 'DEPT08', position: 'Research Scientist', role: 'Employee', status: 'Active', hireDate: '2021-12-01', avatar: null, address: '457 Pecan Dr, Dogwood Valley', emergencyContact: 'James Moore - +1-555-0125', salary: 95000 },
  { id: 'EMP025', firstName: 'Ryan', lastName: 'Jackson', email: 'ryan.jackson@staffhub.com', phone: '+1-555-0125', department: 'Engineering', departmentId: 'DEPT01', position: 'Junior Developer', role: 'Employee', status: 'Probation', hireDate: '2024-02-01', avatar: null, address: '568 Mulberry St, Pecan Ridge', emergencyContact: 'Helen Jackson - +1-555-0126', salary: 60000 },
  { id: 'EMP026', firstName: 'Lauren', lastName: 'White', email: 'lauren.white@staffhub.com', phone: '+1-555-0126', department: 'Operations', departmentId: 'DEPT05', position: 'Operations Coordinator', role: 'Employee', status: 'Active', hireDate: '2023-06-15', avatar: null, address: '679 Persimmon Ave, Mulberry Lane', emergencyContact: 'Doug White - +1-555-0127', salary: 67000 },
];

// --- Attendance Records ---
export const mockAttendance = [
  { id: 'ATT001', employeeId: 'EMP001', date: '2024-12-16', status: 'Present', checkIn: '08:55', checkOut: '17:05', notes: '' },
  { id: 'ATT002', employeeId: 'EMP002', date: '2024-12-16', status: 'Present', checkIn: '08:30', checkOut: '17:15', notes: '' },
  { id: 'ATT003', employeeId: 'EMP003', date: '2024-12-16', status: 'Present', checkIn: '09:00', checkOut: '17:30', notes: '' },
  { id: 'ATT004', employeeId: 'EMP004', date: '2024-12-16', status: 'Late', checkIn: '09:35', checkOut: '17:20', notes: 'Traffic delay' },
  { id: 'ATT005', employeeId: 'EMP005', date: '2024-12-16', status: 'Present', checkIn: '08:45', checkOut: '17:10', notes: '' },
  { id: 'ATT006', employeeId: 'EMP006', date: '2024-12-16', status: 'Present', checkIn: '08:50', checkOut: '17:00', notes: '' },
  { id: 'ATT007', employeeId: 'EMP007', date: '2024-12-16', status: 'On Leave', checkIn: '', checkOut: '', notes: 'Sick leave' },
  { id: 'ATT008', employeeId: 'EMP008', date: '2024-12-16', status: 'Present', checkIn: '08:40', checkOut: '17:25', notes: '' },
  { id: 'ATT009', employeeId: 'EMP009', date: '2024-12-16', status: 'Absent', checkIn: '', checkOut: '', notes: 'No notification' },
  { id: 'ATT010', employeeId: 'EMP010', date: '2024-12-16', status: 'Present', checkIn: '08:20', checkOut: '17:00', notes: '' },
  { id: 'ATT011', employeeId: 'EMP011', date: '2024-12-16', status: 'Present', checkIn: '09:05', checkOut: '17:30', notes: '' },
  { id: 'ATT012', employeeId: 'EMP012', date: '2024-12-16', status: 'Half Day', checkIn: '08:30', checkOut: '12:30', notes: 'Personal errand' },
  { id: 'ATT013', employeeId: 'EMP013', date: '2024-12-16', status: 'Present', checkIn: '08:55', checkOut: '17:15', notes: '' },
  { id: 'ATT014', employeeId: 'EMP014', date: '2024-12-16', status: 'Present', checkIn: '09:00', checkOut: '17:00', notes: '' },
  { id: 'ATT015', employeeId: 'EMP015', date: '2024-12-16', status: 'Late', checkIn: '09:20', checkOut: '17:30', notes: 'Doctor appointment' },
  { id: 'ATT016', employeeId: 'EMP016', date: '2024-12-16', status: 'Present', checkIn: '08:45', checkOut: '17:10', notes: '' },
  { id: 'ATT017', employeeId: 'EMP017', date: '2024-12-16', status: 'Present', checkIn: '08:30', checkOut: '17:00', notes: '' },
  { id: 'ATT018', employeeId: 'EMP018', date: '2024-12-16', status: 'Present', checkIn: '09:00', checkOut: '17:15', notes: '' },
  { id: 'ATT019', employeeId: 'EMP019', date: '2024-12-16', status: 'On Leave', checkIn: '', checkOut: '', notes: 'Annual leave' },
  { id: 'ATT020', employeeId: 'EMP020', date: '2024-12-16', status: 'Present', checkIn: '08:50', checkOut: '17:05', notes: '' },
  // Previous day
  { id: 'ATT021', employeeId: 'EMP001', date: '2024-12-15', status: 'Present', checkIn: '08:45', checkOut: '17:10', notes: '' },
  { id: 'ATT022', employeeId: 'EMP002', date: '2024-12-15', status: 'Present', checkIn: '08:30', checkOut: '17:00', notes: '' },
  { id: 'ATT023', employeeId: 'EMP003', date: '2024-12-15', status: 'Present', checkIn: '09:00', checkOut: '18:00', notes: '' },
  { id: 'ATT024', employeeId: 'EMP004', date: '2024-12-15', status: 'Present', checkIn: '08:55', checkOut: '17:15', notes: '' },
  { id: 'ATT025', employeeId: 'EMP006', date: '2024-12-15', status: 'Late', checkIn: '09:15', checkOut: '17:30', notes: '' },
  { id: 'ATT026', employeeId: 'EMP009', date: '2024-12-15', status: 'Present', checkIn: '08:50', checkOut: '17:00', notes: '' },
  // Employee 1 past data
  { id: 'ATT027', employeeId: 'EMP001', date: '2024-12-13', status: 'Present', checkIn: '08:50', checkOut: '17:05', notes: '' },
  { id: 'ATT028', employeeId: 'EMP001', date: '2024-12-12', status: 'Present', checkIn: '08:45', checkOut: '17:10', notes: '' },
  { id: 'ATT029', employeeId: 'EMP001', date: '2024-12-11', status: 'Late', checkIn: '09:20', checkOut: '17:30', notes: 'Bus delay' },
  { id: 'ATT030', employeeId: 'EMP001', date: '2024-12-10', status: 'Present', checkIn: '08:40', checkOut: '17:00', notes: '' },
  { id: 'ATT031', employeeId: 'EMP001', date: '2024-12-09', status: 'Present', checkIn: '08:55', checkOut: '17:15', notes: '' },
];

// --- Leave Requests ---
export const mockLeaveRequests = [
  { id: 'LR001', employeeId: 'EMP001', type: 'Annual Leave', startDate: '2024-12-20', endDate: '2024-12-24', reason: 'Family vacation for the holidays', status: 'Pending', approverId: 'EMP003', approvedAt: null, comments: '' },
  { id: 'LR002', employeeId: 'EMP004', type: 'Sick Leave', startDate: '2024-12-17', endDate: '2024-12-18', reason: 'Feeling unwell, doctor appointment scheduled', status: 'Pending', approverId: 'EMP003', approvedAt: null, comments: '' },
  { id: 'LR003', employeeId: 'EMP006', type: 'Personal Leave', startDate: '2024-12-19', endDate: '2024-12-19', reason: 'Personal errand - home inspection', status: 'Approved', approverId: 'EMP003', approvedAt: '2024-12-15', comments: 'Approved. Enjoy!' },
  { id: 'LR004', employeeId: 'EMP007', type: 'Sick Leave', startDate: '2024-12-16', endDate: '2024-12-16', reason: 'Migraine', status: 'Approved', approverId: 'EMP002', approvedAt: '2024-12-15', comments: 'Get well soon' },
  { id: 'LR005', employeeId: 'EMP009', type: 'Annual Leave', startDate: '2024-12-23', endDate: '2024-12-31', reason: 'Holiday break with family', status: 'Pending', approverId: 'EMP003', approvedAt: null, comments: '' },
  { id: 'LR006', employeeId: 'EMP011', type: 'Personal Leave', startDate: '2024-12-18', endDate: '2024-12-18', reason: 'Bank appointment', status: 'Approved', approverId: 'EMP005', approvedAt: '2024-12-14', comments: '' },
  { id: 'LR007', employeeId: 'EMP014', type: 'Annual Leave', startDate: '2025-01-02', endDate: '2025-01-06', reason: 'Post-holiday rest', status: 'Pending', approverId: 'EMP008', approvedAt: null, comments: '' },
  { id: 'LR008', employeeId: 'EMP018', type: 'Sick Leave', startDate: '2024-12-13', endDate: '2024-12-13', reason: 'Cold and fever', status: 'Approved', approverId: 'EMP008', approvedAt: '2024-12-12', comments: '' },
  { id: 'LR009', employeeId: 'EMP022', type: 'Annual Leave', startDate: '2024-12-26', endDate: '2024-12-31', reason: 'Year-end holiday', status: 'Rejected', approverId: 'EMP015', approvedAt: '2024-12-14', comments: 'Too many team members already on leave during this period' },
  { id: 'LR010', employeeId: 'EMP019', type: 'Annual Leave', startDate: '2024-12-16', endDate: '2024-12-20', reason: 'Pre-planned annual leave', status: 'Approved', approverId: 'EMP010', approvedAt: '2024-12-10', comments: '' },
  { id: 'LR011', employeeId: 'EMP020', type: 'Personal Leave', startDate: '2025-01-10', endDate: '2025-01-10', reason: 'Moving to new apartment', status: 'Pending', approverId: 'EMP003', approvedAt: null, comments: '' },
  { id: 'LR012', employeeId: 'EMP025', type: 'Sick Leave', startDate: '2024-12-16', endDate: '2024-12-17', reason: 'Stomach flu', status: 'Pending', approverId: 'EMP003', approvedAt: null, comments: '' },
];

// --- Leave Balances ---
export const mockLeaveBalances = [
  { employeeId: 'EMP001', annualLeave: { total: 20, used: 5, remaining: 15 }, sickLeave: { total: 10, used: 2, remaining: 8 }, personalLeave: { total: 5, used: 1, remaining: 4 } },
  { employeeId: 'EMP004', annualLeave: { total: 20, used: 8, remaining: 12 }, sickLeave: { total: 10, used: 3, remaining: 7 }, personalLeave: { total: 5, used: 2, remaining: 3 } },
  { employeeId: 'EMP006', annualLeave: { total: 20, used: 3, remaining: 17 }, sickLeave: { total: 10, used: 1, remaining: 9 }, personalLeave: { total: 5, used: 1, remaining: 4 } },
  { employeeId: 'EMP009', annualLeave: { total: 15, used: 4, remaining: 11 }, sickLeave: { total: 10, used: 0, remaining: 10 }, personalLeave: { total: 5, used: 0, remaining: 5 } },
];

// --- Performance Reviews ---
export const mockPerformance = [
  { id: 'PERF001', employeeId: 'EMP001', reviewerId: 'EMP003', reviewDate: '2024-06-15', rating: 4, status: 'Completed', comments: 'Excellent technical skills, great team collaboration. Needs to improve documentation practices.', kpis: [{ name: 'Code Quality', score: 4.5, target: 4 }, { name: 'Task Completion', score: 4.0, target: 3.5 }, { name: 'Team Collaboration', score: 4.5, target: 4 }, { name: 'Innovation', score: 3.5, target: 3 }] },
  { id: 'PERF002', employeeId: 'EMP004', reviewerId: 'EMP003', reviewDate: '2024-06-20', rating: 5, status: 'Completed', comments: 'Outstanding performer. Leads by example and consistently exceeds expectations.', kpis: [{ name: 'Code Quality', score: 5.0, target: 4 }, { name: 'Task Completion', score: 4.5, target: 4 }, { name: 'Leadership', score: 4.5, target: 4 }, { name: 'Mentoring', score: 4.0, target: 3.5 }] },
  { id: 'PERF003', employeeId: 'EMP006', reviewerId: 'EMP003', reviewDate: '2024-07-01', rating: 3, status: 'Completed', comments: 'Good progress as a junior developer. Needs more experience with testing frameworks.', kpis: [{ name: 'Code Quality', score: 3.5, target: 4 }, { name: 'Task Completion', score: 3.0, target: 3.5 }, { name: 'Learning Agility', score: 4.0, target: 3.5 }, { name: 'Communication', score: 3.5, target: 3 }] },
  { id: 'PERF004', employeeId: 'EMP009', reviewerId: 'EMP003', reviewDate: '2024-07-10', rating: 4, status: 'Completed', comments: 'Strong backend skills. Could take on more leadership responsibilities.', kpis: [{ name: 'Code Quality', score: 4.0, target: 4 }, { name: 'Task Completion', score: 4.0, target: 3.5 }, { name: 'Problem Solving', score: 4.5, target: 4 }, { name: 'Communication', score: 3.5, target: 3.5 }] },
  { id: 'PERF005', employeeId: 'EMP018', reviewerId: 'EMP008', reviewDate: '2024-07-15', rating: 3, status: 'Pending Review', comments: '', kpis: [{ name: 'Content Quality', score: 3.5, target: 4 }, { name: 'Task Completion', score: 3.0, target: 3 }, { name: 'Creativity', score: 4.0, target: 3.5 }, { name: 'Collaboration', score: 3.0, target: 3 }] },
  { id: 'PERF006', employeeId: 'EMP020', reviewerId: 'EMP003', reviewDate: '2024-08-01', rating: 4, status: 'Completed', comments: 'Excellent DevOps practices. Infrastructure reliability has improved significantly.', kpis: [{ name: 'System Reliability', score: 4.5, target: 4 }, { name: 'Task Completion', score: 4.0, target: 3.5 }, { name: 'Automation', score: 4.5, target: 4 }, { name: 'Documentation', score: 3.5, target: 3 }] },
  { id: 'PERF007', employeeId: 'EMP002', reviewerId: 'EMP005', reviewDate: '2024-06-01', rating: 5, status: 'Completed', comments: 'Exceptional HR leadership. Has transformed our onboarding process.', kpis: [{ name: 'Process Improvement', score: 5.0, target: 4 }, { name: 'Employee Satisfaction', score: 4.5, target: 4 }, { name: 'Compliance', score: 5.0, target: 4.5 }, { name: 'Leadership', score: 4.5, target: 4 }] },
];

// --- Training Programs ---
export const mockTraining = [
  { id: 'TRN001', title: 'React Advanced Patterns', description: 'Deep dive into advanced React patterns including compound components, render props, and hooks patterns', trainer: 'Emily Thompson', category: 'Technical', startDate: '2024-12-18', endDate: '2024-12-20', location: 'Conference Room A', capacity: 20, participants: ['EMP001', 'EMP006', 'EMP009', 'EMP020', 'EMP025'], status: 'Upcoming' },
  { id: 'TRN002', title: 'Leadership Essentials', description: 'Core leadership skills for new and aspiring managers', trainer: 'Sarah Chen', category: 'Leadership', startDate: '2025-01-06', endDate: '2025-01-08', location: 'Training Center', capacity: 15, participants: ['EMP004', 'EMP010', 'EMP015'], status: 'Upcoming' },
  { id: 'TRN003', title: 'Workplace Safety Training', description: 'Annual workplace safety and emergency procedures refresher', trainer: 'Patricia Nguyen', category: 'Safety', startDate: '2024-12-10', endDate: '2024-12-10', location: 'Main Hall', capacity: 50, participants: ['EMP001', 'EMP004', 'EMP006', 'EMP009', 'EMP011', 'EMP018', 'EMP020', 'EMP021', 'EMP022', 'EMP026'], status: 'Completed' },
  { id: 'TRN004', title: 'Effective Communication', description: 'Improve interpersonal and professional communication skills', trainer: 'Jessica Martinez', category: 'Soft Skills', startDate: '2025-01-15', endDate: '2025-01-16', location: 'Meeting Room B', capacity: 25, participants: ['EMP007', 'EMP014', 'EMP018'], status: 'Upcoming' },
  { id: 'TRN005', title: 'Cloud Architecture Fundamentals', description: 'Introduction to cloud computing architecture and best practices', trainer: 'Karen Lewis', category: 'Technical', startDate: '2025-01-20', endDate: '2025-01-22', location: 'Conference Room A', capacity: 20, participants: ['EMP001', 'EMP009', 'EMP020'], status: 'Upcoming' },
  { id: 'TRN006', title: 'Data Privacy Compliance', description: 'Understanding data privacy regulations and compliance requirements', trainer: 'David Park', category: 'Compliance', startDate: '2024-11-15', endDate: '2024-11-15', location: 'Training Center', capacity: 30, participants: ['EMP002', 'EMP007', 'EMP013', 'EMP012', 'EMP011'], status: 'Completed' },
  { id: 'TRN007', title: 'New Employee Onboarding', description: 'Comprehensive onboarding program for new hires', trainer: 'Sarah Chen', category: 'Onboarding', startDate: '2025-01-02', endDate: '2025-01-03', location: 'HR Office', capacity: 10, participants: ['EMP023', 'EMP025'], status: 'Upcoming' },
  { id: 'TRN008', title: 'Project Management Basics', description: 'Introduction to project management methodologies and tools', trainer: 'Michael Rodriguez', category: 'Leadership', startDate: '2024-12-02', endDate: '2024-12-04', location: 'Training Center', capacity: 20, participants: ['EMP006', 'EMP011', 'EMP018', 'EMP022', 'EMP026'], status: 'Completed' },
];

// --- Events ---
export const mockEvents = [
  { id: 'EVT001', title: 'Year-End Celebration', description: 'Annual year-end celebration with awards and team activities', organizer: 'Rachel Green', organizerId: 'EMP014', date: '2024-12-20', time: '18:00', endTime: '22:00', location: 'Grand Ballroom', capacity: 100, registeredIds: ['EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP008', 'EMP010', 'EMP012', 'EMP013', 'EMP015', 'EMP016', 'EMP017', 'EMP018', 'EMP020'], status: 'Upcoming', category: 'Celebration' },
  { id: 'EVT002', title: 'Tech Talk: AI in 2025', description: 'Industry expert shares insights on AI trends and applications', organizer: 'Michael Rodriguez', organizerId: 'EMP003', date: '2024-12-18', time: '14:00', endTime: '16:00', location: 'Conference Room A', capacity: 40, registeredIds: ['EMP001', 'EMP004', 'EMP006', 'EMP009', 'EMP020', 'EMP024', 'EMP025'], status: 'Upcoming', category: 'Workshop' },
  { id: 'EVT003', title: 'Team Building Retreat', description: 'Outdoor team building activities and collaborative challenges', organizer: 'Rachel Green', organizerId: 'EMP014', date: '2025-01-15', time: '09:00', endTime: '17:00', location: 'Lakeside Resort', capacity: 50, registeredIds: ['EMP002', 'EMP003', 'EMP008', 'EMP010'], status: 'Upcoming', category: 'Team Building' },
  { id: 'EVT004', title: 'Charity Fundraiser', description: 'Annual charity fundraiser for local community support', organizer: 'Amanda Foster', organizerId: 'EMP008', date: '2025-01-25', time: '10:00', endTime: '15:00', location: 'Community Center', capacity: 80, registeredIds: ['EMP002', 'EMP007', 'EMP014'], status: 'Upcoming', category: 'Social' },
  { id: 'EVT005', title: 'Q3 Review Meeting', description: 'Quarterly business review and planning session', organizer: 'Sarah Chen', organizerId: 'EMP002', date: '2024-10-05', time: '10:00', endTime: '12:00', location: 'Main Conference Room', capacity: 30, registeredIds: ['EMP003', 'EMP005', 'EMP008', 'EMP010', 'EMP015', 'EMP016', 'EMP017'], status: 'Completed', category: 'Meeting' },
  { id: 'EVT006', title: 'Hackathon 2024', description: '24-hour internal hackathon for innovation and collaboration', organizer: 'Michael Rodriguez', organizerId: 'EMP003', date: '2024-11-15', time: '09:00', endTime: '09:00', location: 'Innovation Lab', capacity: 30, registeredIds: ['EMP001', 'EMP004', 'EMP006', 'EMP009', 'EMP020', 'EMP024', 'EMP025', 'EMP016'], status: 'Completed', category: 'Workshop' },
  { id: 'EVT007', title: 'Wellness Week Kickoff', description: 'Start of company wellness week with health screenings and activities', organizer: 'Rachel Green', organizerId: 'EMP014', date: '2025-02-03', time: '08:00', endTime: '17:00', location: 'Various Locations', capacity: 60, registeredIds: ['EMP001', 'EMP002'], status: 'Upcoming', category: 'Social' },
];

// --- Grievances ---
export const mockGrievances = [
  { id: 'GRV001', employeeId: 'EMP006', category: 'Workplace Issue', priority: 'Medium', status: 'Under Review', description: 'Excessive workload assigned without proper planning. Multiple deadlines overlapping causing stress and potential burnout.', assignedTo: 'EMP013', responses: [{ responderId: 'EMP013', text: 'Looking into this matter. Will schedule a meeting with your manager.', date: '2024-12-14' }], createdAt: '2024-12-13', updatedAt: '2024-12-14' },
  { id: 'GRV002', employeeId: 'EMP009', category: 'Safety Concern', priority: 'High', status: 'Assigned', description: 'Fire exit on the 3rd floor has been blocked by storage materials for over a week. This is a serious safety hazard.', assignedTo: 'EMP013', responses: [{ responderId: 'EMP013', text: 'Escalated to facilities management. Expected resolution by end of day.', date: '2024-12-15' }, { responderId: 'EMP010', text: 'Facilities team has been notified. Clearing the area today.', date: '2024-12-15' }], createdAt: '2024-12-14', updatedAt: '2024-12-15' },
  { id: 'GRV003', employeeId: 'EMP018', category: 'Compensation', priority: 'Medium', status: 'New', description: 'Requesting salary review. Have taken on additional responsibilities since joining but compensation has not been adjusted.', assignedTo: null, responses: [], createdAt: '2024-12-16', updatedAt: '2024-12-16' },
  { id: 'GRV004', employeeId: 'EMP022', category: 'Policy Violation', priority: 'Low', status: 'Resolved', description: 'Sales commission calculation seems inconsistent with the policy document shared during onboarding.', assignedTo: 'EMP013', responses: [{ responderId: 'EMP013', text: 'Reviewed the commission structure. There was a documentation error. Updated policy has been shared.', date: '2024-12-10' }, { responderId: 'EMP013', text: 'Correction applied to last month\'s commission. Closing this grievance.', date: '2024-12-11' }], createdAt: '2024-12-08', updatedAt: '2024-12-11' },
  { id: 'GRV005', employeeId: 'EMP001', category: 'Workplace Issue', priority: 'Low', status: 'Resolved', description: 'Noise from construction in adjacent building affecting concentration and meetings. Request for noise-canceling equipment.', assignedTo: 'EMP013', responses: [{ responderId: 'EMP013', text: 'Approved noise-canceling headphones for affected team. Construction expected to end in 2 weeks.', date: '2024-11-20' }], createdAt: '2024-11-18', updatedAt: '2024-11-20' },
  { id: 'GRV006', employeeId: 'EMP025', category: 'Other', priority: 'Medium', status: 'Under Review', description: 'Onboarding process has gaps. Several required systems access were not set up during first week.', assignedTo: 'EMP013', responses: [{ responderId: 'EMP013', text: 'Working with IT to ensure all access is provisioned. Reviewing onboarding checklist.', date: '2024-12-16' }], createdAt: '2024-12-15', updatedAt: '2024-12-16' },
  { id: 'GRV007', employeeId: 'EMP026', category: 'Workplace Issue', priority: 'High', status: 'New', description: 'Repeated instances of unclear instructions from management leading to rework and missed deadlines in operations team.', assignedTo: null, responses: [], createdAt: '2024-12-16', updatedAt: '2024-12-16' },
];

// --- Notifications ---
export const mockNotifications = [
  { id: 'NTF001', userId: 'EMP001', type: 'leave', title: 'Leave Request Update', message: 'Your leave request for Dec 20-24 is pending approval', read: false, createdAt: '2024-12-16T09:00:00', relatedId: 'LR001', relatedType: 'leave' },
  { id: 'NTF002', userId: 'EMP001', type: 'training', title: 'Training Reminder', message: 'React Advanced Patterns training starts on Dec 18', read: false, createdAt: '2024-12-16T08:00:00', relatedId: 'TRN001', relatedType: 'training' },
  { id: 'NTF003', userId: 'EMP001', type: 'event', title: 'Event Registration Confirmed', message: 'You are registered for Year-End Celebration on Dec 20', read: true, createdAt: '2024-12-15T14:00:00', relatedId: 'EVT001', relatedType: 'event' },
  { id: 'NTF004', userId: 'EMP002', type: 'leave', title: 'New Leave Request', message: 'James Wilson submitted a leave request for your approval', read: false, createdAt: '2024-12-16T09:30:00', relatedId: 'LR001', relatedType: 'leave' },
  { id: 'NTF005', userId: 'EMP002', type: 'grievance', title: 'New Grievance Filed', message: 'A new grievance has been filed by Lauren White', read: false, createdAt: '2024-12-16T10:00:00', relatedId: 'GRV007', relatedType: 'grievance' },
  { id: 'NTF006', userId: 'EMP003', type: 'leave', title: 'Leave Requests Pending', message: 'You have 3 pending leave requests to review', read: false, createdAt: '2024-12-16T08:30:00', relatedId: null, relatedType: 'leave' },
  { id: 'NTF007', userId: 'EMP003', type: 'performance', title: 'Performance Review Due', message: 'Annual performance reviews for your team are due by Dec 31', read: true, createdAt: '2024-12-14T09:00:00', relatedId: null, relatedType: 'performance' },
  { id: 'NTF008', userId: 'EMP012', type: 'training', title: 'Training Registration', message: 'New participant registered for React Advanced Patterns', read: false, createdAt: '2024-12-15T11:00:00', relatedId: 'TRN001', relatedType: 'training' },
  { id: 'NTF009', userId: 'EMP013', type: 'grievance', title: 'New Grievance Assigned', message: 'A new high-priority grievance has been assigned to you', read: false, createdAt: '2024-12-16T07:00:00', relatedId: 'GRV007', relatedType: 'grievance' },
  { id: 'NTF010', userId: 'EMP014', type: 'event', title: 'Event Registration', message: '2 new registrations for Year-End Celebration', read: true, createdAt: '2024-12-15T16:00:00', relatedId: 'EVT001', relatedType: 'event' },
  { id: 'NTF011', userId: 'EMP001', type: 'system', title: 'Welcome to StaffHub', message: 'Your staff management portal is ready. Explore your dashboard!', read: true, createdAt: '2024-12-01T08:00:00', relatedId: null, relatedType: null },
  { id: 'NTF012', userId: 'EMP002', type: 'attendance', title: 'Attendance Alert', message: 'Kevin O\'Brien is marked absent today without notification', read: false, createdAt: '2024-12-16T10:30:00', relatedId: 'ATT009', relatedType: 'attendance' },
];

// --- Dashboard Stats ---
export const mockDashboardStats = {
  totalEmployees: 26,
  presentToday: 18,
  lateToday: 3,
  absentToday: 1,
  onLeaveToday: 4,
  pendingLeaveRequests: 5,
  activeTraining: 4,
  upcomingEvents: 5,
  openGrievances: 4,
  avgPerformance: 3.9,
};
