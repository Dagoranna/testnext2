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
      <ParamLine
        section={main.att}
        dispFunction={charsheetSlice.setMainPart}
        title="Attack"
        field="att"
        isButton={true}
      />
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
      <ParamLine
        section={main.init}
        dispFunction={charsheetSlice.setMainPart}
        title="Initiative"
        field="init"
        isButton={true}
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
