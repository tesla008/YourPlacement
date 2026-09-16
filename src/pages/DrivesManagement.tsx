import React, { useState, useEffect } from 'react';
import {
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  Sparkles,
  Award,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { PlacementDrive } from '../types.ts';
import { api } from '../lib/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { DriveDetailModal } from '../components/DriveDetailModal.tsx';
import { DriveFormModal } from '../components/DriveFormModal.tsx';
import { DriveRegistrationsModal } from '../components/DriveRegistrationsModal.tsx';

export const DrivesManagement: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modals state
  const [detailDrive, setDetailDrive] = useState<PlacementDrive | null>(null);
  const [editDrive, setEditDrive] = useState<PlacementDrive | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [registrationsDrive, setRegistrationsDrive] = useState<PlacementDrive | null>(null);

  useEffect(() => {
    loadDrives();
  }, []);

  const loadDrives = async () => {
    try {
      setLoading(true);
      const data = await api.getPlacementDrives();
      setDrives(data);
    } catch (err) {
      console.error('Failed to load placement drives', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDrive = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the placement drive for "${name}"?`)) {
      return;
    }
    try {
      await api.deletePlacementDrive(id);
      setDrives((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete drive');
    }
  };

  const filteredDrives = drives.filter((d) => {
    const matchesSearch =
      !searchQuery ||
      d.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.job_role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || d.drive_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate high-level stats
  const totalDrives = drives.length;
  const totalRegistrations = drives.reduce((acc, d) => acc + (d.registered_count || 0), 0);
  const totalSelected = drives.reduce((acc, d) => acc + (d.selected_count || 0), 0);
  const activeDrives = drives.filter((d) => d.status === 'Applications Open' || d.status === 'In Progress').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Placement Drives Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create recruitment drives, configure strict eligibility criteria, and track candidate selection progress.
          </p>
        </div>

        <button
          id="create-placement-drive-btn"
          onClick={() => {
            setEditDrive(null);
            setIsFormOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Placement Drive</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Drives</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{activeDrives}</span>
            <span className="text-xs text-slate-500">of {totalDrives} total</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Applications</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalRegistrations}</span>
            <span className="text-xs text-emerald-600 font-semibold">Registered</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Offers Extended</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">{totalSelected}</span>
            <span className="text-xs text-slate-500">Placed candidates</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Placement Rate</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {totalRegistrations > 0 ? Math.round((totalSelected / totalRegistrations) * 100) : 0}%
            </span>
            <span className="text-xs text-slate-500">Drive conversion</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search drives by company, designation, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none flex-1 sm:flex-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Applications Open">Applications Open</option>
            <option value="Upcoming">Upcoming</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none flex-1 sm:flex-none"
          >
            <option value="ALL">All Types</option>
            <option value="On-Campus">On-Campus</option>
            <option value="Off-Campus">Off-Campus</option>
            <option value="Pool-Campus">Pool-Campus</option>
            <option value="Virtual Drive">Virtual Drive</option>
          </select>
        </div>
      </div>

      {/* Drives Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
          Loading placement drives...
        </div>
      ) : filteredDrives.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
          No placement drives found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDrives.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              {/* Card Top */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs">
                      {d.company_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          {d.drive_type}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            d.status === 'Applications Open'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : d.status === 'In Progress'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {d.status}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1 truncate">
                        {d.company_name}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium truncate">{d.job_role}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm sm:text-base font-black text-emerald-700 block">
                      {d.package_display || (d.package ? `₹${d.package} LPA` : 'Competitive')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">CTC Offered</span>
                  </div>
                </div>

                {/* Key Meta Details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 mb-3">
                  <div className="flex items-center gap-1.5 truncate">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">Date: {d.drive_date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">{d.location || 'College Campus'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span className="truncate">Deadline: {d.application_deadline || 'Open'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{d.openings || 'Multiple'} Openings</span>
                  </div>
                </div>

                {/* Eligibility Summary Chip */}
                <div className="text-[11px] text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 flex items-center justify-between">
                  <span>
                    Eligibility: <strong>≥ {d.eligibility.minimum_cgpa} CGPA</strong> · Max {d.eligibility.maximum_backlogs} Backlogs
                  </span>
                  <span className="text-[10px] font-bold text-blue-600">
                    {d.eligibility.eligible_branches.length} Branches
                  </span>
                </div>

                {/* Live Recruitment Funnel Stats */}
                <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-slate-100 text-center">
                  <div className="p-1.5 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 block font-medium">Eligible</span>
                    <span className="text-xs font-bold text-slate-800">{d.eligible_count ?? '—'}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-blue-50/60">
                    <span className="text-[10px] text-blue-600 block font-medium">Registered</span>
                    <span className="text-xs font-bold text-blue-800">{d.registered_count ?? 0}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-amber-50/60">
                    <span className="text-[10px] text-amber-600 block font-medium">Shortlisted</span>
                    <span className="text-xs font-bold text-amber-800">{d.shortlisted_count ?? 0}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-emerald-50/60">
                    <span className="text-[10px] text-emerald-600 block font-medium">Selected</span>
                    <span className="text-xs font-bold text-emerald-800">{d.selected_count ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="bg-slate-50/90 px-4 py-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setRegistrationsDrive(d)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Manage Candidates ({d.registered_count ?? 0})</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setDetailDrive(d)}
                    title="View Drive Details"
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditDrive(d);
                      setIsFormOpen(true);
                    }}
                    title="Edit Drive"
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-200 rounded-lg transition"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteDrive(d.id, d.company_name)}
                      title="Delete Drive"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drive Detail Modal */}
      <DriveDetailModal
        drive={detailDrive}
        isOpen={Boolean(detailDrive)}
        onClose={() => setDetailDrive(null)}
      />

      {/* Drive Create/Edit Modal */}
      <DriveFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditDrive(null);
        }}
        driveToEdit={editDrive}
        onSuccess={(saved) => {
          loadDrives();
        }}
      />

      {/* Drive Registrations & Bulk Status Modal */}
      <DriveRegistrationsModal
        drive={registrationsDrive}
        isOpen={Boolean(registrationsDrive)}
        onClose={() => setRegistrationsDrive(null)}
        onStatusUpdated={loadDrives}
      />
    </div>
  );
};
