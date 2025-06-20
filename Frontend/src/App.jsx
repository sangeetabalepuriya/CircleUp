import React, { useEffect } from 'react'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SignUp from './components/SignUp';
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from './components/Home';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
import ChatPage from './components/ChatPage';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { setSocket } from './redux/socketSlice';
import { setOnLineUsers } from './redux/chatSlice';
import { setLikeNotification } from './redux/rtnSlice';
import { setPosts } from './redux/postSlice';
import ProtectedRoutes from './components/ProtectedRoutes';
import ForgotPassword from './components/ForgotPassword';


export default function App() {

  const { user } = useSelector(store => store.auth);
  const posts = useSelector(store => store.post.posts);
  const { socket } = useSelector(store => store.socketio);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      const socketio = io("http://localhost:5500", {
        query: {
          userId: user?._id
        },
        transports: ["websocket"]
      });
      dispatch(setSocket(socketio));

      //listen all the events
      socketio.on("getOnlineUsers", (onLineUsers) => {
        dispatch(setOnLineUsers(onLineUsers))
      });

      socketio.on("notification", (notification) => {
        dispatch(setLikeNotification(notification));
      });

      // ✅ NEW: Handle postDeleted
      socketio.on("postDeleted", (deletedPostId) => {
        // Remove from home feed
        dispatch(setPosts(
          posts.filter(p => p._id !== deletedPostId)
        ));

        // 🔥 Remove from profile posts if loaded
        dispatch({
          type: "auth/removeDeletedPostFromProfile",
          payload: deletedPostId,
        });
      });

      socketio.on("postCreated", (newPost) => {
        dispatch(setPosts([newPost, ...posts])); // Add to feed

        dispatch({
          type: "auth/addPostToUserProfile",
          payload: newPost, // Add to profile if it's this user's post
        });
      });





      return () => {
        socketio.close();
        dispatch(setSocket(null));
      }
    } else if (socket) {
      socket?.close();
      dispatch(setSocket(null));
    }
  }, [user, dispatch])

  return (
    <BrowserRouter>



<ToastContainer
  position="bottom-center"
  autoClose={2500}
  hideProgressBar={true}
  closeOnClick
  pauseOnFocusLoss
  draggable
  theme="light"
  toastStyle={{
    background: "#262626", // Tailwind's neutral-800
    color: "white",
    border: "1px solid #404040", // Tailwind's neutral-700
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
    fontSize: "14px",
    padding: "10px 16px 10px 16px",
    width: "fit-content",
    borderRadius: "8px",
    position: "relative", // to allow absolute close button
  }}
  icon={false}
/>




{/* <ToastContainer
  position="bottom-center"
  autoClose={2500}
  hideProgressBar={true}
  closeOnClick
  pauseOnFocusLoss
  draggable
  theme="light"
  toastStyle={{
    background: "#262626", // neutral-800 (Tailwind equivalent)
    color: "white",
    border: "1px solid #404040", // neutral-700
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
    fontSize: "14px",
    padding: "6px 20px",
    width: "fit-content",
    borderRadius: "8px",
  }}
  icon={false}
/> */}


      {/* <ToastContainer
        position="bottom-center"
        autoClose={2500}
        hideProgressBar={true}
        closeOnClick
        pauseOnFocusLoss
        draggable
        theme="light"
        toastStyle={{
          background: "white",
          color: "black",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
          fontSize: "14px",
          padding: "1px 20px",
          width: "fit-content",
          borderRadius: "8px"
        }}
        icon={false}
      /> */}

      {user && <Navbar />}
      <Routes>

        <Route path='/' element={<ProtectedRoutes><Home /></ProtectedRoutes>} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/login' element={<Login />} />
        <Route path='/profile/:id' element={<ProtectedRoutes><Profile /></ProtectedRoutes>} />
        <Route path='/account/edit' element={<ProtectedRoutes><EditProfile /></ProtectedRoutes>} />
        <Route path='/chat' element={<ProtectedRoutes><ChatPage /></ProtectedRoutes>} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />

      </Routes>

    </BrowserRouter>


  )
}




// import React, { useEffect } from 'react'
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import SignUp from './components/SignUp';
// import { BrowserRouter, Routes, Route } from "react-router-dom"
// import Home from './components/Home';
// import Navbar from './components/Navbar';
// import Login from './components/Login';
// import Profile from './components/Profile';
// import EditProfile from './components/EditProfile';
// import ChatPage from './components/ChatPage';
// import { io } from 'socket.io-client';
// import { useDispatch, useSelector } from 'react-redux';
// import { setSocket } from './redux/socketSlice';
// import { setOnLineUsers } from './redux/chatSlice';
// import { setLikeNotification } from './redux/rtnSlice';
// import ProtectedRoutes from './components/ProtectedRoutes';


// export default function App() {

//   const { user } = useSelector(store => store.auth);
//   const { socket } = useSelector(store => store.socketio);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     if (user) {
//       const socketio = io("http://localhost:5500", {
//         query: {
//           userId: user?._id
//         },
//         transports: ["websocket"]
//       });
//       dispatch(setSocket(socketio));

//       //listen all the events
//       socketio.on("getOnLineUsers", (onLineUsers) => {
//         dispatch(setOnLineUsers(onLineUsers))
//       });

//       socketio.on("notification", (notification) => {
//         dispatch(setLikeNotification(notification));
//       })

//       return () => {
//         socketio.close();
//         dispatch(setSocket(null));
//       }
//     } else if (socket) {
//       socket?.close();
//       dispatch(setSocket(null));
//     }
//   }, [user, dispatch])

//   return (
//     <BrowserRouter>


//       <ToastContainer
//         position="bottom-center"
//         autoClose={2500}
//         hideProgressBar={true}
//         closeOnClick
//         pauseOnFocusLoss
//         draggable
//         theme="light"
//         toastStyle={{
//           background: "white",
//           color: "black",
//           boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
//           fontSize: "14px",
//           padding: "1px 20px",
//           width: "fit-content",
//           borderRadius: "8px"
//         }}
//         icon={false}
//       />

//       {user && <Navbar />}
//       <Routes>

//         <Route path='/' element={<ProtectedRoutes><Home /></ProtectedRoutes>} />
//         <Route path='/signup' element={<SignUp />} />
//         <Route path='/login' element={<Login />} />
//         <Route path='/profile/:id' element={<ProtectedRoutes><Profile /></ProtectedRoutes>} />
//         <Route path='/account/edit' element={<ProtectedRoutes><EditProfile /></ProtectedRoutes>} />
//         <Route path='/chat' element={<ProtectedRoutes><ChatPage /></ProtectedRoutes>} />

//       </Routes>

//     </BrowserRouter>


//   )
// }

