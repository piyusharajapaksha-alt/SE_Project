import { useEffect, useMemo, useState } from 'react';
import {
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Star,
  User,
  X,
} from 'lucide-react';

import { performanceService } from '@/services/performanceService';
import type {
  PerformanceReview,
  PerformanceReviewPayload,
} from '@/services/performanceService';

import { useToast } from '@/contexts/ToastContext';

type Status = 'Pending Review' | 'Completed';

interface FormState {
  employeeId: string;
  reviewPeriod: string;
  qualityOfWork: number;
  productivity: number;
  teamwork: number;
  communication: number;
  responsibility: number;
  problemSolving: number;
  managerFeedback: string;
  areasForImprovement: string;
  status: Status;
}

const EMPTY_FORM: FormState = {
  employeeId: '',
  reviewPeriod: '',
  qualityOfWork: 3,
  productivity: 3,
  teamwork: 3,
  communication: 3,
  responsibility: 3,
  problemSolving: 3,
  managerFeedback: '',
  areasForImprovement: '',
  status: 'Pending Review',
};

const KPI_FIELDS: {
  key: keyof Pick<
    FormState,
    | 'qualityOfWork'
    | 'productivity'
    | 'teamwork'
    | 'communication'
    | 'responsibility'
    | 'problemSolving'
  >;
  label: string;
}[] = [
  {
    key: 'qualityOfWork',
    label: 'Quality of Work',
  },
  {
    key: 'productivity',
    label: 'Productivity',
  },
  {
    key: 'teamwork',
    label: 'Teamwork',
  },
  {
    key: 'communication',
    label: 'Communication',
  },
  {
    key: 'responsibility',
    label: 'Responsibility',
  },
  {
    key: 'problemSolving',
    label: 'Problem Solving',
  },
];

function getCurrentMonth() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  return `${year}-${month}`;
}

function formatReviewMonth(value?: string) {
  if (!value) return '—';

  const [year, month] = value.split('-');

  if (!year || !month) {
    return value;
  }

  const date = new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function getRatingLabel(rating: number) {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 3.5) return 'Good';
  if (rating >= 2.5) return 'Satisfactory';
  if (rating >= 1.5) return 'Needs Improvement';

  return 'Unsatisfactory';
}

function getStatusClasses(status: Status) {
  if (status === 'Completed') {
    return 'bg-green-50 text-green-700 border-green-200';
  }

  return 'bg-amber-50 text-amber-700 border-amber-200';
}

