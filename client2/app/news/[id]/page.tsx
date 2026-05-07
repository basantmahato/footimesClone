'use client';

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatTimeAgo } from "@/utils/timeAgo";
import axios from "axios";
import { ShareIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import Image from "next/image";

interface NewsItem {
  _id: string;
  thumbnail: string;
  title: string;
  description: string;
  tournament?: { name: string };
  createdAt: string;
}

export default function NewsArticlePage() {
  const params = useParams();
  const id = params?.id as string;
  const [news, setNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    if (id) {
      axios.get(`https://api.footimes.com/api/news/${id}`).then((res) => {
        setNews(res.data);
      }).catch(err => {
        console.error("Failed to fetch news article", err);
      });
    }
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
      <div className="flex items-center justify-center h-screen bg-black">
        <span className="loading loading-spinner text-pink-500"></span>
      </div>
    );

  return (
    <div className="p-4 text-white max-w-3xl mx-auto mb-20 relative animate-in fade-in duration-500">
      <div className="relative w-full aspect-video mb-8 overflow-hidden rounded-3xl shadow-2xl border border-white/5">
        <Image
          src={news.thumbnail}
          alt={news.title}
          fill
          className="object-top object-cover transition-transform duration-700 hover:scale-105"
          priority
        />
      </div>

      <div className="flex justify-between items-start gap-4 mb-6">
        <h1 className="text-2xl font-black leading-tight flex-1">{news.title}</h1>
        <button
          onClick={handleShare}
          className="p-3 bg-zinc-900 rounded-2xl border border-white/10 text-gray-400 hover:text-white hover:bg-zinc-800 transition-all active:scale-95"
        >
          <ShareIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-8 text-[11px] font-bold uppercase tracking-[0.1em]">
        <span className="bg-pink-600 px-3 py-1 rounded-full text-white">
          {news.tournament?.name || "General"}
        </span>
        <span className="text-zinc-500">•</span>
        <span className="text-zinc-400">{formatTimeAgo(news.createdAt)}</span>
        <span className="text-zinc-500">•</span>
        <span className="text-zinc-500">
          {new Date(news.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="prose prose-invert max-w-none">
        <p className="text-lg text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap">
          {news.description}
        </p>
      </div>

      {/* Decorative background element */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-pink-600/10 to-transparent -z-10 pointer-events-none blur-3xl opacity-50"></div>
    </div>
  );
}
