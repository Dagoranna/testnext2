import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface LayoutLine {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minH?: number;
}

export type UserRole = "Gamer" | "Master";

interface MyMainState {
  loginState: boolean;
  userEmail: string;
  userName: string;
  userColor: string;
  userRole: UserRole;
  winList: Record<UserRole, string[]>;
  layout: LayoutLine[];
  connectionTitle: string;
}

const initialState: MyMainState = {
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
    { i: "Game Map", x: 0, y: 0, w: 5, h: 15, minH: 15 },
    { i: "Polydice", x: 0, y: 0, w: 5, h: 15, minH: 15 },
  ],
  connectionTitle: "Connect",
};

const mainSlice = createSlice({
  name: "mainState",
  initialState,
  reducers: {
    setLoginState: (state, action: PayloadAction<boolean>) => {
      state.loginState = action.payload;
    },
    setUserEmail: (state, action: PayloadAction<string>) => {
      state.userEmail = action.payload;
    },
    setUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload;
    },
    setUserColor: (state, action: PayloadAction<string>) => {
      state.userColor = action.payload;
    },
    setUserRole: (state, action: PayloadAction<UserRole>) => {
      state.userRole = action.payload;
    },
    setWinList: (state, action: PayloadAction<Record<UserRole, string[]>>) => {
      state.winList = action.payload;
    },
    setLayout: (state, action: PayloadAction<LayoutLine[]>) => {
      state.layout = action.payload;
    },
    setConnectionTitle: (state, action: PayloadAction<string>) => {
      state.connectionTitle = action.payload;
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
  setConnectionTitle,
} = mainSlice.actions;

export default mainSlice.reducer;
