import React from "react";
import { formatTimeAgo } from "@/utils/timeAgo";
import axios from "axios";
import Image from "next/image";
import { Metadata } from "next";
import ShareButton from "@/components/ShareButton";
import Script from "next/script";

interface NewsItem {
  _id: string;
  thumbnail: string;
  title: string;
  description: string;
  tournament?: { name: string };
  category?: { name: string };
  createdAt: string;
}

async function getNewsItem(slugArray: string[]): Promise<NewsItem | null> {
  try {
    if (!slugArray || slugArray.length === 0) return null;
    const slug = slugArray[0];
    const res = await axios.get(`https://api.footimes.com/api/news/slug/${slug}`);
    return res.data;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNewsItem(slug);
  if (!news) return { title: "Article Not Found | Footimes" };

  return {
    title: `${news.title} | Footimes News`,
    description: news.description.slice(0, 160),
    openGraph: {
      title: news.title,
      description: news.description.slice(0, 160),
      images: [{ url: news.thumbnail }],
      type: 'article',
      publishedTime: news.createdAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: news.title,
      description: news.description.slice(0, 160),
      images: [news.thumbnail],
    }
  };
}

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const news = await getNewsItem(slug);

  if (!news) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-zinc-500">Article not found</p>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": news.title,
    "image": [news.thumbnail],
    "datePublished": news.createdAt,
    "dateModified": news.createdAt,
    "author": [{
        "@type": "Organization",
        "name": "Footimes",
        "url": "https://footimes.com"
    }],
    "description": news.description.slice(0, 160)
  };

  return (
    <article className="p-4 text-white max-w-3xl mx-auto mb-20 relative animate-in fade-in duration-500">
      <Script
        id="news-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="relative w-full aspect-video mb-8 overflow-hidden rounded-3xl shadow-2xl border border-white/5">
        <Image
          src={news.thumbnail}
          alt={news.title}
          fill
          className="object-top object-cover transition-transform duration-700"
          priority
        />
      </div>

      <div className="flex justify-between items-start gap-4 mb-6">
        <h1 className="text-2xl font-black leading-tight flex-1">{news.title}</h1>
        <ShareButton title={news.title} />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-8 text-[11px] font-bold uppercase tracking-[0.1em]">
        <span className="bg-pink-600 px-3 py-1 rounded-full text-white">
          {news.tournament?.name || news.category?.name || "General"}
        </span>
        <span className="text-zinc-500">•</span>
        <time dateTime={news.createdAt} className="text-zinc-400">
            {formatTimeAgo(news.createdAt)}
        </time>
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
    </article>
  );
}
