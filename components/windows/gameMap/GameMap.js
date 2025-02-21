'use client';

import styles from './GameMap.module.css';
import ReactDOM from 'react-dom';
import React from 'react';
import { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as mapSlice from '../../../app/store/slices/mapSlice';
import { manageWebsocket } from "../../../app/store/slices/websocketSlice";
import * as clientUtils from '../../../utils/clientUtils';
import MapElem from "./MapElem";

const CELL_SIZE = 20;

export default function GameMap() {
  const dispatch = useDispatch();
  const mapRef = useRef('');

  const activeColor = useSelector((state) => state.map.activePaletteStyle.color); 
  const activeTextColor = useSelector((state) => state.map.activePaletteStyle.textColor); 
  const activeForm = useSelector((state) => state.map.activePaletteStyle.form); 
  const activeAction = useSelector((state) => state.map.activePaletteAction);
  const activeLayer = useSelector((state) => state.map.activePaletteStyle.layer);
  const gridBinding = useSelector((state) => state.map.activePaletteStyle.bindToGrid);
  const mapContent = useSelector((state) => state.map.mapContent);
  const mapElemCounter = useSelector((state) => state.map.mapElemsCounter);   

  const userRole = useSelector((state) => state.main.userRole);
  const userName = useSelector((state) => state.main.userName);
  const userColor = useSelector((state) => state.main.userColor);

  const serverMessage = useSelector((state) => state.websocket.serverMessage);

  const [isDragging, setIsDragging] = useState(false);
  const [draggingObject, setDraggingObject] = useState({});
  const [startPoint, setStartPoint] = useState({});
  const [isResizing, setIsResizing] = useState(false);
  const [resizingObject, setResizingObject] = useState({});
 
  let tempObj = {};

  function mapOnMouseDown(e){
    e.preventDefault();
    const gameMap = mapRef.current;
    const gameMapRect = gameMap.getBoundingClientRect();    

    if (activeAction === "brush"){

    } else {
      //activeAction = "arrow"
      const eventTargetName = e.target.getAttribute('name');
      console.log(eventTargetName);
      if (eventTargetName === "elemResizer"){
        //start resizing 
        setIsResizing(true);
        setResizingObject(e.target.parentElement);
        let rect = e.target.parentElement.getBoundingClientRect();

        let traceItem = document.createElement('div');
        traceItem.className = styles.paletteTraceElem;
        traceItem.style.left = rect.left + "px";
        traceItem.style.top = rect.top + "px";
        traceItem.style.width = rect.width + "px";
        traceItem.style.height = rect.height + "px";
        traceItem.id = "traceItem";
        document.body.append(traceItem);
      } else if (eventTargetName === "mapElem") {
        //start elem dragging
        setIsDragging(true);
        //setDraggingObject(e.target.closest('[name="mapElem"]'));
        setDraggingObject(e.target);

        let rect = e.target.getBoundingClientRect();

        let traceItem = document.createElement('div');
        traceItem.className = styles.paletteTraceElem;
        traceItem.style.left = rect.left + "px";
        traceItem.style.top = rect.top + "px";
        traceItem.style.width = rect.width + "px";
        traceItem.style.height = rect.height + "px";
        traceItem.id = "traceItem";

        setStartPoint({
          left: e.pageX,
          top: e.pageY,
          elemLeft: parseInt(traceItem.style.left) || 0,
          elemTop: parseInt(traceItem.style.top) || 0
        });

        document.body.append(traceItem);        
      }
    }
  }  

  function mapOnMouseMove(e){
    e.stopPropagation();
    if (isResizing){
      const gameMap = mapRef.current;
      const gameMapRect = gameMap.getBoundingClientRect();
      tempObj = document.getElementById("traceItem");

      let mouseX, mouseY;

      mouseX = e.pageX;
      mouseY = e.pageY;

      const newWidth = mouseX - parseInt(tempObj.style.left);
      const newHeight = mouseY - parseInt(tempObj.style.top);
      tempObj.style.width = newWidth > 0 ? newWidth + "px" : "2px"; 
      tempObj.style.height = newHeight > 0 ? newHeight + "px" : "2px"; 
    } else if (isDragging){
      tempObj = document.getElementById("traceItem");
 
      const newLeft = startPoint.elemLeft + (e.pageX - startPoint.left);
      const newTop = startPoint.elemTop + (e.pageY - startPoint.top);

      tempObj.style.left = newLeft + "px";
      tempObj.style.top = newTop + "px";

    }
  }

  function mapOnMouseUp(e){
    const gameMap = mapRef.current;
    const gameMapRect = gameMap.getBoundingClientRect();

    console.log('mapOnMouseUp');
    if (activeAction === "brush"){
      dispatch(mapSlice.incMapElemsCounter());
      let elemX, elemY;

      if (!gridBinding){
        elemX = e.pageX - gameMapRect.left + gameMap.scrollLeft - CELL_SIZE / 2 + "px";
        elemY = e.pageY - gameMapRect.top + gameMap.scrollTop - CELL_SIZE / 2 + "px";
      } else {
        elemX = e.pageX - gameMapRect.left + gameMap.scrollLeft - CELL_SIZE / 2;
        elemY = e.pageY - gameMapRect.top + gameMap.scrollTop - CELL_SIZE / 2;
        elemX = Math.round(elemX / 20) * 20 + "px";
        elemY = Math.round(elemY / 20) * 20 + "px";
      }
      const elemId = `mapElem_${mapElemCounter}`;

      let formClone = document.getElementById(activeForm).cloneNode(true);
      formClone.id = elemId;
      formClone.style.left = elemX;
      formClone.style.top = elemY;
      formClone.style.position = "absolute";
      formClone.style.outline = "none";
      formClone.draggable = "true";
      formClone.setAttribute("name", "mapElem");
      switch (activeLayer) {
        case "top": formClone.style.zIndex = "20";
          break;
        case "middle": formClone.style.zIndex = "15";
          break;
        case "bottom": formClone.style.zIndex = "10";
          break;                
      }

      let formCloneResizer = document.createElement('div');
      switch (activeLayer) {
        case "top": formCloneResizer.style.zIndex = "21";
          break;
        case "middle": formCloneResizer.style.zIndex = "16";
          break;
        case "bottom": formCloneResizer.style.zIndex = "11";
          break;                
      }

      formCloneResizer.className = styles.mapElemResizer;
      formCloneResizer.setAttribute("name", "elemResizer");
      formClone.appendChild(formCloneResizer);

      dispatch(mapSlice.addElemToMap(formClone.outerHTML));
    } else {
      if (isResizing){
        tempObj = resizingObject.cloneNode(true);
        let mouseX, mouseY;

        if (!gridBinding){
          mouseX = e.pageX - gameMapRect.left + gameMap.scrollLeft;
          mouseY = e.pageY - gameMapRect.top + gameMap.scrollTop;
        } else {
          mouseX = e.pageX - gameMapRect.left + gameMap.scrollLeft;
          mouseY = e.pageY - gameMapRect.top + gameMap.scrollTop;
          mouseX = Math.round(mouseX / 20) * 20;
          mouseY = Math.round(mouseY / 20) * 20;
        }       

        const newWidth = mouseX - parseInt(tempObj.style.left);
        const newHeight = mouseY - parseInt(tempObj.style.top);
        tempObj.style.width = newWidth > 0 ? newWidth + "px" : "2px"; 
        tempObj.style.height = newHeight > 0 ? newHeight + "px" : "2px"; 
        
        dispatch(mapSlice.changeElemOnMap(tempObj.outerHTML));

        setIsResizing(false);
        setResizingObject({});
        document.getElementById("traceItem").remove();
        tempObj = {};
      } else if (isDragging){
        tempObj = draggingObject.cloneNode(true);
        let traceItem = document.getElementById("traceItem");

        if (!gridBinding){
          tempObj.style.left = parseInt(traceItem.style.left) - gameMapRect.left + gameMap.scrollLeft + "px";
          tempObj.style.top = parseInt(traceItem.style.top) - gameMapRect.top + gameMap.scrollTop + "px";
        } else {
          let mouseX, mouseY;
          mouseX = parseInt(traceItem.style.left) - gameMapRect.left + gameMap.scrollLeft;
          mouseY = parseInt(traceItem.style.top) - gameMapRect.top + gameMap.scrollTop;
          tempObj.style.left = Math.round(mouseX / 20) * 20 + "px";
          tempObj.style.top = Math.round(mouseY / 20) * 20 + "px";
        }            
       
        dispatch(mapSlice.changeElemOnMap(tempObj.outerHTML));
        setDraggingObject({});
        setIsDragging(false);
        traceItem.remove();
        tempObj = {};        
      }
    }
  }  

  useEffect(() => {
    if (!clientUtils.isValidJSON(serverMessage)) return;
    let messageJSON = JSON.parse(serverMessage);
    if ((!messageJSON?.sectionName) || (messageJSON.sectionName !== 'gameMap')) return;

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

    mapRef.current.innerHTML = JSON.parse(messageJSON.sectionInfo.mapField);
  },[serverMessage]);  

  
  useEffect(() => {
    console.log('mapContent = ');
    console.log(mapContent);
    const messageForServer = clientUtils.messageMainWrapper(userRole, userName, userColor, 0);
    messageForServer['sectionName'] = 'gameMap';
    messageForServer['sectionInfo'] = {
      'mapField': JSON.stringify(mapRef.current.innerHTML),
    };
    dispatch(manageWebsocket('send',process.env.NEXT_PUBLIC_SERVER_URL,JSON.stringify(messageForServer)));       
    
  },[mapContent]); 

  function PaletteColorElem({ 
    elemClass = styles.paletteColorItem,
    elemText = "*",
    backgroundColor,
    textColor,
  }){
    let currentClass = '';
    activeColor === backgroundColor ? currentClass = `${elemClass} ${styles.activeElem}` : currentClass = `${elemClass}`;

    return (
      <div 
        className={ currentClass }
        style={{backgroundColor: backgroundColor, color: textColor}}
        onClick={(e)=> chooseColor(e,dispatch)}
      >
        { elemText }
      </div>
    );
  }
  function chooseColor(e,dispatch){
    dispatch(mapSlice.setActivePaletteColor(e.target.style.backgroundColor));
    dispatch(mapSlice.setActivePaletteTextColor(e.target.style.color));
  }

  const paletteColors = <div className={ styles.paletteColors }>
    <PaletteColorElem elemClass={ styles.paletteColorTransparent } elemText="transparent" backgroundColor="transparent" textColor="black" />
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
  </div>;

  function PaletteElem({ id }){
    let elemClass = id === activeForm ? `${styles.paletteElem} ${styles.activeElem}` : styles.paletteElem;
    let elemStyle = {...mapSlice.FORMS_LIST[id], "backgroundColor" : activeColor, "color" : activeTextColor };

    return (
      <div 
        id={ id }
        className={ elemClass }
        style={ elemStyle }
        onClick={(e)=> chooseForm(e,dispatch)}
      ></div>
    );
  }
  function chooseForm(e,dispatch){
    console.log(activeForm);
    dispatch(mapSlice.setActivePaletteForm(e.target.id));
  }  

  const paletteForms = <div className={ styles.paletteForms }>
    <PaletteElem id="elemForm_0" />
    <PaletteElem id="elemForm_1" />
    <PaletteElem id="elemForm_2" />
    <PaletteElem id="elemForm_3" />
    <PaletteElem id="elemForm_4" />
    <PaletteElem id="elemForm_5" />
    <PaletteElem id="elemForm_6" />
    <PaletteElem id="elemForm_7" />
    <PaletteElem id="elemForm_8" />  
    <PaletteElem id="elemForm_9" />
    <PaletteElem id="elemForm_10" />
    <PaletteElem id="elemForm_11" />        
  </div>;

  const paletteActions = <div className={ styles.paletteActions }>
    <div className={ styles.paletteActionElem } style={(activeAction === "arrow") ? {background: "yellow"} : {}} onClick={ () => dispatch(mapSlice.setActivePaletteAction("arrow")) }>&#x1F446;</div>
    <div className={ styles.paletteActionElem } style={(activeAction === "brush") ? {background: "yellow"} : {}}  onClick={ () => dispatch(mapSlice.setActivePaletteAction("brush")) }>&#128396;</div>
  </div>; 

  const paletteLayers = <div className={ styles.paletteLayers }>
    <div style={{"alignSelf": "flex-start"}}>Layers:</div>
    <div>
      <span>top:</span>
      <input name="layersSection" checked={ (activeLayer === "top") } type="radio" onChange={ () => dispatch(mapSlice.setActivePaletteLayer("top")) } />
    </div>
    <div>
      <span>middle:</span>
      <input name="layersSection" checked={ (activeLayer === "middle") } type="radio" onChange={ () => dispatch(mapSlice.setActivePaletteLayer("middle")) } />
    </div>
    <div>
      <span>bottom:</span>
      <input name="layersSection" checked={ (activeLayer === "bottom") } type="radio" onChange={ () => dispatch(mapSlice.setActivePaletteLayer("bottom")) } />
    </div>
    <div>
      <span>bind to grid:</span>
      <input type="checkbox" selected={gridBinding} onChange={ () => dispatch(mapSlice.switchGridBinding()) }/>
    </div>
  </div>

  return (
    <div className={ styles.gameMapWrapper }>
      <div className={ styles.mapFieldWrapper } onMouseDown={(e) => e.stopPropagation()}>
        <div 
          className={ styles.mapField } 
          ref={mapRef} 
          droppable="true" 
          onMouseUp={ (e) => { mapOnMouseUp(e); } } 
          onMouseDown={ (e) => { mapOnMouseDown(e); } }
          onMouseMove={ (e) => { mapOnMouseMove(e); } }
        >
          {mapContent.map((item, index) => (
            <div key={index} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </div>
      </div>
      <div className={ styles.gameMapTools } onMouseDown={(e) => e.stopPropagation()}>
        { paletteActions }
        { paletteColors }
        { paletteForms }
        { paletteLayers }
      </div>
    </div>
  );
}