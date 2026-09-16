import {
  User,
  Student,
  DashboardStats,
  ExcelPreviewResponse,
  CoordinatorAccount,
  PlacementHistoryItem,
  ImportLog,
  PlacementStatus,
  Company,
  PlacementDrive,
  DriveRegistration,
  StudentNotification,
  EligibilityCriteria,
} from '../types.ts';

const TOKEN_KEY = 'tpo_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      errorMsg = data.error || data.message || errorMsg;
      if (data.requiresConfirmation) {
        const error = new Error(errorMsg) as any;
        error.requiresConfirmation = true;
        throw error;
      }
    } catch (e: any) {
      if (e.requiresConfirmation) throw e;
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(res.token);
    return res;
  },

  async getCurrentUser(): Promise<User | null> {
    const token = getStoredToken();
    if (!token) return null;
    try {
      const res = await request<{ user: User }>('/api/auth/me');
      return res.user;
    } catch {
      setStoredToken(null);
      return null;
    }
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      setStoredToken(null);
    }
  },

  // Dashboard Stats
  async getDashboardStats(filters?: { batch?: string; department?: string }): Promise<DashboardStats> {
    const query = new URLSearchParams();
    if (filters?.batch) query.append('batch', filters.batch);
    if (filters?.department) query.append('department', filters.department);
    const qs = query.toString();
    return request(`/api/dashboard/stats${qs ? `?${qs}` : ''}`);
  },

  // Students
  async getStudents(params: {
    search?: string;
    status?: string;
    department?: string;
    branch?: string;
    batch?: string;
    minCgpa?: number;
    maxCgpa?: number;
    company?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ students: Student[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
    return request(`/api/students?${query.toString()}`);
  },

  async getStudentById(id: string): Promise<{ student: Student; history: PlacementHistoryItem[] }> {
    return request(`/api/students/${id}`);
  },

  async createStudent(student: Partial<Student>): Promise<{ message: string; student: Student }> {
    return request('/api/students', {
      method: 'POST',
      body: JSON.stringify(student),
    });
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<{ message: string; student: Student }> {
    return request(`/api/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteStudent(id: string): Promise<{ message: string; student: Student }> {
    return request(`/api/students/${id}`, {
      method: 'DELETE',
    });
  },

  async updatePlacementStatus(
    id: string,
    data: {
      new_status: PlacementStatus;
      company?: string | null;
      job_role?: string | null;
      package?: number | null;
      placement_date?: string | null;
      placement_type?: Student['placement_type'];
      location?: string | null;
      remarks?: string | null;
      confirmedRevertToUnplaced?: boolean;
    }
  ): Promise<{ message: string; student: Student; historyItem: PlacementHistoryItem }> {
    return request(`/api/students/${id}/placement`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Excel Upload & Import
  async previewExcel(fileBase64: string, customMapping?: Record<string, string>): Promise<ExcelPreviewResponse> {
    return request('/api/import/preview', {
      method: 'POST',
      body: JSON.stringify({ fileBase64, customMapping }),
    });
  },

  async confirmImport(
    students: Partial<Student>[],
    duplicateAction: 'skip' | 'update' | 'new',
    filename: string
  ): Promise<{ message: string; successful: number; skipped: number; updated: number }> {
    return request('/api/import/confirm', {
      method: 'POST',
      body: JSON.stringify({ students, duplicateAction, filename }),
    });
  },

  async getImportLogs(): Promise<ImportLog[]> {
    return request('/api/import/logs');
  },

  downloadTemplateUrl(): string {
    return '/api/import/template';
  },

  getExportExcelUrl(filters?: { status?: string; department?: string; batch?: string; company?: string }): string {
    const query = new URLSearchParams();
    if (filters?.status) query.append('status', filters.status);
    if (filters?.department) query.append('department', filters.department);
    if (filters?.batch) query.append('batch', filters.batch);
    if (filters?.company) query.append('company', filters.company);
    return `/api/export/excel?${query.toString()}`;
  },

  // Coordinators
  async getCoordinators(): Promise<CoordinatorAccount[]> {
    return request('/api/coordinators');
  },

  async createCoordinator(coord: { name: string; email: string; department: string; batch: string }): Promise<{ message: string; coordinator: CoordinatorAccount }> {
    return request('/api/coordinators', {
      method: 'POST',
      body: JSON.stringify(coord),
    });
  },

  async updateCoordinator(id: string, updates: Partial<CoordinatorAccount & { resetPassword?: boolean }>): Promise<{ message: string; coordinator: CoordinatorAccount }> {
    return request(`/api/coordinators/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async toggleCoordinatorStatus(id: string): Promise<{ message: string; coordinator: CoordinatorAccount }> {
    return request(`/api/coordinators/${id}/toggle-status`, {
      method: 'PATCH',
    });
  },

  // Audit History
  async getAuditHistory(studentId?: string): Promise<PlacementHistoryItem[]> {
    const query = studentId ? `?studentId=${encodeURIComponent(studentId)}` : '';
    return request(`/api/history${query}`);
  },

  // Reports
  async getReportsSummary(): Promise<any> {
    return request('/api/reports/summary');
  },

  // Reset Demo Data
  async resetDemoData(): Promise<{ message: string }> {
    return request('/api/admin/reset-demo-data', {
      method: 'POST',
    });
  },

  // Companies
  async getCompanies(): Promise<Company[]> {
    return request('/api/companies');
  },

  async createCompany(data: Partial<Company>): Promise<Company> {
    return request('/api/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Placement Drives
  async getPlacementDrives(filters?: {
    search?: string;
    status?: string;
    branch?: string;
    driveType?: string;
    packageRange?: string;
    eligibilityFilter?: string;
    studentId?: string;
  }): Promise<PlacementDrive[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.branch) params.append('branch', filters.branch);
    if (filters?.driveType) params.append('driveType', filters.driveType);
    if (filters?.packageRange) params.append('packageRange', filters.packageRange);
    if (filters?.eligibilityFilter) params.append('eligibilityFilter', filters.eligibilityFilter);
    if (filters?.studentId) params.append('studentId', filters.studentId);
    const qs = params.toString();
    return request(`/api/drives${qs ? `?${qs}` : ''}`);
  },

  async getPlacementDrive(id: string, studentId?: string): Promise<PlacementDrive> {
    const query = studentId ? `?studentId=${encodeURIComponent(studentId)}` : '';
    return request(`/api/drives/${id}${query}`);
  },

  async createPlacementDrive(data: {
    company_name: string;
    company_industry?: string;
    job_role: string;
    package?: number;
    package_display?: string;
    location?: string;
    drive_date: string;
    drive_time?: string;
    application_deadline?: string;
    venue?: string;
    drive_type?: string;
    openings?: number;
    status?: string;
    description?: string;
    eligibility?: Partial<EligibilityCriteria>;
  }): Promise<PlacementDrive> {
    return request('/api/drives', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePlacementDrive(
    id: string,
    data: {
      company_name?: string;
      company_industry?: string;
      job_role?: string;
      package?: number;
      package_display?: string;
      location?: string;
      drive_date?: string;
      drive_time?: string;
      application_deadline?: string;
      venue?: string;
      drive_type?: string;
      openings?: number;
      status?: string;
      description?: string;
      eligibility?: Partial<EligibilityCriteria>;
    }
  ): Promise<PlacementDrive> {
    return request(`/api/drives/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deletePlacementDrive(id: string): Promise<{ message: string }> {
    return request(`/api/drives/${id}`, {
      method: 'DELETE',
    });
  },

  async getEligibilityPreview(criteria: Partial<EligibilityCriteria>): Promise<{
    totalEligible: number;
    byDepartment: Record<string, number>;
  }> {
    return request('/api/drives/eligibility-preview', {
      method: 'POST',
      body: JSON.stringify(criteria),
    });
  },

  // Drive Registrations
  async getDriveRegistrations(driveId: string): Promise<any[]> {
    return request(`/api/drives/${driveId}/registrations`);
  },

  async registerForDrive(driveId: string, options?: { studentId?: string; remarks?: string }): Promise<any> {
    return request(`/api/drives/${driveId}/register`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });
  },

  async updateStudentDriveStatus(
    driveId: string,
    studentId: string,
    status: string,
    remarks?: string
  ): Promise<any> {
    return request(`/api/drives/${driveId}/registrations/${studentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remarks }),
    });
  },

  async bulkUpdateDriveStatus(
    driveId: string,
    studentIds: string[],
    status: string,
    remarks?: string
  ): Promise<{ message: string; count: number }> {
    return request(`/api/drives/${driveId}/registrations/bulk-status`, {
      method: 'POST',
      body: JSON.stringify({ studentIds, status, remarks }),
    });
  },

  // Student Mode
  async getStudentProfile(): Promise<any> {
    return request('/api/student/profile');
  },

  async getStudentApplications(): Promise<any[]> {
    return request('/api/student/applications');
  },

  async getStudentJourney(): Promise<any[]> {
    return request('/api/student/journey');
  },

  async getStudentNotifications(): Promise<StudentNotification[]> {
    return request('/api/student/notifications');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return request(`/api/student/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return request('/api/student/notifications/read-all', {
      method: 'POST',
    });
  },
};
