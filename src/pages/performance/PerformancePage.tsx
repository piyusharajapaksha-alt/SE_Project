import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  PageHeader,
  SearchInput,
  SelectFilter,
  Badge,
  LoadingState,
  EmptyState,
  StatCard,
} from '@/components/ui';
import {
  Award,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Edit3,
  MessageSquare,
  Plus,
  RefreshCw,
  Save,
  Star,
  Target,
  Trash2,
  TrendingUp,
  UserRound,
  X,
} from 'lucide-react';
import { performanceService } from '@/services/performanceService';
import { employeeService } from '@/services/dataServices';

type PerformanceReview = {
  id: number;
  employeeId: string;
  employeeName?: string;
  department?: string;
  position?: string;
  reviewPeriod: string;

  qualityOfWork: number;
  productivity: number;
  teamwork: number;
  communication: number;
  responsibility: number;
  problemSolving: number;

  overallRating: number;

  managerFeedback?: string;
  areasForImprovement?: string;

  status: 'Pending Review' | 'Completed';

  createdAt?: string;
  updatedAt?: string;
};

type Employee = {
  employeeId?: string;
  employeeNumber?: string;
  id?: string | number;
  firstName?: string;
  lastName?: string;
  name?: string;
  department?: string;
  position?: string;
};

type RatingKey =
  | 'qualityOfWork'
  | 'productivity'
  | 'teamwork'
  | 'communication'
  | 'responsibility'
  | 'problemSolving';

