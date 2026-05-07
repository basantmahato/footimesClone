'use client';

import React, { useEffect, useState } from "react";
import {
  FaFutbol,
  FaCalendarAlt,
  FaTrophy,
  FaNewspaper,
  FaBars,
  FaSignOutAlt,
} from "react-icons/fa";
import { GoChevronLeft } from "react-icons/go";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Components
import AdminMatchesPage from "@/components/admin/AdminMatchesPage";
import AdminAddFixture from "@/components/admin/AdminAddFixture";
import AdminTournamentPage from "@/components/admin/AdminTournamentPage";
import AdminNewsForm from "@/components/admin/AdminNewsForm";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminDashboardPage() {
  const router = useRouter();
  
  const [adminName, setAdminName] = useState("Admin");
  const [adminEmail] = useState("admin@email.com");
  const [adminPhoto, setAdminPhoto] = useState(
    "https://cdn3.iconfinder.com/data/icons/essential-rounded/64/Rounded-31-512.png"
  );
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editName, setEditName] = useState(adminName);
  const [editPhoto, setEditPhoto] = useState(adminPhoto);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
        setSidebarOpenMobile(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(getGreeting(hour));
  }, []);

  function getGreeting(hour: number) {
    if (hour < 12) return "Good Morning 🌅";
    if (hour < 17) return "Good Afternoon ☀️";
    if (hour < 20) return "Good Evening 🌇";
    return "Good Night 🌙";
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminName(editName);
    setAdminPhoto(editPhoto);
    setShowProfileModal(false);
  };

  const sidebarItems = [
    { key: "matches", icon: FaFutbol, label: "Matches" },
    { key: "fixture", icon: FaCalendarAlt, label: "Fixture" },
    { key: "tournament", icon: FaTrophy, label: "Tournaments" },
    { key: "news", icon: FaNewspaper, label: "News" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-black text-white relative">
        {/* Mobile Sidebar Toggle */}
        <button
          className="fixed top-6 left-6 z-50 p-3 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl md:hidden text-pink-500"
          onClick={() => setSidebarOpenMobile(!sidebarOpenMobile)}
          aria-label="Toggle Sidebar"
        >
          <FaBars />
        </button>

        {/* Sidebar */}
        <aside
          className={`fixed md:sticky top-0 left-0 h-screen z-40 transition-all duration-500 bg-zinc-950 border-r border-white/5 flex flex-col py-10
          ${sidebarCollapsed ? "w-24" : "w-72"}
          ${sidebarOpenMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          shadow-[20px_0_50px_rgba(0,0,0,0.5)]
        `}
        >
          <div className="px-6 mb-12 flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-600 rounded-xl flex items-center justify-center font-black text-xl italic tracking-tighter">FT</div>
                <span className="font-black text-xl tracking-tighter">FOOTIMES</span>
              </div>
            )}
            <button
              className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 transition-colors hidden md:block"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <GoChevronLeft className={`text-xl transition-transform duration-500 ${sidebarCollapsed ? "rotate-180" : ""}`} />
            </button>
          </div>

          {!sidebarCollapsed && (
            <div className="px-8 mb-12 animate-in fade-in duration-700">
              <div className="relative w-20 h-20 mx-auto mb-4 group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-pink-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-zinc-800">
                  <Image src={adminPhoto} alt="Admin" fill className="object-cover" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg">{adminName}</h3>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-4">{adminEmail}</p>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="px-4 py-1.5 bg-zinc-900 border border-white/5 rounded-xl text-[10px] font-black uppercase hover:bg-zinc-800 transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}

          <nav className="flex-1 px-4 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setActiveSection(item.key);
                  setSidebarOpenMobile(false);
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group relative
                  ${activeSection === item.key ? "bg-pink-600 text-white shadow-lg shadow-pink-600/20" : "text-zinc-500 hover:bg-white/5 hover:text-white"}
                  ${sidebarCollapsed ? "justify-center" : ""}
                `}
              >
                <item.icon className="text-xl shrink-0" />
                {!sidebarCollapsed && <span className="font-bold text-sm">{item.label}</span>}
                
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-2 group-hover:translate-x-0 z-50">
                    {item.label}
                  </div>
                )}
              </button>
            ))}
          </nav>

          <div className="px-4 mt-auto">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all
                ${sidebarCollapsed ? "justify-center" : ""}
              `}
            >
              <FaSignOutAlt className="text-xl" />
              {!sidebarCollapsed && <span className="font-bold text-sm">Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 pt-24 md:pt-8 min-w-0">
          <div className="max-w-6xl mx-auto">
            {activeSection === "dashboard" ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                  <div>
                    <h1 className="text-4xl font-black tracking-tighter mb-2">{greeting}, <span className="text-pink-500">{adminName}!</span></h1>
                    <p className="text-zinc-500 font-medium">Welcome to the management portal. What would you like to do today?</p>
                  </div>
                  <div className="p-4 bg-zinc-900 border border-white/5 rounded-3xl flex items-center gap-4">
                     <div className="w-12 h-12 bg-pink-600/10 rounded-2xl flex items-center justify-center text-pink-500 font-black">
                        {new Date().getDate()}
                     </div>
                     <div>
                        <p className="text-xs font-black uppercase text-zinc-500 tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
                        <p className="font-bold">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {sidebarItems.map((item) => (
                    <div key={item.key} className="group bg-zinc-900/50 border border-white/5 p-8 rounded-[2.5rem] hover:bg-zinc-900 transition-all duration-500">
                      <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 text-zinc-400 group-hover:bg-pink-600 group-hover:text-white transition-all duration-500">
                        <item.icon className="text-2xl" />
                      </div>
                      <h2 className="text-xl font-bold mb-2">{item.label}</h2>
                      <p className="text-zinc-500 text-xs font-medium mb-6 leading-relaxed">Manage your site's {item.label.toLowerCase()} content and real-time updates.</p>
                      <button
                        onClick={() => setActiveSection(item.key)}
                        className="w-full py-3 bg-zinc-800 hover:bg-pink-600 text-white text-xs font-black uppercase rounded-2xl transition-all tracking-widest"
                      >
                        Manage
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                 <button 
                  onClick={() => setActiveSection("dashboard")}
                  className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold text-sm"
                 >
                   <GoChevronLeft /> Back to Overview
                 </button>
                 {activeSection === "matches" && <AdminMatchesPage />}
                 {activeSection === "fixture" && <AdminAddFixture />}
                 {activeSection === "tournament" && <AdminTournamentPage />}
                 {activeSection === "news" && <AdminNewsForm />}
              </div>
            )}
          </div>
        </main>

        {/* Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-zinc-900 border border-white/10 rounded-[3rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
              <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">Edit <span className="text-pink-500">Profile</span></h2>
              <form onSubmit={handleProfileSave} className="space-y-6">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-pink-600">
                    <Image src={editPhoto} alt="Preview" fill className="object-cover" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      aria-label="Change profile photo"
                      title="Change profile photo"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Click photo to change</p>
                </div>
                
                <div className="space-y-4">
                   <label className="text-xs font-black uppercase text-zinc-500 tracking-widest">Full Name</label>
                   <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-pink-500 outline-none"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-black uppercase text-xs tracking-widest py-4 rounded-2xl shadow-xl shadow-pink-600/20 transition-all active:scale-[0.98]"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
