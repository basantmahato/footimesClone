import React, { useState, useEffect } from "react";
import { Bell, UserCircle, Instagram, Youtube } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // Adjust the path as necessary

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Simulate checking login status (replace this with your real auth logic)
  useEffect(() => {
    const user = localStorage.getItem("adminToken"); // or check auth context
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleAvatarClick = () => {
    navigate("/admin/dashboard");
  };

  return (
    <div className="bg-black text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 w-full">
      {/* Logo + Red Dot */}
      <div className="flex items-center space-x-1">
        <Link to="/" className="font-semibold text-lg">
          <img className="w-30 h-5 object-cover" src={logo} alt="logo image" />
        </Link>
        <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
      </div>

      {/* Icons */}

      <div className="flex items-center space-x-4">
        <a target="_blank" href="https://www.youtube.com/@Footimes">
          <Youtube className="cursor-pointer animate-pulse" />
        </a>
        <a target="_blank" href="https://www.instagram.com/footimes.official/">
          <Instagram className="cursor-pointer animate-pulse" />{" "}
        </a>
        <Link to="/notification">
          <Bell className="w-5 h-5" />
        </Link>

        {isLoggedIn && (
          <UserCircle
            className="w-6 h-6 cursor-pointer hover:text-gray-300"
            onClick={handleAvatarClick}
          />
        )}
      </div>
    </div>
  );
}
