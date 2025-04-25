"use client";

import styles from "./Charsheet.module.css";
import React from "react";
import { useRef, useEffect, useState, useMemo, cloneElement } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as charsheetSlice from "../../../app/store/slices/charsheetSlice";
import { manageWebsocket } from "../../../app/store/slices/websocketSlice";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "../../../app/store/store";
import type {
  SectionName,
  MessageForServer,
} from "../../../app/store/slices/websocketSlice";
import type {
  Bookmark,
  Ability,
  SaveObj,
  SkillObj,
  UnitedBlock,
} from "../../../app/store/slices/charsheetSlice";

export default function Charsheet() {
  const activeBookmark = useSelector(
    (state: RootState) => state.charsheet.activeBookmark
  );

  return (
    <div className={styles.charsheetWrapper}>
      <div className={styles.buttonBlock}></div>
      <div className={styles.mainBlock}>
        <div className={styles.bookmarkBlock}>
          <Bookmark name="Main" />
          <Bookmark name="Descr" />
          <Bookmark name="Skills" />
          <Bookmark name="Feats" />
          <Bookmark name="Spells" />
          <Bookmark name="Gear" />
          <Bookmark name="Notes" />
        </div>
        <div className={styles.sectionsBlock}>
          {activeBookmark === "Main" && <CharSectionMain />}
          {activeBookmark === "Descr" && <CharSectionDescr />}
          {activeBookmark === "Skills" && <CharSectionSkills />}
          {activeBookmark === "Feats" && <CharSectionFeats />}
          {activeBookmark === "Spells" && <CharSectionSpells />}
          {activeBookmark === "Gear" && <CharSectionGear />}
          {activeBookmark === "Notes" && <CharSectionNotes />}
        </div>
      </div>
    </div>
  );
}

type BookmarkProps = {
  name: Bookmark;
};

function Bookmark({ name }: BookmarkProps) {
  const dispatch: AppDispatch = useDispatch();
  const activeBookmark = useSelector(
    (state: RootState) => state.charsheet.activeBookmark
  );

  return (
    <div
      className={`${styles.bookmark} ${
        activeBookmark === name ? styles.isActive : ""
      }`}
      onClick={() => dispatch(charsheetSlice.setActiveBookmark(name))}
    >
      {name}
    </div>
  );
}

type ParamLineProps = {
  section: string | number;
  dispFunction: (
    payload: [string, string | number]
  ) => PayloadAction<[string, string | number]>;
  title: string;
  field: string;
  isButton?: boolean;
};

function ParamLine({
  section,
  dispFunction,
  title,
  field,
  isButton = false,
}: ParamLineProps) {
  const dispatch: AppDispatch = useDispatch();
  const connectionState = useSelector(
    (state: RootState) => state.websocket.connectionState
  );
  const userRole = useSelector((state: RootState) => state.main.userRole);
  const userName = useSelector((state: RootState) => state.main.userName);
  const userColor = useSelector((state: RootState) => state.main.userColor);
  const gameId = useSelector((state: RootState) => state.websocket.gameId);

  function makeRoll(modifier: string | number, fieldName: string) {
    if (connectionState === 1) {
      const messageForServer: MessageForServer = {
        gameId: gameId,
        user: {
          userRole: userRole,
          userName: userName,
          userColor: userColor,
        },
        sectionName: "polydice" as SectionName,
        sectionInfo: {
          source: "charsheet",
          diceModifier: modifier,
          fieldName: fieldName,
        },
      };

      dispatch(
        manageWebsocket(
          "send",
          process.env.NEXT_PUBLIC_SERVER_URL,
          messageForServer
        )
      );
    }
  }

  return (
    <div className={styles.paramLine}>
      {!isButton && <div className={styles.paramTitle}>{`${title}:`}</div>}
      {isButton && (
        <button
          className={`${styles.paramTitle} ${styles.chButton}`}
          onClick={(e) => makeRoll(section, title)}
        >{`${title}:`}</button>
      )}
      <input
        className={styles.paramInput}
        onChange={(e) => {
          dispatch(dispFunction([field, e.target.value]));
        }}
        value={section || ""}
      />
    </div>
  );
}

