'use client';

import styles from './GameMap.module.css';
import ReactDOM from 'react-dom';
import React from 'react';
import { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as mapSlice from '../../../app/store/slices/mapSlice';
import { manageWebsocket } from "../../../app/store/slices/websocketSlice";
import * as clientUtils from '../../../utils/clientUtils';
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import MapElem from "./MapElem";

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
  

  function changeMap(e){
    console.log(document.getElementById(activeForm));
    dispatch(mapSlice.incMapElemsCounter());

    const gameMap = mapRef.current;
    const gameMapRect = gameMap.getBoundingClientRect();
    

    //e.pageX - mouse pos on page including page scrolling
    //10 = 1/2 cell size
    const elemX = e.pageX - gameMapRect.left + gameMap.scrollLeft - 10 + "px";
    const elemY = e.pageY - gameMapRect.top + gameMap.scrollTop - 10 + "px";
    const elemId = `mapElem_${mapElemCounter}`;

    let formClone = document.getElementById(activeForm).cloneNode(true);
    formClone.id = elemId;
    formClone.style.left = elemX;
    formClone.style.top = elemY;
    formClone.style.position = "absolute";
    formClone.style.outline = "none";
    
    dispatch(mapSlice.addElemToMap(formClone.outerHTML));
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
    console.log(mapContent);

   /* const messageForServer = clientUtils.messageMainWrapper(userRole, userName, userColor, 0);
    messageForServer['sectionName'] = 'gameMap';
    messageForServer['sectionInfo'] = {
      'mapField': JSON.stringify(mapRef.current.innerHTML),
    };
    dispatch(manageWebsocket('send',process.env.NEXT_PUBLIC_SERVER_URL,JSON.stringify(messageForServer)));       
    */
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
    <DndProvider backend={HTML5Backend}>
      <div className={ styles.gameMapWrapper }>
        <div className={ styles.mapFieldWrapper } onMouseDown={(e) => e.stopPropagation()}>
          <div className={ styles.mapField } ref={mapRef} droppable="true" onClick={ (e) => {changeMap(e);}}>
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
    </DndProvider>
  );
}

/*  function moveFigureOnMap(e,dispatch){
    const container = e.target;
    const containerRect = container.getBoundingClientRect();

    //mouse pos on page (including scrolling)
    const pageX = e.pageX;
    const pageY = e.pageY;

    const clickX = pageX - containerRect.left + container.scrollLeft;
    const clickY = pageY - containerRect.top + container.scrollTop;

    const newElem = document.createElement('div');
    newElem.className = styles.newElemStyle;

    newElem.style.left = `${clickX - newElem.offsetWidth / 2}px`;
    newElem.style.top = `${clickY - newElem.offsetHeight / 2}px`;

    e.target.appendChild(newElem);

    const messageForServer = clientUtils.messageMainWrapper(userRole, userName, userColor, 0);
    messageForServer['sectionName'] = 'gameMap';
    messageForServer['sectionInfo'] = {
      'mapField': JSON.stringify(mapRef.current.innerHTML),
    };
    dispatch(manageWebsocket('send',process.env.NEXT_PUBLIC_SERVER_URL,JSON.stringify(messageForServer)));    
  }  
*/

