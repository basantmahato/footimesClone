import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import { HiOutlineX } from "react-icons/hi";

const socket = io("https://api.footimes.com");

export default function AdminMatchesPage() {
  const [tournaments, setTournaments] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [liveMatches, setLiveMatches] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Fetch tournaments
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

  // Fetch fixtures and livescore for selected tournament
  const fetchFixturesAndLivescore = useCallback(async () => {
    if (!selectedTournamentId) return;

    try {
      const fixtureRes = await axios.get(
        "https://api.footimes.com/api/fixtures"
      );
      const livescoreRes = await axios.get(
        "https://api.footimes.com/api/livescore/all"
      );

      const tournamentFixtures = fixtureRes.data.filter(
        (f) =>
          String(f.tournament?._id || f.tournament) ===
          String(selectedTournamentId)
      );
      setFixtures(tournamentFixtures);

      const liveStatusMap = {};
      livescoreRes.data.forEach((match) => {
        liveStatusMap[match.fixtureId] = {
          status: match.status,
          startedAt: match.startedAt || null,
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
    fetchFixturesAndLivescore();
  }, [fetchFixturesAndLivescore]);

  // Setup socket events
  useEffect(() => {
    socket.on("matchStarted", (match) => {
      setLiveMatches((prev) => ({
        ...prev,
        [match.fixtureId]: { startedAt: match.startedAt, status: "live" },
      }));
    });

    socket.on("matchEnded", (fixtureId) => {
      setLiveMatches((prev) => ({
        ...prev,
        [fixtureId]: { ...(prev[fixtureId] || {}), status: "ended" },
      }));
    });

    socket.on("liveMatchDeleted", ({ fixtureId }) => {
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
      ) {
        e.preventDefault();
        const term = window.prompt(
          "Search matches (by team, venue, etc):",
          searchTerm
        );
        if (term !== null) setSearchTerm(term);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchTerm]);

  const handlePauseMatch = async (fixtureId) => {
    try {
      await axios.patch(
        `https://api.footimes.com/api/livescore/${fixtureId}/status`,
        {
          status: "paused",
        }
      );
      socket.emit("matchPaused", fixtureId);
      alert("⏸️ Match Paused (Half Time)");
      fetchFixturesAndLivescore();
    } catch (err) {
      console.error(err);
      alert("❌ Could not pause match.");
    }
  };

  const handleResumeMatch = async (fixtureId) => {
    try {
      await axios.patch(
        `https://api.footimes.com/api/livescore/${fixtureId}/status`,
        {
          status: "live",
        }
      );
      socket.emit("matchResumed", fixtureId);
      alert("▶️ Match Resumed (2nd Half)");
      fetchFixturesAndLivescore();
    } catch (err) {
      console.error(err);
      alert("❌ Could not resume match.");
    }
  };

  // Actions
  const handleStartLive = async (fix) => {
    const now = new Date().toISOString();
    try {
      await axios.patch(
        `https://api.footimes.com/api/livescore/${fix._id}/status`,
        {
          status: "live",
          startedAt: now,
        }
      );
      socket.emit("matchStarted", { fixtureId: fix._id, startedAt: now });
      alert("✅ Match Started");
    } catch (err) {
      console.error(err);
      alert("❌ Could not start match.");
    }
  };

  const handleEndMatch = async (fixtureId) => {
    try {
      await axios.patch(
        `https://api.footimes.com/api/livescore/${fixtureId}/status`,
        {
          status: "ended",
        }
      );
      socket.emit("matchEnded", fixtureId);
      alert("🛑 Match Ended");
    } catch (err) {
      console.error(err);
      alert("❌ Could not end match.");
    }
  };

  const formatElapsedTime = (startTime) => {
    const now = new Date();
    const elapsed = now - new Date(startTime);
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getTournamentName = (tournamentId) => {
    const t = tournaments.find(
      (t) => String(t._id) === String(tournamentId?._id || tournamentId)
    );
    return t?.name || "Unknown";
  };

  // Filter fixtures by search term (case-insensitive, matches teamA, teamB, venue, tournament, team vs team)
  const filteredFixtures = fixtures.filter((fix) => {
    // Date filter
    if (selectedDate) {
      const matchDate = new Date(fix.matchDate).toISOString().slice(0, 10);
      if (matchDate !== selectedDate) return false;
    }
    // Search filter
    if (!searchTerm.trim()) return true;
    const lower = searchTerm.toLowerCase();
    const teamVsTeam = `${fix.teamA} vs ${fix.teamB}`.toLowerCase();
    return (
      (fix.teamA && fix.teamA.toLowerCase().includes(lower)) ||
      (fix.teamB && fix.teamB.toLowerCase().includes(lower)) ||
      (fix.venue && fix.venue.toLowerCase().includes(lower)) ||
      getTournamentName(fix.tournament).toLowerCase().includes(lower) ||
      teamVsTeam.includes(lower)
    );
  });

  const sortedFixtures = [...filteredFixtures].sort(
    (a, b) => new Date(b.matchDate) - new Date(a.matchDate)
  );

  return (
    <div className="p-6 max-w-6xl mx-auto text-white bg-black mb-10">
      <h1 className="text-sm md:text-xl mb-6 text-center ">
        Admin Match Control Panel
      </h1>

      {/* Tournament Buttons */}
      <nav className="bg-black p-3 rounded-t-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <ul className="flex flex-wrap gap-4">
            {tournaments.map((t) => (
              <li key={t._id}>
                <button
                  onClick={() => setSelectedTournamentId(t._id)}
                  className={`px-4 py-2 rounded-full text-[13px] transition-colors duration-200 ${
                    selectedTournamentId === t._id
                      ? "bg-pink-600 text-white"
                      : "bg-white text-black hover:bg-pink-400 hover:text-white"
                  }`}
                >
                  {t.name}
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 ml-6">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="border-none bg-pink-500 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-white text-[13px] transition"
              style={{ minWidth: 120 }}
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate("")}
                className="px-2 py-1 rounded text-xs border border-pink-500 text-white hover:bg-red-700 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 3a7.5 7.5 0 100 15 7.5 7.5 0 000-15zM21 21l-4.35-4.35"
          />
        </svg>
        <input
          type="text"
          placeholder="Search matches (by team, venue, etc)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pr-10 pl-8 border border-pink-600 bg-black text-white py-2 text-[13px] rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500"
        />
        {searchTerm && (
          <HiOutlineX
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-400 hover:text-white cursor-pointer"
            size={18}
          />
        )}
      </div>

      {/* Match Display */}
      {selectedTournamentId === "" && tournaments.length > 0 ? (
        <p className="text-red-500 text-center text-sm mt-10">
          Please select a tournament to view matches.
        </p>
      ) : sortedFixtures.length === 0 ? (
        <p className="text-gray-500 text-center text-[13px] mt-10">
          No matches found for this tournament.
        </p>
      ) : (
        <div className="overflow-x-auto bg-black rounded-lg shadow-lg">
          <table className="min-w-full divide-y divide-pink-600">
            <thead className="bg-pink-600">
              <tr>
                {["Match", "Date", "Venue", "Status", "Actions"].map((head) => (
                  <th
                    key={head}
                    className="px-6 py-3 text-left text-xs font-medium text-white"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-900">
              {sortedFixtures.map((fix) => {
                const statusInfo = liveMatches[fix._id];
                const status = statusInfo?.status || "not_started";
                const startedAt = statusInfo?.startedAt;

                return (
                  <tr key={fix._id} className="hover:bg-pink-950">
                    <td className="px-6 py-4 text-[13px] text-white font-medium">
  <div className="flex items-center gap-1">
    {fix.teamA}
    {status === "ended" && statusInfo?.resultA === "win" && (
      <span className="text-yellow-400 text-xs ml-1">🏆</span>
    )}
  </div>
  <span className="text-pink-600">vs</span>
  <div className="flex items-center gap-1">
    {fix.teamB}
    {status === "ended" && statusInfo?.resultB === "win" && (
      <span className="text-yellow-400 text-xs ml-1">🏆</span>
    )}
  </div>
</td>
                    <td className="px-6 py-4 text-[13px] text-gray-500">
                      {new Date(fix.matchDate).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-gray-500">
                      {fix.venue || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-[13px]">
                      {status === "live" && (
                        <span className="px-2 py-1 rounded-full text-xs bg-pink-600 text-white animate-pulse">
                          🔴 LIVE ({formatElapsedTime(startedAt)})
                        </span>
                      )}
                      {status === "ended" && (
                        <span className="px-2 py-1 rounded-full text-[13px] bg-red-600 text-white border border-red-600">
                          Ended
                        </span>
                      )}
                      {status === "not_started" && (
                        <span className="px-2 py-1 rounded-full text-[13px] bg-white text-pink-600 border border-pink-600">
                          Not&nbsp;Started
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col gap-2">
                        <Link
                          to={`/admin/update-live/${fix._id}`}
                          state={{
                            tournamentName: getTournamentName(fix.tournament),
                          }}
                          className="px-2 py-2 hover:bg-green-600 bg-pink-700 transition-all text-white rounded text-[13px] text-center"
                        >
                          Update
                        </Link>

                        {status === "live" && (
                          <>
                            <button
                              onClick={() => handlePauseMatch(fix._id)}
                              className="px-3 py-1 bg-black hover:bg-pink-900 text-white rounded text-[13px] transition-all"
                            >
                              Stop (Half Time)
                            </button>
                            <button
                              onClick={() => handleEndMatch(fix._id)}
                              className="px-3 py-1 bg-pink-900 hover:bg-red-700 text-white rounded text-[13px] transition-all"
                            >
                              🛑 End
                            </button>
                          </>
                        )}

                        {status === "paused" && (
                          <>
                            <button
                              onClick={() => handleResumeMatch(fix._id)}
                              className="px-3 py-1 bg-pink-500 hover:bg-pink-600 text-white rounded text-[13px] transition-all"
                            >
                              ▶️ Resume (2nd Half)
                            </button>
                            <button
                              onClick={() => handleEndMatch(fix._id)}
                              className="px-3 py-1 bg-pink-900 hover:bg-red-700 text-white rounded text-[13px] transition-all"
                            >
                              🛑 End
                            </button>
                          </>
                        )}

                        {status === "not_started" && (
                          <button
                            onClick={() => handleStartLive(fix)}
                            className="px-8 py-1 bg-green-700 hover:bg-pink-500 text-white hover:text-white active:bg-red-500 rounded text-[13px] transition-all"
                          >
                            Start&nbsp;Live
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}