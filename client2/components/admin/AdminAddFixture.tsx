'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAdminTheme } from "./AdminThemeContext";

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
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

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

  const themeInput = isDark ? "bg-zinc-900 border-white/10 text-white" : "bg-white border-black/10 text-black";
  const themeTextMuted = isDark ? "text-white/40" : "text-black/40";
  const themeTextMoreMuted = isDark ? "text-white/20" : "text-black/20";
  const themeCardInner = isDark ? "border-white/5" : "border-black/5";

  return (
    <div className={`p-8 ${isDark ? 'bg-transparent text-white' : 'bg-white text-black'} transition-colors duration-300`}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-8 tracking-tight">
          {form._id ? "Update" : "Create"} Fixture
        </h2>

        {formError && <p className="text-red-500 text-xs font-bold mb-6">{formError}</p>}

        <form onSubmit={handleSubmit} className="space-y-6 mb-16">
          <div className="space-y-1.5">
            <label className={`text-[10px] font-bold uppercase ${themeTextMuted} tracking-widest ml-1`}>Match Round</label>
            <select
              className={`w-full ${themeInput} rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all`}
              value={form.matchRound || ""}
              onChange={(e) => setForm({ ...form, matchRound: e.target.value })}
              aria-label="Select Match Round"
              title="Select Match Round"
            >
              <option value="">Select Round</option>
              {["First Round", "Second Round", "Quarter-finals", "Semi-finals", "Final"].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase ${themeTextMuted} tracking-widest ml-1`}>Team A</label>
              <input
                className={`w-full ${themeInput} rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-black dark:focus:ring-white outline-none`}
                placeholder="Team A Name"
                value={form.teamA}
                onChange={(e) => setForm({ ...form, teamA: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase ${themeTextMuted} tracking-widest ml-1`}>Team B</label>
              <input
                className={`w-full ${themeInput} rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-black dark:focus:ring-white outline-none`}
                placeholder="Team B Name"
                value={form.teamB}
                onChange={(e) => setForm({ ...form, teamB: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase ${themeTextMuted} tracking-widest ml-1`}>Match Date & Time</label>
              <input
                type="datetime-local"
                value={form.matchDate}
                onChange={(e) => setForm({ ...form, matchDate: e.target.value })}
                className={`w-full ${themeInput} rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-black dark:focus:ring-white outline-none`}
                aria-label="Match Date and Time"
              />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase ${themeTextMuted} tracking-widest ml-1`}>Venue</label>
              <input
                className={`w-full ${themeInput} rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-black dark:focus:ring-white outline-none`}
                placeholder="Match Venue"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={`text-[10px] font-bold uppercase ${themeTextMuted} tracking-widest ml-1`}>Tournament</label>
            <select
              className={`w-full ${themeInput} rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-black dark:focus:ring-white outline-none`}
              value={typeof form.tournament === "object" ? (form.tournament as any)?._id : (form.tournament || "")}
              onChange={(e) => setForm({ ...form, tournament: e.target.value })}
              disabled={loadingTournaments}
              aria-label="Select Tournament"
              title="Select Tournament"
            >
              <option value="">Select Tournament</option>
              {tournaments.map((t) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>

          <button
            className={`w-full ${isDark ? 'bg-white text-black' : 'bg-black text-white'} font-bold text-xs uppercase tracking-widest py-4 rounded-lg hover:opacity-90 transition-all active:scale-[0.98]`}
            type="submit"
          >
            {form._id ? "Update Fixture" : "Create Fixture"}
          </button>
        </form>

        <div className={`flex items-center justify-between gap-4 mb-6 pt-8 border-t ${themeCardInner}`}>
          <h3 className={`text-xs font-bold uppercase tracking-widest ${themeTextMoreMuted}`}>History</h3>
          <div className="relative">
            <input
              className={`pl-9 pr-4 py-2 ${themeInput} rounded-lg text-[10px] font-bold focus:ring-1 focus:ring-black dark:focus:ring-white outline-none w-48 sm:w-64`}
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${themeTextMoreMuted}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><span className="loading loading-spinner loading-sm text-black/20 dark:text-white/20"></span></div>
        ) : (
          <div className="space-y-3">
            {filteredFixtures.sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime()).map((fix) => (
              <div key={fix._id} className={`border ${themeCardInner} p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-inherit transition-all group`}>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <p className="font-bold text-sm">{fix.teamA} <span className={`${themeTextMoreMuted} font-medium`}>vs</span> {fix.teamB}</p>
                    <span className={`text-[9px] font-black uppercase tracking-tighter ${themeTextMoreMuted} ${isDark ? 'bg-white/5' : 'bg-black/5'} px-1.5 py-0.5 rounded`}>{fix.matchRound}</span>
                  </div>
                  <div className={`flex flex-wrap justify-center sm:justify-start gap-x-3 gap-y-1 text-[10px] ${themeTextMuted} font-medium`}>
                    <p>📅 {new Date(fix.matchDate).toLocaleDateString()}</p>
                    <p>📍 {fix.venue || "No Venue"}</p>
                    <p>🏆 {getTournamentName(fix.tournament)}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleEdit(fix)} className={`px-3 py-1.5 border ${isDark ? 'border-white/10 hover:bg-white hover:text-black' : 'border-black/10 hover:bg-black hover:text-white'} text-[10px] font-bold rounded-lg transition-all`}>Edit</button>
                  <button onClick={() => handleDelete(fix._id!)} className="px-3 py-1.5 text-red-500 hover:bg-red-500/10 text-[10px] font-bold rounded-lg transition-all">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
