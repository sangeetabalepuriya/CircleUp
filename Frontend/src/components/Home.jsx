import React from 'react'
import Feed from './Feed'
import RightSidebar from './RightSidebar'
import useGetAllPost from '@/hooks/useGetAllPost';
import useGetSuggestedUsers from '@/hooks/useGetSuggestedUsers';

export default function Home() {
  useGetAllPost();
  useGetSuggestedUsers();
  return (
    <div className="flex justify-center pl-64"> {/* Add padding-left here */}
      <div className="flex w-full max-w-6xl">
        <div className="flex-grow max-w-2xl mx-auto">
          <Feed />
        </div>
        <div className="hidden lg:block">
          <RightSidebar />
        </div>
      </div>
    </div>
  )
}
