import React, { useState } from 'react';
import { Settings as SettingsIcon, Building, ShieldCheck, Database, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../lib/api.ts';
import { ConfirmationDialog } from '../components/ConfirmationDialog.tsx';

interface SettingsProps {
  onDataReset?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onDataReset }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleResetData = async () => {
    setResetLoading(true);
    try {
      const res = await api.resetDemoData();
      setSuccessMessage(res.message);
      setResetConfirmOpen(false);
      if (onDataReset) onDataReset();
    } catch (err: any) {
      alert(err.message || 'Failed to reset database');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div id="settings-page" className="space-y-6 max-w-4xl">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Institutional Configuration & Drive Parameters
          </h3>
        </div>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          Central management and academic policy configurations governing the placement cycle for Apex Institute of Technology & Management.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 font-medium shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* College Information Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Building className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Institutional Accreditation & Hierarchy
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-500 mb-1.5 font-bold uppercase tracking-wider text-[10px]">Institution Name</label>
            <input
              type="text"
              readOnly
              value="Apex Institute of Technology & Management"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-slate-800 font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1.5 font-bold uppercase tracking-wider text-[10px]">Department Cell</label>
            <input
              type="text"
              readOnly
              value="Training & Placement Cell (T&P)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-slate-800 font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1.5 font-bold uppercase tracking-wider text-[10px]">Active Academic Drive Cycle</label>
            <input
              type="text"
              readOnly
              value="2026 - 2027 (Ongoing On-Campus & Off-Campus Drives)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-slate-800 font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1.5 font-bold uppercase tracking-wider text-[10px]">Head of Placements (TPO)</label>
            <input
              type="text"
              readOnly
              value="Dr. Arvind Kulkarni (Dean - Placements)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-slate-800 font-bold outline-none"
            />
          </div>
        </div>
      </div>

      {/* Placement Drive Rules */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Placement Rules, TPO Policies & Eligibility Standards
          </h4>
        </div>

        <div className="space-y-3 text-xs text-slate-600">
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-start gap-3.5">
            <span className="px-2.5 py-1 rounded-lg bg-blue-100/80 text-blue-700 font-bold shrink-0 text-[11px]">
              Rule 01
            </span>
            <div className="pt-0.5">
              <strong className="text-slate-900 font-bold block mb-0.5">Dream & Super-Dream Offer Eligibility:</strong>
              Students placed with an offer package below ₹7.0 LPA remain eligible for "Dream" recruitment drives offering ₹10.0+ LPA, maximizing candidate upward career mobility.
            </div>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-start gap-3.5">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100/80 text-emerald-700 font-bold shrink-0 text-[11px]">
              Rule 02
            </span>
            <div className="pt-0.5">
              <strong className="text-slate-900 font-bold block mb-0.5">Dual-Signoff Verification:</strong>
              Placement status updates require validation by either the institutional TPO Admin or the assigned Departmental Placement Coordinator before official reports are certified.
            </div>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-start gap-3.5">
            <span className="px-2.5 py-1 rounded-lg bg-amber-100/80 text-amber-700 font-bold shrink-0 text-[11px]">
              Rule 03
            </span>
            <div className="pt-0.5">
              <strong className="text-slate-900 font-bold block mb-0.5">Immutable Audit Trail:</strong>
              All status transitions (Placed, Offer Pending, Rejected, Opted Out) generate a permanent, timestamped audit log detailing actor identity, timestamps, and justification remarks.
            </div>
          </div>
        </div>
      </div>

      {/* Admin Demo Data Reseed (Admin Only) */}
      {isAdmin && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <Database className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Sandbox Database & Demonstration Seeding
            </h4>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-5 rounded-2xl bg-rose-50/60 border border-rose-200/90">
            <div>
              <p className="text-xs font-bold text-rose-900">Reset System Database to Fresh Comprehensive Sample</p>
              <p className="text-xs text-rose-700 mt-1 max-w-xl leading-relaxed">
                Restores the database to 100 realistic student records across all 6 engineering departments, default coordinator accounts, realistic CTC packages, and verified placement statistics.
              </p>
            </div>

            <button
              id="reset-demo-data-btn"
              type="button"
              onClick={() => setResetConfirmOpen(true)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-rose-500/20 flex items-center gap-2 transition shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Demo Database</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Demo Reseed */}
      <ConfirmationDialog
        isOpen={resetConfirmOpen}
        title="Reset Demo Database?"
        message="This will reseed the application with ~100 realistic student records, mock placement history, and default coordinators. Any manual additions will be replaced with clean sample data."
        confirmText="Yes, Reset Data"
        cancelText="Cancel"
        variant="danger"
        isLoading={resetLoading}
        onConfirm={handleResetData}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </div>
  );
};
