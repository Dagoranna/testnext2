import { createSlice } from '@reduxjs/toolkit';

const mapSlice = createSlice({
  name: 'map',
  initialState: {
    mapState: '',
  },
  reducers: {
    setMapState: (state, action) => { state.mapState = action.payload; },
  }
});

export const { setMapState } = mapSlice.actions;
  
export default mapSlice.reducer;
