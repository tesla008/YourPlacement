import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  Award,
  BookOpen,
  FileCheck,
  CheckCircle2,
  Briefcase,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../lib/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { Student } from '../../types.ts';

export const StudentProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getStudentProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
        Loading student academic profile...
      </div>
    );
  }

  const student = profile as Student;
  const registeredDrives = profile?.registeredDrives || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          My Academic & Placement Profile
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Official student record verified by College Registrar and T&P Cell for placement eligibility.
        </p>
      </div>

      {/* Main Dossier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Personal & Academic Metrics */}
        <div className="space-y-6">
          {/* Identity Card */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-3xl flex items-center justify-center mx-auto shadow-md shadow-blue-500/20 mb-3">
              {student?.name?.charAt(0) || 'S'}
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">{student?.name}</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Roll No: {student?.roll_number}
            </p>
            <div className="mt-2.5 inline-block">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  student?.placement_status === 'Placed'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-blue-100 text-blue-800 border-blue-300'
                }`}
              >
                {student?.placement_status || 'Seeking Placement'}
              </span>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-left text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{student?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{student?.phone || '+91 98230 44512'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{student?.branch}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Graduating Batch {student?.batch}</span>
              </div>
            </div>
          </div>

          {/* Academic Scores Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Verified Academic Record</span>
            </h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Cumulative GPA</span>
                  <span className="text-xs text-slate-400">Scale of 10.0</span>
                </div>
                <span className="text-xl font-black text-emerald-700">
                  {student?.cgpa?.toFixed(2) || '—'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">10th Grade (SSC/CBSE)</span>
                  <span className="text-xs text-slate-400">Board Exam %</span>
                </div>
                <span className="text-sm font-extrabold text-slate-900">
                  {student?.tenth_percentage || '—'}%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">12th Grade (HSC)</span>
                  <span className="text-xs text-slate-400">Junior College %</span>
                </div>
                <span className="text-sm font-extrabold text-slate-900">
                  {student?.twelfth_percentage || '—'}%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Active Backlogs</span>
                  <span className="text-xs text-slate-400">Current back papers</span>
                </div>
                <span className="text-sm font-extrabold text-emerald-600">
                  {student?.active_backlogs ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Registered Drives & Placements History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Registrations & Status Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>My Drive Registrations ({registeredDrives.length})</span>
              </h4>
              <span className="text-xs text-slate-400">Campus Drives</span>
            </div>

            {registeredDrives.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active drive registrations found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {registeredDrives.map((reg: any) => (
                  <div key={reg.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          {reg.drive?.company_name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                          {reg.drive?.drive_type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Role: {reg.drive?.job_role} · Date: {reg.drive?.drive_date}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <div className="text-left sm:text-right">
                        <span className="text-xs font-bold text-emerald-700 block">
                          {reg.drive?.package_display || `₹${reg.drive?.package} LPA`}
                        </span>
                        <span className="text-[10px] text-slate-400">Package</span>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          reg.selection_status === 'Selected'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : reg.selection_status === 'Shortlisted'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                      >
                        {reg.selection_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Placement Offer Summary */}
          {student?.company && (
            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-emerald-950">
                    Confirmed Placement Record
                  </h4>
                  <p className="text-xs text-emerald-800 mt-1">
                    Placed at <strong>{student.company}</strong> with an annual CTC package of{' '}
                    <strong>₹{student.package || 8.5} LPA</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
