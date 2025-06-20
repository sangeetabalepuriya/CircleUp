import * as Dialog from '@radix-ui/react-dialog';
import React, { useEffect, useState } from 'react';
import { FaBookmark, FaHeart, FaRegHeart } from "react-icons/fa";
import { FiBookmark } from "react-icons/fi";
import { MessageCircle, Send } from "lucide-react";
import CommentDialog from './CommentDialog';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { setPosts, setSelectedPost } from '@/redux/postSlice';
import { followUser , unfollowUser , updateBookmark } from '@/redux/authSlice';

export default function Post({ post }) {
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.post);
    const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
    const bookmarked = useSelector(store => store.auth.user?.bookmark?.includes(post._id));
    const [postLike, setPostLike] = useState(post.likes.length);
    const [comment, setComment] = useState(post.comments);
    const dispatch = useDispatch();
    const currentUser  = useSelector(store => store.auth.user);
    const isFollowing = currentUser ?.following?.includes(post.author?._id) || false;

    function changeEventHandler(e) {
        const inputText = e.target.value;
        setText(inputText.trim() ? inputText : "");
    }

    // Like or dislike functionality
    async function likeOrDislikeHandler() {
        try {
            const action = liked ? "dislike" : "like";
            const res = await axios.get(`http://localhost:5500/post/${action}/${post?._id}`, { withCredentials: true });
            if (res.data.success) {
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);
                const updatedPostData = posts.map(p =>
                    p._id === post._id ? {
                        ...p,
                        likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                    } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    // Comment functionality
    async function commentHandler() {
        try {
            const res = await axios.post(`http://localhost:5500/post/comment/${post._id}`, { text }, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            });
            if (res.data.success) {
                const updatedCommentData = [...comment, res.data.comment];
                setComment(updatedCommentData);
                const updatedPostData = posts.map(p =>
                    p._id === post._id ? { ...p, comments: updatedCommentData } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            console.log(error);
        }
    }

    // Delete post functionality
    async function deletePostHandler() {
        try {
            const res = await axios.delete(`http://localhost:5500/post/delete/${post?._id}`, { withCredentials: true });
            if (res.data.success) {
                const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    // Bookmark functionality
    async function bookmarkHandler() {
        try {
            const res = await axios.get(`http://localhost:5500/post/bookmark/${post?._id}`, { withCredentials: true });
            if (res.data.success) {
                if (res.data.type === "saved") {
                    dispatch(updateBookmark({ postId: post._id, type: "add" }));
                } else {
                    dispatch(updateBookmark({ postId: post._id, type: "remove" }));
                }
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    // Follow/Unfollow functionality
    async function handleFollowToggle() {
        try {
            const res = await axios.post(
                `http://localhost:5500/user/followOrUnFollow/${post.author._id}`,
                {},
                { withCredentials: true }
            );

            if (res.data.success) {
                if (res.data.type === "followed") {
                    dispatch(followUser (post.author._id));
                    toast.success("User  followed successfully");
                } else {
                    dispatch(unfollowUser (post.author._id));
                    toast.success("User  unfollowed successfully");
                }

                const updatedPostData = posts.map(p =>
                    p._id === post._id ? {
                        ...p,
                        author: {
                            ...p.author,
                            followers: res.data.type === "followed" 
                                ? [...(p.author.followers || []), user._id]
                                : p.author.followers?.filter(id => id !== user._id) || []
                        }
                    } : p
                );
                dispatch(setPosts(updatedPostData));
            }
        } catch (error) {
            console.error("Follow/Unfollow error:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Follow/Unfollow failed");
        }
    }

    return (
        <div className="bg-neutral-800 text-white p-4 m-4 max-w-md w-full mx-auto rounded-2xl shadow-md border border-neutral-700">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img
                            className="w-full h-full object-cover"
                            src={post.author?.profilePicture}
                            alt="user_profile"
                        />
                    </div>
                    <div className='flex items-center gap-3'>
                        <p className="text-sm">{post.author?.username}</p>
                        {user?._id === post.author._id && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">
                                Author
                            </span>
                        )}
                    </div>
                </div>

                <Dialog.Root>
                    <Dialog.Trigger className="text-white text-xl hover:text-gray-300">...</Dialog.Trigger>
                    <Dialog.Portal>
                        <Dialog.Overlay className="bg-black/50 fixed inset-0 z-40" />
                        <Dialog.Content className="bg-neutral-800 rounded-xl shadow-xl p-6 w-[90%] max-w-md mx-auto fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-50">
                            <div className="flex flex-col items-center gap-4">
                                {post?.author?._id !== user?._id && (
                                    isFollowing ? (
                                        <button 
                                            onClick={handleFollowToggle} 
                                            className="bg-neutral-900 border border-neutral-700 text-white rounded-xl outline-none text-sm px-9 py-3  text-left hover:bg-blue-500 rounded"
                                        >
                                            Unfollow
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleFollowToggle} 
                                            className="bg-neutral-900 border border-neutral-700 text-white rounded-xl outline-none text-sm px-11 py-3  text-left hover:bg-blue-500 rounded"
                                        >
                                            Follow
                                        </button>
                                    )
                                )}
                                <button className="bg-neutral-900 border border-neutral-700 text-white rounded-xl outline-none text-sm px-4 py-3  text-left hover:bg-blue-500 rounded">
                                    Add to favorites
                                </button>
                                {user && user?._id === post?.author?._id && 
                                    <button onClick={deletePostHandler} className="bg-neutral-900 border border-neutral-700 text-white rounded-xl outline-none text-sm px-11 py-3  text-left hover:bg-blue-500 rounded">
                                        Delete
                                    </button>
                                }
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            </div>

            <div>
                <img
                    className="my-2 w-full h-auto object-cover rounded-lg"
                    src={post.image}
                    alt="post_image"
                />
                <div className='flex items-center justify-between'>
                    <div className='flex gap-4'>
                        {liked ? 
                            <FaHeart onClick={likeOrDislikeHandler} size={"23px"} className='cursor-pointer text-blue-500' /> : 
                            <FaRegHeart onClick={likeOrDislikeHandler} size={"23px"} className='cursor-pointer' />
                        }
                        <MessageCircle className='cursor-pointer' onClick={() => { dispatch(setSelectedPost(post)); setOpen(true); }} />
                        <Send className='cursor-pointer' />
                    </div>
                    {bookmarked
                        ? <FaBookmark onClick={bookmarkHandler} size={"23px"} className='cursor-pointer text-blue-500' />
                        : <FiBookmark onClick={bookmarkHandler} size={"23px"} className='cursor-pointer' />
                    }
                </div>
            </div>
            <span className='font-medium mr-2'>{postLike} likes</span>
            <p><span className='font-medium mr-2'>{post.author?.username}</span>{post.caption}</p>
            {comment.length > 0 && (
                <span onClick={() => { dispatch(setSelectedPost(post)); setOpen(true); }} className='cursor-pointer text-white'>view all {comment.length} comments</span>
            )}
            <CommentDialog open={open} setOpen={setOpen} />
            <div className='flex items-center justify-between mt-2'>
                <input
                    type="text"
                    value={text}
                    onChange={changeEventHandler}
                    placeholder="Add a comment..."
                    className="bg-neutral-900 border border-neutral-700 text-white rounded-xl px-4 py-2 outline-none w-full " />
                {text && <span onClick={commentHandler} className='cursor-pointer text-white bg-blue-500 rounded-sm p-1 pl-2 pr-2 ml-2 '>Post</span>}
            </div>
        </div>
    )
}





// import * as Dialog from '@radix-ui/react-dialog';
// import React, { useEffect, useState } from 'react'
// import { FaHeart, FaRegHeart } from "react-icons/fa";
// import { FiBookmark } from "react-icons/fi";
// import { MessageCircle, Send } from "lucide-react";
// import CommentDialog from './CommentDialog';
// import { useDispatch, useSelector } from 'react-redux';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { setPosts, setSelectedPost } from '@/redux/postSlice';
// import { FaBookmark } from "react-icons/fa";
// import { followUser, unfollowUser, updateBookmark } from '@/redux/authSlice';



// export default function Post({ post }) {

//     const [text, setText] = useState("");
//     const [open, setOpen] = useState(false);
//     const { user } = useSelector(store => store.auth);
//     const { posts } = useSelector(store => store.post);
//     const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
//     // const [bookmarked, setBookmarked] = useState(user?.bookmark?.includes(post._id) || false);
//     const bookmarked = useSelector(store => store.auth.user?.bookmark?.includes(post._id));

//     const [postLike, setPostLike] = useState(post.likes.length);
//     const [comment, setComment] = useState(post.comments);

//     const dispatch = useDispatch();

//     // FIX: Redux se current user ka following list get karo
//     // Ye ensure karega ki refresh ke baad bhi state maintain rahe
//     const currentUser = useSelector(store => store.auth.user);
//     const isFollowing = currentUser?.following?.includes(post.author?._id) || false;

//     function changeEventHandler(e) {
//         const inputText = e.target.value;
//         if (inputText.trim()) {
//             setText(inputText);
//         } else {
//             setText("");
//         }
//     }

//     //like or dislike api functionality
//     async function likeOrDislikeHandler() {
//         try {
//             const action = liked ? "dislike" : "like";
//             const res = await axios.get(`http://localhost:5500/post/${action}/${post?._id}`, { withCredentials: true });
//             if (res.data.success) {
//                 const updatedLikes = liked ? postLike - 1 : postLike + 1;
//                 setPostLike(updatedLikes);
//                 setLiked(!liked);
//                 //post update 
//                 const updatedPostData = posts.map(p =>
//                     p._id == post._id ? {
//                         ...p,
//                         likes: liked ? p.likes.filter(id => id != user._id) : [...p.likes, user._id]
//                     } : p
//                 );
//                 dispatch(setPosts(updatedPostData));
//                 toast.success(res.data.message);
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     }

//     //comment api functionality
//     async function commentHandler() {
//         try {
//             const res = await axios.post(`http://localhost:5500/post/comment/${post._id}`, { text }, {
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 withCredentials: true
//             });
//             if (res.data.success) {
//                 const updatedCommentData = [...comment, res.data.comment];
//                 setComment(updatedCommentData);
//                 const updatedPostData = posts.map(p =>
//                     p._id == post._id ? { ...p, comments: updatedCommentData } : p
//                 );
//                 dispatch(setPosts(updatedPostData));
//                 toast.success(res.data.message);
//                 setText("");
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     }

//     async function deletePostHandler() {
//         try {
//             const res = await axios.delete(`http://localhost:5500/post/delete/${post?._id}`, { withCredentials: true });
//             if (res.data.success) {
//                 const updatedPostData = posts.filter((postItem) => postItem?._id != post?._id);
//                 dispatch(setPosts(updatedPostData));
//                 toast.success(res.data.message);
//             }
//         } catch (error) {
//             console.log(error);
//             toast.error(error.response.data.message);
//         }
//     }



//     async function bookmarkHandler() {
//         try {
//             const res = await axios.get(`http://localhost:5500/post/bookmark/${post?._id}`, { withCredentials: true });
//             if (res.data.success) {
//                 if (res.data.type === "saved") {
//                     dispatch(updateBookmark({ postId: post._id, type: "add" }));
//                 } else {
//                     dispatch(updateBookmark({ postId: post._id, type: "remove" }));
//                 }
//                 toast.success(res.data.message);
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     }
    


//     // FIX: Properly handle follow/unfollow with Redux state management
//     async function handleFollowToggle() {
//         try {
//             const res = await axios.post(
//                 `http://localhost:5500/user/followOrUnFollow/${post.author._id}`,
//                 {},
//                 { withCredentials: true }
//             );

//             if (res.data.success) {
//                 if (res.data.type === "followed") {
//                     // User ko follow kiya
//                     dispatch(followUser(post.author._id));
//                     toast.success("User followed successfully");
//                 } else {
//                     // User ko unfollow kiya
//                     dispatch(unfollowUser(post.author._id));
//                     toast.success("User unfollowed successfully");
//                 }

//                 // Optional: Post author ke followers list bhi update kar sakte ho
//                 const updatedPostData = posts.map(p =>
//                     p._id === post._id ? {
//                         ...p,
//                         author: {
//                             ...p.author,
//                             followers: res.data.type === "followed" 
//                                 ? [...(p.author.followers || []), user._id]
//                                 : p.author.followers?.filter(id => id !== user._id) || []
//                         }
//                     } : p
//                 );
//                 dispatch(setPosts(updatedPostData));
//             }
//         } catch (error) {
//             console.error("Follow/Unfollow error:", error.response?.data || error.message);
//             toast.error(error.response?.data?.message || "Follow/Unfollow failed");
//         }
//     }

//     return (

//         <div className="bg-neutral-800 text-white p-4 m-4  max-w-md w-full mx-auto">
//             <div className="flex items-center justify-between mb-2">
//                 <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-full overflow-hidden">
//                         <img
//                             className="w-full h-full object-cover"
//                             src={post.author?.profilePicture}
//                             alt="user_profile"
//                         />
//                     </div>

//                     <div className='flex items-center gap-3'>
//                         <p className="text-sm">{post.author?.username}</p>
//                         {
//                             user?._id == post.author._id &&
//                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-500 text-white">
//                                 Author
//                             </span>
//                         }
//                     </div>
//                 </div>

//                 <Dialog.Root>
//                     <Dialog.Trigger className="text-white text-xl hover:text-gray-300">...</Dialog.Trigger>

//                     <Dialog.Portal>
//                         <Dialog.Overlay className="bg-black/50 fixed inset-0 z-40" />
//                         <Dialog.Content className="bg-neutral-800 rounded-xl shadow-xl p-6 w-[90%] max-w-md mx-auto fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-50">
//                             <div className="flex flex-col items-center gap-4">

//                                 {/* FIX: Redux state se directly check karo, local state nahi */}
//                                 {post?.author?._id !== user?._id && (
//                                     isFollowing ? (
//                                         <button 
//                                             onClick={handleFollowToggle} 
//                                             className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
//                                         >
//                                             Unfollow
//                                         </button>
//                                     ) : (
//                                         <button 
//                                             onClick={handleFollowToggle} 
//                                             className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
//                                         >
//                                             Follow
//                                         </button>
//                                     )
//                                 )}

//                                 <button className="px-4 py-2 text-white rounded hover:bg-pink-500">
//                                     Add to favorites
//                                 </button>
//                                 {
//                                     user && user?._id == post?.author?._id && 
//                                     <button onClick={deletePostHandler} className="px-4 py-2 text-white rounded hover:bg-pink-500">
//                                         Delete
//                                     </button>
//                                 }
//                             </div>
//                         </Dialog.Content>
//                     </Dialog.Portal>
//                 </Dialog.Root>
//             </div>

//             <div>
//                 <img
//                     className=" my-2 w-full h-auto object-cover"
//                     src={post.image}
//                     alt="jk_photo"
//                 />

//                 <div className='flex item-center justify-between'>
//                     <div className='flex gap-4'>
//                         {
//                             liked ? <FaHeart onClick={likeOrDislikeHandler} size={"23px"} className='cursor-pointer text-pink-500' /> : <FaRegHeart onClick={likeOrDislikeHandler} size={"23px"} className='cursor-pointer' />
//                         }

//                         <MessageCircle className='cursor-pointer' onClick={() => { dispatch(setSelectedPost(post)); setOpen(true); }} />
//                         <Send className='cursor-pointer' />
//                     </div>
//                     {bookmarked
//                         ? <FaBookmark onClick={bookmarkHandler} size={"23px"} className='cursor-pointer text-pink-400' />
//                         : <FiBookmark onClick={bookmarkHandler} size={"23px"} className='cursor-pointer' />}

//                 </div>

//             </div>
//             <span className='font-medium mr-2'>{postLike} likes</span>
//             <p><span className='font-medium mr-2'>{post.author?.username}</span>{post.caption}</p>
//             {
//                 comment.length > 0 && (
//                     <span onClick={() => { dispatch(setSelectedPost(post)); setOpen(true); }} className='cursor-pointer text-zinc-300'>view all {comment.length} comments</span>
//                 )
//             }
//             <CommentDialog open={open} setOpen={setOpen} />
//             <div className='flex items-center justify-between'>
//                 <input
//                     type="text"
//                     value={text}
//                     onChange={changeEventHandler}
//                     placeholder="Add a comment..."
//                     className="outline-none text-sm w-full" />
//                 {text && <span style={{ color: 'oklch(0.718 0.202 349.761)' }} onClick={commentHandler} className='cursor-pointer' >Post</span>}
//             </div>

//         </div>
//     )
// }









// import * as Dialog from '@radix-ui/react-dialog';
// import React, { useEffect, useState } from 'react'
// import { FaHeart, FaRegHeart } from "react-icons/fa";
// import { FiBookmark } from "react-icons/fi";
// import { MessageCircle, Send } from "lucide-react";
// import CommentDialog from './CommentDialog';
// import { useDispatch, useSelector } from 'react-redux';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { setPosts, setSelectedPost } from '@/redux/postSlice';
// import { FaBookmark } from "react-icons/fa";
// import { followUser, unfollowUser } from '@/redux/authSlice';


// export default function Post({ post }) {

//     const [text, setText] = useState("");
//     const [open, setOpen] = useState(false);
//     const { user } = useSelector(store => store.auth);
//     const { posts } = useSelector(store => store.post);
//     const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
//     const [bookmarked, setBookmarked] = useState(user?.bookmark?.includes(post._id) || false);
//     const [postLike, setPostLike] = useState(post.likes.length);
//     const [comment, setComment] = useState(post.comments);
//     const [isFollowing, setIsFollowing] = useState(post.author?.followers?.includes(user._id));

//     const dispatch = useDispatch();


//     useEffect(() => {
//         if (post?.author?.followers?.includes(user?._id)) {
//             setIsFollowing(true);
//         } else {
//             setIsFollowing(false);
//         }
//     }, [post, user]);
    

//     function changeEventHandler(e) {
//         const inputText = e.target.value;
//         if (inputText.trim()) {
//             setText(inputText);
//         } else {
//             setText("");
//         }
//     }

//     //like or dislike api functionality
//     async function likeOrDislikeHandler() {
//         try {
//             const action = liked ? "dislike" : "like";
//             const res = await axios.get(`http://localhost:5500/post/${action}/${post?._id}`, { withCredentials: true });
//             if (res.data.success) {
//                 const updatedLikes = liked ? postLike - 1 : postLike + 1;
//                 setPostLike(updatedLikes);
//                 setLiked(!liked);
//                 //post update 
//                 const updatedPostData = posts.map(p =>
//                     p._id == post._id ? {
//                         ...p,
//                         likes: liked ? p.likes.filter(id => id != user._id) : [...p.likes, user._id]
//                     } : p
//                 );
//                 dispatch(setPosts(updatedPostData));
//                 toast.success(res.data.message);
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     }

//     //comment api functionality
//     async function commentHandler() {
//         try {
//             const res = await axios.post(`http://localhost:5500/post/comment/${post._id}`, { text }, {
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 withCredentials: true
//             });
//             if (res.data.success) {
//                 const updatedCommentData = [...comment, res.data.comment];
//                 setComment(updatedCommentData);
//                 const updatedPostData = posts.map(p =>
//                     p._id == post._id ? { ...p, comments: updatedCommentData } : p
//                 );
//                 dispatch(setPosts(updatedPostData));
//                 toast.success(res.data.message);
//                 setText("");
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     }

//     async function deletePostHandler() {
//         try {
//             const res = await axios.delete(`http://localhost:5500/post/delete/${post?._id}`, { withCredentials: true });
//             if (res.data.success) {
//                 const updatedPostData = posts.filter((postItem) => postItem?._id != post?._id);
//                 dispatch(setPosts(updatedPostData));
//                 toast.success(res.data.message);
//             }
//         } catch (error) {
//             console.log(error);
//             toast.error(error.response.data.message);
//         }
//     }

//     async function bookmarkHandler() {
//         try {
//             const res = await axios.get(`http://localhost:5500/post/bookmark/${post?._id}`, { withCredentials: true });
//             if (res.data.success) {
//                 if (res.data.type === "saved") {
//                     setBookmarked(true);
//                 } else {
//                     setBookmarked(false);
//                 }
//                 toast.success(res.data.message);
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     }






//     async function handleFollowToggle() {
//         try {
//             const res = await axios.post(
//                 `http://localhost:5500/user/followOrUnFollow/${post.author._id}`,
//                 {},
//                 { withCredentials: true }
//             );

//             if (res.data.success) {
//                 setIsFollowing(res.data.type === "followed");
//                 if (res.data.type === "followed") {
//                     dispatch(followUser(post.author._id)); // new
//                     toast.success("followed successfully");
//                 } else {
//                     dispatch(unfollowUser(post.author._id)); // new
//                     toast.success("Unfollowed successfully");
//                 }
//             }
//         } catch (error) {
//             console.error("Follow/Unfollow error:", error.response?.data || error.message);
//             toast.error(error.response?.data?.message || "Follow/Unfollow failed");
//         }
//     }






//     return (

//         <div className="bg-neutral-800 text-white p-4 m-4  max-w-md w-full mx-auto">
//             <div className="flex items-center justify-between mb-2">
//                 <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-full overflow-hidden">
//                         <img
//                             className="w-full h-full object-cover"
//                             src={post.author?.profilePicture}
//                             alt="user_profile"
//                         />
//                     </div>

//                     <div className='flex items-center gap-3'>
//                         <p className="text-sm">{post.author?.username}</p>
//                         {
//                             user?._id == post.author._id &&
//                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-500 text-white">
//                                 Author
//                             </span>
//                         }
//                     </div>
//                 </div>

//                 <Dialog.Root>
//                     <Dialog.Trigger className="text-white text-xl hover:text-gray-300">...</Dialog.Trigger>

//                     <Dialog.Portal>
//                         <Dialog.Overlay className="bg-black/50 fixed inset-0 z-40" />
//                         <Dialog.Content className="bg-neutral-800 rounded-xl shadow-xl p-6 w-[90%] max-w-md mx-auto fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-50">
//                             <div className="flex flex-col items-center gap-4">


//                                 {post?.author?._id !== user?._id && (
//                                     isFollowing ? (
//                                         <button onClick={handleFollowToggle} className="px-4 py-2 text-white rounded hover:bg-pink-500" >Unfollow</button>
//                                     ) : (
//                                         <button onClick={handleFollowToggle} className="px-4 py-2 text-white rounded hover:bg-pink-500">Follow</button>
//                                     )
//                                 )}





//                                 <button className="px-4 py-2 text-white rounded hover:bg-pink-500">
//                                     Add to favorites
//                                 </button>
//                                 {
//                                     user && user?._id == post?.author?._id && <button onClick={deletePostHandler} className="px-4 py-2 text-white rounded hover:bg-pink-500">Delete</button>
//                                 }
//                             </div>
//                         </Dialog.Content>
//                     </Dialog.Portal>
//                 </Dialog.Root>
//             </div>

//             <div>
//                 <img
//                     className=" my-2 w-full h-auto object-cover"
//                     src={post.image}
//                     alt="jk_photo"
//                 />

//                 <div className='flex item-center justify-between'>
//                     <div className='flex gap-4'>
//                         {
//                             liked ? <FaHeart onClick={likeOrDislikeHandler} size={"23px"} className='cursor-pointer text-pink-500' /> : <FaRegHeart onClick={likeOrDislikeHandler} size={"23px"} className='cursor-pointer' />
//                         }

//                         <MessageCircle className='cursor-pointer' onClick={() => { dispatch(setSelectedPost(post)); setOpen(true); }} />
//                         <Send className='cursor-pointer' />
//                     </div>
//                     {bookmarked
//                         ? <FaBookmark onClick={bookmarkHandler} size={"23px"} className='cursor-pointer text-pink-400' />
//                         : <FiBookmark onClick={bookmarkHandler} size={"23px"} className='cursor-pointer' />}

//                 </div>

//             </div>
//             <span className='font-medium mr-2'>{postLike} likes</span>
//             <p><span className='font-medium mr-2'>{post.author?.username}</span>{post.caption}</p>
//             {
//                 comment.length > 0 && (
//                     <span onClick={() => { dispatch(setSelectedPost(post)); setOpen(true); }} className='cursor-pointer text-zinc-300'>view all {comment.length} comments</span>
//                 )
//             }
//             <CommentDialog open={open} setOpen={setOpen} />
//             <div className='flex items-center justify-between'>
//                 <input
//                     type="text"
//                     value={text}
//                     onChange={changeEventHandler}
//                     placeholder="Add a comment..."
//                     className="outline-none text-sm w-full" />
//                 {text && <span style={{ color: 'oklch(0.718 0.202 349.761)' }} onClick={commentHandler} className='cursor-pointer' >Post</span>}
//             </div>

//         </div>


//     )
// }












// import * as Dialog from '@radix-ui/react-dialog';
// import React, { useState } from 'react'
// import { FaHeart, FaRegHeart } from "react-icons/fa";
// import { FiBookmark } from "react-icons/fi";
// import { MessageCircle, Send } from "lucide-react";
// import CommentDialog from './CommentDialog';
// import { useDispatch, useSelector } from 'react-redux';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { setPosts, setSelectedPost } from '@/redux/postSlice';
// import { FaBookmark } from "react-icons/fa";

// export default function Post({ post }) {

//     const [text, setText] = useState("");
//     const [open, setOpen] = useState(false);
//     const { user } = useSelector(store => store.auth);
//     const { posts } = useSelector(store => store.post);
//     const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
//     const [bookmarked, setBookmarked] = useState(user?.bookmark?.includes(post._id) || false);
//     const [postLike, setPostLike] = useState(post.likes.length);
//     const [comment, setComment] = useState(post.comments);
//     const dispatch = useDispatch();

//     function changeEventHandler(e) {
//         const inputText = e.target.value;
//         if (inputText.trim()) {
//             setText(inputText);
//         } else {
//             setText("");
//         }
//     }

//     //like or dislike api functionality
//     async function likeOrDislikeHandler() {
//         try {
//             const action = liked ? "dislike" : "like";
//             const res = await axios.get(`http://localhost:5500/post/${action}/${post?._id}`, { withCredentials: true });
//             if (res.data.success) {
//                 const updatedLikes = liked ? postLike - 1 : postLike + 1;
//                 setPostLike(updatedLikes);
//                 setLiked(!liked);
//                 //post update
//                 const updatedPostData = posts.map(p =>
//                     p._id == post._id ? {
//                         ...p,
//                         likes: liked ? p.likes.filter(id => id != user._id) : [...p.likes, user._id]
//                     } : p
//                 );
//                 dispatch(setPosts(updatedPostData));
//                 toast.success(res.data.message);
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     }

