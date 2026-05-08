'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, Info, AlertTriangle, Megaphone, Clock } from 'lucide-react';
import { formatTimeAgo } from '@/utils/timeAgo';

interface Notification {
  _id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  createdAt: string;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get('https://api.footimes.com/api/notifications/active');
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="text-red-500" size={20} />;
      case 'warning': return <Info className="text-amber-500" size={20} />;
      case 'success': return <Megaphone className="text-emerald-500" size={20} />;
      default: return <Bell className="text-pink-500" size={20} />;
    }
  };

  return (
    <div className="bg-black min-h-screen text-white pt-20 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-black uppercase tracking-widest mb-2">Announcements</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
            Latest updates and real-time alerts
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="loading loading-spinner text-pink-500"></span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/40 rounded-3xl border border-white/5">
            <Bell size={40} className="mx-auto text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em]">No active notifications</p>
          </div>
        ) : (
          <div className="space-y-6">
            {notifications.map((n) => (
              <div 
                key={n._id}
                className="bg-zinc-900/60 border border-white/5 rounded-3xl p-6 transition-all hover:bg-zinc-900 hover:border-white/10 shadow-lg group"
              >
                <div className="flex gap-5">
                  <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 group-hover:scale-110 transition-transform`}>
                    {getIcon(n.type)}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md
                        ${n.type === 'urgent' ? 'bg-red-500 text-white' : 
                          n.type === 'warning' ? 'bg-amber-500 text-black' : 
                          n.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-pink-600 text-white'}
                      `}>
                        {n.type}
                      </span>
                      <div className="flex items-center gap-1.5 text-zinc-500">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold uppercase">{formatTimeAgo(n.createdAt)}</span>
                      </div>
                    </div>

                    <p className="text-sm font-medium leading-relaxed text-zinc-200">
                      {n.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
