import { useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Edit3,
  Plus,
  Save,
  Star,
  X,
} from 'lucide-react';

import { performanceService } from '@/services/performanceService';
import { useToast } from '@/contexts/ToastContext';

interface PerformanceReview {
  id?: string | number;
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

interface PerformanceManagementPageProps {
  editingReview?: PerformanceReview | null;
  onSaved?: () => void;
}

const KPI_FIELDS = [
  {
    key: 'qualityOfWork',
    label: 'Quality of Work',
    description: 'Accuracy, quality and standard of work',
  },
  {
    key: 'productivity',
    label: 'Productivity',
    description: 'Efficiency and ability to complete assigned work',
  },
  {
    key: 'teamwork',
    label: 'Teamwork',
    description: 'Collaboration and support for team members',
  },
  {
    key: 'communication',
    label: 'Communication',
    description: 'Clarity and effectiveness of communication',
  },
  {
    key: 'responsibility',
    label: 'Responsibility',
    description: 'Attendance, reliability and ownership',
  },
  {
    key: 'problemSolving',
    label: 'Problem Solving',
    description: 'Ability to identify and solve problems',
  },
] as const;

type KpiKey = (typeof KPI_FIELDS)[number]['key'];

const getCurrentMonth = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${year}-${month}`;
};

const createEmptyReview = (): PerformanceReview => ({
  employeeId: '',
  reviewPeriod: getCurrentMonth(),

  qualityOfWork: 0,
  productivity: 0,
  teamwork: 0,
  communication: 0,
  responsibility: 0,
  problemSolving: 0,

  overallRating: 0,

  managerFeedback: '',
  areasForImprovement: '',

  status: 'Pending Review',
});

const formatReviewMonth = (value: string) => {
  if (!value) return '';

  const [year, month] = value.split('-');

  if (!year || !month) return value;

  const date = new Date(Number(year), Number(month) - 1, 1);

  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

export default function PerformanceManagementPage({
  editingReview = null,
  onSaved,
}: PerformanceManagementPageProps) {
  const { showToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<PerformanceReview>(
    editingReview || createEmptyReview()
  );

  const isEditing = Boolean(editingReview?.id);

  const overallRating = useMemo(() => {
    const ratings = KPI_FIELDS.map(
      (field) => form[field.key]
    );

    const completedRatings = ratings.filter(
      (rating) => rating > 0
    );

    if (completedRatings.length === 0) {
      return 0;
    }

    const total = completedRatings.reduce(
      (sum, rating) => sum + rating,
      0
    );

    return Number(
      (total / completedRatings.length).toFixed(2)
    );
  }, [form]);

  const updateField = (
    field: keyof PerformanceReview,
    value: string | number
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateKpi = (field: KpiKey, value: number) => {
    setForm((current) => ({
      ...current,
      [field]: value,
      overallRating: value,
    }));
  };

  const resetForm = () => {
    setForm(editingReview || createEmptyReview());
  };

  const closeModal = () => {
    if (saving) return;

    setIsOpen(false);
    resetForm();
  };

  const openCreate = () => {
    setForm(createEmptyReview());
    setIsOpen(true);
  };

  const openEdit = (review: PerformanceReview) => {
    setForm(review);
    setIsOpen(true);
  };

  const validateForm = () => {
    if (!form.employeeId.trim()) {
      showToast('Employee ID is required.', 'error');
      return false;
    }

    if (!form.reviewPeriod) {
      showToast('Review month is required.', 'error');
      return false;
    }

    const missingKpi = KPI_FIELDS.find(
      (field) => form[field.key] < 1
    );

    if (missingKpi) {
      showToast(
        `Please give a rating for ${missingKpi.label}.`,
        'error'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);

    try {
      const payload = {
        employeeId: form.employeeId.trim(),
        reviewPeriod: form.reviewPeriod,

        qualityOfWork: form.qualityOfWork,
        productivity: form.productivity,
        teamwork: form.teamwork,
        communication: form.communication,
        responsibility: form.responsibility,
        problemSolving: form.problemSolving,

        overallRating,

        managerFeedback: form.managerFeedback.trim(),
        areasForImprovement:
          form.areasForImprovement.trim(),

        status: form.status,
      };

      if (isEditing && form.id) {
        await performanceService.update(
          form.id,
          payload
        );

        showToast(
          'Performance review updated successfully.',
          'success'
        );
      } else {
        await performanceService.create(payload);

        showToast(
          'Performance review created successfully.',
          'success'
        );
      }

      setIsOpen(false);
      resetForm();

      onSaved?.();
    } catch (error) {
      console.error(
        'Performance review save error:',
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : 'Unable to save performance review.';

      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
              <Award className="h-5 w-5 text-indigo-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Performance Management
              </h1>

              <p className="text-sm text-gray-500">
                Create and edit monthly employee performance reviews
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Create Monthly Review
        </button>
      </div>

      {/* Information card */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />

          <div>
            <h2 className="text-sm font-semibold text-indigo-900">
              Monthly Performance Reviews
            </h2>

            <p className="mt-1 text-sm text-indigo-700">
              Each employee can receive a performance review
              for a specific month. The overall rating is
              automatically calculated from the six KPI ratings.
            </p>
          </div>
        </div>
      </div>

      {/* CRUD information */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Review Management
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Use the button above to create a new monthly
              performance review. Existing reviews can be edited
              from the performance review list.
            </p>
          </div>

          <Edit3 className="hidden h-6 w-6 text-gray-400 sm:block" />
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
          />

          <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {isEditing
                    ? 'Edit Performance Review'
                    : 'Create Monthly Performance Review'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {isEditing
                    ? 'Update the employee performance review.'
                    : 'Enter the monthly performance information.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <section>
                  <h3 className="mb-4 text-sm font-semibold text-gray-900">
                    Review Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Employee ID
                      </label>

                      <input
                        type="text"
                        value={form.employeeId}
                        onChange={(event) =>
                          updateField(
                            'employeeId',
                            event.target.value
                          )
                        }
                        placeholder="Example: EMP001"
                        disabled={saving}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Review Month
                      </label>

                      <input
                        type="month"
                        value={form.reviewPeriod}
                        onChange={(event) =>
                          updateField(
                            'reviewPeriod',
                            event.target.value
                          )
                        }
                        disabled={saving}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                      />

                      {form.reviewPeriod && (
                        <p className="mt-1.5 text-xs text-gray-500">
                          {formatReviewMonth(
                            form.reviewPeriod
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {/* KPI Ratings */}
                <section>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        KPI Ratings
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Rate each area from 1 to 5.
                      </p>
                    </div>

                    <div className="rounded-lg bg-indigo-50 px-3 py-2 text-center">
                      <p className="text-xs font-medium text-indigo-600">
                        Overall Rating
                      </p>

                      <p className="text-xl font-bold text-indigo-700">
                        {overallRating.toFixed(2)}
                        <span className="text-sm font-medium">
                          /5
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {KPI_FIELDS.map((field) => {
                      const rating = form[field.key];

                      return (
                        <div
                          key={field.key}
                          className="rounded-xl border border-gray-200 p-4"
                        >
                          <div className="mb-3">
                            <p className="text-sm font-semibold text-gray-900">
                              {field.label}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-500">
                              {field.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(
                              (value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() =>
                                    updateKpi(
                                      field.key,
                                      value
                                    )
                                  }
                                  disabled={saving}
                                  className="rounded-md p-1 transition hover:bg-amber-50 disabled:cursor-not-allowed"
                                  aria-label={`${field.label}: ${value} out of 5`}
                                >
                                  <Star
                                    className={`h-6 w-6 ${
                                      value <= rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                </button>
                              )
                            )}

                            <span className="ml-2 text-sm font-semibold text-gray-700">
                              {rating > 0
                                ? `${rating}/5`
                                : 'Not rated'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Status */}
                <section>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Review Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateField(
                        'status',
                        event.target.value as
                          | 'Pending Review'
                          | 'Completed'
                      )
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="Pending Review">
                      Pending Review
                    </option>

                    <option value="Completed">
                      Completed
                    </option>
                  </select>
                </section>

                {/* Manager Feedback */}
                <section>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Manager Feedback
                  </label>

                  <textarea
                    value={form.managerFeedback}
                    onChange={(event) =>
                      updateField(
                        'managerFeedback',
                        event.target.value
                      )
                    }
                    rows={4}
                    placeholder="Enter feedback about the employee's performance..."
                    disabled={saving}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                  />
                </section>

                {/* Areas for Improvement */}
                <section>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Areas for Improvement
                  </label>

                  <textarea
                    value={form.areasForImprovement}
                    onChange={(event) =>
                      updateField(
                        'areasForImprovement',
                        event.target.value
                      )
                    }
                    rows={4}
                    placeholder="Describe areas where the employee can improve..."
                    disabled={saving}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                  />
                </section>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />

                    {isEditing
                      ? 'Update Review'
                      : 'Create Review'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}