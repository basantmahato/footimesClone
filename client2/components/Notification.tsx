import React from 'react';
import Image from 'next/image';

const Notification = () => {
  return (
    <div>
      <div className='flex items-center justify-center mx-auto mt-30'>
        <div className="relative w-48 h-48">
          <Image 
            src="/assets/notification.svg" 
            alt="Notification empty" 
            fill
            className="object-contain"
          />
        </div>
      </div> 
      <p className='text-center text-gray-700 text-[15px]'>Notification empty</p> 
    </div>
  );
};

export default Notification;
