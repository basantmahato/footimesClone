'use client';

import React from "react";
import { ShareIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

interface ShareButtonProps {
  title: string;
}

export default function ShareButton({ title }: ShareButtonProps) {
  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: title,
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

  return (
    <button
      onClick={handleShare}
      className="p-3 bg-zinc-900 rounded-2xl border border-white/10 text-gray-400 hover:text-white hover:bg-zinc-800 transition-all active:scale-95"
      aria-label="Share this article"
      title="Share article"
    >
      <ShareIcon className="h-6 w-6" />
    </button>
  );
}
