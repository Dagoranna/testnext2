"use client";

import styles from "./RoleSwitcher.module.css";
import { useSelector, useDispatch } from "react-redux";
import * as actions from "../app/store/slices/mainSlice";
import { manageWebsocket } from "../app/store/slices/websocketSlice";
import * as websocketActions from "../app/store/slices/websocketSlice";

export default function RoleSwitcher() {
  const dispatch = useDispatch();
  const userRole = useSelector((state) => state.main.userRole);
  const userEmail = useSelector((state) => state.main.userEmail);
  const winList = useSelector((state) => state.main.winList);

  function switchRole(role) {
    if (userRole !== role) {
      dispatch(actions.setUserRole(role));
      const activeWins = JSON.parse(
        localStorage.getItem(`activeWinList${userRole}`)
      );
      const hiddenLayout = JSON.parse(localStorage.getItem("hiddenLayout"));
      const newLayout = [];

      activeWins.map((item) => {
        //item = Polydice, etc
        if (winList[role].includes(item)) {
          let layItem = hiddenLayout.find((l) => l.i === item);
          if (layItem) {
            newLayout.push(hiddenLayout.find((l) => l.i === item));
          } else {
            newLayout.push({ i: item, x: 0, y: 0, w: 5, h: 15 });
          }
        }
      });
      dispatch(actions.setLayout(newLayout));
      if (role === "Gamer") {
        dispatch(websocketActions.setGameId(0));
      } else if (role === "Master") {
        dispatch(websocketActions.setGameId(userEmail));
      }
      dispatch(
        manageWebsocket("disconnect", process.env.NEXT_PUBLIC_SERVER_URL)
      );
    }
  }

  return (
    <div className={styles.roleSwitcher}>
      <div
        className={`${styles.sliderButton} ${styles.leftPart} ${
          userRole === "Gamer" ? styles.buttonOn : styles.buttonOff
        }`}
        onClick={() => switchRole("Gamer")}
      >
        Gamer
      </div>
      <div
        className={`${styles.sliderButton} ${styles.rightPart} ${
          userRole === "Master" ? styles.buttonOn : styles.buttonOff
        }`}
        onClick={() => switchRole("Master")}
      >
        Master
      </div>
    </div>
  );
}
