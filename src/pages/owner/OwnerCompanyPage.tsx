import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { apiRequest } from '@/services/apiClient';

type Company = {
  companyCode: string; companyName: string; email: string; phone?: string;
  address?: string; industry?: string; status: string;
};

export default function OwnerCompanyPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<Company>('/api/owner/company').then(setCompany).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-12 text-center text-sm text-gray-500">Loading company...</div>;
  if (!company) return <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Company information could not be loaded.</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center"><Building2 className="w-5 h-5" /></div>
        <div><h1 className="text-2xl font-bold text-gray-900">Company</h1><p className="text-sm text-gray-500">Your registered company information</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 grid sm:grid-cols-2 gap-5">
        {[
          ['Company name', company.companyName],
          ['Company code', company.companyCode],
          ['Company email', company.email],
          ['Phone', company.phone || 'Not provided'],
          ['Industry', company.industry || 'Not provided'],
          ['Status', company.status],
          ['Address', company.address || 'Not provided'],
        ].map(([label, value]) => (
          <div key={label} className={label === 'Address' ? 'sm:col-span-2' : ''}>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-sm font-medium text-gray-900">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
