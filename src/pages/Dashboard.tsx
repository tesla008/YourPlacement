import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  GraduationCap,
  Ban,
  Award,
  DollarSign,
  UploadCloud,
  UserPlus,
  FileSpreadsheet,
  Filter,
  RefreshCw,
  Building2,
  Briefcase,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { DashboardStats, Student } from '../types.ts';
import { api } from '../lib/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { StatCard } from '../components/StatCard.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onOpenAddStudent?: () => void;
  onOpenUpdateStatus?: (student: Student) => void;
  onOpenViewStudent?: (studentId: string) => void;
}

const PIE_COLORS = {
  Placed: '#10b981', // emerald-500
  'Not Placed': '#f43f5e', // rose-500
  'Higher Studies': '#6366f1', // indigo-500
  'Not Interested': '#64748b', // slate-500
  Other: '#f59e0b', // amber-500
};

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenAddStudent,
  onOpenUpdateStatus,
  onOpenViewStudent,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string>('All');
  const [selectedDept, setSelectedDept] = useState<string>(
    !isAdmin && user?.department ? user.department : 'All'
  );

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDashboardStats({
        batch: selectedBatch !== 'All' ? selectedBatch : undefined,
        department: selectedDept !== 'All' ? selectedDept : undefined,
      });
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedBatch, selectedDept, user]);

  const pieData = stats
    ? [
        { name: 'Placed', value: stats.placedStudents, color: PIE_COLORS.Placed },
        { name: 'Not Placed', value: stats.unplacedStudents, color: PIE_COLORS['Not Placed'] },
        { name: 'Higher Studies', value: stats.higherStudies, color: PIE_COLORS['Higher Studies'] },
        { name: 'Not Interested', value: stats.notInterested, color: PIE_COLORS['Not Interested'] },
        { name: 'Other', value: stats.otherStatus, color: PIE_COLORS.Other },
      ].filter((item) => item.value > 0)
    : [];

  return (
    <div id="dashboard-page" className="space-y-6">
      {/* Coordinator Scope Notification Banner */}
      {!isAdmin && user?.department && (
        <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-slate-900/5 border border-blue-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-blue-950 shadow-xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">Coordinator Department View</p>
              <p className="text-xs text-blue-800 truncate">
                Monitoring <span className="font-semibold">{user.department}</span> • Batch: {user.batch || 'All Batches'}. Data shown is filtered to your department scope.
              </p>
            </div>
          </div>
          <div className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-white border border-blue-200/90 text-blue-800 shadow-xs shrink-0">
            {stats?.totalStudents || 0} Students in Scope
          </div>
        </div>
      )}

      {/* Filter and Quick Action Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Scope:</span>
          </div>

          {/* Batch Selector */}
          <select
            id="dashboard-batch-filter"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="rounded-xl border border-slate-300/90 bg-slate-50/50 hover:bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
          >
            <option value="All">All Batches (2027, 2026)</option>
            <option value="2027">Batch 2027 (Active Drives)</option>
            <option value="2026">Batch 2026 (Graduated)</option>
            <option value="2025">Batch 2025 (Alumni)</option>
          </select>

          {/* Department Selector (Disabled if Coordinator) */}
          {isAdmin ? (
            <select
              id="dashboard-department-filter"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="rounded-xl border border-slate-300/90 bg-slate-50/50 hover:bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition max-w-xs truncate cursor-pointer"
            >
              <option value="All">All Engineering Departments</option>
              <option value="Computer Technology">Computer Technology</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Telecommunication">Electronics & Telecom</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
            </select>
          ) : (
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              {user?.department}
            </span>
          )}

          <button
            id="refresh-stats-button"
            onClick={fetchStats}
            title="Refresh statistics"
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition border border-transparent hover:border-slate-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button
                id="quick-import-btn"
                onClick={() => onNavigate('import')}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/90 rounded-xl flex items-center gap-1.5 transition border border-slate-200/60"
              >
                <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                <span>Import Excel</span>
              </button>
              {onOpenAddStudent && (
                <button
                  id="quick-add-student-btn"
                  onClick={onOpenAddStudent}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 transition shadow-xs shadow-blue-500/20"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Student</span>
                </button>
              )}
            </>
          )}
          <button
            id="quick-export-reports-btn"
            onClick={() => onNavigate('reports')}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/90 rounded-xl flex items-center gap-1.5 transition border border-slate-200/60"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Reports</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* 8 Metric KPI Cards with modern trend cues */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-total-students"
          title="Total Cohort"
          value={stats?.totalStudents ?? '...'}
          subtext={`Batch: ${selectedBatch}`}
          icon={<Users className="w-5 h-5" />}
          variant="indigo"
        />
        <StatCard
          id="stat-placed-students"
          title="Placed Students"
          value={stats?.placedStudents ?? '...'}
          subtext="Offers Verified"
          trend={{ value: `${stats?.placedStudents || 0} Offers`, isPositive: true }}
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="emerald"
        />
        <StatCard
          id="stat-unplaced-students"
          title="Seeking Placement"
          value={stats?.unplacedStudents ?? '...'}
          subtext="Eligible & In-Process"
          icon={<XCircle className="w-5 h-5" />}
          variant="rose"
        />
        <StatCard
          id="stat-placement-percentage"
          title="Placement Rate"
          value={stats ? `${stats.placementPercentage}%` : '...'}
          subtext={`${stats?.placedStudents || 0} of ${stats?.eligibleStudents || 0} eligible`}
          trend={{ value: `${stats?.placementPercentage || 0}% Target`, isPositive: true }}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="blue"
        />
        <StatCard
          id="stat-avg-package"
          title="Average CTC"
          value={stats ? `₹${stats.averagePackage} LPA` : '...'}
          subtext="Cohort Mean Package"
          icon={<DollarSign className="w-5 h-5" />}
          variant="amber"
        />
        <StatCard
          id="stat-highest-package"
          title="Highest CTC Offer"
          value={stats ? `₹${stats.highestPackage} LPA` : '...'}
          subtext="Dream Offer Milestone"
          trend={{ value: 'Top Offer', isPositive: true }}
          icon={<Award className="w-5 h-5" />}
          variant="emerald"
        />
        <StatCard
          id="stat-higher-studies"
          title="Higher Education"
          value={stats?.higherStudies ?? '...'}
          subtext="GATE / GRE / MBA Track"
          icon={<GraduationCap className="w-5 h-5" />}
          variant="indigo"
        />
        <StatCard
          id="stat-not-interested"
          title="Opted Out / Other"
          value={stats ? (stats.notInterested + stats.otherStatus) : '...'}
          subtext="Family / Ventures"
          icon={<Ban className="w-5 h-5" />}
          variant="slate"
        />
      </div>

      {/* Visual Charts Grid: Donut + Department Grouped Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placement Status Distribution Donut Chart with Centered Metric */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Placement Distribution</h3>
              <p className="text-xs text-slate-500">Breakdown of student cohort</p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {stats?.totalStudents || 0} Students
            </span>
          </div>

          <div className="relative h-64 w-full mt-2 flex items-center justify-center">
            {stats && stats.totalStudents > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={92}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '0.75rem',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                        padding: '8px 12px',
                      }}
                      formatter={(val: number, name: string) => [
                        `${val} students (${stats.totalStudents ? Math.round((val / stats.totalStudents) * 100) : 0}%)`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center metric indicator */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {stats.placementPercentage}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Placed Rate
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400">No student cohort data</p>
            )}
          </div>

          {/* Clean Legend Chips */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600 truncate text-[11px] font-medium">{item.name}</span>
                <span className="text-slate-900 font-bold text-[11px] ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department-wise Placement Statistics Bar Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Placement Performance</h3>
              <p className="text-xs text-slate-500">Total vs Placed vs Unplaced cohort</p>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
              Branch Metrics
            </span>
          </div>

          <div className="h-64 w-full mt-4">
            {stats && stats.departmentStats && stats.departmentStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.departmentStats.map((d) => ({
                    name: d.department.length > 14 ? `${d.department.substring(0, 12)}...` : d.department,
                    fullName: d.department,
                    Total: d.total,
                    Placed: d.placed,
                    Unplaced: d.unplaced,
                    Percentage: d.percentage,
                  }))}
                  margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    angle={-15}
                    textAnchor="end"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '0.75rem',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                      padding: '8px 12px',
                    }}
                    formatter={(value: any, name: string) => [value, name]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return payload[0].payload.fullName;
                      }
                      return label;
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="Total" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Placed" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Unplaced" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                No department statistics available
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Overall Campus Placement Efficiency</span>
            <span className="text-emerald-600 font-bold">{stats?.placementPercentage || 0}% Cleared Offers</span>
          </div>
        </div>
      </div>

      {/* Second Analytics Row: Top Companies Leaderboard + Recent Placements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Companies Hiring Leaderboard */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top Recruiters</h3>
              <p className="text-xs text-slate-500">Highest hiring volume partners</p>
            </div>
            <Award className="w-4 h-4 text-amber-500" />
          </div>

          <div className="mt-3 space-y-2.5 flex-1 overflow-y-auto max-h-[300px] pr-1">
            {stats && stats.companyStats && stats.companyStats.length > 0 ? (
              stats.companyStats.slice(0, 5).map((comp, idx) => (
                <div
                  key={comp.company}
                  className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{comp.company}</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Avg: ₹{comp.averagePackage} LPA
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2.5 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-extrabold">
                      {comp.count} Offers
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-xs text-slate-400">
                No recruiter data available yet
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Recruiter Drives AY 2026-27</span>
            <button
              onClick={() => onNavigate('reports')}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
            >
              <span>Full Roster</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Recent Placements Activity Feed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Campus Placements</h3>
              <p className="text-xs text-slate-500">Live verified offer letters & hires</p>
            </div>
            <button
              onClick={() => onNavigate('students')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Student Directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-2 overflow-x-auto">
            {stats?.recentPlacements && stats.recentPlacements.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Company & Role</th>
                    <th className="py-2.5 px-3">Package</th>
                    <th className="py-2.5 px-3">Offer Date</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentPlacements.slice(0, 5).map((s) => {
                    const initials = s.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .substring(0, 2);

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-[11px] font-bold flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{s.name}</div>
                              <div className="text-[10px] text-slate-400 font-medium">{s.roll_number}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-medium">
                          {s.department.replace('Engineering', 'Engg')}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900">{s.company || '—'}</span>
                          {s.job_role && <span className="text-[10px] text-slate-500 block font-medium">{s.job_role}</span>}
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-600">
                          {s.package ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px]">
                              ₹{s.package} LPA
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px] font-medium">
                          {s.placement_date || '—'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onOpenViewStudent && (
                              <button
                                onClick={() => onOpenViewStudent(s.id)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition"
                              >
                                Profile
                              </button>
                            )}
                            {onOpenUpdateStatus && (
                              <button
                                onClick={() => onOpenUpdateStatus(s)}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition border border-blue-200/60"
                              >
                                Update
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                No recent campus placements recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

