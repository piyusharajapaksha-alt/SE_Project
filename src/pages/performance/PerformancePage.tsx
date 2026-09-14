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
  MessageSquare,
  RefreshCw,
  Star,
  Target,
  TrendingUp,
  UserRound,
  X,
} from 'lucide-react';
import { performanceService } from '@/services/performanceService';

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

type RatingKey =
  | 'qualityOfWork'
  | 'productivity'
  | 'teamwork'
  | 'communication'
  | 'responsibility'
  | 'problemSolving';

const ratingItems: { key: RatingKey; label: string }[] = [
  { key: 'qualityOfWork', label: 'Quality of Work' },
  { key: 'productivity', label: 'Productivity' },
  { key: 'teamwork', label: 'Teamwork' },
  { key: 'communication', label: 'Communication' },
  { key: 'responsibility', label: 'Responsibility' },
  { key: 'problemSolving', label: 'Problem Solving' },
];

const getRating = (review: PerformanceReview) => {
  const value = Number(review.overallRating);
  return Number.isFinite(value) ? value : 0;
};

const formatMonth = (period: string) => {
  if (!period) return '-';

  const [year, month] = period.split('-');

  if (!year || !month) return period;

  const date = new Date(Number(year), Number(month) - 1, 1);

  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

const formatEmployeeName = (review: PerformanceReview) => {
  if (review.employeeName) return review.employeeName;

  return review.employeeId || 'Employee';
};

function RatingStars({
  value,
  size = 'sm',
}: {
  value: number;
  size?: 'sm' | 'md';
}) {
  const starClass =
    size === 'md' ? 'h-5 w-5' : 'h-4 w-4';

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
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-semibold text-gray-900">
          {Number(value).toFixed(0)}/5
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function PerformancePage() {
  const { user } = useAuth();
  const location = useLocation();

  const isManagementView = location.pathname.startsWith('/management/');
  const isEmployeeView = !isManagementView;

  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedReview, setSelectedReview] =
    useState<PerformanceReview | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await performanceService.getAll();

      let result = Array.isArray(data) ? data : [];

      /*
       * Employee view:
       * Employees should only see their own performance reviews.
       *
       * Management view:
       * HR/management can see all performance reviews.
       */
      if (isEmployeeView && user?.employeeId) {
        result = result.filter(
          (review: PerformanceReview) =>
            review.employeeId === user.employeeId
        );
      }

      setReviews(result);
    } catch (err) {
      console.error('Failed to load performance reviews:', err);
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

  useEffect(() => {
    loadData();
  }, [user?.employeeId, isManagementView]);

  const availableMonths = useMemo(() => {
    return Array.from(
      new Set(reviews.map((review) => review.reviewPeriod).filter(Boolean))
    ).sort((a, b) => b.localeCompare(a));
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesSearch =
        !normalizedSearch ||
        formatEmployeeName(review)
          .toLowerCase()
          .includes(normalizedSearch) ||
        review.employeeId.toLowerCase().includes(normalizedSearch) ||
        (review.department || '')
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === 'All' ||
        review.status === statusFilter;

      const matchesMonth =
        monthFilter === 'All' ||
        review.reviewPeriod === monthFilter;

      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [reviews, search, statusFilter, monthFilter]);

  const completedCount = filteredReviews.filter(
    (review) => review.status === 'Completed'
  ).length;

  const pendingCount = filteredReviews.filter(
    (review) => review.status === 'Pending Review'
  ).length;

  const averageRating =
    filteredReviews.length > 0
      ? (
          filteredReviews.reduce(
            (sum, review) => sum + getRating(review),
            0
          ) / filteredReviews.length
        ).toFixed(2)
      : '0.00';

  const latestReview = useMemo(() => {
    if (filteredReviews.length === 0) return null;

    return [...filteredReviews].sort((a, b) =>
      b.reviewPeriod.localeCompare(a.reviewPeriod)
    )[0];
  }, [filteredReviews]);

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
            : 'Review and monitor employee performance'
        }
      />

      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          title="Total Reviews"
          value={filteredReviews.length}
          icon={<BarChart3 className="h-5 w-5" />}
          color="indigo"
        />

        <StatCard
          title="Average Rating"
          value={averageRating}
          icon={<Award className="h-5 w-5" />}
          color="green"
        />

        <StatCard
          title="Completed"
          value={completedCount}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="blue"
        />

        <StatCard
          title="Pending"
          value={pendingCount}
          icon={<Clock3 className="h-5 w-5" />}
          color="amber"
        />
      </div>

      {/* Filters */}
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
          options={['All', ...availableMonths]}
        />

        <SelectFilter
          value={statusFilter}
          onChange={setStatusFilter}
          options={['All', 'Completed', 'Pending Review']}
        />

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">
            Unable to load performance data
          </p>
          <p className="mt-1 text-sm text-red-600">{error}</p>

          <button
            type="button"
            onClick={loadData}
            className="mt-3 text-sm font-semibold text-red-700 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Latest employee review */}
      {isEmployeeView && latestReview && !loading && (
        <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                Latest Review
              </p>

              <h3 className="mt-1 text-lg font-semibold text-gray-900">
                {formatMonth(latestReview.reviewPeriod)}
              </h3>

              <div className="mt-2 flex items-center gap-3">
                <RatingStars
                  value={getRating(latestReview)}
                  size="md"
                />

                <span className="text-sm font-semibold text-gray-900">
                  {getRating(latestReview).toFixed(2)} / 5
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedReview(latestReview)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              View Details
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <LoadingState />
      ) : filteredReviews.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="h-6 w-6" />}
          title="No performance reviews found"
        />
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((review) => {
            const isExpanded = expandedId === review.id;

            return (
              <div
                key={review.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-sm"
              >
                {/* Review header */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : review.id)
                  }
                  className="w-full p-5 text-left"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <UserRound className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-gray-900">
                            {formatEmployeeName(review)}
                          </h3>

                          <Badge
                            variant={
                              review.status === 'Completed'
                                ? 'success'
                                : 'warning'
                            }
                            dot
                          >
                            {review.status}
                          </Badge>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                          <span>{review.employeeId}</span>

                          {review.department && (
                            <>
                              <span>•</span>
                              <span>{review.department}</span>
                            </>
                          )}

                          <span>•</span>
                          <span>
                            {formatMonth(review.reviewPeriod)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-6 lg:justify-end">
                      <div className="text-left lg:text-right">
                        <p className="text-xs text-gray-500">
                          Overall Rating
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xl font-bold text-gray-900">
                            {getRating(review).toFixed(2)}
                          </span>

                          <span className="text-xs text-gray-400">
                            / 5
                          </span>

                          <RatingStars value={getRating(review)} />
                        </div>
                      </div>

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded review */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 px-5 pb-5 pt-4">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {/* Ratings */}
                      <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <div className="mb-4 flex items-center gap-2">
                          <Target className="h-5 w-5 text-indigo-600" />
                          <h4 className="text-sm font-semibold text-gray-900">
                            Performance Ratings
                          </h4>
                        </div>

                        <div className="space-y-4">
                          {ratingItems.map((item) => (
                            <RatingBar
                              key={item.key}
                              label={item.label}
                              value={review[item.key]}
                            />
                          ))}
                        </div>

                        <div className="mt-5 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                          <span className="text-sm font-medium text-gray-600">
                            Overall Rating
                          </span>

                          <div className="flex items-center gap-2">
                            <RatingStars
                              value={getRating(review)}
                            />
                            <span className="text-sm font-bold text-gray-900">
                              {getRating(review).toFixed(2)}/5
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Feedback */}
                      <div className="space-y-4">
                        <div className="rounded-xl border border-gray-200 bg-white p-5">
                          <div className="mb-3 flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-indigo-600" />
                            <h4 className="text-sm font-semibold text-gray-900">
                              Manager Feedback
                            </h4>
                          </div>

                          <p className="text-sm leading-6 text-gray-600">
                            {review.managerFeedback?.trim() ||
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

                          <p className="text-sm leading-6 text-gray-600">
                            {review.areasForImprovement?.trim() ||
                              'No improvement areas provided.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedReview(review)}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        Open Full Review
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Full review modal */}
      {selectedReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedReview(null)}
        >
          <div className="absolute inset-0 bg-black/50" />

          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-white px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  Performance Review
                </p>

                <h3 className="mt-1 text-lg font-semibold text-gray-900">
                  {formatEmployeeName(selectedReview)}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {formatMonth(selectedReview.reviewPeriod)}
                  {selectedReview.department
                    ? ` • ${selectedReview.department}`
                    : ''}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Overall */}
              <div className="rounded-xl bg-gray-50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Overall Performance
                    </p>

                    <div className="mt-1 flex items-center gap-3">
                      <span className="text-3xl font-bold text-gray-900">
                        {getRating(selectedReview).toFixed(2)}
                      </span>

                      <span className="text-sm text-gray-400">
                        / 5
                      </span>

                      <RatingStars
                        value={getRating(selectedReview)}
                        size="md"
                      />
                    </div>
                  </div>

                  <Badge
                    variant={
                      selectedReview.status === 'Completed'
                        ? 'success'
                        : 'warning'
                    }
                    dot
                  >
                    {selectedReview.status}
                  </Badge>
                </div>
              </div>

              {/* Rating breakdown */}
              <div>
                <h4 className="mb-4 text-sm font-semibold text-gray-900">
                  Rating Breakdown
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {ratingItems.map((item) => (
                    <div
                      key={item.key}
                      className="rounded-lg border border-gray-100 bg-white"
                    >
                      <RatingBar
                        label={item.label}
                        value={selectedReview[item.key]}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-indigo-600" />
                    <h4 className="text-sm font-semibold text-gray-900">
                      Manager Feedback
                    </h4>
                  </div>

                  <p className="text-sm leading-6 text-gray-600">
                    {selectedReview.managerFeedback?.trim() ||
                      'No manager feedback provided.'}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-amber-500" />
                    <h4 className="text-sm font-semibold text-gray-900">
                      Areas for Improvement
                    </h4>
                  </div>

                  <p className="text-sm leading-6 text-gray-600">
                    {selectedReview.areasForImprovement?.trim() ||
                      'No improvement areas provided.'}
                  </p>
                </div>
              </div>

              {/* Employee information */}
              <div className="rounded-xl border border-gray-200 p-5">
                <h4 className="mb-4 text-sm font-semibold text-gray-900">
                  Review Information
                </h4>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-gray-500">
                      Employee ID
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {selectedReview.employeeId}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Review Period
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {formatMonth(selectedReview.reviewPeriod)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Department
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {selectedReview.department || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Status
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {selectedReview.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

