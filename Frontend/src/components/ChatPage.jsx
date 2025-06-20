import { setSelectedUser } from '@/redux/authSlice';
import { MessageCircleCode, Send } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Messages from './Messages';
import axios from 'axios';
import { setMessages } from '@/redux/chatSlice';
import { Link } from 'react-router-dom';

export default function ChatPage() {
    const [textMessage, setTextMessage] = useState("");
    const { user, suggestedUsers, selectedUser } = useSelector(store => store.auth);
    const { onLineUsers, messages } = useSelector(store => store.chat);
    const dispatch = useDispatch();

    async function sendMessageHandler(receiverId) {
        try {
            const res = await axios.post(`http://localhost:5500/message/send/${receiverId}`, { textMessage }, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            });

            if (res.data.success) {
                dispatch(setMessages([...messages, res.data.newMessage]));
                setTextMessage("");
            }

        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        return () => {
            dispatch(setSelectedUser(null));
        }
    }, []);

    return (
        <div className='flex ml-[21%] h-screen bg-neutral-900'>
            {/* Sidebar - User List */}
            <section className='w-full md:w-1/3 lg:w-1/4 my-8 mr-4'>
                <div className='bg-neutral-800 rounded-2xl shadow-md border border-neutral-700 h-full flex flex-col'>
                    {/* Header */}
                    <div className='p-4 border-b border-neutral-700'>
                        <h1 className='font-bold text-xl text-white mb-2'>Messages</h1>
                    </div>
                    
                    {/* User List */}
                    <div className='overflow-y-auto flex-1 p-2 '>
                        {
                            suggestedUsers
                                .filter(userItem => user?.following?.includes(userItem._id)) // ✅ Filter only followed
                                .map((suggestedUser) => {
                                    const isOnLine = onLineUsers.includes(suggestedUser?._id);
                                    const isSelected = selectedUser?._id === suggestedUser._id;
                                    return (
                                        <div 
                                            key={suggestedUser._id}
                                            onClick={() => dispatch(setSelectedUser(suggestedUser))} 
                                            className={`flex gap-3 items-center p-3 rounded-xl cursor-pointer transition-all duration-200 mb-2 ${
                                                isSelected 
                                                    ? 'bg-neutral-700 shadow-lg' 
                                                    : 'hover:bg-neutral-700'
                                            }`}
                                        >
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-neutral-600">
                                                    <img
                                                        src={suggestedUser?.profilePicture}
                                                        alt="user avatar"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                {/* Online Status Indicator */}
                                                {/* <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-neutral-800 ${
                                                    isOnLine ? 'bg-emerald-500' : 'bg-gray-500'
                                                }`}></div> */}
                                            </div>
                                            <div className='flex flex-col flex-1 min-w-0'>
                                                <span className={`font-medium truncate ${
                                                    isSelected ? 'text-white' : 'text-white'
                                                }`}>
                                                    {suggestedUser?.username}
                                                </span>
                                                <span className={`text-xs font-medium ${
                                                    isSelected 
                                                        ? (isOnLine ? 'text-green-200' : 'text-red-200')
                                                        : (isOnLine ? 'text-emerald-500' : 'text-red-400')
                                                }`}>
                                                    {isOnLine ? "Active now" : "Offline"}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })
                        }
                    </div>
                </div>
            </section>

            {/* Chat Section */}
            {
                selectedUser ? (
                    <section className='flex-1 flex flex-col h-full my-8 mr-8'>
                        <div className='bg-neutral-800 rounded-2xl shadow-md border border-neutral-700 flex flex-col h-full'>
                            {/* Chat Header */}
                            <div className='flex gap-3 items-center px-6 py-4 border-b border-neutral-700 bg-neutral-800 rounded-t-2xl'>
                                <div className="relative">
                                    <Link to={`/profile/${selectedUser?._id}`}>
                                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-neutral-600">
                                        <img
                                            src={selectedUser?.profilePicture}
                                            alt="profile"
                                            className="w-full h-full object-cover cursor-pointer"
                                        />
                                    </div>
                                    </Link>
                                    {/* <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-neutral-800 ${
                                        onLineUsers.includes(selectedUser?._id) ? 'bg-emerald-500' : 'bg-gray-500'
                                    }`}></div> */}
                                </div>
                                <div className='flex flex-col'>
                                    <span className='text-white font-semibold text-lg'>{selectedUser?.username}</span>
                                    <span className={`text-sm ${
                                        onLineUsers.includes(selectedUser?._id) ? 'text-emerald-400' : 'text-gray-400'
                                    }`}>
                                        {onLineUsers.includes(selectedUser?._id) ? 'Active now' : 'Last seen recently'}
                                    </span>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className='flex-1 overflow-hidden'>
                                <Messages selectedUser={selectedUser} />
                            </div>

                            {/* Message Input */}
                            <div className='p-4 border-t border-neutral-700 bg-neutral-800 rounded-b-2xl'>
                                <div className='flex items-center gap-3'>
                                    <input 
                                        value={textMessage} 
                                        onChange={(e) => setTextMessage(e.target.value)} 
                                        type="text" 
                                        className='bg-neutral-900 border border-neutral-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 placeholder-gray-400 transition-all duration-200' 
                                        placeholder='Type a message...'
                                        onKeyPress={(e) => e.key === 'Enter' && textMessage.trim() && sendMessageHandler(selectedUser?._id)}
                                    />
                                    <button 
                                        onClick={() => sendMessageHandler(selectedUser?._id)} 
                                        disabled={!textMessage.trim()}
                                        className={`p-3 rounded-xl shadow transition-all duration-200 ${
                                            textMessage.trim() 
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                                : 'bg-neutral-700 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        <Send className='w-5 h-5' />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className='flex-1 flex flex-col items-center justify-center my-8 mr-8'>
                        <div className='bg-neutral-800 rounded-2xl shadow-md border border-neutral-700 p-12 text-center w-full h-full'>
                            <div className='bg-neutral-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 mt-20'>
                                <MessageCircleCode className='w-12 h-12 text-gray-400' />
                            </div>
                            <h1 className='font-bold text-2xl text-white mb-3'>Your Messages</h1>
                            <p className='text-gray-400 text-base leading-relaxed'>
                                Select a conversation to start chatting with your friends and stay connected.
                            </p>
                        </div>
                    </section>
                )
            }
        </div>
    )
}



// import { setSelectedUser } from '@/redux/authSlice';
// import { MessageCircleCode, Send } from 'lucide-react';
// import React, { useEffect, useState } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import Messages from './Messages';
// import axios from 'axios';
// import { setMessages } from '@/redux/chatSlice';
// import { Link } from 'react-router-dom';

// export default function ChatPage() {
//     const [textMessage, setTextMessage] = useState("");
//     const { user, suggestedUsers, selectedUser } = useSelector(store => store.auth);
//     const { onLineUsers, messages } = useSelector(store => store.chat);
//     const dispatch = useDispatch();

//     async function sendMessageHandler(receiverId) {
//         try {
//             const res = await axios.post(`http://localhost:5500/message/send/${receiverId}`, { textMessage }, {
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 withCredentials: true
//             });

//             if (res.data.success) {
//                 dispatch(setMessages([...messages, res.data.newMessage]));
//                 setTextMessage("");
//             }

//         } catch (error) {
//             console.log(error);
//         }
//     }

//     useEffect(() => {
//         return () => {
//             dispatch(setSelectedUser(null));
//         }
//     }, []);

//     return (
//         <div className='flex ml-[21%] h-screen bg-neutral-900'>
//             {/* Sidebar - User List */}
//             <section className='w-full md:w-1/3 lg:w-1/4 my-8 mr-4'>
//                 <div className='bg-neutral-800 rounded-2xl shadow-md border border-neutral-700 h-full flex flex-col'>
//                     {/* Header */}
//                     <div className='p-4 border-b border-neutral-700'>
//                         <h1 className='font-bold text-xl text-white mb-2'>Messages</h1>
//                     </div>
                    
//                     {/* User List */}
//                     <div className='overflow-y-auto flex-1 p-2 '>
//                         {
//                             suggestedUsers
//                                 .filter(userItem => user?.following?.includes(userItem._id)) // ✅ Filter only followed
//                                 .map((suggestedUser) => {
//                                     const isOnLine = onLineUsers.includes(suggestedUser?._id);
//                                     const isSelected = selectedUser?._id === suggestedUser._id;
//                                     return (
//                                         <div 
//                                             key={suggestedUser._id}
//                                             onClick={() => dispatch(setSelectedUser(suggestedUser))} 
//                                             className={`flex gap-3 items-center p-3 rounded-xl cursor-pointer transition-all duration-200 mb-2 ${
//                                                 isSelected 
//                                                     ? 'bg-neutral-700 shadow-lg' 
//                                                     : 'hover:bg-neutral-700'
//                                             }`}
//                                         >
//                                             <div className="relative">
//                                                 <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-neutral-600">
//                                                     <img
//                                                         src={suggestedUser?.profilePicture}
//                                                         alt="user avatar"
//                                                         className="w-full h-full object-cover"
//                                                     />
//                                                 </div>
//                                                 {/* Online Status Indicator */}
//                                                 {/* <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-neutral-800 ${
//                                                     isOnLine ? 'bg-emerald-500' : 'bg-gray-500'
//                                                 }`}></div> */}
//                                             </div>
//                                             <div className='flex flex-col flex-1 min-w-0'>
//                                                 <span className={`font-medium truncate ${
//                                                     isSelected ? 'text-white' : 'text-white'
//                                                 }`}>
//                                                     {suggestedUser?.username}
//                                                 </span>
//                                                 <span className={`text-xs font-medium ${
//                                                     isSelected 
//                                                         ? (isOnLine ? 'text-green-200' : 'text-red-200')
//                                                         : (isOnLine ? 'text-emerald-500' : 'text-red-400')
//                                                 }`}>
//                                                     {isOnLine ? "Active now" : "Offline"}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     )
//                                 })
//                         }
//                     </div>
//                 </div>
//             </section>

//             {/* Chat Section */}
//             {
//                 selectedUser ? (
//                     <section className='flex-1 flex flex-col h-full my-8 mr-8'>
//                         <div className='bg-neutral-800 rounded-2xl shadow-md border border-neutral-700 flex flex-col h-full'>
//                             {/* Chat Header */}
//                             <div className='flex gap-3 items-center px-6 py-4 border-b border-neutral-700 bg-neutral-800 rounded-t-2xl'>
//                                 <div className="relative">
//                                     <Link to={`/profile/${selectedUser?._id}`}>
//                                     <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-neutral-600">
//                                         <img
//                                             src={selectedUser?.profilePicture}
//                                             alt="profile"
//                                             className="w-full h-full object-cover cursor-pointer"
//                                         />
//                                     </div>
//                                     </Link>
//                                     {/* <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-neutral-800 ${
//                                         onLineUsers.includes(selectedUser?._id) ? 'bg-emerald-500' : 'bg-gray-500'
//                                     }`}></div> */}
//                                 </div>
//                                 <div className='flex flex-col'>
//                                     <span className='text-white font-semibold text-lg'>{selectedUser?.username}</span>
//                                     <span className={`text-sm ${
//                                         onLineUsers.includes(selectedUser?._id) ? 'text-emerald-400' : 'text-gray-400'
//                                     }`}>
//                                         {onLineUsers.includes(selectedUser?._id) ? 'Active now' : 'Last seen recently'}
//                                     </span>
//                                 </div>
//                             </div>

//                             {/* Messages */}
//                             <div className='flex-1 overflow-hidden'>
//                                 <Messages selectedUser={selectedUser} />
//                             </div>

//                             {/* Message Input */}
//                             <div className='p-4 border-t border-neutral-700 bg-neutral-800 rounded-b-2xl'>
//                                 <div className='flex items-center gap-3'>
//                                     <input 
//                                         value={textMessage} 
//                                         onChange={(e) => setTextMessage(e.target.value)} 
//                                         type="text" 
//                                         className='bg-neutral-900 border border-neutral-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 placeholder-gray-400 transition-all duration-200' 
//                                         placeholder='Type a message...'
//                                         onKeyPress={(e) => e.key === 'Enter' && textMessage.trim() && sendMessageHandler(selectedUser?._id)}
//                                     />
//                                     <button 
//                                         onClick={() => sendMessageHandler(selectedUser?._id)} 
//                                         disabled={!textMessage.trim()}
//                                         className={`p-3 rounded-xl shadow transition-all duration-200 ${
//                                             textMessage.trim() 
//                                                 ? 'bg-blue-600 hover:bg-blue-700 text-white' 
//                                                 : 'bg-neutral-700 text-gray-400 cursor-not-allowed'
//                                         }`}
//                                     >
//                                         <Send className='w-5 h-5' />
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </section>
//                 ) : (
//                     <section className='flex-1 flex flex-col items-center justify-center my-8 mr-8'>
//                         <div className='bg-neutral-800 rounded-2xl shadow-md border border-neutral-700 p-12 text-center w-full h-full'>
//                             <div className='bg-neutral-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 mt-20'>
//                                 <MessageCircleCode className='w-12 h-12 text-gray-400' />
//                             </div>
//                             <h1 className='font-bold text-2xl text-white mb-3'>Your Messages</h1>
//                             <p className='text-gray-400 text-base leading-relaxed'>
//                                 Select a conversation to start chatting with your friends and stay connected.
//                             </p>
//                         </div>
//                     </section>
//                 )
//             }
//         </div>
//     )
// }








