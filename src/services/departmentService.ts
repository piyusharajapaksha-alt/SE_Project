import { apiRequest } from './apiClient';

export interface Department {
  id: number;
  companyId: number;
  name: string;
  active: boolean;
}

function normalizeDepartment(
  department: any
): Department {
  return {
    id: Number(department.id),
    companyId: Number(
      department.companyId ??
      department.company_id ??
      0
    ),
    name: String(
      department.name ?? ''
    ).trim(),
    active:
      department.active !== false,
  };
}

export const departmentService = {

  // ==========================================================
  // GET ACTIVE DEPARTMENTS
  // ==========================================================

  async getAll(): Promise<Department[]> {

    const response =
      await apiRequest<any[]>(
        '/api/departments'
      );

    if (!Array.isArray(response)) {
      return [];
    }

    return response
      .map(normalizeDepartment)
      .filter(
        (department) =>
          department.active &&
          department.name.length > 0
      )
      .sort(
        (a, b) =>
          a.name.localeCompare(
            b.name
          )
      );
  },

  // ==========================================================
  // CREATE
  // ==========================================================

  async create(
    name: string
  ): Promise<Department> {

    const cleanName =
      name.trim();

    if (!cleanName) {
      throw new Error(
        'Department name is required'
      );
    }

    const response =
      await apiRequest<any>(
        '/api/departments',
        {
          method: 'POST',
          body: {
            name: cleanName,
          },
        }
      );

    return normalizeDepartment(
      response
    );
  },

  // ==========================================================
  // DELETE
  // ==========================================================

  async delete(
    id: number
  ): Promise<void> {

    await apiRequest(
      `/api/departments/${id}`,
      {
        method: 'DELETE',
      }
    );
  },
};