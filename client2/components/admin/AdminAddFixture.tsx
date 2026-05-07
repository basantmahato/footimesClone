'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { HiOutlineX } from "react-icons/hi";

const formatForInput = (rawDate: string) => {
  if (!rawDate) return "";
  const d = new Date(rawDate);
  return d.toISOString().slice(0, 16);
};

interface Tournament {
  _id: string;
  name: string;
}

interface Fixture {
  _id?: string;
  teamA: string;
  teamB: string;
  matchDate: string;
  venue: string;
  tournament: any;
  matchRound: string;
  admin: string;
  image?: string;
}

export default function AdminAddFixture() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [form, setForm] = useState<Fixture>({
    teamA: "",
    teamB: "",
    matchDate: "",
    venue: "",
    tournament: "",
    matchRound: "",
    admin: "Admin",
  });
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTournaments();
    fetchFixtures();
  }, []);

  const fetchTournaments = () => {
    setLoadingTournaments(true);
    axios.get("https://api.footimes.com/api/tournaments")
      .then((res) => setTournaments(res.data))
      .catch(() => setTournaments([]))
      .finally(() => setLoadingTournaments(false));
  };

  const fetchFixtures = () => {
    axios.get("https://api.footimes.com/api/fixtures")
      .then((res) => setFixtures(res.data))
      .catch(() => setFixtures([]))
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.teamA || !form.teamB || !form.matchDate || !form.tournament || !form.matchRound) {
      setFormError("Please fill all required fields.");
      return;
    }

    try {
      const payload = {
        ...form,
        matchDate: new Date(form.matchDate).toISOString(),
        tournament: typeof form.tournament === "object" ? form.tournament._id : form.tournament,
      };

      if (form._id) {
        await axios.put(`https://api.footimes.com/api/fixtures/${form._id}`, payload);
        alert("✅ Fixture updated!");
      } else {
        await axios.post("https://api.footimes.com/api/fixtures", payload);
        alert("✅ Fixture added!");
      }

      setForm({
        teamA: "",
        teamB: "",
        matchDate: "",
        venue: "",
        tournament: "",
        matchRound: "",
        admin: "Admin",
      });
      setFormError("");
      fetchFixtures();
    } catch (err) {
      alert("❌ Failed to save fixture.");
    }
  };

  const handleEdit = (fix: Fixture) => {
    setForm({
      ...fix,
      matchDate: formatForInput(fix.matchDate),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure to delete this fixture?")) {
      try {
        await axios.delete(`https://api.footimes.com/api/fixtures/${id}`);
        fetchFixtures();
      } catch (err) {
        alert("❌ Delete failed");
      }
    }
  };

  const getTournamentName = (tournamentField: any) => {
    if (!tournamentField) return "Unknown";
    const id = typeof tournamentField === "object" ? tournamentField._id : tournamentField;
    const found = tournaments.find((t) => String(t._id) === String(id));
    return found ? found.name : "Unknown";
  };

  const filteredFixtures = fixtures.filter((fix) => {
    if (!searchTerm.trim()) return true;
    const lower = searchTerm.toLowerCase();
    return (
      fix.teamA?.toLowerCase().includes(lower) ||
      fix.teamB?.toLowerCase().includes(lower) ||
      fix.venue?.toLowerCase().includes(lower) ||
      fix.matchRound?.toLowerCase().includes(lower) ||
      getTournamentName(fix.tournament).toLowerCase().includes(lower)
    );
  });

  return (
    <div className="bg-black text-white min-h-screen px-4 py-6">
      <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 max-w-3xl mx-auto shadow-2xl">
        <h2 className="text-2xl font-black mb-8 text-center uppercase tracking-tighter">
          {form._id ? "Edit" : "Add"} <span className="text-pink-500">Fixture</span>
        </h2>

        {formError && <p className="text-red-400 text-center mb-6 text-sm font-bold animate-pulse">{formError}</p>}

        <form onSubmit={handleSubmit} className="space-y-4 mb-12">
          <select
            className="w-full bg-zinc-800 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-pink-500 outline-none transition-all"
            value={form.matchRound}
            onChange={(e) => setForm({ ...form, matchRound: e.target.value })}
            aria-label="Select Match Round"
          >
            <option value="">Select Match Round *</option>
            {["First Round", "Second Round", "Quarter-finals", "Semi-finals", "Final"].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="w-full bg-zinc-800 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              placeholder="Team A *"
              value={form.teamA}
              onChange={(e) => setForm({ ...form, teamA: e.target.value })}
            />
            <input
              className="w-full bg-zinc-800 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              placeholder="Team B *"
              value={form.teamB}
              onChange={(e) => setForm({ ...form, teamB: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="datetime-local"
              value={form.matchDate}
              onChange={(e) => setForm({ ...form, matchDate: e.target.value })}
              className="w-full bg-zinc-800 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              aria-label="Match Date and Time"
              title="Select match date and time"
            />
            <input
              className="w-full bg-zinc-800 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              placeholder="Venue (optional)"
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
            />
          </div>

          <select
            className="w-full bg-zinc-800 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
            value={form.tournament}
            onChange={(e) => setForm({ ...form, tournament: e.target.value })}
            disabled={loadingTournaments}
            aria-label="Select Tournament"
          >
            <option value="">Select Tournament *</option>
            {tournaments.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>

          <button
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold p-4 rounded-2xl shadow-xl shadow-pink-600/20 transition-all active:scale-[0.98]"
            type="submit"
          >
            {form._id ? "Update Fixture" : "Add Fixture"}
          </button>
        </form>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">Fixture History</h3>
          <div className="relative w-full md:w-64">
            <input
              className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-white/10 rounded-xl text-xs outline-none"
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><span className="loading loading-spinner text-pink-500"></span></div>
        ) : (
          <div className="space-y-4">
            {filteredFixtures.sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime()).map((fix) => (
              <div key={fix._id} className="bg-zinc-800/50 border border-white/5 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start gap-4 hover:bg-zinc-800 transition-colors group">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-bold text-sm">{fix.teamA} <span className="text-pink-500/50">VS</span> {fix.teamB}</p>
                    <span className="text-[10px] bg-pink-500/10 text-pink-500 px-2 py-0.5 rounded-full font-bold">{fix.matchRound}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-zinc-500 font-medium">
                    <p><span className="text-zinc-600 mr-1">📅</span> {new Date(fix.matchDate).toLocaleString()}</p>
                    <p><span className="text-zinc-600 mr-1">📍</span> {fix.venue || "N/A"}</p>
                    <p><span className="text-zinc-600 mr-1">🏆</span> {getTournamentName(fix.tournament)}</p>
                    <p><span className="text-zinc-600 mr-1">👤</span> {fix.admin}</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => handleEdit(fix)} className="flex-1 sm:flex-none px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-bold rounded-xl transition-all">Edit</button>
                  <button onClick={() => handleDelete(fix._id!)} className="flex-1 sm:flex-none px-4 py-2 bg-red-900/30 hover:bg-red-900 text-red-500 hover:text-white text-xs font-bold rounded-xl transition-all">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
