import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";

// Default logo for teams and tournaments
const defaultTeamLogo =
  "https://cdn-icons-png.flaticon.com/512/1099/1099672.png";
const defaultTournamentDetailsLogo =
  "https://static.vecteezy.com/system/resources/thumbnails/037/049/153/small_2x/football-match-clipart-flat-design-icon-isolated-on-transparent-background-3d-render-sport-and-exercise-concept-png.png";

export default function TournamentDetails() {
  const { id } = useParams();
  const location = useLocation();
  const { tournamentName: initialTournamentName } = location.state || {};

  const [activeTab, setActiveTab] = useState("fixtures");
  const [tournamentInfo, setTournamentInfo] = useState(null);
  const [allFixtures, setAllFixtures] = useState([]);
  const [allLiveScores, setAllLiveScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        setLoading(true);

        const tournamentRes = await axios.get(
          `https://api.footimes.com/api/tournaments/${id}`
        );
        setTournamentInfo(tournamentRes.data);

        const fixturesRes = await axios.get(
          `https://api.footimes.com/api/fixtures?tournament=${id}`
        );
        setAllFixtures(fixturesRes.data);

        const liveScoresRes = await axios.get(
          `https://api.footimes.com/api/livescore/all`
        );
        const tournamentLiveScores = liveScoresRes.data.filter(
          (ls) =>
            ls.tournamentName ===
            (tournamentRes.data.name || initialTournamentName)
        );
        setAllLiveScores(tournamentLiveScores);
      } catch (err) {
        console.error("Failed to fetch tournament details:", err);
        setError(
          "Failed to load tournament data. Please check the ID or try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTournamentData();
    } else {
      setError("Tournament ID not provided. Cannot fetch tournament details.");
      setLoading(false);
    }
  }, [id, initialTournamentName]);

  // Process Matches
  const processedMatches = allFixtures
    .map((f) => {
      const liveScoreEntry = allLiveScores.find((ls) => ls.fixtureId === f._id);
      const homeTeamName = f.teamA;
      const awayTeamName = f.teamB;
      const homeLogo = defaultTeamLogo;
      const awayLogo = defaultTeamLogo;
      const venue = f.venue || tournamentInfo?.location || "";

      if (liveScoreEntry && liveScoreEntry.status === "ended") {
        return {
          _id: f._id,
          type: "ended",
          date: new Date(
            liveScoreEntry.startedAt || f.matchDate
          ).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          time: new Date(
            liveScoreEntry.startedAt || f.matchDate
          ).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          statusBadge: "ENDED",
          home: homeTeamName,
          away: awayTeamName,
          homeScore: liveScoreEntry.scoreA,
          awayScore: liveScoreEntry.scoreB,
          homeLogo: homeLogo,
          awayLogo: awayLogo,
          venue: venue,
        };
      } else if (!liveScoreEntry || liveScoreEntry.status === "not_started") {
        return {
          _id: f._id,
          type: "upcoming",
          date: new Date(f.matchDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          time: new Date(f.matchDate).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          statusBadge: "UPCOMING",
          home: homeTeamName,
          away: awayTeamName,
          homeScore: null,
          awayScore: null,
          homeLogo: homeLogo,
          awayLogo: awayLogo,
          venue: venue,
        };
      }
      return null;
    })
    .filter((match) => match !== null)
    .sort((a, b) => {
      const dateA = new Date(
        `${a.date.split("/").reverse().join("-")}T${a.time}`
      );
      const dateB = new Date(
        `${b.date.split("/").reverse().join("-")}T${b.time}`
      );
      return dateB.getTime() - dateA.getTime(); // latest first
    });

  const liveMatches = allLiveScores
    .filter(
      (ls) =>
        ls.status === "live" &&
        ls.tournamentName === (tournamentInfo?.name || initialTournamentName)
    )
    .map((ls) => {
      return {
        _id: ls._id,
        status: "LIVE",
        home: ls.teamA,
        away: ls.teamB,
        homeScore: ls.scoreA,
        awayScore: ls.scoreB,
        homeLogo: defaultTeamLogo,
        awayLogo: defaultTeamLogo,
        venue: ls.venue || tournamentInfo?.location || "",
      };
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner text-secondary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-[#121212] min-h-screen text-center">
        {error}
      </div>
    );
  }

  if (!tournamentInfo) {
    return (
      <div className="p-4 text-gray-400 bg-[#121212] min-h-screen text-center">
        Tournament not found.
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 text-white bg-[#121212] min-h-screen w-full max-w-full overflow-x-hidden">
      <div className="text-center mb-6">
        <img
          src={tournamentInfo.logo || defaultTournamentDetailsLogo}
          alt={tournamentInfo.name}
          className="w-12 h-12 mx-auto mb-1 rounded-full object-cover"
        />
        <h2 className="text-sm text-gray-400">
          {tournamentInfo.location || "Unknown Location"}
        </h2>
        <h1 className="text-xl font-semibold">{tournamentInfo.name}</h1>

        <div className="flex justify-center gap-6 mt-4 text-sm">
          {["fixtures", "live", "standings"].map((tab) => (
            <span
              key={tab}
              className={`cursor-pointer pb-1 ${
                activeTab === tab
                  ? "border-b-2 border-pink-500 text-white"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </span>
          ))}
        </div>
      </div>

      {activeTab === "live" && (
        <>
          <h3 className="text-[15px] mb-3 text-pink-500">Live Matches</h3>
          {liveMatches.length === 0 ? (
            <p class="text-center text-muted mb-0 border text-[13px] p-5 rounded border-green-300">
             Now Live Match are Not Started
            </p>
          ) : (
            liveMatches.map((match) => (
              <div
                key={match._id}
                className="bg-[#1f1f1f] rounded-lg px-4 py-3 mb-3 text-sm border border-green-500 animate-pulse w-full"
              >
                <div className="flex justify-between text-gray-400 mb-2 text-xs sm:text-sm">
                  <span>LIVE</span>
                  <span>{match.status}</span>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 w-full">
                  <div className="flex items-center gap-2 w-full sm:w-[40%] justify-center sm:justify-start">
                    <img
                      src={match.homeLogo}
                      alt={match.home}
                      className="w-4 h-4 rounded-full"
                    />
                    <span className="text-white text-[13px]">{match.home}</span>
                  </div>

                  <div className="text-white text-[13px] text-center w-full sm:w-[20%]">
                    {match.homeScore} - {match.awayScore}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-[40%] justify-center sm:justify-end">
                    <img
                      src={match.awayLogo}
                      alt={match.away}
                      className="w-4 h-4 rounded-full"
                    />
                    <span className="text-white text-[13px] ">
                      {match.away}
                    </span>
                  </div>
                </div>

                {match.venue && (
                  <div className="text-gray-500 mt-2 text-[10px] text-right w-full">
                    <span className="text-gray-400 text-[10px]">Venue: </span>
                    {match.venue}
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}

      {activeTab === "fixtures" && (
        <>
          <h3 className="text-[15px] mb-3 text-pink-500">All Matches</h3>
          {processedMatches.length === 0 ? (
            <p className="text-center text-gray-400 mt-4">
              No matches found for this tournament.
            </p>
          ) : (
            processedMatches
              .slice()
              .reverse() // 👈 Reverse the sorted array for reverse display
              .map((match) => (
                <div
                  key={match._id}
                  className="bg-[#1f1f1f] rounded-lg px-4 py-3 mb-3 text-sm w-full"
                >
                  <div className="flex justify-between text-gray-400 mb-2 text-[13px] flex-wrap gap-y-1">
                    <span>{match.date}</span>
                    <span
                      className={`text-[13px] ${
                        match.statusBadge === "ENDED"
                          ? "text-red-400" // Ended match ka color
                          : match.statusBadge === "UPCOMING"
                          ? "text-green-300" // Upcoming match ka color
                          : "text-gray-400" // fallback color (optional)
                      }`}
                    >
                      {match.statusBadge}
                    </span>
                  </div>

                  <div className="flex flex-wrap justify-between items-center gap-y-2 w-full">
                    <div className="flex items-center gap-2 w-full sm:w-[40%] justify-center sm:justify-start text-[13px]">
                      <img
                        src={match.homeLogo}
                        alt={match.home}
                        className="w-4 h-4 rounded-full"
                      />
                      <span className="text-white">{match.home}{match.type === "ended" && match.resultA === "win" && (
  <span className="text-yellow-400 text-xs ml-1">🏆</span>
)}</span>
                    </div>

                    <span className="text-center text-white w-full sm:w-[20%] text-[13px]">
                      {match.type === "ended"
                        ? `${match.homeScore} - ${match.awayScore}`
                        : "vs"}
                    </span>

                    <div className="flex items-center gap-2 w-full sm:w-[40%] justify-center sm:justify-end">
                      <img
                        src={match.awayLogo}
                        alt={match.away}
                        className="w-4 h-4 rounded-full"
                      />
                      <span className="text-white text-[13px]">
                        {match.away}{match.type === "ended" && match.resultB === "win" && (
  <span className="text-yellow-400 text-xs ml-1">🏆</span>
)}
                      </span>
                    </div>
                  </div>

                  {match.venue && (
                    <div className="text-gray-500 text-[10px] mt-2 text-right w-full">
                      <span className="text-gray-300 text-[10px]">Venue: </span>
                      {match.venue}
                    </div>
                  )}
                </div>
              ))
          )}
        </>
      )}

      {activeTab === "standings" && (
        <div className="text-center text-gray-400 mt-10">
          Standings Coming Soon ✨
        </div>
      )}
    </div>
  );
}