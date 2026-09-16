import React from 'react';
import {
  LayoutDashboard,
  Users,
  UploadCloud,
  UserCheck,
  FileBarChart,
  History,
  Settings,
  LogOut,
  GraduationCap,
  Building2,
  ShieldCheck,
  UserCog,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Award,
  Bell,
  ArrowLeftRight,
  Briefcase,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { user, mode, switchMode, logout, switchDemoRole } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isStudentMode = mode === 'student';

  const tpoNavSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, visible: true },
        { id: 'drives', label: 'Placement Drives', icon: Building2, visible: true },
        { id: 'students', label: 'Student Directory', icon: Users, visible: true },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'import', label: 'Import Excel Data', icon: UploadCloud, visible: isAdmin },
        { id: 'coordinators', label: 'Department Coords', icon: UserCheck, visible: isAdmin },
        { id: 'reports', label: 'Reports & Analytics', icon: FileBarChart, visible: true },
      ],
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { id: 'history', label: 'Audit Trail', icon: History, visible: isAdmin },
        { id: 'settings', label: 'System Settings', icon: Settings, visible: true },
      ],
    },
  ];

  const studentNavSections = [
    {
      title: 'EXPLORE OPPORTUNITIES',
      items: [
        { id: 'student_dashboard', label: 'Student Portal', icon: LayoutDashboard, visible: true },
        { id: 'student_drives', label: 'Campus Drives', icon: Building2, visible: true },
      ],
    },
    {
      title: 'MY RECRUITMENT',
      items: [
        { id: 'student_journey', label: 'Placement Journey', icon: TrendingUp, visible: true },
        { id: 'student_profile', label: 'Academic Profile', icon: GraduationCap, visible: true },
        { id: 'student_notifications', label: 'Placement Alerts', icon: Bell, visible: true },
      ],
    },
  ];

  const navSections = isStudentMode ? studentNavSections : tpoNavSections;

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          id="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0B132B] text-white flex flex-col border-r border-slate-800/80 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* College / Department Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="overflow-hidden min-w-0">
              <h1 className="text-sm font-extrabold text-white tracking-tight truncate">
                Apex Institute
              </h1>
              <p className="text-[11px] text-slate-400 truncate">
                {isStudentMode ? 'Student Placement Portal' : 'Training & Placement Cell'}
              </p>
            </div>
          </div>
        </div>

        {/* Mode Pill & Quick Toggle */}
        <div className="p-3 bg-slate-900/60 border-b border-slate-800/60">
          <div className="flex items-center justify-between p-1 bg-slate-800 rounded-xl text-xs font-bold">
            <button
              onClick={() => {
                switchMode('student');
                onSelectTab('student_dashboard');
              }}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                isStudentMode
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>
            <button
              onClick={() => {
                switchMode('tpo');
                onSelectTab('dashboard');
              }}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                !isStudentMode
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>TPO / Staff</span>
            </button>
          </div>
        </div>

        {/* Coordinator Scope Indicator (When in TPO mode and coordinator) */}
        {!isStudentMode && !isAdmin && user?.department && (
          <div className="mx-3 mt-3 p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs">
            <div className="flex items-center justify-between font-semibold text-blue-400 text-[11px]">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Assigned Department</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-slate-200 mt-1 font-bold text-xs truncate">{user.department}</p>
            <p className="text-slate-400 text-[10px] mt-0.5 font-medium">Batch Scope: {user.batch || 'All Batches'}</p>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {navSections.map((sec) => {
            const visibleItems = sec.items.filter((item) => item.visible);
            if (visibleItems.length === 0) return null;

            return (
              <div key={sec.title} className="space-y-1">
                <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  {sec.title}
                </p>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav-item-${item.id}`}
                      onClick={() => {
                        onSelectTab(item.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.2 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Quick Demo Persona Switcher */}
        <div className="px-3 py-2.5 border-t border-slate-800/80 bg-[#0B132B]">
          <div className="flex items-center justify-between px-1 mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Demo Persona:</span>
            </span>
            <span className="text-[10px] text-blue-400 font-semibold">Instant Switch</span>
          </div>

          {isStudentMode ? (
            <div className="grid grid-cols-2 gap-1.5">
              <button
                id="switch-role-rahul"
                onClick={() => switchDemoRole('student_rahul')}
                className={`px-2 py-1.5 text-[11px] rounded-lg font-medium flex items-center justify-center gap-1 transition ${
                  user?.email?.includes('rahul.sharma')
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                <span>Rahul (8.45)</span>
              </button>
              <button
                id="switch-role-sanika"
                onClick={() => switchDemoRole('student_sanika')}
                className={`px-2 py-1.5 text-[11px] rounded-lg font-medium flex items-center justify-center gap-1 transition ${
                  user?.email?.includes('sanika.joshi')
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                <span>Sanika (7.75)</span>
              </button>
              <button
                id="switch-role-rohan"
                onClick={() => switchDemoRole('student_rohan')}
                className={`px-2 py-1.5 text-[11px] rounded-lg font-medium flex items-center justify-center gap-1 transition ${
                  user?.email?.includes('rohan.verma')
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                <span>Rohan (6.40)</span>
              </button>
              <button
                id="switch-role-ananya"
                onClick={() => switchDemoRole('student_ananya')}
                className={`px-2 py-1.5 text-[11px] rounded-lg font-medium flex items-center justify-center gap-1 transition ${
                  user?.email?.includes('ananya.iyer')
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                <span>Ananya (8.90)</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              <button
                id="switch-role-admin"
                onClick={() => switchDemoRole('admin')}
                className={`px-2 py-1.5 text-[11px] rounded-lg font-medium flex items-center justify-center gap-1 transition ${
                  user?.role === 'admin'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>TPO Head</span>
              </button>
              <button
                id="switch-role-cs-coord"
                onClick={() => switchDemoRole('cs_coord')}
                className={`px-2 py-1.5 text-[11px] rounded-lg font-medium flex items-center justify-center gap-1 transition ${
                  user?.role === 'coordinator' && user?.department?.includes('Computer')
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                <UserCog className="w-3 h-3" />
                <span>CS Coord</span>
              </button>
              <button
                id="switch-role-it-coord"
                onClick={() => switchDemoRole('it_coord')}
                className={`px-2 py-1.5 text-[11px] rounded-lg font-medium flex items-center justify-center gap-1 transition ${
                  user?.role === 'coordinator' && user?.department?.includes('Information')
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                <UserCog className="w-3 h-3" />
                <span>IT Coord</span>
              </button>
              <button
                id="switch-role-mech-coord"
                onClick={() => switchDemoRole('mech_coord')}
                className={`px-2 py-1.5 text-[11px] rounded-lg font-medium flex items-center justify-center gap-1 transition ${
                  user?.role === 'coordinator' && user?.department?.includes('Mechanical')
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                <UserCog className="w-3 h-3" />
                <span>ME Coord</span>
              </button>
            </div>
          )}
        </div>

        {/* User profile & Logout */}
        <div className="p-3 border-t border-slate-800/80 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0 relative">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#0B132B]" />
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <span className="inline-block text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-blue-300 font-medium truncate max-w-[130px]">
                {isStudentMode
                  ? user?.roll_number || 'Candidate'
                  : user?.role === 'admin'
                  ? 'TPO Administrator'
                  : 'Placement Coordinator'}
              </span>
            </div>
          </div>
          <button
            id="sidebar-logout-button"
            onClick={logout}
            title="Sign Out"
            aria-label="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
