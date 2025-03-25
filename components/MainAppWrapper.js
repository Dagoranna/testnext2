"use client";

import { useState, useEffect } from "react";
import FormWrapper from "./forms/FormWrapper";
import AuthForm from "./forms/AuthForm/AuthForm";
import TopPanel from "./TopPanel";
import { useSelector, useDispatch } from "react-redux";
import * as actions from "../app/store/slices/mainSlice";

export default function MainAppWrapper({ children }) {
  const dispatch = useDispatch();
  const layout = useSelector((state) => state.main.layout);
  const winList = useSelector((state) => state.main.winList);
  const userEmail = useSelector((state) => state.main.userEmail);
  const loginState = useSelector((state) => state.main.loginState);
  const userRole = useSelector((state) => state.main.userRole);

  //auth
  useEffect(() => {
    async function checkAuthToken() {
      let response = await fetch("/api/auth/checkauthtoken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      let baseResponse = await response.json();

      if (response.ok) {
        if (baseResponse.tokenState === 1) {
          dispatch(actions.setLoginState(true));
          dispatch(actions.setUserEmail(baseResponse.email));
        } else {
          console.log("error!");
          console.log(baseResponse.message);
        }
      } else {
        throw new Error("error in database response");
      }
    }

    checkAuthToken();
  }, []);

  //WinList
  useEffect(() => {
    const storedWinList = localStorage.getItem("winlist");
    if (storedWinList) {
      dispatch(actions.setWinList(JSON.parse(storedWinList)));
    } else {
      localStorage.setItem("winlist", JSON.stringify(winList));
    }
  }, []);

  //storedLayout & hiddenLayout
  useEffect(() => {
    const storedLayout = localStorage.getItem("layout");
    if (storedLayout) dispatch(actions.setLayout(JSON.parse(storedLayout)));

    const hiddenLayout = localStorage.getItem("hiddenLayout");
    if (!hiddenLayout) {
      localStorage.setItem("hiddenLayout", JSON.stringify(layout));
    }
  }, []);

  useEffect(() => {
    console.log("layout was changed");
    localStorage.setItem("layout", JSON.stringify(layout));
    const hiddenLayout = JSON.parse(localStorage.getItem("hiddenLayout")) || [];
    const tempLayout = structuredClone(layout);

    hiddenLayout.forEach((item) => {
      let tempItem = tempLayout.find((l) => l.i === item.i);
      if (tempItem) {
        item.x = tempItem.x;
        item.y = tempItem.y;
        item.w = tempItem.w;
        item.h = tempItem.h;
      }
    });

    localStorage.setItem("hiddenLayout", JSON.stringify(hiddenLayout));

    const activeWinList = layout.map((l) => l.i);
    localStorage.setItem(
      `activeWinList${userRole}`,
      JSON.stringify(activeWinList)
    );
  }, [layout]);

  //getUserName
  useEffect(() => {
    //if (!userEmail) return;

    async function getUserName() {
      let response = await fetch("/api/gamedata/getname", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
        }),
      });

      let baseResponse = await response.json();

      if (response.ok) {
        if (baseResponse.userState === true) {
          const oldName = baseResponse.message;
          dispatch(actions.setUserName(oldName));
        } else {
          dispatch(actions.setUserName("Stranger"));
        }
      } else {
        throw new Error("error in database response");
      }
    }

    getUserName();
  }, [userEmail]);

  return (
    <>
      {!loginState && (
        <div style={{ display: "flex" }}>
          <FormWrapper formName="Login/Register">
            <AuthForm />
          </FormWrapper>
          <TopPanel />
        </div>
      )}
      {loginState && <TopPanel />}
      <div>{children}</div>
    </>
  );
}
