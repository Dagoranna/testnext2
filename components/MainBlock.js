'use client';

import React from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import styles from "./MainBlock.module.css";

const GridLayout = WidthProvider(Responsive);

export default function MainBlock() {
    const layout = [
        { i: "gameMap", x: 0, y: 0, w: 4, h: 30 },
        { i: "polydice", x: 4, y: 0, w: 2, h: 15 },
    ];

    const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
    const cols = { lg: 10, md: 6, sm: 2, xs: 1, xxs: 1 };

    return (
        <GridLayout
            className="layout"
            layouts={{ lg: layout }} 
            breakpoints={breakpoints} 
            cols={cols} 
            rowHeight={10}
        >
            <div key="gameMap" className={`${styles.floatingBlock} react-grid-item`}>gameMap</div>
            <div key="polydice" className={`${styles.floatingBlock} react-grid-item`}>polydice</div>
        </GridLayout>
    );
}
