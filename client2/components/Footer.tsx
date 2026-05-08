'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const legalLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Disclaimer', href: '/disclaimer' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 pt-12 pb-24 px-6 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Logo and Tagline */}
        <div className="flex flex-col items-center md:items-start space-y-4">
          <div className="flex items-center space-x-1">
            <div className="relative w-[120px] h-[25px]">
              <Image 
                src="/assets/logo.png" 
                alt="Footimes Logo" 
                fill 
                className="object-contain"
              />
            </div>
            <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
          </div>
          <p className="text-gray-500 text-sm max-w-xs text-center md:text-left">
            Your premium destination for live scores, tournament updates, and the latest football news.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          {legalLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className="text-gray-400 hover:text-pink-500 text-sm font-medium transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Social Icons */}
        <div className="flex items-center space-x-6">
          <a 
            href="https://www.youtube.com/@Footimes" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Visit Footimes on YouTube"
          >
            <FaYoutube size={20} />
          </a>
          <a 
            href="https://www.instagram.com/footimes.official/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Follow Footimes on Instagram"
          >
            <FaInstagram size={20} />
          </a>
          <a 
            href="#" 
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Follow Footimes on Twitter"
          >
            <FaTwitter size={20} />
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center">
        <p className="text-gray-600 text-xs">
          © {currentYear} Footimes. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
