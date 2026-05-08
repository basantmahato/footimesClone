'use client';

import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { useAdminTheme } from "./AdminThemeContext";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";

interface NewsItem {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  tournament?: { _id: string, name: string };
  category?: { _id: string, name: string };
  createdAt: string;
}

interface Tournament {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
}

export default function AdminNewsForm() {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    fetchData();
    fetchNews();
  }, []);

  const fetchData = async () => {
    try {
      const [tournsRes, catsRes] = await Promise.all([
        axios.get("https://api.footimes.com/api/news/tournaments"),
        axios.get("https://api.footimes.com/api/categories")
      ]);
      setTournaments(tournsRes.data);
      setCategories(catsRes.data);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  };

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

  const handleQuickAddCategory = async () => {
    if (!newCategoryName) return;
    try {
      const res = await axios.post("https://api.footimes.com/api/categories", { name: newCategoryName });
      setCategories([...categories, res.data]);
      setSelectedCategory(res.data._id);
      setNewCategoryName("");
      setShowAddCategory(false);
      toast.success("Category added!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add category");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error("Title and description are required.");
      return;
    }

    setLoading(true);
    let currentThumbnail = thumbnailUrl;
    if (thumbnailFile) {
      try {
        currentThumbnail = await uploadToCloudinary(thumbnailFile);
      } catch (err: any) {
        toast.error(err.message);
        setLoading(false);
        return;
      }
    } else if (!thumbnailUrl && !editId) {
      toast.error("Please upload a thumbnail image.");
      setLoading(false);
      return;
    }

    const payload = {
      title,
      description,
      tournamentId: selectedTournament || null,
      categoryId: selectedCategory || null,
      thumbnail: currentThumbnail,
    };

    try {
      if (editId) {
        await axios.put(`https://api.footimes.com/api/news/${editId}`, payload);
        toast.success("News updated successfully");
      } else {
        await axios.post("https://api.footimes.com/api/news", payload);
        toast.success("News posted successfully");
      }
      resetForm();
      fetchNews();
    } catch (error) {
      toast.error("Submission failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: NewsItem) => {
    setEditId(item._id);
    setTitle(item.title);
    setDescription(item.description);
    setSelectedTournament(item.tournament?._id || "");
    setSelectedCategory(item.category?._id || "");
    setThumbnailUrl(item.thumbnail || null);
    setThumbnailFile(null);
    setFileError("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this news item?")) {
      try {
        await axios.delete(`https://api.footimes.com/api/news/${id}`);
        toast.success("News deleted");
        fetchNews();
      } catch (error) {
        toast.error("Delete failed!");
      }
    }
  };

  const resetForm = () => {
    setEditId(null);
    setTitle("");
    setDescription("");
    setSelectedTournament("");
    setSelectedCategory("");
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
              <label htmlFor="thumbnail-upload" className={`text-[10px] font-bold uppercase ${themeLabel} tracking-widest ml-1`}>Thumbnail Image</label>
              <div className={`relative aspect-square border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/[0.02]'} rounded-2xl overflow-hidden group hover:border-inherit transition-all shadow-inner`}>
                <input
                  id="thumbnail-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  aria-label="Upload thumbnail image"
                  title="Upload thumbnail image"
                />
                {previewUrl || thumbnailUrl ? (
                  <div className="relative w-full h-full">
                    <Image src={previewUrl || thumbnailUrl!} alt="Preview" fill className="object-cover" />
                    <div className={`absolute inset-0 ${isDark ? 'bg-black/60' : 'bg-white/40'} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]`}>
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
                <label htmlFor="article-title" className={`text-[10px] font-bold uppercase ${themeLabel} tracking-widest ml-1`}>Article Title</label>
                <input
                  id="article-title"
                  type="text"
                  placeholder="Enter news title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${themeInput} focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all font-bold text-sm shadow-sm`}
                  required
                  title="Enter the title of the news article"
                  aria-label="Article Title"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="article-content" className={`text-[10px] font-bold uppercase ${themeLabel} tracking-widest ml-1`}>Content</label>
                <textarea
                  id="article-content"
                  placeholder="Enter detailed description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${themeInput} focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all min-h-[150px] resize-none text-sm leading-relaxed shadow-sm`}
                  required
                  title="Enter the main content of the news article"
                  aria-label="Article Content"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="tournament-select" className={`text-[10px] font-bold uppercase ${themeLabel} tracking-widest ml-1`}>Tournament (Optional)</label>
                  <select
                    id="tournament-select"
                    value={selectedTournament}
                    onChange={(e) => setSelectedTournament(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${themeInput} focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all text-sm font-bold shadow-sm`}
                    title="Select a tournament to link this article to"
                    aria-label="Select Tournament"
                  >
                    <option value="">No Tournament</option>
                    {tournaments.map((t) => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="category-select" className={`text-[10px] font-bold uppercase ${themeLabel} tracking-widest ml-1`}>Category (Optional)</label>
                    <button 
                      type="button" 
                      onClick={() => setShowAddCategory(!showAddCategory)}
                      className="text-pink-500 hover:text-pink-400 transition-colors"
                      title={showAddCategory ? "Close" : "Add New Category"}
                      aria-label={showAddCategory ? "Close" : "Add New Category"}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  {showAddCategory ? (
                    <div className="flex gap-2 animate-in fade-in zoom-in duration-200">
                      <input 
                        id="new-category-name"
                        type="text" 
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="New category..."
                        className={`flex-1 px-3 py-2 rounded-lg border ${themeInput} text-xs outline-none focus:ring-1 focus:ring-pink-500`}
                        title="Enter new category name"
                        aria-label="New Category Name"
                      />
                      <button 
                        type="button"
                        onClick={handleQuickAddCategory}
                        className="bg-pink-600 text-white px-3 py-2 rounded-lg text-[10px] font-bold uppercase"
                        title="Save new category"
                        aria-label="Save New Category"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <select
                      id="category-select"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${themeInput} focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all text-sm font-bold shadow-sm`}
                      title="Select a category for this article"
                      aria-label="Select Category"
                    >
                      <option value="">No Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 ${isDark ? 'bg-white text-black' : 'bg-black text-white'} font-bold text-xs uppercase tracking-widest py-4 rounded-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg`}
                title={editId ? "Update Article" : "Publish Article"}
                aria-label={editId ? "Update Article" : "Publish Article"}
              >
                {loading ? <span className="loading loading-spinner loading-xs"></span> : (editId ? "Update Article" : "Publish Article")}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className={`px-8 py-4 border ${themeInput} font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-sm`}
                  title="Cancel editing"
                  aria-label="Cancel editing"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>

        <div className={`mt-20 pt-10 border-t ${themeCardInner}`}>
          <div className="flex justify-between items-center mb-8">
            <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${themeLabel}`}>Published Content</h3>
            <span className={`text-[10px] ${themeLabel} font-bold`}>{newsList.length} Articles</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newsList.map((item) => (
              <div key={item._id} className={`border ${themeCardInner} p-4 rounded-xl flex gap-4 group hover:border-inherit transition-all bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-sm`}>
                <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 transition-all duration-500 shadow-md">
                  <Image src={item.thumbnail} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-inherit line-clamp-2 mb-1 group-hover:text-pink-500 transition-colors">{item.title}</h4>
                    <p className={`text-[9px] ${themeLabel} font-bold uppercase tracking-wider`}>
                      {item.tournament?.name || item.category?.name || "General"} • {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-4 mt-3">
                    <button 
                      onClick={() => handleEdit(item)} 
                      className="text-[9px] font-black text-inherit uppercase hover:text-pink-500 transition-colors"
                      title="Edit this article"
                      aria-label="Edit this article"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(item._id)} 
                      className="text-[9px] font-black text-red-500 uppercase hover:underline"
                      title="Delete this article"
                      aria-label="Delete this article"
                    >
                      Delete
                    </button>
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
