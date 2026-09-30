import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    companyName: '', companyEmail: '', companyPhone: '', companyAddress: '', industry: '',
    ownerFirstName: '', ownerLastName: '', ownerEmail: '', ownerPhone: '',
    password: '', confirmPassword: '',
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const required = [
      form.companyName, form.companyEmail, form.ownerFirstName,
      form.ownerLastName, form.ownerEmail, form.password, form.confirmPassword,
    ];
    if (required.some(v => !v.trim())) {
      setError('Please complete all required fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(form);

      addToast(
        'success',
        'Account created',
        'Your company owner account is ready.'
      );

      navigate('/owner', {
        replace: true,
      });
    } catch (err: any) {
      setError(err?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const input = (key: keyof typeof form, label: string, type = 'text', required = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={e => update(key, e.target.value)}
        disabled={loading}
        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-5">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">Create your company account</h2>
        <p className="text-sm text-gray-500 mt-1">Register your company and become its owner.</p>
      </div>

      {error && <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      <form onSubmit={submit} className="space-y-6">
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Company information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {input('companyName', 'Company name', 'text', true)}
            {input('companyEmail', 'Company email', 'email', true)}
            {input('companyPhone', 'Company phone')}
            {input('industry', 'Industry')}
            <div className="sm:col-span-2">{input('companyAddress', 'Company address')}</div>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Owner information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {input('ownerFirstName', 'First name', 'text', true)}
            {input('ownerLastName', 'Last name', 'text', true)}
            {input('ownerEmail', 'Email address', 'email', true)}
            {input('ownerPhone', 'Phone')}
            <div className="relative">


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password<span className="text-red-500"> *</span>
                </label>

                <div className="relative">

                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) =>
                      update('password', e.target.value)
                    }
                    disabled={loading}
                    className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>

                </div>
              </div>


              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 bottom-2.5 text-gray-400">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {input('confirmPassword', 'Confirm password', 'password', true)}
          </div>
          <p className="text-xs text-gray-400 mt-2">Password must contain at least 8 characters.</p>
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          {loading ? 'Creating account...' : 'Create company account'}
        </button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-6">
        Already have an account? <Link to="/login" className="text-indigo-600 font-medium">Sign in</Link>
      </p>
    </div>
  );
}
