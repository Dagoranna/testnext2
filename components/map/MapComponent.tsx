"use client";

import styles from "./MapComponent.module.css";
import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/*const CustomCRS = L.Util.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, -1, 0),
});*/

const MapComponent: React.FC = () => {
  return (
    <div className={styles.globalMapWrapper}>
      <MapContainer
        center={[-128, 128]}
        zoom={1}
        maxZoom={4}
        minZoom={0}
        crs={L.CRS.Simple}
        className={styles.mapContainer}
      >
        <TileLayer
          tileSize={256}
          url="/images/tiles/{z}/{x}/{y}.webp"
          eventHandlers={{
            tileerror: (e) => {
              //console.log("Tile load error", e);
              console.log("Tile URL", e.tile.src);
            },
          }}
        />
      </MapContainer>
      <div className={styles.buttonContainer}>
        <button>Button1</button>
      </div>
    </div>
  );
};

export default MapComponent;

/*
const MapComponent: React.FC = () => {
  return (
    <div className={styles.globalMapWrapper}>
      <MapContainer
        center={[1592, 2381]}
        zoom={0}
        crs={L.CRS.Simple}
        className={styles.mapContainer}
        maxZoom={4}
        minZoom={0}
        bounds={[
          [0, 0],
          [3185, 4763],
        ]}
        maxBounds={[
          [0, 0],
          [3185, 4763],
        ]}
      >
        <TileLayer
          url="/images/tiles/{z}/{x}/{y}.webp"
          tileSize={256}
          noWrap={true}
          bounds={[
            [0, 0],
            [3185, 4763],
          ]}
          eventHandlers={{
            tileerror: (e) => {
              console.log("Tile load error", e);
              console.log("Tile URL", e.tile.src);
            },
          }}
        />
      </MapContainer>
      <div className={styles.buttonContainer}>
        <button>Button1</button>
      </div>
    </div>
  );
};

*/
