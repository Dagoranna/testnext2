import { createSlice } from "@reduxjs/toolkit";

const charsheetSlice = createSlice({
  name: "charsheet",
  initialState: {
    activeBookmark: "Main",
  },
  reducers: {
    setActiveBookmark: (state, action) => {
      state.activeBookmark = action.payload;
    },
  },
});

export const { setActiveBookmark } = charsheetSlice.actions;

export default charsheetSlice.reducer;