type ParamLineSavesProps = {
  section: SaveObj;
  dispFunction: (
    payload: [string, number, Ability, number, number]
  ) => PayloadAction<[string, number, Ability, number, number]>;
  title: string;
  isButton?: boolean;
};

function ParamLineSaves({ section, dispFunction, title }: ParamLineSavesProps) {
  const dispatch = useDispatch<AppDispatch>();
  const connectionState = useSelector(
    (state: RootState) => state.websocket.connectionState
  );
  const userRole = useSelector((state: RootState) => state.main.userRole);
  const userName = useSelector((state: RootState) => state.main.userName);
  const userColor = useSelector((state: RootState) => state.main.userColor);
  const gameId = useSelector((state: RootState) => state.websocket.gameId);
  const field = title.toLowerCase();
  const statInfo = useSelector(
    (state: RootState) => state.charsheet.stats[section.stat]
  );
  const statMod = Math.floor((statInfo - 10) / 2);
  const statRes = section.base + section.magic + section.other + statMod;
  /*
  saves: {
    fort: {
      res: 0,
      base: 0,
      stat: "con",
      magic: 0,
      other: 0,
    },
  */

  function makeRoll(modifier: number, fieldName: string) {
    if (connectionState === 1) {
      const messageForServer = {
        gameId: gameId,
        user: {
          userRole: userRole,
          userName: userName,
          userColor: userColor,
        },
        sectionName: "polydice" as SectionName,
        sectionInfo: {
          source: "charsheet",
          diceModifier: modifier,
          fieldName: fieldName,
        },
      };

      dispatch(
        manageWebsocket(
          "send",
          process.env.NEXT_PUBLIC_SERVER_URL,
          messageForServer
        )
      );
    }
  }

  useEffect(() => {
    console.log("recalc save");
    console.log("current stat mod = " + statMod);
    dispFunction([
      field,
      section.base,
      section.stat,
      section.magic,
      section.other,
    ]);
  }, [statInfo]);

  return (
    <div className={styles.paramLine}>
      <button
        className={`${styles.paramTitle} ${styles.chButton}`}
        onClick={(e) => makeRoll(section.res, title)}
      >{`${title}:`}</button>
      <div className={styles.oneSaveBlock}>
        <div className={styles.savePart}>
          <div className={styles.saveResFiled}>Result</div>
          <input
            className={`${styles.paramInput} ${styles.paramInputResult}`}
            value={statRes || 0}
            readOnly
            type="number"
          />
        </div>
        <div className={styles.savePart}>
          <div className={styles.saveResFiled}>Base</div>
          <input
            className={styles.paramInput}
            onChange={(e) => {
              dispatch(
                dispFunction([
                  field,
                  parseInt(e.target.value, 10) || 0,
                  section.stat,
                  section.magic,
                  section.other,
                ])
              );
            }}
            value={section.base || 0}
            type="number"
          />
        </div>
        <div className={styles.savePart}>
          <div className={styles.saveResFiled}>Ab.Mod.</div>
          <input
            className={`${styles.paramInput} ${styles.paramInputReadonly}`}
            value={statMod || 0}
            readOnly
            type="number"
          />
        </div>
        <div className={styles.savePart}>
          <div className={styles.saveResFiled}>Magic</div>
          <input
            className={styles.paramInput}
            onChange={(e) => {
              dispatch(
                dispFunction([
                  field,
                  section.base,
                  section.stat,
                  parseInt(e.target.value, 10) || 0,
                  section.other,
                ])
              );
            }}
            value={section.magic || 0}
            type="number"
          />
        </div>
        <div className={styles.savePart}>
          <div className={styles.saveResFiled}>Other</div>
          <input
            className={styles.paramInput}
            onChange={(e) => {
              dispatch(
                dispFunction([
                  field,
                  section.base,
                  section.stat,
                  section.magic,
                  parseInt(e.target.value, 10) || 0,
                ])
              );
            }}
            value={section.other || 0}
            type="number"
          />
        </div>
      </div>
    </div>
  );
}

