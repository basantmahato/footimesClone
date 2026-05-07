'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      router.push("/admin/dashboard");
    }
  }, [router]);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://api.footimes.com/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("adminToken", data.token);
      setLoading(false);
      router.push("/admin/dashboard");
    } catch (err) {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background Image */}
      <Image 
        src="/assets/login.jpg" 
        alt="Background" 
        fill 
        className="object-cover -z-10 brightness-[0.3]"
        priority
      />

      {/* Login Form Container */}
      <div className="w-full flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-white border border-pink-500/30 bg-black/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-300">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
              ADMIN <span className="text-pink-500">LOGIN</span>
            </h1>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Access management portal</p>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 rounded-2xl bg-zinc-900/50 border border-white/5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 pr-12 rounded-2xl bg-zinc-900/50 border border-white/5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold p-4 rounded-2xl shadow-xl shadow-pink-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <span className="loading loading-spinner loading-sm"></span> : "Sign In"}
            </button>
          </div>

          <div className="mt-6 h-6 text-center">
            {error && <p className="text-red-400 text-xs font-bold animate-pulse">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
