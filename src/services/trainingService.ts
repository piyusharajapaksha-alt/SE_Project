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
   LOCAL COMPATIBILITY DATA
   ========================================================= */

/*
 * IMPORTANT:
 *
 * The GET operations are now connected to Spring Boot.
 *
 * These temporary local arrays exist only so the existing
 * TrainingPage UI does not break while CRUD, registration,
 * employee assignment, attendance and completion APIs
 * are developed later.
 */

let localPrograms: TrainingProgram[] = [];

let localEmployees: TrainingEmployee[] = [];

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
     * These fields are not available from the current
     * backend GET API yet.
     *
     * They will be connected later.
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
 * Calculate derived values used by the existing UI.
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

  /**
   * Get all training programs from Spring Boot.
   *
   * GET /api/training
   *
   * Search/category/status filtering is still performed
   * on the frontend because the backend currently only
   * provides the basic GET endpoint.
   */
  async getAll(
    filters?: {
      search?: string;
      category?: string;
      status?: string;
    }
  ): Promise<TrainingProgram[]> {
    try {
      /*
       * REAL BACKEND REQUEST
       */
      const response =
        await apiRequest<TrainingApiResponse[]>(
          '/api/training'
        );

      /*
       * Convert backend response into the structure
       * expected by TrainingPage.
       */
      let programs = response.map(
        mapTrainingProgram
      );

      /*
       * Keep a local copy so the existing UI methods
       * can continue working temporarily.
       */
      localPrograms = programs;

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

  /**
   * Get one training program from Spring Boot.
   *
   * GET /api/training/{id}
   */
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

      /*
       * Keep local copy updated.
       */
      const existingIndex =
        localPrograms.findIndex(
          (item) =>
            String(item.id) === String(id)
        );

      if (existingIndex >= 0) {
        localPrograms[existingIndex] =
          program;
      } else {
        localPrograms.push(program);
      }

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
     TEMPORARY COMPATIBILITY METHODS
     ======================================================= */

  /*
   * IMPORTANT:
   *
   * The methods below are NOT connected to the backend yet.
   *
   * They are kept because TrainingPage.tsx currently calls
   * them. They will be replaced with real backend APIs
   * in future milestones.
   */

  /* -------------------------------------------------------
     CREATE
     ------------------------------------------------------- */

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

      localPrograms.push(createdProgram);

      return enrichProgram(createdProgram);

    } catch (error) {

      console.error(
        'Failed to create training program:',
        error
      );

      throw error;
    }
  },
  /* -------------------------------------------------------
     UPDATE
     ------------------------------------------------------- */

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
            trainingFor: payload.trainingFor || [],
            status: payload.status,
          },
        }
      );

    const updatedProgram =
      mapTrainingProgram(response);

    const index =
      localPrograms.findIndex(
        (program) =>
          String(program.id) === String(id)
      );

    if (index >= 0) {
      localPrograms[index] =
        updatedProgram;
    } else {
      localPrograms.push(
        updatedProgram
      );
    }

    return enrichProgram(
      updatedProgram
    );

  } catch (error) {

    console.error(
      `Failed to update training program ${id}:`,
      error
    );

    throw error;
  }
},

  /* -------------------------------------------------------
     DELETE
     ------------------------------------------------------- */

  async delete(
    id: string
  ): Promise<void> {
    localPrograms = localPrograms.filter(
      (program) =>
        String(program.id) !== String(id)
    );
  },

  /* =======================================================
     EMPLOYEE METHODS
     ======================================================= */

  async getAllEmployees(): Promise<
    TrainingEmployee[]
  > {
    return localEmployees;
  },

  async getEmployees(
    trainingId: string
  ): Promise<TrainingEmployee[]> {
    const program =
      localPrograms.find(
        (item) =>
          String(item.id) ===
          String(trainingId)
      );

    if (!program) {
      return [];
    }

    return localEmployees.filter(
      (employee) =>
        program.assignedEmployeeIds.includes(
          employee.id
        )
    );
  },

  /* -------------------------------------------------------
     ASSIGN EMPLOYEES
     ------------------------------------------------------- */

  async assignEmployees(
    trainingId: string,
    employeeIds: string[]
  ): Promise<void> {
    const program =
      localPrograms.find(
        (item) =>
          String(item.id) ===
          String(trainingId)
      );

    if (!program) {
      throw new Error(
        'Training program not found'
      );
    }

    program.assignedEmployeeIds = [
      ...new Set([
        ...program.assignedEmployeeIds,
        ...employeeIds,
      ]),
    ];
  },

  /* -------------------------------------------------------
     REMOVE ASSIGNMENT
     ------------------------------------------------------- */

  async removeAssignment(
    trainingId: string,
    employeeId: string
  ): Promise<void> {
    const program =
      localPrograms.find(
        (item) =>
          String(item.id) ===
          String(trainingId)
      );

    if (!program) {
      throw new Error(
        'Training program not found'
      );
    }

    program.assignedEmployeeIds =
      program.assignedEmployeeIds.filter(
        (id) => id !== employeeId
      );
  },

  /* =======================================================
     REGISTRATION
     ======================================================= */

  async register(
    trainingId: string,
    employeeId: string
  ): Promise<void> {
    const program =
      localPrograms.find(
        (item) =>
          String(item.id) ===
          String(trainingId)
      );

    if (!program) {
      throw new Error(
        'Training program not found'
      );
    }

    if (
      !program.registeredEmployeeIds.includes(
        employeeId
      )
    ) {
      program.registeredEmployeeIds.push(
        employeeId
      );
    }
  },

  /* -------------------------------------------------------
     UNREGISTER
     ------------------------------------------------------- */

  async unregister(
    trainingId: string,
    employeeId: string
  ): Promise<void> {
    const program =
      localPrograms.find(
        (item) =>
          String(item.id) ===
          String(trainingId)
      );

    if (!program) {
      throw new Error(
        'Training program not found'
      );
    }

    program.registeredEmployeeIds =
      program.registeredEmployeeIds.filter(
        (id) => id !== employeeId
      );
  },
};