const ratingItems: { key: RatingKey; label: string }[] = [
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

const emptyForm = {
  employeeId: '',
  reviewPeriod: new Date().toISOString().slice(0, 7),

  qualityOfWork: 3,
  productivity: 3,
  teamwork: 3,
  communication: 3,
  responsibility: 3,
  problemSolving: 3,

  managerFeedback: '',
  areasForImprovement: '',

  status: 'Pending Review' as 'Pending Review' | 'Completed',
};

const getEmployeeId = (employee: Employee) =>
  String(
    employee.employeeId ??
      employee.employeeNumber ??
      employee.id ??
      ''
  );

const getEmployeeName = (employee: Employee) => {
  if (employee.name) return employee.name;

  const fullName = [
    employee.firstName,
    employee.lastName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return fullName || getEmployeeId(employee);
};

const getReviewEmployeeName = (review: PerformanceReview) => {
  if (review.employeeName) return review.employeeName;
  return review.employeeId || 'Employee';
};

const formatMonth = (period: string) => {
  if (!period) return '-';

  const [year, month] = period.split('-');

  if (!year || !month) return period;

  const date = new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

const getRating = (review: PerformanceReview) => {
  const rating = Number(review.overallRating);

  return Number.isFinite(rating) ? rating : 0;
};

const calculateOverallRating = (
  values: Pick<
    PerformanceReview,
    RatingKey
  >
) => {
  const total = ratingItems.reduce(
    (sum, item) =>
      sum + Number(values[item.key] || 0),
    0
  );

  return Number((total / ratingItems.length).toFixed(2));
};

function RatingStars({
  value,
  size = 'sm',
}: {
  value: number;
  size?: 'sm' | 'md';
}) {
  const starClass =
    size === 'md'
      ? 'h-5 w-5'
      : 'h-4 w-4';

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starClass} ${
            star <= Math.round(value)
              ? 'fill-amber-400 text-amber-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

function RatingBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const percentage = Math.max(
    0,
    Math.min(100, (Number(value) / 5) * 100)
  );

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-sm text-gray-600">
          {label}
        </span>

        <span className="text-sm font-semibold text-gray-900">
          {Number(value).toFixed(0)}/5
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

export default function PerformancePage() {
  const { user } = useAuth();
  const location = useLocation();

  const isManagementView =
    location.pathname.startsWith('/management/');

  const isEmployeeView = !isManagementView;

  const [reviews, setReviews] = useState<
    PerformanceReview[]
  >([]);

  const [employees, setEmployees] = useState<Employee[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] =
    useState(false);

  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState('All');

  const [monthFilter, setMonthFilter] =
    useState('All');

  const [expandedId, setExpandedId] =
    useState<number | null>(null);

  const [selectedReview, setSelectedReview] =
    useState<PerformanceReview | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [editingReview, setEditingReview] =
    useState<PerformanceReview | null>(null);

  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  /*
   * ============================================================
   * LOAD PERFORMANCE REVIEWS
   * ============================================================
   */

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const data =
        await performanceService.getAll();

      let result = Array.isArray(data)
        ? data
        : [];

      /*
       * Employees can only see their own reviews.
       */
      if (
        isEmployeeView &&
        user?.employeeId
      ) {
        result = result.filter(
          (review) =>
            review.employeeId ===
            user.employeeId
        );
      }

      setReviews(result);
    } catch (err) {
      console.error(
        'Failed to load performance reviews:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load performance reviews.'
      );

      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * LOAD EMPLOYEES FOR MANAGEMENT FORM
   * ============================================================
   */

  const loadEmployees = async () => {
    if (!isManagementView) return;

    setEmployeesLoading(true);

    try {
      const data =
        await employeeService.getAll();

      setEmployees(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        'Failed to load employees:',
        err
      );

      setEmployees([]);
    } finally {
      setEmployeesLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [
    user?.employeeId,
    isManagementView,
  ]);

  useEffect(() => {
    loadEmployees();
  }, [isManagementView]);

  /*
   * ============================================================
   * FILTERS
   * ============================================================
   */

  const availableMonths = useMemo(() => {
    return Array.from(
      new Set(
        reviews
          .map(
            (review) =>
              review.reviewPeriod
          )
          .filter(Boolean)
      )
    ).sort((a, b) =>
      b.localeCompare(a)
    );
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return reviews.filter((review) => {
      const employeeName =
        getReviewEmployeeName(
          review
        ).toLowerCase();

      const employeeId =
        review.employeeId.toLowerCase();

      const department =
        (
          review.department || ''
        ).toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        employeeName.includes(
          normalizedSearch
        ) ||
        employeeId.includes(
          normalizedSearch
        ) ||
        department.includes(
          normalizedSearch
        );

      const matchesStatus =
        statusFilter === 'All' ||
        review.status ===
          statusFilter;

      const matchesMonth =
        monthFilter === 'All' ||
        review.reviewPeriod ===
          monthFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesMonth
      );
    });
  }, [
    reviews,
    search,
    statusFilter,
    monthFilter,
  ]);

  const completedCount =
    filteredReviews.filter(
      (review) =>
        review.status ===
        'Completed'
    ).length;

  const pendingCount =
    filteredReviews.filter(
      (review) =>
        review.status ===
        'Pending Review'
    ).length;

  const averageRating =
    filteredReviews.length > 0
      ? (
          filteredReviews.reduce(
            (sum, review) =>
              sum + getRating(review),
            0
          ) /
          filteredReviews.length
        ).toFixed(2)
      : '0.00';

  /*
   * ============================================================
   * FORM
   * ============================================================
   */

  const openCreateForm = () => {
    setEditingReview(null);

    setForm({
      ...emptyForm,
      employeeId: '',
      reviewPeriod:
        new Date()
          .toISOString()
          .slice(0, 7),
    });

    setShowForm(true);
  };

  const openEditForm = (
    review: PerformanceReview
  ) => {
    setEditingReview(review);

    setForm({
      employeeId:
        review.employeeId,

      reviewPeriod:
        review.reviewPeriod,

      qualityOfWork:
        Number(review.qualityOfWork),

      productivity:
        Number(review.productivity),

      teamwork:
        Number(review.teamwork),

      communication:
        Number(review.communication),

      responsibility:
        Number(review.responsibility),

      problemSolving:
        Number(review.problemSolving),

      managerFeedback:
        review.managerFeedback ||
        '',

      areasForImprovement:
        review.areasForImprovement ||
        '',

      status:
        review.status,
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingReview(null);
  };

  const updateRating = (
    key: RatingKey,
    value: number
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: Math.max(
        1,
        Math.min(5, value)
      ),
    }));
  };

  const calculatedRating =
    calculateOverallRating(form);

  /*
   * ============================================================
   * SAVE REVIEW
   * ============================================================
   */

  const handleSave = async () => {
    if (!form.employeeId) {
      window.alert(
        'Please select an employee.'
      );
      return;
    }

    if (!form.reviewPeriod) {
      window.alert(
        'Please select a review month.'
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        employeeId:
          form.employeeId,

        reviewPeriod:
          form.reviewPeriod,

        qualityOfWork:
          Number(form.qualityOfWork),

        productivity:
          Number(form.productivity),

        teamwork:
          Number(form.teamwork),

        communication:
          Number(form.communication),

        responsibility:
          Number(form.responsibility),

        problemSolving:
          Number(form.problemSolving),

        overallRating:
          calculatedRating,

        managerFeedback:
          form.managerFeedback.trim(),

        areasForImprovement:
          form.areasForImprovement.trim(),

        status:
          form.status,
      };

      if (editingReview) {
        await performanceService.update(
          editingReview.id,
          payload
        );
      } else {
        await performanceService.create(
          payload
        );
      }

      closeForm();

      await loadData();
    } catch (err) {
      console.error(
        'Failed to save performance review:',
        err
      );

      window.alert(
        err instanceof Error
          ? err.message
          : 'Unable to save performance review.'
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ============================================================
   * DELETE REVIEW
   * ============================================================
   */

  const handleDelete = async (
    review: PerformanceReview
  ) => {
    const confirmed =
      window.confirm(
        `Delete the performance review for ${getReviewEmployeeName(
          review
        )} (${formatMonth(
          review.reviewPeriod
        )})?\n\nThis action cannot be undone.`
      );

    if (!confirmed) return;

    setDeletingId(review.id);

    try {
      await performanceService.delete(
        review.id
      );

      if (
        selectedReview?.id ===
        review.id
      ) {
        setSelectedReview(null);
      }

      if (
        expandedId === review.id
      ) {
        setExpandedId(null);
      }

      await loadData();
    } catch (err) {
      console.error(
        'Failed to delete performance review:',
        err
      );

      window.alert(
        err instanceof Error
          ? err.message
          : 'Unable to delete performance review.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
   * ============================================================
   * DETAIL VIEW
   * ============================================================
   */

  const openDetails = (
    review: PerformanceReview
  ) => {
    setSelectedReview(review);
  };

  return (
    <div>
      <PageHeader
        title={
          isEmployeeView
            ? 'My Performance'
            : 'Performance Management'
        }
        description={
          isEmployeeView
            ? 'View your monthly performance reviews and feedback'
            : 'Review and manage employee performance'
        }
      />

      {/* ======================================================
          MANAGEMENT ACTION
      ====================================================== */}

      {isManagementView && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Performance Reviews
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Create and manage monthly employee reviews.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            New Review
          </button>
        </div>
      )}

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          title="Total Reviews"
          value={
            filteredReviews.length
          }
          icon={
            <BarChart3 className="h-5 w-5" />
          }
          color="indigo"
        />

        <StatCard
          title="Average Rating"
          value={averageRating}
          icon={
            <Award className="h-5 w-5" />
          }
          color="green"
        />

        <StatCard
          title="Completed"
          value={completedCount}
          icon={
            <CheckCircle2 className="h-5 w-5" />
          }
          color="blue"
        />

        <StatCard
          title="Pending"
          value={pendingCount}
          icon={
            <Clock3 className="h-5 w-5" />
          }
          color="amber"
        />
      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        {isManagementView && (
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search employees..."
            />
          </div>
        )}

        <SelectFilter
          value={monthFilter}
          onChange={setMonthFilter}
          options={[
            'All',
            ...availableMonths,
          ]}
        />

        <SelectFilter
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            'All',
            'Completed',
            'Pending Review',
          ]}
        />

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading
                ? 'animate-spin'
                : ''
            }`}
          />
          Refresh
        </button>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800">
            Unable to load performance data
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadData}
            className="mt-3 text-sm font-semibold text-red-700 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* ======================================================
          CONTENT
      ====================================================== */}

      {loading ? (
        <LoadingState />
      ) : filteredReviews.length === 0 ? (
        <EmptyState
          icon={
            <TrendingUp className="h-6 w-6" />
          }
          title="No performance reviews found"
        />
      ) : (
        <div className="space-y-3">
          {filteredReviews.map(
            (review) => {
              const isExpanded =
                expandedId === review.id;

              return (
                <div
                  key={review.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-sm"
                >
                  {/* REVIEW HEADER */}

                  <div className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(
                            isExpanded
                              ? null
                              : review.id
                          )
                        }
                        className="flex min-w-0 flex-1 items-center gap-4 text-left"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <UserRound className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-semibold text-gray-900">
                              {getReviewEmployeeName(
                                review
                              )}
                            </h3>

                            <Badge
                              variant={
                                review.status ===
                                'Completed'
                                  ? 'success'
                                  : 'warning'
                              }
                              dot
                            >
                              {review.status}
                            </Badge>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                            <span>
                              {review.employeeId}
                            </span>

                            {review.department && (
                              <>
                                <span>
                                  •
                                </span>

                                <span>
                                  {
                                    review.department
                                  }
                                </span>
                              </>
                            )}

                            <span>
                              •
                            </span>

                            <span>
                              {formatMonth(
                                review.reviewPeriod
                              )}
                            </span>
                          </div>
                        </div>
                      </button>

                      <div className="flex items-center justify-between gap-4 lg:justify-end">
                        <div className="text-left lg:text-right">
                          <p className="text-xs text-gray-500">
                            Overall Rating
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xl font-bold text-gray-900">
                              {getRating(
                                review
                              ).toFixed(2)}
                            </span>

                            <span className="text-xs text-gray-400">
                              / 5
                            </span>

                            <RatingStars
                              value={getRating(
                                review
                              )}
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(
                              isExpanded
                                ? null
                                : review.id
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition hover:bg-gray-100"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* MANAGEMENT ACTIONS */}

                    {isManagementView && (
                      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
                        <button
                          type="button"
                          onClick={() =>
                            openDetails(
                              review
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          View Details
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(
                              review
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              review
                            )
                          }
                          disabled={
                            deletingId ===
                            review.id
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />

                          {deletingId ===
                          review.id
                            ? 'Deleting...'
                            : 'Delete'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* EXPANDED DETAILS */}

                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 px-5 pb-5 pt-4">
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* RATINGS */}

                        <div className="rounded-xl border border-gray-200 bg-white p-5">
                          <div className="mb-4 flex items-center gap-2">
                            <Target className="h-5 w-5 text-indigo-600" />

                            <h4 className="text-sm font-semibold text-gray-900">
                              Performance Ratings
                            </h4>
                          </div>

                          <div className="space-y-4">
                            {ratingItems.map(
                              (item) => (
                                <RatingBar
                                  key={
                                    item.key
                                  }
                                  label={
                                    item.label
                                  }
                                  value={Number(
                                    review[
                                      item.key
                                    ]
                                  )}
                                />
                              )
                            )}
                          </div>
                        </div>

                        {/* FEEDBACK */}

                        <div className="space-y-4">
                          <div className="rounded-xl border border-gray-200 bg-white p-5">
                            <div className="mb-3 flex items-center gap-2">
                              <MessageSquare className="h-5 w-5 text-indigo-600" />

                              <h4 className="text-sm font-semibold text-gray-900">
                                Manager Feedback
                              </h4>
                            </div>

                            <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
                              {review.managerFeedback ||
                                'No manager feedback provided.'}
                            </p>
                          </div>

                          <div className="rounded-xl border border-gray-200 bg-white p-5">
                            <div className="mb-3 flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 text-amber-500" />

                              <h4 className="text-sm font-semibold text-gray-900">
                                Areas for Improvement
                              </h4>
                            </div>

                            <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
                              {review.areasForImprovement ||
                                'No improvement areas provided.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      )}

      {/* ======================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingReview
                    ? 'Edit Performance Review'
                    : 'New Performance Review'}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Monthly employee performance review
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {/* EMPLOYEE + MONTH */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Employee
                    </label>

                    <select
                      value={
                        form.employeeId
                      }
                      onChange={(event) =>
                        setForm(
                          (previous) => ({
                            ...previous,
                            employeeId:
                              event.target
                                .value,
                          })
                        )
                      }
                      disabled={
                        saving ||
                        employeesLoading ||
                        Boolean(
                          editingReview
                        )
                      }
                      className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                    >
                      <option value="">
                        {employeesLoading
                          ? 'Loading employees...'
                          : 'Select employee'}
                      </option>

                      {employees.map(
                        (employee) => {
                          const id =
                            getEmployeeId(
                              employee
                            );

                          return (
                            <option
                              key={id}
                              value={id}
                            >
                              {getEmployeeName(
                                employee
                              )}{' '}
                              — {id}
                            </option>
                          );
                        }
                      )}
                    </select>

                    {employees.length ===
                      0 &&
                      !employeesLoading && (
                        <p className="mt-1 text-xs text-red-500">
                          No employees were returned by the backend.
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Review Month
                    </label>

                    <input
                      type="month"
                      value={
                        form.reviewPeriod
                      }
                      onChange={(event) =>
                        setForm(
                          (previous) => ({
                            ...previous,
                            reviewPeriod:
                              event.target
                                .value,
                          })
                        )
                      }
                      disabled={saving}
                      className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* RATINGS */}

                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5">
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Performance Ratings
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Rate each category from 1 to 5.
                      </p>
                    </div>

                    <div className="rounded-lg bg-indigo-50 px-4 py-2 text-center">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-indigo-600">
                        Overall Rating
                      </p>

                      <p className="text-xl font-bold text-indigo-700">
                        {calculatedRating.toFixed(
                          2
                        )}{' '}
                        / 5
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {ratingItems.map(
                      (item) => (
                        <div
                          key={item.key}
                          className="rounded-lg border border-gray-200 bg-white p-4"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              {
                                item.label
                              }
                            </span>

                            <span className="text-sm font-bold text-indigo-600">
                              {Number(
                                form[
                                  item.key
                                ]
                              )}
                              /5
                            </span>
                          </div>

                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(
                              (rating) => (
                                <button
                                  key={
                                    rating
                                  }
                                  type="button"
                                  onClick={() =>
                                    updateRating(
                                      item.key,
                                      rating
                                    )
                                  }
                                  disabled={
                                    saving
                                  }
                                  className="transition hover:scale-110 disabled:cursor-not-allowed"
                                  aria-label={`${item.label}: ${rating}`}
                                >
                                  <Star
                                    className={`h-6 w-6 ${
                                      rating <=
                                      Number(
                                        form[
                                          item
                                            .key
                                        ]
                                      )
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* STATUS */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Review Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm(
                        (previous) => ({
                          ...previous,
                          status:
                            event.target
                              .value as
                              | 'Pending Review'
                              | 'Completed',
                        })
                      )
                    }
                    disabled={saving}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="Pending Review">
                      Pending Review
                    </option>

                    <option value="Completed">
                      Completed
                    </option>
                  </select>
                </div>

                {/* FEEDBACK */}

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Manager Feedback
                    </label>

                    <textarea
                      value={
                        form.managerFeedback
                      }
                      onChange={(event) =>
                        setForm(
                          (previous) => ({
                            ...previous,
                            managerFeedback:
                              event.target
                                .value,
                          })
                        )
                      }
                      disabled={saving}
                      rows={4}
                      placeholder="Enter feedback about the employee's performance..."
                      className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Areas for Improvement
                    </label>

                    <textarea
                      value={
                        form.areasForImprovement
                      }
                      onChange={(event) =>
                        setForm(
                          (previous) => ({
                            ...previous,
                            areasForImprovement:
                              event.target
                                .value,
                          })
                        )
                      }
                      disabled={saving}
                      rows={4}
                      placeholder="Enter areas where the employee can improve..."
                      className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={
                  saving ||
                  !form.employeeId ||
                  !form.reviewPeriod
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {editingReview
                      ? 'Save Changes'
                      : 'Create Review'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          DETAIL MODAL
      ====================================================== */}

      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  Performance Review
                </p>

                <h2 className="mt-1 text-xl font-semibold text-gray-900">
                  {getReviewEmployeeName(
                    selectedReview
                  )}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedReview.employeeId}
                  {' • '}
                  {formatMonth(
                    selectedReview.reviewPeriod
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedReview(
                    null
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* BODY */}

            <div className="overflow-y-auto p-6">
              <div className="mb-6 flex flex-col gap-4 rounded-xl bg-indigo-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-700">
                    Overall Rating
                  </p>

                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-3xl font-bold text-gray-900">
                      {getRating(
                        selectedReview
                      ).toFixed(2)}
                    </span>

                    <span className="text-sm text-gray-500">
                      / 5
                    </span>

                    <RatingStars
                      value={getRating(
                        selectedReview
                      )}
                      size="md"
                    />
                  </div>
                </div>

                <Badge
                  variant={
                    selectedReview.status ===
                    'Completed'
                      ? 'success'
                      : 'warning'
                  }
                  dot
                >
                  {selectedReview.status}
                </Badge>
              </div>

              <div className="space-y-4">
                {ratingItems.map(
                  (item) => (
                    <RatingBar
                      key={item.key}
                      label={item.label}
                      value={Number(
                        selectedReview[
                          item.key
                        ]
                      )}
                    />
                  )
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-indigo-600" />

                    <h3 className="text-sm font-semibold text-gray-900">
                      Manager Feedback
                    </h3>
                  </div>

                  <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
                    {selectedReview.managerFeedback ||
                      'No manager feedback provided.'}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-amber-500" />

                    <h3 className="text-sm font-semibold text-gray-900">
                      Areas for Improvement
                    </h3>
                  </div>

                  <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
                    {selectedReview.areasForImprovement ||
                      'No improvement areas provided.'}
                  </p>
                </div>
              </div>
            </div>

            {/* FOOTER */}

            {isManagementView && (
              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedReview(
                      null
                    )
                  }
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const review =
                      selectedReview;

                    setSelectedReview(
                      null
                    );

                    openEditForm(
                      review
                    );
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Review
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

