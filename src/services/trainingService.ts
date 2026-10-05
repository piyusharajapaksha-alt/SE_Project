import { apiRequest } from './apiClient';

/* =========================================================
   TYPES
   ========================================================= */

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

  assignmentStatus?:
    | 'Assigned'
    | 'Not Assigned';

  registrationStatus?:
    | 'Registered'
    | 'Not Registered';

  attendanceStatus?:
    | 'Present'
    | 'Absent'
    | 'Pending';

  completionStatus?:
    | 'Completed'
    | 'Not Completed'
    | 'Pending';
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

  attendance: Record<
    string,
    'Present' | 'Absent' | 'Pending'
  >;

  completion: Record<
    string,
    'Completed' | 'Not Completed' | 'Pending'
  >;

  registeredCount?: number;
  assignedCount?: number;
  notRegisteredCount?: number;
  availableSeats?: number;
}

/* =========================================================
   BACKEND TYPES
   ========================================================= */

interface TrainingApiResponse {
  id: number | string;

  title?: string | null;
  description?: string | null;

  trainer?: string | null;
  category?: string | null;

  startDate?: string | null;
  endDate?: string | null;

  location?: string | null;
  capacity?: number | null;

  trainingFor?: string[] | null;

  status?: TrainingStatus | string | null;

  assignedEmployeeIds?: string[] | null;
  registeredEmployeeIds?: string[] | null;

  attendance?: Record<
    string,
    'Present' | 'Absent' | 'Pending'
  > | null;

  completion?: Record<
    string,
    'Completed' | 'Not Completed' | 'Pending'
  > | null;
}

/* =========================================================
   EMPLOYEE API TYPE
   ========================================================= */

interface EmployeeApiResponse {
  id?: number | string;

  employeeNumber?: string;
  employee_number?: string;

  firstName?: string;
  first_name?: string;

  lastName?: string;
  last_name?: string;

  email?: string;

  department?: string;
  position?: string;
}

/* =========================================================
   HELPERS
   ========================================================= */

const normalizeDepartments = (
  departments?: string[]
): string[] => {

  if (!Array.isArray(departments)) {
    return [];
  }

  const normalized: string[] = [];

  for (const department of departments) {

    if (
      typeof department !== 'string'
    ) {
      continue;
    }

    const value =
      department.trim();

    if (!value) {
      continue;
    }

    const duplicate =
      normalized.some(
        existing =>
          existing.toLowerCase() ===
          value.toLowerCase()
      );

    if (!duplicate) {
      normalized.push(value);
    }
  }

  return normalized;
};

/* =========================================================
   NORMALIZE EMPLOYEE IDS
   ========================================================= */

const normalizeEmployeeIds = (
  employeeIds?: string[]
): string[] => {

  if (!Array.isArray(employeeIds)) {
    return [];
  }

  const normalized: string[] = [];

  for (const employeeId of employeeIds) {

    if (
      typeof employeeId !== 'string'
    ) {
      continue;
    }

    const value =
      employeeId.trim();

    if (!value) {
      continue;
    }

    if (!normalized.includes(value)) {
      normalized.push(value);
    }
  }

  return normalized;
};

/* =========================================================
   NORMALIZE STATUS
   ========================================================= */

const normalizeStatus = (
  status?: string | null
): TrainingStatus => {

  switch (
    status?.trim().toLowerCase()
  ) {

    case 'upcoming':
      return 'Upcoming';

    case 'ongoing':
      return 'Ongoing';

    case 'completed':
      return 'Completed';

    case 'cancelled':
      return 'Cancelled';

    default:
      return 'Upcoming';
  }
};

/* =========================================================
   MAP TRAINING PROGRAM
   ========================================================= */

const mapTrainingProgram = (
  program: TrainingApiResponse
): TrainingProgram => {

  const assignedEmployeeIds =
    normalizeEmployeeIds(
      program.assignedEmployeeIds ?? []
    );

  const registeredEmployeeIds =
    normalizeEmployeeIds(
      program.registeredEmployeeIds ?? []
    );

  const capacity =
    Number(
      program.capacity ?? 0
    );

  return {
    id:
      String(program.id),

    title:
      program.title ?? '',

    description:
      program.description ?? '',

    trainer:
      program.trainer ?? '',

    category:
      program.category ?? '',

    startDate:
      program.startDate ?? '',

    endDate:
      program.endDate ?? '',

    location:
      program.location ?? '',

    capacity,

    trainingFor:
      normalizeDepartments(
        program.trainingFor ?? []
      ),

    status:
      normalizeStatus(
        program.status
      ),

    assignedEmployeeIds,

    registeredEmployeeIds,

    attendance:
      program.attendance ?? {},

    completion:
      program.completion ?? {},
  };
};

/* =========================================================
   ENRICH TRAINING
   ========================================================= */

const enrichProgram = (
  program: TrainingProgram
): TrainingProgram => {

  const registeredCount =
    program.registeredEmployeeIds.length;

  const assignedCount =
    program.assignedEmployeeIds.length;

  const availableSeats =
    Math.max(
      0,
      program.capacity -
        registeredCount
    );

  const notRegisteredCount =
    Math.max(
      0,
      program.capacity -
        registeredCount
    );

  return {
    ...program,

    registeredCount,

    assignedCount,

    notRegisteredCount,

    availableSeats,
  };
};

