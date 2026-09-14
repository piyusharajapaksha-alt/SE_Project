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
   BACKEND API RESPONSE
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
}

/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

/**
 * Convert backend training data into the structure
 * expected by the current React Training UI.
 */
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

    status: program.status ?? 'Upcoming',

    /*
     * These fields are not available from the
     * current backend API yet.
     *
     * Keep them empty until backend APIs are added.
     */
    trainingFor: Array.isArray(program.trainingFor)
      ? program.trainingFor
      : [],

    assignedEmployeeIds: [],
    registeredEmployeeIds: [],

    attendance: {},
    completion: {},
  };
};

/**
 * Calculate values used by the existing UI.
 */
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

  const availableSeats = Math.max(
    0,
    program.capacity - registeredCount
  );

  const notRegisteredCount = Math.max(
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
   TRAINING SERVICE
   ========================================================= */

export const trainingService = {
  /* =======================================================
     GET ALL TRAINING PROGRAMS
     ======================================================= */

  async getAll(
    filters?: {
      search?: string;
      category?: string;
      status?: string;
    }
  ): Promise<TrainingProgram[]> {
    try {
      const response =
        await apiRequest<TrainingApiResponse[]>(
          '/api/training'
        );

      let programs = response.map(
        mapTrainingProgram
      );

      /* -----------------------------------------------
         FRONTEND SEARCH
         ----------------------------------------------- */

      const search =
        filters?.search?.trim().toLowerCase() || '';

      if (search) {
        programs = programs.filter((program) => {
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
              .includes(search)
          );
        });
      }

      /* -----------------------------------------------
         CATEGORY FILTER
         ----------------------------------------------- */

      if (
        filters?.category &&
        filters.category !== 'All'
      ) {
        programs = programs.filter(
          (program) =>
            program.category ===
            filters.category
        );
      }

      /* -----------------------------------------------
         STATUS FILTER
         ----------------------------------------------- */

      if (
        filters?.status &&
        filters.status !== 'All'
      ) {
        programs = programs.filter(
          (program) =>
            program.status ===
            filters.status
        );
      }

      return programs.map(enrichProgram);
    } catch (error) {
      console.error(
        'Failed to load training programs:',
        error
      );

      throw error;
    }
  },

  /* =======================================================
     GET TRAINING PROGRAM BY ID
     ======================================================= */

  async getById(
    id: string | number
  ): Promise<TrainingProgram | null> {
    try {
      const response =
        await apiRequest<TrainingApiResponse>(
          `/api/training/${id}`
        );

      const program =
        mapTrainingProgram(response);

      return enrichProgram(program);
    } catch (error) {
      console.error(
        `Failed to load training program ${id}:`,
        error
      );

      return null;
    }
  },

  /* =======================================================
     CREATE TRAINING PROGRAM
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
    try {
      const response =
        await apiRequest<TrainingApiResponse>(
          '/api/training',
          {
            method: 'POST',
            body: {
              title: payload.title,
              description: payload.description,
              trainer: payload.trainer,
              category: payload.category,
              startDate: payload.startDate,
              endDate: payload.endDate || null,
              location: payload.location,
              capacity: payload.capacity,
              trainingFor: payload.trainingFor,
              status: payload.status,
            },
          }
        );

      const createdProgram =
        mapTrainingProgram(response);

      return enrichProgram(createdProgram);
    } catch (error) {
      console.error(
        'Failed to create training program:',
        error
      );

      throw error;
    }
  },

  /* =======================================================
     UPDATE TRAINING PROGRAM
     ======================================================= */

  async update(
    id: string,
    payload: Partial<TrainingProgram>
  ): Promise<TrainingProgram> {
    try {
      const response =
        await apiRequest<TrainingApiResponse>(
          `/api/training/${id}`,
          {
            method: 'PUT',
            body: {
              title: payload.title,
              description: payload.description,
              trainer: payload.trainer,
              category: payload.category,
              startDate: payload.startDate,
              endDate: payload.endDate || null,
              location: payload.location,
              capacity: payload.capacity,
              trainingFor:
                payload.trainingFor || [],
              status: payload.status,
            },
          }
        );

      const updatedProgram =
        mapTrainingProgram(response);

      return enrichProgram(updatedProgram);
    } catch (error) {
      console.error(
        `Failed to update training program ${id}:`,
        error
      );

      throw error;
    }
  },

  /* =======================================================
     DELETE
     ======================================================= */

  async delete(
    id: string
  ): Promise<void> {
    /*
     * Backend DELETE endpoint has not been implemented yet.
     *
     * Do NOT keep local/mock deletion here.
     *
     * This method is kept so TrainingPage.tsx
     * does not produce a TypeScript error.
     */
    console.warn(
      `Training delete API is not implemented yet. ID: ${id}`
    );
  },

  /* =======================================================
     EMPLOYEE METHODS
     ======================================================= */

  /**
   * Employee assignment API has not been implemented yet.
   *
   * Return an empty array instead of using mock/local data.
   */
  async getAllEmployees(): Promise<TrainingEmployee[]> {
    return [];
  },

  /**
   * Employee assignment API has not been implemented yet.
   *
   * Return an empty array instead of using local/mock data.
   */
  async getEmployees(
    _trainingId: string
  ): Promise<TrainingEmployee[]> {
    return [];
  },

  /* =======================================================
     ASSIGN EMPLOYEES
     ======================================================= */

  async assignEmployees(
    _trainingId: string,
    _employeeIds: string[]
  ): Promise<void> {
    /*
     * Backend assignment API is not implemented yet.
     *
     * Do nothing for now.
     */
    console.warn(
      'Training employee assignment API is not implemented yet.'
    );
  },

  /* =======================================================
     REMOVE ASSIGNMENT
     ======================================================= */

  async removeAssignment(
    _trainingId: string,
    _employeeId: string
  ): Promise<void> {
    /*
     * Backend assignment API is not implemented yet.
     *
     * Do nothing for now.
     */
    console.warn(
      'Training employee removal API is not implemented yet.'
    );
  },

  /* =======================================================
     REGISTRATION
     ======================================================= */

  async register(
    _trainingId: string,
    _employeeId: string
  ): Promise<void> {
    /*
     * Backend registration API is not implemented yet.
     *
     * Do nothing for now.
     */
    console.warn(
      'Training registration API is not implemented yet.'
    );
  },

  /* =======================================================
     UNREGISTER
     ======================================================= */

  async unregister(
    _trainingId: string,
    _employeeId: string
  ): Promise<void> {
    /*
     * Backend registration API is not implemented yet.
     *
     * Do nothing for now.
     */
    console.warn(
      'Training unregistration API is not implemented yet.'
    );
  },
};