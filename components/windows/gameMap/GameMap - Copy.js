"use client";

import styles from "./GameMap.module.css";
import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";
import React from "react";
import { useRef, useEffect, useState, useMemo, cloneElement } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as mapSlice from "../../../app/store/slices/mapSlice";
import { manageWebsocket } from "../../../app/store/slices/websocketSlice";
import * as clientUtils from "../../../utils/clientUtils";
import FormWrapper from "../../forms/FormWrapper";
import FormWrapper_2 from "../../forms/FormWrapper_2";
//import { GoTrueClient } from "@supabase/supabase-js";
import parse from "html-react-parser";

const CELL_SIZE = 20;
const MARKER_RADIUS = 5;
const radToDeg = (rad) => rad * (180 / Math.PI);
const mainBGColor = "rgb(227, 214, 199)";

function PaletteColorElem({
  elemClass = styles.paletteColorItem,
  elemText = "*",
  backgroundColor,
  textColor,
}) {
  console.log(`🔄 PaletteColorElem ${backgroundColor} re-rendered`);
  const dispatch = useDispatch();

  function chooseColor(e) {
    dispatch(mapSlice.setActivePaletteColor(e.target.style.backgroundColor));
    dispatch(mapSlice.setActivePaletteTextColor(e.target.style.color));
  }

  const activeColor = useSelector(
    (state) => state.map.activePaletteStyle.color
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
        color: textColor,
        gridColumn: gridColumn,
      }}
      onClick={(e) => chooseColor(e, dispatch)}
    >
      {elemText}
    </div>
  );
}

