import { createSlice } from "@reduxjs/toolkit";

const mainSlice = createSlice({
  name: "mainState",
  initialState: {
    loginState: false,
    userEmail: "",
    userName: "Stranger",
    userColor: "#8e5a1f",
    userRole: "Gamer",
    winList: {
      Gamer: ["Game Map", "Polydice", "Charsheet"],
      Master: ["Game Map", "Polydice", "Game Table"],
    },
    layout: [
      { i: "Game Map", x: 0, y: 0, w: 5, h: 15, minH: 20, minW: 4 },
      { i: "Polydice", x: 0, y: 0, w: 5, h: 15, minH: 20, minW: 4 },
    ],
  },
  reducers: {
    setLoginState: (state, action) => {
      state.loginState = action.payload;
    },
    setUserEmail: (state, action) => {
      state.userEmail = action.payload;
    },
    setUserName: (state, action) => {
      state.userName = action.payload;
    },
    setUserColor: (state, action) => {
      state.userColor = action.payload;
    },
    setUserRole: (state, action) => {
      state.userRole = action.payload;
    },
    setWinList: (state, action) => {
      state.winList = action.payload;
    },
    setLayout: (state, action) => {
      state.layout = action.payload;
    },
  },
});

export const {
  setLoginState,
  setUserEmail,
  setUserName,
  setUserColor,
  setUserRole,
  setWinList,
  setLayout,
} = mainSlice.actions;

export default mainSlice.reducer;
