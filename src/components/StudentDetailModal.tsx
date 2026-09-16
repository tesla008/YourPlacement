import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  GraduationCap,
  Briefcase,
  History,
  Mail,
  Phone,
  Building,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Edit3,
  Award,
  ArrowRight,
} from 'lucide-react';
import { Student, PlacementHistoryItem } from '../types.ts';
import { api } from '../lib/api.ts';
import { StatusBadge } from './StatusBadge.tsx';

interface StudentDetailModalProps {
  studentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenUpdateStatus: (student: Student) => void;
  onOpenEditStudent?: (student: Student) => void;
  canEditStudent?: boolean;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  studentId,
  isOpen,
  onClose,
  onOpenUpdateStatus,
  onOpenEditStudent,
  canEditStudent = false,
}) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [history, setHistory] = useState<PlacementHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !studentId) return;
    setLoading(true);
    setError(null);

    api.getStudentById(studentId)
      .then((data) => {
        setStudent(data.student);
        setHistory(data.history);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch student details');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  return (
    <div
      id="student-dossier-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        id="student-dossier-content"
        className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200/90 my-8 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-5 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-blue-600/20">
              {student?.name ? student.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-xl font-bold text-slate-900">{student?.name || 'Student Dossier'}</h3>
                {student && <StatusBadge status={student.placement_status} size="sm" />}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                ID: <strong className="text-slate-700 font-mono">{student?.student_id}</strong> • Roll: <strong className="text-slate-700 font-mono">{student?.roll_number}</strong> • Batch <strong className="text-slate-700">{student?.batch}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEditStudent && student && onOpenEditStudent && (
              <button
                id="edit-student-profile-btn"
                onClick={() => {
                  onClose();
                  onOpenEditStudent(student);
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl flex items-center gap-1.5 transition border border-slate-200/60"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close dossier"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500 text-xs font-semibold flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Retrieving academic records and placement logs...</span>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-rose-600 text-xs font-medium">{error}</div>
        ) : student ? (
          <div className="flex-1 overflow-y-auto space-y-6 pt-5 pr-1">
            {/* Quick Status Action Ribbon */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-blue-50/90 to-indigo-50/70 rounded-2xl border border-blue-100/90 gap-3">
              <div>
                <span className="text-xs font-bold text-blue-900">Current Status: </span>
                <span className="text-xs font-extrabold text-blue-950">{student.placement_status}</span>
                {student.company && (
                  <span className="text-xs text-blue-800 ml-1.5 font-bold">
                    • {student.company} {student.package ? `(₹${student.package} LPA)` : ''}
                  </span>
                )}
              </div>
              <button
                id="dossier-update-status-btn"
                onClick={() => {
                  onClose();
                  onOpenUpdateStatus(student);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-blue-500/20 flex items-center justify-center gap-1.5 transition shrink-0"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Update Placement Status</span>
              </button>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Academic & Personal Card */}
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Academic Record</span>
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Department</span>
                    <span className="font-bold text-slate-800">{student.department}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Specialization / Branch</span>
                    <span className="font-bold text-slate-800">{student.branch}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Graduation Batch</span>
                    <span className="font-bold text-slate-800">{student.batch}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Cumulative CGPA</span>
                    <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/70">
                      {student.cgpa.toFixed(2)} / 10.0
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">10th (Secondary) %</span>
                    <span className="font-bold text-slate-800">{student.tenth_percentage || '-'}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">12th (Higher Sec) %</span>
                    <span className="font-bold text-slate-800">{student.twelfth_percentage || '-'}%</span>
                  </div>
                  {student.diploma_percentage && (
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 font-medium">Diploma %</span>
                      <span className="font-bold text-slate-800">{student.diploma_percentage}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Placement Details Card */}
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>Placement Outcome</span>
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60 items-center">
                    <span className="text-slate-500 font-medium">Placement Status</span>
                    <StatusBadge status={student.placement_status} size="sm" />
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Recruiter Company</span>
                    <span className="font-extrabold text-slate-900">{student.company || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Job Role Designation</span>
                    <span className="font-bold text-slate-800">{student.job_role || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">CTC Package</span>
                    <span className="font-extrabold text-emerald-700">
                      {student.package ? `₹${student.package} LPA` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Recruitment Mode</span>
                    <span className="font-bold text-slate-800">{student.placement_type || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Base Location</span>
                    <span className="font-bold text-slate-800">{student.location || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Offer Date</span>
                    <span className="font-bold text-slate-800">{student.placement_date || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-600" />
                <span>Contact Channels</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="flex items-center gap-2.5 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold truncate">{student.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold">{student.phone}</span>
                </div>
              </div>
            </div>

            {/* Change History / Audit Trail */}
            <div className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
              <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Placement Status Logs ({history.length})
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Audit Log</span>
              </div>

              {history.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No status modifications recorded yet for this student.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {history.map((item) => (
                    <div key={item.id} className="p-4 text-xs hover:bg-slate-50/60 transition">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-500">
                            {item.previous_status || 'Initial Creation'}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <StatusBadge status={item.new_status} size="sm" />
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" />
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 mt-1">
                        <div>
                          {item.company && (
                            <span className="font-bold text-slate-900">
                              {item.company} {item.package ? `(₹${item.package} LPA)` : ''}
                            </span>
                          )}
                          {item.remarks && (
                            <span className="text-slate-500 italic ml-2">"{item.remarks}"</span>
                          )}
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold border border-slate-200/60">
                          {item.updated_by} ({item.updated_by_role})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

