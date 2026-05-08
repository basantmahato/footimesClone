'use client';

import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import StandingsTable from "@/components/StandingsTable";

const defaultTeamLogo = "https://cdn-icons-png.flaticon.com/512/1099/1099672.png";
const defaultTournamentDetailsLogo = "https://static.vecteezy.com/system/resources/thumbnails/037/049/153/small_2x/football-match-clipart-flat-design-icon-isolated-on-transparent-background-3d-render-sport-and-exercise-concept-png.png";

interface Tournament {
  _id: string;
  name: string;
  logo?: string;
  location?: string;
}

interface Fixture {
  _id: string;
  matchDate: string;
  teamA: string;
  teamB: string;
  venue?: string;
}

interface LiveScore {
  _id: string;
  fixtureId: string;
  status: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  startedAt: string;
  tournamentName: string;
  venue?: string;
}

interface Props {
  id: string;
  initialInfo: Tournament;
}

interface TeamStats {
  team: string;
  mp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  logo?: string;
}

export default function TournamentDetailsClient({ id, initialInfo }: Props) {
  const [activeTab, setActiveTab] = useState("fixtures");
  const [tournamentInfo, setTournamentInfo] = useState<Tournament>(initialInfo);
  const [allFixtures, setAllFixtures] = useState<Fixture[]>([]);
  const [allLiveScores, setAllLiveScores] = useState<LiveScore[]>([]);
  const [standings, setStandings] = useState<TeamStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        const [fixturesRes, liveScoresRes, standingsRes] = await Promise.all([
          axios.get(`https://api.footimes.com/api/fixtures?tournament=${id}`),
          axios.get(`https://api.footimes.com/api/livescore/all`),
          axios.get(`https://api.footimes.com/api/livescore/standings/${id}`)
        ]);

        setAllFixtures(fixturesRes.data);
        const tournamentLiveScores = liveScoresRes.data.filter(
          (ls: LiveScore) => ls.tournamentName === initialInfo.name
        );
        setAllLiveScores(tournamentLiveScores);
        setStandings(standingsRes.data);
      } catch (err) {
        console.error("Failed to fetch tournament details:", err);
        setError("Failed to load tournament data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentData();
  }, [id, initialInfo.name]);

  const processedMatches = allFixtures
    .map((f) => {
      const liveScoreEntry = allLiveScores.find((ls) => ls.fixtureId === f._id);
      const venue = f.venue || tournamentInfo.location || "";

      if (liveScoreEntry && liveScoreEntry.status === "ended") {
        const date = new Date(liveScoreEntry.startedAt || f.matchDate);
        return {
          _id: f._id,
          type: "ended",
          date: date.toLocaleDateString("en-GB"),
          time: date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }),
          statusBadge: "ENDED",
          home: f.teamA,
          away: f.teamB,
          homeScore: liveScoreEntry.scoreA,
          awayScore: liveScoreEntry.scoreB,
          homeLogo: defaultTeamLogo,
          awayLogo: defaultTeamLogo,
          venue: venue,
        };
      } else if (!liveScoreEntry || liveScoreEntry.status === "not_started") {
        const date = new Date(f.matchDate);
        return {
          _id: f._id,
          type: "upcoming",
          date: date.toLocaleDateString("en-GB"),
          time: date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }),
          statusBadge: "UPCOMING",
          home: f.teamA,
          away: f.teamB,
          homeScore: null,
          awayScore: null,
          homeLogo: defaultTeamLogo,
          awayLogo: defaultTeamLogo,
          venue: venue,
        };
      }
      return null;
    })
    .filter((match) => match !== null)
    .sort((a, b) => {
      const dateA = new Date(`${a!.date.split("/").reverse().join("-")}T${a!.time}`).getTime();
      const dateB = new Date(`${b!.date.split("/").reverse().join("-")}T${b!.time}`).getTime();
      return dateB - dateA;
    });

  const liveMatches = allLiveScores
    .filter((ls) => ls.status === "live")
    .map((ls) => ({
      _id: ls._id,
      status: "LIVE",
      home: ls.teamA,
      away: ls.teamB,
      homeScore: ls.scoreA,
      awayScore: ls.scoreB,
      homeLogo: defaultTeamLogo,
      awayLogo: defaultTeamLogo,
      venue: ls.venue || tournamentInfo.location || "",
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <span className="loading loading-spinner text-pink-500"></span>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 text-white bg-[#121212] min-h-screen w-full">
      <div className="text-center mb-8">
        <div className="relative w-16 h-16 mx-auto mb-3">
          <Image
            src={tournamentInfo.logo || defaultTournamentDetailsLogo}
            alt={tournamentInfo.name}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-1">
          {tournamentInfo.location || "Unknown Location"}
        </h2>
        <h1 className="text-2xl font-bold mb-6">{tournamentInfo.name}</h1>

        <div className="flex justify-center gap-8 text-sm font-semibold border-b border-white/5 pb-2">
          {["fixtures", "live", "standings"].map((tab) => (
            <button
              key={tab}
              className={`pb-2 transition-all ${
                activeTab === tab
                  ? "border-b-2 border-pink-500 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "live" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-pink-500 uppercase tracking-wider mb-4">Live Matches</h3>
          {liveMatches.length === 0 ? (
            <div className="text-center p-8 rounded-2xl border border-dashed border-zinc-800 text-gray-500">
              No live matches at the moment
            </div>
          ) : (
            liveMatches.map((match) => (
              <div
                key={match._id}
                className="bg-[#1f1f1f] rounded-2xl p-5 border border-pink-500/30 animate-pulse"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">LIVE</span>
                  <span className="text-[10px] text-gray-400 font-medium">90'</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex flex-col items-center gap-2 w-1/3">
                    <div className="relative w-8 h-8">
                      <Image src={match.homeLogo} alt={match.home} fill className="rounded-full" />
                    </div>
                    <span className="text-white text-xs font-bold text-center">{match.home}</span>
                  </div>

                  <div className="text-2xl font-black text-center w-1/3">
                    {match.homeScore} - {match.awayScore}
                  </div>

                  <div className="flex flex-col items-center gap-2 w-1/3">
                    <div className="relative w-8 h-8">
                      <Image src={match.awayLogo} alt={match.away} fill className="rounded-full" />
                    </div>
                    <span className="text-white text-xs font-bold text-center">{match.away}</span>
                  </div>
                </div>

                {match.venue && (
                  <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-gray-500 text-center">
                    <span className="text-gray-400">Venue: </span>{match.venue}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "fixtures" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-pink-500 uppercase tracking-wider mb-4">Match History</h3>
          {processedMatches.length === 0 ? (
            <div className="text-center p-8 rounded-2xl border border-dashed border-zinc-800 text-gray-500">
              No matches found
            </div>
          ) : (
            processedMatches.map((match) => (
              <div
                key={match._id}
                className="bg-[#1f1f1f] rounded-2xl p-5 border border-white/5"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] text-gray-400 font-bold">{match.date}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    match.statusBadge === "ENDED" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"
                  }`}>
                    {match.statusBadge}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 w-[40%]">
                    <div className="relative w-6 h-6 flex-shrink-0">
                      <Image src={match.homeLogo} alt={match.home} fill className="rounded-full" />
                    </div>
                    <span className="text-white text-xs font-medium truncate">{match.home}</span>
                  </div>

                  <div className="text-sm font-bold text-center w-[20%]">
                    {match.type === "ended" ? `${match.homeScore} - ${match.awayScore}` : "vs"}
                  </div>

                  <div className="flex items-center gap-3 w-[40%] justify-end">
                    <span className="text-white text-xs font-medium truncate">{match.away}</span>
                    <div className="relative w-6 h-6 flex-shrink-0">
                      <Image src={match.awayLogo} alt={match.away} fill className="rounded-full" />
                    </div>
                  </div>
                </div>

                {match.venue && (
                  <div className="mt-3 pt-3 border-t border-white/5 text-[9px] text-gray-500 text-right italic">
                    {match.venue}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "standings" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <StandingsTable standings={standings} />
        </div>
      )}
    </div>
  );
}
