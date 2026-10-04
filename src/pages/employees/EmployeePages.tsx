import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { employeeService, attendanceService, leaveService, performanceService } from '@/services/dataServices';
import { PageHeader, SearchInput, SelectFilter, Badge, Pagination, LoadingState, EmptyState, Modal, ConfirmDialog, FormInput, FormSelect, FormTextarea } from '@/components/ui';
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '@/config';
import { Plus, Eye, Pencil, Trash2, Users, Mail, Phone, MapPin, Briefcase, CalendarDays, ChevronLeft, Loader2 } from 'lucide-react';

// --- Employee List Page ---
export function EmployeeFormPage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const { addToast } = useToast();

  const isEdit = !!id;

  const [loading, setLoading] =
    useState(isEdit);

  const [saving, setSaving] =
    useState(false);

  const [generatingNumber, setGeneratingNumber] =
    useState(!isEdit);

  const [form, setForm] = useState({
    employeeNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Engineering',
    position: '',
    role: 'Employee',
    employmentStatus: 'Active',
    hireDate: '',
    address: '',
    emergencyContact: '',
    salary: '',
    gender: 'Male',
  });

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  // ==========================================================
  // LOAD EMPLOYEE WHEN EDITING
  // OR GENERATE NUMBER WHEN CREATING
  // ==========================================================

  useEffect(() => {

    let cancelled = false;

    const loadForm = async () => {

      // ------------------------------------------------------
      // EDIT
      // ------------------------------------------------------

      if (id) {

        setLoading(true);

        try {

          const emp =
              await employeeService.getById(id);

          if (!cancelled && emp) {

            setForm({
              employeeNumber:
                emp.employeeNumber || '',

              firstName:
                emp.firstName || '',

              lastName:
                emp.lastName || '',

              email:
                emp.email || '',

              phone:
                emp.phone || '',

              department:
                emp.department || 'Engineering',

              position:
                emp.position || '',

              role:
                emp.role || 'Employee',

              employmentStatus:
                emp.employmentStatus || 'Active',

              hireDate:
                emp.hireDate || '',

              address:
                emp.address || '',

              emergencyContact:
                emp.emergencyContact || '',

              salary:
                emp.salary !== null &&
                emp.salary !== undefined
                  ? String(emp.salary)
                  : '',

              gender:
                emp.gender || 'Male',
            });
          }

        } catch (error) {

          console.error(
            'Failed to load employee:',
            error
          );

          if (!cancelled) {

            addToast(
              'error',
              'Failed to load employee',
              'Unable to load employee information.'
            );
          }

        } finally {

          if (!cancelled) {
            setLoading(false);
          }
        }

        return;
      }

      // ------------------------------------------------------
      // CREATE
      // ------------------------------------------------------

      setLoading(false);
      setGeneratingNumber(true);

      try {

        const result =
            await employeeService.getNextNumber();

        if (
          !cancelled &&
          result?.employeeNumber
        ) {

          setForm((current) => ({
            ...current,
            employeeNumber:
              result.employeeNumber,
          }));
        }

      } catch (error) {

        console.error(
          'Failed to generate employee number:',
          error
        );

        if (!cancelled) {

          addToast(
            'error',
            'Employee number unavailable',
            'Unable to generate the employee number.'
          );
        }

      } finally {

        if (!cancelled) {
          setGeneratingNumber(false);
        }
      }
    };

    loadForm();

    return () => {
      cancelled = true;
    };

  }, [id, addToast]);

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validate = () => {

    const errs: Record<string, string> = {};

    // Employee number is NOT validated here.
    // Backend generates it automatically.

    if (!form.firstName.trim()) {
      errs.firstName = 'Required';
    }

    if (!form.lastName.trim()) {
      errs.lastName = 'Required';
    }

    if (!form.email.trim()) {
      errs.email = 'Required';
    }

    if (!form.position.trim()) {
      errs.position = 'Required';
    }

    if (!form.hireDate) {
      errs.hireDate = 'Required';
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  // ==========================================================
  // CREATE / UPDATE
  // ==========================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);

    try {

      // ------------------------------------------------------
      // CREATE / UPDATE DATA
      // ------------------------------------------------------

      const employeeData: any = {

        firstName:
          form.firstName.trim(),

        lastName:
          form.lastName.trim(),

        email:
          form.email.trim(),

        phone:
          form.phone.trim(),

        department:
          form.department,

        position:
          form.position.trim(),

        role:
          form.role,

        employmentStatus:
          form.employmentStatus,

        hireDate:
          form.hireDate || null,

        address:
          form.address.trim(),

        emergencyContact:
          form.emergencyContact.trim(),

        salary:
          form.salary
            ? Number(form.salary)
            : null,

        gender:
          form.gender,
      };

      // ------------------------------------------------------
      // EDIT
      // ------------------------------------------------------

      if (isEdit) {

        /*
         * Keep the existing employee number during update.
         *
         * The backend also protects it.
         */

        employeeData.employeeNumber =
          form.employeeNumber;

        await employeeService.update(
          id!,
          employeeData
        );

        addToast(
          'success',
          'Employee updated',
          'Employee information has been updated successfully.'
        );

      }

      // ------------------------------------------------------
      // CREATE
      // ------------------------------------------------------

      else {

        /*
         * IMPORTANT:
         *
         * Do NOT send employeeNumber.
         *
         * The backend generates the authoritative
         * employee number.
         */

        const createdEmployee =
            await employeeService.create(
              employeeData
            );

        const generatedNumber =
          createdEmployee?.employeeNumber;

        addToast(
          'success',
          'Employee created',
          generatedNumber
            ? `Employee ${generatedNumber} has been created successfully.`
            : 'Employee has been created successfully.'
        );
      }

      navigate(
        '/management/employees'
      );

    } catch (error) {

      console.error(
        'Employee save error:',
        error
      );

      addToast(
        'error',
        isEdit
          ? 'Update failed'
          : 'Creation failed',
        isEdit
          ? 'Unable to update the employee.'
          : 'Unable to create the employee.'
      );

    } finally {

      setSaving(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return <LoadingState />;
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div>

      {/* BACK */}

      <button
        onClick={() =>
          navigate(
            '/management/employees'
          )
        }
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >

        <ChevronLeft className="h-4 w-4" />

        Back to Employees

      </button>

      {/* TITLE */}

      <h1 className="text-2xl font-bold text-gray-900 mb-6">

        {isEdit
          ? 'Edit Employee'
          : 'Add New Employee'}

      </h1>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-6"
      >

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* ==================================================
              EMPLOYEE NUMBER
              ================================================== */}

          <div>

            <FormInput
              label="Employee Number"
              value={
                generatingNumber
                  ? 'Generating...'
                  : form.employeeNumber
              }
              readOnly
              error={errors.employeeNumber}
              placeholder="EMP001"
            />

            <p className="mt-1.5 text-xs text-gray-500">

              {isEdit
                ? 'Employee number is automatically assigned and cannot be changed.'
                : 'StaffHub automatically generates the next employee number.'}

            </p>

          </div>

          {/* FIRST NAME */}

          <FormInput
            label="First Name"
            required
            value={form.firstName}
            onChange={(e) =>
              setForm({
                ...form,
                firstName:
                  e.target.value,
              })
            }
            error={errors.firstName}
          />

          {/* LAST NAME */}

          <FormInput
            label="Last Name"
            required
            value={form.lastName}
            onChange={(e) =>
              setForm({
                ...form,
                lastName:
                  e.target.value,
              })
            }
            error={errors.lastName}
          />

          {/* EMAIL */}

          <FormInput
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email:
                  e.target.value,
              })
            }
            error={errors.email}
          />

          {/* PHONE */}

          <FormInput
            label="Phone"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone:
                  e.target.value,
              })
            }
          />

          {/* DEPARTMENT */}

          <FormSelect
            label="Department"
            value={form.department}
            onChange={(e) =>
              setForm({
                ...form,
                department:
                  e.target.value,
              })
            }
            options={DEPARTMENTS.map(
              (d) => ({
                value: d,
                label: d,
              })
            )}
          />

          {/* POSITION */}

          <FormInput
            label="Position"
            required
            value={form.position}
            onChange={(e) =>
              setForm({
                ...form,
                position:
                  e.target.value,
              })
            }
            error={errors.position}
          />

          {/* ROLE */}

          <FormSelect
            label="Role"
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role:
                  e.target.value,
              })
            }
            options={[
              'Employee',
              'HR Manager',
              'Department Manager',
              'Training Coordinator',
              'Grievance Officer',
              'Event Organizer',
            ].map(
              (r) => ({
                value: r,
                label: r,
              })
            )}
          />

          {/* STATUS */}

          <FormSelect
            label="Status"
            value={
              form.employmentStatus
            }
            onChange={(e) =>
              setForm({
                ...form,
                employmentStatus:
                  e.target.value,
              })
            }
            options={
              EMPLOYEE_STATUSES.map(
                (s) => ({
                  value: s,
                  label: s,
                })
              )
            }
          />

          {/* GENDER */}

          <FormSelect
            label="Gender"
            value={form.gender}
            onChange={(e) =>
              setForm({
                ...form,
                gender:
                  e.target.value,
              })
            }
            options={[
              {
                value: 'Male',
                label: 'Male',
              },
              {
                value: 'Female',
                label: 'Female',
              },
              {
                value: 'Other',
                label: 'Other',
              },
            ]}
          />

          {/* HIRE DATE */}

          <FormInput
            label="Hire Date"
            type="date"
            required
            value={form.hireDate}
            onChange={(e) =>
              setForm({
                ...form,
                hireDate:
                  e.target.value,
              })
            }
            error={errors.hireDate}
          />

          {/* SALARY */}

          <FormInput
            label="Salary"
            type="number"
            value={form.salary}
            onChange={(e) =>
              setForm({
                ...form,
                salary:
                  e.target.value,
              })
            }
          />

        </div>

        {/* ADDRESS */}

        <FormTextarea
          label="Address"
          value={form.address}
          onChange={(e) =>
            setForm({
              ...form,
              address:
                e.target.value,
            })
          }
          rows={2}
        />

        {/* EMERGENCY CONTACT */}

        <FormInput
          label="Emergency Contact"
          value={
            form.emergencyContact
          }
          onChange={(e) =>
            setForm({
              ...form,
              emergencyContact:
                e.target.value,
            })
          }
        />

        {/* BUTTONS */}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">

          <button
            type="button"
            onClick={() =>
              navigate(
                '/management/employees'
              )
            }
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              (!isEdit &&
                generatingNumber)
            }
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >

            {saving && (
              <Loader2
                className="h-4 w-4 animate-spin"
              />
            )}

            {isEdit
              ? 'Update Employee'
              : 'Create Employee'}

          </button>

        </div>

      </form>
    </div>
  );
}


