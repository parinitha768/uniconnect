import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Notification } from '../types';
import {
  Bell,
  Search,
  LogOut,
  User as UserIcon,
  CheckCircle,
  AlertTriangle,
  FileText,
  DollarSign,
  GraduationCap,
  Calendar,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Polling every 20s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case 'ATTENDANCE':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'RESULT':
      case 'EXAM':
        return <GraduationCap className="w-4 h-4 text-blue-500" />;
      case 'FEE':
        return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'GRIEVANCE':
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <Calendar className="w-4 h-4 text-slate-500" />;
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-red-200">Administrator</span>;
      case 'FACULTY':
        return <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-indigo-200">Faculty</span>;
      case 'STUDENT':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-blue-200">Student</span>;
      case 'PARENT':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">Parent</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm h-16 flex items-center justify-between px-4 sm:px-6">
      {/* Search Input */}
      <div className="flex items-center gap-3 w-72 sm:w-96">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses, examinations, notices..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* University Badge */}
        <div className="hidden lg:flex items-center gap-2 pr-3 border-r border-slate-200 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Nagarjuna University Academic Session 2026</span>
        </div>

        {/* Role Badge */}
        <div className="hidden sm:block">
          {getRoleBadge(user?.role)}
        </div>

        {/* Notifications Icon & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 bg-slate-50 border-b border-slate-100 text-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-sky-600" />
                  <span className="font-semibold text-sm text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-sky-50 text-sky-700 text-xs px-2 py-0.5 rounded-full font-medium border border-sky-200">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-sky-600 hover:text-sky-800 font-medium underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                        !n.isRead ? 'bg-sky-50/50' : ''
                      }`}
                    >
                      <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 h-fit">
                        {getNotificationIcon(n.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-semibold ${!n.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                            {n.title}
                          </p>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.email}`}
              alt={user?.name}
              className="w-8 h-8 rounded-full border border-slate-300 object-cover"
            />
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-slate-800 leading-tight">
                {user?.name}
              </p>
              <p className="text-[11px] text-slate-500 font-medium capitalize">
                {user?.role.toLowerCase()}
              </p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

