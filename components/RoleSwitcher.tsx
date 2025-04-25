"use client";

import styles from "./RoleSwitcher.module.css";
import { useSelector, useDispatch } from "react-redux";
import * as actions from "../app/store/slices/mainSlice";
import { manageWebsocket } from "../app/store/slices/websocketSlice";
import * as websocketActions from "../app/store/slices/websocketSlice";
import type { RootState, AppDispatch } from "../app/store/store";
import { UserRole, LayoutLine } from "../app/store/slices/mainSlice";

export default function RoleSwitcher() {
  const dispatch: AppDispatch = useDispatch();
  const userRole = useSelector((state: RootState) => state.main.userRole);
  const userEmail = useSelector((state: RootState) => state.main.userEmail);
  const winList = useSelector((state: RootState) => state.main.winList);

  function switchRole(role: UserRole) {
    if (userRole !== role) {
      dispatch(actions.setUserRole(role));
      const activeWins = JSON.parse(
        localStorage.getItem(`activeWinList${userRole}`) || "[]"
      );
      const hiddenLayout = JSON.parse(
        localStorage.getItem("hiddenLayout") || "[]"
      );
      const newLayout: LayoutLine[] = [];

      activeWins.forEach((item: string) => {
        //item = Polydice, etc
        if (winList[role].includes(item)) {
          let layItem = hiddenLayout.find((l: LayoutLine) => l.i === item);
          if (layItem) {
            newLayout.push(hiddenLayout.find((l: LayoutLine) => l.i === item));
          } else {
            newLayout.push({ i: item, x: 0, y: 0, w: 5, h: 15 });
          }
        }
      });
      dispatch(actions.setLayout(newLayout));
      if (role === "Gamer") {
        dispatch(websocketActions.setGameId(null));
      } else if (role === "Master") {
        dispatch(websocketActions.setGameId(userEmail));
      }
      dispatch(
        manageWebsocket("disconnect", process.env.NEXT_PUBLIC_SERVER_URL)
      );
      dispatch(actions.setConnectionTitle("Connect"));
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
