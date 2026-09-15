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
      Array.isArray(
        program.assignedEmployeeIds
      )
        ? program.assignedEmployeeIds
        : [],

    registeredEmployeeIds:
      Array.isArray(
        program.registeredEmployeeIds
      )
        ? program.registeredEmployeeIds
        : [],

    attendance:
      program.attendance ?? {},

    completion:
      program.completion ?? {},
  };
};


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
            endDate:
              payload.endDate || null,

            location: payload.location,
            capacity: payload.capacity,

            trainingFor:
              payload.trainingFor,

            status: payload.status,
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

            endDate:
              payload.endDate || null,

            location: payload.location,
            capacity: payload.capacity,

            trainingFor:
              payload.trainingFor || [],

            status: payload.status,
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
           * Use employeeNumber as the ID because
           * Training assignment and registration
           * use EMP001 / EMP002 style IDs.
           */
          id: employeeNumber,

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
          id: employeeNumber,

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

    await apiRequest<void>(
      `/api/training/${trainingId}/employees`,
      {
        method: 'POST',

        body: employeeIds,
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

    await apiRequest<void>(
      `/api/training/${trainingId}/employees/${encodeURIComponent(
        employeeId
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

    await apiRequest<void>(
      `/api/training/${trainingId}/register`,
      {
        method: 'POST',

        body: {
          employeeId,
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

    await apiRequest<void>(
      `/api/training/${trainingId}/register/${encodeURIComponent(
        employeeId
      )}`,
      {
        method: 'DELETE',
      }
    );
  },
};