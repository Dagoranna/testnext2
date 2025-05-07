"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  useMapEvent,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./MapComponent.module.css";

const customIcon = new L.Icon({
  iconUrl: "/images/marker2.webp",
  iconSize: [25, 41],
  iconAnchor: [12, 39],
  shadowUrl: null,
});

function MapEventHandler({ handleClick }) {
  useMapEvent("click", (e) => handleClick(e.latlng));
  return null;
}

const MapComponent: React.FC = () => {
  const [points, setPoints] = useState<L.LatLng[]>([]);
  const [routeLength, setRouteLength] = useState<number>(0);
  const globalmapRef = useRef(null);
  const mapContainerRef = useRef(null);

  const handleClick = (latlng: L.LatLng) => {
    setPoints([...points, latlng]);
    const lastPoint = latlng;
    let prevPoint: L.LatLng;

    if (points.length > 0) {
      prevPoint = points[points.length - 1];
    } else {
      prevPoint = lastPoint;
    }
    const lastRouteLength = Math.sqrt(
      (Math.abs(prevPoint.lat) - Math.abs(lastPoint.lat)) ** 2 +
        (Math.abs(prevPoint.lng) - Math.abs(lastPoint.lng)) ** 2
    );

    setRouteLength(routeLength + Math.round(lastRouteLength * (120 / 9.4)));
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (globalmapRef.current) {
        globalmapRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      if (mapContainerRef.current) {
        resizeObserver.unobserve(mapContainerRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.globalMapWrapper} ref={mapContainerRef}>
      <MapContainer
        center={[-100, 156]}
        zoom={1}
        crs={L.CRS.Simple}
        className={styles.mapContainer}
        maxZoom={4}
        minZoom={0}
        bounds={[
          [-200, 0],
          [0, 312],
        ]}
        ref={globalmapRef}
      >
        <TileLayer
          url="/images/tiles/{z}/{x}/{y}.webp"
          tileSize={L.point(312, 200)}
          noWrap={true}
        />
        <MapEventHandler handleClick={handleClick} />
        {points.map((point, idx) => (
          <Marker key={idx} position={point} icon={customIcon} />
        ))}
        {points.length >= 2 && <Polyline positions={points} color="red" />}
      </MapContainer>
      <div className={styles.buttonContainer}>
        <div className={styles.routeDiv}>Route length: {routeLength} miles</div>
        <button
          className="mainButton"
          onClick={() => {
            setPoints([]);
            setRouteLength(0);
          }}
        >
          Reset route
        </button>
      </div>
    </div>
  );
};

export default MapComponent;
