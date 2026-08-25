import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { PageHeader, Tabs } from '@/components/ui';
import { User, Shield, Bell, Palette, Settings, Save, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  // Profile settings state
  const [profileSettings, setProfileSettings] = useState({ language: 'English', timezone: 'UTC-5 (EST)' });
  // Notification settings state
  const [notifSettings, setNotifSettings] = useState({ emailNotif: true, pushNotif: true, leaveNotif: true, eventNotif: true, grievanceNotif: true, trainingNotif: true });
  // Appearance settings
  const [appearance, setAppearance] = useState({ theme: 'light', sidebar: 'expanded', density: 'comfortable' });

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    // DEVELOPMENT ONLY: Save to localStorage for persistence
    // When backend is ready, save to API
    localStorage.setItem('staffhub_settings', JSON.stringify({ profileSettings, notifSettings, appearance }));
    setSaving(false);
    addToast('success', 'Settings saved successfully');
  };

  return (
    <div>
      <PageHeader title="Settings" description="Manage your application preferences"
        action={<button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}Save Changes
        </button>} />

      <Tabs tabs={[
        { key: 'profile', label: 'Profile' },
        { key: 'notifications', label: 'Notifications' },
        { key: 'appearance', label: 'Appearance' },
      ]} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Profile Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select value={profileSettings.language} onChange={(e) => setProfileSettings({ ...profileSettings, language: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>English</option><option>Spanish</option><option>French</option><option>German</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select value={profileSettings.timezone} onChange={(e) => setProfileSettings({ ...profileSettings, timezone: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>UTC-5 (EST)</option><option>UTC-6 (CST)</option><option>UTC-7 (MST)</option><option>UTC-8 (PST)</option><option>UTC+0 (GMT)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
          {[
            { key: 'emailNotif', label: 'Email Notifications', desc: 'Receive notifications via email' },
            { key: 'pushNotif', label: 'Push Notifications', desc: 'Receive browser push notifications' },
            { key: 'leaveNotif', label: 'Leave Updates', desc: 'Notifications about leave requests and approvals' },
            { key: 'eventNotif', label: 'Event Reminders', desc: 'Reminders about upcoming events' },
            { key: 'trainingNotif', label: 'Training Updates', desc: 'Notifications about training programs' },
            { key: 'grievanceNotif', label: 'Grievance Updates', desc: 'Notifications about grievance status changes' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifSettings({ ...notifSettings, [item.key]: !(notifSettings as any)[item.key] })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(notifSettings as any)[item.key] ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(notifSettings as any)[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Appearance</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <div className="flex gap-3">
              {['light', 'dark'].map((t) => (
                <button key={t} onClick={() => setAppearance({ ...appearance, theme: t })}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium capitalize ${appearance.theme === t ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sidebar</label>
            <div className="flex gap-3">
              {['expanded', 'collapsed'].map((s) => (
                <button key={s} onClick={() => setAppearance({ ...appearance, sidebar: s })}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium capitalize ${appearance.sidebar === s ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Density</label>
            <div className="flex gap-3">
              {['comfortable', 'compact'].map((d) => (
                <button key={d} onClick={() => setAppearance({ ...appearance, density: d })}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium capitalize ${appearance.density === d ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
