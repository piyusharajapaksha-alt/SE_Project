import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { leaveService } from '@/services/dataServices';
import {
  PageHeader,
  SearchInput,
  SelectFilter,
  Badge,
  Pagination,
  LoadingState,
  EmptyState,
  StatCard,
  Modal,
  FormInput,
  FormSelect,
  FormTextarea,
} from '@/components/ui';
import { DEPARTMENTS, LEAVE_TYPES } from '@/config';
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Plus,
  User,
  BriefcaseBusiness,
} from 'lucide-react';

type LeaveRequest = {
  id: number;
  employeeId: string;
  employeeName?: string;
  department?: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  approverId?: string;
  status: string;
  comment?: string;
};

type LeaveBalance = {
  total: number;
  used: number;
  remaining: number;
};

type BalanceResponse = {
  annualLeave: LeaveBalance;
  sickLeave: LeaveBalance;
  personalLeave: LeaveBalance;
};

export default function LeavePage() {
  const { user, checkPermission } = useAuth();
  const location = useLocation();
  const { addToast } = useToast();

  const isManagementView =
    location.pathname.startsWith('/management/');

  const isEmployeeView = !isManagementView;

  const canApprove =
    isManagementView &&
    checkPermission('leave.approve');

  const [requests, setRequests] =
    useState<LeaveRequest[]>([]);

  const [balance, setBalance] =
    useState<BalanceResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('All');

  const [deptFilter, setDeptFilter] =
    useState('All');

  const [currentPage, setCurrentPage] =
    useState(1);

  const [showForm, setShowForm] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [selectedRequest, setSelectedRequest] =
    useState<LeaveRequest | null>(null);

  const [approveAction, setApproveAction] =
    useState<'approve' | 'reject'>('approve');

  const [approveComment, setApproveComment] =
    useState('');

  const [approveLoading, setApproveLoading] =
    useState(false);

  const [form, setForm] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [errorMessage, setErrorMessage] =
    useState('');

  const perPage = 10;


  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    loadData();
  }, [
    user?.employeeId,
    isManagementView,
    search,
    statusFilter,
    deptFilter,
  ]);


  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const filters: Record<string, string> = {};

      if (isEmployeeView) {
        filters.employeeId = user.employeeId;
      }

      if (isManagementView) {
        if (search.trim()) {
          filters.search = search.trim();
        }

        if (deptFilter !== 'All') {
          filters.department = deptFilter;
        }
      }

      if (statusFilter !== 'All') {
        filters.status = statusFilter;
      }

      const [leaveData, balanceData] =
        await Promise.all([
          leaveService.getAll(filters),
          leaveService.getBalance(user.employeeId),
        ]);

      setRequests(
        Array.isArray(leaveData)
          ? leaveData
          : []
      );

      setBalance(
        balanceData ?? null
      );

      setCurrentPage(1);
    } catch (error) {
      console.error(
        'Failed to load leave data:',
        error
      );

      setErrorMessage(
        'Unable to load leave information. Please check the backend connection.'
      );
    } finally {
      setLoading(false);
    }
  };


  // ============================================================
  // VALIDATE FORM
  // ============================================================

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.type) {
      nextErrors.type = 'Leave type is required';
    }

    if (!form.startDate) {
      nextErrors.startDate =
        'Start date is required';
    }

    if (!form.endDate) {
      nextErrors.endDate =
        'End date is required';
    }

    if (
      form.startDate &&
      form.endDate &&
      form.startDate > form.endDate
    ) {
      nextErrors.endDate =
        'End date must be after start date';
    }

    if (!form.reason.trim()) {
      nextErrors.reason =
        'Reason is required';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };


  // ============================================================
  // BUSINESS DAYS
  // ============================================================

  const duration = useMemo(() => {
    if (!form.startDate || !form.endDate) {
      return 0;
    }

    const start =
      new Date(`${form.startDate}T00:00:00`);

    const end =
      new Date(`${form.endDate}T00:00:00`);

    if (start > end) {
      return 0;
    }

    let days = 0;

    const current = new Date(start);

    while (current <= end) {
      const day = current.getDay();

      if (day !== 0 && day !== 6) {
        days++;
      }

      current.setDate(
        current.getDate() + 1
      );
    }

    return days;
  }, [
    form.startDate,
    form.endDate,
  ]);


  // ============================================================
  // CREATE REQUEST
  // ============================================================

  const handleSubmitRequest = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!validate() || !user) {
      return;
    }

    setSaving(true);

    try {
      await leaveService.create({
        employeeId: user.employeeId,
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason.trim(),
        approverId: '',
      });

      addToast(
        'success',
        'Leave request submitted successfully'
      );

      setShowForm(false);

      setForm({
        type: '',
        startDate: '',
        endDate: '',
        reason: '',
      });

      setErrors({});

      await loadData();
    } catch (error) {
      console.error(
        'Leave request failed:',
        error
      );

      addToast(
        'error',
        'Failed to submit leave request'
      );
    } finally {
      setSaving(false);
    }
  };


  // ============================================================
  // APPROVE / REJECT
  // ============================================================

  const handleDecision = async () => {
    if (!selectedRequest) {
      return;
    }

    if (
      approveAction === 'reject' &&
      !approveComment.trim()
    ) {
      addToast(
        'error',
        'Please provide a reason for rejection'
      );

      return;
    }

    setApproveLoading(true);

    try {
      if (approveAction === 'approve') {
        await leaveService.approve(
          selectedRequest.id,
          approveComment
        );

        addToast(
          'success',
          'Leave request approved'
        );
      } else {
        await leaveService.reject(
          selectedRequest.id,
          approveComment
        );

        addToast(
          'success',
          'Leave request rejected'
        );
      }

      setSelectedRequest(null);
      setApproveComment('');

      await loadData();
    } catch (error) {
      console.error(
        'Leave decision failed:',
        error
      );

      addToast(
        'error',
        'Failed to update leave request'
      );
    } finally {
      setApproveLoading(false);
    }
  };


  // ============================================================
  // CANCEL
  // ============================================================

  const handleCancel = async (
    id: number
  ) => {
    try {
      await leaveService.cancel(id);

      addToast(
        'success',
        'Leave request cancelled'
      );

      await loadData();
    } catch (error) {
      console.error(
        'Leave cancellation failed:',
        error
      );

      addToast(
        'error',
        'Failed to cancel leave request'
      );
    }
  };


  // ============================================================
  // STATUS BADGE
  // ============================================================

  const statusBadge = (
    status: string
  ) => {
    switch (status) {
      case 'Approved':
        return 'success';

      case 'Rejected':
        return 'danger';

      case 'Pending':
        return 'warning';

      case 'Cancelled':
        return 'neutral';

      default:
        return 'info';
    }
  };


  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages =
    Math.ceil(
      requests.length / perPage
    );

  const pagedRequests =
    requests.slice(
      (currentPage - 1) * perPage,
      currentPage * perPage
    );


  return (
    <div>

      <PageHeader
        title={
          isEmployeeView
            ? 'My Leave'
            : 'Leave Management'
        }
        description={
          isEmployeeView
            ? 'Request and track your leave'
            : 'Manage employee leave requests and balances'
        }
        action={
          isEmployeeView ? (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Request Leave
            </button>
          ) : undefined
        }
      />


      {/* ERROR */}
      {errorMessage && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}


      {/* ======================================================
          LEAVE BALANCE
      ====================================================== */}

      {balance && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          <StatCard
            title="Annual Leave"
            value={`${balance.annualLeave.remaining}/${balance.annualLeave.total}`}
            icon={
              <CalendarDays className="h-5 w-5" />
            }
            color="blue"
          />

          <StatCard
            title="Sick Leave"
            value={`${balance.sickLeave.remaining}/${balance.sickLeave.total}`}
            icon={
              <Clock className="h-5 w-5" />
            }
            color="amber"
          />

          <StatCard
            title="Personal Leave"
            value={`${balance.personalLeave.remaining}/${balance.personalLeave.total}`}
            icon={
              <CalendarDays className="h-5 w-5" />
            }
            color="purple"
          />

        </div>
      )}


      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="flex flex-col lg:flex-row gap-3 mb-4">

        {isManagementView && (
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                setCurrentPage(1);
              }}
              placeholder="Search employees..."
            />
          </div>
        )}

        {isManagementView && (
          <SelectFilter
            value={deptFilter}
            onChange={(value) => {
              setDeptFilter(value);
              setCurrentPage(1);
            }}
            options={DEPARTMENTS}
            placeholder="All Departments"
          />
        )}

        <SelectFilter
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
          options={[
            'Pending',
            'Approved',
            'Rejected',
            'Cancelled',
          ]}
          placeholder="All Statuses"
        />

      </div>


      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading ? (
        <LoadingState />
      ) : requests.length === 0 ? (

        <EmptyState
          icon={
            <CalendarDays className="h-6 w-6" />
          }
          title="No leave requests found"
        />

      ) : (

        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-gray-50">

                  <tr>

                    {isManagementView && (
                      <>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Employee
                        </th>

                        <th className="text-left py-3 px-4 font-medium text-gray-600 hidden lg:table-cell">
                          Department
                        </th>
                      </>
                    )}

                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Leave Type
                    </th>

                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Start Date
                    </th>

                    <th className="text-left py-3 px-4 font-medium text-gray-600 hidden sm:table-cell">
                      End Date
                    </th>

                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Status
                    </th>

                    <th className="text-right py-3 px-4 font-medium text-gray-600">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {pagedRequests.map(
                    (request) => (

                      <tr
                        key={request.id}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >

                        {isManagementView && (
                          <>
                            <td className="py-3 px-4">

                              <div className="flex items-center gap-2">

                                <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
                                  <User className="h-4 w-4 text-indigo-600" />
                                </div>

                                <div>
                                  <p className="font-medium text-gray-900">
                                    {request.employeeName ||
                                      request.employeeId}
                                  </p>

                                  <p className="text-xs text-gray-500">
                                    {request.employeeId}
                                  </p>
                                </div>

                              </div>

                            </td>

                            <td className="py-3 px-4 hidden lg:table-cell">

                              <div className="flex items-center gap-2 text-gray-600">
                                <BriefcaseBusiness className="h-4 w-4" />
                                {request.department || '-'}
                              </div>

                            </td>
                          </>
                        )}

                        <td className="py-3 px-4 text-gray-700 font-medium">
                          {request.type}
                        </td>

                        <td className="py-3 px-4 text-gray-600">
                          {request.startDate}
                        </td>

                        <td className="py-3 px-4 text-gray-600 hidden sm:table-cell">
                          {request.endDate}
                        </td>

                        <td className="py-3 px-4">

                          <Badge
                            variant={
                              statusBadge(
                                request.status
                              ) as any
                            }
                            dot
                          >
                            {request.status}
                          </Badge>

                        </td>

                        <td className="py-3 px-4">

                          <div className="flex items-center justify-end gap-1">

                            {canApprove &&
                              request.status ===
                                'Pending' && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedRequest(
                                        request
                                      );
                                      setApproveAction(
                                        'approve'
                                      );
                                      setApproveComment('');
                                    }}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                                    title="Approve"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      setSelectedRequest(
                                        request
                                      );
                                      setApproveAction(
                                        'reject'
                                      );
                                      setApproveComment('');
                                    }}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                    title="Reject"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </>
                              )}

                            {isEmployeeView &&
                              request.status ===
                                'Pending' && (
                                <button
                                  onClick={() =>
                                    handleCancel(
                                      request.id
                                    )
                                  }
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Cancel request"
                                >
                                  <XCircle className="h-4 w-4" />
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


          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

        </>

      )}


      {/* ======================================================
          REQUEST LEAVE MODAL
      ====================================================== */}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Request Leave"
        size="md"
      >

        <form
          onSubmit={handleSubmitRequest}
          className="space-y-4"
        >

          <FormSelect
            label="Leave Type"
            required
            value={form.type}
            onChange={(event) =>
              setForm({
                ...form,
                type: event.target.value,
              })
            }
            options={LEAVE_TYPES.map(
              (type) => ({
                value: type,
                label: type,
              })
            )}
            placeholder="Select leave type"
            error={errors.type}
          />


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

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
              required
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

          </div>


          {duration > 0 && (
            <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3">

              <p className="text-sm text-indigo-700 font-medium">
                Duration: {duration} business day
                {duration !== 1 ? 's' : ''}
              </p>

              <p className="text-xs text-indigo-600 mt-1">
                Weekends are not included.
              </p>

            </div>
          )}


          <FormTextarea
            label="Reason"
            required
            value={form.reason}
            onChange={(event) =>
              setForm({
                ...form,
                reason:
                  event.target.value,
              })
            }
            error={errors.reason}
            rows={4}
            placeholder="Explain the reason for your leave..."
          />


          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={() =>
                setShowForm(false)
              }
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >

              {saving && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              Submit Request

            </button>

          </div>

        </form>

      </Modal>


      {/* ======================================================
          APPROVE / REJECT MODAL
      ====================================================== */}

      <Modal
        isOpen={!!selectedRequest}
        onClose={() => {
          if (!approveLoading) {
            setSelectedRequest(null);
            setApproveComment('');
          }
        }}
        title={
          approveAction === 'approve'
            ? 'Approve Leave Request'
            : 'Reject Leave Request'
        }
        size="sm"
      >

        {selectedRequest && (

          <div className="space-y-4">

            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">

              <div className="flex items-center gap-3 mb-3">

                <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>

                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedRequest.employeeName ||
                      selectedRequest.employeeId}
                  </p>

                  <p className="text-sm text-gray-500">
                    {selectedRequest.employeeId}
                  </p>
                </div>

              </div>

              <div className="text-sm text-gray-600 space-y-1">

                <p>
                  <strong>Type:</strong>{' '}
                  {selectedRequest.type}
                </p>

                <p>
                  <strong>Dates:</strong>{' '}
                  {selectedRequest.startDate}
                  {' - '}
                  {selectedRequest.endDate}
                </p>

                <p>
                  <strong>Reason:</strong>{' '}
                  {selectedRequest.reason}
                </p>

              </div>

            </div>


            <FormTextarea
              label={
                approveAction === 'reject'
                  ? 'Rejection Reason'
                  : 'Comments'
              }
              required={
                approveAction === 'reject'
              }
              value={approveComment}
              onChange={(event) =>
                setApproveComment(
                  event.target.value
                )
              }
              rows={3}
              placeholder={
                approveAction === 'reject'
                  ? 'Please explain why this request is being rejected...'
                  : 'Optional comment...'
              }
            />


            <div className="flex justify-end gap-3">

              <button
                onClick={() =>
                  setSelectedRequest(null)
                }
                disabled={approveLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDecision}
                disabled={approveLoading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 flex items-center gap-2 ${
                  approveAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >

                {approveLoading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {approveAction === 'approve'
                  ? 'Approve'
                  : 'Reject'}

              </button>

            </div>

          </div>

        )}

      </Modal>

    </div>
  );
}