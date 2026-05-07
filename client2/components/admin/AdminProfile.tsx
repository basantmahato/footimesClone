import React from 'react';
import Image from 'next/image';

interface AdminProfileProps {
  admin: {
    username?: string;
    fullName?: string;
    profilePicture?: string;
  };
}

const AdminProfile: React.FC<AdminProfileProps> = ({ admin }) => {
  const {
    username = 'N/A',
    fullName = 'Administrator',
    profilePicture = ''
  } = admin || {};

  const profilePicUrl = profilePicture
    ? `https://api.footimes.com/admin${profilePicture}`
    : "/assets/default-avatar.png";

  return (
    <div className="bg-zinc-900 border border-white/5 p-6 rounded-3xl shadow-xl flex items-center space-x-6 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="relative h-20 w-20 shrink-0">
        <div className="absolute -inset-1 bg-gradient-to-tr from-pink-600 to-purple-600 rounded-full blur opacity-25"></div>
        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-pink-500">
            <Image
                src={profilePicUrl}
                alt={`${fullName}'s Profile`}
                fill
                className="object-cover"
                onError={(e: any) => {
                    e.target.src = "/assets/default-avatar.png";
                }}
            />
        </div>
      </div>
      <div>
        <h3 className="text-xl font-black text-white tracking-tighter">{fullName}</h3>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">@{username}</p>
        <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-green-500 text-[10px] font-black uppercase tracking-widest">Online</span>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
