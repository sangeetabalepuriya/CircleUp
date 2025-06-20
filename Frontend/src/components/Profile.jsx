import useGetUserProfile from '@/hooks/useGetUserProfile'
import axios from 'axios';
import { AtSign, Heart, MessageCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { followUser, unfollowUser } from '@/redux/authSlice';
import CommentDialog from './CommentDialog';
import { setSelectedPost } from '@/redux/postSlice'

export default function Profile() {

    const params = useParams();
    const userId = params.id;
    useGetUserProfile(userId);
    const [activeTab, setActiveTab] = useState("posts");
    const { selectedPost } = useSelector(store => store.post);
    const [openCommentDialog, setOpenCommentDialog] = useState(false); // State for CommentDialog
    const { userProfile, user } = useSelector(store => store.auth);
    const isLoggedInUserProfile = user?._id == userProfile?._id;
    const [isFollowing, setIsFollowing] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        console.log("selectedPost in dialog:", selectedPost);
      }, [selectedPost]);
      

    useEffect(() => {
        if (user && userProfile) {
            const isUserFollowing = userProfile.followers.includes(user._id);
            setIsFollowing(isUserFollowing);
        }
    }, [userProfile, user]);

    function handleTabChange(tab) {
        setActiveTab(tab);
    }

    //follow and unfollow
    async function handleFollowUnfollow() {
        try {
            const res = await axios.post(
                `https://circleup-mqwe.onrender.com/user/followOrUnFollow/${userProfile._id}`,
                {},
                { withCredentials: true }
            );
    
            if (res.data.success) {
                if (isFollowing) {
                    dispatch(unfollowUser(userProfile._id)); 
                    toast.success("Unfollowed successfully");
                } else {
                    dispatch(followUser(userProfile._id)); 
                    toast.success("Followed successfully");
                }
    
                setIsFollowing(prev => !prev);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        }
    }


    // Function to open CommentDialog
    async function openCommentDialogHandler(post) {
        try {
          const res = await axios.get(`https://circleup-mqwe.onrender.com/post/${post._id}`, {
            withCredentials: true,
          });
      
          if (res.data.success) {
            dispatch(setSelectedPost(res.data.post));
            setOpenCommentDialog(true);
          }
        } catch (err) {
          console.error("Failed to fetch full post:", err);
        }
      }
      
    
    const displayedPost = activeTab == "posts" ? userProfile?.posts : userProfile?.bookmark

    return (
        <div className='bg-neutral-900 min-h-screen text-white ml-64'>
            <div className='flex max-w-full justify-center mx-auto px-4 py-8'>
                <div className='flex flex-col gap-12 w-full'>
                    {/* Profile Header */}
                    <div className='bg-neutral-800 p-8 rounded-2xl shadow-md border border-neutral-700'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                            {/* Profile Picture Section */}
                            <section className='flex items-center justify-center'>
                                <div className="w-40 h-40 rounded-full overflow-hidden  shadow-lg">
                                    <img
                                        className="w-full h-full object-cover"
                                        src={userProfile?.profilePicture}
                                        alt="profile_photo"
                                    />
                                </div>
                            </section>

                            {/* Profile Info Section */}
                            <section className='flex flex-col justify-center'>
                                <div className='flex flex-col gap-6'>
                                    {/* Username and Action Buttons */}
                                    <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
                                        <h1 className='text-2xl font-bold text-white'>{userProfile?.username}</h1>
                                        <div className='flex flex-wrap gap-2'>
                                            {
                                                isLoggedInUserProfile ? (
                                                    <>
                                                        <Link to="/account/edit">
                                                            <button className="bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 shadow">
                                                                Edit Profile
                                                            </button>
                                                        </Link>
                                                    </>
                                                ) : (
                                                    isFollowing ? (
                                                        <>
                                                            <button 
                                                                onClick={handleFollowUnfollow} 
                                                                className="bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 shadow border border-neutral-600"
                                                            >
                                                                Unfollow
                                                            </button>
                                                            <button 
                                                            className="bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 shadow border border-neutral-600">
                                                                Message
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button 
                                                            onClick={handleFollowUnfollow} 
                                                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 shadow"
                                                        >
                                                            Follow
                                                        </button>
                                                    )
                                                )
                                            }
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className='flex items-center gap-8'>
                                        <div className='text-center'>
                                            <p className='text-xl font-bold text-white'>{userProfile?.posts.length}</p>
                                            <p className='text-neutral-400 text-sm'>posts</p>
                                        </div>
                                        <div className='text-center'>
                                            <p className='text-xl font-bold text-white'>{userProfile?.followers.length}</p>
                                            <p className='text-neutral-400 text-sm'>followers</p>
                                        </div>
                                        <div className='text-center'>
                                            <p className='text-xl font-bold text-white'>{userProfile?.following.length}</p>
                                            <p className='text-neutral-400 text-sm'>following</p>
                                        </div>
                                    </div>

                                    {/* Bio Section */}
                                    <div className='flex flex-col gap-3'>
                                        <p className='text-white font-medium'>{userProfile?.bio || 'No bio available...'}</p>
                                        <div className="flex items-center gap-2 bg-neutral-700 w-fit px-3 py-1 rounded-xl border border-neutral-600">
                                            <AtSign size={16} className="text-blue-400" />
                                            <span className='text-neutral-300 text-sm'>{userProfile?.username}</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Posts/Saved Tabs */}
                    <div className='bg-neutral-800 rounded-2xl shadow-md border border-neutral-700 overflow-hidden'>
                        {/* Tab Navigation */}
                        <div className='border-b border-neutral-700'>
                            <div className='flex items-center justify-center'>
                                <button 
                                    className={`py-4 px-8 text-sm font-medium transition-all duration-200 border-b-2 ${
                                        activeTab == "posts" 
                                            ? "text-blue-400 border-blue-400" 
                                            : "text-neutral-400 border-transparent hover:text-white"
                                    }`} 
                                    onClick={() => handleTabChange("posts")}
                                >
                                    POSTS
                                </button>
                                <button 
                                    className={`py-4 px-8 text-sm font-medium transition-all duration-200 border-b-2 ${
                                        activeTab == "saved" 
                                            ? "text-blue-400 border-blue-400" 
                                            : "text-neutral-400 border-transparent hover:text-white"
                                    }`} 
                                    onClick={() => handleTabChange("saved")}
                                >
                                    SAVED
                                </button>
                            </div>
                        </div>

                        {/* Posts Grid */}
                        <div className='p-6'>
                            {displayedPost && displayedPost.length > 0 ? (
                                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                                    {
                                        displayedPost?.map((post) => {
                                            return (
                                                <div key={post?._id} 
                                                onClick={() => openCommentDialogHandler(post)}
                                                className="relative w-full aspect-square overflow-hidden group rounded-xl bg-neutral-700">
                                                    <img
                                                        src={post.image}
                                                        alt="postimage"
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />

                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
                                                        <div className="flex items-center text-white space-x-6">
                                                            <div className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                                                                <Heart size={20} />
                                                                <span className="font-medium">{post?.likes.length}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                                                                <MessageCircle size={20} />
                                                                <span className="font-medium">{post?.comments.length}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-neutral-400 text-lg">No {activeTab} yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {selectedPost && (
         <CommentDialog open={openCommentDialog} setOpen={setOpenCommentDialog} />
          )}
        </div>
    )
}








