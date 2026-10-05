import { apiRequest } from './apiClient';

export interface Department {
  id: number;
  companyId: number;
  name: string;
  active: boolean;
}

export const departmentService = {

  async getAll(): Promise<Department[]> {

    const response =
      await apiRequest<Department[]>(
        '/api/departments'
      );

    if (!Array.isArray(response)) {
      return [];
    }

    return response
      .filter(
        (department) =>
          department &&
          department.active !== false &&
          typeof department.name === 'string'
      )
      .map(
        (department) => ({
          ...department,
          name:
            department.name.trim(),
        })
      )
      .filter(
        (department) =>
          department.name.length > 0
      );
  },
};