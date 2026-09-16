import React, { useState, useEffect } from 'react';
import { History, Search, Clock, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { PlacementHistoryItem } from '../types.ts';
import { api } from '../lib/api.ts';
import { StatusBadge } from '../components/StatusBadge.tsx';

export const AuditHistory: React.FC = () => {
  const [history, setHistory] = useState<PlacementHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditHistory();
      setHistory(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = history.filter((item) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      item.student_name.toLowerCase().includes(q) ||
      item.roll_number.toLowerCase().includes(q) ||
      (item.company && item.company.toLowerCase().includes(q)) ||
      item.updated_by.toLowerCase().includes(q)
    );
  });

  return (
    <div id="audit-history-page" className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <History className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Placement Audit Trail & Activity Logs
            </h3>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Immutable chronological ledger documenting every student status transition, offer registration, and authorized admin/coordinator intervention.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, roll number, recruiter..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition shadow-2xs"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Status Modifications & Verifications ({filtered.length})
          </span>
          <span className="text-xs text-slate-500 font-medium">Recorded with verified actor identity</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Event Timestamp</th>
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">Status Transition</th>
                <th className="py-3.5 px-4">Company & CTC</th>
                <th className="py-3.5 px-4">Verified By</th>
                <th className="py-3.5 px-4">Audit Notes / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400">
                    Loading audit trail records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400">
                    No status modification logs matching search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{item.student_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.roll_number}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-medium">{item.previous_status || 'Unregistered'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <StatusBadge status={item.new_status} size="sm" />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.company ? (
                        <div>
                          <span className="font-bold text-slate-900">{item.company}</span>
                          {item.package && (
                            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ₹{item.package} LPA
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {item.updated_by_role === 'admin' ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span className="font-bold text-slate-800">{item.updated_by}</span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">({item.updated_by_role})</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate font-medium">
                      {item.remarks ? `"${item.remarks}"` : <span className="text-slate-400">—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
