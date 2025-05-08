import { configureStore } from "@reduxjs/toolkit";
import mainReducer from "./slices/mainSlice";
import polydiceReducer from "./slices/polydiceSlice";
import websocketReducer from "./slices/websocketSlice";
import mapReducer from "./slices/mapSlice";
import charsheetReducer from "./slices/charsheetSlice";
import gameTableReducer from "./slices/gameTableSlice";
import globalMapReducer from "./slices/globalMapSlice";

export const store = configureStore({
  reducer: {
    main: mainReducer,
    websocket: websocketReducer,
    polydice: polydiceReducer,
    map: mapReducer,
    charsheet: charsheetReducer,
    gameTable: gameTableReducer,
    globalMap: globalMapReducer,
  },
});

// `RootState` and `AppDispatch` types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
