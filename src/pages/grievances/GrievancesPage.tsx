import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

import {
  grievanceService,
  type Grievance,
} from '@/services/grievanceService';

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
} from 'lucide-react';

// ============================================================
// GRIEVANCES PAGE
// ============================================================

export default function GrievancesPage() {
  const { user, checkPermission } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();

  // ----------------------------------------------------------
  // View type
  // ----------------------------------------------------------

  const isManagementView =
    location.pathname.startsWith('/management/');

  const isEmployeeView = !isManagementView;

  const canManage =
    isManagementView &&
    checkPermission('grievances.manage');

  // ----------------------------------------------------------
  // Data
  // ----------------------------------------------------------

  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------------
  // Filters
  // ----------------------------------------------------------

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // ----------------------------------------------------------
  // Pagination
  // ----------------------------------------------------------

  const [currentPage, setCurrentPage] = useState(1);

  const perPage = 10;

  // ----------------------------------------------------------
  // Modals
  // ----------------------------------------------------------

  const [showDetail, setShowDetail] =
    useState<Grievance | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [showRespond, setShowRespond] =
    useState<Grievance | null>(null);

  // ----------------------------------------------------------
  // Form
  // ----------------------------------------------------------

  const [form, setForm] = useState({
    category: '',
    priority: 'Medium',
    description: '',
  });

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [saving, setSaving] =
    useState(false);

  // ----------------------------------------------------------
  // Response
  // ----------------------------------------------------------

  const [responseText, setResponseText] =
    useState('');

  const [respondLoading, setRespondLoading] =
    useState(false);

  // ==========================================================
  // Load grievances
  // ==========================================================

  useEffect(() => {
    loadData();
  }, [
    search,
    statusFilter,
    priorityFilter,
    categoryFilter,
    user,
    isManagementView,
  ]);

  const loadData = async () => {
    setLoading(true);

    try {
      const filters: {
        employeeId?: string;
        search?: string;
        status?: string;
        priority?: string;
        category?: string;
      } = {};

      // Employee should only see their own grievances
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

      setGrievances(data);

      // Keep page valid when filters reduce results
      const calculatedPages =
        Math.max(
          1,
          Math.ceil(data.length / perPage)
        );

      if (currentPage > calculatedPages) {
        setCurrentPage(calculatedPages);
      }

    } catch (error) {
      console.error(
        'Failed to load grievances:',
        error
      );

      setGrievances([]);

      addToast(
        'error',
        'Failed to load grievances'
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // Validate submit form
  // ==========================================================

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.category.trim()) {
      nextErrors.category = 'Category is required';
    }

    if (!form.description.trim()) {
      nextErrors.description =
        'Description is required';
    } else if (form.description.trim().length < 20) {
      nextErrors.description =
        'Please provide more detail (at least 20 characters)';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  // ==========================================================
  // Submit grievance
  // ==========================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    if (!user?.employeeId) {
      addToast(
        'error',
        'Unable to identify the employee'
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

      setCurrentPage(1);

      await loadData();

    } catch (error) {
      console.error(
        'Failed to submit grievance:',
        error
      );

      addToast(
        'error',
        'Failed to submit grievance'
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // Open grievance details
  // ==========================================================

  const handleOpenDetails = async (
    grievance: Grievance
  ) => {
    if (!grievance.id) {
      return;
    }

    try {
      const details =
        await grievanceService.getById(
          grievance.id
        );

      setShowDetail(details);

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

  // ==========================================================
  // Add management response
  // ==========================================================

  const handleRespond = async () => {
    if (!showRespond?.id) {
      return;
    }

    if (!user?.employeeId) {
      addToast(
        'error',
        'Unable to identify the current user'
      );
      return;
    }

    const text = responseText.trim();

    if (!text) {
      addToast(
        'error',
        'Response cannot be empty'
      );
      return;
    }

    setRespondLoading(true);

    try {
      await grievanceService.addResponse(
        showRespond.id,
        user.employeeId,
        text
      );

      // New grievance becomes Under Review
      if (showRespond.status === 'New') {
        await grievanceService.updateStatus(
          showRespond.id,
          'Under Review'
        );
      }

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

  // ==========================================================
  // Update grievance status
  // ==========================================================

  const handleStatusUpdate = async (
    id: number,
    status: string
  ) => {
    try {
      await grievanceService.updateStatus(
        id,
        status
      );

      addToast(
        'success',
        `Status updated to ${status}`
      );

      // Refresh detail modal
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

  // ==========================================================
  // Badge helpers
  // ==========================================================

  const getPriorityBadge = (
    priority?: string
  ) => {
    switch (priority) {
      case 'High':
      case 'Critical':
        return 'danger';

      case 'Medium':
        return 'warning';

      case 'Low':
      default:
        return 'neutral';
    }
  };

  const getStatusBadge = (
    status?: string
  ) => {
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
      default:
        return 'neutral';
    }
  };

  // ==========================================================
  // Pagination
  // ==========================================================

  const startIndex =
    (currentPage - 1) * perPage;

  const endIndex =
    startIndex + perPage;

  const pagedGrievances =
    grievances.slice(
      startIndex,
      endIndex
    );

  const totalPages =
    Math.ceil(
      grievances.length / perPage
    );

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div>

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

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
              type="button"
              onClick={() => {
                setErrors({});
                setShowForm(true);
              }}
              className="
                px-4
                py-2
                bg-indigo-600
                text-white
                text-sm
                font-medium
                rounded-lg
                hover:bg-indigo-700
                flex
                items-center
                gap-2
              "
            >
              <Plus className="h-4 w-4" />
              Submit Grievance
            </button>
          ) : undefined
        }
      />

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div
        className="
          flex
          flex-col
          sm:flex-row
          gap-3
          mb-4
        "
      >
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
          placeholder="All statuses"
        />

        <SelectFilter
          value={priorityFilter}
          onChange={(value) => {
            setPriorityFilter(value);
            setCurrentPage(1);
          }}
          options={GRIEVANCE_PRIORITIES}
          placeholder="All priorities"
        />

        <SelectFilter
          value={categoryFilter}
          onChange={(value) => {
            setCategoryFilter(value);
            setCurrentPage(1);
          }}
          options={GRIEVANCE_CATEGORIES}
          placeholder="All categories"
        />
      </div>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      {loading ? (
        <LoadingState />

      ) : grievances.length === 0 ? (

        <EmptyState
          icon={
            <MessageSquareWarning
              className="h-6 w-6"
            />
          }
          title="No grievances found"
          description={
            isEmployeeView
              ? 'You have not submitted any grievances yet.'
              : 'There are no grievances matching the selected filters.'
          }
        />

      ) : (

        <>
          {/* ==================================================
              TABLE
          ================================================== */}

          <div
            className="
              bg-white
              rounded-xl
              border
              border-gray-200
              overflow-hidden
            "
          >
            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-gray-50">

                  <tr>

                    <th
                      className="
                        text-left
                        py-3
                        px-4
                        font-medium
                        text-gray-600
                      "
                    >
                      ID
                    </th>

                    {!canManage && (
                      <th
                        className="
                          text-left
                          py-3
                          px-4
                          font-medium
                          text-gray-600
                        "
                      >
                        Employee
                      </th>
                    )}

                    <th
                      className="
                        text-left
                        py-3
                        px-4
                        font-medium
                        text-gray-600
                      "
                    >
                      Category
                    </th>

                    <th
                      className="
                        text-left
                        py-3
                        px-4
                        font-medium
                        text-gray-600
                      "
                    >
                      Priority
                    </th>

                    <th
                      className="
                        text-left
                        py-3
                        px-4
                        font-medium
                        text-gray-600
                      "
                    >
                      Status
                    </th>

                    <th
                      className="
                        text-left
                        py-3
                        px-4
                        font-medium
                        text-gray-600
                        hidden
                        md:table-cell
                      "
                    >
                      Date
                    </th>

                    <th
                      className="
                        text-right
                        py-3
                        px-4
                        font-medium
                        text-gray-600
                      "
                    >
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
                          border-t
                          border-gray-100
                          hover:bg-gray-50
                        "
                      >

                        {/* ID */}

                        <td
                          className="
                            py-3
                            px-4
                            font-medium
                            text-gray-900
                          "
                        >
                          {grievance.id}
                        </td>

                        {/* Employee */}

                        {!canManage && (
                          <td
                            className="
                              py-3
                              px-4
                              text-gray-600
                            "
                          >
                            {grievance.employeeName ||
                              grievance.employeeId ||
                              '—'}
                          </td>
                        )}

                        {/* Category */}

                        <td
                          className="
                            py-3
                            px-4
                            text-gray-600
                          "
                        >
                          {grievance.category}
                        </td>

                        {/* Priority */}

                        <td className="py-3 px-4">

                          <Badge
                            variant={
                              getPriorityBadge(
                                grievance.priority
                              ) as
                                | 'success'
                                | 'warning'
                                | 'danger'
                                | 'info'
                                | 'neutral'
                                | 'purple'
                            }
                          >
                            {grievance.priority ||
                              'Medium'}
                          </Badge>

                        </td>

                        {/* Status */}

                        <td className="py-3 px-4">

                          <Badge
                            variant={
                              getStatusBadge(
                                grievance.status
                              ) as
                                | 'success'
                                | 'warning'
                                | 'danger'
                                | 'info'
                                | 'neutral'
                                | 'purple'
                            }
                            dot
                          >
                            {grievance.status ||
                              'New'}
                          </Badge>

                        </td>

                        {/* Date */}

                        <td
                          className="
                            py-3
                            px-4
                            text-gray-600
                            hidden
                            md:table-cell
                          "
                        >
                          {grievance.createdAt ||
                            '—'}
                        </td>

                        {/* Actions */}

                        <td className="py-3 px-4">

                          <div
                            className="
                              flex
                              items-center
                              justify-end
                              gap-1
                            "
                          >

                            {/* View */}

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenDetails(
                                  grievance
                                )
                              }
                              className="
                                p-1.5
                                text-gray-400
                                hover:text-indigo-600
                                hover:bg-indigo-50
                                rounded-lg
                              "
                              title="View grievance"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {/* Respond */}

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
                                  p-1.5
                                  text-gray-400
                                  hover:text-green-600
                                  hover:bg-green-50
                                  rounded-lg
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

          {/* Pagination */}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />

        </>

      )}

      {/* ======================================================
          DETAIL MODAL
      ====================================================== */}

      <Modal
        isOpen={!!showDetail}
        onClose={() => setShowDetail(null)}
        title={`Grievance ${
          showDetail?.id || ''
        }`}
        size="lg"
      >

        {showDetail && (

          <div className="space-y-4">

            {/* Basic information */}

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
                text-sm
              "
            >

              <div>
                <span className="text-gray-500">
                  Employee:
                </span>{' '}
                <span className="font-medium">
                  {showDetail.employeeName ||
                    showDetail.employeeId ||
                    '—'}
                </span>
              </div>

              <div>
                <span className="text-gray-500">
                  Category:
                </span>{' '}
                <span className="font-medium">
                  {showDetail.category}
                </span>
              </div>

              <div>
                <span className="text-gray-500">
                  Priority:
                </span>{' '}

                <Badge
                  variant={
                    getPriorityBadge(
                      showDetail.priority
                    ) as
                      | 'success'
                      | 'warning'
                      | 'danger'
                      | 'info'
                      | 'neutral'
                      | 'purple'
                  }
                >
                  {showDetail.priority ||
                    'Medium'}
                </Badge>
              </div>

              <div>
                <span className="text-gray-500">
                  Status:
                </span>{' '}

                <Badge
                  variant={
                    getStatusBadge(
                      showDetail.status
                    ) as
                      | 'success'
                      | 'warning'
                      | 'danger'
                      | 'info'
                      | 'neutral'
                      | 'purple'
                  }
                  dot
                >
                  {showDetail.status ||
                    'New'}
                </Badge>
              </div>

              <div>
                <span className="text-gray-500">
                  Assigned To:
                </span>{' '}

                <span className="font-medium">
                  {showDetail.assignedToName ||
                    'Unassigned'}
                </span>
              </div>

              <div>
                <span className="text-gray-500">
                  Created:
                </span>{' '}

                <span className="font-medium">
                  {showDetail.createdAt ||
                    '—'}
                </span>
              </div>

            </div>

            {/* Description */}

            <div>

              <h4
                className="
                  text-sm
                  font-semibold
                  text-gray-900
                  mb-2
                "
              >
                Description
              </h4>

              <p
                className="
                  text-sm
                  text-gray-600
                  bg-gray-50
                  p-3
                  rounded-lg
                  whitespace-pre-wrap
                "
              >
                {showDetail.description}
              </p>

            </div>

            {/* Responses */}

            {Array.isArray(
              showDetail.responses
            ) &&
              showDetail.responses.length > 0 && (

                <div>

                  <h4
                    className="
                      text-sm
                      font-semibold
                      text-gray-900
                      mb-2
                    "
                  >
                    Responses (
                    {showDetail.responses.length}
                    )
                  </h4>

                  <div className="space-y-3">

                    {showDetail.responses.map(
                      (response, index) => (

                        <div
                          key={
                            response.id ??
                            index
                          }
                          className="
                            bg-indigo-50
                            p-3
                            rounded-lg
                          "
                        >

                          <p
                            className="
                              text-sm
                              text-gray-700
                              whitespace-pre-wrap
                            "
                          >
                            {response.text}
                          </p>

                          <p
                            className="
                              text-xs
                              text-gray-500
                              mt-1
                            "
                          >
                            {response.employeeName
                              ? `${response.employeeName} • `
                              : ''}
                            {response.date ||
                              response.createdAt ||
                              ''}
                          </p>

                        </div>

                      )
                    )}

                  </div>

                </div>
              )}

            {/* Management status buttons */}

            {canManage &&
              showDetail.status !==
                'Resolved' &&
              showDetail.status !==
                'Closed' && (

                <div
                  className="
                    flex
                    flex-wrap
                    gap-2
                    pt-4
                    border-t
                    border-gray-200
                  "
                >

                  {showDetail.status ===
                    'New' && (

                    <button
                      type="button"
                      onClick={() =>
                        handleStatusUpdate(
                          showDetail.id!,
                          'Under Review'
                        )
                      }
                      className="
                        px-3
                        py-1.5
                        text-xs
                        font-medium
                        text-amber-700
                        bg-amber-50
                        rounded-lg
                        hover:bg-amber-100
                      "
                    >
                      Mark Under Review
                    </button>
                  )}

                  {showDetail.status ===
                    'Under Review' && (

                    <button
                      type="button"
                      onClick={() =>
                        handleStatusUpdate(
                          showDetail.id!,
                          'Assigned'
                        )
                      }
                      className="
                        px-3
                        py-1.5
                        text-xs
                        font-medium
                        text-blue-700
                        bg-blue-50
                        rounded-lg
                        hover:bg-blue-100
                      "
                    >
                      Assign
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      handleStatusUpdate(
                        showDetail.id!,
                        'Resolved'
                      )
                    }
                    className="
                      px-3
                      py-1.5
                      text-xs
                      font-medium
                      text-green-700
                      bg-green-50
                      rounded-lg
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

      {/* ======================================================
          SUBMIT GRIEVANCE MODAL
      ====================================================== */}

      <Modal
        isOpen={showForm}
        onClose={() => {
          if (!saving) {
            setShowForm(false);
          }
        }}
        title="Submit Grievance"
        size="md"
      >

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Category */}

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
            options={
              GRIEVANCE_CATEGORIES.map(
                (category) => ({
                  value: category,
                  label: category,
                })
              )
            }
            placeholder="Select category"
            error={errors.category}
          />

          {/* Priority */}

          <FormSelect
            label="Priority"
            value={form.priority}
            onChange={(event) =>
              setForm({
                ...form,
                priority:
                  event.target.value,
              })
            }
            options={
              GRIEVANCE_PRIORITIES.map(
                (priority) => ({
                  value: priority,
                  label: priority,
                })
              )
            }
          />

          {/* Description */}

          <FormTextarea
            label="Description"
            required
            value={form.description}
            onChange={(event) =>
              setForm({
                ...form,
                description:
                  event.target.value,
              })
            }
            error={errors.description}
            rows={5}
            placeholder="Describe your grievance in detail..."
          />

          {/* Buttons */}

          <div
            className="
              flex
              justify-end
              gap-3
              pt-4
            "
          >

            <button
              type="button"
              onClick={() => {
                if (!saving) {
                  setShowForm(false);
                }
              }}
              disabled={saving}
              className="
                px-4
                py-2
                text-sm
                font-medium
                text-gray-700
                bg-white
                border
                border-gray-300
                rounded-lg
                hover:bg-gray-50
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="
                px-4
                py-2
                text-sm
                font-medium
                text-white
                bg-indigo-600
                rounded-lg
                hover:bg-indigo-700
                disabled:opacity-50
                flex
                items-center
                gap-2
              "
            >

              {saving && (
                <Loader2
                  className="
                    h-4
                    w-4
                    animate-spin
                  "
                />
              )}

              Submit

            </button>

          </div>

        </form>

      </Modal>

      {/* ======================================================
          RESPONSE MODAL
      ====================================================== */}

      <Modal
        isOpen={!!showRespond}
        onClose={() => {
          if (!respondLoading) {
            setShowRespond(null);
          }
        }}
        title="Add Response"
        size="md"
      >

        {showRespond && (

          <div className="space-y-4">

            <p className="text-sm text-gray-600">

              Responding to grievance{' '}

              <strong>
                #{showRespond.id}
              </strong>

              {' '}from{' '}

              <strong>
                {showRespond.employeeName ||
                  showRespond.employeeId}
              </strong>

            </p>

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

            <div
              className="
                flex
                justify-end
                gap-3
              "
            >

              <button
                type="button"
                onClick={() => {
                  if (!respondLoading) {
                    setShowRespond(null);
                  }
                }}
                disabled={respondLoading}
                className="
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-gray-700
                  bg-white
                  border
                  border-gray-300
                  rounded-lg
                  hover:bg-gray-50
                  disabled:opacity-50
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
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-white
                  bg-indigo-600
                  rounded-lg
                  hover:bg-indigo-700
                  disabled:opacity-50
                  flex
                  items-center
                  gap-2
                "
              >

                {respondLoading && (
                  <Loader2
                    className="
                      h-4
                      w-4
                      animate-spin
                    "
                  />
                )}

                Send Response

              </button>

            </div>

          </div>

        )}

      </Modal>

    </div>
  );
}