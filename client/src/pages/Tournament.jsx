import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link
import axios from "axios"; // Import axios

// Default logo if a tournament logo is not found
const defaultTournamentLogo = "https://static.vecteezy.com/system/resources/thumbnails/037/049/153/small_2x/football-match-clipart-flat-design-icon-isolated-on-transparent-background-3d-render-sport-and-exercise-concept-png.png";

export default function Tournament() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allTournaments, setAllTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Filter Tournaments based on search input
  const filteredTournaments = allTournaments.filter((tourn) =>
    tourn.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-screen ">
        <span className="loading loading-spinner text-secondary"></span>
      </div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 bg-[#121212] min-h-screen text-center">{error}</div>;
  }

  return (
    <div className="p-4 text-white bg-[#121212] min-h-screen">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search The Tournament..."
        className="w-full p-2 rounded bg-gray-800 text-[15px] text-white mb-4 placeholder:text-gray-500"
      />

      <h2 className="text-sm  text-pink-500 mb-2">All Tournaments</h2>
      {filteredTournaments.length > 0 ? (
        <ul className="space-y-4">
          {filteredTournaments.map((tourn) => (
            <li
              key={tourn._id} // Use _id for unique key
              className="flex items-center justify-between border-b border-gray-900 pb-2"
            >
              <div className="flex items-center gap-3">
                <img
                  src={tourn.logo || defaultTournamentLogo} // Use tournament.logo or default
                  alt={tourn.name}
                  className="w-5 h-5 border-1 rounded-full object-cover" // Style for image
                />
                <div>
                  <div className="text-[10px] text-gray-500">{tourn.location || 'Unknown Location'}</div> {/* Use tourn.location */}
                  <Link
                    to={`/tournament/${tourn._id}`}
                    // --- IMPORTANT: Pass state here ---
                    state={{ tournamentName: tourn.name }}
                  >
                    <div className="text-[13px] text-white">
                      {tourn.name}
                    </div>
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 mt-4">No Tournaments found.</p>
      )}
    </div>
  );
}