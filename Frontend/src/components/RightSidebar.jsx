import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import SuggestedUsers from './SuggestedUsers';

export default function RightSidebar() {
  const { user } = useSelector(store => store.auth);

  return (
    <div className='w-fit my-10 pr-32 ml-12'>
      <div className="flex items-center gap-3 bg-neutral-800 p-4 rounded-2xl shadow-md border border-neutral-700">
        <Link to={`/profile/${user?._id}`}>
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src={user?.profilePicture}
              alt="user_profile"
            />
          </div>
        </Link>

        <div className='flex flex-col'>
          <p className="text-sm font-semibold text-white">
            <Link to={`/profile/${user?._id}`} className="hover:text-blue-400 transition-colors">{user?.username}</Link>
          </p>
          <span className='text-xs text-gray-400'>{user?.bio || "Bio here..."}</span>
        </div>
      </div>
      <div className="mt-4 max-h-[320px] overflow-y-auto suggested-users-scroll pr-2">
        <SuggestedUsers />
      </div>
    </div>
  )
}




