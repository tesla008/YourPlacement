export type UserRole = 'admin' | 'coordinator' | 'student';

export type AppMode = 'tpo' | 'student';

export type PlacementStatus =
  | 'Not Placed'
  | 'Placed'
  | 'Higher Studies'
  | 'Not Interested'
  | 'Other';

export type PlacementType =
  | 'On Campus'
  | 'Off Campus'
  | 'Pool Campus'
  | 'Referral'
  | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string | null; // e.g. "Computer Technology" or null for admin (all)
  batch: string | null; // e.g. "2027" or null for admin (all)
  student_id?: string | null; // STU1001 for students
  is_active: boolean;
  created_at: string;
}

export interface Student {
  id: string;
  student_id: string; // STU1001
  roll_number: string; // 2023CS001
  enrollment_number: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  branch: string;
  batch: string; // 2027
  cgpa: number;
  tenth_percentage: number;
  twelfth_percentage: number;
  diploma_percentage?: number | null;
  active_backlogs?: number;
  placement_status: PlacementStatus;
  company?: string | null;
  job_role?: string | null;
  package?: number | null; // In LPA (e.g. 8.5)
  placement_date?: string | null; // YYYY-MM-DD
  placement_type?: PlacementType | null;
  location?: string | null;
  remarks?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string | null;
  description?: string | null;
  industry?: string | null;
  website?: string | null;
  created_at: string;
}

export type DriveType = 'On Campus' | 'Off Campus' | 'Pool Campus' | 'Online';

export type DriveStatus = 'Upcoming' | 'Applications Open' | 'Deadline Passed' | 'Drive Completed';

export interface EligibilityCriteria {
  id: string;
  drive_id: string;
  minimum_cgpa: number;
  minimum_10th_marks: number;
  minimum_12th_marks: number;
  maximum_backlogs: number;
  eligible_branches: string[];
  eligible_batches: string[];
}

export interface PlacementDrive {
  id: string;
  company_id: string;
  company_name: string;
  company_logo?: string | null;
  company_industry?: string | null;
  job_role: string;
  package: number | string; // e.g. 7.2 or "6-8"
  package_display: string; // "₹7.2 LPA"
  location: string;
  drive_date: string; // "2026-09-25"
  drive_time?: string | null; // "09:30 AM"
  application_deadline: string; // "2026-09-22"
  venue: string; // "Seminar Hall & Lab 3"
  drive_type: DriveType;
  openings: number;
  status: DriveStatus;
  description: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  eligibility: EligibilityCriteria;
  stats?: {
    eligibleCount: number;
    registeredCount: number;
    shortlistedCount: number;
    selectedCount: number;
  };
}

export type DriveRegistrationStatus = 'Interested' | 'Applied' | 'Registered';

export type DriveSelectionStatus =
  | 'Eligible'
  | 'Not Eligible'
  | 'Interested'
  | 'Applied'
  | 'Registered'
  | 'Test Scheduled'
  | 'Interview Scheduled'
  | 'Shortlisted'
  | 'Selected'
  | 'Rejected'
  | 'Withdrawn'
  | 'Drive Completed';

export interface DriveRegistration {
  id: string;
  drive_id: string;
  student_id: string;
  registration_status: DriveRegistrationStatus;
  selection_status: DriveSelectionStatus;
  registered_at: string;
  updated_at: string;
  remarks?: string | null;
}

export interface DriveStatusHistoryItem {
  id: string;
  drive_id: string;
  student_id: string;
  student_name?: string;
  company_name?: string;
  previous_status: string;
  new_status: string;
  changed_by: string;
  changed_at: string;
}

export interface StudentNotification {
  id: string;
  student_id: string;
  title: string;
  message: string;
  drive_id?: string | null;
  type: 'drive' | 'deadline' | 'status_update' | 'selection' | 'test';
  is_read: boolean;
  created_at: string;
}

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
}

export interface PlacementHistoryItem {
  id: string;
  student_id: string;
  student_name: string;
  roll_number: string;
  previous_status: PlacementStatus | string;
  new_status: PlacementStatus;
  company?: string | null;
  package?: number | null;
  changed_by: string;
  changed_by_role: UserRole;
  changed_at: string;
  remarks?: string | null;
}

export interface CoordinatorAccount {
  id: string;
  user_id: string;
  name: string;
  email: string;
  department: string;
  batch: string;
  is_active: boolean;
  created_at: string;
}

export interface ImportLog {
  id: string;
  filename: string;
  total_records: number;
  successful_records: number;
  failed_records: number;
  duplicate_action: 'skip' | 'update' | 'new';
  imported_by: string;
  imported_at: string;
  errors_summary?: string | null;
}

export interface DashboardStats {
  totalStudents: number;
  placedStudents: number;
  unplacedStudents: number;
  placementPercentage: number;
  higherStudies: number;
  notInterested: number;
  otherStatus: number;
  averagePackage: number;
  highestPackage: number;
  totalCompanies: number;
  statusDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  departmentStats: {
    department: string;
    total: number;
    placed: number;
    unplaced: number;
    higherStudies: number;
    percentage: number;
  }[];
  companyStats: {
    company: string;
    students: number;
    avgPackage: number;
    highestPackage: number;
  }[];
  batchDistribution: {
    batch: string;
    total: number;
    placed: number;
    percentage: number;
  }[];
  availableDepartments: string[];
  availableBatches: string[];
}

export interface ExcelValidationError {
  row: number;
  studentId?: string;
  rollNumber?: string;
  name?: string;
  field: string;
  message: string;
}

export interface ExcelPreviewResponse {
  totalDetected: number;
  validCount: number;
  errorCount: number;
  duplicateCount: number;
  sampleRows: Partial<Student>[];
  errors: ExcelValidationError[];
  detectedColumns: string[];
  columnMapping: Record<string, string>;
}
