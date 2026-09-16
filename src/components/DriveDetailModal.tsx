import React, { useState } from 'react';
import {
  X,
  Building2,
  Calendar,
  Clock,
  MapPin,
  Briefcase,
  DollarSign,
  Users,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Send,
  Sparkles,
  ExternalLink,
  Award,
} from 'lucide-react';
import { PlacementDrive, Student } from '../types.ts';
import { checkEligibility } from '../lib/eligibility.ts';
import { api } from '../lib/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface DriveDetailModalProps {
  drive: PlacementDrive | null;
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess?: (updatedDrive: PlacementDrive) => void;
  studentProfile?: Student | null;
}

export const DriveDetailModal: React.FC<DriveDetailModalProps> = ({
  drive,
  isOpen,
  onClose,
  onRegisterSuccess,
  studentProfile,
}) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !drive) return null;

  const isStudentMode = user?.role === 'student';
  const effectiveStudent = studentProfile || null;

  const eligibilityCheck = effectiveStudent
    ? checkEligibility(effectiveStudent, drive.eligibility)
    : drive.studentEligibility || null;

  const isEligible = eligibilityCheck ? eligibilityCheck.eligible : true;
  const isRegistered = Boolean(drive.studentRegistration);
  const registrationStatus = drive.studentRegistration?.selection_status || 'Registered';

  const handleApply = async () => {
    try {
      setSubmitting(true);
      setErrorMsg(null);
      await api.registerForDrive(drive.id, {
        studentId: user?.student_id,
        remarks: 'Applied via student portal',
      });
      setRegSuccess(true);
      if (onRegisterSuccess) {
        onRegisterSuccess({
          ...drive,
          studentRegistration: {
            id: `reg_${drive.id}`,
            drive_id: drive.id,
            student_id: user?.student_id || '',
            registration_status: 'Registered',
            selection_status: 'Registered',
            registered_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            remarks: null,
          },
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register for drive');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="drive-detail-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div
        id="drive-detail-modal-container"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 font-bold text-xl shadow-inner">
              {drive.company_name.charAt(0)}
            </div>
            <div className="min-w-0 pr-8">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  {drive.drive_type}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  {drive.status}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {drive.company_name}
              </h3>
              <p className="text-sm font-medium text-slate-300 flex items-center gap-1.5 mt-0.5">
                <Briefcase className="w-4 h-4 text-blue-300" />
                <span>{drive.job_role}</span>
                {drive.company_industry && (
                  <span className="text-slate-400 text-xs">· {drive.company_industry}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Drive Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Package (CTC)</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-700 flex items-center gap-1 mt-0.5">
                <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                {drive.package_display || (drive.package ? `₹${drive.package} LPA` : 'Best in Industry')}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Drive Date</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                {drive.drive_date}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Location</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                {drive.location}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Application Deadline</span>
              <span className="text-xs sm:text-sm font-bold text-rose-700 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                {drive.application_deadline}
              </span>
            </div>
          </div>

          {/* Student Eligibility Verdict Banner (Student Mode) */}
          {isStudentMode && effectiveStudent && eligibilityCheck && (
            <div
              className={`p-4 rounded-xl border transition-all ${
                isEligible
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/80 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-start gap-3">
                {isEligible ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-sm font-bold">
                    {isEligible
                      ? 'You are eligible to apply for this campus drive!'
                      : 'You do not meet all eligibility criteria for this drive'}
                  </h4>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {isEligible
                      ? `Your academic record (${effectiveStudent.cgpa} CGPA, ${effectiveStudent.branch}) fulfills all criteria set by ${drive.company_name}.`
                      : 'Review the unmet criteria below before registering.'}
                  </p>

                  {!isEligible && eligibilityCheck.failedReasons.length > 0 && (
                    <ul className="mt-2.5 space-y-1 text-xs">
                      {eligibilityCheck.failedReasons.map((reason, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 font-semibold text-rose-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Description & Overview */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Drive Overview & Job Description
            </h4>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-100 whitespace-pre-line">
              {drive.description || 'Detailed job description and evaluation rounds.'}
            </div>
          </div>

          {/* Venue & Logistics */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Drive Venue</span>
              <p className="text-xs font-semibold text-slate-800 mt-1">{drive.venue || 'Main Placement Auditorium'}</p>
            </div>
            <div className="flex-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Reporting Time</span>
              <p className="text-xs font-semibold text-slate-800 mt-1">{drive.drive_time || '09:30 AM IST'}</p>
            </div>
            <div className="flex-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Expected Openings</span>
              <p className="text-xs font-semibold text-slate-800 mt-1">{drive.openings || 'Multiple'} positions</p>
            </div>
          </div>

          {/* Eligibility Criteria Matrix */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Eligibility Criteria Matrix</span>
              {isStudentMode && effectiveStudent && (
                <span className="text-[11px] font-normal text-slate-500">
                  Compared against your profile ({effectiveStudent.name})
                </span>
              )}
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50/50">
                <span className="font-semibold text-slate-600">Minimum CGPA</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{drive.eligibility.minimum_cgpa.toFixed(2)}</span>
                  {isStudentMode && effectiveStudent && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        effectiveStudent.cgpa >= drive.eligibility.minimum_cgpa
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      Yours: {effectiveStudent.cgpa.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3">
                <span className="font-semibold text-slate-600">Minimum 10th Grade Percentage</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{drive.eligibility.minimum_10th_marks}%</span>
                  {isStudentMode && effectiveStudent && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        (effectiveStudent.tenth_percentage || 0) >= drive.eligibility.minimum_10th_marks
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      Yours: {effectiveStudent.tenth_percentage || '—'}%
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50/50">
                <span className="font-semibold text-slate-600">Minimum 12th / Diploma Percentage</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{drive.eligibility.minimum_12th_marks}%</span>
                  {isStudentMode && effectiveStudent && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        (effectiveStudent.twelfth_percentage || effectiveStudent.diploma_percentage || 0) >=
                        drive.eligibility.minimum_12th_marks
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      Yours: {effectiveStudent.twelfth_percentage || effectiveStudent.diploma_percentage || '—'}%
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3">
                <span className="font-semibold text-slate-600">Maximum Allowed Backlogs</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">
                    {drive.eligibility.maximum_backlogs === 0
                      ? '0 (No active backlogs permitted)'
                      : `Up to ${drive.eligibility.maximum_backlogs}`}
                  </span>
                  {isStudentMode && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Yours: 0
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50/50">
                <span className="font-semibold text-slate-600 block mb-1.5">Eligible Branches</span>
                <div className="flex flex-wrap gap-1.5">
                  {drive.eligibility.eligible_branches.map((b) => (
                    <span
                      key={b}
                      className={`px-2 py-0.8 rounded-md text-[11px] font-medium ${
                        isStudentMode && effectiveStudent && (b === 'All Branches' || effectiveStudent.branch?.toLowerCase().includes(b.toLowerCase()) || effectiveStudent.department?.toLowerCase().includes(b.toLowerCase()))
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feedback or error message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {regSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>You have successfully registered for {drive.company_name}! Check "My Journey" for your schedule.</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-5 py-4 border-t border-slate-200/80 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            Close
          </button>

          {isStudentMode ? (
            <div className="flex items-center gap-2">
              {isRegistered || regSuccess ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Status: {regSuccess ? 'Registered' : registrationStatus}</span>
                </div>
              ) : (
                <button
                  id="apply-drive-button"
                  onClick={handleApply}
                  disabled={submitting || !isEligible}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-sm ${
                    isEligible
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting Application...' : 'Register for Drive'}</span>
                </button>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-500 font-medium">
              TPO Administrative View · Managed by T&P Cell
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
