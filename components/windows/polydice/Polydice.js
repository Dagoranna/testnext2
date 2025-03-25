"use client";

import { useRef, useEffect } from "react";
import styles from "./Polydice.module.css";
import { useSelector, useDispatch } from "react-redux";
import * as actions from "../../../app/store/slices/polydiceSlice";
import * as clientUtils from "../../../utils/clientUtils";
import { manageWebsocket } from "../../../app/store/slices/websocketSlice";

const diceClick = (dispatch, diceSize) => {
  dispatch(actions.setActiveDice(diceSize));
};

function offlineRoll(dice) {
  return Math.floor(Math.random() * dice) + 1;
}

export default function Polydice() {
  const dispatch = useDispatch();
  const numberOfRolls = useRef(1);
  const polydiceLogs = useRef("");
  const chatString = useRef("");
  const activeDice = useSelector((state) => state.polydice.activeDice);

  const loginState = useSelector((state) => state.main.loginState);
  const connectionState = useSelector(
    (state) => state.websocket.connectionState
  );

  const userRole = useSelector((state) => state.main.userRole);
  const userName = useSelector((state) => state.main.userName);
  const userColor = useSelector((state) => state.main.userColor);
  const serverMessage = useSelector((state) => state.websocket.serverMessage);

  function makeRoll(dispatch, activeDice) {
    let rollsCount = numberOfRolls.current?.value || 1;
    if (rollsCount < 1) rollsCount = 1;
    if (rollsCount > 100) rollsCount = 100;

    if (connectionState === 1) {
      const messageForServer = clientUtils.messageMainWrapper(
        userRole,
        userName,
        userColor,
        0
      );

      messageForServer["sectionName"] = "polydice";
      messageForServer["sectionInfo"] = {
        source: "polydice",
        rollNumbers: rollsCount,
        dice: activeDice,
        diceModifier: 0,
      };

      dispatch(
        manageWebsocket(
          "send",
          process.env.NEXT_PUBLIC_SERVER_URL,
          JSON.stringify(messageForServer)
        )
      );
    } else {
      //offline roll
      let currentLog = "";
      if (loginState) {
        currentLog = `<b style="color: ${userColor}"}>${userName}:</b> `;
      }

      let dice = activeDice;

      let rollResults = [];
      for (let i = 0; i < rollsCount; i++) {
        rollResults.push(offlineRoll(activeDice));
      }

      currentLog += `<span class=${styles.rollResultText}>${rollResults.join(
        ", "
      )}</span> on <b style="color: ${userColor}"}>d${dice}</b>`;

      if (Number(rollsCount) > 1) {
        currentLog += ` (a total of <b>${rollResults.reduce(
          (item, sum) => sum + item
        )}</b>)`;
      }

      polydiceLogs.current.innerHTML =
        currentLog + "<br>" + polydiceLogs.current.innerHTML;
    }
  }

  useEffect(() => {
    console.log(serverMessage);
    if (!clientUtils.isValidJSON(serverMessage)) return;

    let messageJSON = JSON.parse(serverMessage);
    let currentLog = "";

    if (!messageJSON?.sectionName) return;
    if (
      messageJSON.sectionName !== "polydice" &&
      messageJSON.sectionName !== "chat"
    )
      return;
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

    if (messageJSON?.rollResults) {
      currentLog = `<b style="color: ${userColor}"}>${userName}:</b> `;
      let dice = messageJSON.sectionInfo.dice;
      let rollResults = messageJSON.rollResults;
      currentLog += `<span class=${styles.rollResultText}>${rollResults.join(
        ", "
      )}</span> on <b style="color: ${userColor}"}>d${dice}</b>`;

      if (Number(messageJSON.sectionInfo.rollNumbers) > 1) {
        currentLog += ` (a total of <b>${messageJSON.rollResults.reduce(
          (item, sum) => sum + item
        )}</b>)`;
      }
    } else if (messageJSON.sectionName === "chat") {
      currentLog = `<b style="color: ${userColor}"}>${userName} says:</b> `;
      currentLog += messageJSON.sectionInfo.chatMessage;
    }

    polydiceLogs.current.innerHTML =
      currentLog + "<br>" + polydiceLogs.current.innerHTML;
  }, [serverMessage]);

  function sendChatMessage(dispatch) {
    const messageForServer = clientUtils.messageMainWrapper(
      userRole,
      userName,
      userColor,
      0
    );

    messageForServer["sectionName"] = "chat";
    messageForServer["sectionInfo"] = {
      chatMessage: chatString.current.innerHTML,
    };

    dispatch(
      manageWebsocket(
        "send",
        process.env.NEXT_PUBLIC_SERVER_URL,
        JSON.stringify(messageForServer)
      )
    );
    chatString.current.innerHTML = "";
  }

  return (
    <div className={styles.diceWrapper}>
      <div className={styles.diceSet}>
        <button
          name="dice"
          className={`${styles.dice} ${
            activeDice === 3 ? styles.switcherOn : styles.switcherOff
          } `}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => diceClick(dispatch, 3)}
        >
          d3
        </button>
        <button
          name="dice"
          className={`${styles.dice} ${
            activeDice === 4 ? styles.switcherOn : styles.switcherOff
          } `}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => diceClick(dispatch, 4)}
        >
          d4
        </button>
        <button
          name="dice"
          className={`${styles.dice} ${
            activeDice === 6 ? styles.switcherOn : styles.switcherOff
          } `}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => diceClick(dispatch, 6)}
        >
          d6
        </button>
        <button
          name="dice"
          className={`${styles.dice} ${
            activeDice === 8 ? styles.switcherOn : styles.switcherOff
          } `}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => diceClick(dispatch, 8)}
        >
          d8
        </button>
        <button
          name="dice"
          className={`${styles.dice} ${
            activeDice === 10 ? styles.switcherOn : styles.switcherOff
          } `}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => diceClick(dispatch, 10)}
        >
          d10
        </button>
        <button
          name="dice"
          className={`${styles.dice} ${
            activeDice === 12 ? styles.switcherOn : styles.switcherOff
          } `}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => diceClick(dispatch, 12)}
        >
          d12
        </button>
        <button
          name="dice"
          className={`${styles.dice} ${
            activeDice === 20 ? styles.switcherOn : styles.switcherOff
          } `}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => diceClick(dispatch, 20)}
        >
          d20
        </button>
        <button
          name="dice"
          className={`${styles.dice} ${
            activeDice === 100 ? styles.switcherOn : styles.switcherOff
          } `}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => diceClick(dispatch, 100)}
        >
          d100
        </button>
      </div>
      <div className={styles.rollVariations}></div>
      <div
        className={styles.logs}
        ref={polydiceLogs}
        onMouseDown={(e) => e.stopPropagation()}
      ></div>
      {loginState && connectionState === 1 && (
        <div className={styles.chat} onMouseDown={(e) => e.stopPropagation()}>
          <div
            className={styles.chatString}
            ref={chatString}
            contentEditable="true"
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendChatMessage(dispatch);
                e.target.blur();
              }
            }}
          ></div>
          <button
            className={styles.chatButton}
            onClick={() => {
              sendChatMessage(dispatch);
            }}
          >
            ⤶
          </button>
        </div>
      )}
      {connectionState !== 1 && (
        <div className={styles.offlineMessage}>offline mode</div>
      )}
      <div className={styles.diceFooter}>
        <button
          className={styles.rollButton}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => {
            makeRoll(dispatch, activeDice);
          }}
        >
          Roll!
        </button>
        <div className={styles.numberOfRolls}>
          <div className={styles.optionTitle}>Number of rolls</div>
          <input
            className={styles.numberOfRollsInput}
            ref={numberOfRolls}
            type="number"
            min="1"
            defaultValue={1}
            onMouseDown={(e) => e.stopPropagation()}
          ></input>
        </div>
      </div>
    </div>
  );
}
