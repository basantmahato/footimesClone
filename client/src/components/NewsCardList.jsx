import React from "react";

const NewsCardList = ({ image, tittle, hour, tournament }) => {
  return (
    <>
      <div className="p-1 mb-2 px-8">
        <div className="bg-[#1e1e1e] rounded-md py-3 flex gap-3 text-white">
          <img
            src={image}
            alt={tittle}
            className="w-16 h-16 object-cover rounded-md"
          />
          <div className="flex-1">
            <h3 className="font-bold text-[13px] mb-1">{tittle}</h3>
            <p className="text-[13px] text-gray-400">
              Latest • {tournament || "General"}
            </p>
            <p className="text-[10px] text-gray-500">{hour}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsCardList;