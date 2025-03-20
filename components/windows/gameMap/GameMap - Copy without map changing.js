"use client";

import styles from "./GameMap.module.css";
import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";
import React from "react";
import { useRef, useEffect, useState, useMemo, cloneElement } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as mapSlice from "../../../app/store/slices/mapSlice";
import { manageWebsocket } from "../../../app/store/slices/websocketSlice";
import * as clientUtils from "../../../utils/clientUtils";
import FormWrapper from "../../forms/FormWrapper";
import FormWrapper_2 from "../../forms/FormWrapper_2";
//import { GoTrueClient } from "@supabase/supabase-js";
import parse from "html-react-parser";

const CELL_SIZE = 20;
const MARKER_RADIUS = 5;
const radToDeg = (rad) => rad * (180 / Math.PI);
const mainBGColor = "rgb(227, 214, 199)";
const colorsObj = {
  black: "white",
  gray: "black",
  silver: "black",
  white: "black",
  brown: "white",
  red: "white",
  purple: "white",
  fuchsia: "white",
  olive: "white",
  green: "white",
  lime: "black",
  yellow: "black",
  navy: "white",
  blue: "white",
  teal: "white",
  aqua: "black",
};

/*function PaletteColorElem({
  elemClass = styles.paletteColorItem,
  elemText = "*",
  backgroundColor,
  textColor,
}) {
  console.log(`🔄 PaletteColorElem ${backgroundColor} re-rendered`);
  const dispatch = useDispatch();

  function chooseColor(e) {
    dispatch(mapSlice.setActivePaletteColor(e.target.style.backgroundColor));
    dispatch(mapSlice.setActivePaletteTextColor(e.target.style.color));
  }

  const activeColor = useSelector(
    (state) => state.map.activePaletteStyle.color
  );
  let currentClass = "";
  let gridColumn = "";

  activeColor === backgroundColor
    ? (currentClass = `${elemClass} ${styles.activeElem}`)
    : (currentClass = `${elemClass}`);
  backgroundColor === mainBGColor || backgroundColor === "transparent"
    ? (gridColumn = "1 / 5")
    : (gridColumn = "auto");

  return (
    <div
      className={currentClass}
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
        gridColumn: gridColumn,
      }}
      onClick={(e) => chooseColor(e, dispatch)}
    >
      {elemText}
    </div>
  );
}*/

export default function GameMap() {
  console.log("🔄 GameMap re-rendered");

  return (
    <div className={styles.gameMapWrapper}>
      <MapField />
      <Palette />
    </div>
  );
}

function MapField() {
  console.log("🔄 MapField re-rendered");
  const mapRef = useRef(null);
  const activeAction = useSelector((state) => state.map.activePaletteAction);

  const mapFieldJSX = useMemo(() => {
    return (
      <div
        className={styles.mapFieldWrapper}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={styles.mapField} ref={mapRef} name="mapField"></div>
      </div>
    );
  }, []);

  useEffect(() => {
    if (activeAction === null) {
      mapRef.current.style.touchAction = "";
    } else {
      mapRef.current.style.touchAction = "none";
    }
  }, [activeAction]);

  return mapFieldJSX;
}

function PaletteColorElem({
  elemClass = styles.paletteColorItem,
  elemText = "*",
  backgroundColor,
  textColor,
}) {
  console.log(`🔄 PaletteColorElem ${backgroundColor} re-rendered`);
  const dispatch = useDispatch();

  function chooseColor(e) {
    dispatch(mapSlice.setActivePaletteColor(e.target.style.backgroundColor));
    dispatch(mapSlice.setActivePaletteTextColor(e.target.style.color));
  }

  const activeColor = useSelector(
    (state) => state.map.activePaletteStyle.color
  );
  let currentClass = "";
  let gridColumn = "";

  activeColor === backgroundColor
    ? (currentClass = `${elemClass} ${styles.activeElem}`)
    : (currentClass = `${elemClass}`);
  backgroundColor === mainBGColor || backgroundColor === "transparent"
    ? (gridColumn = "1 / 5")
    : (gridColumn = "auto");

  return (
    <div
      className={currentClass}
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
        gridColumn: gridColumn,
      }}
      onClick={(e) => chooseColor(e, dispatch)}
    >
      {elemText}
    </div>
  );
}

