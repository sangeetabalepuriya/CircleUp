import useGetAllMessage from '@/hooks/useGetAllMessage';
import useGetRTM from '@/hooks/useGetRTM';
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function Messages({ selectedUser }) {
    useGetRTM();
    useGetAllMessage();

    const lastMessageRef = useRef(null);

    const { messages } = useSelector(store => store.chat);
    const { user } = useSelector(store => store.auth);

    useEffect(() => {
        if (lastMessageRef.current) {
          lastMessageRef.current.scrollIntoView({ behavior: 'instant', block: 'end' });
        }
      }, [messages, selectedUser?._id]);
      
    return (
        <div className='flex flex-col h-full bg-neutral-900'>

            {/* Entire scrollable content including user profile */}
            <div className='flex-1 overflow-y-auto px-4 pb-4 suggested-users-scroll'>

                {/* Header: User Info (now scrollable) */}
                <div className='flex justify-center pt-4 mb-6'>
                    <div className='flex flex-col items-center bg-neutral-800 p-6 rounded-2xl shadow-md border border-neutral-700'>
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-3 ring-2 ring-neutral-600">
                            <img
                                src={selectedUser?.profilePicture}
                                alt="profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className='text-white font-semibold text-lg mb-3'>{selectedUser?.username}</span>
                        <Link to={`/profile/${selectedUser?._id}`}>
                            <button className='bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition duration-200 text-sm md:text-base cursor-pointer'>
                                View profile
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Message list */}
                <div className='flex flex-col gap-3 max-w-4xl mx-auto'>
                    {
                        messages?.map((msg, index) => (
                            <div key={msg._id} 
                            ref={index === messages.length - 1 ? lastMessageRef : null}
                            className={`flex ${msg.senderId === user._id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 rounded-xl max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl shadow-md transition-all duration-200 ${
                                    msg.senderId === user._id
                                        ? 'bg-blue-600 text-white rounded-br-md'
                                        : 'bg-neutral-800 text-white border border-neutral-700 rounded-bl-md'
                                }`}>
                                    <span className='text-sm md:text-base leading-relaxed'>{msg.message}</span>
                                </div>
                            </div>
                        ))
                    }
                </div >
                

            </div>
        </div>
    );
}
















// import useGetAllMessage from '@/hooks/useGetAllMessage';
// import useGetRTM from '@/hooks/useGetRTM';
// import React from 'react';
// import { useSelector } from 'react-redux';
// import { Link } from 'react-router-dom';

// export default function Messages({ selectedUser }) {
//     useGetRTM();
//     useGetAllMessage();

//     const { messages } = useSelector(store => store.chat);
//     const { user } = useSelector(store => store.auth);

//     return (
//         <div className='flex flex-col h-full bg-neutral-900'>

//             {/* Entire scrollable content including user profile */}
//             <div className='flex-1 overflow-y-auto px-4 pb-4 suggested-users-scroll'>

//                 {/* Header: User Info (now scrollable) */}
//                 <div className='flex justify-center pt-4 mb-6'>
//                     <div className='flex flex-col items-center bg-neutral-800 p-6 rounded-2xl shadow-md border border-neutral-700'>
//                         <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-3 ring-2 ring-neutral-600">
//                             <img
//                                 src={selectedUser?.profilePicture}
//                                 alt="profile"
//                                 className="w-full h-full object-cover"
//                             />
//                         </div>
//                         <span className='text-white font-semibold text-lg mb-3'>{selectedUser?.username}</span>
//                         <Link to={`/profile/${selectedUser?._id}`}>
//                             <button className='bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition duration-200 text-sm md:text-base cursor-pointer'>
//                                 View profile
//                             </button>
//                         </Link>
//                     </div>
//                 </div>

