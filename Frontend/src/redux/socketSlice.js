import { createSlice } from "@reduxjs/toolkit";

const socketSlic = createSlice({
    name: "socketio",
    initialState: {
        socket: null
    },
    reducers: {
        //actions
        setSocket: (state, action) => {
            state.socket = action.payload;
        }
    }
});

export const { setSocket } = socketSlic.actions;
export default socketSlic.reducer;