//     //comment api functionality
//     async function commentHandler() {
//         try {
//             const res = await axios.post(`http://localhost:5500/post/comment/${post._id}`, { text }, {
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 withCredentials: true
//             });
//             if (res.data.success) {
//                 const updatedCommentData = [...comment, res.data.comment];
//                 setComment(updatedCommentData);
//                 const updatedPostData = posts.map(p =>
//                     p._id == post._id ? { ...p, comments: updatedCommentData } : p
//                 );
//                 dispatch(setPosts(updatedPostData));
//                 toast.success(res.data.message);
//                 setText("");
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     }

//     async function deletePostHandler() {
//         try {
//             const res = await axios.delete(`http://localhost:5500/post/delete/${post?._id}`, { withCredentials: true });
//             if (res.data.success) {
//                 const updatedPostData = posts.filter((postItem) => postItem?._id != post?._id);
//                 dispatch(setPosts(updatedPostData));
//                 toast.success(res.data.message);
//             }
//         } catch (error) {
//             console.log(error);
//             toast.error(error.response.data.message);
//         }
//     }

//     async function bookmarkHandler() {
//         try {
//             const res = await axios.get(`http://localhost:5500/post/bookmark/${post?._id}`, { withCredentials: true });
//             if (res.data.success) {
//                 if (res.data.type === "saved") {
//                     setBookmarked(true);
//                 } else {
//                     setBookmarked(false);
//                 }
//                 toast.success(res.data.message);
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     }

