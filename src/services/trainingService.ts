// ============================================================
// TRAINING SERVICE
// ============================================================
// DEVELOPMENT ONLY
//
// This service is intentionally frontend/mock based for Part 1.
//
// Later this file can be replaced with API calls:
//
// GET    /api/training
// GET    /api/training/:id
// POST   /api/training
// PUT    /api/training/:id
// DELETE /api/training/:id
//
// POST   /api/training/:id/register
// DELETE /api/training/:id/register
//
// POST   /api/training/:id/assign
// DELETE /api/training/:id/assign/:employeeId
//
// The React UI should not need major changes when the backend
// is connected.
// ============================================================

export type TrainingStatus =
  | 'Upcoming'
  | 'Ongoing'
  | 'Completed'
  | 'Cancelled';

export interface TrainingEmployee {
  id: string;
  employeeNumber: string;
  name: string;
  department: string;
  position: string;
  email: string;
  assignmentStatus?: 'Assigned' | 'Not Assigned';
  registrationStatus?: 'Registered' | 'Not Registered';
  attendanceStatus?: 'Present' | 'Absent' | 'Pending';
  completionStatus?: 'Completed' | 'Not Completed' | 'Pending';
}

export interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  trainer: string;
  category: string;
  startDate: string;
  endDate?: string;
  location: string;
  capacity: number;
  trainingFor: string[];

  status: TrainingStatus;

  assignedEmployeeIds: string[];
  registeredEmployeeIds: string[];

  attendance: Record<string, 'Present' | 'Absent' | 'Pending'>;
  completion: Record<string, 'Completed' | 'Not Completed' | 'Pending'>;
}

export interface TrainingFilters {
  search?: string;
  category?: string;
  status?: string;
}

const mockEmployees: TrainingEmployee[] = [
  {
    id: 'EMP001',
    employeeNumber: 'EMP001',
    name: 'John Perera',
    department: 'IT',
    position: 'Software Engineer',
    email: 'john.perera@staffhub.com',
  },
  {
    id: 'EMP002',
    employeeNumber: 'EMP002',
    name: 'Sarah Silva',
    department: 'HR',
    position: 'HR Executive',
    email: 'sarah.silva@staffhub.com',
  },
  {
    id: 'EMP003',
    employeeNumber: 'EMP003',
    name: 'David Fernando',
    department: 'IT',
    position: 'System Engineer',
    email: 'david.fernando@staffhub.com',
  },
  {
    id: 'EMP004',
    employeeNumber: 'EMP004',
    name: 'Amal Perera',
    department: 'Finance',
    position: 'Finance Executive',
    email: 'amal.perera@staffhub.com',
  },
  {
    id: 'EMP005',
    employeeNumber: 'EMP005',
    name: 'Nadeesha Fernando',
    department: 'HR',
    position: 'HR Manager',
    email: 'nadeesha.fernando@staffhub.com',
  },
  {
    id: 'EMP006',
    employeeNumber: 'EMP006',
    name: 'Kasun Silva',
    department: 'IT',
    position: 'Frontend Developer',
    email: 'kasun.silva@staffhub.com',
  },
  {
    id: 'EMP007',
    employeeNumber: 'EMP007',
    name: 'Dilshan Perera',
    department: 'Marketing',
    position: 'Marketing Executive',
    email: 'dilshan.perera@staffhub.com',
  },
  {
    id: 'EMP008',
    employeeNumber: 'EMP008',
    name: 'Tharushi Silva',
    department: 'IT',
    position: 'QA Engineer',
    email: 'tharushi.silva@staffhub.com',
  },
  {
    id: 'EMP009',
    employeeNumber: 'EMP009',
    name: 'Chamath Fernando',
    department: 'HR',
    position: 'HR Assistant',
    email: 'chamath.fernando@staffhub.com',
  },
  {
    id: 'EMP010',
    employeeNumber: 'EMP010',
    name: 'Isuru Perera',
    department: 'Finance',
    position: 'Accountant',
    email: 'isuru.perera@staffhub.com',
  },
];

