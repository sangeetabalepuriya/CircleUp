import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { followUser , unfollowUser  } from '@/redux/authSlice';

export default function SuggestedUsers() {
    const { suggestedUsers, user } = useSelector(store => store.auth);
    const dispatch = useDispatch();

    const notFollowedUsers = suggestedUsers.filter(
        (u) => !user.following.includes(u._id) && u._id !== user._id
    );

    async function handleFollowToggle(targetUserId) {
        try {
            const res = await axios.post(
                `http://localhost:5500/user/followOrUnFollow/${targetUserId}`,
                {},
                { withCredentials: true }
            );

            if (res.data.success) {
                if (res.data.type === "followed") {
                    dispatch(followUser (targetUserId));
                    toast.success("User  followed successfully");
                } else {
                    dispatch(unfollowUser (targetUserId));
                    toast.success("User  unfollowed successfully");
                }
            }
        } catch (error) {
            console.error("Follow/Unfollow error:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Follow/Unfollow failed");
        }
    }

    return (
        <div className='my-10'>
            <div className='flex items-center justify-between text-sm'>
                <h1 className='font-semibold text-gray-300'>Suggested for you</h1>
                <span className='font-medium cursor-pointer text-blue-500 hover:text-blue-400'>See All</span>
            </div>

            {notFollowedUsers.map((suggestedUser ) => (
                <div key={suggestedUser ._id} className='flex items-center justify-between my-5 p-4 bg-neutral-800 rounded-lg shadow-md border border-neutral-700'>
                    <div className="flex items-center gap-3">
                        <Link to={`/profile/${suggestedUser ._id}`}>
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                                <img
                                    className="w-full h-full object-cover"
                                    src={suggestedUser .profilePicture}
                                    alt="user_profile"
                                />
                            </div>
                        </Link>

                        <div className='flex flex-col items-start'>
                            <p className="text-sm text-white">
                                <Link to={`/profile/${suggestedUser ._id}`} className="hover:text-blue-400 transition-colors">
                                    {suggestedUser .username}
                                </Link>
                            </p>
                            <span className="text-sm text-gray-400">
                                {suggestedUser .bio || "Bio here..."}
                            </span>
                        </div>
                    </div>

                    <span
                        onClick={() => handleFollowToggle(suggestedUser ._id)}
                        className='text-blue-500 ml-2 text-xs font-bold cursor-pointer hover:text-blue-400'
                    >
                        Follow
                    </span>
                </div>
            ))}

            {notFollowedUsers.length === 0 && (
                <p className="text-xs text-gray-500 mt-4">You're following everyone 🎉</p>
            )}
        </div>
    );
}





