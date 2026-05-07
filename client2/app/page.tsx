'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { io } from "socket.io-client";
import { isToday } from "date-fns";
import DateScroller from "@/components/DateScroller";
import LiveMatches from "@/components/LiveMatches";
import NewsCard from "@/components/NewsCard";
import { formatTimeAgo } from "@/utils/timeAgo";

const socket = io("https://api.footimes.com");

const defaultTeamLogo = "https://cdn-icons-png.flaticon.com/512/1099/1099672.png";

interface Match {
  _id: string;
  fixtureId: string;
  startedAt: string;
  tournamentName: string;
  scoreA: number;
  scoreB: number;
  teamA: string;
  teamB: string;
  status: string;
  resultA?: string;
  resultB?: string;
  teamAlogo?: string;
  teamBlogo?: string;
}

interface Fixture {
  _id: string;
  matchDate: string;
  teamA?: { name: string; logo: string };
  teamB?: { name: string; logo: string };
}

interface NewsItem {
  _id: string;
  thumbnail: string;
  title: string;
  description: string;
  tournament?: { name: string };
  createdAt: string;
}

export default function Home() {
  const [allLiveScoreData, setAllLiveScoreData] = useState<Match[]>([]);
  const [fixturesMap, setFixturesMap] = useState<Record<string, Fixture>>({});
  const [teamLogosMap, setTeamLogosMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLiveMatch, setHasLiveMatch] = useState(false);
  const [visibleCount] = useState(5);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [livescoreRes, fixturesRes] = await Promise.all([
          axios.get("https://api.footimes.com/api/livescore/all"),
          axios.get("https://api.footimes.com/api/fixtures"),
        ]);

        setAllLiveScoreData(livescoreRes.data);

        const newFixturesMap: Record<string, Fixture> = {};
        const newTeamLogosMap: Record<string, string> = {};

        fixturesRes.data.forEach((fixture: Fixture) => {
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

    socket.on("liveMatchUpdated", (updatedMatch: Match) => {
      setAllLiveScoreData((prev) => {
        const exists = prev.find((m) => m._id === updatedMatch._id);
        if (exists) {
          return prev.map((m) => (m._id === updatedMatch._id ? updatedMatch : m));
        }
        return [...prev, updatedMatch];
      });
    });

    socket.on("liveMatchDeleted", ({ fixtureId }: { fixtureId: string }) => {
      setAllLiveScoreData((prev) => prev.filter((m) => m.fixtureId !== fixtureId));
    });

    return () => {
      socket.off("liveMatchUpdated");
      socket.off("liveMatchDeleted");
    };
  }, []);

  useEffect(() => {
    const anyLive = allLiveScoreData.some((m) => m.status === "live");
    setHasLiveMatch(anyLive);
  }, [allLiveScoreData]);

  const groupedMatches = allLiveScoreData.reduce((acc: Record<string, Match[]>, m) => {
    if (m.status === "live") return acc;
  
    const fixtureDetails = fixturesMap[m.fixtureId];
    const rawDate = fixtureDetails?.matchDate || m.startedAt || new Date().toISOString();
  
    const dateObj = new Date(rawDate);
    const dateKey = dateObj.getFullYear() + "-" + 
                  String(dateObj.getMonth() + 1).padStart(2, "0") + "-" + 
                  String(dateObj.getDate()).padStart(2, "0");
  
    if (!acc[dateKey]) acc[dateKey] = [];
  
    acc[dateKey].push({
      ...m,
      teamAlogo: teamLogosMap[m.teamA] || defaultTeamLogo,
      teamBlogo: teamLogosMap[m.teamB] || defaultTeamLogo,
    });
  
    return acc;
  }, {});

  const todayISO = new Date().toLocaleDateString("en-CA");
  let dateKeys = Object.keys(groupedMatches);

  if (!dateKeys.includes(todayISO)) {
    dateKeys.unshift(todayISO);
  }

  const sortedDates = dateKeys.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  useEffect(() => {
    if (sortedDates.length === 0) return;
    if (!selectedDate) {
      if (sortedDates.includes(todayISO)) {
        setSelectedDate(todayISO);
      } else {
        setSelectedDate(sortedDates[0]);
      }
    }
  }, [sortedDates, selectedDate, todayISO]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get("https://api.footimes.com/api/news");
        const uniqueNews: NewsItem[] = Array.from(
          new Map<string, NewsItem>(res.data.map((item: NewsItem) => [item._id, item])).values()
        );
        const sortedNews = uniqueNews.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
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
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner text-pink-500"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-6">
        <div className="relative w-40 h-40 mt-20">
          <Image src="/assets/Error.svg" alt="Error" fill className="object-contain" />
        </div>
        <div className="text-gray-400 text-center mt-5 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f0f0f] min-h-screen px-4 pb-20 py-4 text-white">
      <div className="flex min-w-[80px] overflow-auto mb-10">
        <DateScroller
          matchDates={sortedDates}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </div>

      <div className="flex justify-between items-center mb-2 mt-10">
        <div className="flex items-center gap-2 mt-5">
          <h1 className="text-xl font-bold">Live Now</h1>
          <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
        </div>
      </div>

      <div className="flex overflow-x-auto w-full space-x-3">
        {hasLiveMatch ? (
          <LiveMatches />
        ) : (
          <div className="bg-[#0b0b0b] bg-gradient-to-br from-[#f323bf15] to-[#0b0b0b] w-full max-w-[400px] p-6 rounded-2xl shadow-xl border border-white/5">
            <div className="flex items-center justify-center mb-1">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                No matches started
              </div>
            </div>
            <div className="py-3 text-center">
              <div className="text-gray-300 text-lg">
                No live matches at the moment.
              </div>
              <div className="text-gray-500 text-sm mt-1">
                Check back later or view upcoming matches.
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/tournament"
                className="block w-full text-center bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl text-sm font-medium transition-all shadow-lg"
              >
                Upcoming Matches
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6 mt-10">
        <div className="flex justify-between text-sm text-gray-400 border-b border-gray-700 pb-2">
          <span className="text-pink-500 font-bold">Scores</span>
          <Link href="/tournament" className="text-pink-500 hover:underline">
            Upcoming
          </Link>
        </div>
      </div>

      {sortedDates.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">
          No matches found for this period.
        </p>
      ) : (
        <>
          {selectedDate && groupedMatches[selectedDate]?.length > 0 ? (
            <div className="mb-8">
              <div className="text-sm text-gray-400 mb-4 font-semibold uppercase tracking-wider">
                {selectedDate === todayISO ? "Today" : selectedDate}
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {groupedMatches[selectedDate].slice(0, visibleCount).map((match) => (
                  <div key={match._id} className="bg-[#0b0b0b] bg-gradient-to-br from-[#f323bf15] to-[#0b0b0b] border border-white/5 min-w-[300px] rounded-2xl px-5 py-4 flex flex-col gap-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[12px] text-gray-400 font-medium truncate">
                        <div className="relative w-5 h-5">
                          <Image
                            src={match.teamAlogo || defaultTeamLogo}
                            alt="tournament"
                            fill
                            className="rounded-full object-contain"
                          />
                        </div>
                        {match.tournamentName || "Unknown Tournament"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="relative w-12 h-12">
                        <Image
                          src={match.teamAlogo || defaultTeamLogo}
                          alt={match.teamA}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="text-gray-500 text-xs font-black">VS</span>
                      <div className="relative w-12 h-12">
                        <Image
                          src={match.teamBlogo || defaultTeamLogo}
                          alt={match.teamB}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-start text-sm">
                      <div className="flex flex-col gap-3 text-gray-300 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-red-500">🏳️</span>
                          {match.teamA}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-red-500">🏳️</span>
                          {match.teamB}
                          {match.status === "ended" && match.resultB === "win" && (
                            <span className="ml-1 bg-green-600/20 text-green-400 text-[10px] px-2 py-[2px] rounded-full">
                              Win
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-gray-100 font-bold text-lg leading-8">
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
            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-zinc-800 rounded-3xl mb-8">
              <p className="text-center text-zinc-500 font-medium">
                No matches scheduled for <span className="text-pink-500">{selectedDate}</span>
              </p>
            </div>
          )}

          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-xl font-bold">Latest News</h2>
              <Link href="/news" className="text-pink-500 text-sm font-medium hover:underline">
                See All
              </Link>
            </div>

            {newsLoading ? (
              <div className="flex justify-center items-center h-24">
                <span className="loading loading-spinner text-pink-500"></span>
              </div>
            ) : (
              <div className="flex overflow-x-auto gap-5 pb-6 scrollbar-hide">
                {latestNews.map((item) => (
                  <Link key={item._id} href={`/news/${item._id}`} className="transition-transform hover:scale-[1.02]">
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
        </>
      )}
    </div>
  );
}
