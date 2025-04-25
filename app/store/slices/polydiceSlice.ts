import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const polydiceSlice = createSlice({
  name: "polydice",
  initialState: {
    activeDice: 20,
    polydiceMode: "normal",
  },
  reducers: {
    setPolydiceMode: (state, action: PayloadAction<string>) => {
      state.polydiceMode = action.payload;
    },
    setActiveDice: (state, action: PayloadAction<number>) => {
      state.activeDice = action.payload;
    },
  },
});

export const { setPolydiceMode, setActiveDice } = polydiceSlice.actions;

export default polydiceSlice.reducer;
