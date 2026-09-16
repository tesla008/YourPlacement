import { Router, Response } from 'express';
import { db } from './db.ts';
import {
  generateToken,
  revokeToken,
  authenticateToken,
  requireAdmin,
  requireCoordinatorOrAdmin,
  AuthenticatedRequest,
} from './auth.ts';
import {
  parseAndValidateWorkbook,
  generateTemplateBuffer,
  generateExportBuffer,
} from './excel.ts';
import { PlacementStatus } from '../src/types.ts';

export const apiRouter = Router();

// --- 1. Authentication Endpoints ---
apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.findUserByEmail(email);
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (!user.is_active) {
    return res.status(403).json({ error: 'Your account has been deactivated. Please contact the administrator.' });
  }

  const token = generateToken(user.id);
  const { passwordHash, ...safeUser } = user;

  res.json({
    message: 'Login successful',
    token,
    user: safeUser,
  });
});

apiRouter.get('/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

apiRouter.post('/auth/logout', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (token) revokeToken(token);
  res.json({ message: 'Logged out successfully' });
});

apiRouter.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Please provide your registered email address.' });
  }
  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'No user account found with this email address.' });
  }
  // Helpful recovery prompt for demo
  res.json({
    message: `Password reset instructions sent. (Demo hint: For coordinator accounts use 'coord123', for admin use 'admin123')`,
  });
});

// --- 2. Dashboard KPIs & Analytics ---
apiRouter.get('/dashboard/stats', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { batch, department } = req.query;

  const userScope = req.user
    ? { role: req.user.role, department: req.user.department, batch: req.user.batch }
    : undefined;

  const stats = db.calculateDashboardStats({
    batch: batch as string,
    department: department as string,
    userScope,
  });

  res.json(stats);
});

// --- 3. Student Management ---
apiRouter.get('/students', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const {
    search,
    status,
    department,
    branch,
    batch,
    minCgpa,
    maxCgpa,
    company,
    page,
    limit,
    sortBy,
    sortOrder,
  } = req.query;

  const userScope = req.user
    ? { role: req.user.role, department: req.user.department, batch: req.user.batch }
    : undefined;

  const result = db.getStudents({
    search: search as string,
    status: status as string,
    department: department as string,
    branch: branch as string,
    batch: batch as string,
    minCgpa: minCgpa ? parseFloat(minCgpa as string) : undefined,
    maxCgpa: maxCgpa ? parseFloat(maxCgpa as string) : undefined,
    company: company as string,
    userScope,
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 20,
    sortBy: sortBy as string,
    sortOrder: (sortOrder as 'asc' | 'desc') || 'asc',
  });

  res.json(result);
});

apiRouter.get('/students/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const result = db.getStudentById(req.params.id);
  if (!result) {
    return res.status(404).json({ error: 'Student not found.' });
  }

  // If coordinator, check department authorization
  if (req.user?.role === 'coordinator') {
    if (req.user.department && req.user.department !== 'All' && result.student.department.toLowerCase() !== req.user.department.toLowerCase()) {
      return res.status(403).json({ error: 'Access denied: You cannot view students outside your assigned department.' });
    }
    if (req.user.batch && req.user.batch !== 'All' && result.student.batch !== req.user.batch) {
      return res.status(403).json({ error: 'Access denied: You cannot view students outside your assigned batch.' });
    }
  }

  res.json(result);
});

// Admin only: Add Student
apiRouter.post('/students', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = db.createStudent(req.body, {
      name: req.user!.name,
      role: req.user!.role,
    });
    res.status(201).json({ message: 'Student created successfully', student });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create student' });
  }
});

// Admin only: Edit Student Details
apiRouter.put('/students/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateStudent(req.params.id, req.body, {
      name: req.user!.name,
      role: req.user!.role,
    });
    res.json({ message: 'Student updated successfully', student: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update student' });
  }
});

// Admin only: Delete Student
apiRouter.delete('/students/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const removed = db.deleteStudent(req.params.id);
    res.json({ message: `Student ${removed.name} (${removed.roll_number}) deleted successfully`, student: removed });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to delete student' });
  }
});

// Admin & Coordinator: Update Placement Status Workflow
apiRouter.patch('/students/:id/placement', authenticateToken, requireCoordinatorOrAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      new_status,
      company,
      job_role,
      package: pkg,
      placement_date,
      placement_type,
      location,
      remarks,
      confirmedRevertToUnplaced,
    } = req.body;

    if (!new_status) {
      return res.status(400).json({ error: 'New placement status is required.' });
    }

    const result = db.updatePlacementStatus(
      req.params.id,
      {
        new_status: new_status as PlacementStatus,
        company,
        job_role,
        package: pkg,
        placement_date,
        placement_type,
        location,
        remarks,
        confirmedRevertToUnplaced,
      },
      {
        name: req.user!.name,
        role: req.user!.role,
        department: req.user!.department,
        batch: req.user!.batch,
      }
    );

    res.json({
      message: 'Placement status updated successfully.',
      student: result.student,
      historyItem: result.historyItem,
    });
  } catch (err: any) {
    if (err.message.includes('CONFIRMATION_REQUIRED')) {
      return res.status(409).json({
        requiresConfirmation: true,
        error: 'Student is currently marked as Placed. Please confirm you wish to revert their status to Not Placed.',
      });
    }
    res.status(400).json({ error: err.message || 'Failed to update placement status' });
  }
});

