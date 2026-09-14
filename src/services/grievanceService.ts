// ============================================================
// GRIEVANCE SERVICE
// Handles all grievance communication with Spring Boot backend
// ============================================================

import { apiRequest } from './apiClient';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export interface GrievanceResponse {
  id?: number;
  employeeId: string;
  employeeName?: string;
  text: string;
  createdAt?: string;
  date?: string;
}

export interface Grievance {
  id?: number;
  employeeId: string;
  employeeName?: string;
  category: string;
  priority: string;
  description: string;
  status?: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt?: string;
  responses?: GrievanceResponse[];
}

export interface GrievanceFilters {
  employeeId?: string;
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
}

// ------------------------------------------------------------
// Build query string
// ------------------------------------------------------------

function buildQuery(filters: GrievanceFilters = {}): string {
  const params = new URLSearchParams();

  if (filters.employeeId) {
    params.set('employeeId', filters.employeeId);
  }

  if (filters.search) {
    params.set('search', filters.search);
  }

  if (filters.status) {
    params.set('status', filters.status);
  }

  if (filters.priority) {
    params.set('priority', filters.priority);
  }

  if (filters.category) {
    params.set('category', filters.category);
  }

  const query = params.toString();

  return query ? `?${query}` : '';
}

// ------------------------------------------------------------
// Date helper
// ------------------------------------------------------------

function formatDate(value?: string): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

// ------------------------------------------------------------
// Normalize backend response
// ------------------------------------------------------------

function normalizeGrievance(
  grievance: Grievance
): Grievance {
  return {
    ...grievance,

    createdAt: grievance.createdAt
      ? formatDate(grievance.createdAt)
      : '',

    responses: Array.isArray(grievance.responses)
      ? grievance.responses.map((response) => ({
          ...response,

          date: response.createdAt
            ? formatDate(response.createdAt)
            : '',
        }))
      : [],
  };
}

// ------------------------------------------------------------
// Grievance API
// ------------------------------------------------------------

export const grievanceService = {

  // ----------------------------------------------------------
  // Get all grievances
  // ----------------------------------------------------------

  async getAll(
    filters: GrievanceFilters = {}
  ): Promise<Grievance[]> {

    const query = buildQuery(filters);

    const data = await apiRequest<Grievance[]>(
      `/api/grievances${query}`
    );

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(normalizeGrievance);
  },

  // ----------------------------------------------------------
  // Get one grievance
  // ----------------------------------------------------------

  async getById(id: number): Promise<Grievance> {

    const data = await apiRequest<Grievance>(
      `/api/grievances/${id}`
    );

    return normalizeGrievance(data);
  },

  // ----------------------------------------------------------
  // Create grievance
  // ----------------------------------------------------------

  async create(
    grievance: {
      employeeId: string;
      category: string;
      priority: string;
      description: string;
    }
  ): Promise<number> {

    return apiRequest<number>(
      '/api/grievances',
      {
        method: 'POST',

        body: {
          employeeId: grievance.employeeId,
          category: grievance.category,
          priority: grievance.priority,
          description: grievance.description,
        },
      }
    );
  },

  // ----------------------------------------------------------
  // Add response
  // ----------------------------------------------------------

  async addResponse(
    grievanceId: number,
    employeeId: string,
    text: string
  ): Promise<string> {

    return apiRequest<string>(
      `/api/grievances/${grievanceId}/responses`,
      {
        method: 'POST',

        body: {
          employeeId,
          text,
        },
      }
    );
  },

  // ----------------------------------------------------------
  // Update status
  //
  // IMPORTANT:
  // We intentionally send ONLY the status.
  //
  // The current backend uses "updatedBy" as "assignedTo".
  // Sending employeeId here would accidentally assign the
  // grievance to the person updating the status.
  // ----------------------------------------------------------

  async updateStatus(
    grievanceId: number,
    status: string
  ): Promise<string> {

    return apiRequest<string>(
      `/api/grievances/${grievanceId}/status`,
      {
        method: 'PUT',

        body: {
          status,
        },
      }
    );
  },
};

export default grievanceService;