// ============================================================
// DATA SERVICES - All CRUD services for application entities
// DEVELOPMENT ONLY: Currently uses mock data.
// WHEN THE BACKEND IS READY, replace each mock implementation
// with the corresponding API endpoint calls.
// ============================================================

import {
  mockEmployees, mockDepartments, mockAttendance, mockLeaveRequests,
  mockLeaveBalances, mockPerformance, mockTraining, mockEvents,
  mockGrievances, mockNotifications, mockDashboardStats
} from '@/data/mock';

// --- Helper: Simulate network delay ---
function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// --- Helper: Deep clone to avoid mutation issues ---
function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// ============================================================
// EMPLOYEE SERVICE
// FUTURE API ENDPOINTS:
//   GET    /api/employees
//   GET    /api/employees/:id
//   POST   /api/employees
//   PUT    /api/employees/:id
//   DELETE /api/employees/:id
// ============================================================

let _employees = clone(mockEmployees);

export const employeeService = {
  async getAll(filters?: { search?: string; department?: string; status?: string; role?: string }) {
    await delay();
    let result = clone(_employees);
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      result = result.filter((e: any) =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(s) ||
        e.email.toLowerCase().includes(s) ||
        e.id.toLowerCase().includes(s) ||
        e.position.toLowerCase().includes(s)
      );
    }
    if (filters?.department && filters.department !== 'All') {
      result = result.filter((e: any) => e.department === filters.department);
    }
    if (filters?.status && filters.status !== 'All') {
      result = result.filter((e: any) => e.status === filters.status);
    }
    if (filters?.role && filters.role !== 'All') {
      result = result.filter((e: any) => e.role === filters.role);
    }
    return result;
  },

  async getById(id: string) {
    await delay();
    const emp = _employees.find((e: any) => e.id === id);
    return emp ? clone(emp) : null;
  },

  async create(data: any) {
    await delay(500);
    const id = `EMP${String(_employees.length + 1).padStart(3, '0')}`;
    const newEmp = { id, ...data, avatar: null };
    _employees.push(newEmp);
    return clone(newEmp);
  },

  async update(id: string, data: any) {
    await delay(500);
    const idx = _employees.findIndex((e: any) => e.id === id);
    if (idx === -1) throw new Error('Employee not found');
    _employees[idx] = { ..._employees[idx], ...data };
    return clone(_employees[idx]);
  },

  async delete(id: string) {
    await delay(500);
    _employees = _employees.filter((e: any) => e.id !== id);
    return { success: true };
  },

  async getCountByDepartment() {
    await delay();
    const counts: Record<string, number> = {};
    _employees.forEach((e: any) => {
      counts[e.department] = (counts[e.department] || 0) + 1;
    });
    return counts;
  },
};

// ============================================================
// DEPARTMENT SERVICE
// FUTURE API: GET /api/departments
// ============================================================

let _departments = clone(mockDepartments);

export const departmentService = {
  async getAll() {
    await delay();
    return clone(_departments);
  },
  async getById(id: string) {
    await delay();
    return clone(_departments.find((d: any) => d.id === id) || null);
  },
};

// ============================================================
// ATTENDANCE SERVICE
// FUTURE API ENDPOINTS:
//   GET    /api/attendance?date=&employeeId=&department=&status=
//   GET    /api/attendance/:id
//   PUT    /api/attendance/:id
//   DELETE /api/attendance/:id
// ============================================================

let _attendance = clone(mockAttendance);