/* =========================================================
   MAP EMPLOYEE
   ========================================================= */

const mapEmployee = (
  employee: EmployeeApiResponse
): TrainingEmployee => {

  const employeeNumber =
    String(
      employee.employeeNumber ??
      employee.employee_number ??
      employee.id ??
      ''
    ).trim();

  const firstName =
    employee.firstName ??
    employee.first_name ??
    '';

  const lastName =
    employee.lastName ??
    employee.last_name ??
    '';

  return {
    /*
     * IMPORTANT:
     *
     * Training assignments use employee_number,
     * not the database numeric employee ID.
     */
    id:
      employeeNumber,

    employeeNumber,

    name:
      `${firstName} ${lastName}`
        .trim(),

    department:
      employee.department ?? '',

    position:
      employee.position ?? '',

    email:
      employee.email ?? '',
  };
};

/* =========================================================
   MAP TRAINING EMPLOYEE
   ========================================================= */

const mapTrainingEmployee = (
  employee: any
): TrainingEmployee => {

  const employeeNumber =
    String(
      employee.employee_number ??
      employee.employeeNumber ??
      employee.id ??
      ''
    ).trim();

  const firstName =
    employee.first_name ??
    employee.firstName ??
    '';

  const lastName =
    employee.last_name ??
    employee.lastName ??
    '';

  return {
    id:
      employeeNumber,

    employeeNumber,

    name:
      employee.name ??
      `${firstName} ${lastName}`
        .trim(),

    department:
      employee.department ?? '',

    position:
      employee.position ?? '',

    email:
      employee.email ?? '',

    assignmentStatus:
      employee.assignment_status ??
      employee.assignmentStatus ??
      'Assigned',

    registrationStatus:
      employee.registration_status ??
      employee.registrationStatus ??
      'Not Registered',
  };
};

/* =========================================================
   TRAINING SERVICE
   ========================================================= */

