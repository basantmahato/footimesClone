import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminTournamentPage = () => {
  const [tournaments, setTournaments] = useState([]); // ✅ Ensure this is always an array
  const [form, setForm] = useState({ name: "", location: "" });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const res = await axios.get("https://api.footimes.com/api/tournaments");
      console.log("Fetched tournaments:", res.data);
      setTournaments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching tournaments:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(
          `https://api.footimes.com/api/tournaments/${editingId}`,
          form
        );
        alert("Tournament updated!");
      } else {
        await axios.post("https://api.footimes.com/api/tournaments", form);
        alert("Tournament added!");
      }
      resetForm();
      fetchTournaments();
      setShowForm(false);
    } catch (err) {
      console.error("Error saving tournament:", err);
    }
  };

  const handleEdit = (t) => {
    setForm({ name: t.name, location: t.location });
    setEditingId(t._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this tournament?")) return;
    try {
      await axios.delete(`https://api.footimes.com/api/tournaments/${id}`);
      alert("Deleted!");
      fetchTournaments();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const resetForm = () => {
    setForm({ name: "", location: "" });
    setEditingId(null);
  };

  return (
    <div className="p-5 w-full">
      <div className="max-w-3xl mx-auto p-4 bg-black mt-5 mb-10 px-6 sm:px-8 rounded-lg shadow-md border border-pink-600">
        {!showForm && (
          <>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="mb-6 py-2 px-4 bg-black border-1 text-[13px] hover:bg-pink-700 transition-colors text-white rounded-xl"
            >
              Add New Tournament
            </button>

            <h3 className="text-[15px] mb-4 text-white">Tournaments</h3>
            {tournaments.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <p className="text-gray-400">No tournaments added yet.</p>
                <div role="status">
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
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            ) : (
              <table className="w-full border-collapse border border-gray-700 text-white text-center text-[13px]">
                <thead>
                  <tr className="bg-pink-700 text-white">
                    <th className="border border-gray-700 p-2">Name</th>
                    <th className="border border-gray-700 p-2">Location</th>
                    <th className="border border-gray-700 p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tournaments.map((t) => (
                    <tr key={t._id}>
                      <td className="border border-gray-700 p-2">{t.name}</td>
                      <td className="border border-gray-700 p-2">
                        {t.location}
                      </td>
                      <td className="border border-gray-700 p-2 space-x-2">
                        <div className="flex flex-col sm:flex-row flex-auto gap-y-2 gap-x-4 justify-center items-center">
                          
                          <button
                            onClick={() => handleEdit(t)}
                            className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(t._id)}
                            className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {showForm && (
          <>
            <h2 className="text-[18px] mb-6 text-white">
              {editingId ? "Edit" : "Add"} Tournament
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 mb-8 ">
              <input
                name="name"
                placeholder="Tournament Name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-[13px] rounded border border-pink-600 bg-black text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-600"
              />
              <input
                name="location"
                placeholder="Location"
                value={form.location}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded text-[13px] border border-pink-600 bg-black text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-600"
              />
              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className={`py-2 px-3 rounded text-[13px] text-white ${
                    editingId
                      ? "bg-pink-700 hover:bg-pink-800"
                      : "bg-pink-600 hover:bg-pink-700"
                  } transition-colors`}
                >
                  {editingId ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="ml-4 py-2 text-[13px] px-3 rounded hover:bg-red-600 border-b-fuchsia-50 border text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminTournamentPage;