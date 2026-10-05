import {
  useEffect,
  useState,
} from 'react';

import {
  departmentService,
  Department,
} from '@/services/departmentService';

import {
  Modal,
  ConfirmDialog,
  FormInput,
} from '@/components/ui';

import {
  Plus,
  Trash2,
  Building2,
  Loader2,
} from 'lucide-react';

interface DepartmentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChanged?: (
    departments: Department[]
  ) => void;
}

export default function DepartmentManagementModal({
  isOpen,
  onClose,
  onChanged,
}: DepartmentManagementModalProps) {

  const [
    departments,
    setDepartments,
  ] = useState<Department[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    departmentName,
    setDepartmentName,
  ] = useState('');

  const [
    error,
    setError,
  ] = useState('');

  const [
    deleteDepartment,
    setDeleteDepartment,
  ] = useState<Department | null>(
    null
  );

  const loadDepartments =
    async () => {

      setLoading(true);
      setError('');

      try {

        const data =
          await departmentService.getAll();

        setDepartments(data);

        onChanged?.(data);

      } catch (error: any) {

        setError(
          error?.message ||
          'Failed to load departments'
        );

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    if (isOpen) {
      loadDepartments();
    }

  }, [isOpen]);

  const handleAdd =
    async () => {

      const name =
        departmentName.trim();

      if (!name) {

        setError(
          'Department name is required'
        );

        return;
      }

      if (name.length > 100) {

        setError(
          'Department name cannot exceed 100 characters'
        );

        return;
      }

      const duplicate =
        departments.some(
          (department) =>
            department.name
              .trim()
              .toLowerCase() ===
            name.toLowerCase()
        );

      if (duplicate) {

        setError(
          'A department with this name already exists'
        );

        return;
      }

      setSaving(true);
      setError('');

      try {

        await departmentService.create(
          name
        );

        setDepartmentName('');

        await loadDepartments();

      } catch (error: any) {

        setError(
          error?.message ||
          'Failed to create department'
        );

      } finally {

        setSaving(false);
      }
    };

  const handleDelete =
    async () => {

      if (!deleteDepartment) {
        return;
      }

      setDeleting(true);
      setError('');

      try {

        await departmentService.delete(
          deleteDepartment.id
        );

        setDeleteDepartment(null);

        await loadDepartments();

      } catch (error: any) {

        setError(
          error?.message ||
          'Failed to delete department'
        );

        setDeleteDepartment(null);

      } finally {

        setDeleting(false);
      }
    };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Manage Departments"
        size="md"
      >

        <div className="space-y-5">

          <div>
            <p className="text-sm text-gray-600">
              Create and manage the departments
              available to your company.
            </p>
          </div>

          {/* ADD DEPARTMENT */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

            <div className="flex items-center gap-2 mb-3">

              <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Plus className="h-4 w-4 text-indigo-600" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Add Department
                </h3>

                <p className="text-xs text-gray-500">
                  Add a department to your company.
                </p>
              </div>

            </div>

            <div className="flex flex-col sm:flex-row gap-2">

              <div className="flex-1">

                <FormInput
                  label=""
                  value={departmentName}
                  onChange={(event) =>
                    setDepartmentName(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Finance"
                  onKeyDown={(event) => {

                    if (
                      event.key === 'Enter'
                    ) {
                      event.preventDefault();
                      handleAdd();
                    }

                  }}
                />

              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={saving}
                className="sm:self-end px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >

                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}

                Add

              </button>

            </div>

          </div>

          {/* ERROR */}

          {error && (

            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>

          )}

          {/* DEPARTMENT LIST */}

          <div>

            <div className="flex items-center justify-between mb-3">

              <h3 className="text-sm font-semibold text-gray-900">
                Company Departments
              </h3>

              <span className="text-xs text-gray-500">
                {departments.length}{' '}
                department
                {departments.length === 1
                  ? ''
                  : 's'}
              </span>

            </div>

            {loading ? (

              <div className="py-10 flex justify-center">
                <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
              </div>

            ) : departments.length === 0 ? (

              <div className="border border-dashed border-gray-300 rounded-xl py-10 text-center">

                <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />

                <p className="text-sm font-medium text-gray-700">
                  No departments yet
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Add your first department above.
                </p>

              </div>

            ) : (

              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">

                {departments.map(
                  (department) => (

                    <div
                      key={department.id}
                      className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50"
                    >

                      <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">

                        <Building2 className="h-4 w-4 text-indigo-600" />

                      </div>

                      <div className="flex-1 min-w-0">

                        <p className="text-sm font-medium text-gray-900 truncate">
                          {department.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          Active department
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteDepartment(
                            department
                          )
                        }
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete department"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

          {/* FOOTER */}

          <div className="flex justify-end pt-2 border-t border-gray-100">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>

          </div>

        </div>

      </Modal>

      <ConfirmDialog
        isOpen={
          !!deleteDepartment
        }
        onClose={() =>
          setDeleteDepartment(null)
        }
        onConfirm={handleDelete}
        title="Delete Department"
        message={
          deleteDepartment
            ? `Are you sure you want to delete "${deleteDepartment.name}"? The department will no longer be available for new employee or training assignments.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleting}
      />

    </>
  );
}