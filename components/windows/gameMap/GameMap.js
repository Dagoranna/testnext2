'use client';

import styles from './GameMap.module.css';
import { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actions from '../../../app/store/slices/mapSlice';
import { manageWebsocket } from "../../../app/store/slices/websocketSlice";
import * as clientUtils from '../../../utils/clientUtils';

export default function GameMap() {
  const dispatch = useDispatch();
  const mapRef = useRef('');
  const mapState = useSelector((state) => state.map.mapState);
  const userRole = useSelector((state) => state.main.userRole);
  const userName = useSelector((state) => state.main.userName);
  const userColor = useSelector((state) => state.main.userColor);
  const serverMessage = useSelector((state) => state.websocket.serverMessage);   

  function placeFigureOnMap(e,dispatch){
    const pageX = e.pageX;
    const pageY = e.pageY;

    const container = e.target;
    const containerRect = container.getBoundingClientRect();
    const clickX = pageX - containerRect.left + container.scrollLeft;
    const clickY = pageY - containerRect.top + container.scrollTop;

    const object = document.createElement('div');
    object.style.left = `${clickX - object.offsetWidth / 2}px`;
    object.style.top = `${clickY - object.offsetHeight / 2}px`;
    
    object.className = styles.object;
    e.target.appendChild(object);

    const messageForServer = clientUtils.messageMainWrapper(userRole, userName, userColor, 0);
    
    messageForServer['sectionName'] = 'gameMap';
    messageForServer['sectionInfo'] = {
      'mapField': JSON.stringify(mapRef.current.innerHTML),
    };

    dispatch(manageWebsocket('send',process.env.NEXT_PUBLIC_SERVER_URL,JSON.stringify(messageForServer)));    
  }

  useEffect(() => {
    console.log(serverMessage);
    if (!clientUtils.isValidJSON(serverMessage)) return;
 
    let messageJSON = JSON.parse(serverMessage);
    let currentLog = '';

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

  return (
    <div className={ styles.gameMapWrapper }>
      <div className={ styles.mapFieldWrapper } onMouseDown={(e) => e.stopPropagation()}>
        <div className={ styles.mapField } ref={mapRef} onClick={ (e) => {placeFigureOnMap(e,dispatch);}}>
          map!
        </div>
      </div>
      <div className={ styles.gameMapTools }>
        tools!
      </div>
    </div>
  );
}

