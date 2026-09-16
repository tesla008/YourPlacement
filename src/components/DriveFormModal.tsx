import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import { PlacementDrive, EligibilityCriteria } from '../types.ts';
import { api } from '../lib/api.ts';

interface DriveFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  driveToEdit?: PlacementDrive | null;
  onSuccess: (drive: PlacementDrive) => void;
}

const ALL_BRANCHES = [
  'Computer Engineering',
  'Information Technology',
  'Electronics & Telecommunication',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
];

const ALL_BATCHES = ['2027', '2026', '2025'];

export const DriveFormModal: React.FC<DriveFormModalProps> = ({
  isOpen,
  onClose,
  driveToEdit,
  onSuccess,
}) => {
  const isEditing = Boolean(driveToEdit);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('Technology / Software');
  const [jobRole, setJobRole] = useState('Associate Software Engineer');
  const [pkg, setPkg] = useState<number>(8.5);
  const [packageDisplay, setPackageDisplay] = useState('₹8.5 LPA (Fixed + Variables)');
  const [location, setLocation] = useState('Pune / Bangalore / Hyderabad');
  const [driveDate, setDriveDate] = useState('2027-04-10');
  const [driveTime, setDriveTime] = useState('09:30 AM');
  const [applicationDeadline, setApplicationDeadline] = useState('2027-04-05');
  const [venue, setVenue] = useState('Auditorium Hall B, Tech Campus');
  const [driveType, setDriveType] = useState('On-Campus');
  const [openings, setOpenings] = useState<number>(25);
  const [status, setStatus] = useState('Upcoming');
  const [description, setDescription] = useState(
    'Recruitment for Graduate Engineers. The hiring process consists of:\n1. Online Aptitude & Technical Assessment (90 mins)\n2. Technical Interview - DSA & System Design basics\n3. Techno-Managerial Round\n4. HR Interview & Offer roll-out.'
  );

  // Eligibility Criteria State
  const [minCgpa, setMinCgpa] = useState<number>(7.0);
  const [min10th, setMin10th] = useState<number>(65.0);
  const [min12th, setMin12th] = useState<number>(65.0);
  const [maxBacklogs, setMaxBacklogs] = useState<number>(0);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([
    'Computer Engineering',
    'Information Technology',
  ]);
  const [selectedBatches, setSelectedBatches] = useState<string[]>(['2027']);

  // Eligibility Preview State
  const [previewStats, setPreviewStats] = useState<{
    totalEligible: number;
    byDepartment: Record<string, number>;
  } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load initial data if editing
  useEffect(() => {
    if (driveToEdit) {
      setCompanyName(driveToEdit.company_name);
      setCompanyIndustry(driveToEdit.company_industry || 'Technology / Software');
      setJobRole(driveToEdit.job_role);
      setPkg(driveToEdit.package || 0);
      setPackageDisplay(driveToEdit.package_display || (driveToEdit.package ? `₹${driveToEdit.package} LPA` : ''));
      setLocation(driveToEdit.location || '');
      setDriveDate(driveToEdit.drive_date);
      setDriveTime(driveToEdit.drive_time || '09:30 AM');
      setApplicationDeadline(driveToEdit.application_deadline || '');
      setVenue(driveToEdit.venue || '');
      setDriveType(driveToEdit.drive_type);
      setOpenings(driveToEdit.openings || 10);
      setStatus(driveToEdit.status);
      setDescription(driveToEdit.description || '');

      if (driveToEdit.eligibility) {
        setMinCgpa(driveToEdit.eligibility.minimum_cgpa);
        setMin10th(driveToEdit.eligibility.minimum_10th_marks);
        setMin12th(driveToEdit.eligibility.minimum_12th_marks);
        setMaxBacklogs(driveToEdit.eligibility.maximum_backlogs);
        setSelectedBranches(driveToEdit.eligibility.eligible_branches || []);
        setSelectedBatches(driveToEdit.eligibility.eligible_batches || ['2027']);
      }
    } else {
      // Defaults for new drive
      setCompanyName('');
      setJobRole('Software Development Engineer (SDE)');
      setPkg(9.0);
      setPackageDisplay('₹9.0 LPA');
      setLocation('Pune / Bangalore');
      setDriveDate('2027-04-15');
      setApplicationDeadline('2027-04-10');
      setMinCgpa(7.0);
      setMin10th(65.0);
      setMin12th(65.0);
      setMaxBacklogs(0);
      setSelectedBranches(['Computer Engineering', 'Information Technology']);
      setSelectedBatches(['2027']);
    }
  }, [driveToEdit, isOpen]);

  // Real-time Eligibility Preview Calculator
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function calculatePreview() {
      try {
        setLoadingPreview(true);
        const res = await api.getEligibilityPreview({
          minimum_cgpa: minCgpa,
          minimum_10th_marks: min10th,
          minimum_12th_marks: min12th,
          maximum_backlogs: maxBacklogs,
          eligible_branches: selectedBranches,
          eligible_batches: selectedBatches,
        });
        if (isMounted) {
          setPreviewStats(res);
        }
      } catch (err) {
        console.error('Failed to calculate preview', err);
      } finally {
        if (isMounted) setLoadingPreview(false);
      }
    }

    const debounce = setTimeout(calculatePreview, 300);
    return () => {
      isMounted = false;
      clearTimeout(debounce);
    };
  }, [isOpen, minCgpa, min10th, min12th, maxBacklogs, selectedBranches, selectedBatches]);

  if (!isOpen) return null;

  const toggleBranch = (b: string) => {
    setSelectedBranches((prev) =>
      prev.includes(b) ? prev.filter((item) => item !== b) : [...prev, b]
    );
  };

  const toggleBatch = (b: string) => {
    setSelectedBatches((prev) =>
      prev.includes(b) ? prev.filter((item) => item !== b) : [...prev, b]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !jobRole.trim() || !driveDate) {
      setErrorMsg('Please enter company name, job role, and drive date.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const payload = {
        company_name: companyName.trim(),
        company_industry: companyIndustry.trim(),
        job_role: jobRole.trim(),
        package: Number(pkg) || 0,
        package_display: packageDisplay.trim() || `₹${pkg} LPA`,
        location: location.trim(),
        drive_date: driveDate,
        drive_time: driveTime,
        application_deadline: applicationDeadline,
        venue: venue.trim(),
        drive_type: driveType,
        openings: Number(openings) || 0,
        status,
        description,
        eligibility: {
          minimum_cgpa: Number(minCgpa),
          minimum_10th_marks: Number(min10th),
          minimum_12th_marks: Number(min12th),
          maximum_backlogs: Number(maxBacklogs),
          eligible_branches: selectedBranches,
          eligible_batches: selectedBatches,
        },
      };

      let result: PlacementDrive;
      if (isEditing && driveToEdit) {
        result = await api.updatePlacementDrive(driveToEdit.id, payload);
      } else {
        result = await api.createPlacementDrive(payload);
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save placement drive');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="drive-form-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div
        id="drive-form-modal-container"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-[#0B132B] text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                {isEditing ? 'Edit Placement Drive' : 'Create New Placement Drive'}
              </h3>
              <p className="text-xs text-slate-400">
                Define recruitment schedule, compensation, and automated eligibility criteria
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close form dialog"
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Company & Job Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>Company & Role Information</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Microsoft India, Barclays, Oracle"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Industry / Sector</label>
                <input
                  type="text"
                  placeholder="e.g. Software, Banking & Fintech, Consulting"
                  value={companyIndustry}
                  onChange={(e) => setCompanyIndustry(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Role / Designation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Graduate Trainee Engineer, SDE-1"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Package (LPA)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={pkg}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setPkg(val);
                      setPackageDisplay(`₹${val} LPA`);
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Display CTC</label>
                  <input
                    type="text"
                    placeholder="₹12.0 LPA"
                    value={packageDisplay}
                    onChange={(e) => setPackageDisplay(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Location</label>
                <input
                  type="text"
                  placeholder="e.g. Pune / Bangalore / Pan-India"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Drive Type</label>
                  <select
                    value={driveType}
                    onChange={(e) => setDriveType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="On-Campus">On-Campus</option>
                    <option value="Off-Campus">Off-Campus</option>
                    <option value="Pool-Campus">Pool-Campus</option>
                    <option value="Virtual Drive">Virtual Drive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Openings</label>
                  <input
                    type="number"
                    min="1"
                    value={openings}
                    onChange={(e) => setOpenings(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Schedule & Logistics */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Schedule & Deadlines</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Drive Date *</label>
                <input
                  type="date"
                  required
                  value={driveDate}
                  onChange={(e) => setDriveDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reporting Time</label>
                <input
                  type="text"
                  placeholder="e.g. 09:30 AM IST"
                  value={driveTime}
                  onChange={(e) => setDriveTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Application Deadline</label>
                <input
                  type="date"
                  value={applicationDeadline}
                  onChange={(e) => setApplicationDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Drive Venue / Link</label>
                <input
                  type="text"
                  placeholder="e.g. Tech Auditorium Hall B, 3rd Floor"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Drive Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Applications Open">Applications Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Eligibility Engine Criteria */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Automated Eligibility Criteria Engine</span>
              </h4>
              <span className="text-[11px] text-blue-700 font-semibold bg-blue-100 px-2 py-0.5 rounded-full">
                Strict Matching Rules
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Min. CGPA (out of 10)</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="10"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-blue-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Min. 10th Marks (%)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={min10th}
                  onChange={(e) => setMin10th(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-blue-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Min. 12th Marks (%)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={min12th}
                  onChange={(e) => setMin12th(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-blue-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Max Backlogs Allowed</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={maxBacklogs}
                  onChange={(e) => setMaxBacklogs(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-blue-900"
                />
              </div>
            </div>

            {/* Eligible Branches Multi-Select */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Eligible Branches / Programs</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_BRANCHES.map((b) => {
                  const isChecked = selectedBranches.includes(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => toggleBranch(b)}
                      className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-medium border flex items-center justify-between transition ${
                        isChecked
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{b}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Eligible Batches */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Eligible Batches</label>
              <div className="flex gap-2">
                {ALL_BATCHES.map((batch) => {
                  const isChecked = selectedBatches.includes(batch);
                  return (
                    <button
                      key={batch}
                      type="button"
                      onClick={() => toggleBatch(batch)}
                      className={`px-3 py-1.2 rounded-lg text-xs font-bold border transition ${
                        isChecked
                          ? 'bg-indigo-600 text-white border-indigo-700'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Batch {batch}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Real-time Eligibility Preview Calculator Result */}
            <div className="mt-4 pt-3 border-t border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/70 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-slate-700 font-semibold">
                  Live Eligibility Preview:{' '}
                  {loadingPreview ? (
                    <span className="text-slate-400">Calculating...</span>
                  ) : (
                    <strong className="text-blue-700 font-extrabold text-sm">
                      {previewStats?.totalEligible ?? '—'} students eligible
                    </strong>
                  )}
                </span>
              </div>
              {previewStats && previewStats.byDepartment && (
                <div className="text-[11px] text-slate-500 flex flex-wrap gap-2">
                  {Object.entries(previewStats.byDepartment).map(([dept, count]) => (
                    <span key={dept} className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                      {dept}: {count}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Drive Description & Selection Rounds
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-mono text-[11px]"
              placeholder="Outline hiring rounds, test details, requirements, etc."
            />
          </div>
        </form>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{submitting ? 'Saving...' : isEditing ? 'Update Drive' : 'Publish Drive'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
