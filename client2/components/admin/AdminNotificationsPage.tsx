'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, Trash2, ToggleLeft, ToggleRight, Plus, Send } from 'lucide-react';
import { useAdminTheme } from './AdminThemeContext';
import { toast } from 'react-toastify';

interface Notification {
  _id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  isActive: boolean;
  createdAt: string;
}

const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ message: '', type: 'info' as const });
  const { theme } = useAdminTheme();
  const isDarkMode = theme === 'dark';

  const themeText = isDarkMode ? "text-white" : "text-black";
  const themeMuted = isDarkMode ? "text-white/40" : "text-black/40";
  const themeCard = isDarkMode ? "bg-zinc-900/40 border-white/10" : "bg-white border-black/10";
  const themeInput = isDarkMode ? "bg-black/40 border-white/10 text-white" : "bg-gray-50 border-black/10 text-black";

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('https://api.footimes.com/api/notifications/admin');
      setNotifications(res.data);
    } catch (error) {
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message) return;
    try {
      const res = await axios.post('https://api.footimes.com/api/notifications', form);
      setNotifications([res.data, ...notifications]);
      setForm({ message: '', type: 'info' });
      toast.success("Notification pushed live!");
    } catch (error) {
      toast.error("Failed to push notification.");
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await axios.patch(`https://api.footimes.com/api/notifications/${id}`, { isActive: !currentStatus });
      setNotifications(notifications.map(n => n._id === id ? res.data : n));
      toast.success(`Notification ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const deleteNotification = async (id: string) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await axios.delete(`https://api.footimes.com/api/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success("Notification deleted.");
    } catch (error) {
      toast.error("Failed to delete.");
    }
  };

  return (
    <div className="p-6">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold mb-1">Global Notifications</h2>
          <p className={`${themeMuted} text-[11px] font-bold uppercase tracking-widest`}>
            Manage public announcements and live alerts
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className={`${themeCard} border rounded-2xl p-6 sticky top-6`}>
            <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
              <Plus size={16} className="text-pink-500" /> Push New Alert
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="notif-message" className={`text-[10px] font-black uppercase ${themeMuted} tracking-widest`}>Message</label>
                <textarea 
                  id="notif-message"
                  value={form.message}
                  onChange={(e) => setForm({...form, message: e.target.value})}
                  className={`w-full ${themeInput} border rounded-xl p-3 text-sm min-h-[100px] outline-none focus:ring-1 focus:ring-pink-500 transition-all`}
                  placeholder="e.g. Match starting in 10 minutes!"
                  required
                  title="Enter the notification message"
                  aria-label="Notification Message"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="notif-type" className={`text-[10px] font-black uppercase ${themeMuted} tracking-widest`}>Alert Type</label>
                <select 
                  id="notif-type"
                  value={form.type}
                  onChange={(e) => setForm({...form, type: e.target.value as any})}
                  className={`w-full ${themeInput} border rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-pink-500 appearance-none`}
                  title="Select the type of alert"
                  aria-label="Alert Type"
                >
                  <option value="info">Information (Pink)</option>
                  <option value="success">Success (Green)</option>
                  <option value="warning">Warning (Amber)</option>
                  <option value="urgent">Urgent (Red)</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-500 text-white font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Send size={14} /> Push Live
              </button>
            </div>
          </form>
        </div>

        {/* History List */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-10"><span className="loading loading-spinner text-pink-500"></span></div>
            ) : notifications.length === 0 ? (
              <div className={`p-20 text-center border-2 border-dashed ${isDarkMode ? 'border-white/5' : 'border-black/5'} rounded-2xl ${themeMuted} text-xs font-bold uppercase tracking-widest`}>
                No notifications history
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n._id} className={`${themeCard} border rounded-2xl p-5 flex items-center justify-between gap-4 transition-all hover:shadow-lg`}>
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                      ${n.type === 'urgent' ? 'bg-red-500/10 text-red-500' : 
                        n.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
                        n.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-pink-500/10 text-pink-500'}
                    `}>
                      <Bell size={18} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${!n.isActive && 'opacity-50'}`}>{n.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                          n.type === 'urgent' ? 'bg-red-500 text-white' : 
                          n.type === 'warning' ? 'bg-amber-500 text-black' : 
                          n.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-pink-500 text-white'
                        }`}>
                          {n.type}
                        </span>
                        <span className={`text-[9px] ${themeMuted} font-bold uppercase`}>
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleStatus(n._id, n.isActive)}
                      className={`p-2 rounded-lg transition-all ${n.isActive ? 'text-green-500' : themeMuted} hover:bg-black/5`}
                      title={n.isActive ? "Deactivate" : "Activate"}
                    >
                      {n.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                    <button 
                      onClick={() => deleteNotification(n._id)}
                      className="p-2 rounded-lg text-red-500/20 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
