'use client';

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import io from "socket.io-client";

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
    <div className="flex items-center justify-center h-screen bg-black">
      <span className="loading loading-spinner text-pink-500"></span>
    </div>
  );

  if (error) return <div className="p-10 text-red-500 text-center">{error}</div>;

  const renderPlayerInputs = (field: keyof FormState, teamLabel: string) => (
    <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">{teamLabel}</h3>
        <button
          type="button"
          onClick={() => addToArray(field)}
          className="text-[10px] font-black text-pink-500 uppercase border border-pink-500/20 px-3 py-1 rounded-full hover:bg-pink-500 hover:text-white transition-all"
        >
          + Add Player
        </button>
      </div>
      <div className="space-y-3">
        {(form[field] as Player[]).map((player, i) => (
          <div key={`${field}-${i}`} className="flex gap-2 group animate-in slide-in-from-right-2 duration-300">
            <input
              placeholder="Name"
              value={player.name}
              onChange={(e) => updateArray(field, i, "name", e.target.value)}
              className="flex-[2] bg-black border border-white/10 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-pink-500"
            />
            <input
              placeholder="#"
              type="number"
              value={player.number}
              onChange={(e) => updateArray(field, i, "number", e.target.value)}
              className="w-16 bg-black border border-white/10 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-pink-500"
            />
            <select
              value={player.position}
              onChange={(e) => updateArray(field, i, "position", e.target.value)}
              className="flex-1 bg-black border border-white/10 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-pink-500 appearance-none"
            >
              <option value="">Pos</option>
              {playerPositions.map((pos) => <option key={pos} value={pos}>{pos}</option>)}
            </select>
            <button
              type="button"
              onClick={() => removeFromArray(field, i)}
              className="p-3 text-zinc-600 hover:text-red-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-black min-h-screen text-white pb-32">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">LIVE <span className="text-pink-500">UPDATE</span></h1>
          <p className="text-xs font-bold text-pink-500 uppercase tracking-widest">{tournamentNameFromState}</p>
        </div>

        <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 shadow-2xl mb-8">
          <div className="flex items-center justify-between gap-6 mb-12">
            <div className="flex-1 text-center">
              <h2 className="text-xl font-bold mb-4">{fixture?.teamA}</h2>
              <select
                value={form.resultA}
                onChange={(e) => setForm({ 
                  ...form, 
                  resultA: e.target.value, 
                  resultB: e.target.value === "win" ? "lose" : e.target.value === "lose" ? "win" : "draw" 
                })}
                className="w-full bg-black border border-white/10 p-2 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-1 focus:ring-pink-500"
              >
                <option value="">Result</option>
                <option value="win">Win</option>
                <option value="lose">Lose</option>
                <option value="draw">Draw</option>
              </select>
              <div className="mt-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase mb-2 block">Score</label>
                <input
                  type="number"
                  value={form.scoreA}
                  onChange={(e) => setForm({ ...form, scoreA: Math.max(0, Number(e.target.value)) })}
                  className="w-20 text-4xl font-black bg-transparent border-none text-center focus:outline-none text-pink-500"
                />
              </div>
            </div>

            <div className="text-2xl font-black text-zinc-700">VS</div>

            <div className="flex-1 text-center">
              <h2 className="text-xl font-bold mb-4">{fixture?.teamB}</h2>
              <select
                value={form.resultB}
                onChange={(e) => setForm({ 
                  ...form, 
                  resultB: e.target.value, 
                  resultA: e.target.value === "win" ? "lose" : e.target.value === "lose" ? "win" : "draw" 
                })}
                className="w-full bg-black border border-white/10 p-2 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-1 focus:ring-pink-500"
              >
                <option value="">Result</option>
                <option value="win">Win</option>
                <option value="lose">Lose</option>
                <option value="draw">Draw</option>
              </select>
              <div className="mt-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase mb-2 block">Score</label>
                <input
                  type="number"
                  value={form.scoreB}
                  onChange={(e) => setForm({ ...form, scoreB: Math.max(0, Number(e.target.value)) })}
                  className="w-20 text-4xl font-black bg-transparent border-none text-center focus:outline-none text-pink-500"
                />
              </div>
            </div>
          </div>
          
          <div className="text-center text-[10px] font-bold text-zinc-500 border-t border-white/5 pt-6">
            SCHEDULED FOR: {new Date(fixture?.matchDate).toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {renderPlayerInputs("playersA", `${fixture?.teamA} Lineup`)}
            {renderPlayerInputs("subsA", `${fixture?.teamA} Bench`)}
          </div>
          <div>
            {renderPlayerInputs("playersB", `${fixture?.teamB} Lineup`)}
            {renderPlayerInputs("subsB", `${fixture?.teamB} Bench`)}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-black/80 backdrop-blur-xl border-t border-white/5 z-50">
          <div className="max-w-4xl mx-auto flex gap-4">
            <button onClick={() => router.back()} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-2xl transition-all">Cancel</button>
            <button onClick={deleteLiveMatch} className="flex-1 bg-red-900/30 hover:bg-red-900 text-red-500 hover:text-white font-bold py-4 rounded-2xl transition-all">Reset Data</button>
            <button onClick={updateLiveMatch} className="flex-[2] bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-pink-600/20 transition-all active:scale-[0.98]">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
