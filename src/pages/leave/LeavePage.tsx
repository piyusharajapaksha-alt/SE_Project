import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { leaveService } from '@/services/dataServices';
import { PageHeader, SearchInput, SelectFilter, Badge, Pagination, LoadingState, EmptyState, StatCard, Modal, FormInput, FormSelect, FormTextarea, ConfirmDialog } from '@/components/ui';
import { DEPARTMENTS, LEAVE_TYPES } from '@/config';
import { CalendarDays, CheckCircle, XCircle, Clock, Send, Loader2, Plus } from 'lucide-react';

export default function LeavePage() {
  const { user, checkPermission } = useAuth();
  const location = useLocation();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const isManagementView = location.pathname.startsWith('/management/');
  const isEmployeeView = !isManagementView;
  const canApprove = isManagementView && checkPermission('leave.approve');

  const [requests, setRequests] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showApprove, setShowApprove] = useState<any>(null);
  const [approveAction, setApproveAction] = useState<'approve' | 'reject'>('approve');
  const [approveComment, setApproveComment] = useState('');
  const [approveLoading, setApproveLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({ type: '', startDate: '', endDate: '', reason: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const perPage = 10;

  useEffect(() => { loadData(); }, [search, statusFilter, deptFilter, user, isManagementView]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (isEmployeeView && user) filters.employeeId = user.employeeId;
      else {
        if (search) filters.search = search;
        if (deptFilter !== 'All') filters.department = deptFilter;
      }
      if (statusFilter !== 'All') filters.status = statusFilter;
      const data = await leaveService.getAll(filters);
      setRequests(data);

      if (user) {
        const bal = await leaveService.getBalance(user.employeeId);
        setBalance(bal);
      }
    } catch { } finally { setLoading(false); }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.type) errs.type = 'Required';
    if (!form.startDate) errs.startDate = 'Required';
    if (!form.endDate) errs.endDate = 'Required';
    if (!form.reason) errs.reason = 'Required';
    if (form.startDate && form.endDate && form.startDate > form.endDate) errs.endDate = 'End date must be after start date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;
    setSaving(true);
    try {
      await leaveService.create({ ...form, employeeId: user.employeeId, approverId: '' });
      addToast('success', 'Leave request submitted successfully');
      setShowForm(false);
      setForm({ type: '', startDate: '', endDate: '', reason: '' });
      loadData();
    } catch { addToast('error', 'Failed to submit leave request'); }
    finally { setSaving(false); }
  };

  const handleApprove = async () => {
    if (!showApprove) return;
    setApproveLoading(true);
    try {
      if (approveAction === 'approve') {
        await leaveService.approve(showApprove.id, approveComment);
        addToast('success', 'Leave request approved');
      } else {
        await leaveService.reject(showApprove.id, approveComment);
        addToast('success', 'Leave request rejected');
      }
      setShowApprove(null);
      setApproveComment('');
      loadData();
    } catch { addToast('error', 'Failed to update leave request'); }
    finally { setApproveLoading(false); }
  };

  const handleCancel = async (id: string) => {
    try {
      await leaveService.cancel(id);
      addToast('success', 'Leave request cancelled');
      loadData();
    } catch { addToast('error', 'Failed to cancel'); }
  };

  // Calculate duration
  const duration = form.startDate && form.endDate ? (() => {
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    let days = 0;
    const current = new Date(start);
    while (current <= end) { const day = current.getDay(); if (day !== 0 && day !== 6) days++; current.setDate(current.getDate() + 1); }
    return days || 1;
  })() : 0;

  const statusBadge = (s: string) => s === 'Approved' ? 'success' : s === 'Rejected' ? 'danger' : s === 'Pending' ? 'warning' : s === 'Cancelled' ? 'neutral' : 'info';

  const paged = requests.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(requests.length / perPage);

  return (
    <div>
      <PageHeader title={isEmployeeView ? 'My Leave' : 'Leave Management'} description={isEmployeeView ? 'Request and track your leave' : 'Manage leave requests and balances'}
        action={isEmployeeView ? <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2"><Plus className="h-4 w-4" />Request Leave</button> : undefined} />

      {/* Leave Balance */}
      {balance && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard title="Annual Leave" value={`${balance.annualLeave.remaining}/${balance.annualLeave.total}`} icon={<CalendarDays className="h-5 w-5" />} color="blue" />
          <StatCard title="Sick Leave" value={`${balance.sickLeave.remaining}/${balance.sickLeave.total}`} icon={<Clock className="h-5 w-5" />} color="amber" />
          <StatCard title="Personal Leave" value={`${balance.personalLeave.remaining}/${balance.personalLeave.total}`} icon={<CalendarDays className="h-5 w-5" />} color="purple" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {!isEmployeeView && <div className="flex-1"><SearchInput value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="Search employees..." /></div>}
        {!isEmployeeView && <SelectFilter value={deptFilter} onChange={(v) => { setDeptFilter(v); setCurrentPage(1); }} options={DEPARTMENTS} placeholder="All Departments" />}
        <SelectFilter value={statusFilter} onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }} options={['Pending', 'Approved', 'Rejected', 'Cancelled']} />
      </div>

      {loading ? <LoadingState /> : requests.length === 0 ? <EmptyState icon={<CalendarDays className="h-6 w-6" />} title="No leave requests found" /> : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {!isEmployeeView && <th className="text-left py-3 px-4 font-medium text-gray-600">Employee</th>}
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Start Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 hidden sm:table-cell">End Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((r: any) => (
                    <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                      {!isEmployeeView && <td className="py-3 px-4 font-medium text-gray-900">{r.employeeName}</td>}
                      <td className="py-3 px-4 text-gray-600">{r.type}</td>
                      <td className="py-3 px-4 text-gray-600">{r.startDate}</td>
                      <td className="py-3 px-4 text-gray-600 hidden sm:table-cell">{r.endDate}</td>
                      <td className="py-3 px-4"><Badge variant={statusBadge(r.status) as any} dot>{r.status}</Badge></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          {canApprove && r.status === 'Pending' && (
                            <>
                              <button onClick={() => { setShowApprove(r); setApproveAction('approve'); }} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Approve"><CheckCircle className="h-4 w-4" /></button>
                              <button onClick={() => { setShowApprove(r); setApproveAction('reject'); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Reject"><XCircle className="h-4 w-4" /></button>
                            </>
                          )}
                          {isEmployeeView && r.status === 'Pending' && (
                            <button onClick={() => handleCancel(r.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Cancel"><XCircle className="h-4 w-4" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}

      {/* Leave Request Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Request Leave" size="md">
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          <FormSelect label="Leave Type" required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={LEAVE_TYPES.map(t => ({ value: t, label: t }))} placeholder="Select type" error={errors.type} />
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Start Date" type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} error={errors.startDate} />
            <FormInput label="End Date" type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} error={errors.endDate} />
          </div>
          {duration > 0 && <p className="text-sm text-indigo-600 font-medium">Duration: {duration} business day(s)</p>}
          <FormTextarea label="Reason" required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} error={errors.reason} rows={3} />
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Approve/Reject Modal */}
      <Modal isOpen={!!showApprove} onClose={() => setShowApprove(null)} title={approveAction === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'} size="sm">
        {showApprove && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {approveAction === 'approve' ? 'Approve' : 'Reject'} leave request from <strong>{showApprove.employeeName}</strong> for {showApprove.type} ({showApprove.startDate} - {showApprove.endDate})?
            </p>
            <FormTextarea label="Comments" value={approveComment} onChange={(e) => setApproveComment(e.target.value)} rows={2} />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowApprove(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleApprove} disabled={approveLoading} className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 flex items-center gap-2 ${approveAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {approveLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {approveAction === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
