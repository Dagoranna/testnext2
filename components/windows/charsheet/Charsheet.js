"use client";

import styles from "./Charsheet.module.css";
import { useRef, useEffect, useState, useMemo, cloneElement } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as charsheetSlice from "../../../app/store/slices/charsheetSlice";
import { manageWebsocket } from "../../../app/store/slices/websocketSlice";

export default function Charsheet() {
  const activeBookmark = useSelector((state) => state.charsheet.activeBookmark);

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

function Bookmark({ name }) {
  const dispatch = useDispatch();
  const activeBookmark = useSelector((state) => state.charsheet.activeBookmark);

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

function ParamLine({ section, dispFunction, title, field, isButton = false }) {
  const dispatch = useDispatch();
  const connectionState = useSelector(
    (state) => state.websocket.connectionState
  );
  const userRole = useSelector((state) => state.main.userRole);
  const userName = useSelector((state) => state.main.userName);
  const userColor = useSelector((state) => state.main.userColor);
  const gameId = useSelector((state) => state.websocket.gameId);

  function makeRoll(modifier, fieldName) {
    if (connectionState === 1) {
      const messageForServer = {
        gameId: gameId,
        user: {
          userRole: userRole,
          userName: userName,
          userColor: userColor,
        },
      };

      messageForServer["sectionName"] = "polydice";
      messageForServer["sectionInfo"] = {
        source: "charsheet",
        diceModifier: modifier,
        fieldName: fieldName,
      };

      dispatch(
        manageWebsocket(
          "send",
          process.env.NEXT_PUBLIC_SERVER_URL,
          JSON.stringify(messageForServer)
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

function ParamLineSaves({ section, dispFunction, title }) {
  console.log("section:");
  console.log(section);
  console.log("title = " + title);
  /*
section: 
Object { res: 0, base: 0, stat: "wis", magic: 0, other: 0 }
title = Will 
*/

  /*
        <ParamLineSaves
          section={saves.will}
          dispFunction={charsheetSlice.setSavesPart}
          title="Will"
          isButton={true}
        />
*/
  //action.payload = ["fort", 5, "con", 2 , 1]

  const dispatch = useDispatch();
  const connectionState = useSelector(
    (state) => state.websocket.connectionState
  );
  const userRole = useSelector((state) => state.main.userRole);
  const userName = useSelector((state) => state.main.userName);
  const userColor = useSelector((state) => state.main.userColor);
  const gameId = useSelector((state) => state.websocket.gameId);
  const field = title.toLowerCase();
  const statInfo = useSelector((state) => state.charsheet.stats[section.stat]);
  const statMod = Math.floor((parseInt(statInfo) - 10) / 2);

  /*  state.saves: {
      fort: {
        res: 0,
        base: 5,
        stat: "con",
        magic: 2,
        other: 1, 
      */
  //action.payload = ["fort", 5, "con", 2 , 1]

  function makeRoll(modifier, fieldName) {
    if (connectionState === 1) {
      const messageForServer = {
        gameId: gameId,
        user: {
          userRole: userRole,
          userName: userName,
          userColor: userColor,
        },
      };

      messageForServer["sectionName"] = "polydice";
      messageForServer["sectionInfo"] = {
        source: "charsheet",
        diceModifier: modifier,
        fieldName: fieldName,
      };

      dispatch(
        manageWebsocket(
          "send",
          process.env.NEXT_PUBLIC_SERVER_URL,
          JSON.stringify(messageForServer)
        )
      );
    }
  }

  useEffect(() => {
    dispatch(
      dispFunction([
        field,
        section.base,
        section.stat,
        section.magic,
        section.other,
      ])
    );
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
            className={styles.paramInput}
            value={section.res || 0}
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
                  e.target.value,
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
            className={styles.paramInput}
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
                  e.target.value,
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
                  e.target.value,
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
  const dispatch = useDispatch();
  const stats = useSelector((state) => state.charsheet.stats);
  const main = useSelector((state) => state.charsheet.main);
  const saves = useSelector((state) => state.charsheet.saves);
  /*      name: "Character Name",
      classlvl: "Classes & lvls",
      exp: 0,
      speed: 30,
      att: 0,
      dam: "",
      ac: 0,
      hp: 0,
      init: 0, */
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
  return <div className={styles.charSection}>Description</div>;
}
function CharSectionSkills() {
  return <div className={styles.charSection}>Skills</div>;
}
function CharSectionFeats() {
  return <div className={styles.charSection}>Feats</div>;
}
function CharSectionSpells() {
  return <div className={styles.charSection}>Spells</div>;
}
function CharSectionGear() {
  return <div className={styles.charSection}>Gear</div>;
}
function CharSectionNotes() {
  return <div className={styles.charSection}>Notes</div>;
}
