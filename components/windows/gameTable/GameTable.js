"use client";

import styles from "./GameTable.module.css";
import React from "react";
import { useRef, useEffect, useState, useMemo, cloneElement } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as gameTableSlice from "../../../app/store/slices/gameTableSlice";

const Combatant = React.memo(function Combatant({ mob }) {
  //mob = {id: ***, name: ***, hp: ***, dam: ***, init: ***}
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    id: mob.id || 0,
    name: mob.name || "",
    hp: mob.hp || 0,
    dam: mob.dam || 0,
    init: mob.init || 0,
  });

  function handleChange(e, field) {
    const value = e.target.value;
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
  const dispatch = useDispatch();
  const mobId = useSelector((state) => state.gameTable.mobId);
  const combatants = useSelector((state) => state.gameTable.combatants);

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

  function handleChange(e, field) {
    const value = e.target.value;
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
