'use client';

import React, { useEffect, useState } from "react";
import {
  FaFutbol,
  FaCalendarAlt,
  FaTrophy,
  FaNewspaper,
  FaBars,
  FaSignOutAlt,
  FaMoon,
  FaSun
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
import { useAdminTheme } from "@/components/admin/AdminThemeContext";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useAdminTheme();
  const isDarkMode = theme === 'dark';
  
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

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

  const sidebarItems = [
    { key: "matches", icon: FaFutbol, label: "Matches" },
    { key: "fixture", icon: FaCalendarAlt, label: "Fixtures" },
    { key: "tournament", icon: FaTrophy, label: "Tournaments" },
    { key: "news", icon: FaNewspaper, label: "News" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  // Theme-aware classes
  const themeBg = isDarkMode ? "bg-[#0a0a0a]" : "bg-white";
  const themeText = isDarkMode ? "text-white" : "text-black";
  const themeCard = isDarkMode ? "bg-zinc-900/40 border-white/10" : "bg-white border-black/10";
  const themeSidebar = isDarkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-black/5";
  const themeHover = isDarkMode ? "hover:bg-white/5" : "hover:bg-black/5";
  const themeMuted = isDarkMode ? "text-white/40" : "text-black/40";

  return (
    <ProtectedRoute>
      <div className={`flex min-h-screen transition-colors duration-300 ${themeBg} ${themeText} font-sans selection:bg-zinc-500 selection:text-white`}>
        {/* Mobile Sidebar Toggle */}
        <button
          className={`fixed top-4 left-4 z-50 p-2 ${themeCard} rounded-lg shadow-sm md:hidden`}
          onClick={() => setSidebarOpenMobile(!sidebarOpenMobile)}
          aria-label="Toggle Sidebar"
        >
          <FaBars />
        </button>

        {/* Sidebar */}
        <aside
          className={`fixed md:sticky top-0 left-0 h-screen z-40 transition-all duration-300 ${themeSidebar} flex flex-col py-8
          ${sidebarCollapsed ? "w-20" : "w-64"}
          ${sidebarOpenMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        >
          <div className="px-6 mb-10 flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'} rounded flex items-center justify-center font-bold text-xs`}>FT</div>
                <span className="font-bold text-sm tracking-tight uppercase">Admin Panel</span>
              </div>
            )}
            <button
              className={`p-1.5 ${themeHover} rounded ${themeMuted} transition-colors hidden md:block`}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <GoChevronLeft className={`text-lg transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`} />
            </button>
          </div>

          <nav className="flex-1 px-3 space-y-1">
            <button
               onClick={() => { setActiveSection("dashboard"); setSidebarOpenMobile(false); }}
               className={`w-full flex items-center gap-3 p-2.5 rounded-md transition-all text-xs font-medium
                ${activeSection === "dashboard" ? (isDarkMode ? "bg-white text-black" : "bg-black text-white") : `${themeMuted} ${themeHover} hover:text-inherit`}
                ${sidebarCollapsed ? "justify-center" : ""}
              `}
            >
               <FaTrophy className="shrink-0" />
               {!sidebarCollapsed && <span>Overview</span>}
            </button>
            <div className="pt-4 pb-2 px-3">
               {!sidebarCollapsed && <span className={`text-[10px] font-bold ${isDarkMode ? 'text-white/20' : 'text-black/30'} uppercase tracking-widest`}>Management</span>}
               {sidebarCollapsed && <div className={`h-px ${isDarkMode ? 'bg-white/5' : 'bg-black/5'} mx-2`}></div>}
            </div>
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setActiveSection(item.key);
                  setSidebarOpenMobile(false);
                }}
                className={`w-full flex items-center gap-3 p-2.5 rounded-md transition-all text-xs font-medium group relative
                  ${activeSection === item.key ? (isDarkMode ? "bg-white text-black" : "bg-black text-white") : `${themeMuted} ${themeHover} hover:text-inherit`}
                  ${sidebarCollapsed ? "justify-center" : ""}
                `}
              >
                <item.icon className="shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
                
                {sidebarCollapsed && (
                  <div className={`absolute left-full ml-4 px-2 py-1 ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'} text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 whitespace-nowrap`}>
                    {item.label}
                  </div>
                )}
              </button>
            ))}
          </nav>

          <div className="px-3 mt-auto pt-4 border-t border-black/5">
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center gap-3 p-2.5 rounded-md ${themeMuted} ${themeHover} transition-all text-xs font-medium
                ${sidebarCollapsed ? "justify-center" : ""}
              `}
            >
              {isDarkMode ? <FaSun className="shrink-0 text-white" /> : <FaMoon className="shrink-0" />}
              {!sidebarCollapsed && <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>}
            </button>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 p-2.5 rounded-md text-red-500 hover:bg-red-500/10 transition-all text-xs font-medium
                ${sidebarCollapsed ? "justify-center" : ""}
              `}
            >
              <FaSignOutAlt className="shrink-0" />
              {!sidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 pt-20 md:pt-10 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {activeSection === "dashboard" ? (
              <div className="animate-in fade-in duration-500">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">Dashboard</h1>
                    <p className={`${themeMuted} text-sm`}>Welcome back. Manage your content below.</p>
                  </div>
                  <div className={`flex items-center gap-2 text-[10px] font-bold ${themeMuted} uppercase tracking-widest ${isDarkMode ? 'bg-white/5' : 'bg-black/5'} px-3 py-1.5 rounded-full`}>
                    Last sync: {new Date().toLocaleTimeString()}
                  </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setActiveSection(item.key)}
                      className={`text-left group ${themeCard} border p-6 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5' : 'hover:border-black'}`}
                    >
                      <div className={`w-10 h-10 ${isDarkMode ? 'bg-white/10' : 'bg-black/5'} rounded-lg flex items-center justify-center mb-4 text-inherit group-hover:bg-inherit group-hover:text-inherit transition-all`}>
                        <item.icon />
                      </div>
                      <h2 className="font-bold text-sm mb-1">{item.label}</h2>
                      <p className={`${themeMuted} text-[11px] leading-tight`}>Click to manage and update site {item.label.toLowerCase()}.</p>
                    </button>
                  ))}
                </div>

                <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
                   <div className={`lg:col-span-2 ${themeCard} border rounded-xl p-6`}>
                      <h3 className="font-bold text-sm mb-4">Quick Statistics</h3>
                      <div className="grid grid-cols-3 gap-4">
                         {[
                           { label: "Total Matches", value: "42" },
                           { label: "Active News", value: "12" },
                           { label: "Tournaments", value: "5" }
                         ].map(stat => (
                           <div key={stat.label} className={`border-r ${isDarkMode ? 'border-white/5' : 'border-black/5'} last:border-none`}>
                              <p className={`text-[10px] font-bold ${isDarkMode ? 'text-white/20' : 'text-black/30'} uppercase mb-1`}>{stat.label}</p>
                              <p className="text-2xl font-bold">{stat.value}</p>
                           </div>
                         ))}
                      </div>
                   </div>
                   <div className={`${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'} rounded-xl p-6 flex flex-col justify-between`}>
                      <div>
                         <h3 className={`font-bold text-sm mb-2 ${isDarkMode ? 'text-black/60' : 'text-white/60'}`}>System Status</h3>
                         <p className="text-xs">All systems operational. Socket connection established.</p>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                         <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                         <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-black/60' : 'text-white/60'}`}>Live Server Connected</span>
                      </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                 <div className="mb-8 flex items-center justify-between">
                    <button 
                      onClick={() => setActiveSection("dashboard")}
                      className={`flex items-center gap-2 ${themeMuted} hover:text-inherit transition-colors font-bold text-xs uppercase tracking-widest`}
                    >
                      <GoChevronLeft /> Overview
                    </button>
                    <div className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/10' : 'text-black/20'}`}>/ {activeSection}</div>
                 </div>
                 <div className={`${themeCard} border rounded-2xl overflow-hidden shadow-sm`}>
                    {activeSection === "matches" && <AdminMatchesPage />}
                    {activeSection === "fixture" && <AdminAddFixture />}
                    {activeSection === "tournament" && <AdminTournamentPage />}
                    {activeSection === "news" && <AdminNewsForm />}
                 </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
