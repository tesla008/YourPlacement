import React, { useState, useEffect } from 'react';
import {
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Send,
  Users,
} from 'lucide-react';
import { PlacementDrive, Student } from '../../types.ts';
import { api } from '../../lib/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { DriveDetailModal } from '../../components/DriveDetailModal.tsx';

export const StudentDrives: React.FC = () => {
  const { user } = useAuth();
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [profile, setProfile] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [tabFilter, setTabFilter] = useState<'ALL' | 'ELIGIBLE' | 'APPLIED'>('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [packageFilter, setPackageFilter] = useState('ALL');

  // Modal
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);

  useEffect(() => {
    loadDrivesAndProfile();
  }, [user]);

  const loadDrivesAndProfile = async () => {
    try {
      setLoading(true);
      const [drivesRes, profileRes] = await Promise.all([
        api.getPlacementDrives(),
        api.getStudentProfile().catch(() => null),
      ]);
      setDrives(drivesRes);
      if (profileRes) setProfile(profileRes);
    } catch (err) {
      console.error('Failed to load student drives', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrives = drives.filter((d) => {
    // Search match
    const matchesSearch =
      !searchQuery ||
      d.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.job_role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Tab filter
    if (tabFilter === 'ELIGIBLE' && !d.studentEligibility?.eligible) return false;
    if (tabFilter === 'APPLIED' && !d.studentRegistration) return false;

    // Type filter
    if (typeFilter !== 'ALL' && d.drive_type !== typeFilter) return false;

    // Package filter
    if (packageFilter === 'UNDER_6' && (d.package || 0) >= 6) return false;
    if (packageFilter === '6_TO_10' && ((d.package || 0) < 6 || (d.package || 0) > 10)) return false;
    if (packageFilter === 'ABOVE_10' && (d.package || 0) <= 10) return false;

    return matchesSearch;
  });

  const eligibleCount = drives.filter((d) => d.studentEligibility?.eligible).length;
  const appliedCount = drives.filter((d) => d.studentRegistration).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Campus Placement Drives
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Discover verified recruitment drives, evaluate automated eligibility against your academic profile, and register in one click.
          </p>
        </div>

        {profile && (
          <div className="flex items-center gap-2.5 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs self-start sm:self-auto text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-600 font-medium">Your Profile:</span>
            <strong className="text-slate-900">{profile.cgpa} CGPA</strong>
            <span className="text-slate-400">·</span>
            <span className="text-slate-700 font-semibold">{profile.branch}</span>
          </div>
        )}
      </div>

      {/* Tabs & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setTabFilter('ALL')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                tabFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Drives ({drives.length})
            </button>
            <button
              onClick={() => setTabFilter('ELIGIBLE')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                tabFilter === 'ELIGIBLE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Eligible for Me ({eligibleCount})</span>
            </button>
            <button
              onClick={() => setTabFilter('APPLIED')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                tabFilter === 'APPLIED'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Applied / Registered ({appliedCount})</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filteredDrives.length}</strong> opportunities
          </div>
        </div>

        {/* Filter inputs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company name, role, tech stack, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none flex-1 sm:flex-none"
            >
              <option value="ALL">All CTC Packages</option>
              <option value="UNDER_6">Under ₹6 LPA</option>
              <option value="6_TO_10">₹6 LPA – ₹10 LPA</option>
              <option value="ABOVE_10">Above ₹10 LPA (Dream / Super Dream)</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none flex-1 sm:flex-none"
            >
              <option value="ALL">All Drive Types</option>
              <option value="On-Campus">On-Campus</option>
              <option value="Off-Campus">Off-Campus</option>
              <option value="Pool-Campus">Pool-Campus</option>
              <option value="Virtual Drive">Virtual Drive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drives Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
          Checking eligibility and loading placement drives...
        </div>
      ) : filteredDrives.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
          No placement opportunities found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDrives.map((drive) => {
            const eligibility = drive.studentEligibility;
            const isEligible = eligibility ? eligibility.eligible : true;
            const registration = drive.studentRegistration;
            const isRegistered = Boolean(registration);

            return (
              <div
                key={drive.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5">
                  {/* Top Bar: Badges */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        {drive.drive_type}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {drive.status}
                      </span>
                    </div>

                    {/* Eligibility / Registration Pill */}
                    {isRegistered ? (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{registration?.selection_status || 'Applied'}</span>
                      </span>
                    ) : isEligible ? (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Eligible</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                        <span>Not Eligible</span>
                      </span>
                    )}
                  </div>

                  {/* Company & Role */}
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs">
                      {drive.company_name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-extrabold text-slate-900 tracking-tight truncate">
                        {drive.company_name}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium truncate">{drive.job_role}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-emerald-700 block">
                        {drive.package_display || (drive.package ? `₹${drive.package} LPA` : 'Competitive')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">CTC Package</span>
                    </div>
                  </div>

                  {/* Drive Logistics Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 mb-3">
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">Drive: {drive.drive_date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{drive.location || 'Campus / Virtual'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span className="truncate">Deadline: {drive.application_deadline || 'Open'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{drive.openings || 'Multiple'} Openings</span>
                    </div>
                  </div>

                  {/* Eligibility Criteria or Failed Reasons Preview */}
                  {!isEligible && eligibility && eligibility.failedReasons.length > 0 ? (
                    <div className="p-2.5 rounded-lg bg-rose-50/80 border border-rose-200 text-xs text-rose-900 mb-2">
                      <span className="font-bold block text-[11px] mb-0.5 flex items-center gap-1 text-rose-800">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        Criteria Not Met:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-rose-700">
                        {eligibility.failedReasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center justify-between">
                      <span>
                        Min CGPA: <strong>{drive.eligibility.minimum_cgpa}</strong> · Backlogs: Max {drive.eligibility.maximum_backlogs}
                      </span>
                      <span className="text-emerald-700 font-bold text-[10px]">
                        {drive.eligibility.eligible_branches.length} branches
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="bg-slate-50/90 px-5 py-3 border-t border-slate-200/80 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {drive.venue || 'Auditorium Hall B'}
                  </span>

                  <button
                    onClick={() => setSelectedDrive(drive)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isRegistered
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : isEligible
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {isRegistered ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>View Application</span>
                      </>
                    ) : isEligible ? (
                      <>
                        <span>View Details & Register</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <span>View Details</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drive Details Modal */}
      <DriveDetailModal
        drive={selectedDrive}
        isOpen={Boolean(selectedDrive)}
        onClose={() => setSelectedDrive(null)}
        studentProfile={profile}
        onRegisterSuccess={() => {
          loadDrivesAndProfile();
        }}
      />
    </div>
  );
};
