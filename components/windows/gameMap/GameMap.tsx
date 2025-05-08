"use client";

import styles from "./GameMap.module.css";
import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";
import React, { ReactElement } from "react";
import { useRef, useEffect, useState, useMemo, cloneElement } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as mapSlice from "../../../app/store/slices/mapSlice";
import { manageWebsocket } from "../../../app/store/slices/websocketSlice";
import * as clientUtils from "../../../utils/clientUtils";
import FormWrapper from "../../forms/FormWrapper";
import parse from "html-react-parser";

import type {
  SectionName,
  MessageForServer,
} from "../../../app/store/slices/websocketSlice";
import type { RootState, AppDispatch } from "../../../app/store/store";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Layer } from "../../../app/store/slices/mapSlice";

const CELL_SIZE = 20;
const MARKER_RADIUS = 5;
const radToDeg = (rad: number) => rad * (180 / Math.PI);
const mainBGColor = "rgb(227, 214, 199)";
const colorsObj = [
  "black",
  "gray",
  "silver",
  "white",
  "brown",
  "red",
  "purple",
  "fuchsia",
  "olive",
  "green",
  "lime",
  "yellow",
  "navy",
  "blue",
  "teal",
  "aqua",
];

interface StartPoint {
  x: number;
  y: number;
  elemLeft?: number;
  elemTop?: number;
}

export default function GameMap() {
  return (
    <div className={styles.gameMapWrapper}>
      <MapField />
      <Palette />
    </div>
  );
}

