import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import {
  trainingService,
  TrainingEmployee,
  TrainingProgram,
  TrainingStatus,
} from '@/services/trainingService';

import {
  PageHeader,
  SearchInput,
  SelectFilter,
  Badge,
  Pagination,
  LoadingState,
  EmptyState,
  Modal,
  ConfirmDialog,
  FormInput,
  FormSelect,
  FormTextarea,
} from '@/components/ui';

import {
  GraduationCap,
  Plus,
  Users,
  UserPlus,
  UserMinus,
  Calendar,
  MapPin,
  Pencil,
  Trash2,
  Search,
  CheckCircle2,
  Clock3,
  CircleAlert,
  XCircle,
  UserCheck,
  UserRoundPlus,
  ClipboardCheck,
  History,
} from 'lucide-react';

const CATEGORIES = [
  'Technical',
  'Leadership',
  'Soft Skills',
  'HR',
  'Finance',
  'Compliance',
  'Other',
];

const STATUSES: TrainingStatus[] = [
  'Upcoming',
  'Ongoing',
  'Completed',
  'Cancelled',
];

const DEPARTMENTS = [
  'IT',
  'HR',
  'Finance',
  'Marketing',
  'Management',
];

type FormState = {
  title: string;
  description: string;
  trainer: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: string;
  trainingFor: string[];
  status: TrainingStatus;
};

const emptyForm: FormState = {
  title: '',
  description: '',
  trainer: '',
  category: 'Technical',
  startDate: '',
  endDate: '',
  location: '',
  capacity: '20',
  trainingFor: [],
  status: 'Upcoming',
};

