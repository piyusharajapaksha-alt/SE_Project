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
  createdAt?: string;
  updatedAt?: string;
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
      `/api/performance/employee/${encodeURIComponent(employeeId)}`
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
        body: JSON.stringify(data),
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
        body: JSON.stringify(data),
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