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
    : "https://cdn3.iconfinder.com/data/icons/essential-rounded/64/Rounded-31-512.png";

  return (
    <div className="bg-white border border-black/10 p-6 rounded-2xl shadow-sm flex items-center space-x-6">
      <div className="relative h-20 w-20 shrink-0">
        <div className="relative w-full h-full rounded-full overflow-hidden border border-black/10">
            <Image
                src={profilePicUrl}
                alt={`${fullName}'s Profile`}
                fill
                className="object-cover"
                onError={(e: any) => {
                    e.target.src = "https://cdn3.iconfinder.com/data/icons/essential-rounded/64/Rounded-31-512.png";
                }}
            />
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold text-black tracking-tight">{fullName}</h3>
        <p className="text-black/40 text-[10px] font-bold uppercase tracking-widest">@{username}</p>
        <div className="flex items-center gap-2 mt-2">
            <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"></span>
            <span className="text-black text-[10px] font-black uppercase tracking-widest">Authorized</span>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