export default function GameMap() {
  console.log("🔄 GameMap re-rendered");
  const dispatch = useDispatch();
  const mapRef = useRef("");
  const libRef = useRef("");

  const activeColor = useSelector(
    (state) => state.map.activePaletteStyle.color
  );
  const activeTextColor = useSelector(
    (state) => state.map.activePaletteStyle.textColor
  );
  const activeForm = useSelector((state) => state.map.activePaletteStyle.form);
  const activeAction = useSelector((state) => state.map.activePaletteAction);
  const activeLayer = useSelector(
    (state) => state.map.activePaletteStyle.layer
  );
  const gridBinding = useSelector(
    (state) => state.map.activePaletteStyle.bindToGrid
  );
  const mapContent = useSelector((state) => state.map.mapContent);
  const mapElemsCounter = useSelector((state) => state.map.mapElemsCounter);

  const userEmail = useSelector((state) => state.main.userEmail);
  const userRole = useSelector((state) => state.main.userRole);
  const userName = useSelector((state) => state.main.userName);
  const userColor = useSelector((state) => state.main.userColor);

  const serverMessage = useSelector((state) => state.websocket.serverMessage);

  const [isDragging, setIsDragging] = useState(false);
  const [draggingObject, setDraggingObject] = useState({});
  const [startPoint, setStartPoint] = useState({});
  const [isResizing, setIsResizing] = useState(false);
  const [resizingObject, setResizingObject] = useState({});
  const [isRotating, setIsRotating] = useState(false);
  const [rotatingObject, setRotatingObject] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedObjectsId, setSelectedObjectsId] = useState(new Set());
  const [screenSize, setScreenSize] = useState([0, 0]);

  const [elemFromLib, setElemFromLib] = useState(null);
  const [elemFromLibTest, setElemFromLibTest] = useState(null);

  let tempObj = {};
  let traceDiameter = 0;
  let handlingStarted = false;
  let isLibOpen = false;

  useEffect(() => {
    setScreenSize([window.innerWidth, window.innerHeight]);
  }, []);

  function mapOnMouseDown(e) {
    const gameMap = mapRef.current;

    if (activeAction === null) {
      return;
    } else {
      e.preventDefault();
      e.stopPropagation();
      if (e.pointerType === "touch") {
        if (!e.isPrimary) return;
      }
    }

    if (activeAction === "brush") {
      //all actions on mouseUp(?)
    } else if (activeAction === "arrow") {
      const eventTargetName = e.target.getAttribute("name");
      console.log(eventTargetName);
      if (eventTargetName === "elemResizer") {
        //resizing
        setIsResizing(true);
        setResizingObject(e.target.parentElement);
        let rect = e.target.parentElement.getBoundingClientRect();

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
        setDraggingObject(e.target);

        let rect = e.target.getBoundingClientRect();

        let traceItem = document.createElement("div");
        traceItem.className = styles.paletteTraceElem;
        traceItem.style.left = rect.left + window.scrollX + "px";
        traceItem.style.top = rect.top + window.scrollY + "px";
        traceItem.style.width = rect.width + "px";
        traceItem.style.height = rect.height + "px";
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
      let rectObject = e.target.closest('[name="mapElem"]');
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
    }
  }

  function mapOnMouseMove(e) {
    const gameMap = mapRef.current;

    if (activeAction === null) {
      return;
    } else {
      e.preventDefault();
      e.stopPropagation();
    }

    let mouseX, mouseY;

    mouseX = e.pageX;
    mouseY = e.pageY;

    if (isResizing) {
      tempObj = document.getElementById("traceItem");

      const newWidth = mouseX - parseInt(tempObj.style.left);
      const newHeight = mouseY - parseInt(tempObj.style.top);
      tempObj.style.width = newWidth > 0 ? newWidth + "px" : "2px";
      tempObj.style.height = newHeight > 0 ? newHeight + "px" : "2px";
    } else if (isDragging) {
      tempObj = document.getElementById("traceItem");

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

  function mapOnMouseUp(e) {
    const gameMap = mapRef.current;
    const gameMapRect = gameMap.getBoundingClientRect();

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
      dispatch(mapSlice.incMapElemsCounter());
      let elemX, elemY;

      if (!gridBinding) {
        elemX =
          e.pageX -
          gameMapRect.left +
          gameMap.scrollLeft -
          window.scrollX -
          CELL_SIZE / 2 +
          "px";
        elemY =
          e.pageY -
          gameMapRect.top +
          gameMap.scrollTop -
          window.scrollY -
          CELL_SIZE / 2 +
          "px";
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
      const elemId = `mapElem_${mapElemsCounter}`;

      let formClone;
      if (elemFromLib) {
        formClone = elemFromLib;
        formClone.id = elemId;
        formClone.style.left = elemX;
        formClone.style.top = elemY;
        formClone.style.position = "absolute";
        formClone.style.outline = "none";
        formClone.draggable = "true";
        formClone.setAttribute("name", "mapElem");
        formClone.style.boxShadow = "none";
        setElemFromLib(null);
      } else {
        formClone = document.getElementById(activeForm).cloneNode(true);
        formClone.id = elemId;
        formClone.style.left = elemX;
        formClone.style.top = elemY;
        formClone.style.width = CELL_SIZE + "px";
        formClone.style.height = CELL_SIZE + "px";
        formClone.style.position = "absolute";
        formClone.style.outline = "none";
        formClone.draggable = "true";
        formClone.setAttribute("name", "mapElem");
      }

      if (activeColor == mainBGColor) {
        console.log("main color");

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
      formCloneResizer.setAttribute("name", "elemResizer");
      formClone.appendChild(formCloneResizer);

      dispatch(mapSlice.addElemToMap(formClone.outerHTML));
    } else if (activeAction === "arrow") {
      if (isResizing) {
        tempObj = resizingObject.cloneNode(true);
        let mouseX, mouseY;

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

        const oldWidth = tempObj.style.width;
        const oldHeight = tempObj.style.height;
        const newWidth = mouseX - parseInt(tempObj.style.left);
        const newHeight = mouseY - parseInt(tempObj.style.top);
        tempObj.style.width = newWidth > 0 ? newWidth + "px" : "2px";
        tempObj.style.height = newHeight > 0 ? newHeight + "px" : "2px";

        const coefX = parseInt(newWidth) / parseInt(oldWidth);
        const coefY = parseInt(newHeight) / parseInt(oldHeight);

        for (let elem of tempObj.children) {
          if (elem.getAttribute("name") === "elemResizer") continue;

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
        setResizingObject({});
        document.getElementById("traceItem").remove();
        tempObj = {};
      } else if (isDragging) {
        tempObj = draggingObject.cloneNode(true);
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
          let mouseX, mouseY;
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
        setDraggingObject({});
        setStartPoint({});
        setIsDragging(false);
        traceItem.remove();
        tempObj = {};
      } else if (isSelecting) {
        setIsSelecting(false);
        let endPoint = { x: e.pageX, y: e.pageY };

        const tempSet = new Set();

        mapContent.map((item) => {
          item = document.getElementById(parse(item).props.id);
          let itemRect = item.getBoundingClientRect();
          if (
            startPoint.y < itemRect.top + window.scrollY &&
            itemRect.bottom + window.scrollY < endPoint.y &&
            itemRect.left + window.scrollX > startPoint.x &&
            itemRect.right + window.scrollX < endPoint.x
          ) {
            let tempI = item.cloneNode(true);
            tempI.style.outline = "3px dashed yellow";

            tempSet.add(tempI.id);

            dispatch(mapSlice.changeElemOnMap(tempI.outerHTML));
          } else {
            let tempI = item.cloneNode(true);
            tempI.style.outline = "none";
            dispatch(mapSlice.changeElemOnMap(tempI.outerHTML));
          }
        });
        traceItem.remove();

        setSelectedObjectsId(tempSet);
        setStartPoint({});
      }
    } else if (activeAction === "rotate") {
      if (!isRotating) return;
      handlingStarted = true;
      setIsRotating(false);

      tempObj = rotatingObject.cloneNode(true);
      setStartPoint({});

      let circle = document.getElementById("traceItemCircle");
      //"rotate(88deg)"
      const regex = /rotate\(([^.]*)\./;
      let angle = circle.style.transform.match(regex)
        ? circle.style.transform.match(regex)[1]
        : "0";

      angle = Math.round(Number(angle) / 5) * 5;
      tempObj.style.transform = "rotate(" + angle + "deg)";

      setRotatingObject(null);
      document.getElementById("traceItem").remove();
      document.getElementById("traceItemCircle").remove();
      document.getElementById("traceItemMarker3").remove();

      dispatch(mapSlice.changeElemOnMap(tempObj.outerHTML));
      tempObj = {};
      handlingStarted = false;
    }
  }

  function mergeItems(e) {
    console.log("merge");
    if (activeAction !== "arrow") return;

    let selectedArray = mapContent.filter((item) =>
      item.includes("outline: yellow dashed 3px")
    );
    if (selectedArray.length === 0) return;

    selectedArray.map((item) => dispatch(mapSlice.removeElemFromMap(item)));

    let sortedArray = selectedArray.map((item) =>
      item.replaceAll('name="mapElem"', 'name="mapInnerElem"')
    );
    sortedArray = sortedArray.map((item) =>
      item.replaceAll(
        "outline: yellow dashed 3px",
        "outline: none; pointer-events: none;"
      )
    );

    dispatch(mapSlice.incMapElemsCounter());

    sortedArray = sortedArray
      .map((item) => parse(item))
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
    formClone.draggable = "true";
    formClone.setAttribute("name", "mapElem");
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
    formCloneResizer.setAttribute("name", "elemResizer");
    formClone.appendChild(formCloneResizer);

    dispatch(mapSlice.addElemToMap(formClone.outerHTML));
  }

  function splitItems(e) {
    console.log("split");
    if (activeAction !== "arrow") return;

    let selectedArray = mapContent.filter((item) =>
      item.includes("outline: yellow dashed 3px")
    );
    if (selectedArray.length === 0) return;
    selectedArray.map((item) => dispatch(mapSlice.removeElemFromMap(item)));
    let parsedArray = selectedArray.map((item) => parse(item));

    parsedArray.map((pItem, index) => {
      let startX = parsedArray[index]?.props.style?.left ?? "0";
      let startY = parsedArray[index]?.props.style?.top ?? "0";

      let innerArray = parsedArray.map((item) => item.props.children)[index];

      if (innerArray.length > 0) {
        innerArray = innerArray.filter(
          (item) => item.props.name !== "elemResizer"
        );

        innerArray = innerArray.map((item) => {
          let itemXStart = item.props.style.left;
          let itemYStart = item.props.style.top;
          let itemX =
            parseInt(item.props.style.left) + 1 + parseInt(startX) + "px";
          let itemY =
            parseInt(item.props.style.top) + 1 + parseInt(startY) + "px";
          let tempItem = ReactDOMServer.renderToStaticMarkup(item);
          tempItem = tempItem.replace('name="mapInnerElem"', 'name="mapElem"');
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

  function deleteItems(e) {
    console.log("delete");
    if (activeAction !== "arrow") return;

    let selectedArray = mapContent.filter((item) =>
      item.includes("outline: yellow dashed 3px")
    );
    if (selectedArray.length === 0) return;
    selectedArray.map((item) => dispatch(mapSlice.removeElemFromMap(item)));
  }

  function copyItems(e) {
    console.log("copy");
    let selectedArray = mapContent.filter((item) =>
      item.includes("outline: yellow dashed 3px")
    );
    if (selectedArray.length === 0) return;
    console.log(selectedArray);
    let copyID = mapElemsCounter + 1;

    selectedArray.map((item) => {
      console.log(item);
      let parsedItem = parse(item);
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

  /*{
    "gameId":0,
    "user":{
      "userRole":"Gamer",
      "userName":"IcyWizard",
      "userColor":"DarkGreen"
    },
    "sectionName":"gameMap",
    "sectionInfo":{
      "mapField": <...>,
    },
  }*/

  useEffect(() => {
    if (!clientUtils.isValidJSON(serverMessage)) return;
    let messageJSON = JSON.parse(serverMessage);
    if (!messageJSON?.sectionName || messageJSON.sectionName !== "gameMap")
      return;
    mapRef.current.innerHTML = JSON.parse(messageJSON.sectionInfo.mapField);
  }, [serverMessage]);

  useEffect(() => {
    const messageForServer = clientUtils.messageMainWrapper(
      userRole,
      userName,
      userColor,
      0
    );
    messageForServer["sectionName"] = "gameMap";
    messageForServer["sectionInfo"] = {
      mapField: JSON.stringify(mapRef.current.innerHTML),
    };
    dispatch(
      manageWebsocket(
        "send",
        process.env.NEXT_PUBLIC_SERVER_URL,
        JSON.stringify(messageForServer)
      )
    );
  }, [mapContent]);

  /*  function PaletteColorElem({
    elemClass = styles.paletteColorItem,
    elemText = "*",
    backgroundColor,
    textColor,
  }) {
    console.log("🔄 PaletteColorElem re-rendered");
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
          color: textColor,
          gridColumn: gridColumn,
        }}
        onClick={(e) => chooseColor(e, dispatch)}
      >
        {elemText}
      </div>
    );
  }
  function chooseColor(e, dispatch) {
    dispatch(mapSlice.setActivePaletteColor(e.target.style.backgroundColor));
    dispatch(mapSlice.setActivePaletteTextColor(e.target.style.color));
  }*/

  const paletteColors = (
    <div className={styles.paletteColors}>
      <PaletteColorElem
        elemClass={styles.paletteColorTransparent}
        elemText="transparent"
        backgroundColor="transparent"
        textColor="black"
      />
      <PaletteColorElem backgroundColor="black" textColor="white" />
      <PaletteColorElem backgroundColor="gray" textColor="black" />
      <PaletteColorElem backgroundColor="silver" textColor="black" />
      <PaletteColorElem backgroundColor="white" textColor="black" />
      <PaletteColorElem backgroundColor="maroon" textColor="white" />
      <PaletteColorElem backgroundColor="red" textColor="white" />
      <PaletteColorElem backgroundColor="purple" textColor="white" />
      <PaletteColorElem backgroundColor="fuchsia" textColor="white" />
      <PaletteColorElem backgroundColor="olive" textColor="white" />
      <PaletteColorElem backgroundColor="green" textColor="white" />
      <PaletteColorElem backgroundColor="lime" textColor="black" />
      <PaletteColorElem backgroundColor="yellow" textColor="black" />
      <PaletteColorElem backgroundColor="navy" textColor="white" />
      <PaletteColorElem backgroundColor="blue" textColor="white" />
      <PaletteColorElem backgroundColor="teal" textColor="white" />
      <PaletteColorElem backgroundColor="aqua" textColor="black" />
      <PaletteColorElem
        elemText="grid"
        backgroundColor={mainBGColor}
        textColor="black"
      />
    </div>
  );

  function PaletteElem({ id }) {
    console.log("🔄 PaletteElem re-rendered");
    let elemClass =
      id === activeForm
        ? `${styles.paletteElem} ${styles.activeElem}`
        : styles.paletteElem;
    let elemStyle = {
      ...mapSlice.FORMS_LIST[id],
      backgroundColor: activeColor,
      color: activeTextColor,
    };

    return (
      <div
        id={id}
        className={elemClass}
        style={elemStyle}
        onClick={(e) => chooseForm(e, dispatch)}
      ></div>
    );
  }
  function chooseForm(e, dispatch) {
    console.log(activeForm);
    dispatch(mapSlice.setActivePaletteForm(e.target.id));
  }

  function PaletteForms() {
    const addButtonStyle = {
      minWidth: "1rem",
      borderWidth: "2px",
      margin: "3px",
      gridColumn: "span 3",
      width: "fit-content",
      alignSelf: "center",
      padding: "3px",
      borderRadius: "5px",
    };

    const addFormStyle = {
      width: parseInt(screenSize[0]) / 2 + "px",
      height: parseInt(screenSize[1]) / 2 + "px",
      top: "0",
      display: "flex",
      flexDirection: "column",
      justifyContent: "end",
    };

    let windowContent = "";

    if (selectedObjectsId.size !== 1) {
      windowContent = <div>Select a single object</div>;
    } else {
      let selectedObj = document.getElementById(
        selectedObjectsId.values().next().value
      );
      if (selectedObj) {
        windowContent = parse(selectedObj.outerHTML);
        windowContent.props.style.outline = "none";
        windowContent.props.style.left =
          parseInt(screenSize[0]) / 4 -
          parseInt(windowContent.props.style.width) / 2 +
          "px";
        windowContent.props.style.top =
          parseInt(screenSize[1]) / 4 -
          parseInt(windowContent.props.style.height) / 2 +
          "px";
        windowContent = cloneElement(windowContent, {
          className:
            (windowContent.props.className || "") + " " + styles.savingElem,
          id: "savingId",
        });
      } else {
        windowContent = <div>Select a single object</div>;
      }
    }

    async function saveElemToBase() {
      console.log("save");
      let response = await fetch("/api/gamedata/gamemap/saveelem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          callbackUrl: "/",
          email: userEmail,
          elem: ReactDOMServer.renderToStaticMarkup(windowContent),
        }),
      });

      let baseResponse = await response.json();

      if (response.ok) {
        console.log(baseResponse.message);
      } else {
        throw new Error("error in database response");
      }
    }

    console.log("🔄 PaletteForms re-rendered");

    const memoizedFormLoadLib = useMemo(() => <FormLoadLib />, []);

    return (
      <div className={styles.paletteForms}>
        {Array.from({ length: 18 }, (_, i) => (
          <PaletteElem key={i} id={`elemForm_${i}`} />
        ))}
        <FormWrapper
          formName="Save"
          addButtonStyle={addButtonStyle}
          addFormStyle={addFormStyle}
        >
          {windowContent}
          <button
            className={styles.formButton}
            onClick={async () => saveElemToBase()}
          >
            Save element
          </button>
        </FormWrapper>
        {memoizedFormLoadLib}
      </div>
    );
  }

  const FormLoadLib = React.memo(function FormLoadLib() {
    console.log("🔄 FormLoadLib re-rendered");
    const addButtonStyle = useMemo(
      () => ({
        minWidth: "1rem",
        borderWidth: "2px",
        margin: "3px",
        gridColumn: "span 3",
        width: "fit-content",
        alignSelf: "center",
        padding: "3px",
        borderRadius: "5px",
      }),
      []
    );

    const addFormStyle = useMemo(
      () => ({
        width: parseInt(screenSize[0]) / 2 + "px",
        height: parseInt(screenSize[1]) / 2 + "px",
        top: "0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "end",
      }),
      [screenSize]
    );

    async function loadLocalLibrary(e) {
      e.stopPropagation();
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
          console.log("ok");
          let parsedElems = JSON.parse(baseResponse.message);
          libRef.current.innerHTML = parsedElems.reduce((res, item, key) => {
            let newItem = parse(item);
            newItem.props.style.position = "relative";
            newItem.props.style.top = "auto";
            newItem.props.style.left = "auto";
            newItem.props.style.boxSizing = "content-box";
            newItem = cloneElement(newItem, {
              className: (newItem.props.className || "")
                .replace(/\bGameMap_savingElem\S*\b/g, "")
                .trim(),
              id: undefined,
            });
            let stringItem = ReactDOMServer.renderToStaticMarkup(newItem);
            return (
              res +
              `<div key=${key} class="${styles.elemLibrary}">${stringItem}</div>`
            );
          }, "");

          libRef.current.addEventListener("click", (e) => selectElement(e));
        } else {
          console.log(baseResponse.message);
        }
      } else {
        //throw new Error("error in database response");
        console.log("empty library");
      }
    }

    function selectElement(e) {
      e.stopPropagation();
      let elem = e.target.closest('[name="mapElem"]');
      if (!elem) return;
      if (elem.style.boxShadow == "rgb(106, 5, 114) 0px 0px 5px 5px") {
        elem.style.boxShadow = "none";
      } else {
        console.log(e.target);
        [...e.currentTarget.querySelectorAll('[name="mapElem"]')].map(
          (item) => (item.style.boxShadow = "none")
        );

        elem.style.boxShadow = "rgb(106, 5, 114) 0px 0px 5px 5px";
      }
      setElemFromLib(elem);
    }

    async function loadGlobalLibrary(e) {
      e.stopPropagation();
      libRef.current.innerHTML = "global";
      console.log("global");
    }

    return (
      <FormWrapper_2
        formName="Load"
        addButtonStyle={addButtonStyle}
        addFormStyle={addFormStyle}
      >
        <div ref={libRef} className={styles.divLibrary}></div>
        <button
          className={styles.formButton}
          onClick={async (e) => loadLocalLibrary(e)}
        >
          Local library
        </button>
        <button
          className={styles.formButton}
          onClick={async (e) => loadGlobalLibrary(e)}
        >
          Global library
        </button>
      </FormWrapper_2>
    );
  });

  /*  async function loadLocalLibrary(e) {
    e.stopPropagation();
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
        console.log("ok");
        let parsedElems = JSON.parse(baseResponse.message);
        libRef.current.innerHTML = parsedElems.reduce((res, item, key) => {
          let newItem = parse(item);
          newItem.props.style.position = "relative";
          newItem.props.style.top = "auto";
          newItem.props.style.left = "auto";
          newItem.props.style.boxSizing = "content-box";
          newItem = cloneElement(newItem, {
            className: (newItem.props.className || "")
              .replace(/\bGameMap_savingElem\S*\b/g, "")
              .trim(),
            id: undefined,
          });
          let stringItem = ReactDOMServer.renderToStaticMarkup(newItem);
          return (
            res +
            `<div key=${key} class="${styles.elemLibrary}">${stringItem}</div>`
          );
        }, "");

        libRef.current.addEventListener("click", (e) => selectElement(e));
      } else {
        console.log(baseResponse.message);
      }
    } else {
      //throw new Error("error in database response");
      console.log("empty library");
    }
  }

  function selectElement(e) {
    e.stopPropagation();
    let elem = e.target.closest('[name="mapElem"]');
    if (!elem) return;
    if (elem.style.boxShadow == "rgb(106, 5, 114) 0px 0px 5px 5px") {
      elem.style.boxShadow = "none";
    } else {
      console.log(e.target);
      [...e.currentTarget.querySelectorAll('[name="mapElem"]')].map(
        (item) => (item.style.boxShadow = "none")
      );

      elem.style.boxShadow = "rgb(106, 5, 114) 0px 0px 5px 5px";
    }
    setElemFromLib(elem);
  }

  async function loadGlobalLibrary(e) {
    e.stopPropagation();
    libRef.current.innerHTML = "global";
    console.log("global");
  }*/

  function changePaletteAction(act) {
    let startState = mapRef.current.style.touchAction;

    if (activeAction === act) {
      dispatch(mapSlice.setActivePaletteAction(null));
      mapRef.current.style.touchAction = "";
    } else {
      dispatch(mapSlice.setActivePaletteAction(act));
      if (startState !== "none") mapRef.current.style.touchAction = "none";
    }
  }

  const paletteActions = (
    <div
      className={styles.paletteActions}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <button
        className={styles.paletteActionElem}
        style={activeAction === "arrow" ? { background: "yellow" } : {}}
        onClick={() => changePaletteAction("arrow")}
      >
        &#x1F446;
      </button>
      <button
        className={styles.paletteActionElem}
        style={activeAction === "brush" ? { background: "yellow" } : {}}
        onClick={() => changePaletteAction("brush")}
      >
        &#128396;
      </button>
      <button
        className={styles.paletteActionElem}
        style={activeAction === "rotate" ? { background: "yellow" } : {}}
        onClick={() => changePaletteAction("rotate")}
      >
        &#8635;
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
      <button
        className={styles.paletteActionElem}
        onClick={() => deleteItems()}
      >
        &#10006;
      </button>
      <button className={styles.paletteActionElem} onClick={() => copyItems()}>
        <img
          src="/images/copy.bmp"
          style={{ width: "100%", height: "100%" }}
        ></img>
      </button>
    </div>
  );

  const paletteLayers = (
    <div className={styles.paletteLayers}>
      <div style={{ alignSelf: "flex-start" }}>Layers:</div>
      <div>
        <span>top:</span>
        <input
          name="layersSection"
          checked={activeLayer === "top"}
          type="radio"
          onChange={() => dispatch(mapSlice.setActivePaletteLayer("top"))}
        />
      </div>
      <div>
        <span>middle:</span>
        <input
          name="layersSection"
          checked={activeLayer === "middle"}
          type="radio"
          onChange={() => dispatch(mapSlice.setActivePaletteLayer("middle"))}
        />
      </div>
      <div>
        <span>bottom:</span>
        <input
          name="layersSection"
          checked={activeLayer === "bottom"}
          type="radio"
          onChange={() => dispatch(mapSlice.setActivePaletteLayer("bottom"))}
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

  function touchBlock(e) {
    if (activeAction !== null) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  return (
    <div className={styles.gameMapWrapper}>
      <div
        className={styles.mapFieldWrapper}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => touchBlock(e)}
        onTouchMove={(e) => touchBlock(e)}
        onTouchEnd={(e) => touchBlock(e)}
      >
        <div
          className={styles.mapField}
          name="mapField"
          ref={mapRef}
          droppable="true"
          onPointerUp={(e) => mapOnMouseUp(e)}
          onPointerDown={(e) => mapOnMouseDown(e)}
          onPointerMove={(e) => mapOnMouseMove(e)}
          onPointerLeave={(e) => mapOnMouseUp(e)}
        >
          {mapContent.map((item, index) => (
            <React.Fragment key={index}>{parse(item)}</React.Fragment>
          ))}
        </div>
      </div>
      <details>
        <summary>Palette &#x1F3A8;</summary>
        <div
          className={styles.gameMapTools}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {paletteActions}
          {paletteColors}
          <PaletteForms />
          {paletteLayers}
        </div>
      </details>
    </div>
  );
}
