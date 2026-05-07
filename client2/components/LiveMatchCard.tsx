import React from "react";
import Link from "next/link";
import Image from "next/image";

interface LiveMatchCardProps {
  img1: string;
  img2: string;
  team1: string;
  team2: string;
  score: string;
  time: string;
  matchround: string;
  tournament: string;
  matchId: string;
}

function formatStartedAt(startedAt: string) {
  if (!startedAt) return "N/A";
  const start = new Date(startedAt).getTime();
  const now = new Date().getTime();
  const diffMs = now - start;
  const minutes = Math.floor(diffMs / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export const LiveMatchCard = ({
  img1,
  img2,
  team1,
  team2,
  score,
  time,
  matchround,
  tournament,
  matchId,
}: LiveMatchCardProps) => {
  return (
    <div className="bg-[#0b0b0b] bg-gradient-to-br from-[#f323bf15] to-[#0b0b0b] min-w-[290px] overflow-hidden p-4 rounded-xl shadow-lg mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-gray-400 rounded-2xl text-[10px] font-bold w-64">
          <p>🏅</p>
          <span className="truncate w-full">{tournament}</span>
        </div>
        <div className="text-xs bg-green-700 text-white px-2 py-0.5 w-12 rounded-full text-center">
          {formatStartedAt(time)}
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <p className="text-[10px] text-center rounded-full border border-green-500 w-22 mb-1">
          {matchround}
        </p>
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-center text-[10px] truncate max-w-[100px]">
          <div className="relative w-6 h-6 mx-auto mb-1">
            <Image
              src={img1 || "https://cdn-icons-png.flaticon.com/512/1099/1099672.png"}
              alt={team1}
              fill
              className="rounded-full object-cover"
            />
          </div>
          {team1}
        </div>

        <div className="text-xl font-extralight">{score}</div>

        <div className="text-center text-[10px] truncate max-w-[100px]">
          <div className="relative w-6 h-6 mx-auto mb-1">
            <Image
              src={img2 || "https://cdn-icons-png.flaticon.com/512/1099/1099672.png"}
              alt={team2}
              fill
              className="rounded-full object-cover"
            />
          </div>
          {team2}
        </div>
      </div>

      <Link
        href={`/match/${matchId}`}
        className="block w-full text-center bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg text-sm"
      >
        Details
      </Link>
    </div>
  );
};
