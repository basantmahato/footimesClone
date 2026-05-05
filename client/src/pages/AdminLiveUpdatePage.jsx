// In AdminLiveUpdatePage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import axios from "axios";
import io from "socket.io-client";

const socket = io("https://api.footimes.com"); // ✅ Adjust to your backend URL

const playerPositions = [
  "Goalkeeper",
  "Defender",
  "Midfielder",
  "Forward",
  "Center-back",
  "Full-back",
  "Wing-back",
  "Defensive Midfielder",
  "Central Midfielder",
  "Attacking Midfielder",
  "Winger",
  "Striker",
  "Center Forward",
];

export default function AdminLiveUpdatePage() {
  const { fixtureId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Use useLocation to access state

  // Extract tournamentName from location.state, provide a default if not found
  const tournamentNameFromState =
    location.state?.tournamentName || "Unknown Tournament";

  const emptyPlayer = { name: "", number: "", position: "" };

  const [fixture, setFixture] = useState(null);
  const [form, setForm] = useState({
    scoreA: 0,
    scoreB: 0,
    playersA: [emptyPlayer],
    playersB: [emptyPlayer],
    subsA: [emptyPlayer],
    subsB: [emptyPlayer],
    resultA: "", // win | lose | draw
    resultB: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fixtureId) return;
    fetchMatchData();

    socket.on("liveMatchUpdated", (data) => {
      if (data.fixtureId === fixtureId) {
        setForm(data);
      }
    });

    return () => {
      socket.off("liveMatchUpdated");
    };
  }, [fixtureId]);

  const fetchMatchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fixtureRes = await axios.get(
        `https://api.footimes.com/api/fixtures/${fixtureId}`
      );
      setFixture(fixtureRes.data);

      try {
        const liveRes = await axios.get(
          `https://api.footimes.com/api/livescore?fixtureId=${fixtureId}`
        );
        const live = liveRes.data;

        setForm({
          scoreA: live.scoreA ?? 0,
          scoreB: live.scoreB ?? 0,
          playersA: live.playersA?.length ? live.playersA : [emptyPlayer],
          playersB: live.playersB?.length ? live.playersB : [emptyPlayer],
          subsA: live.subsA?.length ? live.subsA : [emptyPlayer],
          subsB: live.subsB?.length ? live.subsB : [emptyPlayer],
        });
      } catch (err) {
        if (err.response?.status === 404) {
          setForm({
            scoreA: 0,
            scoreB: 0,
            playersA: [emptyPlayer],
            playersB: [emptyPlayer],
            subsA: [emptyPlayer],
            subsB: [emptyPlayer],
          });
        } else throw err;
      }
    } catch (err) {
      console.error("Error loading match:", err);
      setError("Failed to load fixture or live score data.");
    } finally {
      setLoading(false);
    }
  };

  const updateLiveMatch = async () => {
    try {
      const tournamentNameToSave =
        fixture.tournamentName || tournamentNameFromState;

      const res = await axios.get(
        `https://api.footimes.com/api/livescore?fixtureId=${fixtureId}`
      );
      const existing = res.data;

      const { status, startedAt, ...cleanedExisting } = existing;

      await axios.patch(`https://api.footimes.com/api/livescore/${fixtureId}`, {
        ...cleanedExisting,
        scoreA: form.scoreA,
        scoreB: form.scoreB,
        playersA: form.playersA,
        playersB: form.playersB,
        subsA: form.subsA,
        subsB: form.subsB,
        resultA: form.resultA,
        resultB: form.resultB,
        tournamentName: tournamentNameToSave,
      });

      socket.emit("liveMatchUpdated", {
        fixtureId,
        tournamentName: tournamentNameToSave,
        ...form,
      });

      alert("✅ Live match data saved");
      navigate("/admin/matches");
    } catch (err) {
      if (err.response?.status === 404) {
        const tournamentNameToSave =
          fixture.tournamentName || tournamentNameFromState;
        await axios.post(`https://api.footimes.com/api/livescore`, {
          fixtureId,
          teamA: fixture.teamA,
          teamB: fixture.teamB,
          tournamentName: tournamentNameToSave,
          scoreA: form.scoreA,
          scoreB: form.scoreB,
          playersA: form.playersA,
          playersB: form.playersB,
          subsA: form.subsA,
          subsB: form.subsB,
          resultA: form.resultA,
          resultB: form.resultB,
        });
        

        socket.emit("liveMatchUpdated", {
          fixtureId,
          tournamentName: tournamentNameToSave,
          ...form,
        });

        alert("✅ New live match created and saved");
        navigate("/admin/matches");
      } else {
        console.error("Failed to save live match:", err);
        alert("❌ Failed to save live match data");
      }
    }
  };

  // New delete function
  const deleteLiveMatch = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this live match data? This action cannot be undone."
      )
    ) {
      try {
        await axios.delete(
          `https://api.footimes.com/api/livescore/${fixtureId}`
        );
        socket.emit("liveMatchDeleted", { fixtureId }); // Emit deletion event
        alert("✅ Live match data deleted successfully");
        navigate("/admin/matches");
      } catch (err) {
        console.error("Failed to delete live match:", err);
        alert("❌ Failed to delete live match data");
      }
    }
  };

  const updateArray = (field, index, key, value) => {
    const updated = [...form[field]];
    updated[index] = { ...updated[index], [key]: value };
    setForm({ ...form, [field]: updated });
  };

  const addToArray = (field) => {
    setForm({ ...form, [field]: [...form[field], emptyPlayer] });
  };

  const removeFromArray = (field, index) => {
    if (form[field].length <= 1) return;
    const updated = form[field].filter((_, i) => i !== index);
    setForm({ ...form, [field]: updated });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <svg
          aria-hidden="true"
          className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-pink-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
      </div>
    );
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!fixture)
    return <div className="text-gray-500 p-4">Fixture not found.</div>;

  const renderPlayerInputs = (field, teamLabel) => (
    <>
      <h3 className=" mb-2">{teamLabel}</h3>
      {form[field].map((player, i) => (
        <div key={`${field}-${i}`} className="flex mb-2 gap-2">
          <input
            placeholder="Name"
            value={player.name}
            onChange={(e) => updateArray(field, i, "name", e.target.value)}
            className="w-full p-2 rounded border text-[13px] border-pink-600 bg-black-700"
          />
          <input
            placeholder="Number"
            type="number"
            min={0}
            value={player.number}
            onChange={(e) => updateArray(field, i, "number", e.target.value)}
            className="w-full p-2 rounded border text-[13px] border-pink-600 bg-black-700"
          />
          <select
            value={player.position}
            onChange={(e) => updateArray(field, i, "position", e.target.value)}
            className="w-full p-2 rounded border text-[13px] border-pink-600 bg-black-700"
          >
            <option value="">Select Position</option>
            {playerPositions.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
          {form[field].length > 1 && i !== 0 && (
            <button type="button" onClick={() => removeFromArray(field, i)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        className={`px-3 py-1 text-[13px] rounded ${
          field.includes("subs") ? "bg-pink-500" : "bg-pink-500"
        }`}
        onClick={() => addToArray(field)}
      >
        Add {field.includes("subs") ? "Sub" : "Player"}
      </button>
    </>
  );

  return (
    <div className="max-w-3xl mx-auto p-6 pb-30 text-white">
      <h2 className="text-[18px] text-center mb-4">Update Live Match</h2>

      {/* Display Tournament Name and Team Names */}
      <div className="mb-4 text-lg">
        <p className="text-[15px] text-pink-500 text-center mb-2">
          {tournamentNameFromState}
        </p>
        <div className="flex justify-center gap-4 items-center mb-4 text-[13px]">
  <div className="flex flex-col items-center">
    <label>{fixture.teamA}</label>
    <select
      value={form.resultA}
      onChange={(e) =>
        setForm({ ...form, resultA: e.target.value, resultB: e.target.value === "win" ? "lose" : e.target.value === "lose" ? "win" : "draw" })
      }
      className="bg-black  border border-pink-500 p-1 rounded text-white"
    >
      <option className="bg-black hover:bg-pink-500" value="">Result</option>
      <option className="bg-black hover:bg-pink-500" value="win">Win</option>
      <option className="bg-black hover:bg-pink-500" value="lose">Lose</option>
      <option className="bg-black hover:bg-pink-500" value="draw">Draw</option>
    </select>
  </div>

  <div className="text-pink-500">vs</div>

  <div className="flex flex-col items-center">
    <label>{fixture.teamB}</label>
    <select
      value={form.resultB}
      onChange={(e) =>
        setForm({ ...form, resultB: e.target.value, resultA: e.target.value === "win" ? "lose" : e.target.value === "lose" ? "win" : "draw" })
      }
      className="bg-black-700 border border-pink-500 p-1 rounded text-white"
    >
       <option className="bg-black hover:bg-pink-500" value="">Result</option>
      <option className="bg-black hover:bg-pink-500" value="win">Win</option>
      <option className="bg-black hover:bg-pink-500" value="lose">Lose</option>
      <option className="bg-black hover:bg-pink-500" value="draw">Draw</option>
    </select>
  </div>
</div>
        <p className="text-[13px] text-center text-gray-400">
          Date: {new Date(fixture.matchDate).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-[13px]">Score A</label>
          <input
            type="number"
            min={0}
            value={form.scoreA}
            onChange={(e) =>
              setForm({ ...form, scoreA: Math.max(0, Number(e.target.value)) })
            }
            className="w-full p-2 rounded border text-[13px] border-pink-600 bg-black-700"
          />
        </div>
        <div>
          <label className="text-[13px]">Score B</label>
          <input
            type="number"
            min={0}
            value={form.scoreB}
            onChange={(e) =>
              setForm({ ...form, scoreB: Math.max(0, Number(e.target.value)) })
            }
            className="w-full p-2 rounded border text-[13px] border-pink-600 bg-black-700"
          />
        </div>
      </div>

      {renderPlayerInputs("playersA", `Players (${fixture.teamA})`)}
      {renderPlayerInputs("playersB", `Players (${fixture.teamB})`)}
      {renderPlayerInputs("subsA", `Substitutes (${fixture.teamA})`)}
      {renderPlayerInputs("subsB", `Substitutes (${fixture.teamB})`)}

      <div className="mt-6 flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate("/admin/matches")}
          className="px-4 text-[13px] py-2 bg-black border-1 border-pink-500 hover:bg-pink-500 transition-colors rounded"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4 mr-1 inline-block"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18"
            />
          </svg>
          Back
        </button>
        <button
          type="button"
          onClick={deleteLiveMatch} // New delete button
          className="px-4 text-[13px] py-2 bg-red-600 rounded"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-3 mr-2 inline-block"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
          Delete Live Data
        </button>
        <button
          type="button"
          onClick={updateLiveMatch}
          className="px-4 py-2 text-[13px] bg-green-600 rounded"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}