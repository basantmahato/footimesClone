'use client';

import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";

interface NewsItem {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  tournament?: { _id: string, name: string };
  createdAt: string;
}

interface Tournament {
  _id: string;
  name: string;
}

export default function AdminNewsForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("https://api.footimes.com/api/news/tournaments")
      .then((res) => setTournaments(res.data))
      .catch((err) => console.error("Failed to load tournaments:", err));
    fetchNews();
  }, []);

  useEffect(() => {
    if (thumbnailFile) {
      const objectUrl = URL.createObjectURL(thumbnailFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [thumbnailFile]);

  const fetchNews = () => {
    axios.get("https://api.footimes.com/api/news")
      .then((res) => setNewsList(res.data))
      .catch(() => setNewsList([]));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setFileError("Thumbnail must be less than 1MB");
        setThumbnailFile(null);
        e.target.value = "";
      } else {
        setFileError("");
        setThumbnailFile(file);
        setThumbnailUrl(null);
      }
    } else {
      setThumbnailFile(null);
      setFileError("");
      setThumbnailUrl(null);
    }
  };

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Images");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dqedfnfpl/image/upload",
        formData
      );
      return res.data.secure_url;
    } catch (error) {
      throw new Error("Failed to upload image to Cloudinary.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !selectedTournament) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    let currentThumbnail = thumbnailUrl;
    if (thumbnailFile) {
      try {
        currentThumbnail = await uploadToCloudinary(thumbnailFile);
      } catch (err: any) {
        alert(err.message);
        setLoading(false);
        return;
      }
    } else if (!thumbnailUrl && !editId) {
      alert("Please upload a thumbnail image.");
      setLoading(false);
      return;
    }

    const payload = {
      title,
      description,
      tournamentId: selectedTournament,
      thumbnail: currentThumbnail,
    };

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
      alert("Submission failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: NewsItem) => {
    setEditId(item._id);
    setTitle(item.title);
    setDescription(item.description);
    setSelectedTournament(item.tournament?._id || "");
    setThumbnailUrl(item.thumbnail || null);
    setThumbnailFile(null);
    setFileError("");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this news item?")) {
      try {
        await axios.delete(`https://api.footimes.com/api/news/${id}`);
        alert("News deleted");
        fetchNews();
      } catch (error) {
        alert("Delete failed!");
      }
    }
  };

  const resetForm = () => {
    setEditId(null);
    setTitle("");
    setDescription("");
    setSelectedTournament("");
    setThumbnailFile(null);
    setThumbnailUrl(null);
    setPreviewUrl(null);
    setFileError("");
  };

  return (
    <div className="p-4 max-w-4xl mx-auto bg-black min-h-screen text-white">
      <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 shadow-2xl mb-12">
        <h2 className="text-2xl font-black mb-8 text-center uppercase tracking-tighter">
          {editId ? "Edit" : "Post"} <span className="text-pink-500">News</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-800 rounded-3xl bg-black/50 hover:border-pink-500/50 transition-colors group relative overflow-hidden">
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              aria-label="Upload news thumbnail"
              title="Upload news thumbnail"
            />
            {previewUrl || thumbnailUrl ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl">
                <Image src={previewUrl || thumbnailUrl!} alt="Preview" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-bold uppercase tracking-widest">Change Image</span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-pink-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6.75a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6.75v12.5a1.5 1.5 0 0 0 1.5 1.5Zm12-4.5h.008v.008h-.008V13.5Zm-2.25-3h.008v.008h-.008V10.5Z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-zinc-400">Upload Thumbnail</p>
                <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-widest">Max 1MB • PNG/JPG</p>
              </div>
            )}
          </div>
          {fileError && <p className="text-red-400 text-xs font-bold text-center mt-2">{fileError}</p>}

          <div className="space-y-4">
            <input
              type="text"
              placeholder="News Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-4 rounded-2xl bg-zinc-800 border border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-pink-500 outline-none transition-all font-bold"
              required
            />

            <textarea
              placeholder="Detailed Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-4 rounded-2xl bg-zinc-800 border border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-pink-500 outline-none transition-all min-h-[150px] resize-none"
              required
            />

            <select
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
              className="w-full px-4 py-4 rounded-2xl bg-zinc-800 border border-white/10 text-white focus:ring-2 focus:ring-pink-500 outline-none transition-all text-sm font-bold"
              required
              aria-label="Select News Category or Tournament"
            >
              <option value="">Select Category/Tournament</option>
              {tournaments.map((t) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-pink-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <span className="loading loading-spinner loading-sm"></span> : (editId ? "Update News" : "Publish News")}
            </button>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8">
        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500 mb-8">Published Articles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {newsList.map((item) => (
            <div key={item._id} className="bg-zinc-900 border border-white/5 p-4 rounded-2xl flex gap-4 group hover:bg-zinc-800 transition-colors">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white line-clamp-2 mb-2 group-hover:text-pink-500 transition-colors">{item.title}</h4>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  {item.tournament?.name || "General"} • {new Date(item.createdAt).toLocaleDateString()}
                </p>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => handleEdit(item)} className="text-[10px] font-black text-pink-500 uppercase hover:underline">Edit</button>
                  <button onClick={() => handleDelete(item._id)} className="text-[10px] font-black text-red-500 uppercase hover:underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
