'use client';

import React, { useState, useEffect } from "react";
import { Bell, UserCircle } from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("adminToken");
    if (user) {
      setIsLoggedIn(true);
    }

    const checkNotifications = async () => {
      try {
        const res = await axios.get("https://api.footimes.com/api/notifications/active");
        if (res.data && res.data.length > 0) {
          setHasNotifications(true);
        }
      } catch (err) {
        console.error("Failed to check notifications", err);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleAvatarClick = () => {
    router.push("/admin/dashboard");
  };

  return (
    <div className="bg-black text-white px-4 h-14 flex items-center justify-between sticky top-0 z-50 w-full border-b border-white/5">
      {/* Logo + Red Dot */}
      <div className="flex items-center space-x-1">
        <Link href="/" className="font-semibold text-lg flex items-center">
          <div className="relative w-[120px] h-[20px]">
            <Image 
              src="/assets/logo.png" 
              alt="logo image" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>
        <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
      </div>

      {/* Icons */}
      <div className="flex items-center space-x-4">
        <a target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/@Footimes" aria-label="Visit Footimes on YouTube">
          <FaYoutube className="w-[22px] h-[22px] cursor-pointer animate-pulse" />
        </a>
        <a target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/footimes.official/" aria-label="Visit Footimes on Instagram">
          <FaInstagram className="w-5 h-5 cursor-pointer animate-pulse" />{" "}
        </a>
        <Link href="/notification" aria-label="View notifications" className="relative group">
          <Bell className={`w-5 h-5 transition-colors ${hasNotifications ? 'text-pink-500' : 'text-white group-hover:text-pink-400'}`} />
          {hasNotifications && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-pink-500 rounded-full border border-black animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.5)]"></span>
          )}
        </Link>

        {isLoggedIn && (
          <UserCircle
            className="w-6 h-6 cursor-pointer hover:text-gray-300"
            onClick={handleAvatarClick}
            aria-label="Admin Dashboard"
            role="button"
          />
        )}
      </div>
    </div>
  );
}
