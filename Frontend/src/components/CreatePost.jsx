import React, { useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog';
import { readFileAsDataURL } from '@/utils';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from "react-toastify";
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '@/redux/postSlice';

export default function CreatePost({ open, setOpen }) {
  const imgageRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useSelector(store => store.auth);
  const { posts } = useSelector(store => store.post);
  const dispatch = useDispatch();

  async function fileChangeHandler(e) {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const dataUrl = await readFileAsDataURL(file);
      setImagePreview(dataUrl);
    }
  }

  async function createPostHandler(e) {
    const formData = new FormData();
    formData.append("caption", caption);
    if (imagePreview) formData.append("image", file);
    try {
      setLoading(true);
      const res = await axios.post("https://circleup-3wqg.onrender.com/post/addpost", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }, withCredentials: true
      });
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));
        toast.success(res.data.message);
        setOpen(false);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="bg-black/50 fixed inset-0 z-40" />

        {/* Dialog Box */}
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[90%] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-neutral-800 p-6 shadow-lg focus:outline-none">
          <div className="flex flex-col gap-4">
            <Dialog.Title className="text-xl font-semibold text-white">Create a Post</Dialog.Title>

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="p-2 border border-neutral-700 rounded-xl outline-none resize-none h-24 focus:ring-2 focus:ring-blue-500 text-white bg-neutral-900"
              required
            />
            {
              imagePreview && (
                <div className='w-full h-64 flex items-center justify-center'>
                  <img className='object-cover h-full w-full rounded-md' src={imagePreview} alt="preview_img" />
                </div>
              )
            }
            <input ref={imgageRef} onChange={fileChangeHandler} type="file" className='hidden' />
            <button onClick={() => imgageRef.current.click()} className="bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition">Select from the computer</button>
            {
              imagePreview && (
                loading ? (
                  <button
                    disabled
                    className="flex items-center justify-center gap-2 w-full text-white bg-blue-600 py-2 rounded-xl hover:bg-blue-700 transition-opacity disabled:opacity-70"
                  >
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Please wait
                  </button>
                ) : (
                  <button onClick={createPostHandler} className='w-full text-white bg-blue-600 py-2 rounded-xl hover:bg-blue-700 transition'>Post</button>
                )
              )
            }
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}