function MapField() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapOuter = useRef<HTMLDivElement>(null);
  const dispatch: AppDispatch = useDispatch();
  const activeColor = useSelector(
    (state: RootState) => state.map.activePaletteStyle.color
  );
  const activeForm = useSelector(
    (state: RootState) => state.map.activePaletteStyle.form
  );
  const activeAction = useSelector(
    (state: RootState) => state.map.activePaletteAction
  );
  const activeLayer = useSelector(
    (state: RootState) => state.map.activePaletteStyle.layer
  );
  const gridBinding = useSelector(
    (state: RootState) => state.map.activePaletteStyle.bindToGrid
  );
  const mapContent = useSelector((state: RootState) => state.map.mapContent);
  const mapElemsCounter = useSelector(
    (state: RootState) => state.map.mapElemsCounter
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
  const elemFromLib = useSelector((state: RootState) => state.map.elemFromLib);

  const [isDragging, setIsDragging] = useState(false);
  const [draggingObject, setDraggingObject] = useState<HTMLDivElement | null>(
    null
  );
  const [startPoint, setStartPoint] = useState<StartPoint | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizingObject, setResizingObject] = useState<HTMLDivElement | null>(
    null
  );
  const [isRotating, setIsRotating] = useState(false);
  const [rotatingObject, setRotatingObject] = useState<HTMLDivElement | null>(
    null
  );
  const [isSelecting, setIsSelecting] = useState(false);
  const [screenSize, setScreenSize] = useState<[number, number]>([0, 0]);
  const [isWriting, setIsWriting] = useState(false);
  const [writtenObject, setWrittenObject] = useState<HTMLDivElement | null>(
    null
  );
  const [writtenTextElem, setWrittenTextElem] =
    useState<HTMLInputElement | null>(null);

  let tempObj: HTMLDivElement | null = null;
  let traceDiameter = 0;
  let handlingStarted = false;

  useEffect(() => {
    setScreenSize([window.innerWidth, window.innerHeight]);
  }, []);

  function mapOnMouseDown(e: React.MouseEvent | React.PointerEvent) {
    const gameMap = mapRef.current;

    if (activeAction === null) {
      return;
    } else {
      e.preventDefault();
      e.stopPropagation();
      if ("pointerType" in e) {
        if (e.pointerType === "touch") {
          if (!e.isPrimary) return;
        }
      }
    }

    const eventTarget = e.target as HTMLElement;

    if (activeAction === "brush") {
      //all actions on mouseUp
    } else if (activeAction === "arrow") {
      const eventTargetName = eventTarget.getAttribute("data-name");
      if (eventTargetName === "elemResizer") {
        //resizing
        setIsResizing(true);
        setResizingObject(eventTarget.parentElement as HTMLDivElement);
        let rect = eventTarget.parentElement.getBoundingClientRect();

        let traceItem = document.createElement("div");
        traceItem.className = styles.paletteTraceElem;
        traceItem.style.left = rect.left + window.scrollX + "px";
        traceItem.style.top = rect.top + window.scrollY + "px";
        traceItem.style.width = rect.width + "px";
        traceItem.style.height = rect.height + "px";
        traceItem.id = "traceItem";
        document.body.append(traceItem);
      } else if (eventTargetName === "mapElem") {
        //dragging
        setIsDragging(true);
        setDraggingObject(eventTarget as HTMLDivElement);

        const gameMap = mapRef.current;
        const gameMapRect = gameMap.getBoundingClientRect();

        let traceItem = document.createElement("div");
        traceItem.className = styles.paletteTraceElem;

        traceItem.style.left =
          parseInt(eventTarget.style.left) +
          gameMapRect.left +
          window.scrollX +
          "px";
        traceItem.style.top =
          parseInt(eventTarget.style.top) +
          gameMapRect.top +
          window.scrollY +
          "px";
        traceItem.style.width = eventTarget.style.width;
        traceItem.style.height = eventTarget.style.height;
        traceItem.style.transform = eventTarget.style.transform;
        traceItem.id = "traceItem";

        setStartPoint({
          x: e.pageX,
          y: e.pageY,
          elemLeft: parseInt(traceItem.style.left) || 0,
          elemTop: parseInt(traceItem.style.top) || 0,
        });

        document.body.append(traceItem);
      } else if (eventTargetName === "mapField") {
        //selecting
        setIsSelecting(true);
        setStartPoint({
          x: e.pageX,
          y: e.pageY,
        });

        let traceItem = document.createElement("div");
        traceItem.className = styles.paletteTraceElem;
        traceItem.style.left = e.pageX + "px";
        traceItem.style.top = e.pageY + "px";
        traceItem.style.width = "0";
        traceItem.style.height = "0";
        traceItem.id = "traceItem";
        document.body.append(traceItem);
      }
    } else if (activeAction === "rotate") {
      if (isRotating) return;
      if (handlingStarted) return;
      let rectObject: HTMLDivElement = eventTarget.closest(
        '[data-name="mapElem"]'
      );
      if (!rectObject) return;
      setIsRotating(true);
      setRotatingObject(rectObject);
      rectObject.style.transform = "none";
      let rect = rectObject.getBoundingClientRect();
      traceDiameter = Math.round(Math.sqrt(rect.width ** 2 + rect.height ** 2));

      let traceItem = document.createElement("div");
      traceItem.className = styles.paletteTraceElem;
      traceItem.style.left = rect.left + window.scrollX + "px";
      traceItem.style.top = rect.top + window.scrollY + "px";
      traceItem.style.width = rect.width + "px";
      traceItem.style.height = rect.height + "px";
      traceItem.id = "traceItem";

      let traceItemCircle = document.createElement("div");
      traceItemCircle.className = styles.paletteTraceElemCircle;
      traceItemCircle.style.left =
        rect.left - (traceDiameter - rect.width) / 2 + window.scrollX + "px";
      traceItemCircle.style.top =
        rect.top - (traceDiameter - rect.height) / 2 + window.scrollY + "px";
      traceItemCircle.style.width = traceDiameter + "px";
      traceItemCircle.style.height = traceDiameter + "px";
      traceItemCircle.id = "traceItemCircle";

      let traceItemMarker = document.createElement("div");
      traceItemMarker.className = styles.paletteTraceMarker;
      //3 = border width
      traceItemMarker.style.left = traceDiameter / 2 - 3 - MARKER_RADIUS + "px";
      traceItemMarker.style.top = -MARKER_RADIUS - 3 + "px";
      traceItemMarker.id = "traceItemMarker";

      let tempStart = {
        x: rect.left - (traceDiameter - rect.width) / 2 + window.scrollX,
        y: rect.top - (traceDiameter - rect.height) / 2 + window.scrollY,
      };

      setStartPoint(tempStart);

      let traceItemMarker2 = document.createElement("div");
      traceItemMarker2.className = styles.paletteTraceMarker;
      traceItemMarker2.style.left = traceItemMarker.style.left;
      traceItemMarker2.style.top =
        parseInt(traceItemMarker.style.top) + traceDiameter / 2 + "px";
      traceItemMarker2.style.backgroundColor = "red";
      traceItemMarker2.id = "traceItemMarker2";

      let traceItemMarker3 = document.createElement("div");
      traceItemMarker3.className = styles.paletteTraceMarker;
      traceItemMarker3.style.left = e.pageX - MARKER_RADIUS + "px";
      traceItemMarker3.style.top = e.pageY - MARKER_RADIUS + "px";
      traceItemMarker3.style.backgroundColor = "green";
      traceItemMarker3.id = "traceItemMarker3";

      document.body.append(traceItemCircle);
      traceItemCircle.append(traceItemMarker);
      traceItemCircle.append(traceItemMarker2);
      document.body.append(traceItemMarker3);
      document.body.append(traceItem);
    } else if (activeAction === "text") {
      setIsWriting(false);
      setWrittenObject(null);
      document.querySelector("[data-name = 'textInput']")?.remove();
    }
  }

  function mapOnMouseMove(e: React.MouseEvent) {
    const gameMap = mapRef.current;

    if (activeAction === null) {
      return;
    } else {
      e.preventDefault();
      e.stopPropagation();
    }

    let mouseX: number, mouseY: number;

    mouseX = e.pageX;
    mouseY = e.pageY;

    if (isResizing) {
      tempObj = document.getElementById("traceItem") as HTMLDivElement;

      const newWidth = mouseX - parseInt(tempObj.style.left);
      const newHeight = mouseY - parseInt(tempObj.style.top);
      tempObj.style.width = newWidth > 0 ? newWidth + "px" : "2px";
      tempObj.style.height = newHeight > 0 ? newHeight + "px" : "2px";
    } else if (isDragging) {
      tempObj = document.getElementById("traceItem") as HTMLDivElement;

      const newLeft = startPoint.elemLeft + (e.pageX - startPoint.x);
      const newTop = startPoint.elemTop + (e.pageY - startPoint.y);

      tempObj.style.left = newLeft + "px";
      tempObj.style.top = newTop + "px";
    } else if (isRotating) {
      let m3 = document.getElementById("traceItemMarker3");
      let m2 = document.getElementById("traceItemMarker2");
      let circle = document.getElementById("traceItemCircle");
      m3.style.left = e.pageX - MARKER_RADIUS + "px";
      m3.style.top = e.pageY - MARKER_RADIUS + "px";

      let rotated = document.getElementById("traceItem");

      let dx = m3.getBoundingClientRect().x - m2.getBoundingClientRect().x;
      let dy = m2.getBoundingClientRect().y - m3.getBoundingClientRect().y;

      let alpha = Math.atan(dx / dy);
      if (dy < 0) alpha += Math.PI;

      rotated.style.transform = `rotate(${radToDeg(alpha)}deg)`;
      circle.style.transform = `rotate(${radToDeg(alpha)}deg)`;
    } else if (isSelecting) {
      let traceItem = document.getElementById("traceItem");
      traceItem.style.width = mouseX - parseInt(traceItem.style.left) + "px";
      traceItem.style.height = mouseY - parseInt(traceItem.style.top) + "px";
    }
  }

  function mapOnMouseUp(
    e: React.MouseEvent | React.PointerEvent,
    fromLeave = false
  ) {
    if (fromLeave && activeAction !== "arrow") {
      return;
    }

    const gameMap = mapRef.current;
    const gameMapRect = gameMap.getBoundingClientRect();
    const eventTarget = e.target as HTMLElement;

    if (activeAction === null) {
      return;
    } else {
      e.preventDefault();
      e.stopPropagation();
    }

    if (e.type === "pointerleave") {
      if (activeAction !== "arrow") return;
    }

    if (activeAction === "brush") {
      let elemX: string | number, elemY: string | number;

      if (!gridBinding) {
        elemX =
          e.pageX -
          gameMapRect.left +
          gameMap.scrollLeft -
          window.scrollX -
          CELL_SIZE / 2;
        elemY =
          e.pageY -
          gameMapRect.top +
          gameMap.scrollTop -
          window.scrollY -
          CELL_SIZE / 2;
        elemX = elemX + "px";
        elemY = elemY + "px";
      } else {
        elemX =
          e.pageX -
          gameMapRect.left +
          gameMap.scrollLeft -
          window.scrollX -
          CELL_SIZE / 2;
        elemY =
          e.pageY -
          gameMapRect.top +
          gameMap.scrollTop -
          window.scrollY -
          CELL_SIZE / 2;
        elemX = Math.round(elemX / CELL_SIZE) * CELL_SIZE + "px";
        elemY = Math.round(elemY / CELL_SIZE) * CELL_SIZE + "px";
      }

      let copyID = mapElemsCounter;

      let formClone: HTMLElement;
      const parser = new DOMParser();
      if (elemFromLib) {
        let textElemCopy = elemFromLib.replaceAll(
          'id="mapElem_',
          `id="mapElem_c_${copyID}_`
        );
        const doc = parser.parseFromString(textElemCopy, "text/html");
        formClone = doc.body.firstElementChild as HTMLElement;
        formClone.id = `mapElem_${copyID++}`;
        formClone.style.left = elemX;
        formClone.style.top = elemY;
        formClone.style.position = "absolute";
        formClone.style.outline = "none";
        formClone.setAttribute("data-name", "mapElem");
      } else {
        formClone = document
          .getElementById(activeForm)
          .cloneNode(true) as HTMLElement;
        formClone.id = `mapElem_${copyID++}`;
        formClone.style.left = elemX;
        formClone.style.top = elemY;
        formClone.style.width = CELL_SIZE + "px";
        formClone.style.height = CELL_SIZE + "px";
        formClone.style.position = "absolute";
        formClone.style.outline = "none";
        formClone.setAttribute("data-name", "mapElem");
      }

      if (activeColor == mainBGColor) {
        formClone.style.backgroundColor = mainBGColor;
        formClone.style.backgroundImage = `
            linear-gradient( transparent ${CELL_SIZE - 1}px, gray ${
              CELL_SIZE - 1
            }px),
            linear-gradient(90deg, transparent ${CELL_SIZE - 1}px, gray ${
              CELL_SIZE - 1
            }px)
          `;
        formClone.style.backgroundSize = `${CELL_SIZE}px ${CELL_SIZE}px`;
        formClone.style.backgroundPosition = `0 0, 0 0`;
        formClone.style.backgroundRepeat = `repeat, repeat`;
        formClone.style.border = "none";
      }

      switch (activeLayer) {
        case "top":
          formClone.style.zIndex = "20";
          break;
        case "middle":
          formClone.style.zIndex = "15";
          break;
        case "bottom":
          formClone.style.zIndex = "10";
          break;
      }

      let formCloneResizer = document.createElement("div");
      switch (activeLayer) {
        case "top":
          formCloneResizer.style.zIndex = "21";
          break;
        case "middle":
          formCloneResizer.style.zIndex = "16";
          break;
        case "bottom":
          formCloneResizer.style.zIndex = "11";
          break;
      }

      formCloneResizer.className = styles.mapElemResizer;
      formCloneResizer.setAttribute("data-name", "elemResizer");
      formClone.appendChild(formCloneResizer);

      dispatch(mapSlice.setMapElemsCounter(copyID));
      dispatch(mapSlice.addElemToMap(formClone.outerHTML));
    } else if (activeAction === "arrow") {
      if (isResizing) {
        tempObj = resizingObject.cloneNode(true) as HTMLDivElement;
        let mouseX: number, mouseY: number;

        if (!gridBinding) {
          mouseX =
            e.pageX - gameMapRect.left + gameMap.scrollLeft - window.scrollX;
          mouseY =
            e.pageY - gameMapRect.top + gameMap.scrollTop - window.scrollY;
        } else {
          mouseX =
            e.pageX - gameMapRect.left + gameMap.scrollLeft - window.scrollX;
          mouseY =
            e.pageY - gameMapRect.top + gameMap.scrollTop - window.scrollY;
          mouseX = Math.round(mouseX / CELL_SIZE) * CELL_SIZE;
          mouseY = Math.round(mouseY / CELL_SIZE) * CELL_SIZE;
        }

        const oldWidth: string = tempObj.style.width;
        const oldHeight: string = tempObj.style.height;
        const newWidth = mouseX - parseInt(tempObj.style.left);
        const newHeight = mouseY - parseInt(tempObj.style.top);
        tempObj.style.width = newWidth > 0 ? newWidth + "px" : "2px";
        tempObj.style.height = newHeight > 0 ? newHeight + "px" : "2px";

        const coefX = newWidth / parseInt(oldWidth);
        const coefY = newHeight / parseInt(oldHeight);

        for (let elem of tempObj.children as HTMLCollectionOf<HTMLElement>) {
          if (elem.getAttribute("data-name") === "elemResizer") continue;
          if (elem.getAttribute("data-name") === "textField") continue;

          let elemWidth = parseInt(elem.style?.width)
            ? parseInt(elem.style?.width)
            : CELL_SIZE;
          elem.style.width = elemWidth * coefX + "px";
          elem.style.left = (parseInt(elem.style.left) + 1) * coefX - 1 + "px";
          let elemHeight = parseInt(elem.style?.height)
            ? parseInt(elem.style?.height)
            : CELL_SIZE;
          elem.style.height = elemHeight * coefY + "px";
          elem.style.top = (parseInt(elem.style.top) + 1) * coefY - 1 + "px";
        }

        dispatch(mapSlice.changeElemOnMap(tempObj.outerHTML));

        setIsResizing(false);
        setResizingObject(null);
        document.getElementById("traceItem").remove();
        tempObj = null;
      } else if (isDragging) {
        tempObj = draggingObject.cloneNode(true) as HTMLDivElement;
        let traceItem = document.getElementById("traceItem");
        if (!gridBinding) {
          tempObj.style.left =
            parseInt(traceItem.style.left) -
            gameMapRect.left +
            gameMap.scrollLeft -
            window.scrollX +
            "px";
          tempObj.style.top =
            parseInt(traceItem.style.top) -
            gameMapRect.top +
            gameMap.scrollTop -
            window.scrollY +
            "px";
        } else {
          let mouseX: number, mouseY: number;
          mouseX =
            parseInt(traceItem.style.left) -
            gameMapRect.left +
            gameMap.scrollLeft -
            window.scrollX;
          mouseY =
            parseInt(traceItem.style.top) -
            gameMapRect.top +
            gameMap.scrollTop -
            window.scrollY;
          tempObj.style.left =
            Math.round(mouseX / CELL_SIZE) * CELL_SIZE + "px";
          tempObj.style.top = Math.round(mouseY / CELL_SIZE) * CELL_SIZE + "px";
        }

        dispatch(mapSlice.changeElemOnMap(tempObj.outerHTML));
        setDraggingObject(null);
        setStartPoint(null);
        setIsDragging(false);
        traceItem.remove();
        tempObj = null;
      } else if (isSelecting) {
        setIsSelecting(false);
        let endPoint = { x: e.pageX, y: e.pageY };

        const tempSet = new Set<string>();

        mapContent.map((stringItem) => {
          const parsed = parse(stringItem) as ReactElement<{ id: string }>;
          const item = document.getElementById(parsed.props.id);

          let itemRect = item.getBoundingClientRect();
          if (
            startPoint.y < itemRect.top + window.scrollY &&
            itemRect.bottom + window.scrollY < endPoint.y &&
            itemRect.left + window.scrollX > startPoint.x &&
            itemRect.right + window.scrollX < endPoint.x
          ) {
            let tempI = item.cloneNode(true) as HTMLElement;
            tempI.style.outline = "3px dashed yellow";

            tempSet.add(tempI.id);

            dispatch(mapSlice.changeElemOnMap(tempI.outerHTML));
          } else {
            let tempI = item.cloneNode(true) as HTMLElement;
            tempI.style.outline = "none";
            dispatch(mapSlice.changeElemOnMap(tempI.outerHTML));
          }
        });

        document.getElementById("traceItem").remove();
        const tempArray = Array.from(tempSet);
        dispatch(mapSlice.setSelectedObjectsId(tempArray));
        setStartPoint({ x: 0, y: 0 });
      }
    } else if (activeAction === "rotate") {
      if (!isRotating) return;
      handlingStarted = true;
      setIsRotating(false);

      tempObj = rotatingObject.cloneNode(true) as HTMLDivElement;
      setStartPoint({ x: 0, y: 0 });

      let circle = document.getElementById("traceItemCircle");
      //"rotate(88deg)"
      const regex = /rotate\(([^.]*)\./;
      let angle = circle.style.transform.match(regex)
        ? parseInt(circle.style.transform.match(regex)[1])
        : 0;

      angle = Math.round(Number(angle) / 5) * 5;
      tempObj.style.transform = "rotate(" + angle + "deg)";

      setRotatingObject(null);
      document.getElementById("traceItem").remove();
      document.getElementById("traceItemCircle").remove();
      document.getElementById("traceItemMarker3").remove();

      dispatch(mapSlice.changeElemOnMap(tempObj.outerHTML));
      tempObj = null;
      handlingStarted = false;
    } else if (activeAction === "text") {
      e.preventDefault();
      e.stopPropagation();

      const gameMap = mapRef.current;
      const gameMapRect = gameMap.getBoundingClientRect();
      const mapOuterRef = mapOuter.current;

      let elem = eventTarget.closest('[data-name="mapElem"]') as HTMLDivElement;
      if (!elem) return;

      setIsWriting(true);
      setWrittenObject(elem);
      let textField = document.createElement("input");
      setWrittenTextElem(textField);
      textField.style.left =
        parseInt(elem.style.left) - mapOuterRef.scrollLeft + CELL_SIZE + "px";
      textField.style.top =
        parseInt(elem.style.top) - mapOuterRef.scrollTop + CELL_SIZE + "px";
      textField.setAttribute("data-name", "textInput");
      textField.className = styles.textInput;

      mapOuter.current.append(textField);
      textField.focus();

      textField.addEventListener("keyup", function (e) {
        if (e.code === "Enter" || e.key === "Enter") {
          //e.code failed for mobile
          e.preventDefault();

          let elemCopy = elem.cloneNode(true) as HTMLElement;
          let newText = document.createElement("div");
          newText.innerText = textField.value;
          newText.setAttribute("data-name", "textField");
          newText.setAttribute("class", styles.textField);
          elemCopy.querySelector("[data-name = 'textField']")?.remove();
          elemCopy.appendChild(newText);
          dispatch(mapSlice.changeElemOnMap(elemCopy.outerHTML));

          textField.remove();
          setIsWriting(false);
          setWrittenObject(null);
          setWrittenTextElem(null);
        }
      });
    }
  }

  useEffect(() => {
    if (!clientUtils.isValidJSON(serverMessage)) return;
    let messageJSON = JSON.parse(serverMessage);
    if (!messageJSON?.sectionName || messageJSON.sectionName !== "gameMap")
      return;
    //if (userRole === "Master") return;
    mapRef.current.innerHTML = JSON.parse(messageJSON.sectionInfo.mapField);
  }, [serverMessage]);

  useEffect(() => {
    if (connectionState === 1 && userRole === "Master") {
      const messageForServer: MessageForServer = {
        gameId: gameId,
        user: {
          userRole: userRole,
          userName: userName,
          userColor: userColor,
        },
        sectionName: "gameMap",
        sectionInfo: {
          mapField: JSON.stringify(mapRef.current.innerHTML),
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
  }, [mapContent]);

  useEffect(() => {
    if (activeAction === null) {
      mapRef.current.style.touchAction = "";
    } else {
      mapRef.current.style.touchAction = "none";
    }
  }, [activeAction]);

  return (
    <div
      className={styles.mapFieldWrapper}
      ref={mapOuter}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className={styles.mapField}
        ref={mapRef}
        data-name="mapField"
        onPointerUp={(e) => mapOnMouseUp(e)}
        onPointerDown={(e) => mapOnMouseDown(e)}
        onPointerMove={(e) => mapOnMouseMove(e)}
        onPointerLeave={(e) => mapOnMouseUp(e, true)}
      >
        {mapContent.map((item, index) => (
          <React.Fragment key={index}>{parse(item)}</React.Fragment>
        ))}
      </div>
    </div>
  );
}

function PaletteColorElem({
  elemClass = styles.paletteColorItem,
  elemText = "*",
  backgroundColor,
}) {
  const dispatch: AppDispatch = useDispatch();
  const selectedObjects = useSelector(
    (state: RootState) => state.map.selectedObjectsId
  );

  function chooseColor(e: React.MouseEvent) {
    const EventTarget = e.target as HTMLElement;
    let newBGColor = EventTarget.style.backgroundColor;
    dispatch(mapSlice.setActivePaletteColor(newBGColor));
    if (selectedObjects.length > 0) {
      selectedObjects.map((itemId) => {
        let elem = document.getElementById(itemId);
        elem.style.backgroundColor = newBGColor;
        dispatch(mapSlice.changeElemOnMap(elem.outerHTML));
      });
    }
  }

  const activeColor = useSelector(
    (state: RootState) => state.map.activePaletteStyle.color
  );
  let currentClass = "";
  let gridColumn = "";

  activeColor === backgroundColor
    ? (currentClass = `${elemClass} ${styles.activeElem}`)
    : (currentClass = `${elemClass}`);
  backgroundColor === mainBGColor || backgroundColor === "transparent"
    ? (gridColumn = "1 / 5")
    : (gridColumn = "auto");

  return (
    <div
      className={currentClass}
      style={{
        backgroundColor: backgroundColor,
        gridColumn: gridColumn,
      }}
      onClick={(e) => chooseColor(e)}
    >
      {elemText}
    </div>
  );
}

function PaletteColors() {
  const elemsArray = useMemo<React.ReactElement[]>(
    () =>
      colorsObj.map((bgColor) => (
        <PaletteColorElem key={bgColor} backgroundColor={bgColor} />
      )),
    [colorsObj]
  );

  return (
    <div className={styles.paletteColors}>
      <PaletteColorElem
        elemClass={styles.paletteColorTransparent}
        elemText="transparent"
        backgroundColor="transparent"
      />
      {elemsArray}
      <PaletteColorElem elemText="grid" backgroundColor={mainBGColor} />
    </div>
  );
}

function PaletteLayers() {
  const dispatch: AppDispatch = useDispatch();
  const activeLayer = useSelector(
    (state: RootState) => state.map.activePaletteStyle.layer
  );
  const selectedObjects = useSelector(
    (state: RootState) => state.map.selectedObjectsId
  );
  const gridBinding = useSelector(
    (state: RootState) => state.map.activePaletteStyle.bindToGrid
  );

  function changeLayer(layer: Layer) {
    dispatch(mapSlice.setActivePaletteLayer(layer));

    if (selectedObjects.length > 0) {
      let zLayer;
      switch (layer) {
        case "top":
          zLayer = 20;
          break;
        case "middle":
          zLayer = 15;
          break;
        case "bottom":
          zLayer = 10;
          break;
      }
      selectedObjects.map((itemId) => {
        let elem = document.getElementById(itemId);

        elem.style.zIndex = zLayer;
        dispatch(mapSlice.changeElemOnMap(elem.outerHTML));
      });
    }
  }

  return (
    <div className={styles.paletteLayers}>
      <div style={{ alignSelf: "flex-start" }}>Layers:</div>
      <div>
        <span>top:</span>
        <input
          name="layersSection"
          checked={activeLayer === "top"}
          type="radio"
          onChange={() => changeLayer("top")}
        />
      </div>
      <div>
        <span>middle:</span>
        <input
          name="layersSection"
          checked={activeLayer === "middle"}
          type="radio"
          onChange={() => changeLayer("middle")}
        />
      </div>
      <div>
        <span>bottom:</span>
        <input
          name="layersSection"
          checked={activeLayer === "bottom"}
          type="radio"
          onChange={() => changeLayer("bottom")}
        />
      </div>
      <div>
        <span>bind to grid:</span>
        <input
          type="checkbox"
          checked={gridBinding}
          onChange={() => dispatch(mapSlice.switchGridBinding())}
        />
      </div>
    </div>
  );
}

function PaletteForms() {
  return (
    <div className={styles.paletteForms}>
      <PaletteFormsSimple />
      <PaletteFormsButtons />
    </div>
  );
}

function PaletteFormsSimple() {
  return (
    <div className={styles.paletteFormsSimple}>
      {Array.from({ length: 18 }, (_, i) => (
        <PaletteElem key={i} id={`elemForm_${i}`} />
      ))}
    </div>
  );
}

function PaletteFormsButtons() {
  const dispatch: AppDispatch = useDispatch();
  const userEmail = useSelector((state: RootState) => state.main.userEmail);
  const loginState = useSelector((state: RootState) => state.main.loginState);
  const selectedObjectsId = useSelector(
    (state: RootState) => state.map.selectedObjectsId
  );
  const [elemForSaving, setElemForSaving] = useState(
    "<div style='gridColumn: span 15; textAlign: center;'>Select a single object</div>"
  );
  const [libraryContent, setLibraryContent] = useState(
    "<div style='gridColumn: span 15; textAlign: center;'></div>"
  );
  const elemFromLib = useSelector((state: RootState) => state.map.elemFromLib);
  const [isLocalOpened, setIsLocalOpened] = useState(false);

  const addButtonStyle = {
    minWidth: "1rem",
    borderWidth: "2px",
    margin: "3px",
    width: "fit-content",
    alignSelf: "center",
    padding: "3px",
    borderRadius: "5px",
  };

  const addFormStyle = {
    width: "300px",
    height: "350px",
    top: "0",
    display: "flex",
    flexDirection: "column",
    right: "0",
  };

  function captureElem() {
    setElemForSaving(
      "<div style='gridColumn: span 15; textAlign: center;'></div>"
    );
    let windowContent = (
      <div style={{ gridColumn: "span 15", textAlign: "center" }}>
        Select a single object
      </div>
    );
    if (selectedObjectsId.length === 1) {
      let selectedObj = document.getElementById(selectedObjectsId[0]);
      if (selectedObj) {
        windowContent = parse(selectedObj.outerHTML) as React.JSX.Element;
        windowContent.props.style.outline = "2px dotted black";
        windowContent.props.style.left = "auto"; //"28px";
        windowContent.props.style.top = "auto"; //43px";
        windowContent.props.style.position = "relative";
        windowContent.props.style.gridColumn = `span
          ${Math.ceil(parseInt(windowContent.props.style.width) / CELL_SIZE)}`;
        windowContent.props.style.gridRow = `span 
          ${Math.ceil(parseInt(windowContent.props.style.height) / CELL_SIZE)}`;
        windowContent = cloneElement(windowContent, {
          className:
            (windowContent.props.className || "").replace(
              /\bGameMap_activeElem\S*\b/g,
              ""
            ) +
            " " +
            styles.savingElem,
          id: Date.now().toString(),
        });
      }
      setElemForSaving(ReactDOMServer.renderToStaticMarkup(windowContent));
    }
  }
  //activeElem
  async function saveElem() {
    let elem = ReactDOMServer.renderToStaticMarkup(elemForSaving);
    if (!elem) return;
    if (!elem.includes("GameMap_savingElem")) return;

    setElemForSaving(
      "<div style='gridColumn: span 15; textAlign: center;'>Saving...</div>"
    );
    let response = await fetch("/api/gamedata/gamemap/saveelem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        callbackUrl: "/",
        email: userEmail,
        elem: elem,
      }),
    });

    let baseResponse = await response.json();

    if (response.ok) {
      setElemForSaving(
        "<div style='gridColumn: span 15; textAlign: center;'>Saved!</div>"
      );
    } else {
      setElemForSaving(
        `<div style='gridColumn: span 15; textAlign: center;'>${baseResponse.message}</div>`
      );
      //throw new Error("error in database response");
    }
  }

  async function loadLocalLibrary(e: React.MouseEvent | React.PointerEvent) {
    e.stopPropagation();
    setLibraryContent(
      "<div style='gridColumn: span 15; textAlign: center;'>Loading...</div>"
    );
    let response = await fetch("/api/gamedata/gamemap/loadelem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        callbackUrl: "/",
        email: userEmail,
      }),
    });

    let baseResponse = await response.json();
    if (response.ok) {
      if (baseResponse.loadState) {
        let parsedElems = JSON.parse(baseResponse.message);

        parsedElems = parsedElems.map((item: string) => {
          return parse(item);
        });

        let elemsHeap = parsedElems.reduce((res: string, item: string) => {
          let newItem = parse(item) as ReactElement<any>;
          newItem.props.style.position = "relative";
          newItem.props.style.top = "auto";
          newItem.props.style.left = "auto";

          newItem = cloneElement(newItem, {
            className: (newItem.props.className || "")
              .replace(/\bGameMap_savingElem\S*\b/g, "")
              .trim(),
          });
          let stringItem = ReactDOMServer.renderToStaticMarkup(newItem);
          return res + stringItem;
        }, "");

        setIsLocalOpened(true);
        if (parsedElems.length == 0) {
          setLibraryContent(
            "<div style='gridColumn: span 15; textAlign: center;'>Library is empty</div>"
          );
        } else {
          setLibraryContent(elemsHeap);
        }
      } else {
        console.log(baseResponse.message);
      }
    } else {
      setLibraryContent(
        "<div style='gridColumn: span 15; textAlign: center;'>Library is empty</div>"
      );
    }
  }

  async function loadGlobalLibrary(e: React.MouseEvent | React.PointerEvent) {
    e.stopPropagation();
    setLibraryContent(
      "<div style='gridColumn: span 15; textAlign: center;'>Loading...</div>"
    );
    let response = await fetch("/api/gamedata/gamemap/loadglobalelem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        callbackUrl: "/",
      }),
    });

    let baseResponse = await response.json();
    if (response.ok) {
      if (baseResponse.loadState) {
        let parsedElems = JSON.parse(baseResponse.message);

        parsedElems = parsedElems.map((item: string) => {
          return parse(item);
        });

        let elemsHeap = parsedElems.reduce((res: string, item: string) => {
          let newItem = parse(item) as ReactElement<any>;
          newItem.props.style.position = "relative";
          newItem.props.style.top = "auto";
          newItem.props.style.left = "auto";

          newItem = cloneElement(newItem, {
            className: (newItem.props.className || "")
              .replace(/\bGameMap_savingElem\S*\b/g, "")
              .trim(),
          });
          let stringItem = ReactDOMServer.renderToStaticMarkup(newItem);
          return res + stringItem;
        }, "");

        setIsLocalOpened(true);
        if (parsedElems.length == 0) {
          setLibraryContent(
            "<div style='gridColumn: span 15; textAlign: center;'>Library is empty</div>"
          );
        } else {
          setLibraryContent(elemsHeap);
        }
      } else {
        console.log(baseResponse.message);
      }
    } else {
      setLibraryContent(
        "<div style='gridColumn: span 15; textAlign: center;'>Library is empty</div>"
      );
    }
  }

  async function deleteElemFromLibrary() {
    if (!elemFromLib) return;
    const regex = /id="([^"]*)"/;
    let elemID = elemFromLib.match(regex) ? elemFromLib.match(regex)[1] : "0";
    let response = await fetch("/api/gamedata/gamemap/deleteelem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        callbackUrl: "/",
        email: userEmail,
        elemID: elemID,
      }),
    });
    //TODO: error handling (delState = false)
    const oldLib = libraryContent;
    const parser = new DOMParser();
    const doc = parser.parseFromString(oldLib, "text/html");
    const elem = doc.getElementById(elemID);
    if (elem) elem.remove();
    const newLib = doc.body.innerHTML;
    dispatch(mapSlice.setElemFromLib(null));
    setLibraryContent(newLib);
  }

  function selectElement(e: React.MouseEvent | React.PointerEvent) {
    e.stopPropagation();
    const eventTarget = e.target as HTMLElement;
    let elem = eventTarget.closest('[data-name="mapElem"]') as HTMLElement;
    if (!elem) return;
    if (elem.style.outline == "yellow dotted 5px") {
      elem.style.outline = "black dotted 2px";
      dispatch(mapSlice.setElemFromLib(null));
    } else {
      [...e.currentTarget.querySelectorAll('[data-name="mapElem"]')].map(
        (item: HTMLElement) => (item.style.outline = "black dotted 2px")
      );

      elem.style.outline = "yellow dotted 5px";
      dispatch(mapSlice.setElemFromLib(elem.outerHTML));
    }
  }

  function clearElem() {
    dispatch(mapSlice.setElemFromLib(null));
    setLibraryContent(
      "<div style='gridColumn: span 15; textAlign: center;'></div>"
    );
    setIsLocalOpened(false);
  }

  function clearElemSaving() {
    setElemForSaving(
      "<div style='gridColumn: span 15; textAlign: center;'></div>"
    );
  }

  return (
    <div className={styles.paletteFormsButtons}>
      {loginState && (
        <FormWrapper
          formName="Save"
          addButtonStyle={addButtonStyle}
          addButtonFunc={captureElem}
          addFormStyle={addFormStyle}
          addOnClose={clearElemSaving}
        >
          <div className={styles.libraryGrid}>{parse(elemForSaving)}</div>
          <div className={styles.libButtonBlock}>
            <button
              className={styles.paletteButton}
              onClick={() => captureElem()}
            >
              Capture element
            </button>
            <button
              className={styles.paletteButton}
              onClick={async () => saveElem()}
            >
              Save element
            </button>
          </div>
        </FormWrapper>
      )}
      <FormWrapper
        formName="Load"
        addButtonStyle={addButtonStyle}
        addFormStyle={addFormStyle}
        addOnClose={clearElem}
      >
        <div className={styles.libraryGrid} onClick={(e) => selectElement(e)}>
          {isLocalOpened && (
            <button
              className={styles.paletteButtonDel}
              onClick={async () => deleteElemFromLibrary()}
            >
              Delete element
            </button>
          )}
          {parse(libraryContent)}
        </div>
        <div className={styles.libButtonBlock}>
          {loginState && (
            <button
              className={styles.paletteButton}
              onClick={async (e) => loadLocalLibrary(e)}
            >
              Local library
            </button>
          )}
          <button
            className={styles.paletteButton}
            onClick={async (e) => loadGlobalLibrary(e)}
          >
            Global library
          </button>
        </div>
      </FormWrapper>
    </div>
  );
}

