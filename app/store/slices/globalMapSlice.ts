import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import L from "leaflet";

export interface LatLng {
  lat: number;
  lng: number;
}

interface globalMapState {
  points: LatLng[];
  routeLength: number;
}

const initialState: globalMapState = {
  points: [],
  routeLength: 0,
};

const globalMapSlice = createSlice({
  name: "globalMap",
  initialState,
  reducers: {
    addPoint: (state, action: PayloadAction<LatLng>) => {
      state.points.push(action.payload);
    },
    setPointsArray: (state, action: PayloadAction<LatLng[]>) => {
      state.points = [...action.payload];
    },
    setRouteLength: (state, action: PayloadAction<number>) => {
      state.routeLength = action.payload;
    },
  },
});

export const { addPoint, setPointsArray, setRouteLength } =
  globalMapSlice.actions;

export default globalMapSlice.reducer;
