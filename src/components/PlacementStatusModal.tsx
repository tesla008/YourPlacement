import React, { useState, useEffect } from 'react';
import { X, Building, DollarSign, Calendar, MapPin, Briefcase, FileText, CheckCircle } from 'lucide-react';
import { Student, PlacementStatus, PlacementType } from '../types.ts';
import { api } from '../lib/api.ts';
import { StatusBadge } from './StatusBadge.tsx';

interface PlacementStatusModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedStudent: Student) => void;
}

const COMMON_COMPANIES = [
  'TCS',
  'Infosys',
  'Deloitte',
  'Accenture',
  'Amazon',
  'Microsoft',
  'Capgemini',
  'Wipro',
  'Tata Motors',
  'L&T',
  'Cognizant',
  'IBM',
  'Oracle',
  'Google',
];

export const PlacementStatusModal: React.FC<PlacementStatusModalProps> = ({
  student,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !student) return null;

  const [status, setStatus] = useState<PlacementStatus>(student.placement_status);
  const [company, setCompany] = useState<string>(student.company || '');
  const [jobRole, setJobRole] = useState<string>(student.job_role || '');
  const [pkg, setPkg] = useState<string>(student.package ? String(student.package) : '');
  const [placementDate, setPlacementDate] = useState<string>(
    student.placement_date || new Date().toISOString().split('T')[0]
  );
  const [placementType, setPlacementType] = useState<PlacementType>(
    student.placement_type || 'On Campus'
  );
  const [location, setLocation] = useState<string>(student.location || 'Bengaluru');
  const [remarks, setRemarks] = useState<string>(student.remarks || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [requiresConfirmation, setRequiresConfirmation] = useState<boolean>(false);

  useEffect(() => {
    setStatus(student.placement_status);
    setCompany(student.company || '');
    setJobRole(student.job_role || '');
    setPkg(student.package ? String(student.package) : '');
    setPlacementDate(student.placement_date || new Date().toISOString().split('T')[0]);
    setPlacementType(student.placement_type || 'On Campus');
    setLocation(student.location || 'Bengaluru');
    setRemarks(student.remarks || '');
    setError(null);
    setRequiresConfirmation(false);
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (status === 'Placed') {
      if (!company.trim()) {
        setError('Please specify the company name.');
        return;
      }
      const numPkg = parseFloat(pkg);
      if (isNaN(numPkg) || numPkg <= 0) {
        setError('Please enter a valid package in LPA (e.g. 7.5).');
        return;
      }
    }

    setLoading(true);

    try {
      const res = await api.updatePlacementStatus(student.id, {
        new_status: status,
        company: status === 'Placed' ? company.trim() : null,
        job_role: status === 'Placed' ? jobRole.trim() : null,
        package: status === 'Placed' ? parseFloat(pkg) : null,
        placement_date: status === 'Placed' ? placementDate : null,
        placement_type: status === 'Placed' ? placementType : null,
        location: status === 'Placed' ? location.trim() : null,
        remarks: remarks.trim() || null,
        confirmedRevertToUnplaced: requiresConfirmation,
      });

      onSuccess(res.student);
      onClose();
    } catch (err: any) {
      if (err.requiresConfirmation) {
        setRequiresConfirmation(true);
      } else {
        setError(err.message || 'Failed to update placement status');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="placement-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        id="placement-modal-content"
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 my-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 font-mono">
                {student.student_id}
              </span>
              <span className="text-xs text-slate-500 font-mono">Roll: {student.roll_number}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{student.name}</h3>
            <p className="text-xs text-slate-500 font-medium">{student.department} • Batch {student.batch} • CGPA: {student.cgpa}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status banner */}
        <div className="mt-4 p-3.5 bg-slate-50/80 rounded-2xl flex items-center justify-between border border-slate-200/80">
          <span className="text-xs font-semibold text-slate-600">Current Status:</span>
          <StatusBadge status={student.placement_status} size="sm" />
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Confirmation prompt if changing Placed -> Not Placed */}
        {requiresConfirmation && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-300/80 text-amber-900 text-xs space-y-1.5">
            <p className="font-bold flex items-center gap-1.5 text-amber-950">
              <span>⚠️ Confirmation Required: Reverting Placed Student</span>
            </p>
            <p className="leading-relaxed">
              This student is currently recorded as <strong className="font-bold text-emerald-800">Placed at {student.company}</strong>.
              Reverting to <strong className="font-bold text-rose-800">Not Placed</strong> will reset their recruiter offer and package details.
            </p>
            <p className="font-bold text-amber-900 pt-1">Click "Confirm & Save Changes" below to acknowledge and proceed.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* New Status Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Placement Status <span className="text-rose-500">*</span>
            </label>
            <select
              id="placement-status-select"
              value={status}
              onChange={(e) => {
                const newS = e.target.value as PlacementStatus;
                setStatus(newS);
                if (student.placement_status === 'Placed' && newS === 'Not Placed') {
                  setRequiresConfirmation(true);
                } else {
                  setRequiresConfirmation(false);
                }
              }}
              className="w-full rounded-xl border border-slate-300/90 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            >
              <option value="Not Placed">Not Placed</option>
              <option value="Placed">Placed</option>
              <option value="Higher Studies">Higher Studies</option>
              <option value="Not Interested">Not Interested</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Conditional Placed Fields */}
          {status === 'Placed' && (
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3.5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Company Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>Company Name <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    id="company-name-input"
                    type="text"
                    list="company-suggestions"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Deloitte, Infosys, TCS"
                    className="w-full rounded-xl border border-slate-300/90 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                  <datalist id="company-suggestions">
                    {COMMON_COMPANIES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                {/* Package (CTC in LPA) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span>Package (CTC in ₹ LPA) <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    id="package-lpa-input"
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="100"
                    required
                    value={pkg}
                    onChange={(e) => setPkg(e.target.value)}
                    placeholder="e.g. 8.50"
                    className="w-full rounded-xl border border-slate-300/90 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Job Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>Job Role / Designation</span>
                  </label>
                  <input
                    id="job-role-input"
                    type="text"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    placeholder="e.g. Systems Engineer, Associate"
                    className="w-full rounded-xl border border-slate-300/90 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>

                {/* Placement Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Placement Date</span>
                  </label>
                  <input
                    id="placement-date-input"
                    type="date"
                    value={placementDate}
                    onChange={(e) => setPlacementDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300/90 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Placement Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Drive Category</label>
                  <select
                    id="placement-type-select"
                    value={placementType}
                    onChange={(e) => setPlacementType(e.target.value as PlacementType)}
                    className="w-full rounded-xl border border-slate-300/90 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  >
                    <option value="On Campus">On Campus</option>
                    <option value="Off Campus">Off Campus</option>
                    <option value="Pool Campus">Pool Campus</option>
                    <option value="Referral">Referral</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Location</span>
                  </label>
                  <input
                    id="placement-location-input"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bengaluru, Pune, Hyderabad"
                    className="w-full rounded-xl border border-slate-300/90 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Remarks & Notes</span>
            </label>
            <textarea
              id="placement-remarks-input"
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Cleared technical rounds, offer letter received..."
              className="w-full rounded-xl border border-slate-300/90 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              id="placement-cancel-button"
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              id="placement-submit-button"
              type="submit"
              disabled={loading}
              className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition flex items-center gap-2 ${
                requiresConfirmation
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
              }`}
            >
              {loading ? (
                <span>Saving Record...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{requiresConfirmation ? 'Confirm & Revert Status' : 'Save Status Update'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
