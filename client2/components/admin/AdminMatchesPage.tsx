'use client';

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import Link from "next/link";
import { HiOutlineX } from "react-icons/hi";
import { useAdminTheme } from "./AdminThemeContext";

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
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

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

  const themeInput = isDark ? "bg-zinc-900 border-white/10 text-white" : "bg-white border-black/10 text-black";
  const themeTextMuted = isDark ? "text-white/40" : "text-black/40";
  const themeTextMoreMuted = isDark ? "text-white/20" : "text-black/20";
  const themeCardInner = isDark ? "border-white/5 bg-white/[0.01]" : "border-black/5 bg-white";

  return (
    <div className={`p-8 ${isDark ? 'bg-transparent text-white' : 'bg-white text-black'} transition-colors duration-300`}>
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-2xl font-bold tracking-tight mb-1">Match Management</h1>
           <p className={`${themeTextMuted} text-xs`}>Control live scores and update fixture statuses.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className={`${themeInput} text-xs font-bold px-4 py-2 rounded-lg focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all`}
              aria-label="Filter by Date"
            />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search matches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-9 pr-4 py-2 ${themeInput} rounded-lg text-xs font-bold focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all w-48 sm:w-64`}
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${themeTextMoreMuted}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        </div>
      </div>

      <div className={`mb-8 flex flex-wrap gap-1.5 border-b ${isDark ? 'border-white/5' : 'border-black/5'} pb-4`}>
        {tournaments.map((t) => (
          <button
            key={t._id}
            onClick={() => setSelectedTournamentId(t._id)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedTournamentId === t._id
                ? (isDark ? "bg-white text-black" : "bg-black text-white")
                : `${themeTextMuted} hover:text-inherit hover:bg-black/5 dark:hover:bg-white/5`
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className={`border ${isDark ? 'border-white/10' : 'border-black/5'} rounded-xl overflow-hidden shadow-sm`}>
        <table className={`min-w-full divide-y ${isDark ? 'divide-white/5' : 'divide-black/5'}`}>
          <thead>
            <tr className={`${isDark ? 'bg-white/5' : 'bg-black/[0.02]'} text-[10px] uppercase tracking-widest ${themeTextMoreMuted} font-black`}>
              <th className="px-6 py-4 text-left">Match Details</th>
              <th className="px-6 py-4 text-left">Date & Venue</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-right">Control</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-black/5'} ${isDark ? 'bg-transparent' : 'bg-white'}`}>
            {sortedFixtures.map((fix) => {
              const statusInfo = liveMatches[fix._id];
              const status = statusInfo?.status || "not_started";
              
              return (
                <tr key={fix._id} className={`${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.01]'} transition-colors group`}>
                  <td className="px-6 py-5">
                    <div className="flex flex-col text-sm font-bold">
                      <div className="flex items-center gap-2">
                        <span className={status === "ended" && statusInfo?.resultA === "win" ? "text-inherit" : themeTextMuted}>{fix.teamA}</span>
                        {status === "ended" && statusInfo?.resultA === "win" && <div className={`w-1.5 h-1.5 ${isDark ? 'bg-white' : 'bg-black'} rounded-full`}></div>}
                      </div>
                      <div className={`text-[10px] ${themeTextMoreMuted} my-0.5`}>vs</div>
                      <div className="flex items-center gap-2">
                        <span className={status === "ended" && statusInfo?.resultB === "win" ? "text-inherit" : themeTextMuted}>{fix.teamB}</span>
                        {status === "ended" && statusInfo?.resultB === "win" && <div className={`w-1.5 h-1.5 ${isDark ? 'bg-white' : 'bg-black'} rounded-full`}></div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs font-bold">{new Date(fix.matchDate).toLocaleDateString()}</div>
                    <div className={`text-[10px] ${themeTextMuted} font-medium`}>{new Date(fix.matchDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {fix.venue || "No Venue"}</div>
                  </td>
                  <td className="px-6 py-5">
                    {status === "live" ? (
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase border ${isDark ? 'border-white text-white' : 'border-black text-black'} px-2 py-0.5 rounded-md`}>
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                        Live {formatElapsedTime(statusInfo?.startedAt)}
                      </span>
                    ) : status === "paused" ? (
                      <span className={`text-[10px] font-black ${themeTextMuted} uppercase border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'} px-2 py-0.5 rounded-md`}>Half Time</span>
                    ) : status === "ended" ? (
                      <span className={`text-[10px] font-black ${themeTextMuted} uppercase border ${isDark ? 'border-white/10' : 'border-black/10'} px-2 py-0.5 rounded-md`}>Finished</span>
                    ) : (
                      <span className={`text-[10px] font-black ${themeTextMoreMuted} uppercase tracking-tight`}>Scheduled</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex flex-col gap-1.5 items-end">
                      <Link
                        href={`/admin/update-live/${fix._id}`}
                        className={`px-3 py-1 ${isDark ? 'bg-white text-black hover:bg-white/80' : 'bg-black text-white hover:bg-black/80'} rounded text-[10px] font-bold transition-all`}
                      >
                        Edit Match
                      </Link>

                      <div className="flex gap-2">
                        {status === "live" && (
                          <>
                            <button onClick={() => handlePauseMatch(fix._id)} className={`text-[10px] font-bold ${themeTextMuted} hover:text-inherit`}>Pause</button>
                            <button onClick={() => handleEndMatch(fix._id)} className="text-[10px] font-bold text-red-500 hover:text-red-700">End</button>
                          </>
                        )}
                        {status === "paused" && (
                          <button onClick={() => handleResumeMatch(fix._id)} className="text-[10px] font-bold text-inherit hover:underline">Resume</button>
                        )}
                        {status === "not_started" && (
                          <button onClick={() => handleStartLive(fix)} className="text-[10px] font-bold text-inherit hover:underline">Start Live</button>
                        )}
                      </div>
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
