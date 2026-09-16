import * as XLSX from 'xlsx';
import { Student, ExcelPreviewResponse, ExcelValidationError } from '../src/types.ts';
import { db } from './db.ts';

// Field mapping dictionary for smart column detection
const FIELD_SYNONYMS: Record<string, string[]> = {
  student_id: ['student id', 'studentid', 'student_id', 'id', 'enrollment id', 'stud id', 'sid'],
  roll_number: ['roll no', 'roll number', 'roll_no', 'rollno', 'roll', 'registration no', 'reg no'],
  enrollment_number: ['enrollment number', 'enrollment no', 'enrollment_no', 'enrolment no', 'prn', 'enrolment number'],
  name: ['name', 'student name', 'student_name', 'full name', 'fullname', 'candidate name'],
  email: ['email', 'email id', 'email_id', 'student email', 'mail', 'email address'],
  phone: ['phone', 'mobile', 'mobile no', 'phone number', 'contact', 'contact no', 'contact number', 'phone_number'],
  department: ['department', 'dept', 'branch', 'stream', 'discipline', 'course'],
  branch: ['branch', 'specialization', 'sub-branch', 'stream'],
  batch: ['batch', 'passout year', 'passing year', 'year', 'graduation year'],
  cgpa: ['cgpa', 'gpa', 'pointer', 'aggregate cgpa', 'current cgpa'],
  tenth_percentage: ['10th %', '10th percentage', 'tenth percentage', '10th', 'ssc %', 'ssc'],
  twelfth_percentage: ['12th %', '12th percentage', 'twelfth percentage', '12th', 'hsc %', 'hsc'],
  diploma_percentage: ['diploma %', 'diploma percentage', 'diploma'],
  placement_status: ['placement status', 'status', 'placed status'],
  company: ['company', 'company name', 'recruiter', 'placed in', 'organization'],
  job_role: ['job role', 'role', 'designation', 'profile'],
  package: ['package', 'ctc', 'package (lpa)', 'ctc (lpa)', 'package in lpa', 'salary'],
};

export function autoDetectColumnMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  for (const header of headers) {
    const normalized = header.toLowerCase().trim().replace(/[_\-]/g, ' ');
    for (const [canonicalField, synonyms] of Object.entries(FIELD_SYNONYMS)) {
      if (synonyms.some((s) => normalized === s || normalized.includes(s))) {
        mapping[header] = canonicalField;
        break;
      }
    }
  }

  return mapping;
}

