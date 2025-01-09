'use client';

import React from "react";
import { useState, useEffect } from 'react';
import { WidthProvider, Responsive } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import styles from "./MainBlock.module.css";
import { useRootContext } from '../app/layout';
import WindowComponent from './windows/WindowComponent';

const GridLayout = WidthProvider(Responsive);

export default function MainBlock() {
  const { layout, setLayout, winList, userRole } = useRootContext();
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 10, md: 6, sm: 2, xs: 1, xxs: 1 };

  const winArray = layout.map((item) => {
    if (winList[userRole][item.i]){
      return ( 
        <div 
          key={item.i} 
          className={`${styles.floatingBlock} react-grid-item`}
        >
          <WindowComponent title={item.i} />
        </div>
      )
    }
  }); 


  return (
    <GridLayout
      className="layout"
      layouts={{ lg: layout }} 
      breakpoints={breakpoints} 
      cols={cols} 
      rowHeight={10}
      onResizeStop={(layout, oldItem, newItem) => {
        const updatedElement = layout.find((item) => item.i === newItem.i);
        console.log("Updated element:", updatedElement);
        localStorage.setItem('layout', JSON.stringify(layout));
      }}
      onDragStop={(layout, oldItem, newItem) => {
        const updatedElement = layout.find((item) => item.i === newItem.i);
        console.log("Updated element:", updatedElement);
        localStorage.setItem('layout', JSON.stringify(layout));
      }}      
    >
      {winArray}
    </GridLayout>
  );
}

