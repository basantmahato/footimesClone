import React, { useEffect, useState } from "react";
import NewsCard from "../components/NewsCard";
import NewsCardList from "../components/NewsCardList";
import { useNavigate } from "react-router-dom";
import { formatTimeAgo } from "/utils/timeAgo.js";
import axios from "axios";

const NewsPage = () => {
  const [activeTab, setActiveTab] = useState("Latest");
  const [newsData, setNewsData] = useState([]);
  const [tabs, setTabs] = useState(["Latest"]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch News Data
    axios
      .get("https://api.footimes.com/api/news")
      .then((res) => setNewsData(res.data))
      .catch((err) => console.error("Failed to load news", err));

    // Fetch Tournaments for Tabs
    axios
      .get("https://api.footimes.com/api/news/tournaments")
      .then((res) => {
        const tournamentNames = res.data.map((tournament) => tournament.name);
        setTabs(["Latest", ...tournamentNames]);
      })
      .catch((err) => console.error("Failed to load tournaments for tabs", err))
      .finally(() => setLoading(false));
  }, []);

  const getFilteredNews = () => {
    if (activeTab === "Latest") {
      return newsData;
    }
    return newsData.filter(
      (item) =>
        item.tournament?.name?.toLowerCase() === activeTab.toLowerCase(),
    );
  };

  // Determine which news items to render as NewsCard (first 3 for 'Latest' tab only)
  const newsCardsToShow =
    activeTab === "Latest" ? getFilteredNews().slice(0, 3) : [];

  // Determine which news items to render as NewsCardList
  // If 'Latest' tab, show items from index 3 onwards.
  // If a tournament tab, show all filtered items.
  const newsListToShow =
    activeTab === "Latest" ? getFilteredNews().slice(3) : getFilteredNews();

  return (
    <div className="bg-black min-h-screen text-white font-sans pb-13 mb-5">
      {/* Navbar Tabs */}
      <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm overflow-x-auto no-scrollbar border-b border-zinc-800 px-4 py-4 mb-4">
        <ul className="flex items-center gap-3 whitespace-nowrap">
          {tabs.map((tab) => (
            <li
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer px-4 py-1.5 rounded-full text-[12px] font-bold capitalize transition-all border ${
                activeTab === tab
                  ? "bg-pink-600 border-pink-600 text-white"
                  : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white"
              }`}
            >
              {tab}
            </li>
          ))}
        </ul>
      </nav>

      {/* <div className="px-4 py-3 text-gray-400 text-[15px]">{activeTab}</div> */}

      {/* Loading Animation */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <span className="loading loading-spinner text-pink-500"></span>
        </div>
      ) : (
        <>
          {/* Cards (only for 'Latest' tab) */}
          {activeTab === "Latest" &&
            newsCardsToShow.length > 0 && ( // Ensure there are cards to show
              <div className="flex overflow-x-auto space-x-4 px-2 text-[13px] pb-4">
                {newsCardsToShow.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/news/${item._id}`)}
                    className="cursor-pointer"
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
            )}
          <p className="text-gray-500 px-4 font-semibold">All News</p>
          {/* List of News (All news for tournament tabs, or remaining for 'Latest') */}
          <div className="px-4 py-6">
            {/* Section Header */}
            {newsListToShow.length > 0 ? (
              /* Grid Layout: Mobile 1, Tablet 2, Desktop 3 columns */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-6 ">
                {newsListToShow.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/news/${item._id}`)}
                    className="group cursor-pointer flex flex-col space-y-3 backdrop-blur-md border border-zinc-800 bg-zinc-900/80  rounded-2xl p-2"
                  >
                    {/* Image Aspect Ratio Container */}
                    <div className="relative aspect-video overflow-hidden rounded-2xl bg-zinc-900 shadow-md">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Text Content Area */}
                    <div className="space-y-1.5 ">
                      <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wide">
                        {formatTimeAgo(item.createdAt)}
                      </span>

                      <h3 className="text-[8px] font-bold leading-tight text-zinc-100 group-hover:text-pink-500 transition-colors">
                        {item.tournament?.name || "Unknown Tournament"}
                      </h3>

                      <p className="text-[14px] text-zinc-300 line-clamp-2 leading-relaxed font-bold">
                        {item.title}
                      </p>
                      <p className="text-[12px] text-zinc-400 line-clamp-2 leading-relaxed font-normal">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* No News Found State */
              <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-3xl">
                <div className="text-zinc-600 mb-2">📭</div>
                <p className="text-center text-zinc-500 font-medium">
                  No news available for{" "}
                  <span className="text-pink-500">"{activeTab}"</span>.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NewsPage;
