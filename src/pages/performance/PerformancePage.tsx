import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { performanceService } from '@/services/dataServices';
import { PageHeader, SearchInput, SelectFilter, Badge, LoadingState, EmptyState, StatCard } from '@/components/ui';
import { TrendingUp, Award, Target, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const CHART_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function PerformancePage() {
  const { user } = useAuth();
  const location = useLocation();
  const isManagementView = location.pathname.startsWith('/management/');
  const isEmployeeView = !isManagementView;
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedReview, setSelectedReview] = useState<any>(null);

  useEffect(() => { loadData(); }, [search, statusFilter, user, isManagementView]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (isEmployeeView && user) filters.employeeId = user.employeeId;
      else if (search) filters.search = search;
      if (statusFilter !== 'All') filters.status = statusFilter;
      const data = await performanceService.getAll(filters);
      setReviews(data);
    } catch { } finally { setLoading(false); }
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0';

  return (
    <div>
      <PageHeader title={isEmployeeView ? 'My Performance' : 'Performance Management'} description={isEmployeeView ? 'View your performance reviews' : 'Track and manage employee performance'} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Reviews" value={reviews.length} icon={<BarChart3 className="h-5 w-5" />} color="indigo" />
        <StatCard title="Average Rating" value={avgRating} icon={<Award className="h-5 w-5" />} color="green" />
        <StatCard title="Completed" value={reviews.filter((r: any) => r.status === 'Completed').length} icon={<Target className="h-5 w-5" />} color="blue" />
        <StatCard title="Pending" value={reviews.filter((r: any) => r.status === 'Pending Review').length} icon={<TrendingUp className="h-5 w-5" />} color="amber" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {!isEmployeeView && <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search employees..." /></div>}
        <SelectFilter value={statusFilter} onChange={setStatusFilter} options={['Completed', 'Pending Review']} />
      </div>

      {loading ? <LoadingState /> : reviews.length === 0 ? <EmptyState icon={<TrendingUp className="h-6 w-6" />} title="No performance reviews found" /> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {reviews.map((review: any) => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedReview(review)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{review.employeeName || 'Employee'}</p>
                  <p className="text-xs text-gray-500">{review.department} • {review.reviewDate}</p>
                </div>
                <Badge variant={review.status === 'Completed' ? 'success' : 'warning'} dot>{review.status}</Badge>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl font-bold text-gray-900">{review.rating}</span>
                <span className="text-sm text-gray-500">/5</span>
                <div className="flex gap-0.5 ml-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className={`w-4 h-4 rounded-sm ${star <= review.rating ? 'bg-amber-400' : 'bg-gray-200'}`} />
                  ))}
                </div>
              </div>
              {review.kpis && (
                <div className="space-y-2">
                  {review.kpis.slice(0, 3).map((kpi: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">{kpi.name}</span>
                        <span className="font-medium text-gray-900">{kpi.score}/{kpi.target}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="rounded-full h-1.5" style={{ width: `${(kpi.score / 5) * 100}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedReview(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedReview.employeeName || 'Employee'} - Performance Review</h3>
                <p className="text-sm text-gray-500">Review Date: {selectedReview.reviewDate} | Reviewer: {selectedReview.reviewerName}</p>
              </div>
              <button onClick={() => setSelectedReview(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl font-bold text-gray-900">{selectedReview.rating}</span>
              <span className="text-gray-500">/5</span>
            </div>
            {selectedReview.comments && <p className="text-sm text-gray-600 mb-4 italic">"{selectedReview.comments}"</p>}
            {selectedReview.kpis && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">KPI Performance</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={selectedReview.kpis} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#4f46e5" radius={[0, 4, 4, 0]} name="Score" />
                    <Bar dataKey="target" fill="#e0e7ff" radius={[0, 4, 4, 0]} name="Target" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
