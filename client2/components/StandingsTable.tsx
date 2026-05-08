'use client';
import React from 'react';
import Image from 'next/image';

interface TeamStats {
  team: string;
  mp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  logo?: string;
}

interface Props {
  standings: TeamStats[];
}

const defaultTeamLogo = "https://cdn-icons-png.flaticon.com/512/1099/1099672.png";

const StandingsTable: React.FC<Props> = ({ standings }) => {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/5 bg-[#1f1f1f]/50 backdrop-blur-sm shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-[10px] uppercase tracking-widest font-bold text-gray-400">
              <th className="px-4 py-4 text-center w-12">Pos</th>
              <th className="px-4 py-4">Team</th>
              <th className="px-2 py-4 text-center">P</th>
              <th className="px-2 py-4 text-center">W</th>
              <th className="px-2 py-4 text-center">D</th>
              <th className="px-2 py-4 text-center">L</th>
              <th className="px-2 py-4 text-center hidden sm:table-cell">GD</th>
              <th className="px-4 py-4 text-center text-pink-500">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {standings.map((stat, index) => (
              <tr key={stat.team} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-4 py-4 text-center">
                  <span className={`text-xs font-bold ${index < 3 ? 'text-pink-500' : 'text-gray-500'}`}>
                    {index + 1}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-6 h-6 flex-shrink-0">
                      <Image
                        src={stat.logo || defaultTeamLogo}
                        alt={stat.team}
                        fill
                        className="rounded-full object-contain"
                      />
                    </div>
                    <span className="text-sm font-semibold truncate max-w-[120px] sm:max-w-none">
                      {stat.team}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-4 text-center text-xs font-medium text-gray-300">{stat.mp}</td>
                <td className="px-2 py-4 text-center text-xs font-medium text-gray-300">{stat.w}</td>
                <td className="px-2 py-4 text-center text-xs font-medium text-gray-300">{stat.d}</td>
                <td className="px-2 py-4 text-center text-xs font-medium text-gray-300">{stat.l}</td>
                <td className="px-2 py-4 text-center text-xs font-medium text-gray-300 hidden sm:table-cell">
                  {stat.gd > 0 ? `+${stat.gd}` : stat.gd}
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="text-sm font-bold text-white group-hover:text-pink-500 transition-colors">
                    {stat.pts}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {standings.length === 0 && (
        <div className="py-20 text-center text-gray-500 text-sm font-medium italic">
          No records yet. Complete matches to see standings.
        </div>
      )}
    </div>
  );
};

export default StandingsTable;
