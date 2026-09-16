import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';
import { Student } from '../types.ts';
import { api } from '../lib/api.ts';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (student: Student) => void;
  studentToEdit?: Student | null;
}

const DEPARTMENTS = [
  'Computer Technology',
  'Information Technology',
  'Electronics & Telecommunication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  studentToEdit,
}) => {
  if (!isOpen) return null;

  const isEdit = Boolean(studentToEdit);

  const [studentId, setStudentId] = useState(studentToEdit?.student_id || '');
  const [rollNumber, setRollNumber] = useState(studentToEdit?.roll_number || '');
  const [enrollmentNumber, setEnrollmentNumber] = useState(studentToEdit?.enrollment_number || '');
  const [name, setName] = useState(studentToEdit?.name || '');
  const [email, setEmail] = useState(studentToEdit?.email || '');
  const [phone, setPhone] = useState(studentToEdit?.phone || '');
  const [department, setDepartment] = useState(studentToEdit?.department || DEPARTMENTS[0]);
  const [branch, setBranch] = useState(studentToEdit?.branch || DEPARTMENTS[0]);
  const [batch, setBatch] = useState(studentToEdit?.batch || '2027');
  const [cgpa, setCgpa] = useState(studentToEdit?.cgpa ? String(studentToEdit.cgpa) : '8.0');
  const [tenth, setTenth] = useState(studentToEdit?.tenth_percentage ? String(studentToEdit.tenth_percentage) : '80.0');
  const [twelfth, setTwelfth] = useState(studentToEdit?.twelfth_percentage ? String(studentToEdit.twelfth_percentage) : '80.0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentToEdit) {
      setStudentId(studentToEdit.student_id);
      setRollNumber(studentToEdit.roll_number);
      setEnrollmentNumber(studentToEdit.enrollment_number);
      setName(studentToEdit.name);
      setEmail(studentToEdit.email);
      setPhone(studentToEdit.phone);
      setDepartment(studentToEdit.department);
      setBranch(studentToEdit.branch);
      setBatch(studentToEdit.batch);
      setCgpa(String(studentToEdit.cgpa));
      setTenth(studentToEdit.tenth_percentage ? String(studentToEdit.tenth_percentage) : '80.0');
      setTwelfth(studentToEdit.twelfth_percentage ? String(studentToEdit.twelfth_percentage) : '80.0');
    } else {
      setStudentId('');
      setRollNumber('');
      setEnrollmentNumber('');
      setName('');
      setEmail('');
      setPhone('');
      setDepartment(DEPARTMENTS[0]);
      setBranch(DEPARTMENTS[0]);
      setBatch('2027');
      setCgpa('8.0');
      setTenth('80.0');
      setTwelfth('80.0');
    }
    setError(null);
  }, [studentToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedCgpa = parseFloat(cgpa);
    if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
      setError('CGPA must be a valid number between 0.00 and 10.00');
      return;
    }

    setLoading(true);

    try {
      const payload: Partial<Student> = {
        student_id: studentId.trim(),
        roll_number: rollNumber.trim(),
        enrollment_number: enrollmentNumber.trim() || `EN_${rollNumber.trim()}`,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        department,
        branch,
        batch,
        cgpa: parsedCgpa,
        tenth_percentage: parseFloat(tenth) || 80.0,
        twelfth_percentage: parseFloat(twelfth) || 80.0,
      };

      if (isEdit && studentToEdit) {
        const res = await api.updateStudent(studentToEdit.id, payload);
        onSuccess(res.student);
      } else {
        const res = await api.createStudent({
          ...payload,
          placement_status: 'Not Placed',
        });
        onSuccess(res.student);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save student record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="student-form-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        id="student-form-modal"
        className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isEdit ? 'Edit Student Record' : 'Register New Student'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEdit ? 'Modify student profile information' : 'Add student to the placement database'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close form"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student ID <span className="text-rose-500">*</span>
              </label>
              <input
                id="form-student-id"
                type="text"
                required
                disabled={isEdit}
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. STU1234"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 disabled:bg-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Roll Number <span className="text-rose-500">*</span>
              </label>
              <input
                id="form-roll-number"
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. 2023CS101"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Enrollment No</label>
              <input
                id="form-enrollment-number"
                type="text"
                value={enrollmentNumber}
                onChange={(e) => setEnrollmentNumber(e.target.value)}
                placeholder="e.g. EN2023CS201"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="form-student-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Patil"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                id="form-student-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@college.edu"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                id="form-student-phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <select
                id="form-department"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setBranch(e.target.value);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Branch / Stream</label>
              <input
                id="form-branch"
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Passing Batch</label>
              <select
                id="form-batch"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="2027">2027</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2028">2028</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                CGPA (0 - 10) <span className="text-rose-500">*</span>
              </label>
              <input
                id="form-cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                placeholder="8.5"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">10th / SSC %</label>
              <input
                id="form-tenth"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={tenth}
                onChange={(e) => setTenth(e.target.value)}
                placeholder="85.0"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">12th / HSC %</label>
              <input
                id="form-twelfth"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={twelfth}
                onChange={(e) => setTwelfth(e.target.value)}
                placeholder="82.5"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              id="student-form-cancel"
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              id="student-form-submit"
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : isEdit ? 'Update Student' : 'Save Student'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
