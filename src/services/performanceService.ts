import { apiRequest } from '@/services/apiClient';

export interface PerformanceReviewPayload {
  employeeId: string;
  reviewPeriod: string; // YYYY-MM
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

export interface PerformanceReview extends PerformanceReviewPayload {
  id: string | number;
  createdAt?: string;
  updatedAt?: string;
}

export const performanceService = {
  /**
   * Get all performance reviews.
   */
  async getAll(): Promise<PerformanceReview[]> {
    const response = await apiRequest<
      PerformanceReview[] | { data: PerformanceReview[] }
    >('/api/performance');

    if (Array.isArray(response)) {
      return response;
    }

    return response?.data ?? [];
  },

  /**
   * Get performance reviews for one employee.
   */
  async getByEmployee(employeeId: string): Promise<PerformanceReview[]> {
    const response = await apiRequest<
      PerformanceReview[] | { data: PerformanceReview[] }
    >(
      `/api/performance/employee/${encodeURIComponent(employeeId)}`
    );

    if (Array.isArray(response)) {
      return response;
    }

    return response?.data ?? [];
  },

  /**
   * Create a new monthly performance review.
   */
  async create(
    data: PerformanceReviewPayload
  ): Promise<PerformanceReview> {
    return apiRequest<PerformanceReview>('/api/performance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing performance review.
   */
  async update(
    id: string | number,
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
};
