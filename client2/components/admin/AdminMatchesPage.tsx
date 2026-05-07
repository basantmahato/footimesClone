'use client';

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import Link from "next/link";
import { HiOutlineX } from "react-icons/hi";

const socket = io("https://api.footimes.com");

interface Tournament {
  _id: string;
  name: string;
}

interface Fixture {
  _id: string;
  teamA: string;
  teamB: string;
  matchDate: string;
  venue?: string;
  tournament: any;
}

interface LiveMatchStatus {
  status: string;
  startedAt?: string;
  resultA?: string;
  resultB?: string;
}

export default function AdminMatchesPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [liveMatches, setLiveMatches] = useState<Record<string, LiveMatchStatus>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const fetchFixturesAndLivescore = useCallback(async () => {
    if (!selectedTournamentId) return;

    try {
      const [fixtureRes, livescoreRes] = await Promise.all([
        axios.get("https://api.footimes.com/api/fixtures"),
        axios.get("https://api.footimes.com/api/livescore/all")
      ]);

      const tournamentFixtures = fixtureRes.data.filter(
        (f: Fixture) =>
          String(f.tournament?._id || f.tournament) === String(selectedTournamentId)
      );
      setFixtures(tournamentFixtures);

      const liveStatusMap: Record<string, LiveMatchStatus> = {};
      livescoreRes.data.forEach((match: any) => {
        liveStatusMap[match.fixtureId] = {
          status: match.status,
          startedAt: match.startedAt || undefined,
          resultA: match.resultA || '',
          resultB: match.resultB || '',
        };
      });
      setLiveMatches(liveStatusMap);
    } catch (err) {
      console.error("Error fetching fixtures/livescore:", err);
    }
  }, [selectedTournamentId]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await axios.get("https://api.footimes.com/api/tournaments");
        setTournaments(res.data);
        if (res.data.length > 0) {
          setSelectedTournamentId(res.data[0]._id);
        }
      } catch (err) {
        console.error("Error fetching tournaments:", err);
      }
    };
    fetchTournaments();
  }, []);

  useEffect(() => {
    fetchFixturesAndLivescore();
  }, [fetchFixturesAndLivescore]);

  useEffect(() => {
    socket.on("matchStarted", (match: any) => {
      setLiveMatches((prev) => ({
        ...prev,
        [match.fixtureId]: { startedAt: match.startedAt, status: "live" },
      }));
    });

    socket.on("matchEnded", (fixtureId: string) => {
      setLiveMatches((prev) => ({
        ...prev,
        [fixtureId]: { ...(prev[fixtureId] || {}), status: "ended" },
      }));
    });

    socket.on("liveMatchDeleted", ({ fixtureId }: { fixtureId: string }) => {
      setLiveMatches((prev) => {
        const updated = { ...prev };
        delete updated[fixtureId];
        return updated;
      });
      fetchFixturesAndLivescore();
    });

    return () => {
      socket.off("matchStarted");
      socket.off("matchEnded");
      socket.off("liveMatchDeleted");
    };
  }, [fetchFixturesAndLivescore]);

  const handlePauseMatch = async (fixtureId: string) => {
    try {
      await axios.patch(`https://api.footimes.com/api/livescore/${fixtureId}/status`, { status: "paused" });
      socket.emit("matchPaused", fixtureId);
      alert("⏸️ Match Paused (Half Time)");
      fetchFixturesAndLivescore();
    } catch (err) {
      alert("❌ Could not pause match.");
    }
  };

  const handleResumeMatch = async (fixtureId: string) => {
    try {
      await axios.patch(`https://api.footimes.com/api/livescore/${fixtureId}/status`, { status: "live" });
      socket.emit("matchResumed", fixtureId);
      alert("▶️ Match Resumed (2nd Half)");
      fetchFixturesAndLivescore();
    } catch (err) {
      alert("❌ Could not resume match.");
    }
  };

  const handleStartLive = async (fix: Fixture) => {
    const now = new Date().toISOString();
    try {
      await axios.patch(`https://api.footimes.com/api/livescore/${fix._id}/status`, { status: "live", startedAt: now });
      socket.emit("matchStarted", { fixtureId: fix._id, startedAt: now });
      alert("✅ Match Started");
      fetchFixturesAndLivescore();
    } catch (err) {
      alert("❌ Could not start match.");
    }
  };

  const handleEndMatch = async (fixtureId: string) => {
    try {
      await axios.patch(`https://api.footimes.com/api/livescore/${fixtureId}/status`, { status: "ended" });
      socket.emit("matchEnded", fixtureId);
      alert("🛑 Match Ended");
      fetchFixturesAndLivescore();
    } catch (err) {
      alert("❌ Could not end match.");
    }
  };

  const formatElapsedTime = (startTime?: string) => {
    if (!startTime) return "00:00";
    const now = new Date().getTime();
    const elapsed = now - new Date(startTime).getTime();
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const filteredFixtures = fixtures.filter((fix) => {
    if (selectedDate) {
      const matchDate = new Date(fix.matchDate).toISOString().slice(0, 10);
      if (matchDate !== selectedDate) return false;
    }
    if (!searchTerm.trim()) return true;
    const lower = searchTerm.toLowerCase();
    const teamVsTeam = `${fix.teamA} vs ${fix.teamB}`.toLowerCase();
    return (
      fix.teamA?.toLowerCase().includes(lower) ||
      fix.teamB?.toLowerCase().includes(lower) ||
      fix.venue?.toLowerCase().includes(lower) ||
      teamVsTeam.includes(lower)
    );
  });

  const sortedFixtures = [...filteredFixtures].sort(
    (a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime()
  );

  return (
    <div className="p-6 max-w-6xl mx-auto text-white bg-black">
      <h1 className="text-xl font-bold mb-8 text-center text-pink-500 uppercase tracking-tighter">
        Match Control Panel
      </h1>

      <nav className="bg-zinc-900/50 border border-white/5 p-4 rounded-3xl shadow-xl mb-8">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {tournaments.map((t) => (
              <button
                key={t._id}
                onClick={() => setSelectedTournamentId(t._id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedTournamentId === t._id
                    ? "bg-pink-600 text-white shadow-lg shadow-pink-600/20"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-zinc-800 border border-white/10 text-white px-4 py-2 rounded-xl text-xs focus:ring-2 focus:ring-pink-500 outline-none"
              aria-label="Filter by Date"
              title="Filter matches by date"
            />
            {selectedDate && (
              <button onClick={() => setSelectedDate("")} className="text-xs text-red-400 font-bold hover:underline">
                Clear
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="relative max-w-md mx-auto mb-10">
        <input
          type="text"
          placeholder="Search matches (team, venue, etc)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-10 py-3 bg-zinc-900/50 border border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500 outline-none transition-all"
        />
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        {searchTerm && (
          <HiOutlineX onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 cursor-pointer hover:text-white" />
        )}
      </div>

      <div className="overflow-hidden bg-zinc-900/30 border border-white/5 rounded-3xl shadow-2xl">
        <table className="min-w-full">
          <thead>
            <tr className="bg-zinc-900/80 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">
              <th className="px-6 py-4 text-left">Match</th>
              <th className="px-6 py-4 text-left">Date</th>
              <th className="px-6 py-4 text-left">Venue</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedFixtures.map((fix) => {
              const statusInfo = liveMatches[fix._id];
              const status = statusInfo?.status || "not_started";
              
              return (
                <tr key={fix._id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col text-sm font-bold">
                      <span className="flex items-center gap-2">
                        {fix.teamA} {status === "ended" && statusInfo?.resultA === "win" && "🏆"}
                      </span>
                      <span className="text-[10px] text-pink-500/50 my-1">VS</span>
                      <span className="flex items-center gap-2">
                        {fix.teamB} {status === "ended" && statusInfo?.resultB === "win" && "🏆"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-xs text-zinc-400">
                    {new Date(fix.matchDate).toLocaleDateString()}
                    <br/>
                    <span className="text-[10px] opacity-50">{new Date(fix.matchDate).toLocaleTimeString()}</span>
                  </td>
                  <td className="px-6 py-5 text-xs text-zinc-400 italic">
                    {fix.venue || "N/A"}
                  </td>
                  <td className="px-6 py-5">
                    {status === "live" ? (
                      <span className="flex items-center gap-2 text-[10px] font-black text-green-400 uppercase animate-pulse">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        LIVE ({formatElapsedTime(statusInfo?.startedAt)})
                      </span>
                    ) : status === "ended" ? (
                      <span className="text-[10px] font-black text-zinc-500 uppercase border border-white/10 px-2 py-0.5 rounded-full">Ended</span>
                    ) : (
                      <span className="text-[10px] font-black text-pink-500/50 uppercase border border-pink-500/10 px-2 py-0.5 rounded-full">Scheduled</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex flex-col gap-2 items-end">
                      <Link
                        href={`/admin/update-live/${fix._id}`}
                        className="px-4 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-[11px] font-bold transition-all shadow-lg shadow-pink-600/10"
                      >
                        Update Details
                      </Link>

                      {status === "live" && (
                        <>
                          <button onClick={() => handlePauseMatch(fix._id)} className="text-[10px] font-bold text-yellow-500 hover:underline">Pause (HT)</button>
                          <button onClick={() => handleEndMatch(fix._id)} className="text-[10px] font-bold text-red-500 hover:underline">End Match</button>
                        </>
                      )}

                      {status === "paused" && (
                        <button onClick={() => handleResumeMatch(fix._id)} className="text-[10px] font-bold text-green-500 hover:underline">Resume (2H)</button>
                      )}

                      {status === "not_started" && (
                        <button onClick={() => handleStartLive(fix)} className="text-[11px] font-bold text-green-500 border border-green-500/20 px-3 py-1 rounded-lg hover:bg-green-500 hover:text-black transition-all">Start Live</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
