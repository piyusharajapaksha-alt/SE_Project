import { apiRequest } from '@/services/apiClient';

export interface PerformanceReviewPayload {
  employeeId: string;
  reviewPeriod: string;

  qualityOfWork: number;
  productivity: number;
  teamwork: number;
  communication: number;
  responsibility: number;
  problemSolving: number;

  overallRating: number;

  managerFeedback: string;
  areasForImprovement: string;

  status: 'Pending Review' | 'Completed';
}

export interface PerformanceReview
  extends PerformanceReviewPayload {
  id: number;

  employeeName?: string;
  department?: string;
  position?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface AvailableReviewEmployee {
  id: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  role?: string;
  employmentStatus?: string;
  hireDate?: string;
  address?: string;
  emergencyContact?: string;
  salary?: number;
  gender?: string;
}

export const performanceService = {

  // ============================================================
  // READ ALL
  // ============================================================

  async getAll(): Promise<PerformanceReview[]> {

    return apiRequest<PerformanceReview[]>(
      '/api/performance'
    );
  },

  // ============================================================
  // READ ONE
  // ============================================================

  async getById(
    id: number
  ): Promise<PerformanceReview> {

    return apiRequest<PerformanceReview>(
      `/api/performance/${id}`
    );
  },

  // ============================================================
  // READ BY EMPLOYEE
  // ============================================================

  async getByEmployee(
    employeeId: string
  ): Promise<PerformanceReview[]> {

    return apiRequest<PerformanceReview[]>(
      `/api/performance/employee/${encodeURIComponent(
        employeeId
      )}`
    );
  },

  // ============================================================
  // GET AVAILABLE EMPLOYEES
  // ============================================================

  async getAvailableEmployees(
    reviewPeriod: string,
    department?: string
  ): Promise<AvailableReviewEmployee[]> {

    const params = new URLSearchParams();

    params.set(
      'reviewPeriod',
      reviewPeriod
    );

    if (
      department &&
      department !== 'All'
    ) {
      params.set(
        'department',
        department
      );
    }

    return apiRequest<AvailableReviewEmployee[]>(
      `/api/performance/available-employees?${params.toString()}`
    );
  },

  // ============================================================
  // CREATE
  // ============================================================

  async create(
    data: PerformanceReviewPayload
  ): Promise<PerformanceReview> {

    return apiRequest<PerformanceReview>(
      '/api/performance',
      {
        method: 'POST',
        body: data,
      }
    );
  },

  // ============================================================
  // UPDATE
  // ============================================================

  async update(
    id: number,
    data: PerformanceReviewPayload
  ): Promise<PerformanceReview> {

    return apiRequest<PerformanceReview>(
      `/api/performance/${id}`,
      {
        method: 'PUT',
        body: data,
      }
    );
  },

  // ============================================================
  // DELETE
  // ============================================================

  async delete(
    id: number
  ): Promise<void> {

    await apiRequest<void>(
      `/api/performance/${id}`,
      {
        method: 'DELETE',
      }
    );
  },
};

