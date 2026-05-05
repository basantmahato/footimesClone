import React, { useEffect, useState } from "react";
import axios from "axios";
import { HiOutlineX } from "react-icons/hi";

const formatForInput = (rawDate) => {
  if (!rawDate) return "";
  const d = new Date(rawDate);
  return d.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
};

export default function AdminAddFixture() {
  const [tournaments, setTournaments] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [form, setForm] = useState({
    teamA: "",
    teamB: "",
    matchDate: "",
    venue: "",
    tournament: "",
    matchRound: "",
    admin: "Admin",
  });
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTournaments();
    fetchFixtures();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Use '/' key to trigger search prompt (ignore if typing in an input/textarea)
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
      ) {
        e.preventDefault();
        const term = window.prompt(
          "Search fixtures (by team, venue, round, tournament):",
          searchTerm
        );
        if (term !== null) setSearchTerm(term);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchTerm]);

  const fetchTournaments = () => {
    setLoadingTournaments(true);
    axios
      .get("https://api.footimes.com/api/tournaments")
      .then((res) => {
        setTournaments(res.data);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch tournaments:", err);
        setTournaments([]);
      })
      .finally(() => setLoadingTournaments(false));
  };

  const fetchFixtures = () => {
    axios
      .get("https://football-server-1chx.onrender.com/api/fixtures")
      .then((res) => setFixtures(res.data))
      .catch((err) => {
        console.error("❌ Error loading fixtures:", err);
        setFixtures([]);
      })
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields
    if (
      !form.teamA ||
      !form.teamB ||
      !form.matchDate ||
      !form.tournament ||
      !form.matchRound
    ) {
      setFormError(
        <p className="text-red-500 text-[13px]">
          Please fill all required fields.
        </p>
      );
      return;
    }

    try {
      // Prepare clean payload
      const payload = {
        ...form,
        matchDate: new Date(form.matchDate).toISOString(),
        tournament:
          typeof form.tournament === "object"
            ? form.tournament._id
            : form.tournament,
      };

      if (form._id) {
        await axios.put(
          `https://football-server-1chx.onrender.com/api/fixtures/${form._id}`,
          payload
        );
        alert("✅ Fixture updated!");
      } else {
        await axios.post(
          "https://football-server-1chx.onrender.com/api/fixtures",
          payload
        );
        alert("✅ Fixture added!");
      }

      // Reset form
      setForm({
        teamA: "",
        teamB: "",
        matchDate: "",
        venue: "",
        tournament: "",
        matchRound: "",
        admin: "Admin",
      });
      setFormError("");
      fetchFixtures();
    } catch (err) {
      console.error("❌ Failed to save fixture:", err.response?.data || err);
      alert("❌ Failed to save fixture. Check console for details.");
    }
  };

  const handleEdit = (fix) => {
    setForm({
      ...fix,
      matchDate: formatForInput(fix.matchDate),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure to delete this fixture?")) {
      try {
        await axios.delete(
          `https://football-server-1chx.onrender.com/api/fixtures/${id}`
        );
        fetchFixtures();
      } catch (err) {
        alert("❌ Delete failed");
      }
    }
  };

  const getTournamentName = (tournamentField) => {
    if (!tournamentField) return "Unknown";

    const id =
      typeof tournamentField === "object" && tournamentField !== null
        ? tournamentField._id
        : tournamentField;

    const found = tournaments.find((t) => String(t._id) === String(id));
    return found ? found.name : "Unknown";
  };

  // Filter fixtures by search term (case-insensitive, matches teamA, teamB, venue, matchRound, tournament name, team vs team)
  const filteredFixtures = fixtures.filter((fix) => {
    if (!searchTerm.trim()) return true;
    const lower = searchTerm.toLowerCase();
    const teamVsTeam = `${fix.teamA} vs ${fix.teamB}`.toLowerCase();

    return (
      (fix.teamA && fix.teamA.toLowerCase().includes(lower)) ||
      (fix.teamB && fix.teamB.toLowerCase().includes(lower)) ||
      (fix.venue && fix.venue.toLowerCase().includes(lower)) ||
      (fix.matchRound && fix.matchRound.toLowerCase().includes(lower)) ||
      getTournamentName(fix.tournament).toLowerCase().includes(lower)  ||
      teamVsTeam.includes(lower)
    );
  });

  return (
    <div className="bg-black text-white min-h-screen px-4 py-10 -mt-5 md:-mt-15 mb-10">
      <div className="shadow-md border border-pink-600 rounded-xl p-6 max-w-3xl mx-auto bg-black">
        <h2 className="text-[20px] text-center mb-4">Add / Edit Fixture</h2>

        {formError && (
          <p className="text-pink-300 text-center mb-2">{formError}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <select
            className="border border-pink-600 bg-black text-white px-4 py-2 text-[13px] rounded focus:outline-none focus:ring-1 focus:ring-pink-500"
            value={form.matchRound}
            onChange={(e) => setForm({ ...form, matchRound: e.target.value })}
          >
            <option value="">Select Match Round *</option>
            <option value="First Round">First Round</option>
            <option value="Second Round">Second Round</option>
            <option value="Quarter-finals">Quarter-finals</option>
            <option value="Semi-finals">Semi-finals</option>
            <option value="Final">Final</option>
          </select>

          <input
            className="border border-pink-600 bg-black text-[13px] placeholder-pink-300 px-4 py-2 rounded focus:outline-none focus:ring-1 focus:ring-pink-500"
            placeholder="Team A *"
            value={form.teamA}
            onChange={(e) => setForm({ ...form, teamA: e.target.value })}
          />
          <input
            className="border border-pink-600 bg-black text-[13px] text-white placeholder-pink-300 px-4 py-2 rounded focus:outline-none focus:ring-1 focus:ring-pink-500"
            placeholder="Team B *"
            value={form.teamB}
            onChange={(e) => setForm({ ...form, teamB: e.target.value })}
          />
          <input
            type="datetime-local"
            value={form.matchDate}
            onChange={(e) => setForm({ ...form, matchDate: e.target.value })}
            className="bg-black text-white border border-pink-600 rounded text-[13px] px-4 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500"
          />
          <input
            className="border border-pink-600 bg-black placeholder-pink-300 text-[13px] text-white px-4 py-2 rounded focus:outline-none focus:ring-1 focus:ring-pink-500"
            placeholder="Venue (optional)"
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
          />

          <select
            className="border border-pink-600 bg-black text-white px-4 py-2 text-[13px] rounded focus:outline-none focus:ring-1 focus:ring-pink-500"
            value={form.tournament}
            onChange={(e) => setForm({ ...form, tournament: e.target.value })}
            disabled={loadingTournaments}
          >
            <option value="">Select Tournament *</option>
            {tournaments.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>

          <button
            className="bg-pink-600 hover:bg-pink-700 transition text-white py-2 rounded font-medium"
            type="submit"
          >
            {form._id ? "Update Fixture" : "Add Fixture"}
          </button>
        </form>

        <div className="flex items-center justify-between mt-6">
          <h3 className="text-[15px] mt-10 mb-4 text-gray-500">
            Fixture History
          </h3>

          <div className="relative max-w-md ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>

            <input
              className="w-full pr-10 pl-8 border border-pink-600 bg-black text-white py-2 text-[13px] rounded focus:outline-none focus:ring-1 focus:ring-pink-500"
              type="text"
              placeholder="Search fixtures"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {searchTerm && (
              <HiOutlineX
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-400 hover:text-white cursor-pointer"
                size={18}
              />
            )}
          </div>
        </div>

        {loading ? (
         <span className="loading loading-spinner text-secondary"></span>
        ) : filteredFixtures.length === 0 ? (
          <p className="text-red-500 text-center text-[15px]">
            No fixtures found.
          </p>
        ) : (
          <div className="space-y-4">
            {[...filteredFixtures]
              .sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate))
              .map((fix) => (
                <div
                  key={fix._id}
                  className="border border-pink-600 p-4 rounded-lg bg-black flex flex-col sm:flex-row justify-between items-start sm:items-center"
                >
                  <div className="flex gap-3 items-center">
                    {fix.image && (
                      <img
                        src={fix.image}
                        alt="Match"
                        className="w-16 h-16 object-cover rounded border border-white"
                      />
                    )}
                    <div>
                      <p className="font-medium text-[15px]">
                        {fix.teamA} vs {fix.teamB}
                      </p>
                      <p className="text-[13px] text-gray-400">
                        {new Date(fix.matchDate).toLocaleString()}
                        <br />
                        {fix.venue || "N/A"}
                        <br />
                        <b className="text-pink-500 font-extralight">
                          Round:
                        </b>
                        {fix.matchRound || "N/A"}
                        <br />
                        {getTournamentName(fix.tournament)}
                        <br />
                        {fix.admin || "Admin"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => handleEdit(fix)}
                      className="bg-pink-600 hover:bg-pink-700 text-white text-sm px-3 py-1 rounded transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(fix._id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}