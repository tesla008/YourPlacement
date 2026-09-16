import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  Download,
  Trash2,
  Edit2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Eye,
  Building2,
  X,
  UploadCloud,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Student, PlacementStatus } from '../types.ts';
import { api } from '../lib/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { ConfirmationDialog } from '../components/ConfirmationDialog.tsx';

interface StudentsPageProps {
  onOpenAddStudent: () => void;
  onOpenEditStudent: (student: Student) => void;
  onOpenUpdateStatus: (student: Student) => void;
  onOpenViewStudent: (studentId: string) => void;
  onNavigateImport: () => void;
}

const DEPARTMENTS = [
  'All',
  'Computer Technology',
  'Information Technology',
  'Electronics & Telecommunication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

export const Students: React.FC<StudentsPageProps> = ({
  onOpenAddStudent,
  onOpenEditStudent,
  onOpenUpdateStatus,
  onOpenViewStudent,
  onNavigateImport,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Filters State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('All');
  const [department, setDepartment] = useState<string>(
    !isAdmin && user?.department ? user.department : 'All'
  );
  const [batch, setBatch] = useState<string>('All');
  const [minCgpa, setMinCgpa] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(15);

  // Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Delete modal state
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getStudents({
        search: search.trim() || undefined,
        status: status !== 'All' ? status : undefined,
        department: department !== 'All' ? department : undefined,
        batch: batch !== 'All' ? batch : undefined,
        minCgpa: minCgpa ? parseFloat(minCgpa) : undefined,
        company: company.trim() || undefined,
        page,
        limit,
      });
      setStudents(res.students);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, status, department, batch, minCgpa, company, page, limit, user]);

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    setDeleteLoading(true);
    try {
      await api.deleteStudent(studentToDelete.id);
      setStudentToDelete(null);
      fetchStudents();
    } catch (err: any) {
      alert(err.message || 'Failed to delete student');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportExcel = () => {
    const url = api.getExportExcelUrl({
      status: status !== 'All' ? status : undefined,
      department: department !== 'All' ? department : undefined,
      batch: batch !== 'All' ? batch : undefined,
      company: company.trim() || undefined,
    });
    window.location.href = url;
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('All');
    if (isAdmin) setDepartment('All');
    setBatch('All');
    setMinCgpa('');
    setCompany('');
    setPage(1);
  };

  const activeFiltersCount =
    (status !== 'All' ? 1 : 0) +
    (department !== 'All' ? 1 : 0) +
    (batch !== 'All' ? 1 : 0) +
    (minCgpa ? 1 : 0) +
    (company ? 1 : 0) +
    (search ? 1 : 0);

  return (
    <div id="students-page" className="space-y-5">
      {/* Coordinator banner if scoped */}
      {!isAdmin && user?.department && (
        <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-4 flex items-center justify-between text-xs text-blue-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-600 text-white shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <span>
              Restricted to <strong className="font-bold text-blue-950">{user.department}</strong> students. Authorized to modify placement status and recruiter data.
            </span>
          </div>
          <span className="font-bold text-blue-700 px-2.5 py-1 rounded-full bg-white border border-blue-200 shrink-0">
            {total} Students in Scope
          </span>
        </div>
      )}

      {/* Main Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Top actions line */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Universal Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              id="student-search-input"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by student name, roll number, ID, recruiter..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300/90 bg-slate-50/50 hover:bg-white focus:bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="export-excel-btn"
              onClick={handleExportExcel}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl flex items-center gap-1.5 transition border border-slate-200/60"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export (.xlsx)</span>
            </button>

            {isAdmin && (
              <>
                <button
                  id="import-students-btn"
                  onClick={onNavigateImport}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl flex items-center gap-1.5 transition border border-slate-200/60"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                  <span>Import Excel</span>
                </button>

                <button
                  id="add-student-btn"
                  onClick={onOpenAddStudent}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 transition shadow-xs shadow-blue-500/20"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Student</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Status filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              id="filter-status-select"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-300/90 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="All">All Statuses</option>
              <option value="Placed">Placed</option>
              <option value="Not Placed">Not Placed</option>
              <option value="Higher Studies">Higher Studies</option>
              <option value="Not Interested">Not Interested</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Department
            </label>
            {isAdmin ? (
              <select
                id="filter-dept-select"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-300/90 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition truncate"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            ) : (
              <input
                disabled
                value={user?.department || 'Department'}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs text-slate-600 truncate font-semibold"
              />
            )}
          </div>

          {/* Batch Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Batch
            </label>
            <select
              id="filter-batch-select"
              value={batch}
              onChange={(e) => {
                setBatch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-300/90 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="All">All Batches</option>
              <option value="2027">Batch 2027</option>
              <option value="2026">Batch 2026</option>
              <option value="2025">Batch 2025</option>
              <option value="2028">Batch 2028</option>
            </select>
          </div>

          {/* Min CGPA Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Min CGPA
            </label>
            <input
              id="filter-min-cgpa"
              type="number"
              step="0.1"
              min="0"
              max="10"
              placeholder="e.g. 7.5"
              value={minCgpa}
              onChange={(e) => {
                setMinCgpa(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-300/90 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Company Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Recruiter
            </label>
            <input
              id="filter-company-input"
              type="text"
              placeholder="e.g. TCS, Deloitte"
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-300/90 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              disabled={activeFiltersCount === 0}
              className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                activeFiltersCount > 0
                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Reset</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900 font-bold">{students.length}</strong> of{' '}
            <strong className="text-slate-900 font-bold">{total}</strong> students
          </span>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(1);
              }}
              className="rounded-lg border border-slate-200/90 px-2.5 py-1 text-xs bg-slate-50 text-slate-800 font-bold"
            >
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table id="students-table" className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Student ID & Roll</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Batch</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Recruiter & Package</th>
                <th className="py-3 px-4">Offer Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold">Loading student directory...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <GraduationCap className="w-8 h-8 text-slate-300" />
                      <p className="text-xs font-bold text-slate-700">No students found</p>
                      <p className="text-[11px] text-slate-400">No student records match the active search or filter criteria.</p>
                      <button
                        onClick={resetFilters}
                        className="mt-2 px-3 py-1 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const initials = student.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2);

                  return (
                    <tr
                      key={student.id}
                      id={`student-row-${student.id}`}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      {/* Student ID & Roll */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-extrabold text-blue-700 text-xs">{student.student_id}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{student.roll_number}</div>
                      </td>

                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{student.name}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{student.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap font-medium">
                        <span>{student.department.replace('Engineering', 'Engg')}</span>
                      </td>

                      {/* Batch */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 font-mono text-[11px] font-semibold text-slate-700 border border-slate-200/80">
                          {student.batch}
                        </span>
                      </td>

                      {/* CGPA */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`font-extrabold text-xs px-2 py-0.5 rounded-md ${
                            student.cgpa >= 8.5
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                              : student.cgpa >= 7.0
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {student.cgpa.toFixed(2)}
                        </span>
                      </td>

                      {/* Placement Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={student.placement_status} size="sm" />
                      </td>

                      {/* Company & Package */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {student.placement_status === 'Placed' && student.company ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900 text-xs">{student.company}</span>
                              {student.package && (
                                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  ₹{student.package} LPA
                                </span>
                              )}
                            </div>
                            {student.job_role && (
                              <div className="text-[10px] text-slate-500 font-medium">{student.job_role}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300 font-medium">—</span>
                        )}
                      </td>

                      {/* Placement Date */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px] font-medium">
                        {student.placement_date || '—'}
                      </td>

                      {/* Row Action Buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Dossier Button */}
                          <button
                            id={`view-student-${student.id}`}
                            onClick={() => onOpenViewStudent(student.id)}
                            title="View Student Dossier"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition border border-transparent hover:border-blue-200"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Update Status Button */}
                          <button
                            id={`update-status-${student.id}`}
                            onClick={() => onOpenUpdateStatus(student)}
                            title="Update Placement Offer / Status"
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1 transition border border-blue-200/60 shadow-2xs"
                          >
                            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                            <span>Status</span>
                          </button>

                          {/* Edit Student Button (Admin only) */}
                          {isAdmin && (
                            <button
                              id={`edit-student-${student.id}`}
                              onClick={() => onOpenEditStudent(student)}
                              title="Edit Student Information"
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition border border-transparent hover:border-slate-200"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete Student Button (Admin only) */}
                          {isAdmin && (
                            <button
                              id={`delete-student-${student.id}`}
                              onClick={() => setStudentToDelete(student)}
                              title="Delete Student Record"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition border border-transparent hover:border-rose-200"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Page <strong className="text-slate-900 font-bold">{page}</strong> of{' '}
              <strong className="text-slate-900 font-bold">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                id="pagination-prev"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, page - 3), page + 2)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition ${
                      p === page
                        ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              <button
                id="pagination-next"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={Boolean(studentToDelete)}
        title="Delete Student Record"
        message={`Are you sure you want to permanently remove ${studentToDelete?.name} (${studentToDelete?.roll_number}) from the placement database? All placement logs and history associated with this student will also be removed.`}
        confirmText="Delete Student"
        cancelText="Keep Student"
        variant="danger"
        isLoading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setStudentToDelete(null)}
      />
    </div>
  );
};

