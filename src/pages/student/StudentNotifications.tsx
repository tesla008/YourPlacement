import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Award,
  Clock,
  Check,
  Filter,
} from 'lucide-react';
import { api } from '../../lib/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { StudentNotification } from '../../types.ts';

export const StudentNotifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.getStudentNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'UNREAD') return !n.is_read;
    return n.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Placement Notifications & Alerts
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Test schedules, shortlisting announcements, and upcoming drive deadlines from the T&P Cell.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Check className="w-3.5 h-3.5 text-blue-600" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
            filterType === 'ALL'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType('UNREAD')}
          className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
            filterType === 'UNREAD'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilterType('TEST_SCHEDULED')}
          className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
            filterType === 'TEST_SCHEDULED'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Assessments
        </button>
        <button
          onClick={() => setFilterType('SELECTION_OFFER')}
          className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
            filterType === 'SELECTION_OFFER'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Offers
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
          Loading placement alerts...
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
          No notifications found in this category.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const isUnread = !notif.is_read;

            const getIcon = () => {
              switch (notif.type) {
                case 'TEST_SCHEDULED':
                  return <Clock className="w-5 h-5 text-amber-600" />;
                case 'SHORTLISTED':
                  return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
                case 'SELECTION_OFFER':
                  return <Award className="w-5 h-5 text-emerald-600" />;
                case 'DRIVE_PUBLISHED':
                  return <Calendar className="w-5 h-5 text-indigo-600" />;
                default:
                  return <Bell className="w-5 h-5 text-slate-600" />;
              }
            };

            return (
              <div
                key={notif.id}
                onClick={() => isUnread && handleMarkRead(notif.id)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                  isUnread
                    ? 'bg-blue-50/50 border-blue-200 shadow-xs'
                    : 'bg-white border-slate-200/90 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isUnread ? 'bg-white shadow-xs' : 'bg-slate-100'
                    }`}
                  >
                    {getIcon()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-slate-900 truncate">
                        {notif.title}
                      </h4>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-2 block font-medium">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {isUnread && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkRead(notif.id);
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg shrink-0 transition"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
