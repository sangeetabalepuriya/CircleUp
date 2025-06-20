import { createSlice } from "@reduxjs/toolkit"

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        suggestedUsers: [],
        userProfile: null,
        selectedUser: null,
    },
    reducers: {
        //actions
        setAuthUser: (state, action) => {
            state.user = action.payload;
        },
        setSuggestedUsers: (state, action) => {
            state.suggestedUsers = action.payload;
        },
        setUserProfile: (state, action) => {
            state.userProfile = action.payload;
        },
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload;
        },
        followUser: (state, action) => {
            const userIdToAdd = action.payload;
            if (!state.user.following.includes(userIdToAdd)) {
                state.user.following.push(userIdToAdd); // <- logged-in user update
            }

            // update userProfile if it matches
            if (state.userProfile && state.userProfile._id === userIdToAdd) {
                if (!state.userProfile.followers.includes(state.user._id)) {
                    state.userProfile.followers.push(state.user._id);
                }
            }
        },

        unfollowUser: (state, action) => {
            const userIdToRemove = action.payload;

            // remove from auth.user.following
            state.user.following = state.user.following.filter(id => id !== userIdToRemove);

            // remove from userProfile.followers
            if (state.userProfile && state.userProfile._id === userIdToRemove) {
                state.userProfile.followers = state.userProfile.followers.filter(id => id !== state.user._id);
            }
        },
        updateBookmark: (state, action) => {
            const { postId, type } = action.payload;
            if (!state.user) return;
        
            // Ensure bookmark array exists
            if (!Array.isArray(state.user.bookmark)) {
                state.user.bookmark = [];
            }
        
            if (type === "add") {
                if (!state.user.bookmark.includes(postId)) {
                    state.user.bookmark.push(postId);
                }
            } else {
                state.user.bookmark = state.user.bookmark.filter(id => id !== postId);
            }
        },
        removeDeletedPostFromProfile: (state, action) => {
            const deletedId = action.payload;
            if (state.userProfile) {
              state.userProfile.posts = state.userProfile.posts.filter(post => post._id !== deletedId);
            }
          },
          addPostToUserProfile: (state, action) => {
            const newPost = action.payload;
            if (state.userProfile && state.userProfile._id === newPost.author._id) {
              state.userProfile.posts.unshift(newPost);
            }
          }
          
          
        
        


    }
});

export const { setAuthUser, setSuggestedUsers, setUserProfile, setSelectedUser, followUser, unfollowUser, updateBookmark, removeDeletedPostFromProfile, addPostToUserProfile } = authSlice.actions;
export default authSlice.reducer;









// import { createSlice } from "@reduxjs/toolkit"

// const authSlice = createSlice({
//     name: "auth",
//     initialState: {
//         user: null,
//         suggestedUsers: [],
//         userProfile: null,
//         selectedUser: null,
//     },
//     reducers: {
//         //actions
//         setAuthUser: (state, action) => {
//             state.user = action.payload;
//         },
//         setSuggestedUsers: (state, action) => {
//             state.suggestedUsers = action.payload;
//         },
//         setUserProfile: (state, action) => {
//             state.userProfile = action.payload;
//         },
//         setSelectedUser: (state, action) => {
//             state.selectedUser = action.payload;
//         },
//         followUser: (state, action) => {
//             const userIdToAdd = action.payload;
//             if (!state.userProfile.followers.includes(userIdToAdd)) {
//                 state.userProfile = {
//                     ...state.userProfile,
//                     followers: [...state.userProfile.followers, userIdToAdd],
//                 };
//             }
//         },
//         unfollowUser: (state, action) => {
//             const userIdToRemove = action.payload;
//             state.userProfile = {
//                 ...state.userProfile,
//                 followers: state.userProfile.followers.filter(id => id !== userIdToRemove),
//             };
//         }

//     }
// });

// export const { setAuthUser, setSuggestedUsers, setUserProfile, setSelectedUser, followUser,unfollowUser } = authSlice.actions;
// export default authSlice.reducer;




// import { createSlice } from "@reduxjs/toolkit"

// const authSlice = createSlice({
//     name: "auth",
//     initialState: {
//         user: null,
//         suggestedUsers: [],
//         userProfile: null,
//         selectedUser: null,
//     },
//     reducers: {
//         //actions
//         setAuthUser: (state, action) => {
//             state.user = action.payload;
//         },
//         setSuggestedUsers: (state, action) => {
//             state.suggestedUsers = action.payload;
//         },
//         setUserProfile: (state, action) => {
//             state.userProfile = action.payload;
//         },
//         setSelectedUser: (state, action) => {
//             state.selectedUser = action.payload;
//         }
//     }
// });

// export const { setAuthUser, setSuggestedUsers, setUserProfile, setSelectedUser } = authSlice.actions;
// export default authSlice.reducer;