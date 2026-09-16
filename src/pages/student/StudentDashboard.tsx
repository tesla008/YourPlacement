import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Award,
  Bell,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../lib/api.ts';
import { PlacementDrive, Student } from '../../types.ts';
import { DriveDetailModal } from '../../components/DriveDetailModal.tsx';

interface StudentDashboardProps {
  onNavigate: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Student | null>(null);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [journey, setJourney] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);

  useEffect(() => {
    loadStudentDashboardData();
  }, [user]);

  const loadStudentDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, drivesRes, journeyRes] = await Promise.all([
        api.getStudentProfile().catch(() => null),
        api.getPlacementDrives(),
        api.getStudentJourney().catch(() => []),
      ]);

      if (profileRes) setProfile(profileRes);
      setDrives(drivesRes);
      setJourney(journeyRes);
    } catch (err) {
      console.error('Failed to load student data', err);
    } finally {
      setLoading(false);
    }
  };

  const eligibleDrives = drives.filter((d) => d.studentEligibility?.eligible);
  const registeredDrives = drives.filter((d) => d.studentRegistration);
  const selectedDrives = registeredDrives.filter(
    (d) => d.studentRegistration?.selection_status === 'Selected'
  );
  const interviewsOrTests = registeredDrives.filter(
    (d) =>
      d.studentRegistration?.selection_status === 'Test Scheduled' ||
      d.studentRegistration?.selection_status === 'Interview Scheduled' ||
      d.studentRegistration?.selection_status === 'Shortlisted'
  );

  return (
    <div className="space-y-6">
      {/* Student Profile Hero Header Card */}
      <div className="bg-gradient-to-r from-[#0B132B] via-indigo-950 to-[#0B132B] rounded-2xl p-5 sm:p-6 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30 shrink-0">
            {profile?.name ? profile.name.charAt(0) : 'S'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                {profile?.name || user?.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                {profile?.roll_number || 'STU1001'}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  profile?.placement_status === 'Placed'
                    ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400/30'
                    : 'bg-amber-500/30 text-amber-200 border-amber-400/30'
                }`}
              >
                {profile?.placement_status || 'Seeking Placement'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2">
              <span>{profile?.branch || 'Computer Engineering'}</span>
              <span>·</span>
              <span>Batch {profile?.batch || '2027'}</span>
              <span>·</span>
              <span>Academic Year 2026-27</span>
            </p>
          </div>
        </div>

        {/* Quick Academic Chips */}
        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-xs border border-white/10 self-start md:self-auto">
          <div className="px-3 py-1 text-center border-r border-white/10">
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">CGPA</span>
            <span className="text-base sm:text-lg font-black text-emerald-400">
              {profile?.cgpa?.toFixed(2) || '8.45'}
            </span>
          </div>
          <div className="px-3 py-1 text-center border-r border-white/10">
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">10th %</span>
            <span className="text-xs sm:text-sm font-bold text-white">
              {profile?.tenth_percentage || 88.5}%
            </span>
          </div>
          <div className="px-3 py-1 text-center border-r border-white/10">
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">12th %</span>
            <span className="text-xs sm:text-sm font-bold text-white">
              {profile?.twelfth_percentage || 85.0}%
            </span>
          </div>
          <div className="px-3 py-1 text-center">
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">Backlogs</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-400">
              {profile?.active_backlogs ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => onNavigate('student_drives')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md transition text-left group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Eligible Drives</span>
            <Sparkles className="w-4 h-4 text-blue-600 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{eligibleDrives.length}</span>
            <span className="text-xs text-blue-600 font-bold">Matching Profile</span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('student_journey')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition text-left group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Registered</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{registeredDrives.length}</span>
            <span className="text-xs text-indigo-600 font-bold">Applications</span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('student_journey')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-amber-300 hover:shadow-md transition text-left group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tests / Interviews</span>
            <Clock className="w-4 h-4 text-amber-500 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-700">{interviewsOrTests.length}</span>
            <span className="text-xs text-amber-600 font-bold">In Progress</span>
          </div>
        </button>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Offers Extended</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">{selectedDrives.length}</span>
            <span className="text-xs text-emerald-600 font-bold">
              {selectedDrives.length > 0 ? 'Placed 🎉' : 'Active Applicant'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recommended Drives + Live Journey Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recommended Placement Drives */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Recommended Campus Drives</span>
              </h3>
              <p className="text-xs text-slate-500">
                You meet 100% of academic and branch criteria for these companies
              </p>
            </div>
            <button
              onClick={() => onNavigate('student_drives')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View All ({drives.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              Loading recommended opportunities...
            </div>
          ) : eligibleDrives.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
              No matching drives currently open for your branch and academic score.
            </div>
          ) : (
            <div className="space-y-3">
              {eligibleDrives.slice(0, 4).map((d) => {
                const isReg = Boolean(d.studentRegistration);
                return (
                  <div
                    key={d.id}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-extrabold text-lg flex items-center justify-center shrink-0">
                        {d.company_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {d.drive_type}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>100% Eligible</span>
                          </span>
                        </div>
                        <h4 className="text-base font-extrabold text-slate-900 truncate">
                          {d.company_name}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium truncate">{d.job_role}</p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            {d.drive_date}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-amber-600" />
                            {d.location}
                          </span>
                          <span className="flex items-center gap-1 text-rose-600 font-medium">
                            <Clock className="w-3.5 h-3.5 text-rose-500" />
                            Apply by: {d.application_deadline}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="text-sm sm:text-base font-black text-emerald-700 block">
                          {d.package_display || (d.package ? `₹${d.package} LPA` : 'Best in Class')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">CTC Offered</span>
                      </div>

                      <button
                        onClick={() => setSelectedDrive(d)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 ${
                          isReg
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isReg ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{d.studentRegistration?.selection_status || 'Registered'}</span>
                          </>
                        ) : (
                          <>
                            <span>View & Apply</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: My Live Application Journey & Next Events */}
        <div className="space-y-6">
          {/* Active Application Journey Snapshot */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>My Active Journey</span>
              </h3>
              <button
                onClick={() => onNavigate('student_journey')}
                className="text-[11px] text-blue-600 font-bold hover:underline"
              >
                Track All
              </button>
            </div>

            {journey.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>You haven't registered for any placement drives yet.</p>
                <button
                  onClick={() => onNavigate('student_drives')}
                  className="mt-3 text-xs font-bold text-blue-600 hover:underline"
                >
                  Browse Campus Drives →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {journey.slice(0, 3).map((item) => (
                  <div
                    key={item.drive.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-blue-50/40 transition cursor-pointer"
                    onClick={() => onNavigate('student_journey')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900">
                        {item.drive.company_name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          item.currentStatus === 'Selected'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : item.currentStatus === 'Shortlisted'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : item.currentStatus === 'Test Scheduled'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        {item.currentStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{item.drive.job_role}</p>

                    {/* Progress dots */}
                    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>Registration</span>
                      <span className="text-slate-300">→</span>
                      <span>Assessment</span>
                      <span className="text-slate-300">→</span>
                      <span>Interview</span>
                      <span className="text-slate-300">→</span>
                      <span>Offer</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Schedule / Important Dates */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Upcoming Dates & Deadlines</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0" />
                <div>
                  <span className="font-bold text-blue-950 block">Deloitte USI Drive</span>
                  <span className="text-[11px] text-blue-700">Online Aptitude Round · April 02, 2027</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-950 block">Tata Consultancy Services</span>
                  <span className="text-[11px] text-emerald-700">Digital / Prime Interviews · April 05, 2027</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-100 flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-rose-600 mt-1 shrink-0" />
                <div>
                  <span className="font-bold text-rose-950 block">Cognizant Application Deadline</span>
                  <span className="text-[11px] text-rose-700">Closes at 11:59 PM · April 07, 2027</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drive Details Modal */}
      <DriveDetailModal
        drive={selectedDrive}
        isOpen={Boolean(selectedDrive)}
        onClose={() => setSelectedDrive(null)}
        studentProfile={profile}
        onRegisterSuccess={() => {
          loadStudentDashboardData();
        }}
      />
    </div>
  );
};
