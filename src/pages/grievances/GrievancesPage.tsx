import {
  useEffect,
  useState,
  type FormEvent,
} from 'react';

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
  Edit3,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

// ============================================================
// GRIEVANCES PAGE
// ============================================================

export default function GrievancesPage() {
  const { user, checkPermission } =
    useAuth();

  const { addToast } =
    useToast();

  const location =
    useLocation();

  // ==========================================================
  // VIEW TYPE
  // ==========================================================

  const isManagementView =
    location.pathname.startsWith(
      '/management/'
    );

  const isEmployeeView =
    !isManagementView;

  const canManage =
    isManagementView &&
    checkPermission(
      'grievances.manage'
    );

  // ==========================================================
  // DATA
  // ==========================================================

  const [grievances, setGrievances] =
    useState<Grievance[]>([]);

  const [loading, setLoading] =
    useState(true);

  // ==========================================================
  // FILTERS
  // ==========================================================

  const [search, setSearch] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('All');

  const [priorityFilter, setPriorityFilter] =
    useState('All');

  const [categoryFilter, setCategoryFilter] =
    useState('All');

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const [currentPage, setCurrentPage] =
    useState(1);

  const perPage = 10;

  // ==========================================================
  // MODALS
  // ==========================================================

  const [showDetail, setShowDetail] =
    useState<Grievance | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [showRespond, setShowRespond] =
    useState<Grievance | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<Grievance | null>(null);

  // ==========================================================
  // EDIT MODE
  // ==========================================================

  const [editingGrievance, setEditingGrievance] =
    useState<Grievance | null>(null);

  // ==========================================================
  // FORM
  // ==========================================================

  const [form, setForm] =
    useState({
      category: '',
      priority: 'Medium',
      description: '',
    });

  const [errors, setErrors] =
    useState<
      Record<string, string>
    >({});

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  // ==========================================================
  // RESPONSE
  // ==========================================================

  const [responseText, setResponseText] =
    useState('');

  const [respondLoading, setRespondLoading] =
    useState(false);

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {
    loadData();
  }, [
    search,
    statusFilter,
    priorityFilter,
    categoryFilter,
    user?.employeeId,
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

      // ------------------------------------------------------
      // Employee only receives own grievances
      // ------------------------------------------------------

      if (
        isEmployeeView &&
        user?.employeeId
      ) {
        filters.employeeId =
          user.employeeId;
      }

      if (search.trim()) {
        filters.search =
          search.trim();
      }

      if (statusFilter !== 'All') {
        filters.status =
          statusFilter;
      }

      if (priorityFilter !== 'All') {
        filters.priority =
          priorityFilter;
      }

      if (categoryFilter !== 'All') {
        filters.category =
          categoryFilter;
      }

      const data =
        await grievanceService.getAll(
          filters
        );

      setGrievances(data);

      const calculatedPages =
        Math.max(
          1,
          Math.ceil(
            data.length / perPage
          )
        );

      if (
        currentPage >
        calculatedPages
      ) {
        setCurrentPage(
          calculatedPages
        );
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
  // FORM RESET
  // ==========================================================

  const resetForm = () => {
    setForm({
      category: '',
      priority: 'Medium',
      description: '',
    });

    setErrors({});
    setEditingGrievance(null);
  };

  // ==========================================================
  // OPEN CREATE FORM
  // ==========================================================

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  // ==========================================================
  // OPEN EDIT FORM
  // ==========================================================

  const openEditForm = (
    grievance: Grievance
  ) => {
    // --------------------------------------------------------
    // Safety check on frontend
    // Backend also performs the same ownership/status check.
    // --------------------------------------------------------

    if (
      !user?.employeeId ||
      grievance.employeeId !==
        user.employeeId
    ) {
      addToast(
        'error',
        'You can only edit your own grievances'
      );

      return;
    }

    if (
      grievance.status !== 'New'
    ) {
      addToast(
        'error',
        'This grievance can no longer be edited because processing has started'
      );

      return;
    }

    setEditingGrievance(
      grievance
    );

    setForm({
      category:
        grievance.category || '',

      priority:
        grievance.priority ||
        'Medium',

      description:
        grievance.description ||
        '',
    });

    setErrors({});
    setShowForm(true);
  };

  // ==========================================================
  // CLOSE FORM
  // ==========================================================

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    resetForm();
  };

  // ==========================================================
  // VALIDATE
  // ==========================================================

  const validate = () => {
    const nextErrors: Record<
      string,
      string
    > = {};

    if (!form.category.trim()) {
      nextErrors.category =
        'Category is required';
    }

    if (!form.description.trim()) {
      nextErrors.description =
        'Description is required';
    } else if (
      form.description.trim()
        .length < 20
    ) {
      nextErrors.description =
        'Please provide more detail (at least 20 characters)';
    }

    setErrors(
      nextErrors
    );

    return (
      Object.keys(
        nextErrors
      ).length === 0
    );
  };

  // ==========================================================
  // CREATE / UPDATE
  // ==========================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
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
      // ------------------------------------------------------
      // EDIT
      // ------------------------------------------------------

      if (
        editingGrievance?.id
      ) {
        await grievanceService.update(
          editingGrievance.id,
          {
            employeeId:
              user.employeeId,

            category:
              form.category.trim(),

            priority:
              form.priority,

            description:
              form.description.trim(),
          }
        );

        addToast(
          'success',
          'Grievance updated successfully'
        );
      }

      // ------------------------------------------------------
      // CREATE
      // ------------------------------------------------------

      else {
        await grievanceService.create(
          {
            employeeId:
              user.employeeId,

            category:
              form.category.trim(),

            priority:
              form.priority,

            description:
              form.description.trim(),
          }
        );

        addToast(
          'success',
          'Grievance submitted successfully'
        );
      }

      setShowForm(false);
      resetForm();

      setCurrentPage(1);

      await loadData();
    } catch (error) {
      console.error(
        'Failed to save grievance:',
        error
      );

      addToast(
        'error',
        error instanceof Error
          ? error.message
          : editingGrievance
            ? 'Failed to update grievance'
            : 'Failed to submit grievance'
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // DELETE
  // ==========================================================

  const openDeleteConfirmation = (
    grievance: Grievance
  ) => {
    if (!user?.employeeId) {
      return;
    }

    if (
      grievance.employeeId !==
      user.employeeId
    ) {
      addToast(
        'error',
        'You can only delete your own grievances'
      );

      return;
    }

    if (
      grievance.status !== 'New'
    ) {
      addToast(
        'error',
        'This grievance can no longer be deleted because processing has started'
      );

      return;
    }

    setDeleteTarget(
      grievance
    );
  };

  const handleDelete = async () => {
    if (
      !deleteTarget?.id ||
      !user?.employeeId
    ) {
      return;
    }

    setDeleting(true);

    try {
      await grievanceService.delete(
        deleteTarget.id,
        user.employeeId
      );

      addToast(
        'success',
        'Grievance deleted successfully'
      );

      setDeleteTarget(null);

      if (
        showDetail?.id ===
        deleteTarget.id
      ) {
        setShowDetail(null);
      }

      await loadData();
    } catch (error) {
      console.error(
        'Failed to delete grievance:',
        error
      );

      addToast(
        'error',
        error instanceof Error
          ? error.message
          : 'Failed to delete grievance'
      );
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================================
  // DETAILS
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
  // MANAGEMENT RESPONSE
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

    const text =
      responseText.trim();

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

      if (
        showRespond.status ===
        'New'
      ) {
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
  // MANAGEMENT STATUS UPDATE
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

      if (
        showDetail?.id === id
      ) {
        const updated =
          await grievanceService.getById(
            id
          );

        setShowDetail(
          updated
        );
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
  // BADGES
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
  // EMPLOYEE EDIT/DELETE PERMISSION
  // ==========================================================

  const canEmployeeModify = (
    grievance: Grievance
  ) => {
    return (
      isEmployeeView &&
      Boolean(user?.employeeId) &&
      grievance.employeeId ===
        user?.employeeId &&
      grievance.status === 'New'
    );
  };

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const startIndex =
    (currentPage - 1) *
    perPage;

  const endIndex =
    startIndex + perPage;

  const pagedGrievances =
    grievances.slice(
      startIndex,
      endIndex
    );

  const totalPages =
    Math.ceil(
      grievances.length /
        perPage
    );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <PageHeader
        title="Grievances & Feedback"
        description={
          canManage
            ? 'Manage and resolve employee grievances'
            : 'Submit and track your grievances'
        }
        action={
          isEmployeeView ? (
            <button
              type="button"
              onClick={
                openCreateForm
              }
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
          value={
            statusFilter
          }
          onChange={(value) => {
            setStatusFilter(
              value
            );
            setCurrentPage(1);
          }}
          options={
            GRIEVANCE_STATUSES
          }
          placeholder="All statuses"
        />

        <SelectFilter
          value={
            priorityFilter
          }
          onChange={(value) => {
            setPriorityFilter(
              value
            );
            setCurrentPage(1);
          }}
          options={
            GRIEVANCE_PRIORITIES
          }
          placeholder="All priorities"
        />

        <SelectFilter
          value={
            categoryFilter
          }
          onChange={(value) => {
            setCategoryFilter(
              value
            );
            setCurrentPage(1);
          }}
          options={
            GRIEVANCE_CATEGORIES
          }
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
            <MessageSquareWarning className="h-6 w-6" />
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
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      ID
                    </th>

                    {isEmployeeView && (
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Employee
                      </th>
                    )}

                    {canManage && (
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Employee
                      </th>
                    )}

                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Category
                    </th>

                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Priority
                    </th>

                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Status
                    </th>

                    <th className="text-left py-3 px-4 font-medium text-gray-600 hidden md:table-cell">
                      Date
                    </th>

                    <th className="text-right py-3 px-4 font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pagedGrievances.map(
                    (grievance) => (
                      <tr
                        key={
                          grievance.id
                        }
                        className="
                          border-t
                          border-gray-100
                          hover:bg-gray-50
                        "
                      >
                        <td className="py-3 px-4 font-medium text-gray-900">
                          #{grievance.id}
                        </td>

                        <td className="py-3 px-4 text-gray-600">
                          {grievance.employeeName ||
                            grievance.employeeId ||
                            '—'}
                        </td>

                        <td className="py-3 px-4 text-gray-600">
                          {grievance.category}
                        </td>

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

                        <td className="py-3 px-4 text-gray-600 hidden md:table-cell">
                          {grievance.createdAt ||
                            '—'}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            {/* VIEW */}
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

                            {/* EDIT - EMPLOYEE ONLY */}
                            {canEmployeeModify(
                              grievance
                            ) && (
                              <button
                                type="button"
                                onClick={() =>
                                  openEditForm(
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
                                title="Edit grievance"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                            )}

                            {/* DELETE - EMPLOYEE ONLY */}
                            {canEmployeeModify(
                              grievance
                            ) && (
                              <button
                                type="button"
                                onClick={() =>
                                  openDeleteConfirmation(
                                    grievance
                                  )
                                }
                                className="
                                  p-1.5
                                  text-gray-400
                                  hover:text-red-600
                                  hover:bg-red-50
                                  rounded-lg
                                "
                                title="Delete grievance"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}

                            {/* RESPOND - MANAGEMENT */}
                            {canManage && (
                              <button
                                type="button"
                                onClick={() => {
                                  setShowRespond(
                                    grievance
                                  );

                                  setResponseText(
                                    ''
                                  );
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

          <Pagination
            currentPage={
              currentPage
            }
            totalPages={
              totalPages
            }
            onPageChange={
              setCurrentPage
            }
          />
        </>
      )}

      {/* ======================================================
          DETAIL MODAL
      ====================================================== */}

      <Modal
        isOpen={
          !!showDetail
        }
        onClose={() =>
          setShowDetail(null)
        }
        title={`Grievance ${
          showDetail?.id || ''
        }`}
        size="lg"
      >
        {showDetail && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
                  {
                    showDetail.category
                  }
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

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Description
              </h4>

              <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                {
                  showDetail.description
                }
              </p>
            </div>

            {/* EMPLOYEE ACTION NOTICE */}

            {isEmployeeView &&
              showDetail.status ===
                'New' &&
              showDetail.employeeId ===
                user?.employeeId && (
                <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
                  <p className="text-xs text-indigo-700">
                    This grievance is still new, so you can edit or delete it.
                    Once HR starts processing it, these options will no longer be available.
                  </p>
                </div>
              )}

            {/* RESPONSES */}

            {Array.isArray(
              showDetail.responses
            ) &&
              showDetail.responses.length >
                0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Responses (
                    {
                      showDetail
                        .responses
                        .length
                    }
                    )
                  </h4>

                  <div className="space-y-3">
                    {showDetail.responses.map(
                      (
                        response,
                        index
                      ) => (
                        <div
                          key={
                            response.id ??
                            index
                          }
                          className="bg-indigo-50 p-3 rounded-lg"
                        >
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {
                              response.text
                            }
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
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

            {/* MANAGEMENT STATUS */}

            {canManage &&
              showDetail.status !==
                'Resolved' &&
              showDetail.status !==
                'Closed' && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
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
                      className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100"
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
                      className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
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
                    className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100"
                  >
                    Resolve
                  </button>
                </div>
              )}

            {/* EMPLOYEE EDIT BUTTON IN DETAIL */}

            {canEmployeeModify(
              showDetail
            ) && (
              <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDetail(
                      null
                    );

                    openEditForm(
                      showDetail
                    );
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowDetail(
                      null
                    );

                    openDeleteConfirmation(
                      showDetail
                    );
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ======================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      <Modal
        isOpen={
          showForm
        }
        onClose={
          closeForm
        }
        title={
          editingGrievance
            ? 'Edit Grievance'
            : 'Submit Grievance'
        }
        size="md"
      >
        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-4"
        >
          {editingGrievance && (
            <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
              <p className="text-xs text-indigo-700">
                You are editing grievance #
                {
                  editingGrievance.id
                }
                . You can edit it while its status is New.
              </p>
            </div>
          )}

          <FormSelect
            label="Category"
            required
            value={
              form.category
            }
            onChange={(
              event
            ) =>
              setForm(
                (previous) => ({
                  ...previous,
                  category:
                    event.target
                      .value,
                })
              )
            }
            options={GRIEVANCE_CATEGORIES.map(
              (category) => ({
                value:
                  category,
                label:
                  category,
              })
            )}
            placeholder="Select category"
            error={
              errors.category
            }
          />

          <FormSelect
            label="Priority"
            value={
              form.priority
            }
            onChange={(
              event
            ) =>
              setForm(
                (previous) => ({
                  ...previous,
                  priority:
                    event.target
                      .value,
                })
              )
            }
            options={GRIEVANCE_PRIORITIES.map(
              (priority) => ({
                value:
                  priority,
                label:
                  priority,
              })
            )}
          />

          <FormTextarea
            label="Description"
            required
            value={
              form.description
            }
            onChange={(
              event
            ) =>
              setForm(
                (previous) => ({
                  ...previous,
                  description:
                    event.target
                      .value,
                })
              )
            }
            error={
              errors.description
            }
            rows={6}
            placeholder="Describe your grievance in detail..."
          />

          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">
              Please provide enough information for HR to understand and investigate your concern. Minimum 20 characters.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={
                closeForm
              }
              disabled={
                saving
              }
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving
              }
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {editingGrievance
                ? 'Save Changes'
                : 'Submit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ======================================================
          DELETE CONFIRMATION
      ====================================================== */}

      <Modal
        isOpen={
          !!deleteTarget
        }
        onClose={() => {
          if (!deleting) {
            setDeleteTarget(
              null
            );
          }
        }}
        title="Delete Grievance"
        size="sm"
      >
        {deleteTarget && (
          <div className="space-y-5">
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-red-900">
                  Are you sure?
                </h3>

                <p className="mt-1 text-sm leading-5 text-red-700">
                  Grievance #
                  {
                    deleteTarget.id
                  }{' '}
                  will be permanently deleted. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">
                  Category:
                </span>{' '}
                {
                  deleteTarget.category
                }
              </p>

              <p className="mt-1 text-xs text-gray-500">
                <span className="font-medium text-gray-700">
                  Status:
                </span>{' '}
                {
                  deleteTarget.status ||
                  'New'
                }
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(
                    null
                  )
                }
                disabled={
                  deleting
                }
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDelete
                }
                disabled={
                  deleting
                }
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Grievance
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================================
          MANAGEMENT RESPONSE MODAL
      ====================================================== */}

      <Modal
        isOpen={
          !!showRespond
        }
        onClose={() => {
          if (!respondLoading) {
            setShowRespond(
              null
            );
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
              </strong>{' '}
              from{' '}
              <strong>
                {showRespond.employeeName ||
                  showRespond.employeeId}
              </strong>
            </p>

            <FormTextarea
              label="Response"
              required
              value={
                responseText
              }
              onChange={(
                event
              ) =>
                setResponseText(
                  event.target
                    .value
                )
              }
              rows={5}
              placeholder="Type your response..."
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (
                    !respondLoading
                  ) {
                    setShowRespond(
                      null
                    );
                  }
                }}
                disabled={
                  respondLoading
                }
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleRespond
                }
                disabled={
                  !responseText.trim() ||
                  respondLoading
                }
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {respondLoading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
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