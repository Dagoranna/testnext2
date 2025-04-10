import { createSlice } from "@reduxjs/toolkit";

const gameTableSlice = createSlice({
  name: "gameTable",
  initialState: {
    combatants: [],
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
      state.combatants = state.combatants.splice(index, 1);
    },
    sortCombatants: (state, action) => {
      state.combatants.sort((a, b) => parseInt(b.init) - parseInt(a.init));
    },
    setCombatants: (state, action) => {
      state.combatants = structuredClone(action.payload);
    },
  },
});

export const {
  addCombatant,
  changeCombatant,
  removeCombatant,
  sortCombatants,
  setCombatants,
} = gameTableSlice.actions;

export default gameTableSlice.reducer;
