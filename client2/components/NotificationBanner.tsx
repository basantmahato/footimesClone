'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, X, Megaphone, Info, AlertTriangle } from 'lucide-react';

interface Notification {
  _id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  isActive: boolean;
}

const NotificationBanner = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get('https://api.footimes.com/api/notifications/active');
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();

    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (notifications.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % notifications.length);
      }, 8000); // Rotate every 8 seconds
      return () => clearInterval(timer);
    }
  }, [notifications.length]);

  if (!isVisible || notifications.length === 0) return null;

  const current = notifications[currentIndex];

  const getTypeStyles = () => {
    switch (current.type) {
      case 'urgent': return 'bg-red-600 text-white';
      case 'warning': return 'bg-amber-500 text-black';
      case 'success': return 'bg-emerald-600 text-white';
      default: return 'bg-pink-600 text-white';
    }
  };

  const getIcon = () => {
    switch (current.type) {
      case 'urgent': return <AlertTriangle size={14} className="animate-pulse" />;
      case 'warning': return <Info size={14} />;
      case 'success': return <Megaphone size={14} />;
      default: return <Bell size={14} />;
    }
  };

  return (
    <div className={`relative w-full ${getTypeStyles()} py-2 px-4 flex items-center justify-center transition-all duration-500 z-[100]`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <p className="text-[11px] font-black uppercase tracking-widest text-center animate-in fade-in slide-in-from-right-4 duration-500">
          {current.message}
        </p>

        {notifications.length > 1 && (
          <span className="text-[9px] opacity-60 font-bold ml-2">
            ({currentIndex + 1}/{notifications.length})
          </span>
        )}
      </div>

      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-4 p-1 hover:bg-black/10 rounded-full transition-colors"
        aria-label="Close notification"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default NotificationBanner;
