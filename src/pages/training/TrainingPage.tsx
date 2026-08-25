import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { trainingService } from '@/services/dataServices';
import { PageHeader, SearchInput, SelectFilter, Badge, Pagination, LoadingState, EmptyState, Modal, ConfirmDialog, FormInput, FormSelect, FormTextarea } from '@/components/ui';
import { TRAINING_CATEGORIES } from '@/config';
import { GraduationCap, Plus, Users, MapPin, Calendar, Pencil, Trash2, UserPlus, UserMinus, Loader2 } from 'lucide-react';

export default function TrainingPage() {
  const { user, checkPermission } = useAuth();
  const { addToast } = useToast();
  const canManage = checkPermission('training.manage');
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const perPage = 8;

  const [form, setForm] = useState({ title: '', description: '', trainer: '', category: 'Technical', startDate: '', endDate: '', location: '', capacity: '20' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { loadData(); }, [search, categoryFilter, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await trainingService.getAll({ search, category: categoryFilter, status: statusFilter });
      setPrograms(data);
    } catch { } finally { setLoading(false); }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title) errs.title = 'Required';
    if (!form.trainer) errs.trainer = 'Required';
    if (!form.startDate) errs.startDate = 'Required';
    if (!form.endDate) errs.endDate = 'Required';
    if (!form.location) errs.location = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await trainingService.create({ ...form, capacity: Number(form.capacity) });
      addToast('success', 'Training program created successfully');
      setShowForm(false);
      setForm({ title: '', description: '', trainer: '', category: 'Technical', startDate: '', endDate: '', location: '', capacity: '20' });
      loadData();
    } catch { addToast('error', 'Failed to create training'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await trainingService.delete(deleteId);
      addToast('success', 'Training program deleted');
      setDeleteId(null);
      loadData();
    } catch { addToast('error', 'Failed to delete'); }
    finally { setDeleting(false); }
  };

  const handleRegister = async (id: string) => {
    if (!user) return;
    try {
      await trainingService.register(id, user.employeeId);
      addToast('success', 'Registered for training successfully');
      loadData();
    } catch (err: any) { addToast('error', err.message || 'Failed to register'); }
  };

  const handleUnregister = async (id: string) => {
    if (!user) return;
    try {
      await trainingService.unregister(id, user.employeeId);
      addToast('success', 'Unregistered from training');
      loadData();
    } catch { addToast('error', 'Failed to unregister'); }
  };

  const paged = programs.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(programs.length / perPage);

  return (
    <div>
      <PageHeader title="Training Programs" description="Browse and manage training opportunities"
        action={canManage ? <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2"><Plus className="h-4 w-4" />Create Training</button> : undefined} />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1"><SearchInput value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="Search training programs..." /></div>
        <SelectFilter value={categoryFilter} onChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }} options={TRAINING_CATEGORIES} />
        <SelectFilter value={statusFilter} onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }} options={['Upcoming', 'Completed']} />
      </div>

      {loading ? <LoadingState /> : programs.length === 0 ? <EmptyState icon={<GraduationCap className="h-6 w-6" />} title="No training programs found" /> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paged.map((t: any) => {
              const isRegistered = user && t.participants?.includes(user.employeeId);
              return (
                <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{t.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{t.trainer} • {t.category}</p>
                    </div>
                    <Badge variant={t.status === 'Upcoming' ? 'info' : 'success'} dot>{t.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{t.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{t.startDate} - {t.endDate}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{t.location}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{t.registeredCount}/{t.capacity}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                    <div className="bg-indigo-600 rounded-full h-1.5" style={{ width: `${(t.registeredCount / t.capacity) * 100}%` }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowDetail(t)} className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">View Details</button>
                    {t.status === 'Upcoming' && !isRegistered && t.availableSeats > 0 && (
                      <button onClick={() => handleRegister(t.id)} className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 flex items-center gap-1"><UserPlus className="h-3 w-3" />Register</button>
                    )}
                    {isRegistered && (
                      <button onClick={() => handleUnregister(t.id)} className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 flex items-center gap-1"><UserMinus className="h-3 w-3" />Unregister</button>
                    )}
                    {canManage && <button onClick={() => setDeleteId(t.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg ml-auto"><Trash2 className="h-4 w-4" /></button>}
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}

      {/* Training Detail Modal */}
      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title={showDetail?.title || 'Training Details'} size="lg">
        {showDetail && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{showDetail.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Trainer:</span> <span className="font-medium">{showDetail.trainer}</span></div>
              <div><span className="text-gray-500">Category:</span> <span className="font-medium">{showDetail.category}</span></div>
              <div><span className="text-gray-500">Dates:</span> <span className="font-medium">{showDetail.startDate} - {showDetail.endDate}</span></div>
              <div><span className="text-gray-500">Location:</span> <span className="font-medium">{showDetail.location}</span></div>
              <div><span className="text-gray-500">Capacity:</span> <span className="font-medium">{showDetail.registeredCount}/{showDetail.capacity}</span></div>
              <div><span className="text-gray-500">Available:</span> <span className="font-medium">{showDetail.availableSeats} seats</span></div>
            </div>
            {showDetail.participantNames && showDetail.participantNames.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Participants</h4>
                <div className="flex flex-wrap gap-2">
                  {showDetail.participantNames.map((name: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-700">{name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Training Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create Training Program" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={errors.title} />
          <FormTextarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Trainer" required value={form.trainer} onChange={(e) => setForm({ ...form, trainer: e.target.value })} error={errors.trainer} />
            <FormSelect label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={TRAINING_CATEGORIES.map(c => ({ value: c, label: c }))} />
            <FormInput label="Start Date" type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} error={errors.startDate} />
            <FormInput label="End Date" type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} error={errors.endDate} />
            <FormInput label="Location" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} error={errors.location} />
            <FormInput label="Capacity" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}Create
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Training" message="Are you sure you want to delete this training program?" confirmLabel="Delete" variant="danger" isLoading={deleting} />
    </div>
  );
}
