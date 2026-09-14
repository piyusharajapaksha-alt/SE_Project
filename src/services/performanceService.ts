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

export interface PerformanceReview {
  id: string | number;
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

export const performanceService = {
  async create(
    data: PerformanceReviewPayload
  ): Promise<PerformanceReview> {
    return apiRequest<PerformanceReview>('/api/performance', {
      method: 'POST',
      body: data,
    });
  },

  async update(
    id: string | number,
    data: PerformanceReviewPayload
  ): Promise<PerformanceReview> {
    return apiRequest<PerformanceReview>(`/api/performance/${id}`, {
      method: 'PUT',
      body: data,
    });
  },
};