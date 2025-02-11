import { createSlice } from '@reduxjs/toolkit';

const polydiceSlice = createSlice({
  name: 'polydice',
  initialState: {
    activeDice: 20,
    polydiceMode: 'normal', // normal/hp/stats
  },
  reducers: {
    setPolydiceMode: (state, action) => { state.polydiceMode = action.payload; },
    setActiveDice: (state, action) => {  state.activeDice = action.payload; }, 
  }
});

export const { setPolydiceMode, setActiveDice } = polydiceSlice.actions;
  
export default polydiceSlice.reducer;