/*
// --- Employee Form Page (Create/Edit) ---
export function EmployeeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', department: 'Engineering', position: '', role: 'Employee', status: 'Active', hireDate: '', address: '', emergencyContact: '', salary: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      employeeService.getById(id).then((emp) => {
        if (emp) setForm({ firstName: emp.firstName, lastName: emp.lastName, email: emp.email, phone: emp.phone, department: emp.department, position: emp.position, role: emp.role, status: emp.status, hireDate: emp.hireDate, address: emp.address || '', emergencyContact: emp.emergencyContact || '', salary: String(emp.salary || '') });
        setLoading(false);
      });
    }
  }, [id]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName) errs.firstName = 'Required';
    if (!form.lastName) errs.lastName = 'Required';
    if (!form.email) errs.email = 'Required';
    if (!form.position) errs.position = 'Required';
    if (!form.hireDate) errs.hireDate = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit) {
        await employeeService.update(id!, form);
        addToast('success', 'Employee updated successfully');
      } else {
        await employeeService.create(form);
        addToast('success', 'Employee created successfully');
      }
      navigate('/employees');
    } catch { addToast('error', `Failed to ${isEdit ? 'update' : 'create'} employee`); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      <button onClick={() => navigate('/management/employees')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ChevronLeft className="h-4 w-4" /> Back to Employees
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Employee' : 'Add New Employee'}</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput label="First Name" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} error={errors.firstName} />
          <FormInput label="Last Name" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} error={errors.lastName} />
          <FormInput label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
          <FormInput label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <FormSelect label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} options={DEPARTMENTS.map(d => ({ value: d, label: d }))} />
          <FormInput label="Position" required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} error={errors.position} />
          <FormSelect label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} options={['Employee', 'HR Manager', 'Department Manager', 'Training Coordinator', 'Grievance Officer', 'Event Organizer'].map(r => ({ value: r, label: r }))} />
          <FormSelect label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={EMPLOYEE_STATUSES.map(s => ({ value: s, label: s }))} />
          <FormInput label="Hire Date" type="date" required value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} error={errors.hireDate} />
          <FormInput label="Salary" type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
        </div>
        <FormTextarea label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} />
        <FormInput label="Emergency Contact" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button type="button" onClick={() => navigate('/management/employees')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Update Employee' : 'Create Employee'}
          </button>
        </div>
      </form>
    </div>
  );
}
*/