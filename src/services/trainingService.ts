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

  assignmentStatus?: 'Assigned' | 'Not Assigned';
  registrationStatus?: 'Registered' | 'Not Registered';

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
}


/* =========================================================
   BACKEND TYPES
   ========================================================= */

interface TrainingApiResponse {
  id: number | string;

  title: string;
  description: string;

  trainer: string;
  category: string;

  startDate: string;
  endDate?: string | null;

  location: string;
  capacity: number;

  trainingFor: string[];

  status: TrainingStatus;

  assignedEmployeeIds?: string[];
  registeredEmployeeIds?: string[];

  attendance?: Record<
    string,
    'Present' | 'Absent' | 'Pending'
  >;

  completion?: Record<
    string,
    'Completed' | 'Not Completed' | 'Pending'
  >;
}


/* =========================================================
   EMPLOYEE API TYPE
   ========================================================= */

interface EmployeeApiResponse {
  id?: number | string;

  employeeNumber?: string;

  firstName?: string;
  lastName?: string;

  email?: string;

  department?: string;
  position?: string;
}


/* =========================================================
   HELPERS
   ========================================================= */

const mapTrainingProgram = (
  program: TrainingApiResponse
): TrainingProgram => {

  return {
    id: String(program.id),

    title: program.title ?? '',
    description: program.description ?? '',

    trainer: program.trainer ?? '',
    category: program.category ?? '',

    startDate: program.startDate ?? '',
    endDate: program.endDate ?? '',

    location: program.location ?? '',
    capacity: Number(program.capacity ?? 0),

    trainingFor:
      Array.isArray(program.trainingFor)
        ? program.trainingFor
        : [],

    status:
      program.status ?? 'Upcoming',

    assignedEmployeeIds:
      Array.isArray(program.assignedEmployeeIds)
        ? program.assignedEmployeeIds.map(String)
        : [],

    registeredEmployeeIds:
      Array.isArray(program.registeredEmployeeIds)
        ? program.registeredEmployeeIds.map(String)
        : [],

    attendance:
      program.attendance ?? {},

    completion:
      program.completion ?? {},
  };
};


/* =========================================================
   ENRICH TRAINING PROGRAM
   ========================================================= */