function CharSectionMain() {
  const stats = useSelector((state: RootState) => state.charsheet.stats);
  const main = useSelector((state: RootState) => state.charsheet.main);
  const saves = useSelector((state: RootState) => state.charsheet.saves);

  return (
    <div className={styles.charSection}>
      <ParamLine
        section={main.name}
        dispFunction={charsheetSlice.setMainPart}
        title="Name"
        field="name"
      />
      <ParamLine
        section={main.classlvl}
        dispFunction={charsheetSlice.setMainPart}
        title="Classes & lvls"
        field="classlvl"
      />
      <ParamLine
        section={main.exp}
        dispFunction={charsheetSlice.setMainPart}
        title="Experience"
        field="exp"
      />
      <ParamLine
        section={main.speed}
        dispFunction={charsheetSlice.setMainPart}
        title="Speed"
        field="speed"
      />
      <div className={styles.statsBlock}>
        <div style={{ width: "100%", marginLeft: "3px" }}>Abilities:</div>
        <ParamLine
          section={stats.str}
          dispFunction={charsheetSlice.setStatPart}
          title="Str"
          field="str"
        />
        <ParamLine
          section={stats.dex}
          dispFunction={charsheetSlice.setStatPart}
          title="Dex"
          field="dex"
        />
        <ParamLine
          section={stats.con}
          dispFunction={charsheetSlice.setStatPart}
          title="Con"
          field="con"
        />
        <div style={{ width: "100%" }}></div>
        <ParamLine
          section={stats.int}
          dispFunction={charsheetSlice.setStatPart}
          title="Int"
          field="int"
        />
        <ParamLine
          section={stats.wis}
          dispFunction={charsheetSlice.setStatPart}
          title="Wis"
          field="wis"
        />
        <ParamLine
          section={stats.cha}
          dispFunction={charsheetSlice.setStatPart}
          title="Cha"
          field="cha"
        />
      </div>
      <ParamLine
        section={main.init}
        dispFunction={charsheetSlice.setMainPart}
        title="Initiative"
        field="init"
        isButton={true}
      />
      <ParamLine
        section={main.att}
        dispFunction={charsheetSlice.setMainPart}
        title="Attack"
        field="att"
        isButton={true}
      />
      <div className={styles.savesBlock}>
        <div style={{ width: "100%", marginLeft: "3px" }}>Saves:</div>
        <ParamLineSaves
          section={saves.fort}
          dispFunction={charsheetSlice.setSavesPart}
          title="Fort"
          isButton={true}
        />
        <ParamLineSaves
          section={saves.ref}
          dispFunction={charsheetSlice.setSavesPart}
          title="Ref"
          isButton={true}
        />
        <ParamLineSaves
          section={saves.will}
          dispFunction={charsheetSlice.setSavesPart}
          title="Will"
          isButton={true}
        />
      </div>
      <ParamLine
        section={main.dam}
        dispFunction={charsheetSlice.setMainPart}
        title="Damage"
        field="dam"
      />
      <ParamLine
        section={main.ac}
        dispFunction={charsheetSlice.setMainPart}
        title="AC"
        field="ac"
      />
      <ParamLine
        section={main.hp}
        dispFunction={charsheetSlice.setMainPart}
        title="HP"
        field="hp"
      />
    </div>
  );
}

function CharSectionDescr() {
  const descr = useSelector((state: RootState) => state.charsheet.descr);

  const descrArray = [];
  for (var key in descr) {
    descrArray.push(
      <ParamLine
        key={key}
        section={descr[key]}
        dispFunction={charsheetSlice.setDescrPart}
        title={key[0].toLocaleUpperCase() + key.slice(1)}
        field={key}
      />
    );
  }

  return <div className={styles.charSection}>{descrArray}</div>;
}

type ParamLineSkillsProps = {
  section: SkillObj;
  dispFunction: (payload: {
    skillName: string;
    rank: number;
    other: number;
  }) => PayloadAction<{ skillName: string; rank: number; other: number }>;
  title: string;
};

