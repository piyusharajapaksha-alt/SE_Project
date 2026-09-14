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

  /*
   * These fields are kept here so the existing Training UI
   * does not break.
   *
   * They will be connected to backend functionality later.
   */
  assignedEmployeeIds: string[];
  registeredEmployeeIds: string[];
  attendance: Record<string, 'Present' | 'Absent' | 'Pending'>;
  completion: Record<
    string,
    'Completed' | 'Not Completed' | 'Pending'
  >;
}

/* =========================================================
   BACKEND RESPONSE TYPE
   ========================================================= */

/*
 * This represents the data currently returned by:
 *
 * GET /api/training
 * GET /api/training/{id}
 *
 * Spring Boot/Jackson normally returns Java fields
 * using camelCase.
 */
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
  status: TrainingStatus;
}

/* =========================================================
   HELPER
   ========================================================= */

/*
 * Convert backend TrainingProgram data into the format
 * expected by the existing React Training UI.
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
     * These are intentionally empty for now.
     *
     * Employee assignment, registration,
     * attendance and completion will be connected
     * to the backend in later milestones.
     */
    trainingFor: [],
    assignedEmployeeIds: [],
    registeredEmployeeIds: [],
    attendance: {},
    completion: {},
  };
};

/* =========================================================
   SERVICE
   ========================================================= */

export const trainingService = {
  /**
   * Get all training programs from Spring Boot.
   *
   * GET /api/training
   */
  async getAll(): Promise<TrainingProgram[]> {
    const response = await apiRequest<TrainingApiResponse[]>(
      '/api/training'
    );

    return response.map(mapTrainingProgram);
  },

  /**
   * Get one training program by ID.
   *
   * GET /api/training/{id}
   */
  async getById(
    id: string | number
  ): Promise<TrainingProgram | null> {
    try {
      const response = await apiRequest<TrainingApiResponse>(
        `/api/training/${id}`
      );

      return mapTrainingProgram(response);
    } catch (error) {
      console.error(
        `Failed to load training program ${id}:`,
        error
      );

      return null;
    }
  },
};

