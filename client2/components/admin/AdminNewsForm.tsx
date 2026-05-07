'use client';

import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { useAdminTheme } from "./AdminThemeContext";

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
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

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

  const themeInput = isDark ? "bg-zinc-900 border-white/10 text-white" : "bg-white border-black/10 text-black";
  const themeLabel = isDark ? "text-white/40" : "text-black/40";
  const themeCardInner = isDark ? "border-white/5" : "border-black/5";

  return (
    <div className={`p-8 ${isDark ? 'bg-transparent text-white' : 'bg-white text-black'} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight mb-8">
          {editId ? "Edit" : "Publish"} News
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-6">
            <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase ${themeLabel} tracking-widest ml-1`}>Thumbnail Image</label>
              <div className={`relative aspect-square border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/[0.02]'} rounded-2xl overflow-hidden group hover:border-inherit transition-all`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  aria-label="Upload news thumbnail"
                  title="Upload news thumbnail"
                />
                {previewUrl || thumbnailUrl ? (
                  <div className="relative w-full h-full">
                    <Image src={previewUrl || thumbnailUrl!} alt="Preview" fill className="object-cover" />
                    <div className={`absolute inset-0 ${isDark ? 'bg-black/60' : 'bg-white/40'} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-black'}`}>Change Image</span>
                    </div>
                  </div>
                ) : (
                  <div className={`flex flex-col items-center justify-center h-full ${isDark ? 'text-white/20' : 'text-black/20'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6.75a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6.75v12.5a1.5 1.5 0 0 0 1.5 1.5Zm12-4.5h.008v.008h-.008V13.5Zm-2.25-3h.008v.008h-.008V10.5Z" />
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Upload Image</span>
                  </div>
                )}
              </div>
              {fileError && <p className="text-red-500 text-[10px] font-bold text-center mt-2">{fileError}</p>}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className={`text-[10px] font-bold uppercase ${themeLabel} tracking-widest ml-1`}>Article Title</label>
                <input
                  type="text"
                  placeholder="Enter news title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${themeInput} focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all font-bold text-sm`}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-[10px] font-bold uppercase ${themeLabel} tracking-widest ml-1`}>Content</label>
                <textarea
                  placeholder="Enter detailed description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${themeInput} focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all min-h-[180px] resize-none text-sm leading-relaxed`}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-[10px] font-bold uppercase ${themeLabel} tracking-widest ml-1`}>Category / Tournament</label>
                <select
                  value={selectedTournament}
                  onChange={(e) => setSelectedTournament(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${themeInput} focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all text-sm font-bold`}
                  title="Select News Category"
                  required
                  aria-label="Select News Category or Tournament"
                >
                  <option value="">Select Category</option>
                  {tournaments.map((t) => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 ${isDark ? 'bg-white text-black' : 'bg-black text-white'} font-bold text-xs uppercase tracking-widest py-4 rounded-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50`}
              >
                {loading ? <span className="loading loading-spinner loading-xs"></span> : (editId ? "Update Article" : "Publish Article")}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className={`px-8 py-4 border ${themeInput} font-bold text-xs uppercase tracking-widest rounded-lg hover:opacity-80 transition-all`}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>

        <div className={`mt-20 pt-10 border-t ${themeCardInner}`}>
          <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${themeLabel} mb-8`}>Published Content</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newsList.map((item) => (
              <div key={item._id} className={`border ${themeCardInner} p-4 rounded-xl flex gap-4 group hover:border-inherit transition-all`}>
                <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 transition-all duration-500">
                  <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-inherit line-clamp-2 mb-1 group-hover:underline">{item.title}</h4>
                  <p className={`text-[9px] ${themeLabel} font-bold uppercase tracking-wider`}>
                    {item.tournament?.name || "General"} • {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-3 mt-3">
                    <button onClick={() => handleEdit(item)} className="text-[9px] font-black text-inherit uppercase hover:underline">Edit</button>
                    <button onClick={() => handleDelete(item._id)} className="text-[9px] font-black text-red-500 uppercase hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
