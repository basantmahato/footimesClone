import React from 'react'
import NotificationImg from '../assets/notification.svg'

const Notification = () => {
  return (
    <div>
     <div className='flex items-center justify-center mx-auto mt-30'>
        <img className='w-48 h-48' src={NotificationImg} alt="" />
      
     </div> 
     <p className='text-center text-gray-700 text-[15px]'>Notification empty</p> 
    </div>
  )
}

export default Notification