let trainingPrograms: TrainingProgram[] = [
  {
    id: 'TRN001',
    title: 'Advanced Cybersecurity Awareness',
    description:
      'Practical cybersecurity awareness training covering secure passwords, phishing, data protection and common workplace threats.',
    trainer: 'John Silva',
    category: 'Technical',
    startDate: '2026-09-20',
    endDate: '2026-09-20',
    location: 'Training Room 01',
    capacity: 30,
    trainingFor: ['IT', 'HR'],
    status: 'Upcoming',

    assignedEmployeeIds: [
      'EMP001',
      'EMP002',
      'EMP003',
      'EMP005',
      'EMP006',
      'EMP008',
    ],

    registeredEmployeeIds: [
      'EMP001',
      'EMP002',
      'EMP003',
      'EMP005',
    ],

    attendance: {},
    completion: {},
  },

  {
    id: 'TRN002',
    title: 'Leadership & Team Management',
    description:
      'Leadership skills, communication, delegation and practical team management techniques for future and current team leaders.',
    trainer: 'Nadeesha Fernando',
    category: 'Leadership',
    startDate: '2026-10-05',
    endDate: '2026-10-06',
    location: 'Conference Room A',
    capacity: 20,
    trainingFor: ['HR', 'IT', 'Management'],
    status: 'Upcoming',

    assignedEmployeeIds: [
      'EMP001',
      'EMP003',
      'EMP005',
      'EMP007',
    ],

    registeredEmployeeIds: [
      'EMP001',
      'EMP005',
    ],

    attendance: {},
    completion: {},
  },

  {
    id: 'TRN003',
    title: 'Workplace Communication',
    description:
      'Improve professional communication, collaboration, conflict handling and effective workplace conversations.',
    trainer: 'Sarah Silva',
    category: 'Soft Skills',
    startDate: '2026-08-10',
    endDate: '2026-08-10',
    location: 'Training Room 02',
    capacity: 25,
    trainingFor: ['IT', 'HR', 'Finance', 'Marketing'],
    status: 'Completed',

    assignedEmployeeIds: [
      'EMP001',
      'EMP002',
      'EMP004',
      'EMP006',
      'EMP007',
    ],

    registeredEmployeeIds: [
      'EMP001',
      'EMP002',
      'EMP004',
      'EMP006',
    ],

    attendance: {
      EMP001: 'Present',
      EMP002: 'Present',
      EMP004: 'Absent',
      EMP006: 'Present',
    },

    completion: {
      EMP001: 'Completed',
      EMP002: 'Completed',
      EMP004: 'Not Completed',
      EMP006: 'Completed',
    },
  },

  {
    id: 'TRN004',
    title: 'React & Modern Frontend Development',
    description:
      'Modern React development including component design, hooks, state management and reusable frontend architecture.',
    trainer: 'Kasun Silva',
    category: 'Technical',
    startDate: '2026-09-28',
    endDate: '',
    location: 'IT Lab 01',
    capacity: 15,
    trainingFor: ['IT'],
    status: 'Upcoming',

    assignedEmployeeIds: [
      'EMP001',
      'EMP003',
      'EMP006',
      'EMP008',
    ],

    registeredEmployeeIds: [
      'EMP003',
      'EMP006',
    ],

    attendance: {},
    completion: {},
  },

  {
    id: 'TRN005',
    title: 'Employee Performance Management',
    description:
      'Understanding performance reviews, objectives, feedback, development plans and employee performance discussions.',
    trainer: 'Nadeesha Fernando',
    category: 'HR',
    startDate: '2026-07-15',
    endDate: '2026-07-15',
    location: 'HR Training Room',
    capacity: 20,
    trainingFor: ['HR', 'Management'],
    status: 'Completed',

    assignedEmployeeIds: [
      'EMP002',
      'EMP005',
      'EMP009',
    ],

    registeredEmployeeIds: [
      'EMP002',
      'EMP005',
      'EMP009',
    ],

    attendance: {
      EMP002: 'Present',
      EMP005: 'Present',
      EMP009: 'Present',
    },

    completion: {
      EMP002: 'Completed',
      EMP005: 'Completed',
      EMP009: 'Completed',
    },
  },

  {
    id: 'TRN006',
    title: 'Advanced Excel for Business',
    description:
      'Advanced Excel formulas, reporting, data analysis and practical spreadsheet techniques for business users.',
    trainer: 'Amal Perera',
    category: 'Technical',
    startDate: '2026-10-15',
    endDate: '2026-10-16',
    location: 'Computer Lab 02',
    capacity: 25,
    trainingFor: ['Finance', 'HR', 'Marketing'],
    status: 'Upcoming',

    assignedEmployeeIds: [
      'EMP002',
      'EMP004',
      'EMP007',
      'EMP009',
      'EMP010',
    ],

    registeredEmployeeIds: [
      'EMP004',
      'EMP007',
    ],

    attendance: {},
    completion: {},
  },
];

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

