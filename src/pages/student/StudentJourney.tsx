import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Building2,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  AlertCircle,
  FileText,
  UserCheck,
  ChevronRight,
  PartyPopper,
} from 'lucide-react';
import { api } from '../../lib/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { DriveSelectionStatus } from '../../types.ts';

const STAGES = [
  { key: 'eligibility', label: '1. Academic Eligibility', desc: 'Criteria verified against records' },
  { key: 'registration', label: '2. Drive Registration', desc: 'Application received by T&P Cell' },
  { key: 'test', label: '3. Online Assessment', desc: 'Aptitude & technical evaluation' },
  { key: 'interview', label: '4. Technical Interview', desc: 'Coding, domain & system rounds' },
  { key: 'offer', label: '5. Final Offer & LOI', desc: 'Placement offer letter extended' },
];

export const StudentJourney: React.FC = () => {
  const { user } = useAuth();
  const [journeyItems, setJourneyItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJourney();
  }, [user]);

  const loadJourney = async () => {
    try {
      setLoading(true);
      const data = await api.getStudentJourney();
      setJourneyItems(data);
    } catch (err) {
      console.error('Failed to load placement journey', err);
    } finally {
      setLoading(false);
    }
  };

  const getStageIndex = (status: DriveSelectionStatus): number => {
    switch (status) {
      case 'Registered':
        return 1;
      case 'Test Scheduled':
        return 2;
      case 'Shortlisted':
        return 3;
      case 'Interview Scheduled':
        return 3;
      case 'Selected':
        return 4;
      case 'Rejected':
        return 2;
      default:
        return 1;
    }
  };

  const selectedItems = journeyItems.filter((j) => j.currentStatus === 'Selected');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          My Placement Journey Tracker
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Real-time end-to-end recruitment milestone tracking from eligibility check to final offer letter.
        </p>
      </div>

      {/* Offer Celebration Banner (If Placed) */}
      {selectedItems.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-emerald-500/40 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-200">
                  Congratulations! Placement Offer Confirmed
                </span>
                <h3 className="text-lg sm:text-2xl font-extrabold mt-0.5">
                  You have been selected at {selectedItems[0].drive.company_name}!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                  Package: <strong>{selectedItems[0].drive.package_display || `₹${selectedItems[0].drive.package} LPA`}</strong> · Role: {selectedItems[0].drive.job_role}
                </p>
              </div>
            </div>

            <div className="bg-white/15 px-4 py-2 rounded-xl text-center backdrop-blur-xs border border-white/20 self-start sm:self-auto">
              <span className="text-[10px] text-emerald-200 uppercase font-bold block">Status</span>
              <span className="text-sm font-black text-white">Offer Letter Issued</span>
            </div>
          </div>
        </div>
      )}

      {/* Application Cards List */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
          Loading your recruitment journeys...
        </div>
      ) : journeyItems.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs space-y-3">
          <TrendingUp className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No active placement applications yet</h3>
          <p className="max-w-md mx-auto text-slate-500">
            Browse through the upcoming campus drives, verify your eligibility, and register to start tracking your recruitment stages here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {journeyItems.map((item) => {
            const currentStageIdx = getStageIndex(item.currentStatus);
            const isSelected = item.currentStatus === 'Selected';
            const isRejected = item.currentStatus === 'Rejected';

            return (
              <div
                key={item.drive.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition overflow-hidden"
              >
                {/* Header of card */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-extrabold text-lg flex items-center justify-center shrink-0">
                      {item.drive.company_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                          {item.drive.company_name}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {item.drive.drive_type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        Role: <strong>{item.drive.job_role}</strong> · Drive Date: {item.drive.drive_date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-700 block">
                        {item.drive.package_display || `₹${item.drive.package} LPA`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">CTC Offered</span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        isSelected
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : isRejected
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-blue-100 text-blue-800 border-blue-300'
                      }`}
                    >
                      {item.currentStatus}
                    </span>
                  </div>
                </div>

                {/* 5-Stage Stepper */}
                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
                    {STAGES.map((stage, idx) => {
                      const isPast = idx < currentStageIdx;
                      const isCurrent = idx === currentStageIdx;
                      const isPending = idx > currentStageIdx;

                      return (
                        <div
                          key={stage.key}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isCurrent
                              ? isSelected
                                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                                : 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20'
                              : isPast
                              ? 'bg-slate-50 border-slate-200'
                              : 'bg-slate-50/40 border-slate-100 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isPast || (isCurrent && isSelected)
                                  ? 'bg-emerald-600 text-white'
                                  : isCurrent
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {isPast || (isCurrent && isSelected) ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                idx + 1
                              )}
                            </span>

                            {isCurrent && (
                              <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                                ACTIVE
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-bold text-slate-900">{stage.label}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{stage.desc}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* History Log Table / Details */}
                  {item.history && item.history.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Status Change History & TPO Notes
                      </h4>
                      <div className="space-y-1.5">
                        {item.history.map((h: any) => (
                          <div
                            key={h.id}
                            className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">
                                {h.from_status ? `${h.from_status} → ` : ''}{h.to_status}
                              </span>
                              {h.remarks && (
                                <span className="text-slate-500 italic">"{h.remarks}"</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              <span>By: {h.created_by_name || 'TPO Coordinator'}</span>
                              <span>·</span>
                              <span>{new Date(h.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
