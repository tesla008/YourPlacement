import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  UserPlus,
  Building2,
  Mail,
  Calendar,
  ShieldAlert,
  Power,
  KeyRound,
  Edit2,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react';
import { CoordinatorAccount } from '../types.ts';
import { api } from '../lib/api.ts';

const DEPARTMENTS = [
  'Computer Technology',
  'Information Technology',
  'Electronics & Telecommunication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

export const Coordinators: React.FC = () => {
  const [coordinators, setCoordinators] = useState<CoordinatorAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCoord, setEditingCoord] = useState<CoordinatorAccount | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [batch, setBatch] = useState('2027');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchCoordinators = async () => {
    setLoading(true);
    try {
      const data = await api.getCoordinators();
      setCoordinators(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load coordinators');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoordinators();
  }, []);

  const handleOpenAdd = () => {
    setEditingCoord(null);
    setName('');
    setEmail('');
    setDepartment(DEPARTMENTS[0]);
    setBatch('2027');
    setModalError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (coord: CoordinatorAccount) => {
    setEditingCoord(coord);
    setName(coord.name);
    setEmail(coord.email);
    setDepartment(coord.department);
    setBatch(coord.batch);
    setModalError(null);
    setShowModal(true);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await api.toggleCoordinatorStatus(id);
      setSuccessMsg(res.message);
      fetchCoordinators();
    } catch (err: any) {
      alert(err.message || 'Failed to update coordinator status');
    }
  };

  const handleResetPassword = async (coord: CoordinatorAccount) => {
    if (confirm(`Reset password for ${coord.name}? The new default password will be 'coord123'.`)) {
      try {
        await api.updateCoordinator(coord.id, { resetPassword: true });
        setSuccessMsg(`Password for ${coord.name} has been reset to 'coord123'.`);
      } catch (err: any) {
        alert(err.message || 'Failed to reset password');
      }
    }
  };

  const handleSaveCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);

    try {
      if (editingCoord) {
        await api.updateCoordinator(editingCoord.id, {
          name: name.trim(),
          email: email.trim(),
          department,
          batch,
        });
        setSuccessMsg(`Coordinator ${name} updated successfully.`);
      } else {
        await api.createCoordinator({
          name: name.trim(),
          email: email.trim(),
          department,
          batch,
        });
        setSuccessMsg(`Coordinator account created for ${name}. Default password is 'coord123'.`);
      }
      setShowModal(false);
      fetchCoordinators();
    } catch (err: any) {
      setModalError(err.message || 'Failed to save coordinator account');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div id="coordinators-page" className="space-y-6">
      {/* Scope banner explaining role permissions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Placement Coordinators & Delegation
            </h3>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Faculty representatives delegated with branch-restricted permissions to review, update, and certify student placement offers for their departments.
          </p>
        </div>
        <button
          id="add-coordinator-btn"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-blue-500/20 flex items-center gap-2 transition shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Faculty Coordinator</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium shadow-2xs">
          {error}
        </div>
      )}

      {/* Coordinators Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Active Delegated Coordinators ({coordinators.length})
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Default initial password: <code className="text-blue-600 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">coord123</code>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Faculty Member</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Departmental Jurisdiction</th>
                <th className="py-3.5 px-4">Assigned Batch</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400">
                    Loading coordinators roster...
                  </td>
                </tr>
              ) : (
                coordinators.map((coord) => (
                  <tr key={coord.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{coord.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Faculty Coordinator</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono font-medium">{coord.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-800 font-semibold border border-blue-100">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>{coord.department}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono font-semibold">{coord.batch}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold ${
                          coord.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${coord.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{coord.is_active ? 'Active' : 'Deactivated'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleResetPassword(coord)}
                          title="Reset Password to default (coord123)"
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition border border-transparent hover:border-amber-200"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(coord)}
                          title="Edit Coordinator Scope"
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition border border-transparent hover:border-blue-200"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(coord.id)}
                          title={coord.is_active ? 'Deactivate Coordinator' : 'Activate Coordinator'}
                          className={`p-2 rounded-xl transition border border-transparent ${
                            coord.is_active
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200'
                              : 'text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {editingCoord ? 'Edit Coordinator Permissions' : 'Register Faculty Coordinator'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveCoordinator} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Prof. Priya Mehta"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Institutional Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya.mehta@college.edu"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department Scope <span className="text-rose-500">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  This coordinator's view will strictly filter to students within this department.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Batch Year <span className="text-rose-500">*</span>
                </label>
                <select
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
                >
                  <option value="All">All Batches</option>
                  <option value="2027">Batch 2027</option>
                  <option value="2026">Batch 2026</option>
                  <option value="2025">Batch 2025</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs shadow-blue-500/20"
                >
                  {modalLoading ? 'Saving...' : editingCoord ? 'Update Coordinator' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
