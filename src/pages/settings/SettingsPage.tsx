import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { apiRequest } from '@/services/apiClient';
import { PageHeader, Tabs } from '@/components/ui';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [profileSettings, setProfileSettings] = useState({ language: 'English', timezone: 'UTC+5:30 (Sri Lanka)' });
  const [notifSettings, setNotifSettings] = useState({ emailNotif: true, pushNotif: true, leaveNotif: true, eventNotif: true, grievanceNotif: true, trainingNotif: true });
  const [appearance, setAppearance] = useState({ theme: 'light', sidebar: 'expanded', density: 'comfortable' });

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await apiRequest(`/api/settings/${user.employeeId}`, {
        method: 'PUT',
        body: { profileSettings, notifSettings, appearance },
      });
      addToast('success', 'Settings saved successfully');
    } catch (error: any) {
      addToast('error', error?.message || 'Settings API is not available yet');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Settings" description="Manage your application preferences" action={<button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save Changes</button>} />
      <Tabs tabs={[{ key: 'profile', label: 'Profile' }, { key: 'notifications', label: 'Notifications' }, { key: 'appearance', label: 'Appearance' }]} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'profile' && <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"><h3 className="text-lg font-semibold text-gray-900">Profile Preferences</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Language</label><select value={profileSettings.language} onChange={(e) => setProfileSettings({ ...profileSettings, language: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"><option>English</option></select></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label><select value={profileSettings.timezone} onChange={(e) => setProfileSettings({ ...profileSettings, timezone: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"><option>UTC+5:30 (Sri Lanka)</option></select></div></div></div>}

      {activeTab === 'notifications' && <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6"><h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>{Object.entries(notifSettings).map(([key, value]) => <div key={key} className="flex items-center justify-between py-2"><div><p className="text-sm font-medium text-gray-900 capitalize">{key.replace('Notif', ' Notifications')}</p></div><button onClick={() => setNotifSettings({ ...notifSettings, [key]: !value })} className={`relative inline-flex h-6 w-11 items-center rounded-full ${value ? 'bg-indigo-600' : 'bg-gray-200'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white ${value ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>)}</div>}

      {activeTab === 'appearance' && <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6"><h3 className="text-lg font-semibold text-gray-900">Appearance</h3><div><label className="block text-sm font-medium text-gray-700 mb-2">Theme</label><div className="flex gap-3">{['light', 'dark'].map((theme) => <button key={theme} onClick={() => setAppearance({ ...appearance, theme })} className={`px-4 py-3 rounded-lg border-2 text-sm font-medium capitalize ${appearance.theme === theme ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'}`}>{theme}</button>)}</div></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Sidebar</label><div className="flex gap-3">{['expanded', 'collapsed'].map((sidebar) => <button key={sidebar} onClick={() => setAppearance({ ...appearance, sidebar })} className={`px-4 py-3 rounded-lg border-2 text-sm font-medium capitalize ${appearance.sidebar === sidebar ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'}`}>{sidebar}</button>)}</div></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Density</label><div className="flex gap-3">{['comfortable', 'compact'].map((density) => <button key={density} onClick={() => setAppearance({ ...appearance, density })} className={`px-4 py-3 rounded-lg border-2 text-sm font-medium capitalize ${appearance.density === density ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'}`}>{density}</button>)}</div></div></div>}
    </div>
  );
}
