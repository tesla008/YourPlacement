import React, { useState } from 'react';
import {
  GraduationCap,
  Briefcase,
  Users,
  Building2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
  UserCheck,
} from 'lucide-react';
import { useAuth, DemoRoleKey } from '../context/AuthContext.tsx';

interface ModeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModeSelected?: (mode: 'student' | 'tpo') => void;
}

export const ModeSelectionModal: React.FC<ModeSelectionModalProps> = ({
  isOpen,
  onClose,
  onModeSelected,
}) => {
  const { mode, switchDemoRole, user } = useAuth();
  const [selectedStudentPersona, setSelectedStudentPersona] =
    useState<DemoRoleKey>('student_rahul');
  const [selectedStaffPersona, setSelectedStaffPersona] =
    useState<DemoRoleKey>('admin');

  if (!isOpen) return null;

  const handleEnterStudent = async () => {
    await switchDemoRole(selectedStudentPersona);
    if (onModeSelected) onModeSelected('student');
    onClose();
  };

  const handleEnterTPO = async () => {
    await switchDemoRole(selectedStaffPersona);
    if (onModeSelected) onModeSelected('tpo');
    onClose();
  };

  return (
    <div
      id="mode-selection-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    >
      <div
        id="mode-selection-modal-container"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-[#0B132B] text-white p-6 relative text-center">
          <button
            onClick={onClose}
            aria-label="Close mode selector"
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Dual-Experience Placement Ecosystem</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Select Your Workspace Experience
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mt-1">
            Choose whether you are exploring campus drives as an applicant, or managing placement operations as a college officer.
          </p>
        </div>

        {/* Dual Mode Cards */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50">
          {/* 1. Student Mode Card */}
          <div
            className={`bg-white rounded-2xl p-6 border-2 transition-all flex flex-col justify-between ${
              mode === 'student'
                ? 'border-blue-600 ring-4 ring-blue-500/10 shadow-lg'
                : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <GraduationCap className="w-6 h-6" />
                </div>
                {mode === 'student' && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Active Mode</span>
                  </span>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                Student Mode
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Personalized recruitment discovery, automated academic eligibility verification, 1-click drive registration, and milestone journey tracking.
              </p>

              {/* Student Features list */}
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>View upcoming company drives, roles & packages</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant eligibility calculation against your CGPA</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>5-stage recruitment journey progress & alerts</span>
                </li>
              </ul>

              {/* Student Persona Select */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select Demo Student Candidate:
                </label>
                <div className="space-y-1.5">
                  {[
                    { key: 'student_rahul', name: 'Rahul Sharma', branch: 'Computer Engg', cgpa: '8.45' },
                    { key: 'student_sanika', name: 'Sanika Joshi', branch: 'Information Tech', cgpa: '7.75' },
                    { key: 'student_rohan', name: 'Rohan Verma', branch: 'Mechanical Engg', cgpa: '6.40' },
                    { key: 'student_ananya', name: 'Ananya Iyer', branch: 'ENTC', cgpa: '8.90' },
                  ].map((cand) => (
                    <button
                      key={cand.key}
                      type="button"
                      onClick={() => setSelectedStudentPersona(cand.key as DemoRoleKey)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between border transition ${
                        selectedStudentPersona === cand.key
                          ? 'bg-blue-50/80 border-blue-400 text-blue-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{cand.name} ({cand.branch})</span>
                      <span className="text-[11px] font-black text-emerald-700">{cand.cgpa} CGPA</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleEnterStudent}
              className="mt-6 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
            >
              <span>Enter Student Mode</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 2. TPO / Coordinator Mode Card */}
          <div
            className={`bg-white rounded-2xl p-6 border-2 transition-all flex flex-col justify-between ${
              mode === 'tpo'
                ? 'border-indigo-600 ring-4 ring-indigo-500/10 shadow-lg'
                : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0B132B] text-white flex items-center justify-center shadow-md shadow-slate-900/20">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                </div>
                {mode === 'tpo' && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Active Mode</span>
                  </span>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                TPO & Coordinator Mode
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Centralized placement administration, drive publishing with live eligibility preview, applicant filtering, bulk stage updates, and analytics.
              </p>

              {/* TPO Features list */}
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Create & publish drives with criteria engine</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Manage candidate test schedules & bulk updates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Excel import, coordinator accounts & audit trails</span>
                </li>
              </ul>

              {/* Staff Persona Select */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select Demo Officer / Coordinator:
                </label>
                <div className="space-y-1.5">
                  {[
                    { key: 'admin', name: 'Dr. Arvind Kulkarni', role: 'Head TPO (College-wide)' },
                    { key: 'cs_coord', name: 'Prof. Priya Mehta', role: 'Computer Dept Coordinator' },
                    { key: 'it_coord', name: 'Prof. Rajesh Kumar', role: 'IT Dept Coordinator' },
                    { key: 'mech_coord', name: 'Prof. Suresh Patil', role: 'Mechanical Coordinator' },
                  ].map((staff) => (
                    <button
                      key={staff.key}
                      type="button"
                      onClick={() => setSelectedStaffPersona(staff.key as DemoRoleKey)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between border transition ${
                        selectedStaffPersona === staff.key
                          ? 'bg-indigo-50/80 border-indigo-400 text-indigo-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{staff.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium truncate">{staff.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleEnterTPO}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#0B132B] hover:bg-slate-900 text-white font-bold text-xs shadow-md shadow-slate-900/20 transition flex items-center justify-center gap-2"
            >
              <span>Enter TPO Mode</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Both modes connect to the same real-time database with role-enforced authorization.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