//                 {/* Message list */}
//                 <div className='flex flex-col gap-3 max-w-4xl mx-auto'>
//                     {
//                         messages?.map((msg) => (
//                             <div key={msg._id} className={`flex ${msg.senderId === user._id ? 'justify-end' : 'justify-start'}`}>
//                                 <div className={`p-3 rounded-xl max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl shadow-md transition-all duration-200 ${
//                                     msg.senderId === user._id
//                                         ? 'bg-blue-600 text-white rounded-br-md'
//                                         : 'bg-neutral-800 text-white border border-neutral-700 rounded-bl-md'
//                                 }`}>
//                                     <span className='text-sm md:text-base leading-relaxed'>{msg.message}</span>
//                                 </div>
//                             </div>
//                         ))
//                     }
//                 </div>
//             </div>
//         </div>
//     );
// }





// import useGetAllMessage from '@/hooks/useGetAllMessage';
// import useGetRTM from '@/hooks/useGetRTM';
// import React from 'react'
// import { useSelector } from 'react-redux'
// import { Link } from 'react-router-dom'

// export default function Messages({ selectedUser }) {
//     useGetRTM();
//     useGetAllMessage();
//     const { messages } = useSelector(store => store.chat);
//     const { user } = useSelector(store => store.auth);
    
//     return (
//         <div className='overflow-y-auto flex-1 p-4 bg-neutral-900 min-h-screen'>
//             <div className='flex justify-center mb-6'>
//                 <div className='flex flex-col items-center justify-center bg-neutral-800 p-6 rounded-2xl shadow-md border border-neutral-700'>
//                     <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-3 ring-2 ring-neutral-600">
//                         <img
//                             src={selectedUser?.profilePicture}
//                             alt="profile"
//                             className="w-full h-full object-cover"
//                         />
//                     </div>
//                     <span className='text-white font-semibold text-lg mb-3'>{selectedUser?.username}</span>
//                     <Link to={`/profile/${selectedUser?._id}`}>
//                         <button className='bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition duration-200 text-sm md:text-base'>
//                             View profile
//                         </button>
//                     </Link>
//                 </div>
//             </div>
            
//             <div className='flex flex-col gap-3 max-w-4xl mx-auto'>
//                 {
//                     messages?.map((msg) => (
//                         <div key={msg._id} className={`flex ${msg.senderId === user._id ? 'justify-end' : 'justify-start'}`}>
//                             <div className={`p-3 rounded-xl max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl shadow-md transition-all duration-200 ${
//                                 msg.senderId === user._id 
//                                     ? 'bg-blue-600 text-white rounded-br-md' 
//                                     : 'bg-neutral-800 text-white border border-neutral-700 rounded-bl-md'
//                             }`}>
//                                 <span className='text-sm md:text-base leading-relaxed'>{msg.message}</span>
//                             </div>
//                         </div>
//                     ))
//                 }
//             </div>
//         </div>
//     )
// }


// import useGetAllMessage from '@/hooks/useGetAllMessage';
// import useGetRTM from '@/hooks/useGetRTM';
// import React from 'react'
// import { useSelector } from 'react-redux'
// import { Link } from 'react-router-dom'

// export default function Messages({ selectedUser }) {
//     useGetRTM();
//     useGetAllMessage();
//     const { messages } = useSelector(store => store.chat);
//     const { user } = useSelector(store => store.auth);
//     return (
//         <div className='overflow-y-auto flex-1 p-4'>
//             <div className='flex justify-center'>
//                 <div className='flex flex-col items-center justify-center'>
//                     <div className="w-20 h-20 rounded-full overflow-hidden">
//                         <img
//                             src={selectedUser?.profilePicture}
//                             alt="profiler"
//                             className="w-full h-full object-cover"
//                         />
//                     </div>
//                     <span>{selectedUser?.username}</span>
//                     <Link to={`/profile/${selectedUser?._id}`}><button className='bg-pink-200 rounded-sm p-1  '>View profile</button></Link>
//                 </div>
//             </div>
//             <div className='flex flex-col gap-3'>
//                 {
//                     messages?.map((msg) => (
//                         <div key={msg._id} className={`flex ${msg.senderId === user._id ? 'justify-end' : 'justify-start'}`}>
//                             <div className={`p-2 rounded-md max-w-xs ${msg.senderId === user._id ? 'bg-pink-300 text-white' : 'bg-gray-300 text-black'}`}>
//                                 {msg.message}
//                             </div>
//                         </div>
//                     ))
//                 }
//             </div>

//         </div>
//     )
// }



