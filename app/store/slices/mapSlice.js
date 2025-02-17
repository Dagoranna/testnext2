import { createSlice } from '@reduxjs/toolkit';

const mapSlice = createSlice({
  name: 'map',
  initialState: {
    mapState: {},
    mapElemsCounter: 0,
    activeElemId: null,
    activePaletteStyle: {
      "color": "transparent",
      "textColor": "black",
    },
  },
  reducers: {
    setMapState: (state, action) => { state.mapState = JSON.parse(JSON.stringify(action.payload)) },
    addElemToMap: (state, action) => { 
      const childKey = Object.keys(action.payload)[0];
      state.mapState[childKey] = JSON.parse(JSON.stringify(action.payload[childKey]));
    },
    removeElemFromMap: (state, action) => {
      delete state.mapState[action.payload];
    },

    setMapElemsCounter: (state, action) => { state.mapElemsCounter = action.payload; },
    incMapElemsCounter: (state) => { state.mapElemsCounter++; },

    setActiveElemId: (state, action) => {state.activeElemId = action.payload; },
    setActivePaletteStyle: (state, action) => {state.activePaletteStyle = action.payload; },
    setActivePaletteColor: (state, action) => {state.activePaletteStyle.color = action.payload; },
    setActivePaletteTextColor: (state, action) => {state.activePaletteStyle.textColor = action.payload; },
    setActivePaletteLayer: (state, action) => {state.activePaletteStyle.layer = action.payload; },
  }
});

export const { setMapState, addElemToMap, removeElemFromMap, 
  setMapElemsCounter, incMapElemsCounter, 
  setActiveElemId, 
  setActivePaletteStyle, setActivePaletteColor, setActivePaletteTextColor, setActivePaletteLayer } = mapSlice.actions;
  
export default mapSlice.reducer;