const enrichProgram = (
  program: TrainingProgram
): TrainingProgram & {
  registeredCount: number;
  assignedCount: number;
  notRegisteredCount: number;
  availableSeats: number;
} => {

  const registeredCount =
    program.registeredEmployeeIds.length;

  const assignedCount =
    program.assignedEmployeeIds.length;

  const availableSeats =
    Math.max(
      0,
      program.capacity - registeredCount
    );

  /*
   * Keep the existing application behaviour.
   *
   * This represents the number of available places,
   * not the number of assigned-but-unregistered employees.
   */
  const notRegisteredCount =
    Math.max(
      0,
      program.capacity - registeredCount
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
   DEPARTMENT NORMALIZATION
   ========================================================= */

/**
 * Normalizes department values before they are sent
 * to the backend.
 *
 * Examples:
 *
 * "HR"       -> "HR"
 * " hr"      -> "hr"
 * "HR "      -> "HR"
 * " Finance" -> "Finance"
 *
 * Duplicate departments are removed
 * case-insensitively.
 *
 * The original spelling of the first occurrence is
 * preserved because the backend also performs
 * case-insensitive matching.
 */
const normalizeDepartments = (
  departments?: string[]
): string[] => {

  if (!Array.isArray(departments)) {
    return [];
  }

  const normalized: string[] = [];

  for (const department of departments) {

    if (
      typeof department !== 'string' ||
      !department
    ) {
      continue;
    }

    const value =
      department.trim();

    if (!value) {
      continue;
    }

    const alreadyExists =
      normalized.some(
        (existing) =>
          existing.trim().toLowerCase() ===
          value.toLowerCase()
      );

    if (!alreadyExists) {
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
      typeof employeeId !== 'string' ||
      !employeeId
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
   TRAINING SERVICE
   ========================================================= */

export const trainingService = {

  /* =======================================================
     GET ALL
     ======================================================= */

  async getAll(
    filters?: {
      search?: string;
      category?: string;
      status?: string;
    }
  ): Promise<TrainingProgram[]> {

    const response =
      await apiRequest<TrainingApiResponse[]>(
        '/api/training'
      );

    let programs =
      response.map(mapTrainingProgram);


    const search =
      filters?.search
        ?.trim()
        .toLowerCase() || '';


    if (search) {

      programs =
        programs.filter(
          (program) =>
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
              .includes(search)
        );
    }


    if (
      filters?.category &&
      filters.category !== 'All'
    ) {

      programs =
        programs.filter(
          (program) =>
            program.category ===
            filters.category
        );
    }


    if (
      filters?.status &&
      filters.status !== 'All'
    ) {

      programs =
        programs.filter(
          (program) =>
            program.status ===
            filters.status
        );
    }


    return programs.map(enrichProgram);
  },


  /* =======================================================
     GET BY ID
     ======================================================= */

  async getById(
    id: string | number
  ): Promise<TrainingProgram | null> {

    try {

      const response =
        await apiRequest<TrainingApiResponse>(
          `/api/training/${id}`
        );

      return enrichProgram(
        mapTrainingProgram(response)
      );

    } catch (error) {

      console.error(
        `Failed to load training ${id}:`,
        error
      );

      return null;
    }
  },


  /* =======================================================
     CREATE
     ======================================================= */

  async create(
    payload: Omit<
      TrainingProgram,
      | 'id'
      | 'assignedEmployeeIds'
      | 'registeredEmployeeIds'
      | 'attendance'
      | 'completion'
    >
  ): Promise<TrainingProgram> {

    const trainingFor =
      normalizeDepartments(
        payload.trainingFor
      );

    const response =
      await apiRequest<TrainingApiResponse>(
        '/api/training',
        {
          method: 'POST',

          body: {
            title:
              payload.title?.trim() ?? '',

            description:
              payload.description?.trim() ?? '',

            trainer:
              payload.trainer?.trim() ?? '',

            category:
              payload.category?.trim() ?? '',

            startDate:
              payload.startDate,

            endDate:
              payload.endDate?.trim() || null,

            location:
              payload.location?.trim() ?? '',

            capacity:
              Number(payload.capacity),

            /*
             * IMPORTANT:
             * Always send normalized department names.
             */
            trainingFor,

            status:
              payload.status,
          },
        }
      );

    return enrichProgram(
      mapTrainingProgram(response)
    );
  },


  /* =======================================================
     UPDATE
     ======================================================= */

  async update(
    id: string,
    payload: Partial<TrainingProgram>
  ): Promise<TrainingProgram> {

    const trainingFor =
      normalizeDepartments(
        payload.trainingFor
      );

    const response =
      await apiRequest<TrainingApiResponse>(
        `/api/training/${id}`,
        {
          method: 'PUT',

          body: {
            title:
              payload.title?.trim() ?? '',

            description:
              payload.description?.trim() ?? '',

            trainer:
              payload.trainer?.trim() ?? '',

            category:
              payload.category?.trim() ?? '',

            startDate:
              payload.startDate,

            endDate:
              payload.endDate?.trim() || null,

            location:
              payload.location?.trim() ?? '',

            capacity:
              Number(payload.capacity),

            /*
             * IMPORTANT:
             *
             * The previous version had:
             *
             * payload.trainingFor || []
             *
             * That bypassed normalization during UPDATE.
             *
             * This version always normalizes the
             * selected departments.
             */
            trainingFor,

            status:
              payload.status,
          },
        }
      );

    return enrichProgram(
      mapTrainingProgram(response)
    );
  },


  /* =======================================================
     DELETE
     ======================================================= */

  async delete(
    id: string
  ): Promise<void> {

    await apiRequest<void>(
      `/api/training/${id}`,
      {
        method: 'DELETE',
      }
    );
  },


  /* =======================================================
     GET ALL EMPLOYEES
     ======================================================= */

  async getAllEmployees(): Promise<
    TrainingEmployee[]
  > {

    const response =
      await apiRequest<EmployeeApiResponse[]>(
        '/api/employees'
      );

    return response.map(
      (employee) => {

        const employeeNumber =
          employee.employeeNumber ??
          String(employee.id ?? '');

        return {
          /*
           * IMPORTANT:
           *
           * Training assignment and registration
           * use employee_number values such as:
           *
           * EMP001
           * EMP002
           * EMP003
           *
           * Therefore employeeNumber must be used
           * as the frontend ID.
           */
          id:
            employeeNumber,

          employeeNumber,

          name:
            `${employee.firstName ?? ''} ${
              employee.lastName ?? ''
            }`.trim(),

          department:
            employee.department ?? '',

          position:
            employee.position ?? '',

          email:
            employee.email ?? '',
        };
      }
    );
  },


  /* =======================================================
     GET ASSIGNED EMPLOYEES
     ======================================================= */

  async getEmployees(
    trainingId: string
  ): Promise<TrainingEmployee[]> {

    const response =
      await apiRequest<any[]>(
        `/api/training/${trainingId}/employees`
      );

    return response.map(
      (employee) => {

        const employeeNumber =
          String(
            employee.employee_number ??
            employee.employeeNumber ??
            employee.id ??
            ''
          );

        return {
          id:
            employeeNumber,

          employeeNumber,

          name:
            employee.name ??
            `${employee.first_name ?? ''} ${
              employee.last_name ?? ''
            }`.trim(),

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
      }
    );
  },


  /* =======================================================
     ASSIGN EMPLOYEES
     ======================================================= */

  async assignEmployees(
    trainingId: string,
    employeeIds: string[]
  ): Promise<void> {

    const normalizedEmployeeIds =
      normalizeEmployeeIds(employeeIds);

    if (
      normalizedEmployeeIds.length === 0
    ) {
      return;
    }

    await apiRequest<void>(
      `/api/training/${trainingId}/employees`,
      {
        method: 'POST',

        body:
          normalizedEmployeeIds,
      }
    );
  },


  /* =======================================================
     REMOVE ASSIGNMENT
     ======================================================= */

  async removeAssignment(
    trainingId: string,
    employeeId: string
  ): Promise<void> {

    const normalizedEmployeeId =
      employeeId?.trim();

    if (!normalizedEmployeeId) {
      return;
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


  /* =======================================================
     REGISTER
     ======================================================= */

  async register(
    trainingId: string,
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


  /* =======================================================
     UNREGISTER
     ======================================================= */

  async unregister(
    trainingId: string,
    employeeId: string
  ): Promise<void> {

    const normalizedEmployeeId =
      employeeId?.trim();

    if (!normalizedEmployeeId) {
      return;
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