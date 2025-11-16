"use client";

import { useRef, useEffect } from "react";
import styles from "./Polydice.module.css";
import { useSelector, useDispatch } from "react-redux";
import * as actions from "../../../app/store/slices/polydiceSlice";
import * as clientUtils from "../../../utils/clientUtils";
import { manageWebsocket } from "../../../app/store/slices/websocketSlice";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "../../../app/store/store";
import type {
  SectionName,
  MessageForServer,
} from "../../../app/store/slices/websocketSlice";

export default function Polydice() {
  const dispatch: AppDispatch = useDispatch();
  const numberOfRolls = useRef<HTMLInputElement>(null);
  const rollStats = useRef<HTMLInputElement>(null);
  const rollHP = useRef<HTMLInputElement>(null);
  const polydiceLogs = useRef<HTMLInputElement>(null);
  const chatString = useRef<HTMLInputElement>(null);
  const activeDice = useSelector(
    (state: RootState) => state.polydice.activeDice
  );

  const loginState = useSelector((state: RootState) => state.main.loginState);
  const connectionState = useSelector(
    (state: RootState) => state.websocket.connectionState
  );

  const userRole = useSelector((state: RootState) => state.main.userRole);
  const userName = useSelector((state: RootState) => state.main.userName);
  const userColor = useSelector((state: RootState) => state.main.userColor);
  const serverMessage = useSelector(
    (state: RootState) => state.websocket.serverMessage
  );
  const gameId = useSelector((state: RootState) => state.websocket.gameId);

  const diceClick = (diceSize: number) => {
    dispatch(actions.setActiveDice(diceSize));
  };

  function offlineRoll(dice: number) {
    return Math.floor(Math.random() * dice) + 1;
  }

  function stat3from4(...nums: number[]): number {
    nums.sort((a, b) => b - a);
    nums.pop();
    return nums.reduce((acc, item) => acc + item, 0);
  }

  function makeRoll(activeDice: number) {
    let rollsCount = parseInt(numberOfRolls.current?.value, 10) || 1;
    if (rollsCount < 1) rollsCount = 1;
    if (rollsCount > 100) rollsCount = 100;

    if (connectionState === 1) {
      const messageForServer: MessageForServer = {
        gameId: gameId,
        user: {
          userRole: userRole,
          userName: userName,
          userColor: userColor,
        },
        sectionName: "polydice",
        sectionInfo: {
          source: "polydice",
          rollNumbers: rollsCount,
          dice: activeDice || 20,
          diceModifier: 0,
        },
      };

      if (rollHP.current.checked) {
        messageForServer.sectionInfo["diceMode"] = "HP";
        messageForServer.sectionInfo.rollNumbers = rollsCount * 2;
      }

      if (rollStats.current.checked) {
        messageForServer.sectionInfo["diceMode"] = "stats";
        messageForServer.sectionInfo.rollNumbers = rollsCount * 4;
        messageForServer.sectionInfo["dice"] = 6;
      }

      dispatch(
        manageWebsocket(
          "send",
          process.env.NEXT_PUBLIC_SERVER_URL,
          messageForServer
        )
      );
    } else {
      //offline roll
      let currentLog = "";
      if (loginState) {
        currentLog = `<b style="color: ${userColor}"}>${userName}:</b> `;
      }

      let dice = activeDice;
      if (rollHP.current.checked) {
        rollsCount = rollsCount * 2;
      }

      if (rollStats.current.checked) {
        rollsCount = rollsCount * 4;
        dice = 6;
      }

      let rollResults = [];
      for (let i = 0; i < rollsCount; i++) {
        rollResults.push(offlineRoll(dice));
      }

      if (rollStats.current.checked) {
        for (let i = 0; i < rollResults.length; i = i + 4) {
          currentLog += "<br>";
          currentLog += `<span class=${styles.rollResultText}>${rollResults[0 + i]} ${rollResults[1 + i]} ${rollResults[2 + i]} ${rollResults[3 + i]}`;
          currentLog += ` (${stat3from4(rollResults[0 + i], rollResults[1 + i], rollResults[2 + i], rollResults[3 + i])})</span>`;
        }
      } else if (rollHP.current.checked) {
        currentLog += `<span class=${styles.rollResultText}>`;
        const maxDuo = [];
        for (let i = 0; i < rollResults.length; i = i + 2) {
          if (rollResults[i] > rollResults[i + 1]) {
            maxDuo.push(rollResults[i]);
          } else {
            maxDuo.push(rollResults[i + 1]);
          }
        }
        for (let i = 0; i < rollResults.length; i = i + 2) {
          currentLog += `${rollResults[i]}|${rollResults[i + 1]}, `;
        }
        currentLog += `</span> on <b style="color: ${userColor}"}>d${dice}</b>`;
        currentLog += ` (a total of <b>${maxDuo.reduce(
          (item, sum) => sum + item
        )}</b>)`;
      } else {
        currentLog += `<span class=${styles.rollResultText}>${rollResults.join(
          ", "
        )}</span> on <b style="color: ${userColor}"}>d${dice}</b>`;

        if (Number(rollsCount) > 1) {
          currentLog += ` (a total of <b>${rollResults.reduce(
            (item, sum) => sum + item
          )}</b>)`;
        }
      }

      polydiceLogs.current.innerHTML =
        currentLog + "<br>" + polydiceLogs.current?.innerHTML;
    }
  }

  useEffect(() => {
    if (!clientUtils.isValidJSON(serverMessage)) return;

    const messageJSONUnknown: unknown = JSON.parse(serverMessage);
    let currentLog = "";

    if (
      typeof messageJSONUnknown !== "object" ||
      messageJSONUnknown === null ||
      !("sectionName" in messageJSONUnknown)
    )
      return;

    if (
      messageJSONUnknown.sectionName !== "polydice" &&
      messageJSONUnknown.sectionName !== "chat"
    )
      return;

    type MessageFromServer = MessageForServer & {
      rollResults?: number[];
    };

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
    const messageJSON = messageJSONUnknown as MessageFromServer;
    let userName = messageJSON.user.userName;
    let userColor = messageJSON.user.userColor;

    if (messageJSON.sectionInfo.source === "polydice") {
      if (messageJSON?.rollResults) {
        currentLog = `<b style="color: ${userColor}"}>${userName}:</b> `;
        let dice = messageJSON.sectionInfo.dice;
        let rollResults = messageJSON.rollResults;

        if (messageJSON.sectionInfo?.diceMode) {
          if (messageJSON.sectionInfo.diceMode === "stats") {
            for (let i = 0; i < rollResults.length; i = i + 4) {
              currentLog += "<br>";
              currentLog += `<span class=${styles.rollResultText}>${rollResults[0 + i]} ${rollResults[1 + i]} ${rollResults[2 + i]} ${rollResults[3 + i]}`;
              currentLog += ` (${stat3from4(rollResults[0 + i], rollResults[1 + i], rollResults[2 + i], rollResults[3 + i])})</span>`;
            }
          } else if (messageJSON.sectionInfo.diceMode === "HP") {
            currentLog += `<span class=${styles.rollResultText}>`;
            const maxDuo = [];
            for (let i = 0; i < rollResults.length; i = i + 2) {
              if (rollResults[i] > rollResults[i + 1]) {
                maxDuo.push(rollResults[i]);
              } else {
                maxDuo.push(rollResults[i + 1]);
              }
            }
            for (let i = 0; i < rollResults.length; i = i + 2) {
              currentLog += `${rollResults[i]}|${rollResults[i + 1]}, `;
            }
            currentLog += `</span> on <b style="color: ${userColor}"}>d${dice}</b>`;
            currentLog += ` (a total of <b>${maxDuo.reduce(
              (item, sum) => sum + item
            )}</b>)`;
          }
        } else {
          currentLog += `<span class=${styles.rollResultText}>${rollResults.join(
            ", "
          )}</span> on <b style="color: ${userColor}"}>d${dice}</b>`;

          if (Number(messageJSON.sectionInfo.rollNumbers) > 1) {
            currentLog += ` (a total of <b>${messageJSON.rollResults.reduce(
              (item, sum) => sum + item
            )}</b>)`;
          }
        }
      } else if (messageJSON.sectionName === "chat") {
        currentLog = `<b style="color: ${userColor}"}>${userName} says:</b> `;
        currentLog += messageJSON.sectionInfo.chatMessage;
      }
    } else if (messageJSON.sectionInfo.source === "charsheet") {
      currentLog = `<b style="color: ${userColor}"}>${userName}:</b> `;
      let rollResult = messageJSON.rollResults[0];
      let diceModifier = messageJSON.sectionInfo.diceModifier;
      let clearRoll = rollResult - Number(diceModifier);
      currentLog += `<span class=${styles.rollResultText}>${rollResult}</span>`;
      currentLog += `<span class=${styles.rollResultText}> (${clearRoll} on d20 + ${diceModifier})</span>`;
      currentLog += ` on <b style="color: ${userColor}"}>${messageJSON.sectionInfo.fieldName}</b>`;
    }

    polydiceLogs.current.innerHTML =
      currentLog + "<br>" + polydiceLogs.current?.innerHTML;
  }, [serverMessage]);

  function sendChatMessage() {
    const messageForServer: MessageForServer = {
      gameId: gameId,
      user: {
        userRole: userRole,
        userName: userName,
        userColor: userColor,
      },
      sectionName: "chat",
      sectionInfo: {
        source: "polydice",
        chatMessage: chatString.current.innerHTML,
      },
    };

    dispatch(
      manageWebsocket(
        "send",
        process.env.NEXT_PUBLIC_SERVER_URL,
        messageForServer
      )
    );
    chatString.current.innerHTML = "";
  }

  return (
    <div id="diceWrapper" className={styles.diceWrapper}>
      <div id="diceSet" className={styles.diceSet}>
        <button
          name="dice"
          className={`${styles.dice} ${
            activeDice === 3 ? styles.switcherOn : styles.switcherOff
          } `}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => diceClick(3)}
        >
          d3
        </button>
        <button
          name="dice"
          className={`${styles.dice} ${
            activeDice === 4 ? styles.switcherOn : styles.switcherOff
          } `}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => diceClick(4)}
        >
          d4
        </button>
        <button
          name="dice"
          className={`${styles.dice} ${
            activeDice === 6 ? styles.switcherOn : styles.switcherOff
          } `}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => diceClick(6)}
        >
          d6
        </button>
        <button
          name="dice"
          className={`${styles.dice} ${
            activeDice === 8 ? styles.switcherOn : styles.switcherOff
          } `}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => diceClick(8)}
        >
          d8
        </button>
        <button
          name="dice"
          className={`${styles.dice} ${
            activeDice === 10 ? styles.switcherOn : styles.switcherOff
          } `}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => diceClick(10)}
        >
          d10
        </button>
        <button
          name="dice"
          className={`${styles.dice} ${
            activeDice === 12 ? styles.switcherOn : styles.switcherOff
          } `}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => diceClick(12)}
        >
          d12
        </button>
        <button
          name="dice"
          className={`${styles.dice} ${
            activeDice === 20 ? styles.switcherOn : styles.switcherOff
          } `}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => diceClick(20)}
        >
          d20
        </button>
        <button
          name="dice"
          className={`${styles.dice} ${
            activeDice === 100 ? styles.switcherOn : styles.switcherOff
          } `}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => diceClick(100)}
        >
          d100
        </button>
      </div>
      <div className={styles.rollVariations}></div>
      <div
        className={styles.logs}
        ref={polydiceLogs}
        onMouseDown={(e: React.MouseEvent<HTMLDivElement>) =>
          e.stopPropagation()
        }
      ></div>
      {loginState && connectionState === 1 && (
        <div className={styles.chat} onMouseDown={(e) => e.stopPropagation()}>
          <div
            className={styles.chatString}
            ref={chatString}
            contentEditable="true"
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendChatMessage();
                (e.target as HTMLDivElement).blur();
              }
            }}
          ></div>
          <button
            className={styles.chatButton}
            onClick={() => {
              sendChatMessage();
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
            makeRoll(activeDice);
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
        <div className={styles.numberOfRolls}>
          <div className={styles.optionTitle}>Roll Stats</div>
          <input
            className={styles.rollStats}
            ref={rollStats}
            type="checkbox"
            onChange={() => {
              rollHP.current.checked = false;
            }}
            onMouseDown={(e) => e.stopPropagation()}
          ></input>
        </div>
        <div className={styles.numberOfRolls}>
          <div className={styles.optionTitle}>Roll HP</div>
          <input
            className={styles.rollHP}
            ref={rollHP}
            type="checkbox"
            onChange={() => {
              rollStats.current.checked = false;
            }}
            onMouseDown={(e) => e.stopPropagation()}
          ></input>
        </div>
      </div>
    </div>
  );
}
