import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import {
  PageHeader,
  SearchInput,
  SelectFilter,
  Badge,
  Pagination,
  EmptyState,
  Modal,
  FormSelect,
  FormTextarea,
} from '@/components/ui';
import {
  MessageSquareWarning,
  Plus,
  Eye,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserRoundCheck,
} from 'lucide-react';
import {
  GRIEVANCE_CATEGORIES,
  GRIEVANCE_PRIORITIES,
  GRIEVANCE_STATUSES,
} from '@/config';

type GrievanceStatus =
  | 'New'
  | 'Under Review'
  | 'Assigned'
  | 'Resolved'
  | 'Closed';

type Grievance = {
  id: string;
  employeeName: string;
  category: string;
  priority: string;
  status: GrievanceStatus;
  createdAt: string;
  description: string;
  assignedToName?: string;
  responses?: {
    text: string;
    date: string;
  }[];
};

const EMPTY_GRIEVANCES: Grievance[] = [];

export default function GrievancesPage() {
  const { user, checkPermission } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();

  const isManagementView = location.pathname.startsWith('/management/');
  const canManage =
    isManagementView && checkPermission('grievances.manage');

  const [grievances] = useState<Grievance[]>(EMPTY_GRIEVANCES);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [currentPage, setCurrentPage] = useState(1);

  const [showDetail, setShowDetail] =
    useState<Grievance | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [showRespond, setShowRespond] =
    useState<Grievance | null>(null);

  const [responseText, setResponseText] = useState('');

  const [form, setForm] = useState({
    category: '',
    priority: 'Medium',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const perPage = 10;

  /*
   * ---------------------------------------------------------
   * FILTERING
   *
   * There is currently no backend/mock dataset.
   * These filters are kept ready for backend integration.
   * ---------------------------------------------------------
   */

  const filteredGrievances = grievances.filter((grievance) => {
    const matchesSearch =
      !search ||
      grievance.id.toLowerCase().includes(search.toLowerCase()) ||
      grievance.employeeName
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      grievance.category
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      grievance.status === statusFilter;

    const matchesPriority =
      priorityFilter === 'All' ||
      grievance.priority === priorityFilter;

    const matchesCategory =
      categoryFilter === 'All' ||
      grievance.category === categoryFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesCategory
    );
  });

  const pagedGrievances = filteredGrievances.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  const totalPages = Math.ceil(
    filteredGrievances.length / perPage,
  );

  /*
   * ---------------------------------------------------------
   * FORM VALIDATION
   * ---------------------------------------------------------
   */

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.category) {
      nextErrors.category = 'Category is required';
    }

    if (!form.description.trim()) {
      nextErrors.description = 'Description is required';
    } else if (form.description.trim().length < 20) {
      nextErrors.description =
        'Please provide more detail (at least 20 characters)';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  /*
   * ---------------------------------------------------------
   * SUBMIT
   *
   * No fake/local grievance is created.
   * Backend integration will be added later.
   * ---------------------------------------------------------
   */

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      addToast(
        'error',
        'You must be logged in to submit a grievance.',
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    addToast(
      'info',
      'Grievance submission is ready for backend integration.',
    );

    setShowForm(false);

    setForm({
      category: '',
      priority: 'Medium',
      description: '',
    });

    setErrors({});
  };

  /*
   * ---------------------------------------------------------
   * RESPONSE
   *
   * No fake response is stored.
   * ---------------------------------------------------------
   */

  const handleRespond = () => {
    if (!showRespond) {
      return;
    }

    if (!responseText.trim()) {
      addToast('error', 'Please enter a response.');
      return;
    }

    addToast(
      'info',
      'Grievance response is ready for backend integration.',
    );

    setShowRespond(null);
    setResponseText('');
  };

  /*
   * ---------------------------------------------------------
   * STATUS
   *
   * No fake status is changed.
   * ---------------------------------------------------------
   */

  const handleStatusUpdate = (status: GrievanceStatus) => {
    addToast(
      'info',
      `Status change to "${status}" is ready for backend integration.`,
    );
  };

  /*
   * ---------------------------------------------------------
   * BADGES
   * ---------------------------------------------------------
   */

  const priorityBadge = (priority: string) => {
    if (
      priority === 'High' ||
      priority === 'Critical'
    ) {
      return 'danger';
    }

    if (priority === 'Medium') {
      return 'warning';
    }

    return 'neutral';
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'New':
        return 'info';

      case 'Under Review':
        return 'warning';

      case 'Assigned':
        return 'purple';

      case 'Resolved':
        return 'success';

      default:
        return 'neutral';
    }
  };

  return (
    <div>
      <PageHeader
        title="Grievances & Feedback"
        description={
          canManage
            ? 'Manage and resolve employee grievances'
            : 'Submit and track your grievances'
        }
        action={
          !canManage ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Submit Grievance
            </button>
          ) : undefined
        }
      />

      {/* =====================================================
          FILTERS
          ===================================================== */}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            placeholder="Search grievances..."
          />
        </div>

        <SelectFilter
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
          options={GRIEVANCE_STATUSES}
        />

        <SelectFilter
          value={priorityFilter}
          onChange={(value) => {
            setPriorityFilter(value);
            setCurrentPage(1);
          }}
          options={GRIEVANCE_PRIORITIES}
        />

        <SelectFilter
          value={categoryFilter}
          onChange={(value) => {
            setCategoryFilter(value);
            setCurrentPage(1);
          }}
          options={GRIEVANCE_CATEGORIES}
        />
      </div>

      {/* =====================================================
          SUMMARY CARDS
          ===================================================== */}

      {canManage && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard
            title="New"
            value={0}
            icon={<MessageSquareWarning className="h-5 w-5" />}
          />

          <SummaryCard
            title="Under Review"
            value={0}
            icon={<Clock className="h-5 w-5" />}
          />

          <SummaryCard
            title="Assigned"
            value={0}
            icon={<UserRoundCheck className="h-5 w-5" />}
          />

          <SummaryCard
            title="Resolved"
            value={0}
            icon={<CheckCircle className="h-5 w-5" />}
          />

          <SummaryCard
            title="High Priority"
            value={0}
            icon={<AlertTriangle className="h-5 w-5" />}
          />
        </div>
      )}

      {/* =====================================================
          EMPTY STATE / TABLE
          ===================================================== */}

      {filteredGrievances.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white">
          <EmptyState
            icon={
              <MessageSquareWarning className="h-6 w-6" />
            }
            title="No grievances found"
          />

          <div className="border-t border-gray-100 px-6 py-4 text-center">
            <p className="text-xs text-gray-400">
              {canManage
                ? 'Employee grievance records will appear here when backend data is available.'
                : 'Your submitted grievances will appear here when grievance data is available.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      ID
                    </th>

                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Employee
                    </th>

                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Category
                    </th>

                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Priority
                    </th>

                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Status
                    </th>

                    <th className="hidden px-4 py-3 text-left font-medium text-gray-600 md:table-cell">
                      Date
                    </th>

                    <th className="px-4 py-3 text-right font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pagedGrievances.map((grievance) => (
                    <tr
                      key={grievance.id}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {grievance.id}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {grievance.employeeName}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {grievance.category}
                      </td>

                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            priorityBadge(
                              grievance.priority,
                            ) as any
                          }
                        >
                          {grievance.priority}
                        </Badge>
                      </td>

                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            statusBadge(
                              grievance.status,
                            ) as any
                          }
                          dot
                        >
                          {grievance.status}
                        </Badge>
                      </td>

                      <td className="hidden px-4 py-3 text-gray-600 md:table-cell">
                        {grievance.createdAt}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() =>
                              setShowDetail(grievance)
                            }
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"
                            title="View grievance"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {canManage && (
                            <button
                              onClick={() => {
                                setShowRespond(grievance);
                              }}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600"
                              title="Respond"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* =====================================================
          DETAIL MODAL
          ===================================================== */}

      <Modal
        isOpen={!!showDetail}
        onClose={() => setShowDetail(null)}
        title={`Grievance ${showDetail?.id || ''}`}
        size="lg"
      >
        {showDetail && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <DetailItem
                label="Employee"
                value={showDetail.employeeName}
              />

              <DetailItem
                label="Category"
                value={showDetail.category}
              />

              <div>
                <span className="text-gray-500">
                  Priority:
                </span>

                <div className="mt-1">
                  <Badge
                    variant={
                      priorityBadge(
                        showDetail.priority,
                      ) as any
                    }
                  >
                    {showDetail.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <span className="text-gray-500">
                  Status:
                </span>

                <div className="mt-1">
                  <Badge
                    variant={
                      statusBadge(
                        showDetail.status,
                      ) as any
                    }
                    dot
                  >
                    {showDetail.status}
                  </Badge>
                </div>
              </div>

              <DetailItem
                label="Assigned To"
                value={
                  showDetail.assignedToName ||
                  'Unassigned'
                }
              />

              <DetailItem
                label="Created"
                value={showDetail.createdAt}
              />
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-900">
                Description
              </h4>

              <p className="rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-600">
                {showDetail.description}
              </p>
            </div>

            {showDetail.responses &&
              showDetail.responses.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-900">
                    Responses
                  </h4>

                  <div className="space-y-3">
                    {showDetail.responses.map(
                      (response, index) => (
                        <div
                          key={index}
                          className="rounded-lg bg-indigo-50 p-4"
                        >
                          <p className="text-sm text-gray-700">
                            {response.text}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {response.date}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

            {canManage &&
              showDetail.status !== 'Resolved' &&
              showDetail.status !== 'Closed' && (
                <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4">
                  {showDetail.status === 'New' && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          'Under Review',
                        )
                      }
                      className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
                    >
                      Mark Under Review
                    </button>
                  )}

                  {showDetail.status ===
                    'Under Review' && (
                    <button
                      onClick={() =>
                        handleStatusUpdate('Assigned')
                      }
                      className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                    >
                      Assign
                    </button>
                  )}

                  <button
                    onClick={() =>
                      handleStatusUpdate('Resolved')
                    }
                    className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                  >
                    Resolve
                  </button>
                </div>
              )}
          </div>
        )}
      </Modal>

      {/* =====================================================
          SUBMIT GRIEVANCE MODAL
          ===================================================== */}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Submit Grievance"
        size="md"
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <FormSelect
            label="Category"
            required
            value={form.category}
            onChange={(event) =>
              setForm({
                ...form,
                category: event.target.value,
              })
            }
            options={GRIEVANCE_CATEGORIES.map(
              (category) => ({
                value: category,
                label: category,
              }),
            )}
            placeholder="Select category"
            error={errors.category}
          />

          <FormSelect
            label="Priority"
            value={form.priority}
            onChange={(event) =>
              setForm({
                ...form,
                priority: event.target.value,
              })
            }
            options={GRIEVANCE_PRIORITIES.map(
              (priority) => ({
                value: priority,
                label: priority,
              }),
            )}
          />

          <FormTextarea
            label="Description"
            required
            value={form.description}
            onChange={(event) =>
              setForm({
                ...form,
                description: event.target.value,
              })
            }
            error={errors.description}
            rows={5}
            placeholder="Describe your grievance in detail..."
          />

          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
            <p className="text-xs leading-5 text-blue-700">
              Your grievance will be submitted to the
              appropriate officer once backend integration
              is available.
            </p>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Submit
            </button>
          </div>
        </form>
      </Modal>

      {/* =====================================================
          RESPONSE MODAL
          ===================================================== */}

      <Modal
        isOpen={!!showRespond}
        onClose={() => setShowRespond(null)}
        title="Add Response"
        size="md"
      >
        {showRespond && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Responding to grievance{' '}
              <strong>{showRespond.id}</strong>.
            </p>

            <FormTextarea
              label="Response"
              value={responseText}
              onChange={(event) =>
                setResponseText(event.target.value)
              }
              rows={5}
              placeholder="Type your response..."
            />

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => setShowRespond(null)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleRespond}
                disabled={!responseText.trim()}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Send Response
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* =========================================================
   SMALL UI COMPONENTS
   ========================================================= */

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          {icon}
        </div>

        <span className="text-sm font-medium text-gray-600">
          {title}
        </span>
      </div>

      <p className="text-2xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <span className="text-gray-500">{label}:</span>{' '}
      <span className="font-medium text-gray-900">
        {value}
      </span>
    </div>
  );
}

