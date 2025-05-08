import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export type ActivePaletteAction = "brush" | "arrow" | "rotate" | "text" | null;

const FORMS_LIST: Record<string, Record<string, string | number>> = {
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
    boxShadow: "aliceblue 1px 1px 2px inset, black -1px -1px 2px inset",
  },
  elemForm_4: {
    borderRadius: "15%",
    boxShadow: "aliceblue 1px 1px 2px inset, black -1px -1px 2px inset",
  },
  elemForm_5: {
    borderRadius: "50%",
    boxShadow: "aliceblue 1px 1px 2px inset, black -1px -1px 2px inset",
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
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  elemForm_13: {
    borderWidth: "2px",
    borderColor: "#404040",
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },

  elemForm_14: {
    borderWidth: "2px",
    borderColor: "#404040",
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  elemForm_15: {
    borderWidth: "2px",
    borderColor: "#404040",
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  elemForm_16: {
    borderWidth: "2px",
    borderColor: "#404040",
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  elemForm_17: {
    borderWidth: "2px",
    borderColor: "#404040",
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  elemForm_18: {
    borderWidth: "0",
    background: "url('/images/mapforms/tree.webp')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
  },
  elemForm_19: {
    borderWidth: "0",
    background: "url('/images/mapforms/bush.webp')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
  },
};

type PaletteForm = keyof typeof FORMS_LIST;

export type Layer = "top" | "middle" | "bottom";

interface ActivePaletteStyle {
  color: string;
  textColor: string;
  form: string;
  layer: Layer;
  bindToGrid: boolean;
}

interface MapState {
  mapContent: string[];
  mapElemsCounter: number;
  activePaletteAction: ActivePaletteAction;
  activeElemId: string | null;
  activePaletteStyle: ActivePaletteStyle;
  selectedObjectsId: string[];
  elemFromLib: string | null;
}

const initialState: MapState = {
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
};

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    addElemToMap: (state, action: PayloadAction<string>) => {
      state.mapContent.push(action.payload);
    },
    changeElemOnMap: (state, action: PayloadAction<string>) => {
      const regex = /id="mapElem_([^"]*)"/;
      let match = action.payload.match(regex);
      let currentElemId = match ? `id="mapElem_${match[1]}"` : null;

      let currentElemIndex = state.mapContent.findIndex((item) =>
        item.includes(currentElemId)
      );

      state.mapContent[currentElemIndex] = action.payload;
    },
    removeElemFromMap: (state, action: PayloadAction<string>) => {
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

    setMapElemsCounter: (state, action: PayloadAction<number>) => {
      state.mapElemsCounter = action.payload;
    },
    incMapElemsCounter: (state) => {
      state.mapElemsCounter++;
    },

    setActivePaletteAction: (
      state,
      action: PayloadAction<ActivePaletteAction>
    ) => {
      state.activePaletteAction = action.payload;
    },
    setActiveElemId: (state, action: PayloadAction<string>) => {
      state.activeElemId = action.payload;
    },
    setActivePaletteStyle: (
      state,
      action: PayloadAction<ActivePaletteStyle>
    ) => {
      state.activePaletteStyle = action.payload;
    },
    setActivePaletteColor: (state, action: PayloadAction<string>) => {
      state.activePaletteStyle.color = action.payload;
    },
    setActivePaletteLayer: (state, action: PayloadAction<Layer>) => {
      state.activePaletteStyle.layer = action.payload;
    },
    setActivePaletteForm: (state, action: PayloadAction<PaletteForm>) => {
      state.activePaletteStyle.form = action.payload;
    },
    switchGridBinding: (state) => {
      state.activePaletteStyle.bindToGrid =
        !state.activePaletteStyle.bindToGrid;
    },
    setSelectedObjectsId: (state, action: PayloadAction<string[]>) => {
      state.selectedObjectsId = [...action.payload];
    },
    setElemFromLib: (state, action: PayloadAction<string | null>) => {
      state.elemFromLib = action.payload;
    },
    loadMapContent: (state, action: PayloadAction<string[]>) => {
      state.mapContent = action.payload;
    },
  },
});

export const {
  addElemToMap,
  changeElemOnMap,
  removeElemFromMap,
  setMapElemsCounter,
  incMapElemsCounter,
  setActivePaletteAction,
  setActiveElemId,
  setActivePaletteStyle,
  setActivePaletteColor,
  setActivePaletteLayer,
  setActivePaletteForm,
  switchGridBinding,
  setSelectedObjectsId,
  setElemFromLib,
  loadMapContent,
} = mapSlice.actions;

export { FORMS_LIST };
export default mapSlice.reducer;