const ParamLineSkills = React.memo(function ParamLineSkills({
  section,
  dispFunction,
  title,
}: ParamLineSkillsProps) {
  const dispatch: AppDispatch = useDispatch();
  const connectionState = useSelector(
    (state: RootState) => state.websocket.connectionState
  );
  const userRole = useSelector((state: RootState) => state.main.userRole);
  const userName = useSelector((state: RootState) => state.main.userName);
  const userColor = useSelector((state: RootState) => state.main.userColor);
  const gameId = useSelector((state: RootState) => state.websocket.gameId);
  const skillInfo = useSelector(
    (state: RootState) => state.charsheet.skills[title]
  );
  const stat = useSelector(
    (state: RootState) =>
      state.charsheet.stats[section.statDependsOn.toLowerCase()]
  );

  const statMod = Math.floor((parseInt(stat) - 10) / 2);

  function makeRoll(modifier: number, fieldName: string) {
    if (connectionState === 1) {
      const messageForServer = {
        gameId: gameId,
        user: {
          userRole: userRole,
          userName: userName,
          userColor: userColor,
        },
        sectionName: "polydice" as SectionName,
        sectionInfo: {
          source: "charsheet",
          diceModifier: modifier,
          fieldName: fieldName,
        },
      };

      dispatch(
        manageWebsocket(
          "send",
          process.env.NEXT_PUBLIC_SERVER_URL,
          messageForServer
        )
      );
    }
  }

  useEffect(() => {
    dispatch(
      dispFunction({
        skillName: title,
        rank: skillInfo.rank,
        other: skillInfo.other,
      })
    );
  }, [stat]);

  return (
    <div className={styles.paramLine}>
      <button
        className={`${styles.paramTitleSkill} ${
          (skillInfo.isUntrained || skillInfo.rank > 0) && styles.chButton
        }`}
        onClick={(e) => makeRoll(section.res, title)}
      >{`${title}`}</button>
      <div className={styles.oneSkillBlock}>
        <div className={styles.skillPart}>
          <div className={styles.saveResFiled}>Result</div>
          <input
            className={`${styles.paramInput} ${styles.paramInputResult}`}
            value={section.res || 0}
            readOnly
            type="number"
          />
        </div>
        <div className={styles.skillPart}>
          <div className={styles.saveResFiled}>Ranks</div>
          <input
            className={styles.paramInput}
            onChange={(e) => {
              dispatch(
                dispFunction({
                  skillName: title,
                  rank: parseInt(e.target.value, 10) || 0,
                  other: skillInfo.other,
                })
              );
            }}
            value={section.rank || 0}
            type="number"
          />
        </div>
        <div className={styles.skillPart}>
          <div className={styles.saveResFiled}>Ab.Mod.</div>
          <input
            className={`${styles.paramInput} ${styles.paramInputReadonly}`}
            value={statMod || 0}
            readOnly
            type="number"
          />
        </div>
        <div className={styles.skillPart}>
          <div className={styles.saveResFiled}>Other</div>
          <input
            className={styles.paramInput}
            onChange={(e) => {
              dispatch(
                dispFunction({
                  skillName: title,
                  rank: skillInfo.rank,
                  other: parseInt(e.target.value, 10) || 0,
                })
              );
            }}
            value={section.other || 0}
            type="number"
          />
        </div>
      </div>
    </div>
  );
});

function CharSectionSkills() {
  const dispatch: AppDispatch = useDispatch();
  const skills = useSelector((state: RootState) => state.charsheet.skills);
  const skillsArray = [];

  for (var key in skills) {
    skillsArray.push(
      <ParamLineSkills
        key={key}
        section={skills[key]}
        dispFunction={charsheetSlice.setSkillPart}
        title={key}
      />
    );
  }

  const [skillName, setSkillName] = useState("");
  const [skillAbility, setSkillAbility] = useState("str");

  function addSkill(skillName, skillAbility) {
    dispatch(
      charsheetSlice.addSkill({
        skillName: skillName,
        skillAbility: skillAbility,
      })
    );
  }

  const addSkillLine = (
    <div key="addskill">
      <button
        className={`${styles.paramTitle} ${styles.chButton}`}
        onClick={(e) => addSkill(skillName, skillAbility)}
      >
        Add New Skill
      </button>
      <input
        value={skillName}
        onChange={(e) => setSkillName(e.target.value)}
        placeholder="Skill name"
      />
      <select
        name="abils"
        value={skillAbility}
        onChange={(e) => setSkillAbility(e.target.value)}
      >
        <option value="str">Str</option>
        <option value="dex">Dex</option>
        <option value="con">Con</option>
        <option value="int">Int</option>
        <option value="wis">Wis</option>
        <option value="cha">Cha</option>
      </select>
    </div>
  );

  skillsArray.push(addSkillLine);

  return <div className={styles.charSection}>{skillsArray}</div>;
}

