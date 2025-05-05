"use client";

import styles from "./GlobalMap.module.css";
//import MapComponent from "../../map/MapComponent";
import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";

const GlobalMapTemp = dynamic(() => import("../../map/MapComponent"), {
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
