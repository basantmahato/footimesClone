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
import { Link } from "react-router-dom";
import AdminMatchesPage from "./AdminMatchesPage";
import AdminAddFixture from "./AdminAddFixture";
import AdminTournamentPage from "./AdminTournamentPage";
import AdminNewsForm from "./AdminNewsForm";

export default function AdminDashboard() {
  // State for admin profile
  const [adminName, setAdminName] = useState("Admin");
  const [adminEmail] = useState("admin@email.com");
  const [adminPhoto, setAdminPhoto] = useState(
    "https://cdn3.iconfinder.com/data/icons/essential-rounded/64/Rounded-31-512.png"
  );
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editName, setEditName] = useState(adminName);
  const [editPhoto, setEditPhoto] = useState(adminPhoto);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    window.innerWidth < 768
  );
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [time, setTime] = useState(new Date());

  // Responsive sidebar: collapse by default on mobile
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
        setSidebarOpenMobile(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Simulate image upload (just use local preview)
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    setAdminName(editName);
    setAdminPhoto(editPhoto);
    setShowProfileModal(false);
  };

  // Sidebar items config
  const sidebarItems = [
    { key: "matches", icon: FaFutbol, label: "Matches" },
    { key: "fixture", icon: FaCalendarAlt, label: "Fixture" },
    { key: "tournament", icon: FaTrophy, label: "Tournaments" },
    { key: "news", icon: FaNewspaper, label: "News" },
  ];

  useEffect(() => {
    // Initial greeting
    const hour = new Date().getHours();
    setGreeting(getGreeting(hour));

    // Optional: update greeting every minute
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now);
      setGreeting(getGreeting(now.getHours()));
    }, 60000); // 1 minute

    return () => clearInterval(interval); // Cleanup
  }, []);

  function getGreeting(hour) {
    if (hour < 12) return "Good Morning Admin 🌅";
    if (hour < 17) return "Good Afternoon Admin ☀️";
    if (hour < 20) return "Good Evening Admin 🌇";
    return "Good Night Admin 🌙";
  }

  return (
    <div className="flex min-h-screen bg-black mb-13">
      {/* Mobile Sidebar Toggle */}
      <button
        className="fixed top-3 left-3 z-50 bg-black text-white p-2 mt-8 rounded-full shadow-lg focus:outline-none md:hidden"
        onClick={() => setSidebarOpenMobile((prev) => !prev)}
        aria-label={sidebarOpenMobile ? "Hide sidebar" : "Show sidebar"}
      >
        <FaBars />
      </button>
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-fit md:h-full z-40 transition-all duration-300 bg-black text-white flex flex-col justify-between py-8 px-2 md:px-6 md:rounded-r-3xl shadow-lg border-r-1 border-pink-500
        ${sidebarCollapsed ? "w-16" : "w-64 md:w-72"}
        ${sidebarOpenMobile ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
       `}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Toggle button (desktop only) */}
        <div className="flex items-center justify-between mb-8 md:block">
          <button
            className="text-pink-500 text-sm p-2 hover:bg-gray-900 cursor-pointer rounded hidden transition-all md:inline-flex"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
           <GoChevronLeft />
          </button>
        </div>
        <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
          {/* Admin Profile (hide when collapsed) */}
          {!sidebarCollapsed && (
            <div className="flex flex-col items-center mb-6">
              <img
                src={adminPhoto}
                alt="Admin"
                className="w-16 h-16 md:w-20 md:h-20 rounded-full border-1 border-pink-500 mb-2 md:mb-3 object-cover"
              />
              <h3 className="text-base md:text-lg ">{adminName}</h3>
              <p className="text-xs md:text-sm text-gray-300">{adminEmail}</p>
              <button
                className="mt-2 md:mt-3 px-3 md:px-4 py-1 bg-pink-600 text-white rounded hover:bg-pink-700 transition text-xs md:text-sm font-medium"
                onClick={() => {
                  setEditName(adminName);
                  setEditPhoto(adminPhoto);
                  setShowProfileModal(true);
                }}
              >
                Edit Profile
              </button>
            </div>
          )}
          {/* Navigation */}
          <nav className="flex flex-col gap-2 mt-2 ">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.key;
              return (
                <div key={item.key} className="relative group text-[15px]">
                  <button
                    className={`w-full flex items-center gap-3 bg-black text-white py-2 px-2 hover:bg-gray-900 md:px-4 rounded-lg transition font-medium ${
                      isActive && !sidebarCollapsed ? "bg-pink-600" : ""
                    } ${sidebarCollapsed ? "justify-center" : ""}`}
                    onClick={() => {
                      setActiveSection(item.key);
                      setSidebarOpenMobile(false);
                    }}
                    aria-label={item.label}
                  >
                    <Icon
                      className={`${
                        sidebarCollapsed
                          ? "text-[18px] text-pink-500"
                          : "text-[18px] text-pink-500"
                      } transition-all duration-200`}
                    />
                    {!sidebarCollapsed && item.label}
                  </button>
                  {/* Tooltip on hover when collapsed */}
                  {sidebarCollapsed && (
                    <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-pink-500 z-50 transition-opacity duration-200">
                      {item.label}
                    </span>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
        {/* Logout Button (fixed at bottom) */}
        <button
          onClick={() => {
            localStorage.removeItem("adminToken");
            window.location.href = "/admin/login";
          }}
          className={`w-full mt-5 bg-pink-600 text-white py-2 ${
            sidebarCollapsed ? "px-0 justify-center" : "px-4 justify-center"
          } rounded-lg hover:bg-red-500 transition mb-2 flex items-center gap-2 text-base md:text-[15px]`}
        >
          <FaSignOutAlt className="text-lg" />
          {!sidebarCollapsed && <span className="block">Logout</span>}
        </button>
      </aside>
      {/* Overlay for mobile sidebar */}
      {sidebarOpenMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setSidebarOpenMobile(false)}
        ></div>
      )}
      {/* Main Content */}
      <main
        className={`flex-1 p-3 md:p-10 transition-all ml-1 duration-300 ${
          sidebarCollapsed ? "md:ml-16" : "md:ml-72"
        }`}
        style={{
          marginLeft:
            sidebarCollapsed && window.innerWidth >= 768
              ? "4rem"
              : window.innerWidth >= 768
              ? "1rem"
              : "0",
          width: "100%",
        }}
      >
        {activeSection === "matches" ? (
          <AdminMatchesPage />
        ) : activeSection === "fixture" ? (
          <AdminAddFixture />
        ) : activeSection === "tournament" ? (
          <AdminTournamentPage />
        ) : activeSection === "news" ? (
          <AdminNewsForm />
        ) : (
          <>
            <div className="text-white text-center md:text-start text-lg mt-5 md:mt-4">
              {greeting}, Welcome back!
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10 md:gap-6">
              <div className="bg-white rounded-lg shadow-md hover:shadow-xl p-3 md:p-4 flex flex-col items-center">
                <h2 className="text-sm mb-2 text-black">Matches</h2>
                <button
                  className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition text-sm md:text-base"
                  onClick={() => setActiveSection("matches")}
                >
                  Manage
                </button>
              </div>
              <div className="bg-white rounded-lg shadow-md hover:shadow-xl p-3 md:p-4 flex flex-col items-center">
                <h2 className="text-sm mb-2 text-black">Fixture</h2>
                <button
                  className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition text-sm md:text-base"
                  onClick={() => setActiveSection("fixture")}
                >
                  Manage
                </button>
              </div>
              <div className="bg-white rounded-lg shadow-md hover:shadow-xl p-3 md:p-4 flex flex-col items-center">
                <h2 className="text-sm mb-2 text-black">Tournaments</h2>
                <button
                  className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition text-sm md:text-base"
                  onClick={() => setActiveSection("tournament")}
                >
                  Manage
                </button>
              </div>
              <div className="bg-white rounded-lg shadow-md hover:shadow-xl p-3 md:p-4 flex flex-col items-center">
                <h2 className="text-sm mb-2 text-black">News</h2>
                <button
                  className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition text-sm md:text-base"
                  onClick={() => setActiveSection("news")}
                >
                  Manage
                </button>
              </div>
            </div>
            <div className="max-w-28 aign-center mt-10 mx-auto">
              <button
                onClick={() => {
                  localStorage.removeItem("adminToken");
                  window.location.href = "/admin/login";
                }}
                className={`w-full mt-5 bg-pink-600 text-white py-2 ${
                  sidebarCollapsed
                    ? "px-0 justify-center"
                    : "px-4 justify-center"
                } rounded-lg hover:bg-red-500 transition mb-2 flex items-center gap-2 text-base md:text-[15px]`}
              >
                <FaSignOutAlt className="text-lg" />
                {!sidebarCollapsed && <span className="block">Logout</span>}
              </button>
            </div>
          </>
        )}
      </main>
      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-sm shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-pink-600 text-2xl font-bold"
              onClick={() => setShowProfileModal(false)}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 text-black">Edit Profile</h2>
            <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
              <div className="flex flex-col items-center bg-black h-50 rounded gap-2">
                <img
                  src={editPhoto}
                  alt="Preview"
                  className="w-20 h-20 rounded-full border-1 border-pink-500 object-cover mt-5"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="mt-1 text-sm border border-pink-500 w-50 p-2 "
                />
              </div>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border rounded bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Name"
                required
              />
              <button
                type="submit"
                className="bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}