// --- 4. Excel Upload, Preview, Validation & Import ---
apiRouter.post('/import/preview', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fileBase64, customMapping } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ error: 'No file data received.' });
    }

    // Clean base64 prefix if present
    const base64Clean = fileBase64.replace(/^data:.*?;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');

    // Max 15MB file validation
    if (buffer.length > 15 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds maximum permitted limit of 15MB.' });
    }

    const preview = parseAndValidateWorkbook(buffer, customMapping);
    res.json(preview);
  } catch (err: any) {
    console.error('Excel parse error:', err);
    res.status(400).json({ error: err.message || 'Failed to parse Excel file. Please ensure it is a valid .xlsx file.' });
  }
});

apiRouter.post('/import/confirm', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { students, duplicateAction, filename } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'No valid student records to import.' });
    }

    const action = duplicateAction === 'update' || duplicateAction === 'new' ? duplicateAction : 'skip';

    const result = db.bulkImport(
      students,
      action,
      { name: req.user!.name, role: req.user!.role },
      filename || 'students_imported.xlsx'
    );

    res.json({
      message: `${result.successful} students successfully imported${result.skipped > 0 ? ` (${result.skipped} duplicates skipped)` : ''}.`,
      ...result,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to complete import' });
  }
});

apiRouter.get('/import/template', (req, res) => {
  try {
    const buffer = generateTemplateBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Students_Import_Template.xlsx"');
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate template file.' });
  }
});

apiRouter.get('/import/logs', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const logs = db.getImportLogs();
  res.json(logs);
});

// --- 5. Export to Excel ---
apiRouter.get('/export/excel', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, department, batch, company } = req.query;

    const userScope = req.user
      ? { role: req.user.role, department: req.user.department, batch: req.user.batch }
      : undefined;

    const students = db.getAllStudentsForExport({
      status: status as string,
      department: department as string,
      batch: batch as string,
      company: company as string,
      userScope,
    });

    const filename = `Placement_Report_${batch || 'All'}_${Date.now()}.xlsx`;
    const buffer = generateExportBuffer(students, 'Placement_Data');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to export Excel file.' });
  }
});

// --- 6. Placement Coordinator Management (Admin only) ---
apiRouter.get('/coordinators', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const coordinators = db.getCoordinators();
  res.json(coordinators);
});

apiRouter.post('/coordinators', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, department, batch } = req.body;
    if (!name || !email || !department || !batch) {
      return res.status(400).json({ error: 'Name, email, department, and batch are all required.' });
    }
    const newCoord = db.addCoordinator({ name, email, department, batch });
    res.status(201).json({ message: 'Coordinator account created successfully', coordinator: newCoord });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create coordinator' });
  }
});

apiRouter.put('/coordinators/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateCoordinator(req.params.id, req.body);
    res.json({ message: 'Coordinator updated successfully', coordinator: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update coordinator' });
  }
});

apiRouter.patch('/coordinators/:id/toggle-status', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.toggleCoordinatorStatus(req.params.id);
    res.json({ message: `Coordinator ${updated.is_active ? 'activated' : 'deactivated'} successfully`, coordinator: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update coordinator status' });
  }
});

// --- 7. Audit History ---
apiRouter.get('/history', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.query.studentId as string;
  const history = db.getPlacementHistory(studentId);
  res.json(history);
});

// --- 8. Reports Summary ---
apiRouter.get('/reports/summary', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const summary = db.getReportsSummary();
  res.json(summary);
});

// --- 9. Demo Data Reset (Admin only) ---
apiRouter.post('/admin/reset-demo-data', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  db.seedDemoData();
  res.json({ message: 'Database reseeded successfully with realistic student records, drives, and coordinators.' });
});

// --- 10. Companies Endpoints ---
apiRouter.get('/companies', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const companies = db.getCompanies();
  res.json(companies);
});

apiRouter.post('/companies', authenticateToken, requireCoordinatorOrAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const company = db.createCompany(req.body);
    res.status(201).json(company);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create company' });
  }
});