export const attendanceService = {
  async getAll(filters?: { date?: string; employeeId?: string; department?: string; status?: string; search?: string }) {
    await delay();
    let result = clone(_attendance);

    if (filters?.date) {
      result = result.filter((a: any) => a.date === filters.date);
    }
    if (filters?.employeeId) {
      result = result.filter((a: any) => a.employeeId === filters.employeeId);
    }
    if (filters?.status && filters.status !== 'All') {
      result = result.filter((a: any) => a.status === filters.status);
    }
    if (filters?.department && filters.department !== 'All') {
      const deptEmpIds = _employees.filter((e: any) => e.department === filters.department).map((e: any) => e.id);
      result = result.filter((a: any) => deptEmpIds.includes(a.employeeId));
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      const matchingIds = _employees.filter((e: any) =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(s) || e.id.toLowerCase().includes(s)
      ).map((e: any) => e.id);
      result = result.filter((a: any) => matchingIds.includes(a.employeeId));
    }

    // Enrich with employee names
    return result.map((a: any) => {
      const emp = _employees.find((e: any) => e.id === a.employeeId);
      return { ...a, employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown', department: emp?.department || '' };
    });
  },

  async getByEmployee(employeeId: string) {
    await delay();
    return clone(_attendance.filter((a: any) => a.employeeId === employeeId).sort((a: any, b: any) => b.date.localeCompare(a.date)));
  },

  async update(id: string, data: any) {
    await delay(500);
    const idx = _attendance.findIndex((a: any) => a.id === id);
    if (idx === -1) throw new Error('Record not found');
    _attendance[idx] = { ..._attendance[idx], ...data };
    return clone(_attendance[idx]);
  },

  async delete(id: string) {
    await delay(500);
    _attendance = _attendance.filter((a: any) => a.id !== id);
    return { success: true };
  },

  async getSummary(date?: string) {
    await delay();
    const targetDate = date || '2024-12-16';
    const dayRecords = _attendance.filter((a: any) => a.date === targetDate);
    return {
      present: dayRecords.filter((a: any) => a.status === 'Present').length,
      late: dayRecords.filter((a: any) => a.status === 'Late').length,
      absent: dayRecords.filter((a: any) => a.status === 'Absent').length,
      onLeave: dayRecords.filter((a: any) => a.status === 'On Leave').length,
      halfDay: dayRecords.filter((a: any) => a.status === 'Half Day').length,
      total: dayRecords.length,
    };
  },
};

// ============================================================
// LEAVE SERVICE
// FUTURE API ENDPOINTS:
//   GET    /api/leave?employeeId=&status=
//   POST   /api/leave
//   PUT    /api/leave/:id
//   PUT    /api/leave/:id/approve
//   PUT    /api/leave/:id/reject
//   DELETE /api/leave/:id
// ============================================================

let _leaveRequests = clone(mockLeaveRequests);
let _leaveBalances = clone(mockLeaveBalances);

export const leaveService = {
  async getAll(filters?: { employeeId?: string; status?: string; search?: string; department?: string }) {
    await delay();
    let result = clone(_leaveRequests);

    if (filters?.employeeId) {
      result = result.filter((l: any) => l.employeeId === filters.employeeId);
    }
    if (filters?.status && filters.status !== 'All') {
      result = result.filter((l: any) => l.status === filters.status);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      const matchingIds = _employees.filter((e: any) =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(s)
      ).map((e: any) => e.id);
      result = result.filter((l: any) => matchingIds.includes(l.employeeId));
    }
    if (filters?.department && filters.department !== 'All') {
      const deptEmpIds = _employees.filter((e: any) => e.department === filters.department).map((e: any) => e.id);
      result = result.filter((l: any) => deptEmpIds.includes(l.employeeId));
    }

    // Enrich with employee names
    return result.map((l: any) => {
      const emp = _employees.find((e: any) => e.id === l.employeeId);
      const approver = _employees.find((e: any) => e.id === l.approverId);
      return {
        ...l,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown',
        department: emp?.department || '',
        approverName: approver ? `${approver.firstName} ${approver.lastName}` : '',
      };
    }).sort((a: any, b: any) => b.startDate.localeCompare(a.startDate));
  },

  async getById(id: string) {
    await delay();
    const req = _leaveRequests.find((l: any) => l.id === id);
    return req ? clone(req) : null;
  },

  async create(data: any) {
    await delay(500);
    const id = `LR${String(_leaveRequests.length + 1).padStart(3, '0')}`;
    const newReq = { id, ...data, status: 'Pending', approverId: null, approvedAt: null, comments: '' };
    _leaveRequests.push(newReq);
    return clone(newReq);
  },

  async approve(id: string, comments: string) {
    await delay(500);
    const idx = _leaveRequests.findIndex((l: any) => l.id === id);
    if (idx === -1) throw new Error('Request not found');
    _leaveRequests[idx] = { ..._leaveRequests[idx], status: 'Approved', approvedAt: new Date().toISOString().split('T')[0], comments };
    return clone(_leaveRequests[idx]);
  },

  async reject(id: string, comments: string) {
    await delay(500);
    const idx = _leaveRequests.findIndex((l: any) => l.id === id);
    if (idx === -1) throw new Error('Request not found');
    _leaveRequests[idx] = { ..._leaveRequests[idx], status: 'Rejected', approvedAt: new Date().toISOString().split('T')[0], comments };
    return clone(_leaveRequests[idx]);
  },

  async cancel(id: string) {
    await delay(500);
    const idx = _leaveRequests.findIndex((l: any) => l.id === id);
    if (idx === -1) throw new Error('Request not found');
    _leaveRequests[idx] = { ..._leaveRequests[idx], status: 'Cancelled' };
    return clone(_leaveRequests[idx]);
  },

  async getBalance(employeeId: string) {
    await delay();
    const balance = _leaveBalances.find((b: any) => b.employeeId === employeeId);
    return balance ? clone(balance) : {
      employeeId,
      annualLeave: { total: 20, used: 0, remaining: 20 },
      sickLeave: { total: 10, used: 0, remaining: 10 },
      personalLeave: { total: 5, used: 0, remaining: 5 },
    };
  },
};

// ============================================================
// PERFORMANCE SERVICE
// FUTURE API ENDPOINTS:
//   GET    /api/performance?employeeId=
//   GET    /api/performance/:id
//   POST   /api/performance
//   PUT    /api/performance/:id
// ============================================================

let _performance = clone(mockPerformance);

export const performanceService = {
  async getAll(filters?: { employeeId?: string; status?: string; search?: string }) {
    await delay();
    let result = clone(_performance);

    if (filters?.employeeId) {
      result = result.filter((p: any) => p.employeeId === filters.employeeId);
    }
    if (filters?.status && filters.status !== 'All') {
      result = result.filter((p: any) => p.status === filters.status);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      const matchingIds = _employees.filter((e: any) =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(s)
      ).map((e: any) => e.id);
      result = result.filter((p: any) => matchingIds.includes(p.employeeId));
    }

    return result.map((p: any) => {
      const emp = _employees.find((e: any) => e.id === p.employeeId);
      const reviewer = _employees.find((e: any) => e.id === p.reviewerId);
      return {
        ...p,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown',
        department: emp?.department || '',
        reviewerName: reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : '',
      };
    });
  },

  async getById(id: string) {
    await delay();
    const perf = _performance.find((p: any) => p.id === id);
    return perf ? clone(perf) : null;
  },

  async getByEmployee(employeeId: string) {
    await delay();
    return clone(_performance.filter((p: any) => p.employeeId === employeeId));
  },

  async create(data: any) {
    await delay(500);
    const id = `PERF${String(_performance.length + 1).padStart(3, '0')}`;
    const newPerf = { id, ...data };
    _performance.push(newPerf);
    return clone(newPerf);
  },

  async update(id: string, data: any) {
    await delay(500);
    const idx = _performance.findIndex((p: any) => p.id === id);
    if (idx === -1) throw new Error('Performance review not found');
    _performance[idx] = { ..._performance[idx], ...data };
    return clone(_performance[idx]);
  },
};

// ============================================================
// TRAINING SERVICE
// FUTURE API ENDPOINTS:
//   GET    /api/training
//   GET    /api/training/:id
//   POST   /api/training
//   PUT    /api/training/:id
//   DELETE /api/training/:id
//   POST   /api/training/:id/register
//   POST   /api/training/:id/unregister
// ============================================================

let _training = clone(mockTraining);

export const trainingService = {
  async getAll(filters?: { search?: string; category?: string; status?: string }) {
    await delay();
    let result = clone(_training);

    if (filters?.search) {
      const s = filters.search.toLowerCase();
      result = result.filter((t: any) =>
        t.title.toLowerCase().includes(s) || t.trainer.toLowerCase().includes(s) || t.location.toLowerCase().includes(s)
      );
    }
    if (filters?.category && filters.category !== 'All') {
      result = result.filter((t: any) => t.category === filters.category);
    }
    if (filters?.status && filters.status !== 'All') {
      result = result.filter((t: any) => t.status === filters.status);
    }

    return result.map((t: any) => ({
      ...t,
      registeredCount: t.participants.length,
      availableSeats: t.capacity - t.participants.length,
    }));
  },

  async getById(id: string) {
    await delay();
    const training = _training.find((t: any) => t.id === id);
    if (!training) return null;
    const result = clone(training);
    return {
      ...result,
      registeredCount: result.participants.length,
      availableSeats: result.capacity - result.participants.length,
      participantNames: result.participants.map((pId: string) => {
        const emp = _employees.find((e: any) => e.id === pId);
        return emp ? `${emp.firstName} ${emp.lastName}` : pId;
      }),
    };
  },

  async create(data: any) {
    await delay(500);
    const id = `TRN${String(_training.length + 1).padStart(3, '0')}`;
    const newTraining = { id, ...data, participants: [], status: 'Upcoming' };
    _training.push(newTraining);
    return clone(newTraining);
  },

  async update(id: string, data: any) {
    await delay(500);
    const idx = _training.findIndex((t: any) => t.id === id);
    if (idx === -1) throw new Error('Training not found');
    _training[idx] = { ..._training[idx], ...data };
    return clone(_training[idx]);
  },

  async delete(id: string) {
    await delay(500);
    _training = _training.filter((t: any) => t.id !== id);
    return { success: true };
  },

  async register(trainingId: string, employeeId: string) {
    await delay(500);
    const idx = _training.findIndex((t: any) => t.id === trainingId);
    if (idx === -1) throw new Error('Training not found');
    if (_training[idx].participants.includes(employeeId)) throw new Error('Already registered');
    if (_training[idx].participants.length >= _training[idx].capacity) throw new Error('Training is full');
    _training[idx].participants.push(employeeId);
    return clone(_training[idx]);
  },

  async unregister(trainingId: string, employeeId: string) {
    await delay(500);
    const idx = _training.findIndex((t: any) => t.id === trainingId);
    if (idx === -1) throw new Error('Training not found');
    _training[idx].participants = _training[idx].participants.filter((p: string) => p !== employeeId);
    return clone(_training[idx]);
  },
};

// ============================================================
// EVENT SERVICE
// FUTURE API ENDPOINTS:
//   GET    /api/events
//   GET    /api/events/:id
//   POST   /api/events
//   PUT    /api/events/:id
//   DELETE /api/events/:id
//   POST   /api/events/:id/register
//   POST   /api/events/:id/unregister
//   GET    /api/events/:id/registrations
// ============================================================

let _events = clone(mockEvents);

export const eventService = {
  async getAll(filters?: { search?: string; category?: string; status?: string }) {
    await delay();
    let result = clone(_events);

    if (filters?.search) {
      const s = filters.search.toLowerCase();
      result = result.filter((e: any) =>
        e.title.toLowerCase().includes(s) || e.organizer.toLowerCase().includes(s) || e.location.toLowerCase().includes(s)
      );
    }
    if (filters?.category && filters.category !== 'All') {
      result = result.filter((e: any) => e.category === filters.category);
    }
    if (filters?.status && filters.status !== 'All') {
      result = result.filter((e: any) => e.status === filters.status);
    }

    return result.map((e: any) => ({
      ...e,
      registeredCount: e.registeredIds.length,
      availableSeats: e.capacity - e.registeredIds.length,
    }));
  },

  async getById(id: string) {
    await delay();
    const event = _events.find((e: any) => e.id === id);
    if (!event) return null;
    const result = clone(event);
    return {
      ...result,
      registeredCount: result.registeredIds.length,
      availableSeats: result.capacity - result.registeredIds.length,
      registrantNames: result.registeredIds.map((eId: string) => {
        const emp = _employees.find((e: any) => e.id === eId);
        return emp ? { id: eId, name: `${emp.firstName} ${emp.lastName}`, department: emp.department } : { id: eId, name: eId, department: '' };
      }),
    };
  },

  async create(data: any) {
    await delay(500);
    const id = `EVT${String(_events.length + 1).padStart(3, '0')}`;
    const newEvent = { id, ...data, registeredIds: [], status: 'Upcoming' };
    _events.push(newEvent);
    return clone(newEvent);
  },

  async update(id: string, data: any) {
    await delay(500);
    const idx = _events.findIndex((e: any) => e.id === id);
    if (idx === -1) throw new Error('Event not found');
    _events[idx] = { ..._events[idx], ...data };
    return clone(_events[idx]);
  },

  async delete(id: string) {
    await delay(500);
    _events = _events.filter((e: any) => e.id !== id);
    return { success: true };
  },

  // Register for an event - updates capacity logic through state
  async register(eventId: string, employeeId: string) {
    await delay(500);
    const idx = _events.findIndex((e: any) => e.id === eventId);
    if (idx === -1) throw new Error('Event not found');
    if (_events[idx].registeredIds.includes(employeeId)) throw new Error('Already registered');
    if (_events[idx].registeredIds.length >= _events[idx].capacity) throw new Error('Event is full');
    _events[idx].registeredIds.push(employeeId);
    return clone(_events[idx]);
  },

  // Cancel event registration - updates capacity logic through state
  async unregister(eventId: string, employeeId: string) {
    await delay(500);
    const idx = _events.findIndex((e: any) => e.id === eventId);
    if (idx === -1) throw new Error('Event not found');
    _events[idx].registeredIds = _events[idx].registeredIds.filter((id: string) => id !== employeeId);
    return clone(_events[idx]);
  },

  async getRegistrations(eventId: string) {
    await delay();
    const event = _events.find((e: any) => e.id === eventId);
    if (!event) return [];
    return event.registeredIds.map((eId: string) => {
      const emp = _employees.find((e: any) => e.id === eId);
      return emp ? { id: eId, name: `${emp.firstName} ${emp.lastName}`, department: emp.department, email: emp.email } : { id: eId, name: eId, department: '', email: '' };
    });
  },
};

// ============================================================
// GRIEVANCE SERVICE
// FUTURE API ENDPOINTS:
//   GET    /api/grievances
//   GET    /api/grievances/:id
//   POST   /api/grievances
//   PUT    /api/grievances/:id
//   POST   /api/grievances/:id/respond
// ============================================================

let _grievances = clone(mockGrievances);

export const grievanceService = {
  async getAll(filters?: { employeeId?: string; status?: string; priority?: string; category?: string; search?: string }) {
    await delay();
    let result = clone(_grievances);

    if (filters?.employeeId) {
      result = result.filter((g: any) => g.employeeId === filters.employeeId);
    }
    if (filters?.status && filters.status !== 'All') {
      result = result.filter((g: any) => g.status === filters.status);
    }
    if (filters?.priority && filters.priority !== 'All') {
      result = result.filter((g: any) => g.priority === filters.priority);
    }
    if (filters?.category && filters.category !== 'All') {
      result = result.filter((g: any) => g.category === filters.category);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      result = result.filter((g: any) => g.description.toLowerCase().includes(s) || g.category.toLowerCase().includes(s));
    }

    return result.map((g: any) => {
      const emp = _employees.find((e: any) => e.id === g.employeeId);
      const assignee = _employees.find((e: any) => e.id === g.assignedTo);
      return {
        ...g,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown',
        department: emp?.department || '',
        assignedToName: assignee ? `${assignee.firstName} ${assignee.lastName}` : 'Unassigned',
      };
    }).sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
  },

  async getById(id: string) {
    await delay();
    const grv = _grievances.find((g: any) => g.id === id);
    if (!grv) return null;
    const emp = _employees.find((e: any) => e.id === grv.employeeId);
    const assignee = _employees.find((e: any) => e.id === grv.assignedTo);
    return {
      ...clone(grv),
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown',
      department: emp?.department || '',
      assignedToName: assignee ? `${assignee.firstName} ${assignee.lastName}` : 'Unassigned',
    };
  },

  async create(data: any) {
    await delay(500);
    const id = `GRV${String(_grievances.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString().split('T')[0];
    const newGrv = { id, ...data, status: 'New', assignedTo: null, responses: [], createdAt: now, updatedAt: now };
    _grievances.push(newGrv);
    return clone(newGrv);
  },

  async updateStatus(id: string, status: string, assignedTo?: string) {
    await delay(500);
    const idx = _grievances.findIndex((g: any) => g.id === id);
    if (idx === -1) throw new Error('Grievance not found');
    _grievances[idx] = {
      ..._grievances[idx],
      status,
      ...(assignedTo ? { assignedTo } : {}),
      updatedAt: new Date().toISOString().split('T')[0],
    };
    return clone(_grievances[idx]);
  },

  async addResponse(id: string, responderId: string, text: string) {
    await delay(500);
    const idx = _grievances.findIndex((g: any) => g.id === id);
    if (idx === -1) throw new Error('Grievance not found');
    (_grievances[idx].responses as any[]).push({
      responderId,
      text,
      date: new Date().toISOString().split('T')[0],
    });
    _grievances[idx].updatedAt = new Date().toISOString().split('T')[0];
    return clone(_grievances[idx]);
  },
};

// ============================================================
// NOTIFICATION SERVICE
// FUTURE API ENDPOINTS:
//   GET    /api/notifications
//   PUT    /api/notifications/:id/read
//   PUT    /api/notifications/read-all
//   DELETE /api/notifications/:id
// ============================================================

let _notifications = clone(mockNotifications);

export const notificationService = {
  async getAll(userId: string, filters?: { type?: string; read?: boolean }) {
    await delay();
    let result = clone(_notifications.filter((n: any) => n.userId === userId));

    if (filters?.type && filters.type !== 'All') {
      result = result.filter((n: any) => n.type === filters.type);
    }
    if (filters?.read !== undefined) {
      result = result.filter((n: any) => n.read === filters.read);
    }

    return result.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
  },

  async getUnreadCount(userId: string) {
    await delay(100);
    return _notifications.filter((n: any) => n.userId === userId && !n.read).length;
  },

  async markAsRead(id: string) {
    await delay(200);
    const idx = _notifications.findIndex((n: any) => n.id === id);
    if (idx !== -1) _notifications[idx].read = true;
    return { success: true };
  },

  async markAllAsRead(userId: string) {
    await delay(300);
    _notifications.forEach((n: any) => {
      if (n.userId === userId) n.read = true;
    });
    return { success: true };
  },

  async addNotification(data: any) {
    await delay(200);
    const id = `NTF${String(_notifications.length + 1).padStart(3, '0')}`;
    const newNotif = { id, ...data, read: false, createdAt: new Date().toISOString() };
    _notifications.push(newNotif);
    return clone(newNotif);
  },
};

// ============================================================
// DASHBOARD SERVICE
// FUTURE API: GET /api/dashboard (role-specific stats)
// ============================================================

export const dashboardService = {
  async getStats() {
    await delay();
    return clone(mockDashboardStats);
  },

  async getHRDashboard() {
    await delay();
    const today = '2024-12-16';
    const dayAttendance = _attendance.filter((a: any) => a.date === today);
    const pendingLeaves = _leaveRequests.filter((l: any) => l.status === 'Pending').length;
    const openGrievances = _grievances.filter((g: any) => g.status === 'New' || g.status === 'Under Review').length;
    const activeTraining = _training.filter((t: any) => t.status === 'Upcoming').length;
    const upcomingEvents = _events.filter((e: any) => e.status === 'Upcoming').length;

    return {
      totalEmployees: _employees.length,
      presentToday: dayAttendance.filter((a: any) => a.status === 'Present').length,
      lateToday: dayAttendance.filter((a: any) => a.status === 'Late').length,
      absentToday: dayAttendance.filter((a: any) => a.status === 'Absent').length,
      onLeaveToday: dayAttendance.filter((a: any) => a.status === 'On Leave').length,
      pendingLeaveRequests: pendingLeaves,
      openGrievances,
      activeTraining,
      upcomingEvents,
      avgPerformance: 3.9,
      // Attendance trend data for charts
      attendanceTrend: [
        { date: 'Dec 10', present: 22, late: 2, absent: 1, leave: 1 },
        { date: 'Dec 11', present: 21, late: 3, absent: 1, leave: 1 },
        { date: 'Dec 12', present: 23, late: 1, absent: 0, leave: 2 },
        { date: 'Dec 13', present: 20, late: 2, absent: 2, leave: 2 },
        { date: 'Dec 15', present: 22, late: 2, absent: 1, leave: 1 },
        { date: 'Dec 16', present: 18, late: 3, absent: 1, leave: 4 },
      ],
      leaveDistribution: [
        { name: 'Annual Leave', value: 45 },
        { name: 'Sick Leave', value: 25 },
        { name: 'Personal Leave', value: 15 },
        { name: 'Maternity Leave', value: 5 },
        { name: 'Unpaid Leave', value: 10 },
      ],
      recentActivity: [
        { id: 1, type: 'leave', message: 'James Wilson requested annual leave', time: '2 hours ago' },
        { id: 2, type: 'attendance', message: 'Kevin O\'Brien marked absent', time: '3 hours ago' },
        { id: 3, type: 'grievance', message: 'New grievance filed by Lauren White', time: '4 hours ago' },
        { id: 4, type: 'training', message: 'React Advanced Patterns - 5 registered', time: '5 hours ago' },
        { id: 5, type: 'event', message: 'Year-End Celebration - 15 registered', time: '6 hours ago' },
      ],
    };
  },

  async getEmployeeDashboard(employeeId: string) {
    await delay();
    const empAttendance = _attendance.filter((a: any) => a.employeeId === employeeId);
    const empLeave = _leaveRequests.filter((l: any) => l.employeeId === employeeId);
    const empTraining = _training.filter((t: any) => t.participants.includes(employeeId));
    const empEvents = _events.filter((e: any) => e.registeredIds.includes(employeeId));
    const empGrievances = _grievances.filter((g: any) => g.employeeId === employeeId);

    const todayAtt = empAttendance.find((a: any) => a.date === '2024-12-16');

    return {
      todayAttendance: todayAtt || null,
      attendanceSummary: {
        present: empAttendance.filter((a: any) => a.status === 'Present').length,
        late: empAttendance.filter((a: any) => a.status === 'Late').length,
        absent: empAttendance.filter((a: any) => a.status === 'Absent').length,
        onLeave: empAttendance.filter((a: any) => a.status === 'On Leave').length,
      },
      recentLeaveRequests: empLeave.slice(0, 3),
      upcomingTraining: empTraining.filter((t: any) => t.status === 'Upcoming'),
      upcomingEvents: empEvents.filter((e: any) => e.status === 'Upcoming'),
      openGrievances: empGrievances.filter((g: any) => g.status !== 'Resolved' && g.status !== 'Closed'),
      leaveBalance: _leaveBalances.find((b: any) => b.employeeId === employeeId) || {
        annualLeave: { total: 20, used: 0, remaining: 20 },
        sickLeave: { total: 10, used: 0, remaining: 10 },
        personalLeave: { total: 5, used: 0, remaining: 5 },
      },
    };
  },

  async getDeptManagerDashboard(department: string) {
    await delay();
    const deptEmps = _employees.filter((e: any) => e.department === department);
    const deptEmpIds = deptEmps.map((e: any) => e.id);
    const todayAtt = _attendance.filter((a: any) => a.date === '2024-12-16' && deptEmpIds.includes(a.employeeId));
    const pendingLeaves = _leaveRequests.filter((l: any) => deptEmpIds.includes(l.employeeId) && l.status === 'Pending');

    return {
      department,
      totalEmployees: deptEmps.length,
      presentToday: todayAtt.filter((a: any) => a.status === 'Present').length,
      lateToday: todayAtt.filter((a: any) => a.status === 'Late').length,
      absentToday: todayAtt.filter((a: any) => a.status === 'Absent' || a.status === 'On Leave').length,
      pendingLeaveRequests: pendingLeaves.length,
      pendingLeaveList: pendingLeaves.map((l: any) => {
        const emp = _employees.find((e: any) => e.id === l.employeeId);
        return { ...l, employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown' };
      }),
      employees: deptEmps,
      assignedGrievances: _grievances.filter((g: any) => g.assignedTo && deptEmpIds.includes(g.employeeId) && g.status !== 'Resolved' && g.status !== 'Closed'),
    };
  },

  async getTrainingCoordDashboard() {
    await delay();
    return {
      activeTraining: _training.filter((t: any) => t.status === 'Upcoming').length,
      completedTraining: _training.filter((t: any) => t.status === 'Completed').length,
      totalParticipants: _training.reduce((sum: number, t: any) => sum + t.participants.length, 0),
      totalCapacity: _training.reduce((sum: number, t: any) => sum + t.capacity, 0),
      trainingList: _training.map((t: any) => ({
        ...t,
        registeredCount: t.participants.length,
        availableSeats: t.capacity - t.participants.length,
      })),
    };
  },

  async getEventOrganizerDashboard() {
    await delay();
    return {
      totalEvents: _events.length,
      upcomingEvents: _events.filter((e: any) => e.status === 'Upcoming').length,
      completedEvents: _events.filter((e: any) => e.status === 'Completed').length,
      totalRegistrations: _events.reduce((sum: number, e: any) => sum + e.registeredIds.length, 0),
      totalCapacity: _events.reduce((sum: number, e: any) => sum + e.capacity, 0),
      eventList: _events.map((e: any) => ({
        ...e,
        registeredCount: e.registeredIds.length,
        availableSeats: e.capacity - e.registeredIds.length,
      })),
    };
  },

  async getGrievanceOfficerDashboard() {
    await delay();
    return {
      newGrievances: _grievances.filter((g: any) => g.status === 'New').length,
      underReview: _grievances.filter((g: any) => g.status === 'Under Review').length,
      assigned: _grievances.filter((g: any) => g.status === 'Assigned').length,
      resolved: _grievances.filter((g: any) => g.status === 'Resolved').length,
      highPriority: _grievances.filter((g: any) => g.priority === 'High' || g.priority === 'Critical').length,
      grievanceList: _grievances.map((g: any) => {
        const emp = _employees.find((e: any) => e.id === g.employeeId);
        return { ...g, employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown' };
      }),
    };
  },
};
