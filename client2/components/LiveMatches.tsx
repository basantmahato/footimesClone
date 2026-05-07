'use client';

import React, { useEffect, useState } from "react";
import { LiveMatchCard } from "./LiveMatchCard";
import axios from "axios";

interface Match {
  _id: string;
  fixtureId: string;
  startedAt: string;
  tournamentName: string;
  scoreA: number;
  scoreB: number;
  teamA: string;
  teamB: string;
  img1?: string;
  img2?: string;
}

interface Fixture {
  _id: string;
  matchRound: string;
}

export default function LiveMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [fixturesMap, setFixturesMap] = useState<Record<string, Fixture>>({});

  useEffect(() => {
    const fetchLiveMatchesAndFixtures = async () => {
      try {
        const [liveRes, fixturesRes] = await Promise.all([
          axios.get("https://api.footimes.com/api/livescore"),
          axios.get("https://api.footimes.com/api/fixtures"),
        ]);
        setMatches(liveRes.data);
        
        const newFixturesMap: Record<string, Fixture> = {};
        fixturesRes.data.forEach((fix: Fixture) => {
          newFixturesMap[fix._id] = fix;
        });
        setFixturesMap(newFixturesMap);
      } catch (error) {
        console.error("Failed to fetch live matches or fixtures:", error);
      }
    };

    fetchLiveMatchesAndFixtures();
    const interval = setInterval(fetchLiveMatchesAndFixtures, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#0f0f0f]">
      <div className="w-full overflow-x-auto px-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <div className="flex gap-4 min-w-max">
          {matches.map((match) => (
            <LiveMatchCard
              key={match._id || match.fixtureId}
              time={match.startedAt}
              tournament={match.tournamentName}
              score={`${match.scoreA} - ${match.scoreB}`}
              team1={match.teamA}
              team2={match.teamB}
              img1={match.img1 || "https://cdn-icons-png.flaticon.com/512/1099/1099672.png"}
              img2={match.img2 || "https://cdn-icons-png.flaticon.com/512/1099/1099672.png"}
              matchId={match.fixtureId}
              matchround={fixturesMap[match.fixtureId]?.matchRound || ""}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
