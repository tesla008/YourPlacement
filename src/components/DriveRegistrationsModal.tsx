import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Download,
  Filter,
  CheckSquare,
  Square,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';
import { PlacementDrive, DriveSelectionStatus } from '../types.ts';
import { api } from '../lib/api.ts';

interface DriveRegistrationsModalProps {
  drive: PlacementDrive | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

const ALL_STATUSES: DriveSelectionStatus[] = [
  'Registered',
  'Test Scheduled',
  'Shortlisted',
  'Interview Scheduled',
  'Selected',
  'Rejected',
  'Withdrawn',
];

export const DriveRegistrationsModal: React.FC<DriveRegistrationsModalProps> = ({
  drive,
  isOpen,
  onClose,
  onStatusUpdated,
}) => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<DriveSelectionStatus>('Test Scheduled');
  const [bulkRemarks, setBulkRemarks] = useState('');
  const [updating, setUpdating] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && drive) {
      loadRegistrations();
      setSelectedStudentIds([]);
    }
  }, [isOpen, drive]);

  const loadRegistrations = async () => {
    if (!drive) return;
    try {
      setLoading(true);
      const data = await api.getDriveRegistrations(drive.id);
      setRegistrations(data);
    } catch (err) {
      console.error('Failed to load registrations', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !drive) return null;

  const filtered = registrations.filter((r) => {
    const student = r.student;
    const matchesSearch =
      !searchQuery ||
      student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student?.roll_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student?.branch?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.selection_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === filtered.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filtered.map((r) => r.student_id));
    }
  };

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkUpdate = async () => {
    if (selectedStudentIds.length === 0) return;
    try {
      setUpdating(true);
      await api.bulkUpdateDriveStatus(drive.id, selectedStudentIds, bulkStatus, bulkRemarks);
      setToastMsg(`Successfully updated ${selectedStudentIds.length} students to "${bulkStatus}"`);
      setSelectedStudentIds([]);
      setBulkRemarks('');
      await loadRegistrations();
      if (onStatusUpdated) onStatusUpdated();
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleIndividualStatus = async (studentId: string, newStatus: string) => {
    try {
      await api.updateStudentDriveStatus(drive.id, studentId, newStatus);
      await loadRegistrations();
      if (onStatusUpdated) onStatusUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const exportRegisteredCsv = () => {
    if (registrations.length === 0) return;
    const headers = [
      'Roll Number',
      'Name',
      'Branch',
      'Batch',
      'CGPA',
      '10th %',
      '12th %',
      'Backlogs',
      'Selection Status',
      'Registered At',
    ];
    const rows = registrations.map((r) => [
      `"${r.student?.roll_number || ''}"`,
      `"${r.student?.name || ''}"`,
      `"${r.student?.branch || ''}"`,
      `"${r.student?.batch || ''}"`,
      r.student?.cgpa || '',
      r.student?.tenth_percentage || '',
      r.student?.twelfth_percentage || '',
      r.student?.active_backlogs ?? 0,
      `"${r.selection_status}"`,
      `"${r.registered_at ? new Date(r.registered_at).toLocaleDateString() : ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${drive.company_name}_Registrations_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id="drive-registrations-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div
        id="drive-registrations-modal-container"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-[#0B132B] text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  {drive.company_name} — Student Registrations
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/30 text-blue-300 border border-blue-400/30">
                  {registrations.length} Registered
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Role: {drive.job_role} · Drive Date: {drive.drive_date} · Package: {drive.package_display || `₹${drive.package} LPA`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportRegisteredCsv}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
              title="Download registered student data as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {toastMsg && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Toolbar & Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, roll no, branch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses ({registrations.length})</option>
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st} ({registrations.filter((r) => r.selection_status === st).length})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{filtered.length}</strong> candidates
          </div>
        </div>

        {/* Bulk Action Toolbar (When students are selected) */}
        {selectedStudentIds.length > 0 && (
          <div className="p-3 bg-blue-50 border-b border-blue-200 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-xs text-blue-900 font-bold">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>{selectedStudentIds.length} students selected</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-blue-800">Update Status To:</span>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value as DriveSelectionStatus)}
                className="px-2.5 py-1 text-xs bg-white border border-blue-300 rounded-lg font-bold text-slate-800"
              >
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Optional remarks / instructions"
                value={bulkRemarks}
                onChange={(e) => setBulkRemarks(e.target.value)}
                className="px-2.5 py-1 text-xs bg-white border border-blue-300 rounded-lg w-48 text-slate-800"
              />

              <button
                onClick={handleBulkUpdate}
                disabled={updating}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
              >
                {updating ? 'Updating...' : 'Apply Status'}
              </button>

              <button
                onClick={() => setSelectedStudentIds([])}
                className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Students Table */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading registered students...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No students found matching your filter criteria.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-xs text-slate-700 font-bold border-b border-slate-200 z-10">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-slate-500 hover:text-blue-600"
                      aria-label="Select all students"
                    >
                      {selectedStudentIds.length === filtered.length && filtered.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="p-3">Student Details</th>
                  <th className="p-3">Branch & Batch</th>
                  <th className="p-3 text-center">CGPA</th>
                  <th className="p-3 text-center">10th / 12th</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((reg) => {
                  const student = reg.student;
                  const isSelected = selectedStudentIds.includes(reg.student_id);

                  const getBadgeColor = (st: string) => {
                    switch (st) {
                      case 'Selected':
                        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
                      case 'Shortlisted':
                        return 'bg-blue-100 text-blue-800 border-blue-300';
                      case 'Interview Scheduled':
                        return 'bg-purple-100 text-purple-800 border-purple-300';
                      case 'Test Scheduled':
                        return 'bg-amber-100 text-amber-800 border-amber-300';
                      case 'Rejected':
                        return 'bg-rose-100 text-rose-800 border-rose-300';
                      default:
                        return 'bg-slate-100 text-slate-800 border-slate-200';
                    }
                  };

                  return (
                    <tr
                      key={reg.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isSelected ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectStudent(reg.student_id)}
                          className="text-slate-500 hover:text-blue-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{student?.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {student?.roll_number} · {student?.email}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-800 font-medium">{student?.branch}</div>
                        <div className="text-[11px] text-slate-400">Batch {student?.batch}</div>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-900">
                        {student?.cgpa?.toFixed(2) || '—'}
                      </td>
                      <td className="p-3 text-center text-slate-600 text-[11px]">
                        {student?.tenth_percentage || '—'}% / {student?.twelfth_percentage || '—'}%
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getBadgeColor(
                            reg.selection_status
                          )}`}
                        >
                          {reg.selection_status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <select
                          value={reg.selection_status}
                          onChange={(e) => handleIndividualStatus(reg.student_id, e.target.value)}
                          className="px-2 py-1 text-xs border border-slate-300 rounded-md font-semibold text-slate-700 bg-white"
                        >
                          {ALL_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Total Registered: <strong>{registrations.length}</strong> | Selected: <strong>{registrations.filter((r) => r.selection_status === 'Selected').length}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
