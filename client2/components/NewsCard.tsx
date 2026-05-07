import React from "react";
import Image from "next/image";

interface NewsCardProps {
  image: string;
  tittle: string;
  hour: string;
  description: string;
  tournament?: string;
}

const NewsCard = ({ image, tittle, hour, description }: NewsCardProps) => {
  return (
    <div className="group w-[320px] h-[350px] bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-zinc-700 hover:shadow-2xl hover:shadow-black/40 flex flex-col flex-shrink-0">
      {/* Image Wrapper */}
      <div className="relative w-full aspect-[16/9] bg-zinc-800 overflow-hidden flex items-center justify-center">
        <Image
          src={image || "https://via.placeholder.com/320x180?text=No+Image"}
          alt={tittle}
          fill
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    
      {/* Content */}
      <div className="flex-1 p-4 space-y-2">
        <span className="text-xs text-zinc-400 tracking-wide">
          {hour}
        </span>
    
        <h2 className="text-base font-semibold text-white leading-snug line-clamp-2">
          {tittle}
        </h2>
    
        <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  );
};

export default NewsCard;
