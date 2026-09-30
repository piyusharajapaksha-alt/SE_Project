import { useEffect, useState } from 'react';
import { Building2, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';

type Company = {
  id: number; companyCode: string; companyName: string; email: string;
  phone?: string; address?: string; industry?: string; status: string;
};

export default function OwnerDashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<Company>('/api/owner/company')
      .then(setCompany)
      .finally(() => setLoading(false));
  }, []);

  const name = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim();

  if (loading) return <div className="py-12 text-center text-sm text-gray-500">Loading owner dashboard...</div>;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Owner Dashboard</h1>
      <p className="mb-6 text-sm text-gray-500">Welcome, {name || 'Owner'}. Manage your company from here.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <Building2 className="h-5 w-5 text-indigo-600 mb-3" />
          <p className="text-xs text-gray-500">Company</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{company?.companyName || '—'}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <Users className="h-5 w-5 text-indigo-600 mb-3" />
          <p className="text-xs text-gray-500">Employee management</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">Ready for setup</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <ShieldCheck className="h-5 w-5 text-indigo-600 mb-3" />
          <p className="text-xs text-gray-500">Account role</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">Company Owner</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Company setup</h2>
        <p className="text-sm text-gray-500 mb-5">
          Your company account has been created successfully. Multi-company employee management can be connected to this company later without changing this owner account.
        </p>
        <button onClick={() => navigate('/owner/company')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium flex items-center gap-2">
          View company information <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
