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
      wis: 10,
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
        res: 0,
        base: 0,
        stat: "wis",
        magic: 0,
        other: 0,
      },
    },
    skills: {
      Appraise: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Int",
      },
      Balance: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Dex",
      },
      Bluff: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Cha",
      },
      Climb: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Str",
      },
      Concentration: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Con",
      },
      Craft: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Int",
      },
      "Decipher Script": {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: false,
        statDependsOn: "Int",
      },
      Diplomacy: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Cha",
      },
      "Disable Device": {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: false,
        statDependsOn: "Int",
      },
      Disguise: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Cha",
      },
      "Escape Artist": {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Dex",
      },
      Forgery: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Int",
      },
      "Gather Information": {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Cha",
      },
      "Handle Animal": {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: false,
        statDependsOn: "Cha",
      },
      Heal: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Wis",
      },
      Hide: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Dex",
      },
      Intimidate: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Cha",
      },
      Jump: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Str",
      },
      "Knowledge (arcana)": {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: false,
        statDependsOn: "Int",
      },
      "Knowledge (R&N)": {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: false,
        statDependsOn: "Int",
      },
      "Knowledge (religion)": {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: false,
        statDependsOn: "Int",
      },
      "Knowledge (history)": {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: false,
        statDependsOn: "Int",
      },
      "Knowledge (planes)": {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: false,
        statDependsOn: "Int",
      },
      "Knowledge (nature)": {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: false,
        statDependsOn: "Int",
      },
      "Knowledge (local)": {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: false,
        statDependsOn: "Int",
      },
      Knowledge: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: false,
        statDependsOn: "Int",
      },
      Listen: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Wis",
      },
      "Move Silently": {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Dex",
      },
      "Open Lock": {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: false,
        statDependsOn: "Dex",
      },
      Perform: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Cha",
      },
      Profession: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: false,
        statDependsOn: "Wis",
      },
      Ride: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Dex",
      },
      Search: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Int",
      },
      "Sense Motive": {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Wis",
      },
      "Sleight of Hand": {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: false,
        statDependsOn: "Dex",
      },
      Spellcraft: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: false,
        statDependsOn: "Int",
      },
      Spot: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Wis",
      },
      Survival: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Wis",
      },
      Swim: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Str",
      },
      Tumble: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: false,
        statDependsOn: "Dex",
      },
      "Use Magic Device": {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: false,
        statDependsOn: "Cha",
      },
      "Use Rope": {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Dex",
      },
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
    setSkillPart: (state, action) => {
      //action.payload = {skillName: , rank: , other: }
      const skillName = action.payload.skillName;
      const rank = parseInt(action.payload.rank);
      const other = parseInt(action.payload.other);

      const skill = { ...state.skills[skillName] };

      let keyStat = skill.statDependsOn;
      keyStat = keyStat.toLowerCase();
      const stat = parseInt(state.stats[keyStat]);
      const statMod = Math.floor((stat - 10) / 2);

      skill.res = rank + other + statMod;
      skill.rank = rank;
      skill.other = other;

      state.skills = {
        ...state.skills,
        [skillName]: skill,
      };
    },
    addSkill: (state, action) => {
      const skillName = action.payload.skillName;
      const newSkillObj = {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: action.payload.skillAbility,
      };

      state.skills = {
        ...state.skills,
        [skillName]: newSkillObj,
      };
    },
    addFeat: (state, action) => {
      const featName = action.payload.name.trim();
      const featSummary = action.payload.summary.trim();
      const featDescr = action.payload.descr.trim() || null;
      state.feats = {
        ...state.feats,
        [featName]: { summary: featSummary, descr: featDescr },
      };
      console.log(state.feats);
    },
    removeFeat: (state, action) => {
      const featName = action.payload.trim();
      const tempFeats = { ...state.feats };
      delete tempFeats[featName];
      state.feats = tempFeats;
    },
  },
});

export const {
  setActiveBookmark,
  setStatPart,
  setSavesPart,
  setMainPart,
  setDescrPart,
  setSkillPart,
  addSkill,
  addFeat,
  removeFeat,
} = charsheetSlice.actions;

export default charsheetSlice.reducer;
