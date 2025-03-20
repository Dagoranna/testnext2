import { createSlice } from "@reduxjs/toolkit";

const FORMS_LIST = {
  elemForm_0: {
    borderRadius: "0",
    borderWidth: "2px",
    borderColor: "#404040",
  },
  elemForm_1: {
    borderRadius: "15%",
    borderWidth: "2px",
    borderColor: "#404040",
  },
  elemForm_2: {
    borderRadius: "50%",
    borderWidth: "2px",
    borderColor: "#404040",
  },
  elemForm_3: {
    borderRadius: "0",
    boxShadow: "2px 2px 3px aliceblue inset, -2px -2px 3px black inset",
  },
  elemForm_4: {
    borderRadius: "15%",
    boxShadow: "2px 2px 3px aliceblue inset, -2px -2px 3px black inset",
  },
  elemForm_5: {
    borderRadius: "50%",
    boxShadow: "2px 2px 3px aliceblue inset, -2px -2px 3px black inset",
  },
  elemForm_6: {
    borderRadius: "0",
    background: "linear-gradient(0deg, darkgray 0px, black 10px)",
    backgroundRepeat: "repeat-y",
    backgroundSize: "100% 10px",
  },
  elemForm_7: {
    borderRadius: "0",
    background: "linear-gradient(90deg, darkgray 0px, black 10px)",
    backgroundRepeat: "repeat-x",
    backgroundSize: "10px 100%",
  },
  elemForm_8: {
    borderRadius: "50%",
    background:
      "conic-gradient(black 0deg, darkgray 45deg, black 45deg, darkgray 90deg, black 90deg, darkgray 135deg, black 135deg, darkgray 180deg, black 180deg, darkgray 225deg, black 225deg, darkgray 270deg, black 270deg, darkgray 315deg, black 315deg, darkgray 360deg)",
  },
  elemForm_9: {
    borderRadius: "0",
    opacity: "0.5",
  },
  elemForm_10: {
    borderRadius: "15%",
    opacity: "0.5",
  },
  elemForm_11: {
    borderRadius: "50%",
    opacity: "0.5",
  },
  elemForm_12: {
    borderWidth: "2px",
    borderColor: "#404040",
    borderLeft: "none",
    borderRight: "none",
  },
  elemForm_13: {
    borderWidth: "2px",
    borderColor: "#404040",
    borderTop: "none",
    borderBottom: "none",
  },

  elemForm_14: {
    borderWidth: "2px",
    borderColor: "#404040",
    borderTop: "none",
    borderLeft: "none",
  },
  elemForm_15: {
    borderWidth: "2px",
    borderColor: "#404040",
    borderTop: "none",
    borderRight: "none",
  },
  elemForm_16: {
    borderWidth: "2px",
    borderColor: "#404040",
    borderLeft: "none",
    borderBottom: "none",
  },
  elemForm_17: {
    borderWidth: "2px",
    borderColor: "#404040",
    borderRight: "none",
    borderBottom: "none",
  },
};

const mapSlice = createSlice({
  name: "map",
  initialState: {
    mapContent: [],
    mapElemsCounter: 0,
    activePaletteAction: null,
    activeElemId: null,
    activePaletteStyle: {
      color: "transparent",
      textColor: "black",
      form: "elemForm_0",
      layer: "top",
      bindToGrid: true,
    },
    selectedObjectsId: [],
    elemFromLib: null,
  },
  reducers: {
    setMapContent: (state, action) => {
      state.mapContent = JSON.parse(JSON.stringify(action.payload));
    },
    addElemToMap: (state, action) => {
      state.mapContent.push(action.payload);
    },
    changeElemOnMap: (state, action) => {
      const regex = /id="mapElem_([^"]*)"/;
      let match = action.payload.match(regex);
      let currentElemId = match ? `id="mapElem_${match[1]}"` : null;

      let currentElemIndex = state.mapContent.findIndex((item) =>
        item.includes(currentElemId)
      );

      state.mapContent[currentElemIndex] = action.payload;
    },
    removeElemFromMap: (state, action) => {
      const regex = /id="mapElem_([^"]*)"/;
      let match = action.payload.match(regex);
      let currentElemId = match ? `id="mapElem_${match[1]}"` : null;

      let currentElemIndex = state.mapContent.findIndex((item) =>
        item.includes(currentElemId)
      );

      if (currentElemIndex !== -1) {
        state.mapContent.splice(currentElemIndex, 1);
      }
    },

    setMapElemsCounter: (state, action) => {
      state.mapElemsCounter = action.payload;
    },
    incMapElemsCounter: (state) => {
      state.mapElemsCounter++;
    },

    setActivePaletteAction: (state, action) => {
      state.activePaletteAction = action.payload;
    },
    setActiveElemId: (state, action) => {
      state.activeElemId = action.payload;
    },
    setActivePaletteStyle: (state, action) => {
      state.activePaletteStyle = action.payload;
    },
    setActivePaletteColor: (state, action) => {
      state.activePaletteStyle.color = action.payload;
    },
    setActivePaletteTextColor: (state, action) => {
      state.activePaletteStyle.textColor = action.payload;
    },
    setActivePaletteLayer: (state, action) => {
      state.activePaletteStyle.layer = action.payload;
    },
    setActivePaletteForm: (state, action) => {
      state.activePaletteStyle.form = action.payload;
    },
    switchGridBinding: (state, action) => {
      state.activePaletteStyle.bindToGrid =
        !state.activePaletteStyle.bindToGrid;
    },
    setSelectedObjectsId: (state, action) => {
      state.selectedObjectsId = [...action.payload];
    },
    setElemFromLib: (state, action) => {
      state.elemFromLib = action.payload;
    },
  },
});

export const {
  setMapContent,
  addElemToMap,
  changeElemOnMap,
  removeElemFromMap,
  setMapElemsCounter,
  incMapElemsCounter,
  setActivePaletteAction,
  setActiveElemId,
  setActivePaletteStyle,
  setActivePaletteColor,
  setActivePaletteTextColor,
  setActivePaletteLayer,
  setActivePaletteForm,
  switchGridBinding,
  setSelectedObjectsId,
  setElemFromLib,
} = mapSlice.actions;

export { FORMS_LIST };
export default mapSlice.reducer;
