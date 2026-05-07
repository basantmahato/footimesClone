'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { slugify } from "@/utils/slugify";

const defaultTournamentLogo = "https://static.vecteezy.com/system/resources/thumbnails/037/049/153/small_2x/football-match-clipart-flat-design-icon-isolated-on-transparent-background-3d-render-sport-and-exercise-concept-png.png";

interface Tournament {
  _id: string;
  name: string;
  logo?: string;
  location?: string;
}

export default function TournamentPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allTournaments, setAllTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await axios.get('https://api.footimes.com/api/tournaments');
        setAllTournaments(response.data);
      } catch (err) {
        console.error("Failed to fetch tournaments:", err);
        setError("Failed to load tournaments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const filteredTournaments = allTournaments.filter((tourn) =>
    tourn.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <span className="loading loading-spinner text-pink-500"></span>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500 bg-[#121212] min-h-screen text-center mt-20">{error}</div>;
  }

  return (
    <div className="p-4 text-white bg-[#121212] min-h-screen">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search The Tournament..."
        className="w-full p-3 rounded-xl bg-gray-800 text-[15px] text-white mb-6 border border-white/5 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
      />

      <h2 className="text-sm font-bold text-pink-500 mb-4 uppercase tracking-wider">All Tournaments</h2>
      {filteredTournaments.length > 0 ? (
        <ul className="space-y-4">
          {filteredTournaments.map((tourn) => (
            <li
              key={tourn._id}
              className="flex items-center justify-between border-b border-gray-900 pb-3"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-10 h-10 border border-white/10 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={tourn.logo || defaultTournamentLogo}
                    alt={tourn.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 mb-0.5">{tourn.location || 'Unknown Location'}</div>
                  <Link href={`/tournament/${slugify(tourn.name)}--${tourn._id}`}>
                    <div className="text-[14px] text-white font-medium hover:text-pink-400 transition-colors">
                      {tourn.name}
                    </div>
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 mt-6 text-center">No tournaments found.</p>
      )}
    </div>
  );
}
