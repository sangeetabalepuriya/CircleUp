import { setAuthUser } from '@/redux/authSlice';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function EditProfile() {
    const imageRef = useRef();
    const { user } = useSelector(store => store.auth);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState({
        profilePhoto: user?.profilePicture,
        bio: user?.bio,
        gender: user?.gender
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    function fileChangeHandler(e) {
        const file = e.target.files?.[0];
        if (file) setInput({ ...input, profilePhoto: file });
    }

    function selectChangeHandler(value) {
        setInput({ ...input, gender: value });
    }

    async function editProfileHandler() {
        const formData = new FormData();
        formData.append("bio", input.bio);
        formData.append("gender", input.gender);
        if (input.profilePhoto) {
            formData.append("profilePhoto", input.profilePhoto);
        }
        try {
            setLoading(true);
            const res = await axios.post("https://circleup-mqwe.onrender.com/user/profile/edit", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                withCredentials: true
            });

            if (res.data.success) {
                const updatedUserData = {
                    ...user,
                    bio: res.data.user?.bio,
                    profilePicture: res.data.user?.profilePicture,
                    gender: res.data.user.gender
                };
                dispatch(setAuthUser(updatedUserData));
                navigate(`/profile/${user?._id}`);
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='flex max-w-2xl mx-auto px-4 md:px-10'>
            <section className='flex flex-col gap-6 w-full my-10'>
                <h1 className='text-2xl font-semibold text-white'>Edit Profile</h1>

                {/* Profile Photo Upload */}
                <div className='flex items-center justify-between bg-neutral-800 border border-neutral-700 rounded-xl p-4'>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full overflow-hidden border border-neutral-600">
                            <img
                                className="w-full h-full object-cover"
                                src={
                                    input.profilePhoto instanceof File
                                        ? URL.createObjectURL(input.profilePhoto)
                                        : input.profilePhoto
                                }
                                alt="user_profile"
                            />
                        </div>
                        <div>
                            <h1 className="text-sm font-semibold text-white">{user?.username}</h1>
                            <p className='text-sm text-gray-400'>{user?.bio || "No bio yet"}</p>
                        </div>
                    </div>
                    <input ref={imageRef} onChange={fileChangeHandler} type='file' className='hidden' />
                    <button
                        onClick={() => imageRef?.current.click()}
                        className='text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md transition duration-200'
                    >
                        Change Photo
                    </button>
                </div>

                {/* Bio Input */}
                <div className="w-full">
                    <label htmlFor="bio" className="block font-medium text-white mb-1">Bio</label>
                    <textarea
                        id="bio"
                        value={input.bio}
                        onChange={(e) => setInput({ ...input, bio: e.target.value })}
                        name="bio"
                        className="w-full h-20 px-3 py-2 bg-neutral-800 text-white border border-neutral-700 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Gender Select */}
                <div className="w-full">
                    <label htmlFor="gender" className="block font-medium text-white mb-1">Gender</label>
                    <select
                        id="gender"
                        name="gender"
                        value={input.gender}
                        onChange={(e) => selectChangeHandler(e.target.value)}
                        className="w-40 px-3 py-2 bg-neutral-800 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value=""></option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                    </select>
                </div>

                {/* Submit Button */}
                <div className='flex justify-end'>
                    {loading ? (
                        <button
                            disabled
                            className='flex items-center gap-2 bg-pink-500 px-4 py-2 rounded-md text-white opacity-70 cursor-not-allowed'
                        >
                            <Loader2 className='w-4 h-4 animate-spin' />
                            Please wait
                        </button>
                    ) : (
                        <button
                            onClick={editProfileHandler}
                            className='bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-md transition duration-200'
                        >
                            Submit
                        </button>
                    )}
                </div>
            </section>
        </div>
    )
}




