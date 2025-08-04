import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Combatant {
  id: number;
  name: string;
  hp: number;
  dam: number;
  init: number;
}

export interface TableState {
  combatants: Combatant[];
  mobId: number;
  gameNotices: String;
}

const initialState: TableState = {
  combatants: [],
  mobId: 0,
  gameNotices: "Game notices: \n",
};

const gameTableSlice = createSlice({
  name: "gameTable",
  initialState,
  reducers: {
    addCombatant: (state, action: PayloadAction<Combatant>) => {
      state.combatants.push(action.payload);
    },
    changeCombatant: (state, action: PayloadAction<Combatant>) => {
      const id = action.payload.id;
      const index = state.combatants.findIndex((item) => item.id == id);
      if (index !== -1) {
        state.combatants[index] = action.payload;
      }
    },
    removeCombatant: (state, action: PayloadAction<number>) => {
      //action.payload = id
      const id = action.payload;
      const index = state.combatants.findIndex((item) => item.id == id);
      state.combatants.splice(index, 1);
    },
    sortCombatants: (state) => {
      state.combatants.sort((a, b) => b.init - a.init);
    },
    loadCombatants: (state, action: PayloadAction<string>) => {
      return JSON.parse(action.payload);
    },
    setMobId: (state, action: PayloadAction<number>) => {
      state.mobId = action.payload;
    },
    incMobId: (state) => {
      state.mobId = state.mobId + 1;
    },
    changeGameNotices: (state, action: PayloadAction<string>) => {
      state.gameNotices = action.payload;
    },
  },
});

export const {
  addCombatant,
  changeCombatant,
  removeCombatant,
  sortCombatants,
  loadCombatants,
  setMobId,
  incMobId,
  changeGameNotices,
} = gameTableSlice.actions;

export default gameTableSlice.reducer;