export const trainingService = {

  // ==========================================================
  // GET ALL
  // ==========================================================

  async getAll(
    filters?: {
      search?: string;
      category?: string;
      status?: string;
    }
  ): Promise<TrainingProgram[]> {

    /*
     * Backend currently returns all training programs.
     *
     * Filtering is intentionally performed here because
     * the current controller exposes:
     *
     * GET /api/training
     *
     * and does not expose query-filter parameters.
     */
    const response =
      await apiRequest<
        TrainingApiResponse[]
      >(
        '/api/training'
      );

    let programs =
      Array.isArray(response)
        ? response.map(
            mapTrainingProgram
          )
        : [];

    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    const search =
      filters?.search
        ?.trim()
        .toLowerCase() ?? '';

    if (search) {

      programs =
        programs.filter(
          program => {

            const departmentText =
              program.trainingFor
                .join(' ')
                .toLowerCase();

            return (
              program.title
                .toLowerCase()
                .includes(search) ||

              program.description
                .toLowerCase()
                .includes(search) ||

              program.trainer
                .toLowerCase()
                .includes(search) ||

              program.category
                .toLowerCase()
                .includes(search) ||

              program.location
                .toLowerCase()
                .includes(search) ||

              departmentText
                .includes(search)
            );
          }
        );
    }

    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    if (
      filters?.category &&
      filters.category !== 'All'
    ) {

      programs =
        programs.filter(
          program =>
            program.category ===
            filters.category
        );
    }

    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    if (
      filters?.status &&
      filters.status !== 'All'
    ) {

      programs =
        programs.filter(
          program =>
            program.status ===
            filters.status
        );
    }

    return programs.map(
      enrichProgram
    );
  },

  // ==========================================================
  // GET BY ID
  // ==========================================================

  async getById(
    id: string | number
  ): Promise<TrainingProgram | null> {

    try {

      const response =
        await apiRequest<
          TrainingApiResponse
        >(
          `/api/training/${id}`
        );

      return enrichProgram(
        mapTrainingProgram(
          response
        )
      );

    } catch (error) {

      console.error(
        `Failed to load training ${id}:`,
        error
      );

      return null;
    }
  },

  // ==========================================================
  // CREATE
  // ==========================================================

  async create(
    payload: {
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
    }
  ): Promise<TrainingProgram> {

    const trainingFor =
      normalizeDepartments(
        payload.trainingFor
      );

    if (
      trainingFor.length === 0
    ) {

      throw new Error(
        'At least one department must be selected'
      );
    }

    const response =
      await apiRequest<
        TrainingApiResponse
      >(
        '/api/training',
        {
          method: 'POST',

          body: {
            title:
              payload.title
                ?.trim() ?? '',

            description:
              payload.description
                ?.trim() ?? '',

            trainer:
              payload.trainer
                ?.trim() ?? '',

            category:
              payload.category
                ?.trim() ?? '',

            startDate:
              payload.startDate,

            endDate:
              payload.endDate
                ?.trim() || null,

            location:
              payload.location
                ?.trim() ?? '',

            capacity:
              Number(
                payload.capacity
              ),

            trainingFor,

            status:
              payload.status,
          },
        }
      );

    return enrichProgram(
      mapTrainingProgram(
        response
      )
    );
  },

  // ==========================================================
  // UPDATE
  // ==========================================================

  async update(
    id: string | number,
    payload: {
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
    }
  ): Promise<TrainingProgram> {

    const trainingFor =
      normalizeDepartments(
        payload.trainingFor
      );

    if (
      trainingFor.length === 0
    ) {

      throw new Error(
        'At least one department must be selected'
      );
    }

    const response =
      await apiRequest<
        TrainingApiResponse
      >(
        `/api/training/${id}`,
        {
          method: 'PUT',

          body: {
            title:
              payload.title
                ?.trim() ?? '',

            description:
              payload.description
                ?.trim() ?? '',

            trainer:
              payload.trainer
                ?.trim() ?? '',

            category:
              payload.category
                ?.trim() ?? '',

            startDate:
              payload.startDate,

            endDate:
              payload.endDate
                ?.trim() || null,

            location:
              payload.location
                ?.trim() ?? '',

            capacity:
              Number(
                payload.capacity
              ),

            /*
             * Always send the normalized
             * department list during UPDATE.
             */
            trainingFor,

            status:
              payload.status,
          },
        }
      );

    return enrichProgram(
      mapTrainingProgram(
        response
      )
    );
  },

  // ==========================================================
  // DELETE
  // ==========================================================

  async delete(
    id: string | number
  ): Promise<void> {

    await apiRequest<void>(
      `/api/training/${id}`,
      {
        method: 'DELETE',
      }
    );
  },

  // ==========================================================
  // GET ALL EMPLOYEES
  // ==========================================================

  async getAllEmployees(): Promise<
    TrainingEmployee[]
  > {

    const response =
      await apiRequest<
        EmployeeApiResponse[]
      >(
        '/api/employees'
      );

    if (!Array.isArray(response)) {
      return [];
    }

    return response
      .map(mapEmployee)
      .filter(
        employee =>
          employee.employeeNumber
            .trim()
            .length > 0
      );
  },

  // ==========================================================
  // GET ASSIGNED EMPLOYEES
  // ==========================================================

  async getEmployees(
    trainingId: string | number
  ): Promise<TrainingEmployee[]> {

    const response =
      await apiRequest<any[]>(
        `/api/training/${trainingId}/employees`
      );

    if (!Array.isArray(response)) {
      return [];
    }

    return response
      .map(mapTrainingEmployee)
      .filter(
        employee =>
          employee.employeeNumber
            .trim()
            .length > 0
      );
  },

  // ==========================================================
  // ASSIGN EMPLOYEES
  // ==========================================================

  async assignEmployees(
    trainingId: string | number,
    employeeIds: string[]
  ): Promise<void> {

    const normalizedEmployeeIds =
      normalizeEmployeeIds(
        employeeIds
      );

    if (
      normalizedEmployeeIds.length === 0
    ) {

      throw new Error(
        'At least one employee must be selected'
      );
    }

    await apiRequest<void>(
      `/api/training/${trainingId}/employees`,
      {
        method: 'POST',

        /*
         * Backend controller expects:
         *
         * @RequestBody List<String> employeeIds
         *
         * Therefore this MUST be a JSON array,
         * not:
         *
         * { employeeIds: [...] }
         */
        body:
          normalizedEmployeeIds,
      }
    );
  },

  // ==========================================================
  // REMOVE ASSIGNMENT
  // ==========================================================

  async removeAssignment(
    trainingId: string | number,
    employeeId: string
  ): Promise<void> {

    const normalizedEmployeeId =
      employeeId?.trim();

    if (!normalizedEmployeeId) {

      throw new Error(
        'Employee ID is required'
      );
    }

    await apiRequest<void>(
      `/api/training/${trainingId}/employees/${encodeURIComponent(
        normalizedEmployeeId
      )}`,
      {
        method: 'DELETE',
      }
    );
  },

  // ==========================================================
  // REGISTER
  // ==========================================================

  async register(
    trainingId: string | number,
    employeeId: string
  ): Promise<void> {

    const normalizedEmployeeId =
      employeeId?.trim();

    if (!normalizedEmployeeId) {

      throw new Error(
        'Employee ID is required'
      );
    }

    await apiRequest<void>(
      `/api/training/${trainingId}/register`,
      {
        method: 'POST',

        body: {
          employeeId:
            normalizedEmployeeId,
        },
      }
    );
  },

  // ==========================================================
  // UNREGISTER
  // ==========================================================

  async unregister(
    trainingId: string | number,
    employeeId: string
  ): Promise<void> {

    const normalizedEmployeeId =
      employeeId?.trim();

    if (!normalizedEmployeeId) {

      throw new Error(
        'Employee ID is required'
      );
    }

    await apiRequest<void>(
      `/api/training/${trainingId}/register/${encodeURIComponent(
        normalizedEmployeeId
      )}`,
      {
        method: 'DELETE',
      }
    );
  },
};