function formatDate(date?: string) {
  if (!date) return 'Date not set';

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusBadge(status: TrainingStatus) {
  switch (status) {
    case 'Upcoming':
      return (
        <Badge variant="info">
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-blue-500" />
          Upcoming
        </Badge>
      );

    case 'Ongoing':
      return (
        <Badge variant="warning">
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-yellow-500" />
          Ongoing
        </Badge>
      );

    case 'Completed':
      return (
        <Badge variant="success">
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-green-500" />
          Completed
        </Badge>
      );

    case 'Cancelled':
      return (
        <Badge variant="danger">
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-red-500" />
          Cancelled
        </Badge>
      );

    default:
      return (
        <Badge variant="info">
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-gray-400" />
          {status}
        </Badge>
      );
  }
}

export default function TrainingPage() {
  const { user, checkPermission } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();

  const isManagementView =
    location.pathname.startsWith('/management/');

  const canManage =
    isManagementView &&
    checkPermission('training.manage');

  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  const [showForm, setShowForm] = useState(false);
  const [editingProgram, setEditingProgram] =
    useState<TrainingProgram | null>(null);

  const [showDetail, setShowDetail] =
    useState<TrainingProgram | null>(null);

  const [showEmployees, setShowEmployees] =
    useState<TrainingProgram | null>(null);

  const [showAssign, setShowAssign] =
    useState<TrainingProgram | null>(null);

  const [showDelete, setShowDelete] =
    useState<TrainingProgram | null>(null);

  const [form, setForm] =
    useState<FormState>(emptyForm);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [selectedEmployees, setSelectedEmployees] =
    useState<string[]>([]);

  const [employeeSearch, setEmployeeSearch] =
    useState('');

  const [assignedEmployees, setAssignedEmployees] =
    useState<TrainingEmployee[]>([]);

  const [allEmployees, setAllEmployees] =
    useState<TrainingEmployee[]>([]);

  const [employeesLoading, setEmployeesLoading] =
    useState(false);

  useEffect(() => {
    loadPrograms();
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadPrograms = async () => {
    setLoading(true);

    try {
      const data = await trainingService.getAll({
        search,
        category: categoryFilter,
        status: statusFilter,
      });

      setPrograms(data as TrainingProgram[]);

      const maxPage = Math.max(
        1,
        Math.ceil(data.length / perPage)
      );

      if (currentPage > maxPage) {
        setCurrentPage(maxPage);
      }
    } catch {
      addToast('error', 'Failed to load training programs');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data =
        await trainingService.getAllEmployees();

      setAllEmployees(data);
    } catch {
      addToast('error', 'Failed to load employees');
    }
  };

  const managementStats = useMemo(() => {
    return {
      total: programs.length,
      upcoming: programs.filter(
        (p) => p.status === 'Upcoming'
      ).length,
      ongoing: programs.filter(
        (p) => p.status === 'Ongoing'
      ).length,
      completed: programs.filter(
        (p) => p.status === 'Completed'
      ).length,
    };
  }, [programs]);

  const employeePrograms = useMemo(() => {
    if (!user?.employeeId) {
      return programs;
    }

    return programs.filter(
      (program) =>
        program.assignedEmployeeIds.includes(
          user.employeeId
        ) ||
        program.registeredEmployeeIds.includes(
          user.employeeId
        )
    );
  }, [programs, user]);

  const pastPrograms = useMemo(() => {
    if (!user?.employeeId) {
      return [];
    }

    return programs.filter(
      (program) =>
        program.status === 'Completed' &&
        (
          program.assignedEmployeeIds.includes(
            user.employeeId
          ) ||
          program.registeredEmployeeIds.includes(
            user.employeeId
          )
        )
    );
  }, [programs, user]);

  const pagedPrograms = programs.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const openCreate = () => {
    setEditingProgram(null);
    setForm(emptyForm);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (program: TrainingProgram) => {
    setEditingProgram(program);

    setForm({
      title: program.title,
      description: program.description,
      trainer: program.trainer,
      category: program.category,
      startDate: program.startDate,
      endDate: program.endDate ?? '',
      location: program.location,
      capacity: String(program.capacity),
      trainingFor: [...program.trainingFor],
      status: program.status,
    });

    setErrors({});
    setShowForm(true);
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.title.trim()) {
      nextErrors.title = 'Training title is required';
    }

    if (!form.trainer.trim()) {
      nextErrors.trainer = 'Trainer is required';
    }

    if (!form.category) {
      nextErrors.category = 'Category is required';
    }

    if (!form.startDate) {
      nextErrors.startDate = 'Start date is required';
    }

    // End date intentionally NOT required.

    if (
      form.endDate &&
      form.startDate &&
      form.endDate < form.startDate
    ) {
      nextErrors.endDate =
        'End date cannot be before start date';
    }

    if (!form.location.trim()) {
      nextErrors.location = 'Location is required';
    }

    const capacity = Number(form.capacity);

    if (!form.capacity || capacity <= 0) {
      nextErrors.capacity =
        'Capacity must be greater than 0';
    }

    if (form.trainingFor.length === 0) {
      nextErrors.trainingFor =
        'Select at least one department';
    }

    if (!form.status) {
      nextErrors.status = 'Status is required';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        trainer: form.trainer.trim(),
        category: form.category,
        startDate: form.startDate,
        endDate: form.endDate,
        location: form.location.trim(),
        capacity: Number(form.capacity),
        trainingFor: form.trainingFor,
        status: form.status,
      };

      if (editingProgram) {
        await trainingService.update(
          editingProgram.id,
          payload
        );

        addToast(
          'success',
          'Training program updated successfully'
        );
      } else {
        await trainingService.create(payload);

        addToast(
          'success',
          'Training program created successfully'
        );
      }

      setShowForm(false);
      setEditingProgram(null);
      setForm(emptyForm);
      await loadPrograms();
    } catch (error: any) {
      addToast(
        'error',
        error?.message ||
          'Failed to save training program'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!showDelete) return;

    setDeleting(true);

    try {
      await trainingService.delete(showDelete.id);

      addToast(
        'success',
        'Training program deleted'
      );

      setShowDelete(null);
      await loadPrograms();
    } catch (error: any) {
      addToast(
        'error',
        error?.message ||
          'Unable to delete this training'
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleRegister = async (
    program: TrainingProgram
  ) => {
    if (!user?.employeeId) {
      addToast(
        'error',
        'Employee account not available'
      );
      return;
    }

    try {
      await trainingService.register(
        program.id,
        user.employeeId
      );

      addToast(
        'success',
        'You are now registered for this training'
      );

      await loadPrograms();
    } catch (error: any) {
      addToast(
        'error',
        error?.message ||
          'Unable to register for training'
      );
    }
  };

  const handleUnregister = async (
    program: TrainingProgram
  ) => {
    if (!user?.employeeId) return;

    try {
      await trainingService.unregister(
        program.id,
        user.employeeId
      );

      addToast(
        'success',
        'You have been unregistered'
      );

      await loadPrograms();
    } catch (error: any) {
      addToast(
        'error',
        error?.message ||
          'Unable to unregister'
      );
    }
  };

  const openEmployees = async (
    program: TrainingProgram
  ) => {
    setShowEmployees(program);
    setEmployeesLoading(true);

    try {
      const employees =
        await trainingService.getEmployees(
          program.id
        );

      setAssignedEmployees(employees);
    } catch {
      addToast(
        'error',
        'Failed to load training employees'
      );
    } finally {
      setEmployeesLoading(false);
    }
  };

  const openAssign = (program: TrainingProgram) => {
    setShowAssign(program);
    setSelectedEmployees([]);
    setEmployeeSearch('');
  };

  const assignEmployees = async () => {
    if (!showAssign) return;

    if (selectedEmployees.length === 0) {
      addToast(
        'error',
        'Select at least one employee'
      );
      return;
    }

    try {
      await trainingService.assignEmployees(
        showAssign.id,
        selectedEmployees
      );

      addToast(
        'success',
        `${selectedEmployees.length} employee(s) assigned`
      );

      setShowAssign(null);
      await loadPrograms();
    } catch (error: any) {
      addToast(
        'error',
        error?.message ||
          'Failed to assign employees'
      );
    }
  };

  const removeAssignment = async (
    employeeId: string
  ) => {
    if (!showEmployees) return;

    try {
      await trainingService.removeAssignment(
        showEmployees.id,
        employeeId
      );

      addToast(
        'success',
        'Employee removed from training'
      );

      await openEmployees(showEmployees);
      await loadPrograms();
    } catch (error: any) {
      addToast(
        'error',
        error?.message ||
          'Failed to remove employee'
      );
    }
  };

  const toggleDepartment = (
    department: string
  ) => {
    setForm((current) => ({
      ...current,
      trainingFor: current.trainingFor.includes(
        department
      )
        ? current.trainingFor.filter(
            (item) => item !== department
          )
        : [
            ...current.trainingFor,
            department,
          ],
    }));
  };

  const toggleEmployee = (
    employeeId: string
  ) => {
    setSelectedEmployees((current) =>
      current.includes(employeeId)
        ? current.filter(
            (id) => id !== employeeId
          )
        : [...current, employeeId]
    );
  };

  const availableEmployees = allEmployees.filter(
    (employee) => {
      if (!showAssign) return false;

      if (
        showAssign.assignedEmployeeIds.includes(
          employee.id
        )
      ) {
        return false;
      }

      const searchValue =
        employeeSearch.toLowerCase();

      return (
        employee.name
          .toLowerCase()
          .includes(searchValue) ||
        employee.employeeNumber
          .toLowerCase()
          .includes(searchValue) ||
        employee.department
          .toLowerCase()
          .includes(searchValue)
      );
    }
  );

  const renderTrainingCard = (
    program: TrainingProgram
  ) => {
    const isAssigned =
      !!user?.employeeId &&
      program.assignedEmployeeIds.includes(
        user.employeeId
      );

    const isRegistered =
      !!user?.employeeId &&
      program.registeredEmployeeIds.includes(
        user.employeeId
      );

    const registeredCount =
      program.registeredEmployeeIds.length;

    const availableSeats = Math.max(
      0,
      program.capacity - registeredCount
    );

    const progress =
      program.capacity > 0
        ? Math.min(
            100,
            (registeredCount / program.capacity) * 100
          )
        : 0;

    return (
      <div
        key={program.id}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-indigo-600" />
                </div>

                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {program.title}
                  </h3>

                  <p className="text-xs text-gray-500">
                    {program.category}
                  </p>
                </div>
              </div>
            </div>

            {getStatusBadge(program.status)}
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {program.trainingFor.map(
              (department) => (
                <span
                  key={department}
                  className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-[11px] font-medium"
                >
                  {department}
                </span>
              )
            )}
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
            {program.description ||
              'No description provided.'}
          </p>

          <div className="mt-4 space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(program.startDate)}
                {program.endDate
                  ? ` - ${formatDate(
                      program.endDate
                    )}`
                  : ' • One day / end date not set'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{program.location}</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                {registeredCount}/
                {program.capacity} registered
              </span>

              <span className="ml-auto font-medium text-gray-700">
                {availableSeats} seats left
              </span>
            </div>
          </div>

          <div className="mt-3">
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>

          {canManage && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              <button
                onClick={() =>
                  openEmployees(program)
                }
                className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 flex items-center justify-center gap-1.5"
              >
                <Users className="h-3.5 w-3.5" />
                Employees
              </button>

              <button
                onClick={() =>
                  openEdit(program)
                }
                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 flex items-center justify-center gap-1.5"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>

              <button
                onClick={() =>
                  setShowDelete(program)
                }
                className="px-3 py-2 rounded-lg bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          )}

          {!canManage && (
            <div className="mt-4 flex items-center gap-2">
              {isAssigned && (
                <span className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5" />
                  Assigned to you
                </span>
              )}

              {isRegistered ? (
                <button
                  onClick={() =>
                    handleUnregister(program)
                  }
                  disabled={
                    program.status !==
                    'Upcoming'
                  }
                  className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 disabled:opacity-50 flex items-center gap-1"
                >
                  <UserMinus className="h-3.5 w-3.5" />
                  Unregister
                </button>
              ) : isAssigned &&
                program.status === 'Upcoming' &&
                availableSeats > 0 ? (
                <button
                  onClick={() =>
                    handleRegister(program)
                  }
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 flex items-center gap-1"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Register
                </button>
              ) : program.status ===
                'Upcoming' &&
                availableSeats === 0 ? (
                <span className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-xs font-medium">
                  Full
                </span>
              ) : null}

              <button
                onClick={() =>
                  setShowDetail(program)
                }
                className="ml-auto px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50"
              >
                Details
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          canManage
            ? 'Training Management'
            : 'Training Programs'
        }
        description={
          canManage
            ? 'Create training programs, assign employees and manage training records.'
            : 'View your assigned training programs, registrations and training history.'
        }
        action={
          canManage ? (
            <button
              onClick={openCreate}
              className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Training
            </button>
          ) : undefined
        }
      />

      {canManage && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Total Programs
              </p>
              <GraduationCap className="h-5 w-5 text-indigo-500" />
            </div>

            <p className="text-2xl font-bold text-gray-900 mt-2">
              {managementStats.total}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Upcoming
              </p>
              <Clock3 className="h-5 w-5 text-blue-500" />
            </div>

            <p className="text-2xl font-bold text-gray-900 mt-2">
              {managementStats.upcoming}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Ongoing
              </p>
              <CircleAlert className="h-5 w-5 text-orange-500" />
            </div>

            <p className="text-2xl font-bold text-gray-900 mt-2">
              {managementStats.ongoing}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Completed
              </p>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>

            <p className="text-2xl font-bold text-gray-900 mt-2">
              {managementStats.completed}
            </p>
          </div>
        </div>
      )}

      {!canManage && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-indigo-50 border border-indigo-100 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  Your Training
                </h3>

                <p className="text-sm text-gray-600 mt-1">
                  You can register for training programs
                  that have been assigned to you.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs text-gray-500">
              My Past Training
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-2">
              {pastPrograms.length}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                setCurrentPage(1);
              }}
              placeholder="Search training programs..."
            />
          </div>

          <SelectFilter
            value={categoryFilter}
            onChange={(value) => {
              setCategoryFilter(value);
              setCurrentPage(1);
            }}
            options={[
              'All',
              ...CATEGORIES,
            ]}
          />

          <SelectFilter
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
            options={[
              'All',
              ...STATUSES,
            ]}
          />
        </div>
      </div>

      {!canManage &&
        employeePrograms.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  My Assigned Training
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Training programs assigned to you.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employeePrograms
                .filter(
                  (program) =>
                    program.status !== 'Completed'
                )
                .map(renderTrainingCard)}
            </div>
          </div>
        )}

      {!canManage &&
        pastPrograms.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <History className="h-5 w-5 text-gray-600" />

              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Past Training
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Your completed training history.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastPrograms.map(
                renderTrainingCard
              )}
            </div>
          </div>
        )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              {canManage
                ? 'All Training Programs'
                : 'Available Training Programs'}
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              {canManage
                ? 'Manage your organisation training programs.'
                : 'Training programs currently available in StaffHub.'}
            </p>
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : programs.length === 0 ? (
          <EmptyState
            icon={
              <GraduationCap className="h-6 w-6" />
            }
            title="No training programs found"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pagedPrograms.map(
                renderTrainingCard
              )}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(
                programs.length / perPage
              )}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* ======================================================
          CREATE / EDIT TRAINING
      ======================================================= */}

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingProgram(null);
        }}
        title={
          editingProgram
            ? 'Edit Training Program'
            : 'Create Training Program'
        }
        size="lg"
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormInput
                label="Training Title"
                required
                value={form.title}
                onChange={(event) =>
                  setForm({
                    ...form,
                    title: event.target.value,
                  })
                }
                error={errors.title}
                placeholder="e.g. Advanced Cybersecurity Awareness"
              />
            </div>

            <div className="md:col-span-2">
              <FormTextarea
                label="Description"
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description:
                      event.target.value,
                  })
                }
                rows={3}
                placeholder="Describe what employees will learn..."
              />
            </div>

            <FormInput
              label="Trainer"
              required
              value={form.trainer}
              onChange={(event) =>
                setForm({
                  ...form,
                  trainer: event.target.value,
                })
              }
              error={errors.trainer}
              placeholder="Trainer name"
            />

            <FormSelect
              label="Category"
              required
              value={form.category}
              onChange={(event) =>
                setForm({
                  ...form,
                  category:
                    event.target.value,
                })
              }
              options={CATEGORIES.map(
                (category) => ({
                  value: category,
                  label: category,
                })
              )}
            />

            <FormInput
              label="Start Date"
              type="date"
              required
              value={form.startDate}
              onChange={(event) =>
                setForm({
                  ...form,
                  startDate:
                    event.target.value,
                })
              }
              error={errors.startDate}
            />

            <FormInput
              label="End Date"
              type="date"
              value={form.endDate}
              onChange={(event) =>
                setForm({
                  ...form,
                  endDate:
                    event.target.value,
                })
              }
              error={errors.endDate}
            />

            <FormInput
              label="Location"
              required
              value={form.location}
              onChange={(event) =>
                setForm({
                  ...form,
                  location:
                    event.target.value,
                })
              }
              error={errors.location}
              placeholder="e.g. Training Room 01"
            />

            <FormInput
              label="Capacity"
              type="number"
              required
              min="1"
              value={form.capacity}
              onChange={(event) =>
                setForm({
                  ...form,
                  capacity:
                    event.target.value,
                })
              }
              error={errors.capacity}
            />

            <div className="md:col-span-2">
              <FormSelect
                label="Status"
                required
                value={form.status}
                onChange={(event) =>
                  setForm({
                    ...form,
                    status:
                      event.target
                        .value as TrainingStatus,
                  })
                }
                options={STATUSES.map(
                  (status) => ({
                    value: status,
                    label: status,
                  })
                )}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Training For
              <span className="text-red-500 ml-1">
                *
              </span>
            </label>

            <p className="text-xs text-gray-500 mb-3">
              Select the departments that should
              be eligible for this training.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {DEPARTMENTS.map(
                (department) => {
                  const selected =
                    form.trainingFor.includes(
                      department
                    );

                  return (
                    <button
                      type="button"
                      key={department}
                      onClick={() =>
                        toggleDepartment(
                          department
                        )
                      }
                      className={`px-3 py-2.5 rounded-lg border text-sm font-medium text-left transition-colors ${
                        selected
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-4 w-4 rounded border flex items-center justify-center ${
                            selected
                              ? 'border-indigo-600 bg-indigo-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {selected && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                          )}
                        </span>

                        {department}
                      </div>
                    </button>
                  );
                }
              )}
            </div>

            {errors.trainingFor && (
              <p className="text-xs text-red-600 mt-2">
                {errors.trainingFor}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingProgram(null);
              }}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving
                ? 'Saving...'
                : editingProgram
                  ? 'Save Changes'
                  : 'Create Training'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ======================================================
          TRAINING DETAILS
      ======================================================= */}

      <Modal
        isOpen={!!showDetail}
        onClose={() => setShowDetail(null)}
        title={
          showDetail?.title ||
          'Training Details'
        }
        size="lg"
      >
        {showDetail && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              {getStatusBadge(
                showDetail.status
              )}

              <span className="text-xs text-gray-500">
                {showDetail.category}
              </span>
            </div>

            <p className="text-sm text-gray-600">
              {showDetail.description ||
                'No description provided.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">
                  Trainer
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {showDetail.trainer}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Location
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {showDetail.location}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Start Date
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {formatDate(
                    showDetail.startDate
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  End Date
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {showDetail.endDate
                    ? formatDate(
                        showDetail.endDate
                      )
                    : 'Not specified'}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Capacity
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {showDetail.capacity}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Registered
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {
                    showDetail.registeredEmployeeIds.length
                  }{' '}
                  / {showDetail.capacity}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">
                Training For
              </p>

              <div className="flex flex-wrap gap-2">
                {showDetail.trainingFor.map(
                  (department) => (
                    <span
                      key={department}
                      className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
                    >
                      {department}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================================
          EMPLOYEE MANAGEMENT
      ======================================================= */}

      <Modal
        isOpen={!!showEmployees}
        onClose={() =>
          setShowEmployees(null)
        }
        title={
          showEmployees
            ? `Employees — ${showEmployees.title}`
            : 'Employees'
        }
        size="xl"
      >
        {showEmployees && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">
                  {showEmployees.assignedEmployeeIds.length}{' '}
                  assigned •{' '}
                  {
                    showEmployees.registeredEmployeeIds.length
                  }{' '}
                  registered •{' '}
                  {Math.max(
                    0,
                    showEmployees.assignedEmployeeIds.length -
                      showEmployees.registeredEmployeeIds.length
                  )}{' '}
                  not registered
                </p>
              </div>

              <button
                onClick={() =>
                  openAssign(showEmployees)
                }
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 flex items-center gap-2"
              >
                <UserRoundPlus className="h-4 w-4" />
                Assign Employee
              </button>
            </div>

            {employeesLoading ? (
              <LoadingState />
            ) : assignedEmployees.length ===
              0 ? (
              <div className="py-10 text-center border border-dashed border-gray-300 rounded-xl">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />

                <p className="text-sm font-medium text-gray-700">
                  No employees assigned
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Assign employees to this training
                  program.
                </p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">
                          Employee
                        </th>

                        <th className="text-left px-4 py-3 font-medium text-gray-500">
                          Department
                        </th>

                        <th className="text-left px-4 py-3 font-medium text-gray-500">
                          Registration
                        </th>

                        <th className="text-left px-4 py-3 font-medium text-gray-500">
                          Attendance
                        </th>

                        <th className="text-left px-4 py-3 font-medium text-gray-500">
                          Completion
                        </th>

                        <th className="px-4 py-3" />
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {assignedEmployees.map(
                        (employee) => (
                          <tr
                            key={employee.id}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {employee.name}
                                </p>

                                <p className="text-xs text-gray-500">
                                  {
                                    employee.employeeNumber
                                  }
                                </p>
                              </div>
                            </td>

                            <td className="px-4 py-3 text-gray-600">
                              {employee.department}
                            </td>

                            <td className="px-4 py-3">
                              {employee.registrationStatus ===
                              'Registered' ? (
                                <span className="text-xs font-medium text-green-700 flex items-center gap-1">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Registered
                                </span>
                              ) : (
                                <span className="text-xs font-medium text-gray-500">
                                  Not Registered
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <span className="text-xs text-gray-600">
                                {
                                  employee.attendanceStatus
                                }
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <span className="text-xs text-gray-600">
                                {
                                  employee.completionStatus
                                }
                              </span>
                            </td>

                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() =>
                                  removeAssignment(
                                    employee.id
                                  )
                                }
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                title="Remove assignment"
                              >
                                <UserMinus className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ======================================================
          ASSIGN EMPLOYEES
      ======================================================= */}

      <Modal
        isOpen={!!showAssign}
        onClose={() => setShowAssign(null)}
        title="Assign Employees"
        size="lg"
      >
        {showAssign && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">
                Select employees who should be assigned
                to:
              </p>

              <p className="font-semibold text-gray-900 mt-1">
                {showAssign.title}
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

              <input
                value={employeeSearch}
                onChange={(event) =>
                  setEmployeeSearch(
                    event.target.value
                  )
                }
                placeholder="Search employee..."
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="border border-gray-200 rounded-xl max-h-[350px] overflow-y-auto divide-y divide-gray-100">
              {availableEmployees.length ===
              0 ? (
                <div className="py-10 text-center">
                  <Users className="h-7 w-7 text-gray-400 mx-auto mb-2" />

                  <p className="text-sm text-gray-600">
                    No employees available
                  </p>
                </div>
              ) : (
                availableEmployees.map(
                  (employee) => {
                    const selected =
                      selectedEmployees.includes(
                        employee.id
                      );

                    return (
                      <button
                        key={employee.id}
                        type="button"
                        onClick={() =>
                          toggleEmployee(
                            employee.id
                          )
                        }
                        className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 ${
                          selected
                            ? 'bg-indigo-50'
                            : ''
                        }`}
                      >
                        <span
                          className={`h-5 w-5 rounded border flex items-center justify-center ${
                            selected
                              ? 'bg-indigo-600 border-indigo-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {selected && (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          )}
                        </span>

                        <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                          {employee.name
                            .split(' ')
                            .map(
                              (part) =>
                                part[0]
                            )
                            .slice(0, 2)
                            .join('')}
                        </div>

                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {employee.name}
                          </p>

                          <p className="text-xs text-gray-500">
                            {
                              employee.employeeNumber
                            }{' '}
                            •{' '}
                            {
                              employee.department
                            }
                          </p>
                        </div>
                      </button>
                    );
                  }
                )
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {selectedEmployees.length}{' '}
                employee(s) selected
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowAssign(null)
                  }
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={assignEmployees}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!showDelete}
        onClose={() => setShowDelete(null)}
        onConfirm={handleDelete}
        title="Delete Training Program"
        message={
          showDelete &&
          showDelete.registeredEmployeeIds.length > 0
            ? 'This training already has registered employees and cannot be deleted. You should cancel or mark it completed instead.'
            : 'Are you sure you want to delete this training program? This action cannot be undone.'
        }
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}