type ParamLineUnitedBlockProps = {
  blockType: string;
  unitedBlockInfo: UnitedBlock;
  title: string;
};

const ParamLineUnitedBlock = React.memo(function ParamLineUnitedBlock({
  blockType,
  unitedBlockInfo,
  title,
}: ParamLineUnitedBlockProps) {
  const dispatch: AppDispatch = useDispatch();

  return (
    <div className={styles.paramLineUnitedBlock}>
      <details className={styles.oneUnitedBlock}>
        <summary>
          <div className={styles.unitedBlockName}>{title}:</div>
          <div className={styles.unitedBlockSummaryText}>
            {unitedBlockInfo.summary}
          </div>
        </summary>
        <br className={styles.mobileBreak} />
        <div className={styles.unitedBlockDescr}>{unitedBlockInfo.descr}</div>
      </details>
      <button
        className={styles.deleteUnitedBlockButton}
        onClick={() =>
          dispatch(
            charsheetSlice.removeUnitedBlock({
              blockType: blockType,
              name: title,
            })
          )
        }
      >
        ✖
      </button>
    </div>
  );
});

function addUnitedBlock(
  blockType: string,
  blockName: string,
  blockSummary: string,
  blockDescr: string,
  dispatch: AppDispatch
) {
  dispatch(
    charsheetSlice.addUnitedBlock({
      blockType: blockType,
      name: blockName,
      summary: blockSummary,
      descr: blockDescr,
    })
  );
}

