import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LiveMatchCard } from "../components/LiveMatchCard";
import DateScroller from "../components/DateScroller";
import LiveMatches from "../components/LiveMatches";
import ErrorImg from "../assets/Error.svg";
import axios from "axios";
import { io } from "socket.io-client";
import { isToday, isYesterday, isTomorrow, parse } from "date-fns";
import NewsCard from "../components/NewsCard";
import { formatTimeAgo } from "/utils/timeAgo.js";
import NewsCardList from "../components/NewsCardList";

const socket = io("https://api.footimes.com");

const defaultTeamLogo =
  "https://cdn-icons-png.flaticon.com/512/1099/1099672.png";

export default function Home() {
  const [allLiveScoreData, setAllLiveScoreData] = useState([]);
  const [fixturesMap, setFixturesMap] = useState({});
  const [teamLogosMap, setTeamLogosMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasLiveMatch, setHasLiveMatch] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [showAllScores, setShowAllScores] = useState(false);

  const [liveMatches, setLiveMatches] = useState([]);
  const [previousMatch, setPreviousMatch] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [latestNews, setLatestNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    const handleLiveUpdate = (updatedMatch) => {
      setAllLiveScoreData((prev) => {
        const exists = prev.find((m) => m._id === updatedMatch._id);

        // update score/status
        if (exists) {
          return prev.map((m) =>
            m._id === updatedMatch._id ? updatedMatch : m,
          );
        }

        // new match started
        return [...prev, updatedMatch];
      });
    };

    const handleLiveDelete = ({ fixtureId }) => {
      setAllLiveScoreData((prev) =>
        prev.filter((m) => m.fixtureId !== fixtureId),
      );
    };

    socket.on("liveMatchUpdated", handleLiveUpdate);
    socket.on("liveMatchDeleted", handleLiveDelete);

    return () => {
      socket.off("liveMatchUpdated", handleLiveUpdate);
      socket.off("liveMatchDeleted", handleLiveDelete);
    };
  }, []);

  // Inside useEffect
  const fetchLive = async () => {
    try {
      const res = await axios.get("https://api.footimes.com/api/livescore/all");
      const data = res.data;

      const live = data.filter((match) => match.status === "live");
      const completed = data
        .filter((match) => match.status === "completed")
        .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt)); // latest first

      setLiveMatches(live);

      if (live.length === 0 && completed.length > 0) {
        setPreviousMatch(completed[0]);
      } else {
        setPreviousMatch(null);
      }
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  socket.on("liveMatchUpdated", (updatedMatch) => {
    setLiveMatches((prev) => {
      const updated = prev.map((match) =>
        match._id === updatedMatch._id ? updatedMatch : match,
      );
      if (!updated.find((match) => match._id === updatedMatch._id)) {
        updated.push(updatedMatch);
      }
      return updated.filter((match) => match.status === "live");
    });
    setPreviousMatch(null); // Live aa gaya to previous hata do
  });

  socket.on("liveMatchDeleted", ({ fixtureId }) => {
    setLiveMatches((prev) => {
      const updated = prev.filter((m) => m.fixtureId !== fixtureId);
      if (updated.length === 0) {
        fetchLive(); // firse fetch karo to get latest completed
      }
      return updated;
    });
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [livescoreRes, fixturesRes] = await Promise.all([
          axios.get("https://api.footimes.com/api/livescore/all"),
          axios.get("https://api.footimes.com/api/fixtures"),
        ]);

        setAllLiveScoreData(livescoreRes.data);

        const newFixturesMap = {};
        const newTeamLogosMap = {};

        fixturesRes.data.forEach((fixture) => {
          newFixturesMap[fixture._id] = fixture;

          if (fixture.teamA?.name && fixture.teamA?.logo) {
            newTeamLogosMap[fixture.teamA.name] = fixture.teamA.logo;
          }
          if (fixture.teamB?.name && fixture.teamB?.logo) {
            newTeamLogosMap[fixture.teamB.name] = fixture.teamB.logo;
          }
        });

        setFixturesMap(newFixturesMap);
        setTeamLogosMap(newTeamLogosMap);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    socket.on("liveMatchUpdated", (updatedMatch) => {
      setAllLiveScoreData((prev) =>
        prev.map((m) => (m._id === updatedMatch._id ? updatedMatch : m)),
      );
    });

    socket.on("liveMatchDeleted", ({ fixtureId }) => {
      setAllLiveScoreData((prev) =>
        prev.filter((m) => m.fixtureId !== fixtureId),
      );
    });
    return () => {
      socket.off("liveMatchUpdated");
      socket.off("liveMatchDeleted");
    };
  }, []);

  // Check for live matches whenever data changes
  useEffect(() => {
    const anyLive = allLiveScoreData.some((m) => m.status === "live");
    setHasLiveMatch(anyLive);
  }, [allLiveScoreData]);

  const endedOrNotStartedMatches = allLiveScoreData.filter(
    (m) => m.status !== "live",
  );

  const groupedMatches = allLiveScoreData.reduce((acc, m) => {
    if (m.status === "live") return acc; // live alag section me hai
  
    const fixtureDetails = fixturesMap[m.fixtureId];
  
    const rawDate =
      fixtureDetails?.matchDate || m.startedAt || new Date().toISOString();
  
    // ✅ Local timezone ke hisaab se YYYY-MM-DD generate karega
    const dateObj = new Date(rawDate);
    const dateKey =
      dateObj.getFullYear() +
      "-" +
      String(dateObj.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(dateObj.getDate()).padStart(2, "0");
  
    if (!acc[dateKey]) acc[dateKey] = [];
  
    acc[dateKey].push({
      ...m,
      teamAlogo: teamLogosMap[m.teamA] || defaultTeamLogo,
      teamBlogo: teamLogosMap[m.teamB] || defaultTeamLogo,
    });
  
    return acc;
  }, {});

  // Sort dates and ensure today is first if it exists
  const todayISO = new Date().toLocaleDateString("en-CA");
  let dateKeys = Object.keys(groupedMatches);

  if (!dateKeys.includes(todayISO)) {
    dateKeys.unshift(todayISO);
  }

  const sortedDates = dateKeys.sort((a, b) => new Date(a) - new Date(b));

  useEffect(() => {
    if (sortedDates.length === 0) return;

    // first load only
    if (!selectedDate) {
      if (sortedDates.includes(todayISO)) {
        setSelectedDate(todayISO);
      } else {
        setSelectedDate(sortedDates[0]);
      }
    }
  }, [sortedDates]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get("https://api.footimes.com/api/news");

        const uniqueNews = Array.from(
          new Map(res.data.map((item) => [item._id, item])).values(),
        );

        const sortedNews = uniqueNews.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );

        // ✅ IMPORTANT
        setLatestNews(sortedNews.slice(0, 6));
      } catch (err) {
        console.error("Failed to load latest news", err);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen ">
        <span className="loading loading-spinner text-secondary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-6 ">
        <img src={ErrorImg} alt="Error" className="w-40 h-auto mt-30" />
        <div className="text-gray-700 text-center mt-5 text-[10px]">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#0f0f0f] min-w-[280px] w-full px-4 pb-20 mb-3 py-4 text-white">
        <div className="flex min-w-[80px] overflow-auto -mt-4">
          <DateScroller
            matchDates={sortedDates}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>

        <div className="flex justify-between items-center mb-2 mt-10">
          <div className="flex items-center gap-2 mt-5">
            <h1 className="text-xl">Live Now</h1>
            <span className="w-2 h-2 bg-red-600 ml-1 rounded-full animate-ping"></span>
          </div>
          {/* <Link to="/live-matches" className="text-pink-500 text-[15px] mt-3">
            See More
          </Link> */}
        </div>

        <div className="flex overflow-x-auto w-full space-x-3 px-1">
          {hasLiveMatch ? (
            <LiveMatches teamLogosMap={teamLogosMap} />
          ) : (
            <div className="bg-[#0b0b0b] bg-gradient-to-br from-[#f323bf15] to-[#0b0b0b] w-[90%] sm:w-[350px] p-5 rounded-2xl shadow-xl mb-1 border border-white/5 ml-0">
              {/* Tournament and status */}
              <div className="flex items-center justify-center mb-1">
                <div className="flex items-center gap-2 text-gray-400 text-[14px]">
                  <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                  No matches started
                </div>
              </div>

              {/* Center Message - Left Aligned */}
              <div className="py-3">
                <div className="text-gray-300 text-center text-base leading-snug">
                  Now no live matches are <br />
                  <span className="text-gray-500 text-sm font-normal">
                    available at the moment.
                  </span>
                </div>
              </div>

              {/* Details button */}
              <div className="mt-4">
                <Link
                  to="/tournament"
                  className="inline-block w-full text-center bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg"
                >
                  Upcoming Matches
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="mb-3 mt-8">
          <div className="flex justify-between text-sm text-gray-400 border-b border-gray-700 pb-1">
            <span className="text-pink-500">Scores</span>
            <Link to="/tournament" className="text-pink-500">
              Upcoming
            </Link>
          </div>
        </div>

        {sortedDates.length === 0 ? (
          <p className="text-gray-400 text-center mt-4">
            No ended or scheduled matches to display.
          </p>
        ) : (
          <>
            {selectedDate && groupedMatches[selectedDate]?.length > 0 ? (
              <div key={selectedDate} className="mb-4">
                <div className="text-[15px] text-gray-400 mb-2">
                  {selectedDate}
                </div>

                <div className="flex gap-5 overflow-x-auto scrollbar-hide">
                  {groupedMatches[selectedDate]
                    .slice(0, visibleCount)
                    .map((match, index) => (
                      <div className="bg-[#0b0b0b] bg-gradient-to-br from-[#f323bf15] to-[#0b0b0b] border-1 min-w-80 border-white/5 rounded-2xl px-4 py-3 flex flex-col gap-4 shadow-sm">
                        {/* TOP */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[12px] text-gray-400">
                            <img
                              src={match.teamAlogo}
                              alt="tournament"
                              className="w-5 h-5 truncate rounded-full"
                            />
                            {match.tournamentName || "Unknown Tournament"}
                          </div>

                          
                        </div>

                        {/* CENTER */}
                        <div className="flex items-center justify-between">
                          <img
                            src={match.teamAlogo}
                            alt={match.teamA}
                            className="w-12 h-12 object-contain"
                          />

                          <span className="text-gray-400 text-sm font-semibold">
                            VS
                          </span>

                          <img
                            src={match.teamBlogo}
                            alt={match.teamB}
                            className="w-12 h-12 object-contain"
                          />
                        </div>

                        {/* BOTTOM */}
                        <div className="flex justify-between items-start text-[13px]">
                          <div className="flex flex-col gap-2 text-gray-300">
                            <div className="flex items-center gap-2">
                              <span className="text-red-500">🏳️</span>
                              {match.teamA}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-red-500">🏳️</span>
                              {match.teamB}

                              {match.status === "ended" &&
                                match.resultB === "win" && (
                                  <span className="ml-1 bg-green-600/20 text-green-400 text-[10px] px-2 py-[2px] rounded-full">
                                    Win
                                  </span>
                                )}
                            </div>
                          </div>

                          <div className="text-right text-gray-300 font-semibold leading-6">
                            {match.scoreA}
                            <br />
                            {match.scoreB}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-22 border border-dashed border-zinc-800 rounded-3xl">
                <div className="text-zinc-600 mb-2"></div>
                <p className="text-center text-zinc-500 font-medium">
                  No Available Match On this date{" "}
                  <span className="text-pink-500 text-md">{selectedDate}</span>
                </p>
              </div>
            )}
            {/* ===== Latest News Section ===== */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-white text-lg font-semibold">
                  Latest News
                </h2>
                <Link to="/news" className="text-pink-500 text-sm">
                  See All
                </Link>
              </div>

              {newsLoading ? (
                <div className="flex justify-center items-center h-24">
                  <span className="loading loading-spinner text-pink-500"></span>
                </div>
              ) : (
                <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
                  {latestNews.map((item) => (
                    <Link
                      key={item._id}
                      to={`/news/${item._id}`}
                      className="cursor-pointer"
                    >
                      <NewsCard
                        image={item.thumbnail}
                        tittle={item.title}
                        description={item.description}
                        tournament={item.tournament?.name}
                        hour={formatTimeAgo(item.createdAt)}
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* {sortedDates.length > 3 &&
              sortedDates.some(
                (dateKey) =>
                  groupedMatches[dateKey] && groupedMatches[dateKey].length > 0,
              ) && (
                <div className="flex justify-center mt-2">
                  <button
                    className="text-white p-2 rounded-full hover:underline text-xs bg-pink-500"
                    onClick={() => setShowAllScores((prev) => !prev)}
                  >
                    {showAllScores ? "View Less" : "View More"}
                  </button>
                </div>
              )} */}
          </>
        )}
      </div>
    </>
  );
}
