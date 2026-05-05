import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminNewsForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null); // This will store the Cloudinary URL
  const [newsList, setNewsList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // For local file preview
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    // Fetch tournaments
    axios
      .get("https://api.footimes.com/api/news/tournaments")
      .then((res) => setTournaments(res.data))
      .catch((err) => console.error("Failed to load tournaments:", err));

    // Fetch news items
    fetchNews();
  }, []);

  useEffect(() => {
    // Create and revoke object URL for local file preview
    if (thumbnailFile) {
      const objectUrl = URL.createObjectURL(thumbnailFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [thumbnailFile]);

  const fetchNews = () => {
    axios
      .get("https://api.footimes.com/api/news")
      .then((res) => setNewsList(res.data))
      .catch((err) => {
        console.error("Failed to load news:", err);
        setNewsList([]);
      });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setFileError("Thumbnail must be less than 1MB");
        setThumbnailFile(null);
        e.target.value = null; // Clear the input
      } else {
        setFileError("");
        setThumbnailFile(file);
        // When a new file is selected, clear any previously set Cloudinary URL
        setThumbnailUrl(null);
      }
    } else {
      setThumbnailFile(null);
      setFileError("");
      setThumbnailUrl(null); // Clear Cloudinary URL if file is deselected
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Images"); // Replace with your actual Cloudinary upload preset

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dqedfnfpl/image/upload", // Replace with your Cloudinary cloud name
        formData
      );
      return res.data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      throw new Error("Failed to upload image to Cloudinary.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !selectedTournament) {
      alert("Please fill in all fields.");
      return;
    }

    if (fileError) {
      alert("Please fix the file error before submitting.");
      return;
    }

    let currentThumbnail = thumbnailUrl; // Start with the existing Cloudinary URL if editing or no new file
    if (thumbnailFile) {
      // Only upload if a new file is selected
      try {
        currentThumbnail = await uploadToCloudinary(thumbnailFile);
        setThumbnailUrl(currentThumbnail); // Update state with the new Cloudinary URL
        console.log("✅ Uploaded Image URL:", currentThumbnail);
      } catch (err) {
        alert(err.message);
        return;
      }
    } else if (!thumbnailUrl && !editId) {
      // If no file is selected and not in edit mode, and no existing URL
      alert("Please upload a thumbnail image.");
      return;
    }

    const payload = {
      title,
      description,
      tournamentId: selectedTournament,
      thumbnail: currentThumbnail, // Use the uploaded or existing Cloudinary URL
    };
    console.log("Submitting payload:", payload);
    try {
      if (editId) {
        await axios.put(`https://api.footimes.com/api/news/${editId}`, payload);
        alert("News updated successfully");
      } else {
        await axios.post("https://api.footimes.com/api/news", payload);
        alert("News posted successfully");
      }
      resetForm();
      fetchNews();
    } catch (error) {
      console.error("Error submitting news:", error);
      alert(
        `Submission failed! ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setTitle(item.title);
    setDescription(item.description);
    setSelectedTournament(item.tournament?._id || "");
    setThumbnailUrl(item.thumbnail || null); // Set the Cloudinary URL from the item
    setThumbnailFile(null); // Clear any pending local file selection
    setFileError("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this news item?")) {
      try {
        await axios.delete(`https://api.footimes.com/api/news/${id}`);
        alert("News deleted");
        fetchNews();
      } catch (error) {
        console.error("Delete failed:", error);
        alert(
          `Delete failed! ${error.response?.data?.message || error.message}`
        );
      }
    }
  };

  const resetForm = () => {
    setEditId(null);
    setTitle("");
    setDescription("");
    setSelectedTournament("");
    setThumbnailFile(null);
    setThumbnailUrl(null); // Clear Cloudinary URL on form reset
    setPreviewUrl(null); // Clear local preview URL
    setFileError("");
  };

  return (
    <div className="p-4 max-w-3xl  mx-auto text-white bg-black">
      <h2 className="text-[18px] mb-4">{editId ? "Edit News" : "Post News"}</h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-black p-4 rounded border border-pink-600"
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleThumbnailChange}
          className="w-full p-2 text-[13px] rounded bg-black border border-pink-600 text-white placeholder-pink-300"
        />
        {fileError && <p className="text-red-500 text-sm">{fileError}</p>}

        {(previewUrl || thumbnailUrl) && (
          <img
            src={previewUrl || thumbnailUrl}
            alt="Preview"
            className="h-24 mt-2 border border-white rounded"
          />
        )}

        <input
          type="text"
          placeholder="News Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 text-[13px] rounded bg-black border border-pink-600 text-white placeholder-pink-300"
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 text-[13px] rounded bg-black border border-pink-600 text-white placeholder-pink-300"
          required
        />

        <select
          value={selectedTournament}
          onChange={(e) => setSelectedTournament(e.target.value)}
          className="w-full p-2 text-[13px] rounded bg-black border border-pink-600 text-white"
          required
        >
          <option value="">Select Tournament</option>
          {tournaments.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-pink-600 hover:bg-pink-700 text-[13px] text-white px-4 py-2 rounded transition"
          >
            {editId ? "Update" : "Submit"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-white text-[13px] text-black hover:bg-gray-200 px-4 py-2 rounded transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-8 mb-10">
        <h3 className="text-[18px] mb-2 text-white">Previous News</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {newsList.map((item) => (
            <div
              key={item._id}
              className="bg-black text-white border border-pink-500 p-3 rounded-md flex items-center gap-4"
            >
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-20 h-20 object-cover rounded border border-white"
              />
              <div className="flex-1">
                <h4 className="text-[13px]  text-white">{item.title}</h4>
                <p className="text-[10px] text-gray-400">
                  {item.tournament?.name || "No Tournament"} •{" "}
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="text-[13px] bg-pink-600 hover:bg-pink-700 text-white  px-3 py-1 rounded transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="text-[13px] bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}