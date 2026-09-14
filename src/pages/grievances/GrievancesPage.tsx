import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { grievanceService } from '@/services/grievanceService';

import {
  PageHeader,
  SearchInput,
  SelectFilter,
  Badge,
  Pagination,
  LoadingState,
  EmptyState,
  Modal,
  FormSelect,
  FormTextarea,
} from '@/components/ui';

import {
  GRIEVANCE_CATEGORIES,
  GRIEVANCE_PRIORITIES,
  GRIEVANCE_STATUSES,
} from '@/config';

import {
  MessageSquareWarning,
  Plus,
  Eye,
  Loader2,
  Send,
  RefreshCw,
} from 'lucide-react';

interface Grievance {
  id: number;
  employeeId: string;
  employeeName?: string;
  category: string;
  priority: string;
  description: string;
  status: string;
  createdAt?: string;
  assignedToName?: string;
  responses?: {
    text: string;
    date?: string;
  }[];
}

interface GrievanceFilters {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  employeeId?: string;
}

export default function GrievancesPage() {
  const { user, checkPermission } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();

  const isManagementView =
    location.pathname.startsWith('/management/');

  const isEmployeeView = !isManagementView;

  const canManage =
    isManagementView &&
    checkPermission('grievances.manage');

  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [currentPage, setCurrentPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] =
    useState<Grievance | null>(null);

  const [saving, setSaving] = useState(false);

  const [showRespond, setShowRespond] =
    useState<Grievance | null>(null);

  const [responseText, setResponseText] = useState('');
  const [respondLoading, setRespondLoading] =
    useState(false);

  const [form, setForm] = useState({
    category: '',
    priority: 'Medium',
    description: '',
  });

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const perPage = 10;

  /*
   * ---------------------------------------------------------
   * LOAD GRIEVANCES
   * ---------------------------------------------------------
   *
   * IMPORTANT:
   * This keeps the original getAll(filters) architecture.
   *
   * The page sends filters to grievanceService.
   * grievanceService will communicate with Spring Boot.
   */
  const loadData = async () => {
    setLoading(true);

    try {
      const filters: GrievanceFilters = {};

      if (isEmployeeView && user?.employeeId) {
        filters.employeeId = user.employeeId;
      }

      if (search.trim()) {
        filters.search = search.trim();
      }

      if (statusFilter !== 'All') {
        filters.status = statusFilter;
      }

      if (priorityFilter !== 'All') {
        filters.priority = priorityFilter;
      }

      if (categoryFilter !== 'All') {
        filters.category = categoryFilter;
      }

      const data =
        await grievanceService.getAll(filters);

      setGrievances(data || []);
    } catch (error) {
      console.error(
        'Failed to load grievances:',
        error
      );

      setGrievances([]);

      addToast(
        'error',
        'Failed to load grievances',
        'Unable to retrieve grievance records from the server.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    loadData();
  }, [
    search,
    statusFilter,
    priorityFilter,
    categoryFilter,
    user?.employeeId,
    isManagementView,
  ]);

  /*
   * ---------------------------------------------------------
   * SUBMIT VALIDATION
   * ---------------------------------------------------------
   */
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.category) {
      newErrors.category = 'Category is required';
    }

    if (!form.description.trim()) {
      newErrors.description =
        'Description is required';
    } else if (form.description.trim().length < 20) {
      newErrors.description =
        'Please provide more detail (at least 20 characters)';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /*
   * ---------------------------------------------------------
   * SUBMIT GRIEVANCE
   * ---------------------------------------------------------
   */
  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    if (!user?.employeeId) {
      addToast(
        'error',
        'Unable to submit grievance',
        'Your employee account could not be identified.'
      );

      return;
    }

    setSaving(true);

    try {
      await grievanceService.create({
        employeeId: user.employeeId,
        category: form.category,
        priority: form.priority,
        description: form.description.trim(),
      });

      addToast(
        'success',
        'Grievance submitted successfully'
      );

      setShowForm(false);

      setForm({
        category: '',
        priority: 'Medium',
        description: '',
      });

      setErrors({});

      await loadData();
    } catch (error) {
      console.error(
        'Failed to submit grievance:',
        error
      );

      addToast(
        'error',
        'Failed to submit grievance',
        'Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * VIEW DETAILS
   * ---------------------------------------------------------
   */
  const handleViewDetails = async (
    grievance: Grievance
  ) => {
    try {
      const detail =
        await grievanceService.getById(
          grievance.id
        );

      setShowDetail(detail);
    } catch (error) {
      console.error(
        'Failed to load grievance:',
        error
      );

      addToast(
        'error',
        'Failed to load grievance details'
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * MANAGEMENT RESPONSE
   * ---------------------------------------------------------
   *
   * Kept here so the existing management UI does not
   * disappear. The backend response endpoint will be
   * connected through grievanceService.
   */
  const handleRespond = async () => {
    if (
      !showRespond ||
      !user?.employeeId ||
      !responseText.trim()
    ) {
      return;
    }

    setRespondLoading(true);

    try {
      await grievanceService.addResponse(
        showRespond.id,
        user.employeeId,
        responseText.trim()
      );

      addToast(
        'success',
        'Response added successfully'
      );

      setShowRespond(null);
      setResponseText('');

      await loadData();
    } catch (error) {
      console.error(
        'Failed to add response:',
        error
      );

      addToast(
        'error',
        'Failed to add response'
      );
    } finally {
      setRespondLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * STATUS UPDATE
   * ---------------------------------------------------------
   */
  const handleStatusUpdate = async (
    id: number,
    status: string
  ) => {
    if (!user?.employeeId) {
      return;
    }

    try {
      await grievanceService.updateStatus(
        id,
        status,
        user.employeeId
      );

      addToast(
        'success',
        `Status updated to ${status}`
      );

      if (showDetail?.id === id) {
        const updated =
          await grievanceService.getById(id);

        setShowDetail(updated);
      }

      await loadData();
    } catch (error) {
      console.error(
        'Failed to update status:',
        error
      );

      addToast(
        'error',
        'Failed to update status'
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * BADGE HELPERS
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

      case 'Closed':
        return 'neutral';

      default:
        return 'neutral';
    }
  };

  /*
   * ---------------------------------------------------------
   * CLIENT-SIDE PAGINATION
   * ---------------------------------------------------------
   */
  const totalPages = Math.max(
    1,
    Math.ceil(grievances.length / perPage)
  );

  const pagedGrievances = grievances.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  /*
   * ---------------------------------------------------------
   * RESET FILTERS
   * ---------------------------------------------------------
   */
  const resetFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setCategoryFilter('All');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ====================================================== */}
      <PageHeader
        title="Grievances & Feedback"
        description={
          canManage
            ? 'Review, respond to, and resolve employee grievances'
            : 'Submit and track your workplace grievances'
        }
        action={
          !canManage ? (
            <button
              onClick={() => setShowForm(true)}
              className="
                inline-flex items-center gap-2
                rounded-lg
                bg-indigo-600
                px-4 py-2
                text-sm font-medium
                text-white
                shadow-sm
                transition
                hover:bg-indigo-700
              "
            >
              <Plus className="h-4 w-4" />
              Submit Grievance
            </button>
          ) : undefined
        }
      />

      {/* =====================================================
          FILTERS
      ====================================================== */}
      <div
        className="
          rounded-xl
          border border-gray-200
          bg-white
          p-4
        "
      >
        <div className="flex flex-col gap-3 lg:flex-row">

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

          <button
            type="button"
            onClick={resetFilters}
            className="
              inline-flex items-center
              justify-center gap-2
              rounded-lg
              border border-gray-300
              bg-white
              px-3 py-2
              text-sm font-medium
              text-gray-700
              hover:bg-gray-50
            "
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      {loading ? (
        <LoadingState />
      ) : grievances.length === 0 ? (
        <EmptyState
          icon={
            <MessageSquareWarning className="h-6 w-6" />
          }
          title="No grievances found"
        />
      ) : (
        <>
          <div
            className="
              overflow-hidden
              rounded-xl
              border border-gray-200
              bg-white
            "
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                <thead className="bg-gray-50">
                  <tr>

                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      ID
                    </th>

                    {canManage && (
                      <th className="px-4 py-3 text-left font-medium text-gray-600">
                        Employee
                      </th>
                    )}

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

                  {pagedGrievances.map(
                    (grievance) => (
                      <tr
                        key={grievance.id}
                        className="
                          border-t border-gray-100
                          transition
                          hover:bg-gray-50
                        "
                      >

                        <td className="px-4 py-3 font-medium text-gray-900">
                          #{grievance.id}
                        </td>

                        {canManage && (
                          <td className="px-4 py-3 text-gray-600">
                            {grievance.employeeName ||
                              grievance.employeeId ||
                              '—'}
                          </td>
                        )}

                        <td className="px-4 py-3 text-gray-600">
                          {grievance.category}
                        </td>

                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              priorityBadge(
                                grievance.priority
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
                                grievance.status
                              ) as any
                            }
                            dot
                          >
                            {grievance.status}
                          </Badge>
                        </td>

                        <td className="hidden px-4 py-3 text-gray-600 md:table-cell">
                          {grievance.createdAt
                            ? new Date(
                                grievance.createdAt
                              ).toLocaleDateString()
                            : '—'}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex justify-end">

                            <button
                              type="button"
                              onClick={() =>
                                handleViewDetails(
                                  grievance
                                )
                              }
                              className="
                                rounded-lg
                                p-2
                                text-gray-400
                                hover:bg-indigo-50
                                hover:text-indigo-600
                              "
                              title="View grievance"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {canManage && (
                              <button
                                type="button"
                                onClick={() => {
                                  setShowRespond(
                                    grievance
                                  );
                                  setResponseText('');
                                }}
                                className="
                                  rounded-lg
                                  p-2
                                  text-gray-400
                                  hover:bg-green-50
                                  hover:text-green-600
                                "
                                title="Respond"
                              >
                                <Send className="h-4 w-4" />
                              </button>
                            )}

                          </div>
                        </td>

                      </tr>
                    )
                  )}

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
      ====================================================== */}
      <Modal
        isOpen={!!showDetail}
        onClose={() => setShowDetail(null)}
        title={`Grievance #${showDetail?.id || ''}`}
        size="lg"
      >
        {showDetail && (
          <div className="space-y-5">

            <div className="grid grid-cols-1 gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">

              <div>
                <p className="text-xs text-gray-500">
                  Employee
                </p>

                <p className="mt-1 text-sm font-medium text-gray-900">
                  {showDetail.employeeName ||
                    showDetail.employeeId ||
                    '—'}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Category
                </p>

                <p className="mt-1 text-sm font-medium text-gray-900">
                  {showDetail.category}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Priority
                </p>

                <div className="mt-1">
                  <Badge
                    variant={
                      priorityBadge(
                        showDetail.priority
                      ) as any
                    }
                  >
                    {showDetail.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Status
                </p>

                <div className="mt-1">
                  <Badge
                    variant={
                      statusBadge(
                        showDetail.status
                      ) as any
                    }
                    dot
                  >
                    {showDetail.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Assigned To
                </p>

                <p className="mt-1 text-sm font-medium text-gray-900">
                  {showDetail.assignedToName ||
                    'Unassigned'}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Created
                </p>

                <p className="mt-1 text-sm font-medium text-gray-900">
                  {showDetail.createdAt
                    ? new Date(
                        showDetail.createdAt
                      ).toLocaleString()
                    : '—'}
                </p>
              </div>

            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-900">
                Description
              </h4>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
                  {showDetail.description}
                </p>
              </div>
            </div>

            {showDetail.responses &&
              showDetail.responses.length > 0 && (
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">
                    Responses
                  </h4>

                  <div className="space-y-3">
                    {showDetail.responses.map(
                      (response, index) => (
                        <div
                          key={index}
                          className="
                            rounded-xl
                            border border-indigo-100
                            bg-indigo-50
                            p-4
                          "
                        >
                          <p className="text-sm text-gray-700">
                            {response.text}
                          </p>

                          {response.date && (
                            <p className="mt-2 text-xs text-gray-500">
                              {response.date}
                            </p>
                          )}
                        </div>
                      )
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
                          showDetail.id,
                          'Under Review'
                        )
                      }
                      className="
                        rounded-lg
                        bg-amber-50
                        px-3 py-2
                        text-xs font-medium
                        text-amber-700
                        hover:bg-amber-100
                      "
                    >
                      Mark Under Review
                    </button>
                  )}

                  {showDetail.status ===
                    'Under Review' && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          showDetail.id,
                          'Assigned'
                        )
                      }
                      className="
                        rounded-lg
                        bg-blue-50
                        px-3 py-2
                        text-xs font-medium
                        text-blue-700
                        hover:bg-blue-100
                      "
                    >
                      Assign
                    </button>
                  )}

                  <button
                    onClick={() =>
                      handleStatusUpdate(
                        showDetail.id,
                        'Resolved'
                      )
                    }
                    className="
                      rounded-lg
                      bg-green-50
                      px-3 py-2
                      text-xs font-medium
                      text-green-700
                      hover:bg-green-100
                    "
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
      ====================================================== */}
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
              })
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
              })
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

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="
                rounded-lg
                border border-gray-300
                bg-white
                px-4 py-2
                text-sm font-medium
                text-gray-700
                hover:bg-gray-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="
                inline-flex items-center gap-2
                rounded-lg
                bg-indigo-600
                px-4 py-2
                text-sm font-medium
                text-white
                hover:bg-indigo-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              Submit Grievance
            </button>

          </div>
        </form>
      </Modal>

      {/* =====================================================
          RESPONSE MODAL
      ====================================================== */}
      <Modal
        isOpen={!!showRespond}
        onClose={() => setShowRespond(null)}
        title="Respond to Grievance"
        size="md"
      >
        {showRespond && (
          <div className="space-y-4">

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                Responding to grievance
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                #{showRespond.id}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                {showRespond.employeeName ||
                  showRespond.employeeId ||
                  'Employee'}
              </p>
            </div>

            <FormTextarea
              label="Response"
              required
              value={responseText}
              onChange={(event) =>
                setResponseText(
                  event.target.value
                )
              }
              rows={5}
              placeholder="Type your response..."
            />

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">

              <button
                type="button"
                onClick={() =>
                  setShowRespond(null)
                }
                className="
                  rounded-lg
                  border border-gray-300
                  bg-white
                  px-4 py-2
                  text-sm font-medium
                  text-gray-700
                  hover:bg-gray-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRespond}
                disabled={
                  !responseText.trim() ||
                  respondLoading
                }
                className="
                  inline-flex items-center gap-2
                  rounded-lg
                  bg-indigo-600
                  px-4 py-2
                  text-sm font-medium
                  text-white
                  hover:bg-indigo-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {respondLoading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

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

