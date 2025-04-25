"use client";

import React from "react";
import { useState, useEffect } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import styles from "./MainBlock.module.css";
import WindowComponent from "./windows/WindowComponent";
import { useSelector, useDispatch } from "react-redux";
import * as actions from "../app/store/slices/mainSlice";
import type { RootState } from "../app/store/store";
import { LayoutLine } from "../app/store/slices/mainSlice";

const GridLayout = WidthProvider(Responsive);

export default function MainBlock() {
  const dispatch = useDispatch();
  const layout = useSelector((state: RootState) => state.main.layout);
  const loginState = useSelector((state: RootState) => state.main.loginState);

  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 10, md: 6, sm: 4, xs: 1, xxs: 1 };

  const winArray = layout.map((item: LayoutLine) => {
    if (loginState || item.i === "Game Map" || item.i === "Polydice") {
      return (
        <div key={item.i} className={`${styles.floatingBlock} react-grid-item`}>
          <WindowComponent title={item.i} />
        </div>
      );
    } else {
      return (
        <div
          key={item.i}
          className={`${styles.floatingBlock} react-grid-item`}
          style={{ display: "none" }}
        >
          <WindowComponent title={item.i} />
        </div>
      );
    }
  });

  return (
    <GridLayout
      className="layout"
      layouts={{ lg: layout }}
      breakpoints={breakpoints}
      cols={cols}
      rowHeight={3}
      margin={[10, 20]}
      onResizeStop={(
        newLayout: LayoutLine[],
        oldItem: LayoutLine,
        newItem: LayoutLine
      ) => {
        dispatch(actions.setLayout(newLayout));
      }}
      onDragStop={(
        newLayout: LayoutLine[],
        oldItem: LayoutLine,
        newItem: LayoutLine
      ) => {
        dispatch(actions.setLayout(newLayout));
      }}
      draggableHandle=".my-drag-handle"
    >
      {winArray}
    </GridLayout>
  );
}
