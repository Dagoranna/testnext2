"use client";

import styles from "./GlobalMap.module.css";
import React from "react";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";

const GlobalMapTemp = dynamic(() => import("./MapComponent"), {
  ssr: false,
});

const GlobalMap: React.FC = () => {
  return (
    <div className={styles.globalMapWrapper}>
      <GlobalMapTemp />
    </div>
  );
};

export default GlobalMap;
