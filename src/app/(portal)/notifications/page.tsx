"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Bell, Trash2, CheckCircle2, Loader2, 
  ShieldAlert, BadgeDollarSign, Info 
} from "lucide-react";

import { 
  getNotifications, markNotificationsRead, 
  deleteNotifications 
} from "@/actions/notificationActions";

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const userId = (session?.user as any)?.id;

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId && status === "authenticated") {
      loadNotifications();
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [userId, status]);

  const loadNotifications = async () => {
    setIsLoading(true);
    const data = await getNotifications(userId, 50); 
    setNotifications(data);
    setIsLoading(false);
  };

  const handleMarkAllRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    await markNotificationsRead(userId, 'all');
  };

  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to delete all notifications?")) return;
    setNotifications([]);
    await deleteNotifications(userId, 'all');
  };

  const handleDelete = async (notifId: string) => {
    setNotifications(notifications.filter(n => n.id !== notifId));
    await deleteNotifications(userId, notifId);
  };

  const handleMarkAsRead = async (notifId: string, isCurrentlyRead: boolean) => {
    if (isCurrentlyRead) return;
    setNotifications(notifications.map(n => n.id === notifId ? { ...n, isRead: true } : n));
    await markNotificationsRead(userId, notifId);
  };

  const getIcon = (type: string, isRead: boolean) => {
    const colorClass = isRead ? "text-slate-400" : "text-[var(--color-brand-deep)]";
    switch (type) {
      case 'security': return <ShieldAlert className={`w-5 h-5 ${colorClass}`} />;
      case 'financial': return <BadgeDollarSign className={`w-5 h-5 ${colorClass}`} />;
      default: return <Info className={`w-5 h-5 ${colorClass}`} />;
    }
  };

  const formatTime = (dateString: string) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateString));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--color-brand-deep)]" />
        <p className="text-sm font-semibold">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-24">
      
      {/* HEADER */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Bell className="w-6 h-6 text-[var(--color-brand-deep)]" />
          Notification Center
        </h2>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Stay updated on your system alerts and financial milestones.
        </p>
      </div>

      {/* MAIN CONTENT PANEL */}
      <div className="glass-panel relative overflow-hidden flex flex-col min-h-[500px]">
        
        {/* Bulk Actions Bar */}
        <div className="flex items-center justify-between p-4 md:px-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {unreadCount} Unread
          </span>
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-brand-deep)] hover:text-[var(--color-brand-light)] transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button 
                onClick={handleDeleteAll}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
              <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-sm font-medium">You're all caught up!</p>
              <p className="text-xs mt-1 opacity-70">No new notifications to display.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {notifications.map((notif) => {
                const isUnread = !notif.isRead;
                return (
                  <div 
                    key={notif.id} 
                    onClick={() => handleMarkAsRead(notif.id, notif.isRead)}
                    className={`flex items-start gap-4 p-4 md:px-6 transition-colors cursor-pointer group ${
                      isUnread ? 'bg-slate-50/80 dark:bg-white/5' : 'hover:bg-slate-50/50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      isUnread ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-white/10' : 'bg-transparent'
                    }`}>
                      {getIcon(notif.type, notif.isRead)}
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className={`text-sm truncate ${
                          isUnread ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-400'
                        }`}>
                          {notif.title}
                        </h4>
                        <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>
                      <p className={`text-sm ${
                        isUnread ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-500'
                      }`}>
                        {notif.message}
                      </p>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notif.id);
                      }}
                      className="mt-1 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}