export function parseAndValidateWorkbook(
  buffer: Buffer,
  customMapping?: Record<string, string>
): ExcelPreviewResponse {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('The uploaded Excel file contains no worksheets.');
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (rawRows.length === 0) {
    throw new Error('The uploaded worksheet is empty.');
  }

  const detectedHeaders = Object.keys(rawRows[0] || {});
  const mapping = customMapping && Object.keys(customMapping).length > 0
    ? customMapping
    : autoDetectColumnMapping(detectedHeaders);

  const errors: ExcelValidationError[] = [];
  const validParsedStudents: Partial<Student>[] = [];

  const seenStudentIds = new Set<string>();
  const seenRollNumbers = new Set<string>();

  // Fetch all existing students from DB for duplicate detection
  const existingStudents = db.getStudents({ limit: 10000 }).students;
  const existingStudentIds = new Set(existingStudents.map((s) => s.student_id.toLowerCase()));
  const existingRolls = new Set(existingStudents.map((s) => s.roll_number.toLowerCase()));

  let duplicateCount = 0;

  rawRows.forEach((row, index) => {
    const rowNumber = index + 2; // header is row 1
    const mapped: Record<string, any> = {};

    for (const [excelCol, appField] of Object.entries(mapping)) {
      if (row[excelCol] !== undefined && row[excelCol] !== '') {
        mapped[appField] = row[excelCol];
      }
    }

    // Skip purely empty rows
    const hasAnyData = Object.values(mapped).some((v) => String(v).trim() !== '');
    if (!hasAnyData) return;

    let hasRowError = false;

    // Validate Student ID
    const studentId = mapped.student_id ? String(mapped.student_id).trim() : '';
    if (!studentId) {
      errors.push({
        row: rowNumber,
        field: 'student_id',
        message: 'Missing required Student ID.',
      });
      hasRowError = true;
    } else {
      if (seenStudentIds.has(studentId.toLowerCase())) {
        errors.push({
          row: rowNumber,
          studentId,
          field: 'student_id',
          message: `Duplicate Student ID '${studentId}' found in this spreadsheet.`,
        });
        hasRowError = true;
      } else if (existingStudentIds.has(studentId.toLowerCase())) {
        duplicateCount++;
      }
      seenStudentIds.add(studentId.toLowerCase());
    }

    // Validate Roll Number
    const rollNumber = mapped.roll_number ? String(mapped.roll_number).trim() : '';
    if (!rollNumber) {
      errors.push({
        row: rowNumber,
        studentId,
        field: 'roll_number',
        message: 'Missing required Roll Number.',
      });
      hasRowError = true;
    } else {
      if (seenRollNumbers.has(rollNumber.toLowerCase())) {
        errors.push({
          row: rowNumber,
          studentId,
          rollNumber,
          field: 'roll_number',
          message: `Duplicate Roll Number '${rollNumber}' found in this spreadsheet.`,
        });
        hasRowError = true;
      } else if (existingRolls.has(rollNumber.toLowerCase())) {
        duplicateCount++;
      }
      seenRollNumbers.add(rollNumber.toLowerCase());
    }

    // Validate Name
    const name = mapped.name ? String(mapped.name).trim() : '';
    if (!name) {
      errors.push({
        row: rowNumber,
        studentId,
        field: 'name',
        message: 'Missing student Name.',
      });
      hasRowError = true;
    }

    // Validate Email
    const email = mapped.email ? String(mapped.email).trim() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errors.push({
        row: rowNumber,
        studentId,
        name,
        field: 'email',
        message: `Invalid email address format: '${email}'.`,
      });
      hasRowError = true;
    }

    // Validate CGPA
    let cgpa = 7.0;
    if (mapped.cgpa !== undefined && mapped.cgpa !== '') {
      cgpa = parseFloat(String(mapped.cgpa));
      if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
        errors.push({
          row: rowNumber,
          studentId,
          name,
          field: 'cgpa',
          message: `Invalid CGPA '${mapped.cgpa}'. CGPA must be a decimal between 0.00 and 10.00.`,
        });
        hasRowError = true;
      }
    }

    // Department fallback
    const department = mapped.department ? String(mapped.department).trim() : 'Computer Technology';
    const batch = mapped.batch ? String(mapped.batch).trim() : '2027';

    if (!hasRowError) {
      validParsedStudents.push({
        student_id: studentId,
        roll_number: rollNumber,
        enrollment_number: mapped.enrollment_number ? String(mapped.enrollment_number).trim() : `EN_${studentId}`,
        name,
        email: email || `${studentId.toLowerCase()}@college.edu`,
        phone: mapped.phone ? String(mapped.phone).trim() : '+91 9999999999',
        department,
        branch: mapped.branch ? String(mapped.branch).trim() : department,
        batch,
        cgpa,
        tenth_percentage: mapped.tenth_percentage ? parseFloat(String(mapped.tenth_percentage)) : 75.0,
        twelfth_percentage: mapped.twelfth_percentage ? parseFloat(String(mapped.twelfth_percentage)) : 75.0,
        diploma_percentage: mapped.diploma_percentage ? parseFloat(String(mapped.diploma_percentage)) : null,
        placement_status: mapped.placement_status || 'Not Placed',
        company: mapped.company || null,
        job_role: mapped.job_role || null,
        package: mapped.package ? parseFloat(String(mapped.package)) : null,
      });
    }
  });

  return {
    totalDetected: rawRows.length,
    validCount: validParsedStudents.length,
    errorCount: errors.length,
    duplicateCount,
    sampleRows: validParsedStudents.slice(0, 50),
    errors,
    detectedColumns: detectedHeaders,
    columnMapping: mapping,
  };
}

export function generateTemplateBuffer(): Buffer {
  const sampleData = [
    {
      'Student ID': 'STU2001',
      'Roll Number': '2023CS099',
      'Enrollment Number': 'EN2023CS199',
      'Student Name': 'Rohan Sharma',
      'Email': 'rohan.sharma@college.edu',
      'Phone': '+91 9876543210',
      'Department': 'Computer Technology',
      'Branch': 'Computer Engineering',
      'Batch': '2027',
      'CGPA': 8.45,
      '10th %': 88.5,
      '12th %': 84.0,
      'Placement Status': 'Not Placed',
    },
    {
      'Student ID': 'STU2002',
      'Roll Number': '2023IT099',
      'Enrollment Number': 'EN2023IT199',
      'Student Name': 'Ananya Verma',
      'Email': 'ananya.verma@college.edu',
      'Phone': '+91 9876543211',
      'Department': 'Information Technology',
      'Branch': 'Information Technology',
      'Batch': '2027',
      'CGPA': 9.12,
      '10th %': 92.0,
      '12th %': 89.5,
      'Placement Status': 'Placed',
      'Company': 'Deloitte',
      'Job Role': 'Analyst',
      'Package (LPA)': 8.5,
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Students_Template');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

export function generateExportBuffer(students: Student[], sheetTitle = 'Students'): Buffer {
  const exportData = students.map((s) => ({
    'Student ID': s.student_id,
    'Roll Number': s.roll_number,
    'Enrollment Number': s.enrollment_number,
    'Name': s.name,
    'Email': s.email,
    'Phone': s.phone,
    'Department': s.department,
    'Branch': s.branch,
    'Batch': s.batch,
    'CGPA': s.cgpa,
    '10th %': s.tenth_percentage,
    '12th %': s.twelfth_percentage,
    'Placement Status': s.placement_status,
    'Company': s.company || '-',
    'Job Role': s.job_role || '-',
    'Package (LPA)': s.package || '-',
    'Placement Date': s.placement_date || '-',
    'Placement Type': s.placement_type || '-',
    'Location': s.location || '-',
    'Updated By': s.updated_by || '-',
    'Last Updated': s.updated_at ? s.updated_at.split('T')[0] : '-',
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetTitle.substring(0, 31));
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