//     return (

//         <div className="bg-neutral-800 text-white p-4 m-4  max-w-md w-full mx-auto">
//             <div className="flex items-center justify-between mb-2">
//                 <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-full overflow-hidden">
//                         <img
//                             className="w-full h-full object-cover"
//                             src={post.author?.profilePicture}
//                             alt="user_profile"
//                         />
//                     </div>

//                     <div className='flex items-center gap-3'>
//                         <p className="text-sm">{post.author?.username}</p>
//                         {
//                             user?._id == post.author._id &&
//                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-500 text-white">
//                                 Author
//                             </span>
//                         }
//                     </div>
//                 </div>

//                 <Dialog.Root>
//                     <Dialog.Trigger className="text-white text-xl hover:text-gray-300">...</Dialog.Trigger>

//                     <Dialog.Portal>
//                         <Dialog.Overlay className="bg-black/50 fixed inset-0 z-40" />
//                         <Dialog.Content className="bg-neutral-800 rounded-xl shadow-xl p-6 w-[90%] max-w-md mx-auto fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-50">
//                             <div className="flex flex-col items-center gap-4">
//                                 {
//                                     post?.author?._id != user?._id && <button className="px-4 py-2 border-2 border-pink-500 text-white rounded hover:bg-pink-500">Unfollow </button>
//                                 }
//                                 <button className="px-4 py-2 text-white rounded hover:bg-pink-500">
//                                     Add to favorites
//                                 </button>
//                                 {
//                                     user && user?._id == post?.author?._id && <button onClick={deletePostHandler} className="px-4 py-2 text-white rounded hover:bg-pink-500">Delete</button>
//                                 }
//                             </div>
//                         </Dialog.Content>
//                     </Dialog.Portal>
//                 </Dialog.Root>
//             </div>

