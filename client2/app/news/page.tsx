'use client';

import React, { useEffect, useState } from "react";
import NewsCard from "@/components/NewsCard";
import { useRouter } from "next/navigation";
import { formatTimeAgo } from "@/utils/timeAgo";
import axios from "axios";
import Image from "next/image";

interface NewsItem {
  _id: string;
  thumbnail: string;
  title: string;
  description: string;
  tournament?: { name: string };
  createdAt: string;
}

const NewsPage = () => {
  const [activeTab, setActiveTab] = useState("Latest");
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [tabs, setTabs] = useState<string[]>(["Latest"]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsRes, tournamentsRes] = await Promise.all([
          axios.get("https://api.footimes.com/api/news"),
          axios.get("https://api.footimes.com/api/news/tournaments")
        ]);

        setNewsData(newsRes.data);
        const tournamentNames = tournamentsRes.data.map((t: any) => t.name);
        setTabs(["Latest", ...tournamentNames]);
      } catch (err) {
        console.error("Failed to load news data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getFilteredNews = () => {
    if (activeTab === "Latest") return newsData;
    return newsData.filter(
      (item) => item.tournament?.name?.toLowerCase() === activeTab.toLowerCase()
    );
  };

  const newsCardsToShow = activeTab === "Latest" ? getFilteredNews().slice(0, 3) : [];
  const newsListToShow = activeTab === "Latest" ? getFilteredNews().slice(3) : getFilteredNews();

  return (
    <div className="bg-black min-h-screen text-white pb-20">
      <nav className="sticky top-[50px] z-40 bg-black/95 backdrop-blur-md overflow-x-auto border-b border-zinc-800 px-4 py-4 mb-6 scrollbar-hide">
        <ul className="flex items-center gap-3 whitespace-nowrap">
          {tabs.map((tab) => (
            <li
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer px-5 py-2 rounded-full text-xs font-bold capitalize transition-all border ${
                activeTab === tab
                  ? "bg-pink-600 border-pink-600 text-white shadow-lg shadow-pink-600/20"
                  : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
              }`}
            >
              {tab}
            </li>
          ))}
        </ul>
      </nav>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <span className="loading loading-spinner text-pink-500"></span>
        </div>
      ) : (
        <div className="px-4">
          {activeTab === "Latest" && newsCardsToShow.length > 0 && (
            <div className="mb-10">
              <div className="flex overflow-x-auto gap-5 pb-6 scrollbar-hide">
                {newsCardsToShow.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => router.push(`/news/${item._id}`)}
                    className="cursor-pointer transition-transform hover:scale-[1.02]"
                  >
                    <NewsCard
                      image={item.thumbnail}
                      tittle={item.title}
                      description={item.description}
                      tournament={item.tournament?.name}
                      hour={formatTimeAgo(item.createdAt)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">All News</h2>
            <div className="h-[1px] flex-1 bg-zinc-800/50"></div>
          </div>

          {newsListToShow.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsListToShow.map((item) => (
                <div
                  key={item._id}
                  onClick={() => router.push(`/news/${item._id}`)}
                  className="group cursor-pointer flex flex-col space-y-4 bg-zinc-900/50 border border-white/5 rounded-3xl p-3 transition-all hover:bg-zinc-900 hover:border-white/10"
                >
                  <div className="relative aspect-video overflow-hidden rounded-2xl bg-zinc-900">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="space-y-2 px-1 pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                      <span className="text-[10px] text-pink-500 font-black uppercase">
                        {item.tournament?.name || "General"}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold leading-snug text-white group-hover:text-pink-500 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    
                    <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-3xl">
              <span className="text-4xl mb-4">📭</span>
              <p className="text-zinc-500 font-medium text-center">
                No news available for <span className="text-pink-500">"{activeTab}"</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsPage;
