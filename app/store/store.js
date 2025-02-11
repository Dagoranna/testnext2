import { configureStore } from '@reduxjs/toolkit';
import mainReducer from './slices/mainSlice';
import polydiceReducer from './slices/polydiceSlice';
import websocketReducer from './slices/websocketSlice';

export const store = configureStore({
  reducer: {
    main: mainReducer,
    websocket: websocketReducer, 
    polydice: polydiceReducer, 
  },
});