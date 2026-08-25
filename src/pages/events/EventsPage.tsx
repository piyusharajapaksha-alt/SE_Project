import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { eventService } from '@/services/dataServices';
import { PageHeader, SearchInput, SelectFilter, Badge, Pagination, LoadingState, EmptyState, Modal, ConfirmDialog, FormInput, FormSelect, FormTextarea } from '@/components/ui';
import { EVENT_CATEGORIES } from '@/config';
import { Calendar, Plus, Users, MapPin, Clock, UserPlus, UserMinus, Trash2, Eye, Loader2 } from 'lucide-react';

export default function EventsPage() {
  const { user, checkPermission } = useAuth();
  const { addToast } = useToast();
  const canManage = checkPermission('events.manage');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const perPage = 8;

  const [form, setForm] = useState({ title: '', description: '', organizer: '', category: 'Team Building', date: '', time: '', endTime: '', location: '', capacity: '50' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { loadData(); }, [search, categoryFilter, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await eventService.getAll({ search, category: categoryFilter, status: statusFilter });
      setEvents(data);
    } catch { } finally { setLoading(false); }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title) errs.title = 'Required';
    if (!form.date) errs.date = 'Required';
    if (!form.time) errs.time = 'Required';
    if (!form.location) errs.location = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;
    setSaving(true);
    try {
      await eventService.create({ ...form, capacity: Number(form.capacity), organizerId: user.employeeId });
      addToast('success', 'Event created successfully');
      setShowForm(false);
      setForm({ title: '', description: '', organizer: '', category: 'Team Building', date: '', time: '', endTime: '', location: '', capacity: '50' });
      loadData();
    } catch { addToast('error', 'Failed to create event'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await eventService.delete(deleteId);
      addToast('success', 'Event deleted');
      setDeleteId(null);
      loadData();
    } catch { addToast('error', 'Failed to delete'); }
    finally { setDeleting(false); }
  };

  const handleRegister = async (id: string) => {
    if (!user) return;
    try {
      await eventService.register(id, user.employeeId);
      addToast('success', 'Registered for event successfully');
      loadData();
    } catch (err: any) { addToast('error', err.message || 'Failed to register'); }
  };

  const handleUnregister = async (id: string) => {
    if (!user) return;
    try {
      await eventService.unregister(id, user.employeeId);
      addToast('success', 'Registration cancelled');
      loadData();
    } catch { addToast('error', 'Failed to cancel registration'); }
  };

  const paged = events.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(events.length / perPage);

  return (
    <div>
      <PageHeader title="Events" description="Discover and manage organizational events"
        action={canManage ? <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2"><Plus className="h-4 w-4" />Create Event</button> : undefined} />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1"><SearchInput value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="Search events..." /></div>
        <SelectFilter value={categoryFilter} onChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }} options={EVENT_CATEGORIES} />
        <SelectFilter value={statusFilter} onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }} options={['Upcoming', 'Completed', 'Cancelled']} />
      </div>

      {loading ? <LoadingState /> : events.length === 0 ? <EmptyState icon={<Calendar className="h-6 w-6" />} title="No events found" /> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paged.map((evt: any) => {
              const isRegistered = user && evt.registeredIds?.includes(user.employeeId);
              return (
                <div key={evt.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{evt.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{evt.organizer} • {evt.category}</p>
                    </div>
                    <Badge variant={evt.status === 'Upcoming' ? 'info' : evt.status === 'Completed' ? 'success' : 'neutral'} dot>{evt.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{evt.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{evt.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{evt.time} - {evt.endTime}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{evt.location}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{evt.registeredCount}/{evt.capacity}</span>
                  </div>
                  {/* Capacity bar */}
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                    <div className="bg-indigo-600 rounded-full h-1.5" style={{ width: `${(evt.registeredCount / evt.capacity) * 100}%` }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { eventService.getById(evt.id).then(setShowDetail); }} className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 flex items-center gap-1"><Eye className="h-3 w-3" />View</button>
                    {evt.status === 'Upcoming' && !isRegistered && evt.availableSeats > 0 && (
                      <button onClick={() => handleRegister(evt.id)} className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 flex items-center gap-1"><UserPlus className="h-3 w-3" />Register</button>
                    )}
                    {isRegistered && (
                      <button onClick={() => handleUnregister(evt.id)} className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 flex items-center gap-1"><UserMinus className="h-3 w-3" />Cancel</button>
                    )}
                    {evt.availableSeats <= 0 && !isRegistered && <span className="text-xs text-red-600 font-medium">Full</span>}
                    {canManage && <button onClick={() => setDeleteId(evt.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg ml-auto"><Trash2 className="h-4 w-4" /></button>}
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}

      {/* Event Detail Modal */}
      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title={showDetail?.title || 'Event Details'} size="lg">
        {showDetail && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{showDetail.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Organizer:</span> <span className="font-medium">{showDetail.organizer}</span></div>
              <div><span className="text-gray-500">Category:</span> <span className="font-medium">{showDetail.category}</span></div>
              <div><span className="text-gray-500">Date:</span> <span className="font-medium">{showDetail.date}</span></div>
              <div><span className="text-gray-500">Time:</span> <span className="font-medium">{showDetail.time} - {showDetail.endTime}</span></div>
              <div><span className="text-gray-500">Location:</span> <span className="font-medium">{showDetail.location}</span></div>
              <div><span className="text-gray-500">Capacity:</span> <span className="font-medium">{showDetail.registeredCount}/{showDetail.capacity} ({showDetail.availableSeats} available)</span></div>
            </div>
            {showDetail.registrantNames && showDetail.registrantNames.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Registered Attendees ({showDetail.registrantNames.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {showDetail.registrantNames.map((r: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 py-1.5 border-b border-gray-100">
                      <div className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold">
                        {r.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{r.name}</p>
                        <p className="text-xs text-gray-500">{r.department}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Event Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create Event" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={errors.title} />
          <FormTextarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Organizer" value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} />
            <FormSelect label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={EVENT_CATEGORIES.map(c => ({ value: c, label: c }))} />
            <FormInput label="Date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} error={errors.date} />
            <FormInput label="Start Time" type="time" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} error={errors.time} />
            <FormInput label="End Time" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            <FormInput label="Location" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} error={errors.location} />
            <FormInput label="Capacity" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}Create Event
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Event" message="Are you sure you want to delete this event? All registrations will be lost." confirmLabel="Delete" variant="danger" isLoading={deleting} />
    </div>
  );
}