function CharSectionFeats() {
  const dispatch: AppDispatch = useDispatch();
  const feats = useSelector((state: RootState) => state.charsheet.feats);
  const featsArray: React.ReactNode[] = [];
  const [featName, setFeatName] = useState("");
  const [featSummary, setFeatSummary] = useState("");
  const [featDescr, setFeatDescr] = useState("");

  for (var key in feats) {
    featsArray.push(
      <ParamLineUnitedBlock
        key={key}
        blockType="feats"
        unitedBlockInfo={feats[key]}
        title={key}
      />
    );
  }

  const addFeatLine = (
    <div key="addfeat" className={styles.addUnitedBlockPart}>
      <div>
        <b>New feat:</b>
      </div>
      <input
        value={featName}
        onChange={(e) => setFeatName(e.target.value)}
        placeholder="Feat name"
      />
      <textarea
        value={featSummary}
        onChange={(e) => setFeatSummary(e.target.value)}
        placeholder="Feat summary"
      />
      <textarea
        value={featDescr}
        onChange={(e) => setFeatDescr(e.target.value)}
        placeholder="Feat full description (optional)"
      />
      <button
        className={`${styles.paramTitle} ${styles.chButton}`}
        onClick={() =>
          addUnitedBlock("feats", featName, featSummary, featDescr, dispatch)
        }
      >
        Add New Feat
      </button>
    </div>
  );

  featsArray.push(addFeatLine);

  return <div className={styles.charSection}>{featsArray}</div>;
}
function CharSectionSpells() {
  const dispatch: AppDispatch = useDispatch();
  const spells = useSelector((state: RootState) => state.charsheet.spells);
  const spellsArray: React.ReactNode[] = [];
  const [spellName, setSpellName] = useState("");
  const [spellSummary, setSpellSummary] = useState("");
  const [spellDescr, setSpellDescr] = useState("");

  for (var key in spells) {
    spellsArray.push(
      <ParamLineUnitedBlock
        key={key}
        blockType="spells"
        unitedBlockInfo={spells[key]}
        title={key}
      />
    );
  }

  const addSpellLine = (
    <div key="addspell" className={styles.addUnitedBlockPart}>
      <div>
        <b>New spell block:</b>
      </div>
      <input
        value={spellName}
        onChange={(e) => setSpellName(e.target.value)}
        placeholder="Spell block name"
      />
      <textarea
        value={spellSummary}
        onChange={(e) => setSpellSummary(e.target.value)}
        placeholder="Spell block summary"
      />
      <textarea
        value={spellDescr}
        onChange={(e) => setSpellDescr(e.target.value)}
        placeholder="Spell block full description (optional)"
      />
      <button
        className={`${styles.paramTitle} ${styles.chButton}`}
        onClick={() =>
          addUnitedBlock(
            "spells",
            spellName,
            spellSummary,
            spellDescr,
            dispatch
          )
        }
      >
        Add New Spell Block
      </button>
    </div>
  );

  spellsArray.push(addSpellLine);

  return <div className={styles.charSection}>{spellsArray}</div>;
}
function CharSectionGear() {
  const dispatch: AppDispatch = useDispatch();
  const gear = useSelector((state: RootState) => state.charsheet.gear);
  const gearArray: React.ReactNode[] = [];
  const [gearName, setGearName] = useState("");
  const [gearSummary, setGearSummary] = useState("");
  const [gearDescr, setGearDescr] = useState("");

  for (var key in gear) {
    gearArray.push(
      <ParamLineUnitedBlock
        key={key}
        blockType="gear"
        unitedBlockInfo={gear[key]}
        title={key}
      />
    );
  }

  const addGearLine = (
    <div key="addgear" className={styles.addUnitedBlockPart}>
      <div>
        <b>New gear block:</b>
      </div>
      <input
        value={gearName}
        onChange={(e) => setGearName(e.target.value)}
        placeholder="Gear block name"
      />
      <textarea
        value={gearSummary}
        onChange={(e) => setGearSummary(e.target.value)}
        placeholder="Gear block summary"
      />
      <textarea
        value={gearDescr}
        onChange={(e) => setGearDescr(e.target.value)}
        placeholder="Gear block full description (optional)"
      />
      <button
        className={`${styles.paramTitle} ${styles.chButton}`}
        onClick={() =>
          addUnitedBlock("gear", gearName, gearSummary, gearDescr, dispatch)
        }
      >
        Add New Gear Block
      </button>
    </div>
  );

  gearArray.push(addGearLine);

  return <div className={styles.charSection}>{gearArray}</div>;
}

function CharSectionNotes() {
  const dispatch: AppDispatch = useDispatch();
  const notes = useSelector((state: RootState) => state.charsheet.notes);
  const notesArray: React.ReactNode[] = [];
  const [noteName, setNoteName] = useState("");
  const [noteSummary, setNoteSummary] = useState("");
  const [noteDescr, setNoteDescr] = useState("");

  for (var key in notes) {
    notesArray.push(
      <ParamLineUnitedBlock
        key={key}
        blockType="notes"
        unitedBlockInfo={notes[key]}
        title={key}
      />
    );
  }

  const addNoteLine = (
    <div key="addnote" className={styles.addUnitedBlockPart}>
      <div>
        <b>New note block:</b>
      </div>
      <input
        value={noteName}
        onChange={(e) => setNoteName(e.target.value)}
        placeholder="Note block name"
      />
      <textarea
        value={noteSummary}
        onChange={(e) => setNoteSummary(e.target.value)}
        placeholder="Note block summary"
      />
      <textarea
        value={noteDescr}
        onChange={(e) => setNoteDescr(e.target.value)}
        placeholder="Note block full description (optional)"
      />
      <button
        className={`${styles.paramTitle} ${styles.chButton}`}
        onClick={() =>
          addUnitedBlock("notes", noteName, noteSummary, noteDescr, dispatch)
        }
      >
        Add New Note Block
      </button>
    </div>
  );

  notesArray.push(addNoteLine);

  return <div className={styles.charSection}>{notesArray}</div>;
}
