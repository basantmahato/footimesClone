'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";

interface Tournament {
  _id: string;
  name: string;
  location: string;
}

const AdminTournamentPage = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [form, setForm] = useState({ name: "", location: "" });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setForm({ name: t.name, location: t.location });
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
    setForm({ name: "", location: "" });
    setEditingId(null);
  };

  return (
    <div className="p-4 w-full">
      <div className="max-w-4xl mx-auto bg-zinc-900 border border-white/5 rounded-3xl p-8 shadow-2xl">
        {!showForm ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Tournaments</h2>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="py-2 px-6 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-pink-600/20"
              >
                Add New Tournament
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center p-12"><span className="loading loading-spinner text-pink-500"></span></div>
            ) : tournaments.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl">
                <p className="text-zinc-500 font-medium">No tournaments added yet.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/5 bg-black/30">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-900 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">
                      <th className="px-6 py-4 text-left">Tournament Name</th>
                      <th className="px-6 py-4 text-left">Location</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {tournaments.map((t) => (
                      <tr key={t._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{t.name}</td>
                        <td className="px-6 py-4 text-zinc-400 italic text-xs">{t.location}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => handleEdit(t)}
                              className="text-xs font-bold text-pink-500 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(t._id)}
                              className="text-xs font-bold text-red-500 hover:underline"
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
          <div className="animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter">
              {editingId ? "Edit" : "Add"} <span className="text-pink-500">Tournament</span>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <input
                  name="name"
                  placeholder="Tournament Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 rounded-2xl bg-zinc-800 border border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-pink-500 outline-none"
                />
                <input
                  name="location"
                  placeholder="Location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 rounded-2xl bg-zinc-800 border border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-pink-600/20 transition-all active:scale-[0.98]"
                >
                  {editingId ? "Update Tournament" : "Create Tournament"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all"
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
