'use client';

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import io from "socket.io-client";
import { GoChevronLeft } from "react-icons/go";
import { useAdminTheme } from "@/components/admin/AdminThemeContext";

const socket = io("https://api.footimes.com");

const playerPositions = [
  "Goalkeeper", "Defender", "Midfielder", "Forward",
  "Center-back", "Full-back", "Wing-back", "Defensive Midfielder",
  "Central Midfielder", "Attacking Midfielder", "Winger", "Striker", "Center Forward",
];

interface Player {
  name: string;
  number: string;
  position: string;
}

interface FormState {
  scoreA: number;
  scoreB: number;
  playersA: Player[];
  playersB: Player[];
  subsA: Player[];
  subsB: Player[];
  resultA: string;
  resultB: string;
}

export default function AdminLiveUpdatePage() {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const params = useParams();
  const fixtureId = params?.fixtureId as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const tournamentNameFromState = searchParams.get("tournamentName") || "Unknown Tournament";

  const emptyPlayer: Player = { name: "", number: "", position: "" };

  const [fixture, setFixture] = useState<any>(null);
  const [form, setForm] = useState<FormState>({
    scoreA: 0,
    scoreB: 0,
    playersA: [emptyPlayer],
    playersB: [emptyPlayer],
    subsA: [emptyPlayer],
    subsB: [emptyPlayer],
    resultA: "",
    resultB: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fixtureId) return;
    fetchMatchData();

    socket.on("liveMatchUpdated", (data: any) => {
      if (data.fixtureId === fixtureId) {
        setForm(data);
      }
    });

    return () => {
      socket.off("liveMatchUpdated");
    };
  }, [fixtureId]);

  const fetchMatchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fixtureRes = await axios.get(`https://api.footimes.com/api/fixtures/${fixtureId}`);
      setFixture(fixtureRes.data);

      try {
        const liveRes = await axios.get(`https://api.footimes.com/api/livescore?fixtureId=${fixtureId}`);
        const live = liveRes.data;

        setForm({
          scoreA: live.scoreA ?? 0,
          scoreB: live.scoreB ?? 0,
          playersA: live.playersA?.length ? live.playersA : [emptyPlayer],
          playersB: live.playersB?.length ? live.playersB : [emptyPlayer],
          subsA: live.subsA?.length ? live.subsA : [emptyPlayer],
          subsB: live.subsB?.length ? live.subsB : [emptyPlayer],
          resultA: live.resultA || "",
          resultB: live.resultB || "",
        });
      } catch (err: any) {
        if (err.response?.status === 404) {
          setForm({
            scoreA: 0,
            scoreB: 0,
            playersA: [emptyPlayer],
            playersB: [emptyPlayer],
            subsA: [emptyPlayer],
            subsB: [emptyPlayer],
            resultA: "",
            resultB: "",
          });
        } else throw err;
      }
    } catch (err) {
      setError("Failed to load match data.");
    } finally {
      setLoading(false);
    }
  };

  const updateLiveMatch = async () => {
    try {
      const tournamentNameToSave = fixture?.tournamentName || tournamentNameFromState;
      const res = await axios.get(`https://api.footimes.com/api/livescore?fixtureId=${fixtureId}`);
      const existing = res.data;

      await axios.patch(`https://api.footimes.com/api/livescore/${fixtureId}`, {
        ...existing,
        scoreA: form.scoreA,
        scoreB: form.scoreB,
        playersA: form.playersA,
        playersB: form.playersB,
        subsA: form.subsA,
        subsB: form.subsB,
        resultA: form.resultA,
        resultB: form.resultB,
        tournamentName: tournamentNameToSave,
      });

      socket.emit("liveMatchUpdated", { fixtureId, tournamentName: tournamentNameToSave, ...form });
      alert("✅ Saved");
      router.back();
    } catch (err: any) {
      if (err.response?.status === 404) {
        const tournamentNameToSave = fixture?.tournamentName || tournamentNameFromState;
        await axios.post(`https://api.footimes.com/api/livescore`, {
          fixtureId,
          teamA: fixture.teamA,
          teamB: fixture.teamB,
          tournamentName: tournamentNameToSave,
          ...form
        });
        socket.emit("liveMatchUpdated", { fixtureId, tournamentName: tournamentNameToSave, ...form });
        alert("✅ Created and Saved");
        router.back();
      } else {
        alert("❌ Error saving");
      }
    }
  };

  const deleteLiveMatch = async () => {
    if (window.confirm("Delete live data?")) {
      try {
        await axios.delete(`https://api.footimes.com/api/livescore/${fixtureId}`);
        socket.emit("liveMatchDeleted", { fixtureId });
        alert("✅ Deleted");
        router.back();
      } catch (err) {
        alert("❌ Error deleting");
      }
    }
  };

  const updateArray = (field: keyof FormState, index: number, key: keyof Player, value: string) => {
    const updated = [...(form[field] as any[])];
    updated[index] = { ...updated[index], [key]: value };
    setForm({ ...form, [field]: updated });
  };

  const addToArray = (field: keyof FormState) => {
    setForm({ ...form, [field]: [...(form[field] as any[]), emptyPlayer] });
  };

  const removeFromArray = (field: keyof FormState, index: number) => {
    if ((form[field] as any[]).length <= 1) return;
    const updated = (form[field] as any[]).filter((_, i) => i !== index);
    setForm({ ...form, [field]: updated });
  };

  if (loading) return (
    <div className={`flex items-center justify-center h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
      <span className={`loading loading-spinner loading-sm ${isDark ? 'text-white/20' : 'text-black/20'}`}></span>
    </div>
  );

  if (error) return <div className={`p-10 text-red-500 text-center text-xs font-bold uppercase tracking-widest ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'}`}>{error}</div>;

  const themeInput = isDark ? "bg-zinc-900 border-white/10 text-white" : "bg-white border-black/10 text-black";
  const themeTextMuted = isDark ? "text-white/40" : "text-black/40";
  const themeCard = isDark ? "bg-white/5 border-white/10" : "bg-white border-black/5 shadow-sm";

  const renderPlayerInputs = (field: keyof FormState, teamLabel: string) => (
    <div className={`border ${themeCard} p-6 rounded-xl mb-6`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${themeTextMuted}`}>{teamLabel}</h3>
        <button
          type="button"
          onClick={() => addToArray(field)}
          className={`text-[9px] font-black uppercase tracking-widest border ${isDark ? 'border-white/10 hover:bg-white hover:text-black' : 'border-black/10 hover:bg-black hover:text-white'} px-3 py-1 rounded-md transition-all`}
        >
          Add Player
        </button>
      </div>
      <div className="space-y-2">
        {(form[field] as Player[]).map((player, i) => (
          <div key={`${field}-${i}`} className="flex gap-2 animate-in fade-in slide-in-from-right-1 duration-200">
            <input
              placeholder="Player Name"
              value={player.name || ""}
              onChange={(e) => updateArray(field, i, "name", e.target.value)}
              className={`flex-[2] ${themeInput} rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-1 focus:ring-black dark:focus:ring-white`}
            />
            <input
              placeholder="#"
              type="number"
              value={player.number || ""}
              onChange={(e) => updateArray(field, i, "number", e.target.value)}
              className={`w-14 ${themeInput} rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-1 focus:ring-black dark:focus:ring-white`}
            />
            <select
              value={player.position || ""}
              onChange={(e) => updateArray(field, i, "position", e.target.value)}
              className={`flex-1 ${themeInput} rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-1 focus:ring-black dark:focus:ring-white appearance-none`}
              aria-label="Player Position"
              title="Select Player Position"
            >
              <option value="">Pos</option>
              {playerPositions.map((pos) => <option key={pos} value={pos}>{pos}</option>)}
            </select>
            <button
              type="button"
              onClick={() => removeFromArray(field, i)}
              className={`p-2 ${isDark ? 'text-white/20' : 'text-black/20'} hover:text-red-500 transition-colors`}
              aria-label="Remove Player"
              title="Remove Player"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-white text-black'} pb-32 font-sans`}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <button 
              onClick={() => router.back()}
              className={`mb-4 flex items-center gap-2 ${themeTextMuted} hover:text-inherit transition-colors font-bold text-[10px] uppercase tracking-[0.2em]`}
            >
              <GoChevronLeft /> Control Panel
            </button>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Live Match Controller</h1>
            <p className={`${themeTextMuted} text-sm font-medium`}>{tournamentNameFromState}</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] bg-red-500/5 text-red-500 border border-red-500/10 px-4 py-2 rounded-full animate-pulse">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            Broadcasting Live
          </div>
        </header>

        <div className={`border ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/10 bg-white shadow-sm'} rounded-2xl p-10 mb-10`}>
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-10">
            <div className="text-center md:text-left space-y-6">
              <h2 className="text-xl font-bold tracking-tight">{fixture?.teamA}</h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-bold uppercase ${themeTextMuted} tracking-widest block ml-1`}>Score</label>
                  <input
                    type="number"
                    value={form.scoreA}
                    onChange={(e) => setForm({ ...form, scoreA: Math.max(0, Number(e.target.value)) })}
                    className={`w-full text-4xl font-bold ${isDark ? 'bg-zinc-900' : 'bg-black/5'} border-none rounded-xl py-4 text-center focus:outline-none`}
                    title="Team A Score"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-bold uppercase ${themeTextMuted} tracking-widest block ml-1`}>Result Status</label>
                  <select
                    value={form.resultA || ""}
                    onChange={(e) => setForm({ 
                      ...form, 
                      resultA: e.target.value, 
                      resultB: e.target.value === "win" ? "lose" : e.target.value === "lose" ? "win" : "draw" 
                    })}
                    className={`w-full ${themeInput} p-2.5 rounded-lg text-xs font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-black dark:focus:ring-white`}
                    aria-label="Team A Result Status"
                    title="Select Team A Result"
                  >
                    <option value="">Status</option>
                    <option value="win">Win</option>
                    <option value="lose">Lose</option>
                    <option value="draw">Draw</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className={`w-px h-16 ${isDark ? 'bg-white/5' : 'bg-black/5'} hidden md:block mb-4`}></div>
              <div className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/10' : 'text-black/20'}`}>vs</div>
              <div className={`w-px h-16 ${isDark ? 'bg-white/5' : 'bg-black/5'} hidden md:block mt-4`}></div>
            </div>

            <div className="text-center md:text-right space-y-6">
              <h2 className="text-xl font-bold tracking-tight">{fixture?.teamB}</h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-bold uppercase ${themeTextMuted} tracking-widest block mr-1`}>Score</label>
                  <input
                    type="number"
                    value={form.scoreB}
                    onChange={(e) => setForm({ ...form, scoreB: Math.max(0, Number(e.target.value)) })}
                    className={`w-full text-4xl font-bold ${isDark ? 'bg-zinc-900' : 'bg-black/5'} border-none rounded-xl py-4 text-center focus:outline-none`}
                    title="Team B Score"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-bold uppercase ${themeTextMuted} tracking-widest block mr-1`}>Result Status</label>
                  <select
                    value={form.resultB || ""}
                    onChange={(e) => setForm({ 
                      ...form, 
                      resultB: e.target.value, 
                      resultA: e.target.value === "win" ? "lose" : e.target.value === "lose" ? "win" : "draw" 
                    })}
                    className={`w-full ${themeInput} p-2.5 rounded-lg text-xs font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-black dark:focus:ring-white`}
                    aria-label="Team B Result Status"
                    title="Select Team B Result"
                  >
                    <option value="">Status</option>
                    <option value="win">Win</option>
                    <option value="lose">Lose</option>
                    <option value="draw">Draw</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`mt-10 pt-8 border-t ${isDark ? 'border-white/5' : 'border-black/5'} flex items-center justify-center gap-4 text-[10px] font-bold ${isDark ? 'text-white/20' : 'text-black/30'} uppercase tracking-widest`}>
            <span>{new Date(fixture?.matchDate).toLocaleDateString()}</span>
            <span>•</span>
            <span>{fixture?.venue || "No Venue"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {renderPlayerInputs("playersA", `${fixture?.teamA} XI`)}
            {renderPlayerInputs("subsA", `${fixture?.teamA} Bench`)}
          </div>
          <div>
            {renderPlayerInputs("playersB", `${fixture?.teamB} XI`)}
            {renderPlayerInputs("subsB", `${fixture?.teamB} Bench`)}
          </div>
        </div>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50">
          <div className={`${isDark ? 'bg-white text-black' : 'bg-black text-white'} p-2 rounded-2xl shadow-2xl flex gap-2`}>
            <button onClick={() => router.back()} className={`flex-1 px-6 py-3 text-xs font-bold uppercase tracking-widest ${isDark ? 'hover:bg-black/5' : 'hover:bg-white/10'} rounded-xl transition-all`}>Cancel</button>
            <button onClick={deleteLiveMatch} className="flex-1 px-6 py-3 text-xs font-bold uppercase tracking-widest text-red-500 hover:opacity-80 rounded-xl transition-all">Reset</button>
            <button onClick={updateLiveMatch} className={`flex-[2] ${isDark ? 'bg-black text-white hover:bg-black/90' : 'bg-white text-black hover:bg-white/90'} font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-all active:scale-[0.98]`}>Save Broadcast</button>
          </div>
        </div>
      </div>
    </div>
  );
}
