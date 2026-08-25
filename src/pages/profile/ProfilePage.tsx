import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { PageHeader, FormInput, LoadingState } from '@/components/ui';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Save, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const { addToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    department: profile?.department || '',
    position: profile?.position || '',
  });

  if (!profile) return <LoadingState />;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Simulate save - in production this would call the API
    await new Promise(r => setTimeout(r, 500));
    setSaving(false);
    setEditing(false);
    addToast('success', 'Profile updated successfully');
    refreshProfile();
  };

  return (
    <div>
      <PageHeader title="My Profile" description="View and update your personal information"
        action={!editing ? <button onClick={() => setEditing(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">Edit Profile</button> : undefined} />

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-24 h-24 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0">
            {profile.firstName[0]}{profile.lastName[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h2>
            <p className="text-sm text-gray-500 mt-1">{profile.position} • {profile.department}</p>
            <p className="text-sm text-gray-500">Role: {profile.role}</p>
            <p className="text-sm text-gray-500">Status: <span className={profile.status === 'Active' ? 'text-green-600' : 'text-amber-600'}>{profile.status}</span></p>
          </div>
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <FormInput label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            <FormInput label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <FormInput label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-gray-400" /><div><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium text-gray-900">{profile.email}</p></div></div>
            <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-gray-400" /><div><p className="text-xs text-gray-500">Phone</p><p className="text-sm font-medium text-gray-900">{profile.phone}</p></div></div>
            <div className="flex items-center gap-3"><Briefcase className="h-5 w-5 text-gray-400" /><div><p className="text-xs text-gray-500">Department</p><p className="text-sm font-medium text-gray-900">{profile.department}</p></div></div>
            <div className="flex items-center gap-3"><User className="h-5 w-5 text-gray-400" /><div><p className="text-xs text-gray-500">Position</p><p className="text-sm font-medium text-gray-900">{profile.position}</p></div></div>
          </div>
        </div>
      )}
    </div>
  );
}
