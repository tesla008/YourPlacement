import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Login } from './pages/Login.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { Students } from './pages/Students.tsx';
import { ImportStudents } from './pages/ImportStudents.tsx';
import { Coordinators } from './pages/Coordinators.tsx';
import { Reports } from './pages/Reports.tsx';
import { AuditHistory } from './pages/AuditHistory.tsx';
import { Settings } from './pages/Settings.tsx';
import { DrivesManagement } from './pages/DrivesManagement.tsx';

// Student Mode Pages
import { StudentDashboard } from './pages/student/StudentDashboard.tsx';
import { StudentDrives } from './pages/student/StudentDrives.tsx';
import { StudentJourney } from './pages/student/StudentJourney.tsx';
import { StudentProfile } from './pages/student/StudentProfile.tsx';
import { StudentNotifications } from './pages/student/StudentNotifications.tsx';

import { PlacementStatusModal } from './components/PlacementStatusModal.tsx';
import { StudentDetailModal } from './components/StudentDetailModal.tsx';
import { StudentFormModal } from './components/StudentFormModal.tsx';
import { Student } from './types.ts';
import { CheckCircle2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, mode, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>(
    mode === 'student' ? 'student_dashboard' : 'dashboard'
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Synchronize active tab with mode changes
  useEffect(() => {
    if (mode === 'student' && !currentTab.startsWith('student_')) {
      setCurrentTab('student_dashboard');
    } else if (mode === 'tpo' && currentTab.startsWith('student_')) {
      setCurrentTab('dashboard');
    }
  }, [mode]);

  // Global Modals State
  const [statusModalStudent, setStatusModalStudent] = useState<Student | null>(null);
  const [detailModalStudentId, setDetailModalStudentId] = useState<string | null>(null);
  const [formModalStudent, setFormModalStudent] = useState<Student | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-400">Loading Placement Portal...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const isAdmin = user.role === 'admin';
  const isStudent = mode === 'student';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar
          currentTab={currentTab}
          onOpenMobile={() => setIsMobileSidebarOpen(true)}
        />

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div
            id="toast-notification-banner"
            className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* ================= TPO MODE VIEWS ================= */}
          {!isStudent && (
            <>
              {currentTab === 'dashboard' && (
                <Dashboard
                  onNavigate={(tab) => setCurrentTab(tab)}
                  onOpenAddStudent={
                    isAdmin
                      ? () => {
                          setFormModalStudent(null);
                          setIsFormModalOpen(true);
                        }
                      : undefined
                  }
                  onOpenUpdateStatus={(s) => setStatusModalStudent(s)}
                  onOpenViewStudent={(id) => setDetailModalStudentId(id)}
                />
              )}

              {currentTab === 'drives' && <DrivesManagement />}

              {currentTab === 'students' && (
                <Students
                  onOpenAddStudent={() => {
                    setFormModalStudent(null);
                    setIsFormModalOpen(true);
                  }}
                  onOpenEditStudent={(s) => {
                    setFormModalStudent(s);
                    setIsFormModalOpen(true);
                  }}
                  onOpenUpdateStatus={(s) => setStatusModalStudent(s)}
                  onOpenViewStudent={(id) => setDetailModalStudentId(id)}
                  onNavigateImport={() => setCurrentTab('import')}
                />
              )}

              {currentTab === 'import' && isAdmin && (
                <ImportStudents
                  onImportComplete={() => {
                    showToast('Students imported successfully into the placement database!');
                  }}
                />
              )}

              {currentTab === 'coordinators' && isAdmin && <Coordinators />}

              {currentTab === 'reports' && <Reports />}

              {currentTab === 'history' && isAdmin && <AuditHistory />}

              {currentTab === 'settings' && (
                <Settings
                  onDataReset={() => {
                    showToast('Demo data reseeded successfully.');
                  }}
                />
              )}
            </>
          )}

          {/* ================= STUDENT MODE VIEWS ================= */}
          {isStudent && (
            <>
              {currentTab === 'student_dashboard' && (
                <StudentDashboard onNavigate={(tab) => setCurrentTab(tab)} />
              )}

              {currentTab === 'student_drives' && <StudentDrives />}

              {currentTab === 'student_journey' && <StudentJourney />}

              {currentTab === 'student_profile' && <StudentProfile />}

              {currentTab === 'student_notifications' && <StudentNotifications />}
            </>
          )}
        </main>
      </div>

      {/* Global Placement Status Modal */}
      <PlacementStatusModal
        student={statusModalStudent}
        isOpen={Boolean(statusModalStudent)}
        onClose={() => setStatusModalStudent(null)}
        onSuccess={(updatedStudent) => {
          showToast(
            `Placement status updated for ${updatedStudent.name} (${updatedStudent.placement_status})`
          );
        }}
      />

      {/* Global Student Detail Dossier Modal */}
      <StudentDetailModal
        studentId={detailModalStudentId}
        isOpen={Boolean(detailModalStudentId)}
        onClose={() => setDetailModalStudentId(null)}
        onOpenUpdateStatus={(student) => setStatusModalStudent(student)}
        onOpenEditStudent={(student) => {
          setFormModalStudent(student);
          setIsFormModalOpen(true);
        }}
        canEditStudent={isAdmin}
      />

      {/* Global Student Add/Edit Modal */}
      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setFormModalStudent(null);
        }}
        studentToEdit={formModalStudent}
        onSuccess={(student) => {
          showToast(
            formModalStudent
              ? `Student ${student.name} updated successfully`
              : `New student ${student.name} registered`
          );
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
