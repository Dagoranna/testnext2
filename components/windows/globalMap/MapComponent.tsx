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
import { useSelector, useDispatch } from "react-redux";
import type {
  SectionName,
  MessageForServer,
} from "../../../app/store/slices/websocketSlice";
import { manageWebsocket } from "../../../app/store/slices/websocketSlice";
import * as globalMapSlice from "../../../app/store/slices/globalMapSlice";
import type { RootState, AppDispatch } from "../../../app/store/store";
import * as clientUtils from "../../../utils/clientUtils";

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
  const globalmapRef = useRef(null);
  const mapContainerRef = useRef(null);

  const dispatch: AppDispatch = useDispatch();
  const points = useSelector((state: RootState) => state.globalMap.points);
  const routeLength = useSelector(
    (state: RootState) => state.globalMap.routeLength
  );

  const userRole = useSelector((state: RootState) => state.main.userRole);
  const userName = useSelector((state: RootState) => state.main.userName);
  const userColor = useSelector((state: RootState) => state.main.userColor);

  const connectionState = useSelector(
    (state: RootState) => state.websocket.connectionState
  );
  const serverMessage = useSelector(
    (state: RootState) => state.websocket.serverMessage
  );
  const gameId = useSelector((state: RootState) => state.websocket.gameId);

  const handleClick = (latlng: L.LatLng) => {
    dispatch(globalMapSlice.addPoint({ lat: latlng.lat, lng: latlng.lng }));

    const lastPoint = latlng;
    let prevPoint: globalMapSlice.LatLng;

    if (points.length > 0) {
      prevPoint = points[points.length - 1];
    } else {
      prevPoint = lastPoint;
    }
    const lastRouteLength = Math.sqrt(
      (Math.abs(prevPoint.lat) - Math.abs(lastPoint.lat)) ** 2 +
        (Math.abs(prevPoint.lng) - Math.abs(lastPoint.lng)) ** 2
    );
    dispatch(
      globalMapSlice.setRouteLength(
        routeLength + Math.round(lastRouteLength * (120 / 9.4))
      )
    );
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

  function shareRoute() {
    console.log("share route");
    if (connectionState !== 1 || userRole !== "Master") return;

    const messageForServer: MessageForServer = {
      gameId: gameId,
      user: {
        userRole: userRole,
        userName: userName,
        userColor: userColor,
      },
      sectionName: "globalMap",
      sectionInfo: {
        route: JSON.stringify(points),
        routeLength: routeLength,
      },
    };

    dispatch(
      manageWebsocket(
        "send",
        process.env.NEXT_PUBLIC_SERVER_URL,
        messageForServer
      )
    );
  }

  useEffect(() => {
    if (!clientUtils.isValidJSON(serverMessage)) return;
    let messageJSON = JSON.parse(serverMessage);
    if (!messageJSON?.sectionName || messageJSON.sectionName !== "globalMap")
      return;

    let receivedPoints: globalMapSlice.LatLng[] = [];
    receivedPoints = JSON.parse(messageJSON.sectionInfo.route);
    dispatch(globalMapSlice.setPointsArray(receivedPoints));
    dispatch(
      globalMapSlice.setRouteLength(messageJSON.sectionInfo.routeLength)
    );
  }, [serverMessage]);

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
            dispatch(globalMapSlice.setPointsArray([]));
            dispatch(globalMapSlice.setRouteLength(0));
          }}
        >
          Reset Route
        </button>
        {userRole === "Master" && (
          <button className="mainButton" onClick={() => shareRoute()}>
            Share Route
          </button>
        )}
      </div>
    </div>
  );
};

export default MapComponent;
