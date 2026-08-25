import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { PageHeader, FormSelect, FormInput } from '@/components/ui';
import { DEPARTMENTS } from '@/config';
import { FileText, Download, Loader2 } from 'lucide-react';

const REPORT_TYPES = [
  { value: 'attendance', label: 'Attendance Report' },
  { value: 'leave', label: 'Leave Report' },
  { value: 'performance', label: 'Performance Report' },
  { value: 'training', label: 'Training Report' },
  { value: 'event', label: 'Event Report' },
  { value: 'grievance', label: 'Grievance Report' },
];

// This page generates mock reports. When the backend is ready,
// replace with actual API calls for report generation.
export default function ReportsPage() {
  const { addToast } = useToast();
  const [reportType, setReportType] = useState('attendance');
  const [department, setDepartment] = useState('');
  const [startDate, setStartDate] = useState('2024-12-01');
  const [endDate, setEndDate] = useState('2024-12-16');
  const [format, setFormat] = useState('csv');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    // Simulate report generation
    await new Promise(r => setTimeout(r, 1500));
    setGenerating(false);
    addToast('success', `${REPORT_TYPES.find(r => r.value === reportType)?.label} generated successfully. In production, this would download a file.`);
  };

  return (
    <div>
      <PageHeader title="Reports" description="Generate and export reports" />

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Report</h3>

        <div className="space-y-4">
          <FormSelect label="Report Type" value={reportType} onChange={(e) => setReportType(e.target.value)}
            options={REPORT_TYPES} />

          <FormSelect label="Department" value={department} onChange={(e) => setDepartment(e.target.value)}
            options={[{ value: '', label: 'All Departments' }, ...DEPARTMENTS.map(d => ({ value: d, label: d }))]} placeholder="All Departments" />

          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <FormInput label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <FormSelect label="Format" value={format} onChange={(e) => setFormat(e.target.value)}
            options={[{ value: 'csv', label: 'CSV' }, { value: 'pdf', label: 'PDF' }, { value: 'xlsx', label: 'Excel (XLSX)' }]} />

          <div className="pt-4 border-t border-gray-200">
            <button onClick={handleGenerate} disabled={generating}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {generating ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Available Reports Info */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Reports</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_TYPES.map((type) => (
            <div key={type.value} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <FileText className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">{type.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">Generate {type.label.toLowerCase()} for the selected period</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