function enrichProgram(program: TrainingProgram) {
  const registeredCount = program.registeredEmployeeIds.length;
  const assignedCount = program.assignedEmployeeIds.length;

  return {
    ...clone(program),
    registeredCount,
    assignedCount,
    notRegisteredCount: Math.max(assignedCount - registeredCount, 0),
    availableSeats: Math.max(program.capacity - registeredCount, 0),
  };
}

function getEmployee(employeeId: string) {
  return mockEmployees.find((employee) => employee.id === employeeId);
}

// ------------------------------------------------------------
// Service
// ------------------------------------------------------------

export const trainingService = {
  async getAll(filters?: TrainingFilters) {
    let result = trainingPrograms.map(enrichProgram);

    if (filters?.search) {
      const search = filters.search.toLowerCase();

      result = result.filter((training) => {
        return (
          training.title.toLowerCase().includes(search) ||
          training.trainer.toLowerCase().includes(search) ||
          training.category.toLowerCase().includes(search) ||
          training.location.toLowerCase().includes(search) ||
          training.trainingFor.some((department) =>
            department.toLowerCase().includes(search)
          )
        );
      });
    }

    if (filters?.category && filters.category !== 'All') {
      result = result.filter(
        (training) => training.category === filters.category
      );
    }

    if (filters?.status && filters.status !== 'All') {
      result = result.filter(
        (training) => training.status === filters.status
      );
    }

    return clone(result);
  },

  async getById(id: string) {
    const training = trainingPrograms.find(
      (program) => program.id === id
    );

    return training ? clone(enrichProgram(training)) : null;
  },

  async create(data: Omit<
    TrainingProgram,
    | 'id'
    | 'assignedEmployeeIds'
    | 'registeredEmployeeIds'
    | 'attendance'
    | 'completion'
  >) {
    const id = `TRN${String(trainingPrograms.length + 1).padStart(3, '0')}`;

    const newTraining: TrainingProgram = {
      ...data,
      id,
      assignedEmployeeIds: [],
      registeredEmployeeIds: [],
      attendance: {},
      completion: {},
    };

    trainingPrograms.push(newTraining);

    return clone(enrichProgram(newTraining));
  },

  async update(
    id: string,
    data: Partial<
      Omit<
        TrainingProgram,
        | 'id'
        | 'assignedEmployeeIds'
        | 'registeredEmployeeIds'
        | 'attendance'
        | 'completion'
      >
    >
  ) {
    const index = trainingPrograms.findIndex(
      (program) => program.id === id
    );

    if (index === -1) {
      throw new Error('Training program not found');
    }

    trainingPrograms[index] = {
      ...trainingPrograms[index],
      ...data,
    };

    return clone(enrichProgram(trainingPrograms[index]));
  },

  async delete(id: string) {
    const training = trainingPrograms.find(
      (program) => program.id === id
    );

    if (!training) {
      throw new Error('Training program not found');
    }

    if (training.registeredEmployeeIds.length > 0) {
      throw new Error(
        'This training has registered employees. Cancel it instead of deleting it.'
      );
    }

    trainingPrograms = trainingPrograms.filter(
      (program) => program.id !== id
    );

    return { success: true };
  },

  async register(trainingId: string, employeeId: string) {
    const index = trainingPrograms.findIndex(
      (program) => program.id === trainingId
    );

    if (index === -1) {
      throw new Error('Training program not found');
    }

    const training = trainingPrograms[index];

    if (training.status !== 'Upcoming') {
      throw new Error(
        'Registration is only available for upcoming training.'
      );
    }

    if (!training.assignedEmployeeIds.includes(employeeId)) {
      throw new Error(
        'You must be assigned to this training before registering.'
      );
    }

    if (training.registeredEmployeeIds.includes(employeeId)) {
      throw new Error('You are already registered.');
    }

    if (
      training.registeredEmployeeIds.length >=
      training.capacity
    ) {
      throw new Error('This training is full.');
    }

    training.registeredEmployeeIds.push(employeeId);

    return clone(enrichProgram(training));
  },

  async unregister(trainingId: string, employeeId: string) {
    const index = trainingPrograms.findIndex(
      (program) => program.id === trainingId
    );

    if (index === -1) {
      throw new Error('Training program not found');
    }

    trainingPrograms[index].registeredEmployeeIds =
      trainingPrograms[index].registeredEmployeeIds.filter(
        (id) => id !== employeeId
      );

    return clone(enrichProgram(trainingPrograms[index]));
  },

  async assignEmployees(
    trainingId: string,
    employeeIds: string[]
  ) {
    const index = trainingPrograms.findIndex(
      (program) => program.id === trainingId
    );

    if (index === -1) {
      throw new Error('Training program not found');
    }

    const training = trainingPrograms[index];

    const uniqueIds = Array.from(
      new Set([
        ...training.assignedEmployeeIds,
        ...employeeIds,
      ])
    );

    training.assignedEmployeeIds = uniqueIds;

    return clone(enrichProgram(training));
  },

  async removeAssignment(
    trainingId: string,
    employeeId: string
  ) {
    const index = trainingPrograms.findIndex(
      (program) => program.id === trainingId
    );

    if (index === -1) {
      throw new Error('Training program not found');
    }

    const training = trainingPrograms[index];

    training.assignedEmployeeIds =
      training.assignedEmployeeIds.filter(
        (id) => id !== employeeId
      );

    training.registeredEmployeeIds =
      training.registeredEmployeeIds.filter(
        (id) => id !== employeeId
      );

    delete training.attendance[employeeId];
    delete training.completion[employeeId];

    return clone(enrichProgram(training));
  },

  async getEmployees(trainingId: string) {
    const training = trainingPrograms.find(
      (program) => program.id === trainingId
    );

    if (!training) {
      throw new Error('Training program not found');
    }

    return training.assignedEmployeeIds.map((employeeId) => {
      const employee = getEmployee(employeeId);

      return {
        ...(employee || {
          id: employeeId,
          employeeNumber: employeeId,
          name: employeeId,
          department: 'Unknown',
          position: '',
          email: '',
        }),

        assignmentStatus: 'Assigned',
        registrationStatus:
          training.registeredEmployeeIds.includes(employeeId)
            ? 'Registered'
            : 'Not Registered',

        attendanceStatus:
          training.attendance[employeeId] || 'Pending',

        completionStatus:
          training.completion[employeeId] || 'Pending',
      };
    });
  },

  async getAllEmployees() {
    return clone(mockEmployees);
  },

  async updateAttendance(
    trainingId: string,
    employeeId: string,
    status: 'Present' | 'Absent' | 'Pending'
  ) {
    const training = trainingPrograms.find(
      (program) => program.id === trainingId
    );

    if (!training) {
      throw new Error('Training program not found');
    }

    training.attendance[employeeId] = status;

    return clone(training);
  },

  async updateCompletion(
    trainingId: string,
    employeeId: string,
    status: 'Completed' | 'Not Completed' | 'Pending'
  ) {
    const training = trainingPrograms.find(
      (program) => program.id === trainingId
    );

    if (!training) {
      throw new Error('Training program not found');
    }

    training.completion[employeeId] = status;

    return clone(training);
  },
};