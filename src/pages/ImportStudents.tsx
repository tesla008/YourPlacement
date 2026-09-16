import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  RefreshCw,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ExcelPreviewResponse, ImportLog } from '../types.ts';
import { api } from '../lib/api.ts';

interface ImportStudentsProps {
  onImportComplete?: () => void;
}

const CANONICAL_FIELDS: { key: string; label: string; required: boolean }[] = [
  { key: 'student_id', label: 'Student ID', required: true },
  { key: 'roll_number', label: 'Roll Number', required: true },
  { key: 'name', label: 'Full Name', required: true },
  { key: 'email', label: 'Email Address', required: false },
  { key: 'phone', label: 'Phone Number', required: false },
  { key: 'department', label: 'Department', required: false },
  { key: 'branch', label: 'Branch / Stream', required: false },
  { key: 'batch', label: 'Batch / Year', required: false },
  { key: 'cgpa', label: 'CGPA', required: false },
  { key: 'tenth_percentage', label: '10th %', required: false },
  { key: 'twelfth_percentage', label: '12th %', required: false },
  { key: 'placement_status', label: 'Placement Status', required: false },
  { key: 'company', label: 'Company', required: false },
  { key: 'job_role', label: 'Job Role', required: false },
  { key: 'package', label: 'Package (LPA)', required: false },
];