function PaletteElem({ id }) {
  const activeForm = useSelector(
    (state: RootState) => state.map.activePaletteStyle.form
  );
  const activeColor = useSelector(
    (state: RootState) => state.map.activePaletteStyle.color
  );
  const dispatch: AppDispatch = useDispatch();

  let elemClass =
    id === activeForm
      ? `${styles.paletteElem} ${styles.activeElem}`
      : styles.paletteElem;
  let elemStyle = {
    ...mapSlice.FORMS_LIST[id],
    backgroundColor: activeColor,
  };

  function chooseForm(e: React.MouseEvent | PointerEvent) {
    const eventTarget = e.target as HTMLElement;
    dispatch(mapSlice.setActivePaletteForm(eventTarget.id));
  }

  return (
    <div
      id={id}
      className={elemClass}
      style={elemStyle}
      onClick={(e) => chooseForm(e)}
    ></div>
  );
}

function PaletteActions() {
  const dispatch: AppDispatch = useDispatch();
  const activeAction = useSelector(
    (state: RootState) => state.map.activePaletteAction
  );
  const mapContent = useSelector((state: RootState) => state.map.mapContent);
  const mapElemsCounter = useSelector(
    (state: RootState) => state.map.mapElemsCounter
  );
  const activeLayer = useSelector(
    (state: RootState) => state.map.activePaletteStyle.layer
  );

  function changePaletteAction(act, dispatch) {
    if (activeAction === act) {
      dispatch(mapSlice.setActivePaletteAction(null));
    } else {
      dispatch(mapSlice.setActivePaletteAction(act));
    }
  }

  function mergeItems() {
    if (activeAction !== "arrow") return;

    let selectedArray = mapContent.filter((item) =>
      item.includes("outline: yellow dashed 3px")
    );
    if (selectedArray.length === 0) return;

    selectedArray.map((item) => dispatch(mapSlice.removeElemFromMap(item)));

    let itemArray: string[] = selectedArray.map((item) =>
      item.replaceAll('data-name="mapElem"', 'data-name="mapInnerElem"')
    );

    itemArray = itemArray.map((item) =>
      item.replaceAll(
        "outline: yellow dashed 3px",
        "outline: none; pointer-events: none;"
      )
    );

    dispatch(mapSlice.incMapElemsCounter());

    let sortedArray = itemArray
      .map((item) => parse(item) as ReactElement<any>)
      .sort(
        (a, b) => parseInt(a.props.style.left) - parseInt(b.props.style.left)
      );

    let startX = sortedArray[0].props.style.left;
    sortedArray = sortedArray.sort(
      (a, b) => parseInt(a.props.style.top) - parseInt(b.props.style.top)
    );
    let startY = sortedArray[0].props.style.top;

    sortedArray = sortedArray.sort(
      (b, a) =>
        parseInt(a.props.style.left) +
        parseInt(a.props.style?.width ?? "20") -
        (parseInt(b.props.style.left) + parseInt(b.props.style?.width ?? "20"))
    );
    let endX =
      parseInt(sortedArray[0].props.style.left) +
      parseInt(sortedArray[0].props.style?.width ?? "20") +
      "px";
    sortedArray = sortedArray.sort(
      (b, a) =>
        parseInt(a.props.style.top) +
        parseInt(a.props.style?.height ?? "20") -
        (parseInt(b.props.style.top) + parseInt(b.props.style?.height ?? "20"))
    );
    let endY =
      parseInt(sortedArray[0].props.style.top) +
      parseInt(sortedArray[0].props.style?.height ?? "20") +
      "px";

    sortedArray = sortedArray.map((item) => {
      // -1 a.f.
      item.props.style.left =
        parseInt(item.props.style.left) - parseInt(startX) - 1 + "px";
      item.props.style.top =
        parseInt(item.props.style.top) - parseInt(startY) - 1 + "px";
      item.props.style.pointerEvents = "none";
      return item;
    });
    const elemId = `mapElem_${mapElemsCounter}`;

    let formClone = document.createElement("div");
    formClone.id = elemId;
    formClone.className = styles.paletteElem;
    formClone.style.left = startX;
    formClone.style.top = startY;
    formClone.style.width = parseInt(endX) - parseInt(startX) + "px";
    formClone.style.height = parseInt(endY) - parseInt(startY) + "px";
    formClone.style.position = "absolute";
    formClone.style.outline = "none";
    formClone.style.border = "none";
    formClone.setAttribute("data-name", "mapElem");
    switch (activeLayer) {
      case "top":
        formClone.style.zIndex = "20";
        break;
      case "middle":
        formClone.style.zIndex = "15";
        break;
      case "bottom":
        formClone.style.zIndex = "10";
        break;
    }

    formClone.innerHTML = sortedArray
      .map((item) => ReactDOMServer.renderToStaticMarkup(item))
      .join("");

    let formCloneResizer = document.createElement("div");
    switch (activeLayer) {
      case "top":
        formCloneResizer.style.zIndex = "21";
        break;
      case "middle":
        formCloneResizer.style.zIndex = "16";
        break;
      case "bottom":
        formCloneResizer.style.zIndex = "11";
        break;
    }

    formCloneResizer.className = styles.mapElemResizer;
    formCloneResizer.setAttribute("data-name", "elemResizer");
    formClone.appendChild(formCloneResizer);

    dispatch(mapSlice.addElemToMap(formClone.outerHTML));
  }

  function splitItems() {
    if (activeAction !== "arrow") return;

    let selectedArray = mapContent.filter((item) =>
      item.includes("outline: yellow dashed 3px")
    );
    if (selectedArray.length === 0) return;
    selectedArray.map((item) => dispatch(mapSlice.removeElemFromMap(item)));
    let parsedArray = selectedArray.map(
      (item) => parse(item) as ReactElement<any>
    );

    parsedArray.map((pItem, index) => {
      let startX = parsedArray[index]?.props.style?.left ?? "0";
      let startY = parsedArray[index]?.props.style?.top ?? "0";

      let innerArray = parsedArray.map((item) => item.props.children)[index];

      if (innerArray.length > 0) {
        innerArray = innerArray.filter(
          (item) =>
            item.props["data-name"] !== "elemResizer" &&
            item.props["data-name"] !== "textField"
        );

        innerArray = innerArray.map((item) => {
          let itemXStart = item.props.style.left;
          let itemYStart = item.props.style.top;
          let itemX =
            parseInt(item.props.style.left) + 1 + parseInt(startX) + "px";
          let itemY =
            parseInt(item.props.style.top) + 1 + parseInt(startY) + "px";
          let tempItem = ReactDOMServer.renderToStaticMarkup(item);
          tempItem = tempItem.replace(
            'data-name="mapInnerElem"',
            'data-name="mapElem"'
          );
          tempItem = tempItem.replace(
            "pointer-events:none",
            "pointer-events:auto"
          );
          tempItem = tempItem.replace(`left:${itemXStart}`, `left:${itemX}`);
          tempItem = tempItem.replace(`top:${itemYStart}`, `top:${itemY}`);
          dispatch(mapSlice.addElemToMap(tempItem));
        });
      } else {
        let tempItem = ReactDOMServer.renderToStaticMarkup(pItem);
        tempItem = tempItem.replace(
          "outline:yellow dashed 3px",
          "outline:none"
        );
        dispatch(mapSlice.addElemToMap(tempItem));
      }
    });
  }

  function deleteItems() {
    if (activeAction !== "arrow") return;

    let selectedArray = mapContent.filter((item) =>
      item.includes("outline: yellow dashed 3px")
    );
    if (selectedArray.length === 0) return;
    selectedArray.map((item) => dispatch(mapSlice.removeElemFromMap(item)));
  }

  function copyItems() {
    let selectedArray = mapContent.filter((item) =>
      item.includes("outline: yellow dashed 3px")
    );
    if (selectedArray.length === 0) return;

    let copyID = mapElemsCounter + 1;

    selectedArray.map((item) => {
      let parsedItem = parse(item) as ReactElement<any>;
      let oldX = parsedItem.props.style.left;
      let oldY = parsedItem.props.style.top;
      let newX = parseInt(oldX) + 10 + "px";
      let newY = parseInt(oldY) + 10 + "px";
      parsedItem.props.style.left = newX;
      parsedItem.props.style.top = newY;
      let textElemCopy = ReactDOMServer.renderToStaticMarkup(parsedItem);
      textElemCopy = textElemCopy.replaceAll(
        'id="mapElem_',
        `id="mapElem_c_${copyID++}_`
      );
      textElemCopy = textElemCopy.replaceAll(
        'id="mapInnerElem_',
        `id="mapElem_c_${copyID++}_`
      );
      dispatch(mapSlice.addElemToMap(textElemCopy));
    });
    dispatch(mapSlice.setMapElemsCounter(copyID));
  }

  function reflectHItems() {
    let selectedArray = mapContent.filter((item) =>
      item.includes("outline: yellow dashed 3px")
    );
    if (selectedArray.length === 0) return;

    selectedArray.forEach((item) => {
      let parsedItem = parse(item) as ReactElement<any>;
      parsedItem.props.style.transform = parsedItem.props.style.transform || "";

      if (parsedItem.props.style.transform.indexOf("scaleX(-1)") > -1) {
        parsedItem.props.style.transform =
          parsedItem.props.style.transform.replace("scaleX(-1)", "scaleX(1)");
      } else if (parsedItem.props.style.transform.indexOf("scaleX(1)") > -1) {
        parsedItem.props.style.transform =
          parsedItem.props.style.transform.replace("scaleX(1)", "scaleX(-1)");
      } else {
        parsedItem.props.style.transform =
          "scaleX(-1) " + parsedItem.props.style.transform;
      }
      dispatch(
        mapSlice.changeElemOnMap(
          ReactDOMServer.renderToStaticMarkup(parsedItem)
        )
      );
    });
  }

  function reflectVItems() {
    let selectedArray = mapContent.filter((item) =>
      item.includes("outline: yellow dashed 3px")
    );
    if (selectedArray.length === 0) return;

    selectedArray.forEach((item) => {
      let parsedItem = parse(item) as ReactElement<any>;
      parsedItem.props.style.transform = parsedItem.props.style.transform || "";

      if (parsedItem.props.style.transform.indexOf("scaleY(-1)") > -1) {
        parsedItem.props.style.transform =
          parsedItem.props.style.transform.replace("scaleY(-1)", "scaleY(1)");
      } else if (parsedItem.props.style.transform.indexOf("scaleY(1)") > -1) {
        parsedItem.props.style.transform =
          parsedItem.props.style.transform.replace("scaleY(1)", "scaleY(-1)");
      } else {
        parsedItem.props.style.transform =
          "scaleY(-1) " + parsedItem.props.style.transform;
      }
      dispatch(
        mapSlice.changeElemOnMap(
          ReactDOMServer.renderToStaticMarkup(parsedItem)
        )
      );
    });
  }

  return (
    <div className={styles.paletteActions}>
      <button
        className={styles.paletteActionElem}
        style={activeAction === "arrow" ? { background: "yellow" } : {}}
        onClick={() => changePaletteAction("arrow", dispatch)}
      >
        &#x1F446;
      </button>
      <button
        className={styles.paletteActionElem}
        style={activeAction === "brush" ? { background: "yellow" } : {}}
        onClick={() => changePaletteAction("brush", dispatch)}
      >
        &#128396;
      </button>
      <button
        className={styles.paletteActionElem}
        style={activeAction === "rotate" ? { background: "yellow" } : {}}
        onClick={() => changePaletteAction("rotate", dispatch)}
      >
        &#8635;
      </button>
      <button
        className={styles.paletteActionElem}
        onClick={() => deleteItems()}
      >
        &#10006;
      </button>
      <button className={styles.paletteActionElem} onClick={() => mergeItems()}>
        <img
          src="/images/link.bmp"
          style={{ width: "100%", height: "100%" }}
        ></img>
      </button>
      <button className={styles.paletteActionElem} onClick={() => splitItems()}>
        <img
          src="/images/link_d.bmp"
          style={{ width: "100%", height: "100%" }}
        ></img>
      </button>
      <button className={styles.paletteActionElem} onClick={() => copyItems()}>
        <img
          src="/images/copy.bmp"
          style={{ width: "100%", height: "100%" }}
        ></img>
      </button>
      <button
        className={styles.paletteActionElem}
        style={activeAction === "text" ? { background: "yellow" } : {}}
        onClick={() => changePaletteAction("text", dispatch)}
      >
        <span style={{ fontFamily: "Times New Roman", fontSize: "1.1rem" }}>
          T
        </span>
      </button>
      <button
        className={styles.paletteActionElem}
        onClick={() => reflectHItems()}
      >
        &#10231;
      </button>
      <button
        className={styles.paletteActionElem}
        onClick={() => reflectVItems()}
      >
        &#8597;
      </button>
    </div>
  );
}

function Palette() {
  return (
    <details>
      <summary style={{ userSelect: "none" }}>Palette &#x1F3A8;</summary>
      <div
        className={styles.gameMapTools}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <PaletteActions />
        <PaletteColors />
        <PaletteForms />
        <PaletteLayers />
      </div>
    </details>
  );
}
