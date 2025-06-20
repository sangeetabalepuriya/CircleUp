import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        onLineUsers: [],
        messages: [],
    },
    reducers: {
        //actions
        setOnLineUsers: (state, action) => {
            state.onLineUsers = action.payload;
        },
        setMessages: (state, action) => {
            state.messages = action.payload;
        }
    }
});

export const { setOnLineUsers, setMessages } = chatSlice.actions;
export default chatSlice.reducer;