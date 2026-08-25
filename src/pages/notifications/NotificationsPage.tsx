import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { notificationService } from '@/services/dataServices';
import { PageHeader, SelectFilter, Badge, LoadingState, EmptyState, formatRelativeTime } from '@/components/ui';
import { Bell, BellOff, CheckCheck, Calendar, MessageSquareWarning, TrendingUp, GraduationCap, AlertTriangle } from 'lucide-react';

const typeIcons: Record<string, any> = { leave: Calendar, grievance: MessageSquareWarning, performance: TrendingUp, training: GraduationCap, event: Calendar, attendance: AlertTriangle, system: Bell };

export default function NotificationsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [readFilter, setReadFilter] = useState<'' | 'unread' | 'read'>('');

  useEffect(() => { loadData(); }, [typeFilter, readFilter, user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const filters: any = {};
      if (typeFilter !== 'All') filters.type = typeFilter;
      if (readFilter === 'unread') filters.read = false;
      if (readFilter === 'read') filters.read = true;
      const data = await notificationService.getAll(user.employeeId, filters);
      setNotifications(data);
    } catch { } finally { setLoading(false); }
  };

  const handleMarkRead = async (id: string) => {
    await notificationService.markAsRead(id);
    loadData();
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user.employeeId);
    addToast('success', 'All notifications marked as read');
    loadData();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div>
      <PageHeader title="Notifications" description={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        action={unreadCount > 0 ? <button onClick={handleMarkAllRead} className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 flex items-center gap-2"><CheckCheck className="h-4 w-4" />Mark all as read</button> : undefined} />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SelectFilter value={typeFilter} onChange={setTypeFilter} options={['leave', 'grievance', 'performance', 'training', 'event', 'attendance', 'system']} placeholder="All Types" />
        <select value={readFilter} onChange={(e) => setReadFilter(e.target.value as any)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
          <option value="">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      {loading ? <LoadingState /> : notifications.length === 0 ? <EmptyState icon={<BellOff className="h-6 w-6" />} title="No notifications" description="You're all caught up!" /> : (
        <div className="space-y-2">
          {notifications.map((n: any) => {
            const Icon = typeIcons[n.type] || Bell;
            return (
              <div key={n.id} onClick={() => !n.read && handleMarkRead(n.id)} className={`flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-all cursor-pointer ${!n.read ? 'border-l-4 border-l-indigo-500' : ''}`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${!n.read ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!n.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{n.title}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0">{formatRelativeTime(n.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                </div>
                {!n.read && <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
