'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Newspaper } from 'lucide-react';

const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'Tournament', path: '/tournament', icon: <Trophy size={20} /> },
    { name: 'News', path: '/news', icon: <Newspaper size={20} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t-2 border-pink-500 rounded-t-4xl text-white flex justify-around p-1 z-[99]">
      {navItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={`flex flex-col items-center justify-center py-2 text-[12px] ${
            pathname === item.path ? "text-pink-500" : "text-gray-400"
          }`}
        >
          <span className="bg-black/80 backdrop-blur-sm rounded-full p-2">
            {item.icon}
          </span>
          <span className="mt-1">{item.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default BottomNav;
