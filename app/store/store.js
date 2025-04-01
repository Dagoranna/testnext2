import { configureStore } from "@reduxjs/toolkit";
import mainReducer from "./slices/mainSlice";
import polydiceReducer from "./slices/polydiceSlice";
import websocketReducer from "./slices/websocketSlice";
import mapReducer from "./slices/mapSlice";
import charsheetReducer from "./slices/charsheetSlice";

export const store = configureStore({
  reducer: {
    main: mainReducer,
    websocket: websocketReducer,
    polydice: polydiceReducer,
    map: mapReducer,
    charsheet: charsheetReducer,
  },
});
