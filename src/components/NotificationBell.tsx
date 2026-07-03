import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export default function NotificationBell({ notifications, onMarkAsRead, onMarkAllAsRead }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-slate-900 rounded-full animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 z-50 flex flex-col">
          <div className="p-3 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm z-10">
            <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  onMarkAllAsRead();
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="flex-1 divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 text-sm transition-colors ${!n.read ? 'bg-indigo-50/50 cursor-pointer' : 'hover:bg-slate-50'}`}
                  onClick={() => { if (!n.read) onMarkAsRead(n.id); }}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="font-bold text-slate-900">{n.title}</span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1" />}
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-2 block">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
