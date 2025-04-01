"use client";

import styles from "./Charsheet.module.css";
import { useRef, useEffect, useState, useMemo, cloneElement } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as charsheetSlice from "../../../app/store/slices/charsheetSlice";

export default function Charsheet() {
  const [mainSection, setMainSection] = useState("main");

  return (
    <div className={styles.charsheetWrapper}>
      <div className={styles.buttonBlock}></div>
      <div className={styles.mainBlock}>
        <div className={styles.bookmarkBlock}>
          <Bookmark name="Main" />
          <Bookmark name="Skills" />
          <Bookmark name="Feats" />
          <Bookmark name="Spells" />
          <Bookmark name="Gear" />
          <Bookmark name="Notes" />
        </div>
        <div className={styles.sectionsBlock}>
          <CharSection>{mainSection}</CharSection>
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

function CharSection({ children }) {
  return <div className={styles.charSection}>{children}</div>;
}
