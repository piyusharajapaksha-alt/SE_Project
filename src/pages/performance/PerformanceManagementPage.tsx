import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';

import {
  ChevronDown,
  ChevronUp,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';

import { performanceService } from '@/services/performanceService';

import type {
  PerformanceReview,
  PerformanceReviewPayload,
} from '@/services/performanceService';

import { useToast } from '@/contexts/ToastContext';

const EMPTY_FORM: PerformanceReviewPayload = {
  employeeId: '',
  reviewPeriod: new Date().toISOString().slice(0, 7),

  qualityOfWork: 3,
  productivity: 3,
  teamwork: 3,
  communication: 3,
  responsibility: 3,
  problemSolving: 3,

  overallRating: 3,

  managerFeedback: '',
  areasForImprovement: '',

  status: 'Pending Review',
};

const KPI_FIELDS = [
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
] as const;

type KPIKey = (typeof KPI_FIELDS)[number]['key'];

export default function PerformanceManagementPage() {

  const { addToast } = useToast();

  const [reviews, setReviews] = useState<
    PerformanceReview[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<'All' | 'Pending Review' | 'Completed'>(
      'All'
    );

  const [expandedId, setExpandedId] =
    useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingReview, setEditingReview] =
    useState<PerformanceReview | null>(null);

  const [form, setForm] =
    useState<PerformanceReviewPayload>(
      EMPTY_FORM
    );

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  // ============================================================
  // LOAD REVIEWS
  // ============================================================

  const loadReviews = useCallback(
    async (showRefresh = false) => {

      try {

        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError('');

        const data =
          await performanceService.getAll();

        setReviews(data);

      } catch (err) {

        const message =
          err instanceof Error
            ? err.message
            : 'Failed to load performance reviews';

        setError(message);

      } finally {

        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredReviews = useMemo(() => {

    const searchValue =
      search.trim().toLowerCase();

    return reviews.filter((review) => {

      const matchesSearch =
        !searchValue ||
        review.employeeId
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

  // ============================================================
  // SUMMARY
  // ============================================================

  const completedCount =
    reviews.filter(
      (review) =>
        review.status === 'Completed'
    ).length;

  const pendingCount =
    reviews.filter(
      (review) =>
        review.status === 'Pending Review'
    ).length;

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (total, review) =>
            total + Number(review.overallRating || 0),
          0
        ) / reviews.length
      : 0;

  // ============================================================
  // MODAL
  // ============================================================

  const openCreateModal = () => {

    setEditingReview(null);

    setForm({
      ...EMPTY_FORM,
      reviewPeriod:
        new Date().toISOString().slice(0, 7),
    });

    setIsModalOpen(true);
  };

  const openEditModal = (
    review: PerformanceReview
  ) => {

    setEditingReview(review);

    setForm({
      employeeId: review.employeeId,
      reviewPeriod: review.reviewPeriod,

      qualityOfWork: Number(
        review.qualityOfWork
      ),

      productivity: Number(
        review.productivity
      ),

      teamwork: Number(
        review.teamwork
      ),

      communication: Number(
        review.communication
      ),

      responsibility: Number(
        review.responsibility
      ),

      problemSolving: Number(
        review.problemSolving
      ),

      overallRating: Number(
        review.overallRating
      ),

      managerFeedback:
        review.managerFeedback || '',

      areasForImprovement:
        review.areasForImprovement || '',

      status: review.status,
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {

    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setEditingReview(null);
  };

  // ============================================================
  // FORM
  // ============================================================

  const updateRating = (
    field: KPIKey,
    value: number
  ) => {

    setForm((current) => {

      const updated = {
        ...current,
        [field]: value,
      };

      const ratings = KPI_FIELDS.map(
        (item) =>
          Number(updated[item.key])
      );

      const average =
        ratings.reduce(
          (sum, rating) =>
            sum + rating,
          0
        ) / ratings.length;

      updated.overallRating =
        Math.round(average * 100) / 100;

      return updated;
    });
  };

  const updateForm = <
    K extends keyof PerformanceReviewPayload
  >(
    field: K,
    value: PerformanceReviewPayload[K]
  ) => {

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  // ============================================================
  // SAVE
  // ============================================================

  const handleSubmit = async (
    event: FormEvent
  ) => {

    event.preventDefault();

    if (!form.employeeId.trim()) {

      addToast(
        'error',
        'Employee ID is required'
      );

      return;
    }

    if (!form.reviewPeriod) {

      addToast(
        'error',
        'Review month is required'
      );

      return;
    }

    try {

      setSaving(true);

      if (editingReview) {

        await performanceService.update(
          editingReview.id,
          form
        );

        addToast(
          'success',
          'Performance review updated successfully'
        );

      } else {

        await performanceService.create(form);

        addToast(
          'success',
          'Performance review created successfully'
        );
      }

      setIsModalOpen(false);
      setEditingReview(null);

      await loadReviews();

    } catch (err) {

      const message =
        err instanceof Error
          ? err.message
          : 'Failed to save performance review';

      addToast(
        'error',
        message
      );

    } finally {

      setSaving(false);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (
    review: PerformanceReview
  ) => {

    const confirmed =
      window.confirm(
        `Delete performance review #${review.id}?`
      );

    if (!confirmed) {
      return;
    }

    try {

      setDeletingId(review.id);

      await performanceService.delete(
        review.id
      );

      addToast(
        'success',
        'Performance review deleted successfully'
      );

      if (expandedId === review.id) {
        setExpandedId(null);
      }

      await loadReviews();

    } catch (err) {

      const message =
        err instanceof Error
          ? err.message
          : 'Failed to delete performance review';

      addToast(
        'error',
        message
      );

    } finally {

      setDeletingId(null);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (
      <div className="flex min-h-[500px] items-center justify-center">

        <div className="flex items-center gap-3 text-gray-500">

          <Loader2
            className="h-5 w-5 animate-spin"
          />

          <span>
            Loading performance reviews...
          </span>

        </div>

      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-2xl font-bold text-gray-900">
            Performance Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage monthly employee performance reviews
          </p>

        </div>

        <div className="flex gap-3">

          <button
            type="button"
            onClick={() => loadReviews(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
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
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >

            <Plus className="h-4 w-4" />

            New Review

          </button>

        </div>

      </div>

      {/* ERROR */}

      {error && (

        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

          {error}

        </div>

      )}

      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          label="Total Reviews"
          value={reviews.length}
        />

        <SummaryCard
          label="Completed"
          value={completedCount}
        />

        <SummaryCard
          label="Pending Review"
          value={pendingCount}
        />

        <SummaryCard
          label="Average Rating"
          value={
            reviews.length
              ? `${averageRating.toFixed(2)} / 5`
              : '—'
          }
        />

      </div>

      {/* FILTERS */}

      <div className="rounded-xl border border-gray-200 bg-white p-4">

        <div className="grid gap-3 md:grid-cols-3">

          <div className="relative">

            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search employee ID or review ID..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-gray-400"
            />

          </div>

          <input
            type="month"
            value={monthFilter}
            onChange={(event) =>
              setMonthFilter(event.target.value)
            }
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | 'All'
                  | 'Pending Review'
                  | 'Completed'
              )
            }
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
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

      {/* LIST */}

      {filteredReviews.length === 0 ? (

        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">

            <Star className="h-5 w-5 text-gray-400" />

          </div>

          <h3 className="font-semibold text-gray-900">
            No performance reviews found
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Create a monthly performance review
            to get started.
          </p>

        </div>

      ) : (

        <div className="space-y-3">

          {filteredReviews.map((review) => {

            const expanded =
              expandedId === review.id;

            return (
              <div
                key={review.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
              >

                {/* REVIEW HEADER */}

                <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(
                        expanded
                          ? null
                          : review.id
                      )
                    }
                    className="flex min-w-0 flex-1 items-center gap-4 text-left"
                  >

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 font-semibold text-gray-700">
                      {review.employeeId
                        .slice(-2)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <span className="font-semibold text-gray-900">
                          {review.employeeId}
                        </span>

                        <StatusBadge
                          status={review.status}
                        />

                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        Review period:{' '}
                        {formatMonth(
                          review.reviewPeriod
                        )}
                      </p>

                    </div>

                  </button>

                  <div className="flex items-center justify-between gap-5 lg:justify-end">

                    <div className="text-right">

                      <div className="text-lg font-bold text-gray-900">
                        {Number(
                          review.overallRating
                        ).toFixed(2)}
                        <span className="text-sm font-normal text-gray-400">
                          {' '}
                          / 5
                        </span>
                      </div>

                      <div className="text-xs text-gray-500">
                        Overall Rating
                      </div>

                    </div>

                    <div className="flex items-center gap-1">

                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(review)
                        }
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(review)
                        }
                        disabled={
                          deletingId === review.id
                        }
                        className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        title="Delete"
                      >

                        {deletingId ===
                        review.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}

                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(
                            expanded
                              ? null
                              : review.id
                          )
                        }
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                      >

                        {expanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}

                      </button>

                    </div>

                  </div>

                </div>

                {/* DETAILS */}

                {expanded && (

                  <div className="border-t border-gray-100 bg-gray-50 p-5">

                    <div className="grid gap-6 lg:grid-cols-2">

                      <div>

                        <h3 className="mb-4 text-sm font-semibold text-gray-900">
                          Performance Ratings
                        </h3>

                        <div className="space-y-3">

                          {KPI_FIELDS.map(
                            (field) => {

                              const rating =
                                Number(
                                  review[
                                    field.key
                                  ]
                                );

                              return (
                                <div
                                  key={field.key}
                                  className="flex items-center justify-between gap-4"
                                >

                                  <span className="text-sm text-gray-600">
                                    {field.label}
                                  </span>

                                  <div className="flex items-center gap-2">

                                    <div className="flex gap-0.5">

                                      {[1, 2, 3, 4, 5].map(
                                        (star) => (
                                          <Star
                                            key={star}
                                            className={`h-4 w-4 ${
                                              star <= rating
                                                ? 'fill-current text-gray-900'
                                                : 'text-gray-300'
                                            }`}
                                          />
                                        )
                                      )}

                                    </div>

                                    <span className="w-8 text-right text-sm font-medium">
                                      {rating}/5
                                    </span>

                                  </div>

                                </div>
                              );
                            }
                          )}

                        </div>

                      </div>

                      <div className="space-y-5">

                        <div>

                          <h3 className="mb-2 text-sm font-semibold text-gray-900">
                            Manager Feedback
                          </h3>

                          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
                            {review.managerFeedback ||
                              'No feedback provided.'}
                          </p>

                        </div>

                        <div>

                          <h3 className="mb-2 text-sm font-semibold text-gray-900">
                            Areas for Improvement
                          </h3>

                          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
                            {review.areasForImprovement ||
                              'No areas specified.'}
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                )}

              </div>
            );
          })}

        </div>

      )}

      {/* MODAL */}

      {isModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  {editingReview
                    ? 'Edit Performance Review'
                    : 'Create Performance Review'}
                </h2>

                <p className="mt-0.5 text-sm text-gray-500">
                  Monthly employee performance review
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6"
            >

              {/* BASIC INFO */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Employee ID
                  </label>

                  <input
                    value={form.employeeId}
                    onChange={(event) =>
                      updateForm(
                        'employeeId',
                        event.target.value
                      )
                    }
                    disabled={Boolean(
                      editingReview
                    )}
                    placeholder="EMP001"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400 disabled:bg-gray-100"
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
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                  />

                </div>

              </div>

              {/* KPI */}

              <div>

                <div className="mb-4 flex items-center justify-between">

                  <div>

                    <h3 className="font-semibold text-gray-900">
                      Performance Ratings
                    </h3>

                    <p className="text-sm text-gray-500">
                      Rate each area from 1 to 5
                    </p>

                  </div>

                  <div className="rounded-lg bg-gray-100 px-3 py-2 text-right">

                    <div className="text-lg font-bold text-gray-900">
                      {form.overallRating.toFixed(2)}
                    </div>

                    <div className="text-xs text-gray-500">
                      Overall
                    </div>

                  </div>

                </div>

                <div className="grid gap-3 sm:grid-cols-2">

                  {KPI_FIELDS.map(
                    (field) => {

                      const currentRating =
                        Number(
                          form[field.key]
                        );

                      return (
                        <div
                          key={field.key}
                          className="rounded-xl border border-gray-200 p-4"
                        >

                          <div className="mb-3 flex items-center justify-between">

                            <span className="text-sm font-medium text-gray-700">
                              {field.label}
                            </span>

                            <span className="text-sm font-semibold text-gray-900">
                              {currentRating}/5
                            </span>

                          </div>

                          <div className="flex gap-1">

                            {[1, 2, 3, 4, 5].map(
                              (rating) => (

                                <button
                                  key={rating}
                                  type="button"
                                  onClick={() =>
                                    updateRating(
                                      field.key,
                                      rating
                                    )
                                  }
                                  className="rounded-md p-1 transition hover:bg-gray-100"
                                  title={`${rating}/5`}
                                >

                                  <Star
                                    className={`h-6 w-6 ${
                                      rating <=
                                      currentRating
                                        ? 'fill-current text-gray-900'
                                        : 'text-gray-300'
                                    }`}
                                  />

                                </button>

                              )
                            )}

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

              {/* FEEDBACK */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Manager Feedback
                  </label>

                  <textarea
                    value={form.managerFeedback}
                    onChange={(event) =>
                      updateForm(
                        'managerFeedback',
                        event.target.value
                      )
                    }
                    rows={5}
                    placeholder="Enter manager feedback..."
                    className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                  />

                </div>

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Areas for Improvement
                  </label>

                  <textarea
                    value={
                      form.areasForImprovement
                    }
                    onChange={(event) =>
                      updateForm(
                        'areasForImprovement',
                        event.target.value
                      )
                    }
                    rows={5}
                    placeholder="Enter areas for improvement..."
                    className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                  />

                </div>

              </div>

              {/* STATUS */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Review Status
                </label>

                <select
                  value={form.status}
                  onChange={(event) =>
                    updateForm(
                      'status',
                      event.target.value as
                        | 'Pending Review'
                        | 'Completed'
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400 sm:w-1/2"
                >

                  <option value="Pending Review">
                    Pending Review
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                </select>

              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                >

                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {editingReview
                    ? 'Save Changes'
                    : 'Create Review'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value}
      </p>

    </div>
  );
}

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({
  status,
}: {
  status: string;
}) {

  const completed =
    status === 'Completed';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        completed
          ? 'bg-green-50 text-green-700'
          : 'bg-yellow-50 text-yellow-700'
      }`}
    >

      <span
        className={`h-1.5 w-1.5 rounded-full ${
          completed
            ? 'bg-green-500'
            : 'bg-yellow-500'
        }`}
      />

      {status}

    </span>
  );
}

// ============================================================
// MONTH FORMATTER
// ============================================================

function formatMonth(
  value: string
) {

  if (!value) {
    return '—';
  }

  const [year, month] =
    value.split('-');

  const date = new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  return date.toLocaleDateString(
    'en-US',
    {
      month: 'long',
      year: 'numeric',
    }
  );
}