function PaletteColors() {
  console.log(`🔄 PaletteColors re-rendered`);

  const elemsArray = useMemo(() => {
    return Object.keys(colorsObj).map((bgColor) => (
      <PaletteColorElem
        key={bgColor}
        backgroundColor={bgColor}
        textColor={colorsObj[bgColor]}
      />
    ));
  }, []);

  return (
    <div className={styles.paletteColors}>
      <PaletteColorElem
        elemClass={styles.paletteColorTransparent}
        elemText="transparent"
        backgroundColor="transparent"
        textColor="black"
      />
      {elemsArray}
      <PaletteColorElem
        elemText="grid"
        backgroundColor={mainBGColor}
        textColor="black"
      />
    </div>
  );
}

function Palette() {
  console.log("🔄 Palette re-rendered");
  return (
    <details>
      <summary>Palette &#x1F3A8;</summary>
      <div
        className={styles.gameMapTools}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <PaletteActions />
        <PaletteColors />
        <PaletteForms />
      </div>
    </details>
  );
}

function PaletteForms() {
  console.log("🔄 PaletteForms re-rendered");
  return (
    <>
      <PaletteFormsSimple />
    </>
  );
}
//      <PaletteFormsButtons />
function PaletteFormsSimple() {
  console.log("🔄 PaletteFormsSimple re-rendered");

  return (
    <div className={styles.paletteForms}>
      {Array.from({ length: 18 }, (_, i) => (
        <PaletteElem key={i} id={`elemForm_${i}`} />
      ))}
    </div>
  );
}

function PaletteElem({ id }) {
  console.log(`🔄 PaletteElem ${id} re-rendered`);
  const activeForm = useSelector((state) => state.map.activePaletteStyle.form);
  const activeColor = useSelector(
    (state) => state.map.activePaletteStyle.color
  );
  const activeTextColor = useSelector(
    (state) => state.map.activePaletteStyle.textColor
  );

  const dispatch = useDispatch();

  let elemClass =
    id === activeForm
      ? `${styles.paletteElem} ${styles.activeElem}`
      : styles.paletteElem;
  let elemStyle = {
    ...mapSlice.FORMS_LIST[id],
    backgroundColor: activeColor,
    color: activeTextColor,
  };

  function chooseForm(e, dispatch) {
    dispatch(mapSlice.setActivePaletteForm(e.target.id));
  }

  return (
    <div
      id={id}
      className={elemClass}
      style={elemStyle}
      onClick={(e) => chooseForm(e, dispatch)}
    ></div>
  );
}

function PaletteActions() {
  const dispatch = useDispatch();
  const activeAction = useSelector((state) => state.map.activePaletteAction);

  function changePaletteAction(act, dispatch) {
    if (activeAction === act) {
      dispatch(mapSlice.setActivePaletteAction(null));
    } else {
      dispatch(mapSlice.setActivePaletteAction(act));
    }
  }

  return (
    <div className={styles.paletteActions}>
      <button
        className={styles.paletteActionElem}
        style={activeAction === "arrow" ? { background: "yellow" } : {}}
        onClick={() => changePaletteAction("arrow", dispatch)}
      >
        &#x1F446;
      </button>
      <button
        className={styles.paletteActionElem}
        style={activeAction === "brush" ? { background: "yellow" } : {}}
        onClick={() => changePaletteAction("brush", dispatch)}
      >
        &#128396;
      </button>
      <button
        className={styles.paletteActionElem}
        style={activeAction === "rotate" ? { background: "yellow" } : {}}
        onClick={() => changePaletteAction("rotate", dispatch)}
      >
        &#8635;
      </button>
      <button className={styles.paletteActionElem} onClick={() => mergeItems()}>
        <img
          src="/images/link.bmp"
          style={{ width: "100%", height: "100%" }}
        ></img>
      </button>
      <button className={styles.paletteActionElem} onClick={() => splitItems()}>
        <img
          src="/images/link_d.bmp"
          style={{ width: "100%", height: "100%" }}
        ></img>
      </button>
      <button
        className={styles.paletteActionElem}
        onClick={() => deleteItems()}
      >
        &#10006;
      </button>
      <button className={styles.paletteActionElem} onClick={() => copyItems()}>
        <img
          src="/images/copy.bmp"
          style={{ width: "100%", height: "100%" }}
        ></img>
      </button>
    </div>
  );
}
