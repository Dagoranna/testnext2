'use client';

import { useRef, useEffect } from 'react';
import styles from './Polydice.module.css';
import { useSelector, useDispatch } from 'react-redux';
import * as actions from '../../../app/store/slices/polydiceSlice';
import * as clientUtils from '../../../utils/clientUtils';
import { manageWebsocket } from "../../../app/store/slices/websocketSlice";

const diceClick = (dispatch, diceSize) => {
  dispatch(actions.setActiveDice(diceSize));
};

export default function Polydice() {
  const dispatch = useDispatch();
  const numberOfRolls = useRef(1);
  const polydiceLogs = useRef('');
  const activeDice = useSelector((state) => state.polydice.activeDice); 

  const userRole = useSelector((state) => state.main.userRole);
  const userName = useSelector((state) => state.main.userName);
  const userColor = useSelector((state) => state.main.userColor);
  const serverMessage = useSelector((state) => state.websocket.serverMessage);

  function makeRoll(dispatch,activeDice){
    const messageForServer = clientUtils.messageMainWrapper(userRole, userName, userColor, 0);
    
    messageForServer['sectionName'] = 'polydice';
    messageForServer['sectionInfo'] = {
      'source': 'polydice',
      'rollNumbers': numberOfRolls.current.value,
      'dice': activeDice,
      'diceModifier': 0,
    };

    dispatch(manageWebsocket('send',process.env.NEXT_PUBLIC_SERVER_URL,JSON.stringify(messageForServer)));
  }

  function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
  }

  useEffect(() => {
    console.log(serverMessage);
    if (!isValidJSON(serverMessage)) return;
 
    let messageJSON = JSON.parse(serverMessage);
    let currentLog = '';
    /*{
    "gameId":0,
    "user":{
      "userRole":"Gamer",
      "userName":"IcyWizard",
      "userColor":"DarkGreen"
    },
    "sectionName":"polydice",
    "sectionInfo":{
      "source":"polydice",
      "rollNumbers":"1",
      "dice":20,
      "diceModifier":0
    },
    "rollResults":[6]}*/
    let userName = messageJSON.user.userName;
    let userColor = messageJSON.user.userColor;
   
    currentLog = `<b style="color: ${userColor}"}>${userName}:</b> `;
    
    if (messageJSON?.rollResults){
      let dice = messageJSON.sectionInfo.dice;
      let rollResults = messageJSON.rollResults;
      currentLog += `<b>${rollResults.join()}</b> on <b style="color: ${userColor}"}>d${dice}</b>`;  

      if (Number(messageJSON.sectionInfo.rollNumbers) > 1){
        currentLog += ` (a total of <b>${messageJSON.rollResults.reduce((item,sum) => sum+item)}</b>)`;
      }
    }

    polydiceLogs.current.innerHTML = currentLog + '<br>' + polydiceLogs.current.innerHTML;
  },[serverMessage]);

  return (
    <div className={ styles.diceWrapper }>
      <div className={ styles.diceSet }>
        <button name="dice" className={ `${styles.dice} ${(activeDice === 3) ? styles.switcherOn : styles.switcherOff} ` } onMouseDown={(e) => e.stopPropagation()} onClick={ () => diceClick(dispatch, 3) } >d3</button>
        <button name="dice" className={ `${styles.dice} ${(activeDice === 4) ? styles.switcherOn : styles.switcherOff} ` } onMouseDown={(e) => e.stopPropagation()} onClick={ () => diceClick(dispatch, 4) } >d4</button>
        <button name="dice" className={ `${styles.dice} ${(activeDice === 6) ? styles.switcherOn : styles.switcherOff} ` } onMouseDown={(e) => e.stopPropagation()} onClick={ () => diceClick(dispatch, 6) } >d6</button>
        <button name="dice" className={ `${styles.dice} ${(activeDice === 8) ? styles.switcherOn : styles.switcherOff} ` } onMouseDown={(e) => e.stopPropagation()} onClick={ () => diceClick(dispatch, 8) } >d8</button>
        <button name="dice" className={ `${styles.dice} ${(activeDice === 10) ? styles.switcherOn : styles.switcherOff} ` } onMouseDown={(e) => e.stopPropagation()} onClick={ () => diceClick(dispatch, 10) } >d10</button>
        <button name="dice" className={ `${styles.dice} ${(activeDice === 12) ? styles.switcherOn : styles.switcherOff} ` } onMouseDown={(e) => e.stopPropagation()} onClick={ () => diceClick(dispatch, 12) } >d12</button>
        <button name="dice" className={ `${styles.dice} ${(activeDice === 20) ? styles.switcherOn : styles.switcherOff} ` } onMouseDown={(e) => e.stopPropagation()} onClick={ () => diceClick(dispatch, 20) } >d20</button>
        <button name="dice" className={ `${styles.dice} ${(activeDice === 100) ? styles.switcherOn : styles.switcherOff} ` } onMouseDown={(e) => e.stopPropagation()} onClick={ () => diceClick(dispatch, 100) } >d100</button>
      </div>
      <div className={ styles.rollVariations }></div>
      <div className={ styles.logs } ref={polydiceLogs} onMouseDown={(e) => e.stopPropagation()} ></div>
      <div className={ styles.diceFooter }>
        <button className={ styles.rollButton } onMouseDown={(e) => e.stopPropagation()} onClick={ () => { makeRoll(dispatch,activeDice); } } >Roll!</button>
        <div className={ styles.numberOfRolls } >
          <div className={ styles.optionTitle} >Number of rolls</div>
          <input className={ styles.numberOfRollsInput } ref={numberOfRolls} type='number' min='1' defaultValue={1} onMouseDown={(e) => e.stopPropagation()} ></input>
        </div>
      </div>
      
    </div>
  );
}