//             <div>
//                 <img
//                     className=" my-2 w-full h-auto object-cover"
//                     src={post.image}
//                     alt="jk_photo"
//                 />

//                 <div className='flex item-center justify-between'>
//                     <div className='flex gap-4'>
//                         {
//                             liked ? <FaHeart onClick={likeOrDislikeHandler} size={"23px"} className='cursor-pointer text-pink-500' /> : <FaRegHeart onClick={likeOrDislikeHandler} size={"23px"} className='cursor-pointer' />
//                         }

//                         <MessageCircle className='cursor-pointer' onClick={() => { dispatch(setSelectedPost(post)); setOpen(true); }} />
//                         <Send className='cursor-pointer' />
//                     </div>
//                     {bookmarked
//                         ? <FaBookmark onClick={bookmarkHandler} size={"23px"} className='cursor-pointer text-pink-400' />
//                         : <FiBookmark onClick={bookmarkHandler} size={"23px"} className='cursor-pointer' />}

//                 </div>

//             </div>
//             <span className='font-medium mr-2'>{postLike} likes</span>
//             <p><span className='font-medium mr-2'>{post.author?.username}</span>{post.caption}</p>
//             {
//                 comment.length > 0 && (
//                     <span onClick={() => { dispatch(setSelectedPost(post)); setOpen(true); }} className='cursor-pointer text-zinc-300'>view all {comment.length} comments</span>
//                 )
//             }
//             <CommentDialog open={open} setOpen={setOpen} />
//             <div className='flex items-center justify-between'>
//                 <input
//                     type="text"
//                     value={text}
//                     onChange={changeEventHandler}
//                     placeholder="Add a comment..."
//                     className="outline-none text-sm w-full" />
//                 {text && <span style={{ color: 'oklch(0.718 0.202 349.761)' }} onClick={commentHandler} className='cursor-pointer' >Post</span>}
//             </div>

//         </div>


//     )
// }
