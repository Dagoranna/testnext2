"use client";

import styles from "./Charsheet.module.css";
import React from "react";
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
            className={`${styles.paramInput} ${styles.paramInputResult}`}
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
  const stats = useSelector((state) => state.charsheet.stats);
  const main = useSelector((state) => state.charsheet.main);
  const saves = useSelector((state) => state.charsheet.saves);

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
  const descr = useSelector((state) => state.charsheet.descr);

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

/*
    skills: {
      ...
      Diplomacy: {
        res: 0,
        rank: 0,
        other: 0,
        isUntrained: true,
        statDependsOn: "Cha",
      },
*/
/*
      <ParamLineSkills
        key={key}
        section={skills[key]}
        dispFunction={charsheetSlice.setSkillPart}
        title={key}
      />
*/

const ParamLineSkills = React.memo(function ParamLineSkills({
  section,
  dispFunction,
  title,
}) {
  const dispatch = useDispatch();
  const connectionState = useSelector(
    (state) => state.websocket.connectionState
  );
  const userRole = useSelector((state) => state.main.userRole);
  const userName = useSelector((state) => state.main.userName);
  const userColor = useSelector((state) => state.main.userColor);
  const gameId = useSelector((state) => state.websocket.gameId);
  const skillInfo = useSelector((state) => state.charsheet.skills[title]);
  const stat = useSelector(
    (state) => state.charsheet.stats[section.statDependsOn.toLowerCase()]
  );

  const statMod = Math.floor((parseInt(stat) - 10) / 2);

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
                  rank: e.target.value,
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
                  other: e.target.value,
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
  const dispatch = useDispatch();
  const skills = useSelector((state) => state.charsheet.skills);
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
