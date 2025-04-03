import { createSlice } from "@reduxjs/toolkit";

const charsheetSlice = createSlice({
  name: "charsheet",
  initialState: {
    activeBookmark: "Main",
    stats: {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 12,
      cha: 10,
    },
    main: {
      name: "Character Name",
      classlvl: "Classes & lvls",
      exp: 0,
      speed: 30,
      att: 0,
      dam: "",
      ac: 0,
      hp: 0,
      init: 0,
    },
    descr: {
      player: "Player",
      race: "race",
      alignment: "alignment",
      deity: "deity",
      size: "medium",
      age: 0,
      gender: "gender",
      height: "height",
      weight: "weight",
      eyes: "eyes color",
      hair: "hair color & style",
      skin: "skin color & style",
    },
    saves: {
      fort: {
        res: 0,
        base: 0,
        stat: "con",
        magic: 0,
        other: 0,
      },
      ref: {
        res: 0,
        base: 0,
        stat: "dex",
        magic: 0,
        other: 0,
      },
      will: {
        res: 8,
        base: 2,
        stat: "wis",
        magic: 1,
        other: 4,
      },
    },
    skillRanks: {
      Appraise: 0,
      Balance: 0,
      Bluff: 0,
      Climb: 0,
      Concentration: 0,
      Craft: 0,
      "Decipher Script": 0,
      Diplomacy: 0,
      "Disable Device": 0,
      Disguise: 0,
      "Escape Artist": 0,
      Forgery: 0,
      "Gather Information": 0,
      "Handle Animal": 0,
      Heal: 0,
      Hide: 0,
      Intimidate: 0,
      Jump: 0,
      "Knowledge(arcana)": 0,
      "Knowledge (R&N)": 0,
      "Knowledge(religion)": 0,
      "Knowledge(history)": 0,
      "Knowledge(planes)": 0,
      Knowledge: 0,
      Listen: 0,
      "Move Silently": 0,
      "Open Lock": 0,
      Perform: 0,
      Profession: 0,
      Ride: 0,
      Search: 0,
      "Sense Motive": 0,
      "Sleight of Hand": 0,
      Spellcraft: 0,
      Spot: 0,
      Survival: 0,
      Swim: 0,
      Tumble: 0,
      "Use Magic Device": 0,
      "Use Rope": 0,
    },
    skillBonus: {
      Appraise: [0, "Int"],
      Balance: [0, "Dex"],
      Bluff: [0, "Cha"],
      Climb: [0, "Str"],
      Concentration: [0, "Con"],
      Craft: [0, "Int"],
      "Decipher Script": [0, "Int"],
      Diplomacy: [0, "Cha"],
      "Disable Device": [0, "Int"],
      Disguise: [0, "Cha"],
      "Escape Artist": [0, "Dex"],
      Forgery: [0, "Int"],
      "Gather Information": [0, "Cha"],
      "Handle Animal": [0, "Cha"],
      Heal: [0, "Wis"],
      Hide: [0, "Dex"],
      Intimidate: [0, "Cha"],
      Jump: [0, "Str"],
      "Knowledge(arcana)": [0, "Int"],
      "Knowledge (R&N)": [0, "Int"],
      "Knowledge(religion)": [0, "Int"],
      "Knowledge(history)": [0, "Int"],
      "Knowledge(planes)": [0, "Int"],
      Knowledge: [0, "Int"],
      Listen: [0, "Wis"],
      "Move Silently": [0, "Dex"],
      "Open Lock": [0, "Dex"],
      Perform: [0, "Cha"],
      Profession: [0, "Wis"],
      Ride: [0, "Dex"],
      Search: [0, "Int"],
      "Sense Motive": [0, "Wis"],
      "Sleight of Hand": [0, "Dex"],
      Spellcraft: [0, "Int"],
      Spot: [0, "Wis"],
      Survival: [0, "Wis"],
      Swim: [0, "Str"],
      Tumble: [0, "Dex"],
      "Use Magic Device": [0, "Cha"],
      "Use Rope": [0, "Dex"],
    },
    feats: {},
    spells: {},
    gear: {},
    notes: {},
  },
  reducers: {
    setActiveBookmark: (state, action) => {
      state.activeBookmark = action.payload;
    },
    setStatPart: (state, action) => {
      //action.payload = ["wis", 15]
      state.stats = { ...state.stats, [action.payload[0]]: action.payload[1] };
    },
    setSavesPart: (state, action) => {
      /*  state.saves: {
      fort: {
        res: 0,
        base: 5,
        stat: "con",
        magic: 2,
        other: 1, 
      */
      //action.payload = ["fort", 5, "con", 2 , 1]
      console.log("setSavesPart");
      console.log(action.payload);
      console.log("-------");
      const resSave =
        parseInt(action.payload[1]) +
        Math.floor((state.stats[action.payload[2]] - 10) / 2) +
        parseInt(action.payload[3]) +
        parseInt(action.payload[4]);
      const saveObj = {
        res: resSave,
        base: action.payload[1],
        stat: action.payload[2],
        magic: action.payload[3],
        other: action.payload[4],
      };
      state.saves = { ...state.saves, [action.payload[0]]: saveObj };
    },
    setMainPart: (state, action) => {
      state.main = { ...state.main, [action.payload[0]]: action.payload[1] };
    },
    setDescrPart: (state, action) => {
      state.descr = { ...state.descr, [action.payload[0]]: action.payload[1] };
    },
  },
});

export const {
  setActiveBookmark,
  setStatPart,
  setSavesPart,
  setMainPart,
  setDescrPart,
} = charsheetSlice.actions;

export default charsheetSlice.reducer;
