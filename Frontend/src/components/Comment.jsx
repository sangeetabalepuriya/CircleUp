import React from 'react';

export default function Comment({ comment }) {
    const author = comment?.author;

    return (
        <div className='my-2'>
            <div className='flex gap-3 items-center'>
                <div className="w-10 h-10 rounded-full overflow-hidden">
                    {author?.profilePicture ? (
                        <img
                            className="w-full h-full object-cover"
                            src={author.profilePicture}
                            alt="user_profile"
                        />
                    ) : (
                        <div className="w-full h-full bg-neutral-700 flex items-center justify-center text-xs text-white">
                            ?
                        </div>
                    )}
                </div>
                <h1 className='font-bold text-sm text-white'>
                    {author?.username || "Unknown"}{" "}
                    <span className='font-normal pl-1 text-white'>{comment?.text}</span>
                </h1>
            </div>
        </div>
    );
}







// import React from 'react'

// export default function Comment({ comment }) {
//     return (
//         <div className='my-2'>
//             <div className='flex gap-3 items-center'>
//                 <div className="w-10 h-10 rounded-full overflow-hidden">
//                     <img
//                         className="w-full h-full object-cover"
//                         src={comment?.author?.profilePicture}
//                         alt="user_profile"
//                     />
//                 </div>
//                 <h1 className='font-bold text-sm text-white'>{comment?.author.username} <span className='font-normal pl-1 text-white'>{comment?.text}</span></h1>
//             </div>

//         </div>
//     )
// }
