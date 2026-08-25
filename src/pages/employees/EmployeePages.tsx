import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { employeeService, attendanceService, leaveService, performanceService } from '@/services/dataServices';
import { PageHeader, SearchInput, SelectFilter, Badge, Pagination, LoadingState, EmptyState, Modal, ConfirmDialog, FormInput, FormSelect, FormTextarea } from '@/components/ui';
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '@/config';
import { Plus, Eye, Pencil, Trash2, Users, Mail, Phone, MapPin, Briefcase, CalendarDays, ChevronLeft, Loader2 } from 'lucide-react';

// --- Employee List Page ---
export function EmployeeListPage() {
  const { checkPermission } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const perPage = 10;

  useEffect(() => { loadEmployees(); }, [search, deptFilter, statusFilter]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getAll({ search, department: deptFilter, status: statusFilter });
      setEmployees(data);
    } catch { } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await employeeService.delete(deleteId);
      addToast('success', 'Employee deleted successfully');
      setDeleteId(null);
      loadEmployees();
    } catch { addToast('error', 'Failed to delete employee'); }
    finally { setDeleting(false); }
  };

  const paged = employees.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(employees.length / perPage);

  const statusBadge = (s: string) => s === 'Active' ? 'success' : s === 'On Leave' ? 'warning' : s === 'Probation' ? 'info' : 'danger';

  return (
    <div>
      <PageHeader title="Employees" description="Manage employee records and profiles"
        action={checkPermission('employees.create') ? <button onClick={() => navigate('/employees/create')} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2"><Plus className="h-4 w-4" />Add Employee</button> : undefined} />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1"><SearchInput value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="Search by name, email, ID..." /></div>
        <SelectFilter value={deptFilter} onChange={(v) => { setDeptFilter(v); setCurrentPage(1); }} options={DEPARTMENTS} placeholder="All Departments" />
        <SelectFilter value={statusFilter} onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }} options={EMPLOYEE_STATUSES} />
      </div>

      {loading ? <LoadingState /> : employees.length === 0 ? <EmptyState icon={<Users className="h-6 w-6" />} title="No employees found" description="Try adjusting your search or filters" /> : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 hidden sm:table-cell">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 hidden md:table-cell">Position</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 hidden lg:table-cell">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((emp: any) => (
                    <tr key={emp.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                            {emp.firstName[0]}{emp.lastName[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{emp.firstName} {emp.lastName}</p>
                            <p className="text-xs text-gray-500 truncate">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 hidden sm:table-cell">{emp.department}</td>
                      <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{emp.position}</td>
                      <td className="py-3 px-4 text-gray-600 hidden lg:table-cell">{emp.role}</td>
                      <td className="py-3 px-4"><Badge variant={statusBadge(emp.status) as any} dot>{emp.status}</Badge></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/employees/${emp.id}`)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="View"><Eye className="h-4 w-4" /></button>
                          {checkPermission('employees.edit') && <button onClick={() => navigate(`/employees/${emp.id}/edit`)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Edit"><Pencil className="h-4 w-4" /></button>}
                          {checkPermission('employees.delete') && <button onClick={() => setDeleteId(emp.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="h-4 w-4" /></button>}
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

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Employee" message="Are you sure you want to delete this employee? This action cannot be undone." confirmLabel="Delete" variant="danger" isLoading={deleting} />
    </div>
  );
}

// --- Employee Detail Page ---
export function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (empId: string) => {
    setLoading(true);
    try {
      const emp = await employeeService.getById(empId);
      setEmployee(emp);
      const att = await attendanceService.getByEmployee(empId);
      setAttendance(att);
      const lv = await leaveService.getAll({ employeeId: empId });
      setLeaves(lv);
      const perf = await performanceService.getByEmployee(empId);
      setPerformance(perf);
    } catch { } finally { setLoading(false); }
  };

  if (loading) return <LoadingState />;
  if (!employee) return <EmptyState title="Employee not found" />;

  return (
    <div>
      <button onClick={() => navigate('/employees')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ChevronLeft className="h-4 w-4" /> Back to Employees
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {employee.firstName[0]}{employee.lastName[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{employee.firstName} {employee.lastName}</h1>
            <p className="text-sm text-gray-500 mt-1">{employee.position} • {employee.department}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant={employee.status === 'Active' ? 'success' : 'warning'} dot>{employee.status}</Badge>
              <Badge variant="info">{employee.role}</Badge>
              <Badge variant="neutral">{employee.id}</Badge>
            </div>
          </div>
          <button onClick={() => navigate(`/employees/${employee.id}/edit`)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2">
            <Pencil className="h-4 w-4" /> Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-700">{employee.email}</span></div>
            <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-700">{employee.phone}</span></div>
            <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-700">{employee.address}</span></div>
            <div className="flex items-center gap-3"><Briefcase className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-700">Hired: {employee.hireDate}</span></div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h3>
          <div className="space-y-2">
            {attendance.slice(0, 5).map((a: any) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-600">{a.date}</span>
                <Badge variant={a.status === 'Present' ? 'success' : a.status === 'Late' ? 'warning' : a.status === 'Absent' ? 'danger' : 'info'} dot>{a.status}</Badge>
              </div>
            ))}
            {attendance.length === 0 && <p className="text-sm text-gray-500">No attendance records.</p>}
          </div>
        </div>

        {/* Leave History */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave History</h3>
          <div className="space-y-2">
            {leaves.slice(0, 5).map((l: any) => (
              <div key={l.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{l.type}</p>
                  <p className="text-xs text-gray-500">{l.startDate} - {l.endDate}</p>
                </div>
                <Badge variant={l.status === 'Approved' ? 'success' : l.status === 'Rejected' ? 'danger' : 'warning'} dot>{l.status}</Badge>
              </div>
            ))}
            {leaves.length === 0 && <p className="text-sm text-gray-500">No leave requests.</p>}
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Reviews</h3>
          <div className="space-y-2">
            {performance.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">Review - {p.reviewDate}</p>
                  <p className="text-xs text-gray-500">Rating: {p.rating}/5</p>
                </div>
                <Badge variant={p.status === 'Completed' ? 'success' : 'warning'}>{p.status}</Badge>
              </div>
            ))}
            {performance.length === 0 && <p className="text-sm text-gray-500">No performance reviews.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Employee Form Page (Create/Edit) ---
export function EmployeeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', department: 'Engineering', position: '', role: 'Employee', status: 'Active', hireDate: '', address: '', emergencyContact: '', salary: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      employeeService.getById(id).then((emp) => {
        if (emp) setForm({ firstName: emp.firstName, lastName: emp.lastName, email: emp.email, phone: emp.phone, department: emp.department, position: emp.position, role: emp.role, status: emp.status, hireDate: emp.hireDate, address: emp.address || '', emergencyContact: emp.emergencyContact || '', salary: String(emp.salary || '') });
        setLoading(false);
      });
    }
  }, [id]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName) errs.firstName = 'Required';
    if (!form.lastName) errs.lastName = 'Required';
    if (!form.email) errs.email = 'Required';
    if (!form.position) errs.position = 'Required';
    if (!form.hireDate) errs.hireDate = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit) {
        await employeeService.update(id!, form);
        addToast('success', 'Employee updated successfully');
      } else {
        await employeeService.create(form);
        addToast('success', 'Employee created successfully');
      }
      navigate('/employees');
    } catch { addToast('error', `Failed to ${isEdit ? 'update' : 'create'} employee`); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      <button onClick={() => navigate('/employees')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ChevronLeft className="h-4 w-4" /> Back to Employees
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Employee' : 'Add New Employee'}</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput label="First Name" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} error={errors.firstName} />
          <FormInput label="Last Name" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} error={errors.lastName} />
          <FormInput label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
          <FormInput label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <FormSelect label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} options={DEPARTMENTS.map(d => ({ value: d, label: d }))} />
          <FormInput label="Position" required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} error={errors.position} />
          <FormSelect label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} options={['Employee', 'HR Manager', 'Department Manager', 'Training Coordinator', 'Grievance Officer', 'Event Organizer'].map(r => ({ value: r, label: r }))} />
          <FormSelect label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={EMPLOYEE_STATUSES.map(s => ({ value: s, label: s }))} />
          <FormInput label="Hire Date" type="date" required value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} error={errors.hireDate} />
          <FormInput label="Salary" type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
        </div>
        <FormTextarea label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} />
        <FormInput label="Emergency Contact" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button type="button" onClick={() => navigate('/employees')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Update Employee' : 'Create Employee'}
          </button>
        </div>
      </form>
    </div>
  );
}
