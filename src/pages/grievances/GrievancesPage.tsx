import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { grievanceService } from '@/services/dataServices';
import { PageHeader, SearchInput, SelectFilter, Badge, Pagination, LoadingState, EmptyState, Modal, FormInput, FormSelect, FormTextarea } from '@/components/ui';
import { GRIEVANCE_CATEGORIES, GRIEVANCE_PRIORITIES, GRIEVANCE_STATUSES } from '@/config';
import { MessageSquareWarning, Plus, Eye, Loader2, Send, AlertTriangle, CheckCircle } from 'lucide-react';

export default function GrievancesPage() {
  const { user, checkPermission } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const isManagementView = location.pathname.startsWith('/management/');
  const isEmployeeView = !isManagementView;
  const canManage = isManagementView && checkPermission('grievances.manage');
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showRespond, setShowRespond] = useState<any>(null);
  const [responseText, setResponseText] = useState('');
  const [respondLoading, setRespondLoading] = useState(false);
  const perPage = 10;

  const [form, setForm] = useState({ category: '', priority: 'Medium', description: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { loadData(); }, [search, statusFilter, priorityFilter, categoryFilter, user, isManagementView]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (isEmployeeView && user) filters.employeeId = user.employeeId;
      if (search) filters.search = search;
      if (statusFilter !== 'All') filters.status = statusFilter;
      if (priorityFilter !== 'All') filters.priority = priorityFilter;
      if (categoryFilter !== 'All') filters.category = categoryFilter;
      const data = await grievanceService.getAll(filters);
      setGrievances(data);
    } catch { } finally { setLoading(false); }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.category) errs.category = 'Required';
    if (!form.description) errs.description = 'Required';
    if (form.description.length < 20) errs.description = 'Please provide more detail (at least 20 characters)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;
    setSaving(true);
    try {
      await grievanceService.create({ ...form, employeeId: user.employeeId });
      addToast('success', 'Grievance submitted successfully');
      setShowForm(false);
      setForm({ category: '', priority: 'Medium', description: '' });
      loadData();
    } catch { addToast('error', 'Failed to submit grievance'); }
    finally { setSaving(false); }
  };

  const handleRespond = async () => {
    if (!showRespond || !user) return;
    setRespondLoading(true);
    try {
      await grievanceService.addResponse(showRespond.id, user.employeeId, responseText);
      if (showRespond.status === 'New') {
        await grievanceService.updateStatus(showRespond.id, 'Under Review');
      }
      addToast('success', 'Response added successfully');
      setShowRespond(null);
      setResponseText('');
      loadData();
    } catch { addToast('error', 'Failed to add response'); }
    finally { setRespondLoading(false); }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await grievanceService.updateStatus(id, status, user?.employeeId);
      addToast('success', `Status updated to ${status}`);
      if (showDetail) {
        const updated = await grievanceService.getById(id);
        setShowDetail(updated);
      }
      loadData();
    } catch { addToast('error', 'Failed to update status'); }
  };

  const priorityBadge = (p: string) => p === 'High' || p === 'Critical' ? 'danger' : p === 'Medium' ? 'warning' : 'neutral';
  const statusBadge = (s: string) => s === 'New' ? 'info' : s === 'Under Review' ? 'warning' : s === 'Assigned' ? 'purple' : s === 'Resolved' ? 'success' : 'neutral';

  const paged = grievances.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(grievances.length / perPage);

  return (
    <div>
      <PageHeader title="Grievances & Feedback" description={canManage ? 'Manage and resolve employee grievances' : 'Submit and track your grievances'}
        action={!canManage ? <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2"><Plus className="h-4 w-4" />Submit Grievance</button> : undefined} />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1"><SearchInput value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="Search grievances..." /></div>
        <SelectFilter value={statusFilter} onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }} options={GRIEVANCE_STATUSES} />
        <SelectFilter value={priorityFilter} onChange={(v) => { setPriorityFilter(v); setCurrentPage(1); }} options={GRIEVANCE_PRIORITIES} />
        <SelectFilter value={categoryFilter} onChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }} options={GRIEVANCE_CATEGORIES} />
      </div>

      {loading ? <LoadingState /> : grievances.length === 0 ? <EmptyState icon={<MessageSquareWarning className="h-6 w-6" />} title="No grievances found" /> : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">ID</th>
                    {!canManage && <th className="text-left py-3 px-4 font-medium text-gray-600">Employee</th>}
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 hidden md:table-cell">Date</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((g: any) => (
                    <tr key={g.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{g.id}</td>
                      {!canManage && <td className="py-3 px-4 text-gray-600">{g.employeeName}</td>}
                      <td className="py-3 px-4 text-gray-600">{g.category}</td>
                      <td className="py-3 px-4"><Badge variant={priorityBadge(g.priority) as any}>{g.priority}</Badge></td>
                      <td className="py-3 px-4"><Badge variant={statusBadge(g.status) as any} dot>{g.status}</Badge></td>
                      <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{g.createdAt}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={async () => { const d = await grievanceService.getById(g.id); setShowDetail(d); }} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Eye className="h-4 w-4" /></button>
                          {canManage && <button onClick={() => { setShowRespond(g); }} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Respond"><Send className="h-4 w-4" /></button>}
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

      {/* Detail Modal */}
      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title={`Grievance ${showDetail?.id || ''}`} size="lg">
        {showDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Employee:</span> <span className="font-medium">{showDetail.employeeName}</span></div>
              <div><span className="text-gray-500">Category:</span> <span className="font-medium">{showDetail.category}</span></div>
              <div><span className="text-gray-500">Priority:</span> <Badge variant={priorityBadge(showDetail.priority) as any}>{showDetail.priority}</Badge></div>
              <div><span className="text-gray-500">Status:</span> <Badge variant={statusBadge(showDetail.status) as any} dot>{showDetail.status}</Badge></div>
              <div><span className="text-gray-500">Assigned To:</span> <span className="font-medium">{showDetail.assignedToName || 'Unassigned'}</span></div>
              <div><span className="text-gray-500">Created:</span> <span className="font-medium">{showDetail.createdAt}</span></div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{showDetail.description}</p>
            </div>
            {showDetail.responses?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Responses ({showDetail.responses.length})</h4>
                <div className="space-y-3">
                  {showDetail.responses.map((r: any, i: number) => (
                    <div key={i} className="bg-indigo-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">{r.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{r.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {canManage && showDetail.status !== 'Resolved' && showDetail.status !== 'Closed' && (
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                {showDetail.status === 'New' && <button onClick={() => handleStatusUpdate(showDetail.id, 'Under Review')} className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100">Mark Under Review</button>}
                {showDetail.status === 'Under Review' && <button onClick={() => handleStatusUpdate(showDetail.id, 'Assigned')} className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100">Assign</button>}
                <button onClick={() => handleStatusUpdate(showDetail.id, 'Resolved')} className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100">Resolve</button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Submit Grievance Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Submit Grievance" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormSelect label="Category" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={GRIEVANCE_CATEGORIES.map(c => ({ value: c, label: c }))} placeholder="Select category" error={errors.category} />
          <FormSelect label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} options={GRIEVANCE_PRIORITIES.map(p => ({ value: p, label: p }))} />
          <FormTextarea label="Description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} error={errors.description} rows={4} placeholder="Describe your grievance in detail..." />
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}Submit
            </button>
          </div>
        </form>
      </Modal>

      {/* Respond Modal */}
      <Modal isOpen={!!showRespond} onClose={() => setShowRespond(null)} title="Add Response" size="md">
        {showRespond && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Responding to grievance <strong>{showRespond.id}</strong> from <strong>{showRespond.employeeName}</strong></p>
            <FormTextarea label="Response" value={responseText} onChange={(e) => setResponseText(e.target.value)} rows={4} placeholder="Type your response..." />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowRespond(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleRespond} disabled={!responseText.trim() || respondLoading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                {respondLoading && <Loader2 className="h-4 w-4 animate-spin" />}Send Response
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
