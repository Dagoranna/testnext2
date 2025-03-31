import { createSlice } from "@reduxjs/toolkit";

const websocketSlice = createSlice({
  name: "websocket",
  initialState: {
    connectionState: 3, // 0 - CONNECTING, 1 - OPEN, 2 - CLOSING, 3 - CLOSED
    requiredState: false,
    serverMessage: "",
    gameId: 0,
    DMName: null,
  },
  reducers: {
    setConnectionState: (state, action) => {
      state.connectionState = action.payload;
    },
    setServerMessage: (state, action) => {
      state.serverMessage = action.payload;
    },
    setRequiredState: (state, action) => {
      state.requiredState = action.payload;
    },
    setGameId: (state, action) => {
      state.gameId = action.payload;
    },
    setDMName: (state, action) => {
      state.DMName = action.payload;
    },
  },
});

let socket = null;

export const manageWebsocket =
  (actionType, url, message = "") =>
  (dispatch, getState) => {
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
            console.log("message on open connection");
            console.log(message);
            socket.send(message);
          } else {
            console.log("empty message error!");
          }
        };
        socket.onmessage = (event) => {
          //console.log("message from server: " + event.data);
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
          socket.send(message);
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
