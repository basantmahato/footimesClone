import React, { useEffect, useState } from "react";
import { LiveMatchCard } from "../components/LiveMatchCard";
import axios from "axios";


export default function LiveMatches() {
  const [matches, setMatches] = useState([]);
  const [fixturesMap, setFixturesMap] = useState({});

  useEffect(() => {
    const fetchLiveMatchesAndFixtures = async () => {
      try {
        const [liveRes, fixturesRes] = await Promise.all([
          axios.get("https://api.footimes.com/api/livescore"),
          axios.get("https://api.footimes.com/api/fixtures"),
        ]);
        setMatches(liveRes.data);
        // Map fixtures by _id for quick lookup
        const newFixturesMap = {};
        fixturesRes.data.forEach(fix => {
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
      <div className="flex gap-2 items-center">
      </div>
      <div className="w-full overflow-x-auto px-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <div className="flex gap-4 min-w-max">
          {matches.map((match) => (
            <LiveMatchCard
              key={match._id || match.fixtureId}
              time={match.startedAt}
              tournament={match.tournamentName}
              matchRound={fixturesMap[match.fixtureId]?.matchRound || ""}
              score={`${match.scoreA} - ${match.scoreB}`}
              team1={match.teamA}
              team2={match.teamB}
              img1={
                match.img1 ||
                "https://cdn-icons-png.flaticon.com/512/1099/1099672.png"
              }
              img2={
                match.img2 ||
                "https://cdn-icons-png.flaticon.com/512/1099/1099672.png"
              }
              matchId={match.fixtureId}
              matchround={fixturesMap[match.fixtureId]?.matchRound || ""}
            />
          ))}
        </div>
      </div>
    </div>
  );
}