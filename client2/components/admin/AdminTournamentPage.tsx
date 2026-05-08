'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAdminTheme } from "./AdminThemeContext";

interface Tournament {
  _id: string;
  name: string;
  location: string;
  status: 'past' | 'current' | 'upcoming';
}

const AdminTournamentPage = () => {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [form, setForm] = useState({ name: "", location: "", status: "current" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://api.footimes.com/api/tournaments");
      setTournaments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching tournaments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`https://api.footimes.com/api/tournaments/${editingId}`, form);
        alert("Tournament updated!");
      } else {
        await axios.post("https://api.footimes.com/api/tournaments", form);
        alert("Tournament added!");
      }
      resetForm();
      fetchTournaments();
      setShowForm(false);
    } catch (err) {
      console.error("Error saving tournament:", err);
    }
  };

  const handleEdit = (t: Tournament) => {
    setForm({ name: t.name, location: t.location, status: t.status || "current" });
    setEditingId(t._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this tournament?")) return;
    try {
      await axios.delete(`https://api.footimes.com/api/tournaments/${id}`);
      alert("Deleted!");
      fetchTournaments();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const resetForm = () => {
    setForm({ name: "", location: "", status: "current" });
    setEditingId(null);
  };

  const themeInput = isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-black/10 text-black";
  const themeTextMuted = isDark ? "text-white/40" : "text-black/40";
  const themeTextMoreMuted = isDark ? "text-white/20" : "text-black/20";
  const themeCardInner = isDark ? "border-white/5" : "border-black/5";

  return (
    <div className={`p-8 ${isDark ? 'bg-transparent text-white' : 'bg-white text-black'} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto">
        {!showForm ? (
          <>
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-1">Tournaments</h2>
                <p className={`${themeTextMuted} text-xs`}>Manage all available competition categories.</p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className={`py-2 px-6 ${isDark ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-black/90'} text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-sm`}
              >
                Create New
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center p-12"><span className="loading loading-spinner loading-sm text-black/20 dark:text-white/20"></span></div>
            ) : tournaments.length === 0 ? (
              <div className={`text-center py-20 border border-dashed ${themeCardInner} rounded-2xl`}>
                <p className={`${themeTextMuted} text-xs font-bold uppercase tracking-widest`}>No tournaments found.</p>
              </div>
            ) : (
              <div className={`border ${isDark ? 'border-white/10' : 'border-black/5'} rounded-xl overflow-hidden shadow-sm`}>
                <table className={`min-w-full divide-y ${isDark ? 'divide-white/5' : 'divide-black/5'}`}>
                  <thead>
                    <tr className={`${isDark ? 'bg-white/5' : 'bg-black/[0.02]'} text-[10px] uppercase tracking-widest ${themeTextMoreMuted} font-black`}>
                      <th className="px-6 py-4 text-left">Tournament Name</th>
                      <th className="px-6 py-4 text-left">Location</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-black/5'} ${isDark ? 'bg-transparent' : 'bg-white'}`}>
                    {tournaments.map((t) => (
                      <tr key={t._id} className={`${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.01]'} transition-colors`}>
                        <td className="px-6 py-4 font-bold text-sm">{t.name}</td>
                        <td className={`px-6 py-4 ${themeTextMuted} text-xs font-medium`}>{t.location}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${
                            t.status === 'past' ? 'bg-red-500/10 text-red-500' :
                            t.status === 'upcoming' ? 'bg-blue-500/10 text-blue-500' :
                            'bg-green-500/10 text-green-500'
                          }`}>
                            {t.status || 'current'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-4">
                            <button
                              onClick={() => handleEdit(t)}
                              className="text-[10px] font-black uppercase text-inherit hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(t._id)}
                              className="text-[10px] font-black uppercase text-red-500 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-lg mx-auto">
            <h2 className="text-xl font-bold mb-8 tracking-tight">
              {editingId ? "Update" : "Create"} Tournament
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="tournament-name" className={`text-[10px] font-bold uppercase ${themeTextMuted} tracking-widest ml-1`}>Tournament Name</label>
                  <input
                    id="tournament-name"
                    name="name"
                    placeholder="e.g. Champions League"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className={`w-full ${themeInput} rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-black dark:focus:ring-white outline-none`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="tournament-location" className={`text-[10px] font-bold uppercase ${themeTextMuted} tracking-widest ml-1`}>Location</label>
                  <input
                    id="tournament-location"
                    name="location"
                    placeholder="e.g. Europe"
                    value={form.location}
                    onChange={handleChange}
                    required
                    className={`w-full ${themeInput} rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-black dark:focus:ring-white outline-none`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="tournament-status" className={`text-[10px] font-bold uppercase ${themeTextMuted} tracking-widest ml-1`}>Status</label>
                  <select
                    id="tournament-status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={`w-full ${themeInput} rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-black dark:focus:ring-white outline-none appearance-none`}
                  >
                    <option value="current">Current</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className={`flex-1 ${isDark ? 'bg-white text-black' : 'bg-black text-white'} font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg hover:opacity-90 transition-all active:scale-[0.98]`}
                >
                  {editingId ? "Save Changes" : "Create Tournament"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className={`px-8 py-3.5 border ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-black/10 hover:bg-black/5'} text-inherit font-bold text-xs uppercase tracking-widest rounded-lg transition-all`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTournamentPage;
