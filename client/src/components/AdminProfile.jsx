// src/components/AdminProfile.jsx
import React from 'react';

// A simple default avatar if no profile picture is provided
import defaultAvatar from '../assets/default-avatar.png'; // Make sure you have a default-avatar.png in your assets folder

const AdminProfile = ({ admin }) => {
  // Destructure admin properties, providing fallbacks
  const {
    username = 'N/A',
    fullName = 'Administrator',
    profilePicture = '' // Default to empty string if not provided
  } = admin || {}; // Ensure admin is not null or undefined

  // Construct the full URL for the profile picture
  // Assuming your backend serves static files from /uploads or similar
  const profilePicUrl = profilePicture
    ? `https://api.footimes.com/admin${profilePicture}` // Adjust base URL if needed
    : defaultAvatar; // Use local default if no URL from backend

  return (
    <div className="bg-zinc-800 p-4 rounded-lg shadow-md flex items-center space-x-4">
      <div className="flex-shrink-0">
        <img
          className="h-16 w-16 rounded-full object-cover border-2 border-pink-500"
          src={profilePicUrl}
          alt={`${fullName}'s Profile`}
          onError={(e) => {
            // Fallback to default avatar if the provided URL fails to load
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = defaultAvatar;
          }}
        />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white">{fullName}</h3>
        <p className="text-gray-400 text-sm">@{username}</p>
        <span className="text-green-400 text-xs mt-1 block">Online</span> {/* Example status */}
      </div>
    </div>
  );
};

export default AdminProfile;