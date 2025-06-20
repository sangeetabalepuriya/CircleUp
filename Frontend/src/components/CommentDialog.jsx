import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Popover from '@radix-ui/react-popover';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Comment from './Comment';
import axios from 'axios';
import { toast } from 'react-toastify';
import { setPosts } from '@/redux/postSlice';
import { followUser, unfollowUser } from '@/redux/authSlice';


export default function CommentDialog({ open, setOpen }) {

  const [text, setText] = useState("");
  const { selectedPost, posts } = useSelector(store => store.post);
  const [comment, setComment] = useState([]);
  const currentUser = useSelector(store => store.auth.user);
  const { user } = useSelector(store => store.auth);
  const isFollowing = selectedPost?.author?._id && currentUser?.following?.includes(selectedPost.author._id);

  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedPost) {
      setComment(selectedPost.comments);
    }
  }, [selectedPost]);

  useEffect(() => {
    // Close dialog if selectedPost was deleted
    if (selectedPost && !posts.find(p => p._id === selectedPost._id)) {
      setOpen(false);
    }
  }, [posts, selectedPost, setOpen]);


  function changeEventHandler(e) {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  }

  async function sendMessageHandler() {
    try {
      const res = await axios.post(`http://localhost:5500/post/comment/${selectedPost?._id}`, { text }, {
        headers: {
          "Content-Type": "application/json"
        },
        withCredentials: true
      });
      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);
        const updatedPostData = posts.map(p =>
          p._id == selectedPost._id ? { ...p, comments: updatedCommentData } : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Follow/Unfollow functionality
  async function handleFollowToggle() {
    try {
      const res = await axios.post(
        `http://localhost:5500/user/followOrUnFollow/${selectedPost.author._id}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        if (res.data.type === "followed") {
          dispatch(followUser(selectedPost.author._id));
          toast.success("User  followed successfully");
        } else {
          dispatch(unfollowUser(selectedPost.author._id));
          toast.success("User  unfollowed successfully");
        }

        const updatedPostData = posts.map(p =>
          p._id === selectedPost._id ? {
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


  // Delete post functionality
  async function deletePostHandler() {
    try {
      const res = await axios.delete(`http://localhost:5500/post/delete/${selectedPost?._id}`, { withCredentials: true });
      if (res.data.success) {
        const updatedPostData = posts.filter((postItem) => postItem?._id !== selectedPost?._id);
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setOpen(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/50 fixed inset-0 z-40" />
        <Dialog.Content className="bg-neutral-900 outline-none rounded-xl p-4 w-[70%] max-w-3xl mx-auto fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 shadow-xl border border-neutral-700">
          <div className="flex flex-col lg:flex-row gap-6 h-[70vh] overflow-hidden">
            {/* Post Image */}
            <div className="w-full lg:w-3/5 h-full">
              <img
                className="object-cover w-full h-full rounded-xl"
                src={selectedPost?.image}
                alt="post_img"
              />
            </div>

            {/* Right Side: Comments & Info */}
            <div className="w-full lg:w-2/5 flex flex-col gap-4">
              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link to={`/profile/${selectedPost?.author?._id}`}>
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img
                        className="w-full h-full object-cover"
                        src={selectedPost?.author?.profilePicture}
                        alt="profile"
                      />
                    </div>
                  </Link>
                  <Link to={`/profile/${selectedPost?.author?._id}`}>
                    <span className="text-white font-medium text-sm hover:underline">
                      {selectedPost?.author?.username}
                    </span>
                  </Link>
                </div>

                {/* Options */}
                <Popover.Root>
                  <Popover.Trigger className="text-white text-xl hover:text-gray-300 focus:outline-none">...</Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content
                      side="right"
                      align="start"
                      className="bg-neutral-800 rounded-lg shadow-xl p-4 w-48 mt-2 z-50 border border-neutral-700"
                    >
                      <div className="flex flex-col items-center gap-2">
                        {selectedPost?.author?._id !== user?._id && (
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
                        {user && user?._id === selectedPost?.author?._id && (
                          <button
                            onClick={deletePostHandler}
                            className="bg-neutral-900 border border-neutral-700 text-white rounded-xl outline-none text-sm px-11 py-3 text-left hover:bg-blue-500 rounded"
                          >
                            Delete
                          </button>
                        )}
                        {/* <button className="bg-neutral-900 border border-neutral-700 text-white rounded-xl outline-none text-sm px-9 py-3  text-left hover:bg-blue-500 rounded">Unfollow</button> */}
                        <button className=" bg-neutral-900 border border-neutral-700 text-white rounded-xl outline-none text-sm px-4 py-3  text-left hover:bg-blue-500 rounded">Add to favorites</button>
                      </div>
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              </div>

              {/* Comments */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scroll suggested-users-scroll max-h-[300px]">
                <hr className="border-neutral-700 mb-3" />
                <div className="flex flex-col gap-3">
                  {comment.map((c) => (
                    <Comment key={c._id} comment={c} />
                  ))}
                </div>
              </div>

              {/* Comment Input */}
              <div className="pt-2 mt-auto border-t border-neutral-700">
                <div className="flex gap-2">
                  <input
                    value={text}
                    onChange={changeEventHandler}
                    type="text"
                    placeholder="Add a comment..."
                    className="bg-neutral-900 border border-neutral-700 text-white rounded-xl px-4 py-2 outline-none w-full"
                  />
                  <button
                    disabled={!text.trim()}
                    onClick={sendMessageHandler}
                    className={`text-white px-4 py-2 rounded transition ${!text.trim()
                      ? "bg-neutral-900 border border-neutral-700 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-400"
                      }`}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>

  );
}
