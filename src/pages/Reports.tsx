import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Download,
  Building,
  GraduationCap,
  Award,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';
import { api } from '../lib/api.ts';

export const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getReportsSummary()
      .then((data) => setReportData(data))
      .catch((err) => setError(err.message || 'Failed to load report summary'))
      .finally(() => setLoading(false));
  }, []);

  const handleExportAll = () => {
    window.location.href = api.getExportExcelUrl();
  };

  const handleExportPlaced = () => {
    window.location.href = api.getExportExcelUrl({ status: 'Placed' });
  };

  const handleExportUnplaced = () => {
    window.location.href = api.getExportExcelUrl({ status: 'Not Placed' });
  };

  const handleExportDept = (dept: string) => {
    window.location.href = api.getExportExcelUrl({ department: dept });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="reports-page" className="space-y-6">
      {/* Header with Export Shortcuts */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <FileBarChart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Placement Reports & In-Depth Analytics
            </h3>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Generate formal accreditation datasets, department audit matrices, and export verified records as Microsoft Excel (.xlsx) workbooks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition border border-slate-200/80 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Report</span>
          </button>
          <button
            id="export-placed-only-btn"
            onClick={handleExportPlaced}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-xs shadow-emerald-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Placed Only (.xlsx)</span>
          </button>
          <button
            id="export-all-students-btn"
            onClick={handleExportAll}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-xs shadow-blue-600/20"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export All Students (.xlsx)</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Quick Export Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:border-blue-200 transition">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">All Students</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{reportData?.stats?.totalStudents || 0} Records</p>
            <button
              onClick={handleExportAll}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 mt-2.5 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Master File (.xlsx)</span>
            </button>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:border-emerald-200 transition">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Placed Candidates</span>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">{reportData?.stats?.placedStudents || 0} Offers</p>
            <button
              onClick={handleExportPlaced}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 mt-2.5 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Placed (.xlsx)</span>
            </button>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:border-rose-200 transition">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Seeking Placement</span>
            <p className="text-2xl font-extrabold text-rose-700 mt-1">{reportData?.stats?.unplacedStudents || 0} Eligible</p>
            <button
              onClick={handleExportUnplaced}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 mt-2.5 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Unplaced (.xlsx)</span>
            </button>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Department Breakdown Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Department-wise Placement Performance Matrix
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-medium">Computed in Real-time from Student Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Total Batch</th>
                <th className="py-3.5 px-4">Placed</th>
                <th className="py-3.5 px-4">Unplaced</th>
                <th className="py-3.5 px-4">Placement Rate</th>
                <th className="py-3.5 px-4">Average Package</th>
                <th className="py-3.5 px-4">Peak Package</th>
                <th className="py-3.5 px-4 text-right">Dataset Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData?.departments ? (
                reportData.departments.map((dept: any) => (
                  <tr key={dept.department} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{dept.department}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{dept.total}</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-700">{dept.placed}</td>
                    <td className="py-3 px-4 text-rose-700 font-semibold">{dept.unplaced}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, dept.percentage)}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-slate-900">{dept.percentage}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {dept.averagePackage > 0 ? `₹${dept.averagePackage} LPA` : '—'}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-emerald-700">
                      {dept.highestPackage > 0 ? `₹${dept.highestPackage} LPA` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleExportDept(dept.department)}
                        className="px-3 py-1.5 text-xs rounded-xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 border border-blue-200/60 transition shadow-2xs"
                      >
                        Export (.xlsx)
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading department reports...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recruiter Placement Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
              <Building className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recruiter Placement & Compensation Distribution
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {reportData?.companies?.length || 0} Partner Companies
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Company Name</th>
                <th className="py-3.5 px-4">Recruits</th>
                <th className="py-3.5 px-4">Average CTC</th>
                <th className="py-3.5 px-4">Highest CTC</th>
                <th className="py-3.5 px-4">Lowest CTC</th>
                <th className="py-3.5 px-4">Designations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData?.companies ? (
                reportData.companies.map((comp: any) => (
                  <tr key={comp.company} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{comp.company}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                        {comp.count} offers
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">₹{comp.averagePackage} LPA</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-700">₹{comp.highestPackage} LPA</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">₹{comp.lowestPackage} LPA</td>
                    <td className="py-3 px-4 text-slate-500 truncate max-w-xs font-medium">
                      {comp.roles && comp.roles.length > 0 ? comp.roles.join(', ') : 'Software Engineer'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading recruiter reports...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
