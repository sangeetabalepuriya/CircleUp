import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, Search, TrendingUp, MessageCircle, Heart, PlusSquare, LogOut } from 'lucide-react'
import axios from 'axios';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';
import CreatePost from './CreatePost';
import { setPosts, setSelectedPost } from '@/redux/postSlice';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { clearLikeNotification } from '@/redux/rtnSlice';

export default function Navbar() {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const { likeNotification } = useSelector(store => store.realTimeNotification)
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [openNotifications, setOpenNotifications] = useState(false);

    async function logOutHandler() {
        try {
            const res = await axios.get("https://circleup-mqwe.onrender.com/user/logout", { withCredentials: true });
            if (res.data.success) {
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                navigate("/login");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    function sidebarHandler(textType) {
        if (textType === "Logout") {
            logOutHandler();
        } else if (textType === "Create") {
            setOpen(true);
        } else if (textType === "Profile") {
            navigate(`/profile/${user?._id}`)
        } else if (textType === "Messages") {
            navigate("/chat");
        }
    }

    const menuItems = [
        { label: "Home", icon: <Home className="w-6 h-6 transition-colors duration-300" />, path: "/" },
        { label: "Search", icon: <Search className="w-6 h-6 transition-colors duration-300" /> },
        { label: "Explore", icon: <TrendingUp className="w-6 h-6 transition-colors duration-300" /> },
        { label: "Messages", icon: <MessageCircle className="w-6 h-6 transition-colors duration-300" /> },
        { label: "Notifications", icon: <Heart className="w-6 h-6 transition-colors duration-300" /> },
        { label: "Create", icon: <PlusSquare className="w-6 h-6 transition-colors duration-300" /> },
        {
            label: "Profile",
            icon: (
                <img
                    src={user?.profilePicture}
                    alt="profile"
                    className="w-7 h-7 rounded-full object-cover"
                />
            )
        },
        { label: "Logout", icon: <LogOut className="w-6 h-6 transition-colors duration-300" /> }
    ];

    return (
        <div className="h-screen w-64 bg-neutral-900 text-white fixed left-0 top-0 shadow-2xl border-r border-gray-800">
            <div className="p-6">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold bg-blue-500  bg-clip-text text-transparent">
                        CircleUp
                    </h2>
                    <div className="w-12 h-1 bg-blue-500  rounded-full mt-2"></div>
                </div>
                {/* <h2 className="text-2xl font-bold mb-8 text-white">CircleUp</h2> */}
                <ul className="space-y-2">
                    {menuItems.map((item, idx) => {
                        const isNotifications = item.label === "Notifications";

                        return (
                            <li
                                key={idx}
                                onClick={() => !isNotifications && sidebarHandler(item.label)}
                            >
                                {
                                    isNotifications ? (
                                        <Popover
                                            open={openNotifications}
                                            onOpenChange={(open) => {
                                                setOpenNotifications(open);
                                                if (!open && likeNotification.length > 0) {
                                                    dispatch(clearLikeNotification());
                                                }
                                            }}
                                        >
                                            <PopoverTrigger asChild>
                                                <button
                                                    className="w-full flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-300 text-gray-400 hover:text-blue-500 focus:text-blue-500 group relative"
                                                >
                                                    {item.icon}
                                                    <span className="text-lg font-medium">{item.label}</span>
                                                    {likeNotification.length > 0 && (
                                                        <span className="absolute -top-1 left-7 bg-blue-500 text-white text-xs px-1 rounded-full">
                                                            {likeNotification.length}
                                                        </span>
                                                    )}
                                                </button>
                                            </PopoverTrigger>

                                            <PopoverContent className="bg-neutral-900 text-white rounded-xl p-4 shadow-xl w-60 border border-neutral-700 space-y-2">
                                                {likeNotification.length === 0 ? (
                                                    <p className="text-sm text-neutral-400 text-center">No new notifications</p>
                                                ) : (
                                                    likeNotification.map((notification) => (
                                                        <div
                                                            key={notification.userId}
                                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800 transition-colors duration-200"
                                                        >
                                                            <img
                                                                src={notification.userDetails?.profilePicture}
                                                                alt="user"
                                                                className="w-9 h-9 rounded-full object-cover border border-neutral-600"
                                                            />
                                                            <p className="text-sm text-neutral-200">
                                                                <span className="font-semibold text-blue-400">{notification.userDetails?.username}</span>{" "}
                                                                liked your post
                                                            </p>
                                                        </div>
                                                    ))
                                                )}
                                            </PopoverContent>

                                        </Popover>
                                    ) : (
                                        <Link
                                            to={item.path || "#"}
                                            className="flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-300 text-gray-400 hover:text-blue-500 focus:text-blue-500 group"
                                        >
                                            {item.icon}
                                            <span className="text-lg font-medium">{item.label}</span>
                                        </Link>
                                    )
                                }
                            </li>
                        );
                    })}
                </ul>

                <CreatePost open={open} setOpen={setOpen} />
            </div>
        </div>
    )
}