export default function PerformanceManagementPage() {
  const { addToast } = useToast();

  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Status>(
    'All'
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] =
    useState<PerformanceReview | null>(null);

  const [form, setForm] = useState<FormState>({
    ...EMPTY_FORM,
    reviewPeriod: getCurrentMonth(),
  });

  const [saving, setSaving] = useState(false);

  const [expandedReviewId, setExpandedReviewId] =
    useState<string | number | null>(null);

  /**
   * Load performance reviews from backend.
   */
  const loadReviews = async (showRefreshLoader = false) => {
    try {
      setError('');

      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await performanceService.getAll();

      setReviews(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to load performance reviews.';

      setError(message);

      addToast(
        'error',
        message,
        'Performance Reviews'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  /**
   * Filter reviews for the UI.
   */
  const filteredReviews = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesSearch =
        !searchValue ||
        String(review.employeeId)
          .toLowerCase()
          .includes(searchValue) ||
        String(review.id)
          .toLowerCase()
          .includes(searchValue);

      const matchesMonth =
        !monthFilter ||
        review.reviewPeriod === monthFilter;

      const matchesStatus =
        statusFilter === 'All' ||
        review.status === statusFilter;

      return (
        matchesSearch &&
        matchesMonth &&
        matchesStatus
      );
    });
  }, [
    reviews,
    search,
    monthFilter,
    statusFilter,
  ]);

  /**
   * Calculate overall rating.
   */
  const overallRating = useMemo(() => {
    const values = KPI_FIELDS.map(
      ({ key }) => Number(form[key]) || 0
    );

    const total = values.reduce(
      (sum, value) => sum + value,
      0
    );

    return Number(
      (total / values.length).toFixed(2)
    );
  }, [form]);

  const openCreateModal = () => {
    setEditingReview(null);

    setForm({
      ...EMPTY_FORM,
      reviewPeriod: getCurrentMonth(),
    });

    setIsModalOpen(true);
  };

  const openEditModal = (review: PerformanceReview) => {
    setEditingReview(review);

    setForm({
      employeeId: review.employeeId ?? '',
      reviewPeriod: review.reviewPeriod ?? '',
      qualityOfWork: Number(review.qualityOfWork) || 1,
      productivity: Number(review.productivity) || 1,
      teamwork: Number(review.teamwork) || 1,
      communication: Number(review.communication) || 1,
      responsibility: Number(review.responsibility) || 1,
      problemSolving: Number(review.problemSolving) || 1,
      managerFeedback: review.managerFeedback ?? '',
      areasForImprovement:
        review.areasForImprovement ?? '',
      status:
        review.status === 'Completed'
          ? 'Completed'
          : 'Pending Review',
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingReview(null);
  };

  const updateForm = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateKpi = (
    field: keyof Pick<
      FormState,
      | 'qualityOfWork'
      | 'productivity'
      | 'teamwork'
      | 'communication'
      | 'responsibility'
      | 'problemSolving'
    >,
    value: number
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSave = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!form.employeeId.trim()) {
      addToast(
        'error',
        'Employee ID is required.',
        'Validation Error'
      );
      return;
    }

    if (!form.reviewPeriod) {
      addToast(
        'error',
        'Review month is required.',
        'Validation Error'
      );
      return;
    }

    const payload: PerformanceReviewPayload = {
      employeeId: form.employeeId.trim(),
      reviewPeriod: form.reviewPeriod,
      qualityOfWork: form.qualityOfWork,
      productivity: form.productivity,
      teamwork: form.teamwork,
      communication: form.communication,
      responsibility: form.responsibility,
      problemSolving: form.problemSolving,
      overallRating,
      managerFeedback:
        form.managerFeedback.trim(),
      areasForImprovement:
        form.areasForImprovement.trim(),
      status: form.status,
    };

    try {
      setSaving(true);

      if (editingReview) {
        await performanceService.update(
          editingReview.id,
          payload
        );

        addToast(
          'success',
          'Performance review updated successfully.',
          'Review Updated'
        );
      } else {
        await performanceService.create(payload);

        addToast(
          'success',
          'Performance review created successfully.',
          'Review Created'
        );
      }

      closeModal();

      await loadReviews(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to save performance review.';

      addToast(
        'error',
        message,
        'Save Failed'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100">
                <Award className="h-6 w-6 text-indigo-600" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Performance Management
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Manage monthly employee performance reviews
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => loadReviews(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? 'animate-spin'
                    : ''
                }`}
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              New Review
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search employee ID or review ID..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Month */}
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="month"
                value={monthFilter}
                onChange={(event) =>
                  setMonthFilter(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | 'All'
                    | Status
                )
              }
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="All">
                All Statuses
              </option>

              <option value="Pending Review">
                Pending Review
              </option>

              <option value="Completed">
                Completed
              </option>
            </select>
          </div>
        </div>

        {/* Summary */}
        {!loading && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Total Reviews
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {reviews.length}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Completed
              </p>

              <p className="mt-1 text-2xl font-bold text-green-600">
                {
                  reviews.filter(
                    (review) =>
                      review.status ===
                      'Completed'
                  ).length
                }
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Pending Review
              </p>

              <p className="mt-1 text-2xl font-bold text-amber-600">
                {
                  reviews.filter(
                    (review) =>
                      review.status ===
                      'Pending Review'
                  ).length
                }
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-gray-200 bg-white">
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />

              <p className="text-sm">
                Loading performance reviews...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <div className="flex flex-col items-center text-center">
              <p className="font-semibold text-red-800">
                Unable to load performance reviews
              </p>

              <p className="mt-1 max-w-xl text-sm text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() => loadReviews()}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          filteredReviews.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <Award className="h-7 w-7 text-gray-400" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No performance reviews found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                {reviews.length === 0
                  ? 'There are no performance reviews in the backend yet.'
                  : 'Try changing your search or filters.'}
              </p>

              {reviews.length === 0 && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  Create First Review
                </button>
              )}
            </div>
          )}

        {/* Review list */}
        {!loading &&
          !error &&
          filteredReviews.length > 0 && (
            <div className="space-y-4">
              {filteredReviews.map((review) => {
                const isExpanded =
                  expandedReviewId === review.id;

                const rating = Number(
                  review.overallRating
                ) || 0;

                return (
                  <div
                    key={review.id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                  >
                    {/* Main row */}
                    <div className="p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                            <User className="h-5 w-5 text-indigo-600" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-gray-900">
                                Employee{' '}
                                {review.employeeId}
                              </h3>

                              <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                                  review.status
                                )}`}
                              >
                                {review.status}
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays className="h-4 w-4" />

                                {formatReviewMonth(
                                  review.reviewPeriod
                                )}
                              </span>

                              <span>
                                Review ID:{' '}
                                {review.id}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-5 lg:justify-end">
                          <div className="text-left lg:text-right">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                              Overall Rating
                            </p>

                            <div className="mt-1 flex items-center gap-2">
                              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />

                              <span className="text-xl font-bold text-gray-900">
                                {rating.toFixed(2)}
                              </span>

                              <span className="text-sm text-gray-500">
                                / 5
                              </span>
                            </div>

                            <p className="text-xs text-gray-500">
                              {getRatingLabel(
                                rating
                              )}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  review
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              <Edit3 className="h-4 w-4" />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setExpandedReviewId(
                                  isExpanded
                                    ? null
                                    : review.id
                                )
                              }
                              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50"
                              aria-label={
                                isExpanded
                                  ? 'Collapse review'
                                  : 'Expand review'
                              }
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-gray-50 px-5 py-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {KPI_FIELDS.map(
                            ({ key, label }) => {
                              const value =
                                Number(
                                  review[key]
                                ) || 0;

                              return (
                                <div
                                  key={key}
                                  className="rounded-lg border border-gray-200 bg-white p-4"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">
                                      {label}
                                    </span>

                                    <span className="font-semibold text-gray-900">
                                      {value}/5
                                    </span>
                                  </div>

                                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                                    <div
                                      className="h-full rounded-full bg-indigo-500"
                                      style={{
                                        width: `${
                                          (value /
                                            5) *
                                          100
                                        }%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <h4 className="text-sm font-semibold text-gray-900">
                              Manager Feedback
                            </h4>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                              {review.managerFeedback ||
                                'No manager feedback provided.'}
                            </p>
                          </div>

                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <h4 className="text-sm font-semibold text-gray-900">
                              Areas for Improvement
                            </h4>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                              {review.areasForImprovement ||
                                'No improvement areas provided.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingReview
                    ? 'Edit Performance Review'
                    : 'Create Performance Review'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Monthly employee performance review
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body */}
            <form
              onSubmit={handleSave}
              className="overflow-y-auto"
            >
              <div className="space-y-6 p-6">

                {/* Basic information */}
                <section>
                  <h3 className="mb-4 text-sm font-semibold text-gray-900">
                    Review Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Employee ID
                      </label>

                      <input
                        type="text"
                        value={form.employeeId}
                        onChange={(event) =>
                          updateForm(
                            'employeeId',
                            event.target.value
                          )
                        }
                        placeholder="e.g. EMP001"
                        disabled={!!editingReview}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100 disabled:text-gray-500"
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
                          updateForm(
                            'reviewPeriod',
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>
                </section>

                {/* KPI ratings */}
                <section>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Performance Ratings
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Rate each area from 1 to 5
                      </p>
                    </div>

                    <div className="rounded-lg bg-indigo-50 px-4 py-2 text-right">
                      <p className="text-xs text-indigo-600">
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
                    {KPI_FIELDS.map(
                      ({ key, label }) => (
                        <div
                          key={key}
                          className="rounded-xl border border-gray-200 p-4"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              {label}
                            </span>

                            <span className="text-sm font-bold text-indigo-600">
                              {form[key]}/5
                            </span>
                          </div>

                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(
                              (rating) => (
                                <button
                                  key={rating}
                                  type="button"
                                  onClick={() =>
                                    updateKpi(
                                      key,
                                      rating
                                    )
                                  }
                                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition ${
                                    form[key] ===
                                    rating
                                      ? 'border-indigo-600 bg-indigo-600 text-white'
                                      : 'border-gray-300 bg-white text-gray-600 hover:border-indigo-400 hover:text-indigo-600'
                                  }`}
                                >
                                  {rating}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </section>

                {/* Feedback */}
                <section>
                  <h3 className="mb-4 text-sm font-semibold text-gray-900">
                    Feedback
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Manager Feedback
                      </label>

                      <textarea
                        rows={4}
                        value={form.managerFeedback}
                        onChange={(event) =>
                          updateForm(
                            'managerFeedback',
                            event.target.value
                          )
                        }
                        placeholder="Enter feedback about the employee's performance..."
                        className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Areas for Improvement
                      </label>

                      <textarea
                        rows={4}
                        value={
                          form.areasForImprovement
                        }
                        onChange={(event) =>
                          updateForm(
                            'areasForImprovement',
                            event.target.value
                          )
                        }
                        placeholder="Describe areas where the employee can improve..."
                        className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>
                </section>

                {/* Status */}
                <section>
                  <h3 className="mb-4 text-sm font-semibold text-gray-900">
                    Review Status
                  </h3>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateForm(
                          'status',
                          'Pending Review'
                        )
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        form.status ===
                        'Pending Review'
                          ? 'border-amber-400 bg-amber-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">
                        Pending Review
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Review is still being finalized
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateForm(
                          'status',
                          'Completed'
                        )
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        form.status === 'Completed'
                          ? 'border-green-400 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />

                        <p className="font-semibold text-gray-900">
                          Completed
                        </p>
                      </div>

                      <p className="mt-1 text-xs text-gray-500">
                        Review has been completed
                      </p>
                    </button>
                  </div>
                </section>
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingReview
                        ? 'Update Review'
                        : 'Create Review'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

