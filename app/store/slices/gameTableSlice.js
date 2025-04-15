import { createSlice } from "@reduxjs/toolkit";

const gameTableSlice = createSlice({
  name: "gameTable",
  initialState: {
    combatants: [],
    mobId: 0,
  },
  reducers: {
    addCombatant: (state, action) => {
      //action.payload = {id: ***, name: ***, hp: ***, dam: ***, init: ***}
      state.combatants.push(action.payload);
    },
    changeCombatant: (state, action) => {
      //action.payload = {id: ***, name: ***, hp: ***, dam: ***, init: ***}
      const id = action.payload.id;
      const index = state.combatants.findIndex((item) => item.id == id);
      if (index !== -1) {
        state.combatants[index] = action.payload;
      }
    },
    removeCombatant: (state, action) => {
      //action.payload = id
      const id = action.payload;
      const index = state.combatants.findIndex((item) => item.id == id);
      state.combatants.splice(index, 1);
    },
    sortCombatants: (state, action) => {
      state.combatants.sort((a, b) => parseInt(b.init) - parseInt(a.init));
    },
    loadCombatants: (state, action) => {
      return JSON.parse(action.payload);
    },
    setMobId: (state, action) => {
      state.mobId = action.payload;
    },
    incMobId: (state, action) => {
      state.mobId = state.mobId + 1;
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
} = gameTableSlice.actions;

export default gameTableSlice.reducer;
