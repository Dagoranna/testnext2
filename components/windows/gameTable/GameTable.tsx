"use client";

import styles from "./GameTable.module.css";
import React from "react";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as gameTableSlice from "../../../app/store/slices/gameTableSlice";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "../../../app/store/store";
import type {
  Combatant,
  TableState,
} from "../../../app/store/slices/gameTableSlice";

const Combatant = React.memo(function Combatant({ mob }: { mob: Combatant }) {
  const dispatch: AppDispatch = useDispatch();
  const [form, setForm] = useState({
    id: mob.id || 0,
    name: mob.name || "",
    hp: mob.hp || 0,
    dam: mob.dam || 0,
    init: mob.init || 0,
  });

  function handleChange(e: React.ChangeEvent, field: keyof Combatant) {
    const eventTarget = e.target as HTMLInputElement;
    const value =
      field === "name" ? eventTarget.value : Number(eventTarget.value);
    const updated = { ...form, [field]: value };
    setForm(updated);
    dispatch(gameTableSlice.changeCombatant({ id: mob.id, ...updated }));
  }

  return (
    <div className={styles.mobLine}>
      <input
        className={`${styles.mobCellName} ${styles.mobCell}`}
        value={form.name}
        onChange={(e) => handleChange(e, "name")}
      />
      <input
        className={styles.mobCell}
        value={form.hp}
        onChange={(e) => handleChange(e, "hp")}
      />
      <input
        className={styles.mobCell}
        value={form.dam}
        onChange={(e) => handleChange(e, "dam")}
      />
      <input
        className={styles.mobCell}
        value={form.init}
        onChange={(e) => handleChange(e, "init")}
      />
      <button
        className={styles.mobButton}
        onClick={() => dispatch(gameTableSlice.removeCombatant(mob.id))}
      >
        ✖
      </button>
    </div>
  );
});

export default function GameTable() {
  const dispatch: AppDispatch = useDispatch();
  const mobId = useSelector((state: RootState) => state.gameTable.mobId);
  const combatants = useSelector(
    (state: RootState) => state.gameTable.combatants
  );

  const combatantsGrid = combatants.map((item) => {
    return <Combatant key={item.id} mob={item} />;
  });

  useEffect(() => {
    setForm({
      id: mobId,
      name: `Mob ${mobId}`,
      hp: 0,
      dam: 0,
      init: 0,
    });
  }, [mobId]);

  const [form, setForm] = useState({
    id: mobId,
    name: `Mob ${mobId}`,
    hp: 0,
    dam: 0,
    init: 0,
  });

  function handleChange(e: React.ChangeEvent, field: keyof Combatant) {
    const eventTarget = e.target as HTMLInputElement;
    const value =
      field === "name" ? eventTarget.value : Number(eventTarget.value);
    const updated = { ...form, [field]: value };
    setForm(updated);
  }

  function addButton() {
    const newMob = { ...form };

    setForm({
      id: mobId + 1,
      name: `Mob ${mobId + 1}`,
      hp: 0,
      dam: 0,
      init: 0,
    });

    dispatch(gameTableSlice.addCombatant(newMob));
    dispatch(gameTableSlice.incMobId());
  }

  function sortList() {
    dispatch(gameTableSlice.sortCombatants());
  }

  return (
    <div className={styles.combatTable}>
      <div className={styles.mobLine}>
        <div className={`${styles.mobCellName} ${styles.mobCell}`}>Name</div>
        <div className={styles.mobCell}>HP</div>
        <div className={styles.mobCell}>Damage</div>
        <div className={styles.mobCell}>Init</div>
        <button className={styles.mobButton} onClick={sortList}>
          ⇅
        </button>
      </div>
      <div className={styles.mobLine}>
        <input
          className={`${styles.mobCellName} ${styles.mobCell}`}
          value={form.name}
          onChange={(e) => handleChange(e, "name")}
        ></input>
        <input
          className={styles.mobCell}
          value={form.hp}
          onChange={(e) => handleChange(e, "hp")}
        ></input>
        <input
          className={styles.mobCell}
          value={form.dam}
          onChange={(e) => handleChange(e, "dam")}
        ></input>
        <input
          className={styles.mobCell}
          value={form.init}
          onChange={(e) => handleChange(e, "init")}
        ></input>
        <button className={styles.mobButton} onClick={addButton}>
          Add
        </button>
      </div>
      {combatantsGrid}
    </div>
  );
}
