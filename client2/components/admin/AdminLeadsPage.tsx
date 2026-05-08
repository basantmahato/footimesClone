'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Mail, Trash2, CheckCircle, Clock, Archive, Copy } from 'lucide-react';
import { useAdminTheme } from './AdminThemeContext';
import { toast } from 'react-toastify';

interface Lead {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'read' | 'archived';
  createdAt: string;
}

const AdminLeadsPage = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useAdminTheme();
  const isDarkMode = theme === 'dark';

  const themeText = isDarkMode ? "text-white" : "text-black";
  const themeMuted = isDarkMode ? "text-white/40" : "text-black/40";
  const themeCard = isDarkMode ? "bg-zinc-900/40 border-white/10" : "bg-white border-black/10";
  const themeHover = isDarkMode ? "hover:bg-white/5" : "hover:bg-black/5";

  const fetchLeads = async () => {
    try {
      const res = await axios.get('https://api.footimes.com/api/leads');
      setLeads(res.data);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to load leads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.patch(`https://api.footimes.com/api/leads/${id}/status`, { status });
      setLeads(leads.map(l => l._id === id ? { ...l, status: status as any } : l));
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const deleteLead = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await axios.delete(`https://api.footimes.com/api/leads/${id}`);
      setLeads(leads.filter(l => l._id !== id));
      toast.success("Lead deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete lead.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner text-pink-500"></span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold mb-1">Contact Leads</h2>
          <p className={`${themeMuted} text-[11px] font-bold uppercase tracking-widest`}>
            {leads.length} Messages Received
          </p>
        </div>
      </header>

      <div className="grid gap-4">
        {leads.length === 0 ? (
          <div className={`p-12 text-center border-2 border-dashed ${isDarkMode ? 'border-white/5' : 'border-black/5'} rounded-2xl ${themeMuted}`}>
            No messages found.
          </div>
        ) : (
          leads.map((lead) => (
            <div 
              key={lead._id}
              className={`${themeCard} border rounded-2xl p-6 transition-all hover:shadow-xl`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest
                      ${lead.status === 'new' ? 'bg-pink-500 text-white' : 
                        lead.status === 'read' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}
                    `}>
                      {lead.status}
                    </span>
                    <span className={`text-[10px] ${themeMuted} font-bold`}>
                      {format(new Date(lead.createdAt), 'PPpp')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 ${isDarkMode ? 'bg-white/5' : 'bg-black/5'} rounded-full flex items-center justify-center`}>
                      <Mail className={isDarkMode ? 'text-white/40' : 'text-black/20'} size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{lead.name}</h4>
                      <p className={`text-xs ${themeMuted}`}>{lead.email}</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-black/40' : 'bg-black/5'} text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {lead.message}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-2 justify-end">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(lead.email);
                      toast.success(`Email copied: ${lead.email}`);
                    }}
                    className={`p-2 rounded-lg ${isDarkMode ? 'bg-pink-500/10 text-pink-500 hover:bg-pink-500/20' : 'bg-pink-500/5 text-pink-600 hover:bg-pink-500/10'} transition-all`}
                    title="Copy Email to Clipboard"
                  >
                    <Copy size={16} />
                  </button>
                  {lead.status === 'new' && (
                    <button 
                      onClick={() => updateStatus(lead._id, 'read')}
                      className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-green-500/5 text-green-600 hover:bg-green-500/10'} transition-all`}
                      title="Mark as Read"
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                  {lead.status !== 'archived' && (
                    <button 
                      onClick={() => updateStatus(lead._id, 'archived')}
                      className={`p-2 rounded-lg ${themeHover} ${themeMuted} transition-all`}
                      title="Archive"
                    >
                      <Archive size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteLead(lead._id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminLeadsPage;
