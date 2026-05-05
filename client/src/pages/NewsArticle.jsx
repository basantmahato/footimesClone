import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formatTimeAgo } from "/utils/timeAgo.js";
import axios from "axios";
import { ShareIcon } from "@heroicons/react/24/outline";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function NewsArticle() {
  const { id } = useParams();
  const [news, setNews] = useState(null);

  useEffect(() => {
    axios.get(`https://api.footimes.com/api/news/${id}`).then((res) => {
      setNews(res.data);
    });
  }, [id]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: news?.title,
          text: "Check out this news on Footimes!",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("✅ Link copied to clipboard!");
      }
    } catch (err) {
      toast.error("❌ Failed to share.");
    }
  };

  if (!news)
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner text-secondary"></span>
      </div>
    );

  return (
    <div className="p-4 text-white max-w-3xl mx-auto mb-13 relative">
      {/* Toast Notification Container */}
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover={false}
        theme="dark"
      />

      <img
        src={news.thumbnail}
        alt={news.title}
        className="w-full aspect-video object-top object-cover rounded-xl mb-4 shadow-sm"
      />

      <div className="flex justify-between items-center mb-2">
        <h1 className="text-[15px] font-bold">{news.title}</h1>
        <button
          onClick={handleShare}
          className="text-gray-400 hover:text-white cursor-pointer"
        >
          <ShareIcon className="h-5 w-5" />
        </button>
      </div>

      <p className="text-[10px] text-gray-400 mb-4">
        {news.tournament?.name} • {formatTimeAgo(news.createdAt)}
      </p>
      <p className="text-[10px] text-gray-500 mt-1">
        {new Date(news.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
      <p className="text-[13px]">{news.description}</p>
    </div>
  );
}