export const ImportStudents: React.FC<ImportStudentsProps> = ({ onImportComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<ExcelPreviewResponse | null>(null);
  const [customMapping, setCustomMapping] = useState<Record<string, string>>({});
  const [duplicateAction, setDuplicateAction] = useState<'skip' | 'update' | 'new'>('skip');
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pastLogs, setPastLogs] = useState<ImportLog[]>([]);

  const loadLogs = async () => {
    try {
      const logs = await api.getImportLogs();
      setPastLogs(logs);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleFileChange = (file: File) => {
    setErrorMessage(null);
    setImportSuccess(null);
    setPreviewData(null);

    if (!file.name.endsWith('.xlsx')) {
      setErrorMessage('Unsupported file format. Please upload an Excel workbook (.xlsx).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 15MB limit.');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setFileBase64(base64);
      parseFile(base64, {});
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file.');
    };
    reader.readAsDataURL(file);
  };

  const parseFile = async (base64: string, mapping: Record<string, string>) => {
    setPreviewLoading(true);
    setErrorMessage(null);
    try {
      const preview = await api.previewExcel(base64, mapping);
      setPreviewData(preview);
      setCustomMapping(preview.columnMapping);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse Excel file');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleMappingChange = (excelHeader: string, appField: string) => {
    const updated = { ...customMapping, [excelHeader]: appField };
    setCustomMapping(updated);
    if (fileBase64) {
      parseFile(fileBase64, updated);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData || !previewData.sampleRows) return;
    setImporting(true);
    setErrorMessage(null);
    try {
      const res = await api.confirmImport(
        previewData.sampleRows,
        duplicateAction,
        selectedFile?.name || 'students.xlsx'
      );
      setImportSuccess(res.message);
      setPreviewData(null);
      setSelectedFile(null);
      setFileBase64(null);
      loadLogs();
      if (onImportComplete) onImportComplete();
    } catch (err: any) {
      setErrorMessage(err.message || 'Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const downloadErrorReport = () => {
    if (!previewData || previewData.errors.length === 0) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Row,Student ID,Roll Number,Field,Error Description']
        .concat(
          previewData.errors.map(
            (e) => `${e.row},"${e.studentId || ''}","${e.rollNumber || ''}","${e.field}","${e.message}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Import_Errors_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="import-students-page" className="space-y-6">
      {/* Header Banner & Template Download */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Excel Student Upload & Smart Importer
            </h3>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Bulk ingest student master records or update placement details from an Excel workbook (.xlsx). Smart validation maps column headers and catches data anomalies before commit.
          </p>
        </div>
        <a
          id="download-template-link"
          href={api.downloadTemplateUrl()}
          download="Students_Import_Template.xlsx"
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold flex items-center gap-2 transition shrink-0 border border-slate-200/80 shadow-2xs"
        >
          <Download className="w-4 h-4 text-blue-600" />
          <span>Download Sample Template (.xlsx)</span>
        </a>
      </div>

      {importSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 font-medium shadow-2xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{importSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 font-medium shadow-2xs animate-in fade-in duration-200">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        id="excel-drop-zone"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
          }
        }}
        className={`rounded-3xl border-2 border-dashed p-10 text-center transition-all bg-white cursor-pointer shadow-xs ${
          dragOver
            ? 'border-blue-500 bg-blue-50/40 ring-4 ring-blue-500/10'
            : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50/50'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />

        <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50/80 text-blue-600 flex items-center justify-center mb-4 border border-blue-100 shadow-xs">
          <FileSpreadsheet className="w-8 h-8" />
        </div>

        <h4 className="text-base font-bold text-slate-900 tracking-tight">
          {selectedFile ? selectedFile.name : 'Click to select or drag & drop student Excel file'}
        </h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Compatible with standard Microsoft Excel (.xlsx) files up to 15MB.
        </p>

        <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-500/20 transition">
          <UploadCloud className="w-4 h-4" />
          <span>{selectedFile ? 'Choose Different File' : 'Browse Local Files'}</span>
        </div>
      </div>

      {/* Loading Spinner */}
      {previewLoading && (
        <div className="py-14 bg-white rounded-2xl border border-slate-200/90 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2.5 shadow-xs">
          <RefreshCw className="w-7 h-7 text-blue-600 animate-spin" />
          <span className="font-semibold text-slate-700">Reading Excel sheet structure & evaluating data constraints...</span>
        </div>
      )}

      {/* Validation Results & Preview Section */}
      {previewData && !previewLoading && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Integrity Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Rows
              </span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                {previewData.totalDetected}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ready for Ingestion</span>
              </span>
              <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
                {previewData.validCount}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                Existing Duplicates
              </span>
              <span className="text-2xl font-extrabold text-amber-700 mt-1 block">
                {previewData.duplicateCount}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Invalid Records</span>
              </span>
              <span className="text-2xl font-extrabold text-rose-700 mt-1 block">
                {previewData.errorCount}
              </span>
            </div>
          </div>

          {/* Smart Column Mapping Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Automatic Header Mapping
                </h4>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Verify auto-detected Excel headers map directly to student database fields
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
              {previewData.detectedColumns.map((col) => {
                const currentMappedField = customMapping[col] || '';
                return (
                  <div
                    key={col}
                    className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <span className="text-xs font-bold text-slate-800 truncate" title={col}>
                      "{col}"
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <select
                      value={currentMappedField}
                      onChange={(e) => handleMappingChange(col, e.target.value)}
                      className="text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                    >
                      <option value="">-- Ignore column --</option>
                      {CANONICAL_FIELDS.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.label} {f.required ? '*' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Validation Errors Table (if any) */}
          {previewData.errors.length > 0 && (
            <div className="bg-white rounded-2xl border border-rose-200 shadow-xs overflow-hidden">
              <div className="bg-rose-50/80 px-5 py-3.5 border-b border-rose-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Validation Issues Detected ({previewData.errors.length})
                  </h4>
                </div>
                <button
                  id="download-error-report-btn"
                  onClick={downloadErrorReport}
                  className="px-3 py-1.5 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Error Log (.csv)</span>
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs">
                {previewData.errors.slice(0, 15).map((err, i) => (
                  <div key={i} className="p-3.5 flex items-center justify-between hover:bg-rose-50/40">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-500 font-semibold">Row {err.row}</span>
                      {err.studentId && (
                        <span className="font-bold text-slate-800 font-mono">[{err.studentId}]</span>
                      )}
                      <span className="text-rose-700 font-medium">{err.message}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-semibold border border-slate-200/60">
                      {err.field}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* First 20 Valid Rows Preview Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Parsed Student Records (First {Math.min(20, previewData.sampleRows.length)} rows)
              </h4>
              <span className="text-xs text-slate-500 font-medium">
                Verified {previewData.validCount} valid records
              </span>
            </div>

            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 sticky top-0 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Batch</th>
                    <th className="py-3 px-4">CGPA</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewData.sampleRows.slice(0, 20).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-4 font-bold text-blue-700 font-mono">{row.student_id}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">{row.roll_number}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{row.name}</td>
                      <td className="py-2.5 px-4 text-slate-600">{row.department}</td>
                      <td className="py-2.5 px-4 text-slate-600 font-medium">{row.batch}</td>
                      <td className="py-2.5 px-4 font-extrabold text-slate-800">{row.cgpa}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-semibold border border-slate-200/60">
                          {row.placement_status || 'Not Placed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Import Action Controls */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Duplicate Handling Strategy
              </label>
              <div className="flex flex-wrap items-center gap-5 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="duplicateAction"
                    value="skip"
                    checked={duplicateAction === 'skip'}
                    onChange={() => setDuplicateAction('skip')}
                    className="text-blue-600 accent-blue-600"
                  />
                  <span className="text-slate-800 font-bold">Skip Duplicates (Recommended)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="duplicateAction"
                    value="update"
                    checked={duplicateAction === 'update'}
                    onChange={() => setDuplicateAction('update')}
                    className="text-blue-600 accent-blue-600"
                  />
                  <span className="text-slate-700 font-medium">Update Existing Student Records</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setPreviewData(null);
                  setSelectedFile(null);
                }}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>

              <button
                id="confirm-import-btn"
                type="button"
                onClick={handleConfirmImport}
                disabled={importing || previewData.validCount === 0}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs shadow-blue-500/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {importing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Ingesting {previewData.validCount} Records...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Confirm & Ingest {previewData.validCount} Students</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Past Import Logs History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Batch Ingestion Audit Trail
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-medium">{pastLogs.length} previous batches completed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Filename</th>
                <th className="py-3 px-4">Total Rows</th>
                <th className="py-3 px-4">Successful</th>
                <th className="py-3 px-4">Duplicates Skipped</th>
                <th className="py-3 px-4">Uploaded By</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pastLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No past import logs recorded.
                  </td>
                </tr>
              ) : (
                pastLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{log.filename}</td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">{log.total_rows}</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-700">{log.successful}</td>
                    <td className="py-3 px-4 text-amber-700 font-medium">{log.skipped}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{log.imported_by}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        {log.status}
                      </span>
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
