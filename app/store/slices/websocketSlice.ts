import { createSlice, PayloadAction, ThunkAction } from "@reduxjs/toolkit";
import { AnyAction } from "redux";
import type { AppDispatch, RootState } from "../store";

export type SectionName =
  | "connection"
  | "choosemaster"
  | "games"
  | "polydice"
  | "chat"
  | "gameMap"
  | "globalMap";

export interface MessageForServer {
  gameId?: string | null;
  user: {
    userRole: "Gamer" | "Master";
    userName: string;
    userColor: string;
    userEmail?: string;
  };
  sectionName: SectionName;
  sectionInfo?: Record<string, string | number>;
}

const websocketSlice = createSlice({
  name: "websocket",
  initialState: {
    connectionState: 3 as 0 | 1 | 2 | 3,
    requiredState: false,
    serverMessage: "",
    gameId: null,
    DMName: null as string | null,
  },
  reducers: {
    setConnectionState: (state, action: PayloadAction<0 | 1 | 2 | 3>) => {
      state.connectionState = action.payload;
    },
    setRequiredState: (state, action: PayloadAction<boolean>) => {
      state.requiredState = action.payload;
    },
    setServerMessage: (state, action: PayloadAction<string>) => {
      state.serverMessage = action.payload;
    },
    setGameId: (state, action: PayloadAction<string>) => {
      state.gameId = action.payload;
    },
    setDMName: (state, action: PayloadAction<string | null>) => {
      state.DMName = action.payload;
    },
  },
});

let socket: WebSocket | null = null;

export const manageWebsocket =
  (
    actionType: "connect" | "disconnect" | "send",
    url: string,
    message?: MessageForServer
  ): ThunkAction<void, RootState, unknown, AnyAction> =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    switch (actionType) {
      case "connect":
        dispatch(setRequiredState(true));
        if (socket) {
          if (socket.readyState !== 3) {
            return;
          }
        }
        socket = new WebSocket(url);
        dispatch(setConnectionState(0));

        socket.onopen = () => {
          dispatch(setConnectionState(1));
          if (message) {
            socket.send(JSON.stringify(message));
          } else {
            console.log("empty message error!");
          }
        };
        socket.onmessage = (event: MessageEvent) => {
          dispatch(setServerMessage(event.data));
        };
        socket.onclose = () => {
          dispatch(setConnectionState(3));
          if (getState().websocket.requiredState) {
            setTimeout(
              () => dispatch(manageWebsocket("connect", url, message)),
              2000
            );
          } else {
            console.log("requiredState = false");
          }
        };
        socket.onerror = () => {
          socket.close();
        };

        break;
      case "disconnect":
        dispatch(setRequiredState(false));
        if (socket) {
          socket.close();
          socket = null;
        }
        dispatch(setConnectionState(3));
        break;
      case "send":
        const currentState = getState().websocket.connectionState;
        if (currentState === 1) {
          socket.send(JSON.stringify(message));
        } else {
          console.log("socket is not ready. State: " + currentState);
        }
        break;
      default:
        console.log("Unknown action type:", actionType);
    }
  };

export const {
  setConnectionState,
  setServerMessage,
  setRequiredState,
  setGameId,
  setDMName,
} = websocketSlice.actions;
export default websocketSlice.reducer;
