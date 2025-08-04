import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Bookmark =
  | "Main"
  | "Descr"
  | "Skills"
  | "Feats"
  | "Spells"
  | "Gear"
  | "Notes";
export type Ability = "str" | "dex" | "con" | "int" | "wis" | "cha";
export type AbilityCap = "Str" | "Dex" | "Con" | "Int" | "Wis" | "Cha";

export interface SaveObj {
  res: number;
  base: number;
  stat: Ability;
  magic: number;
  other: number;
}

export interface SkillObj {
  res: number;
  rank: number;
  other: number;
  isUntrained: boolean;
  statDependsOn: AbilityCap;
}

export interface UnitedBlock {
  name: string;
  summary: string;
  descr: string;
}

export interface MyState {
  activeBookmark: Bookmark;
  stats: Record<Ability, number>;
  main: {
    name: string;
    classlvl: string;
    exp: number;
    speed: number;
    att: number;
    dam: string;
    ac: number;
    hp: number;
    init: number;
  };
  descr: {
    player: string;
    race: string;
    alignment: string;
    deity: string;
    size: string;
    age: number;
    gender: string;
    height: string;
    weight: string;
    eyes: string;
    hair: string;
    skin: string;
  };
  saves: {
    fort: SaveObj;
    ref: SaveObj;
    will: SaveObj;
  };
  skills: Record<string, SkillObj>;
  feats: Record<string, UnitedBlock>;
  spells: Record<string, UnitedBlock>;
  gear: Record<string, UnitedBlock>;
  notes: Record<string, UnitedBlock>;
}

const initialState: MyState = {
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
};

const charsheetSlice = createSlice({
  name: "charsheet",
  initialState,
  reducers: {
    setActiveBookmark: (state, action: PayloadAction<Bookmark>) => {
      state.activeBookmark = action.payload;
    },
    setStatPart: (state, action: PayloadAction<[Ability, number]>) => {
      state.stats = { ...state.stats, [action.payload[0]]: action.payload[1] };
    },
    setSavesPart: (
      state,
      action: PayloadAction<[string, number, Ability, number, number]>
    ) => {
      const resSave =
        action.payload[1] +
        Math.floor((state.stats[action.payload[2]] - 10) / 2) +
        action.payload[3] +
        action.payload[4];
      const saveObj = {
        res: resSave,
        base: action.payload[1],
        stat: action.payload[2],
        magic: action.payload[3],
        other: action.payload[4],
      };
      state.saves = { ...state.saves, [action.payload[0]]: saveObj };
    },
    setMainPart: (state, action: PayloadAction<[string, string]>) => {
      state.main = { ...state.main, [action.payload[0]]: action.payload[1] };
    },
    setDescrPart: (state, action: PayloadAction<[string, string]>) => {
      state.descr = { ...state.descr, [action.payload[0]]: action.payload[1] };
    },
    setSkillPart: (
      state,
      action: PayloadAction<{ skillName: string; rank: number; other: number }>
    ) => {
      const skillName = action.payload.skillName;
      const rank = action.payload.rank;
      const other = action.payload.other;

      const skill = { ...state.skills[skillName] };

      const keyStat = skill.statDependsOn.toLowerCase() as Ability;
      const stat = state.stats[keyStat];
      const statMod = Math.floor((stat - 10) / 2);

      skill.res = rank + other + statMod;
      skill.rank = rank;
      skill.other = other;

      state.skills = {
        ...state.skills,
        [skillName]: skill,
      };
    },
    addSkill: (
      state,
      action: PayloadAction<{ skillName: string; skillAbility: AbilityCap }>
    ) => {
      const skillName = action.payload.skillName;
      const newSkillObj: SkillObj = {
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
    addUnitedBlock: (
      state,
      action: PayloadAction<{
        blockType: string;
        name: string;
        summary: string;
        descr: string;
      }>
    ) => {
      const blockType = action.payload.blockType;
      const blockName = action.payload.name.trim();
      const blockSummary = action.payload.summary.trim();
      const blockDescr = action.payload.descr.trim() || null;
      state[blockType] = {
        ...state[blockType],
        [blockName]: { summary: blockSummary, descr: blockDescr },
      };
    },
    removeUnitedBlock: (
      state,
      action: PayloadAction<{ blockType: string; name: string }>
    ) => {
      const blockName = action.payload.name.trim();
      const blockType = action.payload.blockType;
      const tempBlock = { ...state[blockType] };
      delete tempBlock[blockName];
      state[blockType] = tempBlock;
    },
    loadCharsheetContent: (state, action: PayloadAction<MyState>) => {
      //return JSON.parse(action.payload) as MyState;
      return action.payload;
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
  addUnitedBlock,
  removeUnitedBlock,
  loadCharsheetContent,
} = charsheetSlice.actions;

export default charsheetSlice.reducer;
