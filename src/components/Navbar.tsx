import React, { useState } from 'react';
import {
  Menu,
  Bell,
  ShieldCheck,
  UserCheck,
  Check,
  Sparkles,
  GraduationCap,
  Briefcase,
  ArrowLeftRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { ModeSelectionModal } from './ModeSelectionModal.tsx';

interface NavbarProps {
  currentTab: string;
  onOpenMobile: () => void;
  onSearch?: (query: string) => void;
  onSwitchMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onOpenMobile,
}) => {
  const { user, mode, switchMode } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isModeModalOpen, setIsModeModalOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState([
    {
      id: 1,
      title: 'Deloitte Campus Drive',
      desc: '18 students received offer letters with ₹8.5 LPA package.',
      time: '1 hour ago',
      read: false,
    },
    {
      id: 2,
      title: 'Batch 2027 Master Import',
      desc: 'Master student database verified and synchronized.',
      time: '3 hours ago',
      read: false,
    },
    {
      id: 3,
      title: 'Upcoming TCS Interview Slot',
      desc: 'Shortlisted CS & IT candidates notified for technical round.',
      time: 'Yesterday',
      read: true,
    },
  ]);

  const markAllAsRead = () => {
    setNotificationsList(notificationsList.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notificationsList.filter((n) => !n.read).length;

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    // TPO Tabs
    dashboard: {
      title: user?.role === 'admin' ? 'Placement Dashboard' : 'Coordinator Dashboard',
      subtitle: user?.role === 'admin' ? 'College-wide placement metrics & recruitment overview' : `Assigned student tracking: ${user?.department || 'My Department'}`,
    },
    drives: {
      title: 'Placement Drives Management',
      subtitle: 'Create drives, configure automated eligibility, and track selection stages',
    },
    students: {
      title: 'Student Directory',
      subtitle: 'Comprehensive student placement records, search, and status tracking',
    },
    import: {
      title: 'Import Student Data',
      subtitle: 'Upload Excel (.xlsx) workbooks with automatic validation and smart mapping',
    },
    coordinators: {
      title: 'Placement Coordinators',
      subtitle: 'Manage departmental coordinator accounts and student access permissions',
    },
    reports: {
      title: 'Placement Reports & Analytics',
      subtitle: 'Export overall, departmental, and company-wise placement statistics',
    },
    history: {
      title: 'Audit Trail & History',
      subtitle: 'Detailed record of placement status modifications and recruiters',
    },
    settings: {
      title: 'System Settings',
      subtitle: 'Manage institution configuration and sample data',
    },

    // Student Tabs
    student_dashboard: {
      title: 'Student Placement Portal',
      subtitle: 'Personalized recruitment opportunities, automated eligibility, and application status',
    },
    student_drives: {
      title: 'Campus Recruitment Drives',
      subtitle: 'Browse all upcoming company drives and check matching eligibility criteria',
    },
    student_journey: {
      title: 'My Placement Journey',
      subtitle: 'Milestone tracking for online tests, interview rounds, and job offers',
    },
    student_profile: {
      title: 'My Academic & Placement Profile',
      subtitle: 'Verified academic marks, backlogs, and registered campus drives dossier',
    },
    student_notifications: {
      title: 'Placement Notifications',
      subtitle: 'Announcements, test links, interview schedules, and shortlisting alerts',
    },
  };

  const currentInfo = pageTitles[currentTab] || { title: 'T&P Portal', subtitle: '' };

  return (
    <>
      <header id="top-navbar" className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile menu trigger & Page titles */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              id="mobile-menu-button"
              onClick={onOpenMobile}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden border border-slate-200/80 transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight truncate">
                {currentInfo.title}
              </h2>
              <p className="text-xs text-slate-500 hidden sm:block truncate">
                {currentInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Mode Switcher Button */}
            <button
              id="switch-mode-button"
              onClick={() => setIsModeModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-2xs bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900 border-blue-200 hover:border-blue-300"
              title="Click to switch between Student Mode and TPO Mode"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline font-black">
                {mode === 'student' ? 'Student Mode' : 'TPO Mode'}
              </span>
              <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-semibold">
                Switch
              </span>
            </button>

            {/* Role Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
              {user?.role === 'student' ? (
                <>
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Student ({user.name?.split(' ')[0]})</span>
                </>
              ) : user?.role === 'admin' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>TPO Admin</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Coordinator</span>
                </>
              )}
            </div>

            {/* Notification dropdown */}
            <div className="relative">
              <button
                id="notifications-bell-button"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="View notifications"
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 relative transition border border-slate-200/80"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  id="notifications-dropdown-menu"
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Placement Alerts</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Mark read</span>
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notificationsList.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3.5 text-xs hover:bg-slate-50 transition cursor-pointer ${
                          !n.read ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 pt-2.5 border-t border-slate-100 text-center">
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mode Selection Modal */}
      <ModeSelectionModal
        isOpen={isModeModalOpen}
        onClose={() => setIsModeModalOpen(false)}
      />
    </>
  );
};