// --- 11. Placement Drives Endpoints ---
apiRouter.get('/drives', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      search,
      status,
      branch,
      driveType,
      packageRange,
      eligibilityFilter,
      studentId,
    } = req.query;

    // If user is a student, automatically pass their student_id
    const effectiveStudentId =
      (req.user?.role === 'student' ? req.user.student_id : (studentId as string)) || undefined;

    const drives = db.getPlacementDrives({
      studentId: effectiveStudentId,
      search: search as string,
      status: status as string,
      branch: branch as string,
      driveType: driveType as string,
      packageRange: packageRange as string,
      eligibilityFilter: eligibilityFilter as string,
    });

    res.json(drives);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch drives' });
  }
});

apiRouter.get('/drives/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const effectiveStudentId =
    (req.user?.role === 'student' ? req.user.student_id : (req.query.studentId as string)) || undefined;

  const drive = db.getPlacementDriveById(req.params.id, effectiveStudentId);
  if (!drive) {
    return res.status(404).json({ error: 'Placement drive not found' });
  }
  res.json(drive);
});

apiRouter.post('/drives', authenticateToken, requireCoordinatorOrAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { eligibility, ...driveData } = req.body;
    const actorName = `${req.user?.name} (${req.user?.role})`;
    const newDrive = db.createPlacementDrive(driveData, eligibility || {}, actorName);
    res.status(201).json(newDrive);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create drive' });
  }
});

apiRouter.put('/drives/:id', authenticateToken, requireCoordinatorOrAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { eligibility, ...driveUpdates } = req.body;
    const actorName = `${req.user?.name} (${req.user?.role})`;
    const updated = db.updatePlacementDrive(req.params.id, driveUpdates, eligibility || {}, actorName);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update drive' });
  }
});

apiRouter.delete('/drives/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    db.deletePlacementDrive(req.params.id);
    res.json({ message: 'Drive deleted successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to delete drive' });
  }
});

apiRouter.post('/drives/eligibility-preview', authenticateToken, requireCoordinatorOrAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const preview = db.getEligibilityPreview(req.body);
    res.json(preview);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to calculate eligibility preview' });
  }
});

// --- 12. Drive Registrations & Selection Status Management ---
apiRouter.get('/drives/:id/registrations', authenticateToken, requireCoordinatorOrAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const registrations = db.getDriveRegistrations(req.params.id);
    res.json(registrations);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch registrations' });
  }
});

apiRouter.post('/drives/:id/register', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    // If student is logged in, register them; if TPO, allow passing studentId
    const studentId = req.user?.role === 'student' ? req.user.student_id : req.body.studentId;
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required to register.' });
    }

    const registration = db.registerStudentForDrive(
      req.params.id,
      studentId,
      req.body.registrationStatus || 'Registered',
      req.body.remarks
    );

    res.status(201).json({ message: 'Registered successfully', registration });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to register for drive' });
  }
});

apiRouter.patch('/drives/:id/registrations/:studentId/status', authenticateToken, requireCoordinatorOrAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, remarks } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'New status is required' });
    }
    const actorName = `${req.user?.name} (${req.user?.role})`;
    const updated = db.updateStudentDriveStatus(req.params.id, req.params.studentId, status, remarks, actorName);
    res.json({ message: 'Status updated successfully', registration: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update student status' });
  }
});

apiRouter.post('/drives/:id/registrations/bulk-status', authenticateToken, requireCoordinatorOrAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { studentIds, status, remarks } = req.body;
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: 'studentIds array is required' });
    }
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const actorName = `${req.user?.name} (${req.user?.role})`;
    const result = db.bulkUpdateDriveStatus(req.params.id, studentIds, status, remarks, actorName);
    res.json({ message: `Successfully updated ${result.updatedCount} students`, count: result.updatedCount });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to bulk update status' });
  }
});

// --- 13. Student Mode Endpoints ---
apiRouter.get('/student/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.role === 'student' ? req.user.student_id : (req.query.studentId as string);
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID not available in session' });
    }
    const profile = db.getStudentProfile(studentId);
    if (!profile) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    res.json(profile);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch student profile' });
  }
});

apiRouter.get('/student/applications', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.role === 'student' ? req.user.student_id : (req.query.studentId as string);
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID not available in session' });
    }
    const apps = db.getStudentApplications(studentId);
    res.json(apps);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch applications' });
  }
});

apiRouter.get('/student/journey', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.role === 'student' ? req.user.student_id : (req.query.studentId as string);
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID not available in session' });
    }
    const journey = db.getStudentJourney(studentId);
    res.json(journey);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch placement journey' });
  }
});

apiRouter.get('/student/notifications', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.role === 'student' ? req.user.student_id : (req.query.studentId as string);
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID not available in session' });
    }
    const notifications = db.getStudentNotifications(studentId);
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch notifications' });
  }
});

apiRouter.patch('/student/notifications/:id/read', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    db.markNotificationAsRead(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to mark notification read' });
  }
});

apiRouter.post('/student/notifications/read-all', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.role === 'student' ? req.user.student_id : (req.body.studentId as string);
    if (studentId) {
      db.markAllNotificationsAsRead(studentId);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to mark all notifications read' });
  }
});

