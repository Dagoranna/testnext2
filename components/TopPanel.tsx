"use client";

import React from "react";
import styles from "./TopPanel.module.css";
import DropDownMenu from "./DropDownMenu";
import { MenuItemProps } from "./DropDownMenu";
import RoleSwitcher from "./RoleSwitcher";
import { useState, useEffect } from "react";
import FormWrapperFree from "./forms/FormWrapperFree";
import { parseJSON, isValidJSON } from "../utils/clientUtils";
import { useSelector, useDispatch } from "react-redux";
import * as actions from "../app/store/slices/mainSlice";
import { LayoutLine } from "../app/store/slices/mainSlice";
import * as websocketActions from "../app/store/slices/websocketSlice";
import { manageWebsocket } from "../app/store/slices/websocketSlice";
import type {
  SectionName,
  MessageForServer,
} from "../app/store/slices/websocketSlice";
import * as charsheetActions from "../app/store/slices/charsheetSlice";
import * as gameMapActions from "../app/store/slices/mapSlice";
import * as gameTableActions from "../app/store/slices/gameTableSlice";

import type { RootState, AppDispatch } from "../app/store/store";

export default function TopPanel() {
  const dispatch: AppDispatch = useDispatch();

  const loginState = useSelector((state: RootState) => state.main.loginState);
  const userEmail = useSelector((state: RootState) => state.main.userEmail);
  const userName = useSelector((state: RootState) => state.main.userName);
  const userColor = useSelector((state: RootState) => state.main.userColor);
  const userRole = useSelector((state: RootState) => state.main.userRole);
  const layout = useSelector((state: RootState) => state.main.layout);
  const winList = useSelector((state: RootState) => state.main.winList);
  //console.log(winList);

  const serverMessage = useSelector(
    (state: RootState) => state.websocket.serverMessage
  );
  const connectionState = useSelector(
    (state: RootState) => state.websocket.connectionState
  );
  const connectionTitle = useSelector(
    (state: RootState) => state.main.connectionTitle
  );
  const gameId = useSelector((state: RootState) => state.websocket.gameId);

  const charsheetState = useSelector((state: RootState) => state.charsheet);
  const gameState = useSelector((state: RootState) => state.gameTable);
  const gameNotices = useSelector(
    (state: RootState) => state.gameTable.gameNotices
  );
  const mapState = useSelector((state: RootState) => state.map.mapContent);
  const mapElemsCounter = useSelector(
    (state: RootState) => state.map.mapElemsCounter
  );

  const itemsListGamer: MenuItemProps[] = [
    {
      itemName: "Change name",
      itemType: "button",
      itemHandling: async () => await handleChangeName(),
    },
    {
      itemName: "Save charsheet",
      itemType: "button",
      itemHandling: async () => await handleSaveCharsheet(),
    },
    {
      itemName: "Load charsheet",
      itemType: "button",
      itemHandling: async () => await handleLoadCharsheet(),
    },
    {
      itemName: "Logout",
      itemType: "button",
      itemHandling: async () => await handleLogout(),
    },
  ];

  const itemsListMaster: MenuItemProps[] = [
    {
      itemName: "Change name",
      itemType: "button",
      itemHandling: async () => await handleChangeName(),
    },
    {
      itemName: "Save map",
      itemType: "button",
      itemHandling: async () => await handleSaveMap(),
    },
    {
      itemName: "Load map",
      itemType: "button",
      itemHandling: async () => await handleLoadMap(),
    },
    {
      itemName: "Save game",
      itemType: "button",
      itemHandling: async () => await handleSaveGame(),
    },
    {
      itemName: "Load game",
      itemType: "button",
      itemHandling: async () => await handleLoadGame(),
    },
    {
      itemName: "Logout",
      itemType: "button",
      itemHandling: async () => await handleLogout(),
    },
  ];

  const [colorsSet, setColorsSet] = useState<React.ReactNode>(null);
  const [addComps, setAddComps] = useState<React.ReactNode>(null);
  const [menuStyle, setMenuStyle] = useState("");
  const [serverList, setServerList] = useState<MenuItemProps[]>([]);

  useEffect(() => {
    const gamerColor = localStorage.getItem("userColor");
    if (gamerColor) dispatch(actions.setUserColor(gamerColor));

    const setStartMap = async () => {
      let response = await fetch("/api/gamedata/loadMap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: 4,
        }),
      });

      let baseResponse = await response.json();
      if (!response.ok) {
        console.log(baseResponse.message);
        return;
        //throw new Error("error in database response");
      }

      dispatch(gameMapActions.loadMapContent(baseResponse.message.map_content));
    };

    setStartMap();
  }, []);

  type MessageFromServer = MessageForServer & {
    rollResults?: number[];
    list?: Record<string, string>;
    DMName?: string;
  };

  useEffect(() => {
    if (!serverMessage) return;

    if (serverMessage === "connected") {
      dispatch(actions.setConnectionTitle("Connected"));
      return;
    }

    if (!isValidJSON(serverMessage)) return;
    const messageJSON = parseJSON(serverMessage) as MessageFromServer;

    if (
      messageJSON.sectionName !== "games" &&
      messageJSON.sectionName !== "choosemaster"
    )
      return;

    let tempServerList: MenuItemProps[] = [];
    if (messageJSON.sectionName === "games") {
      if (Object.keys(messageJSON.list).length === 0) {
        //no DMs
        let connectTitle = "";
        alert("No DMs available, try later");
        connectTitle = "Look for DM";
        tempServerList.push({
          itemName: connectTitle,
          itemType: "button",
          itemHandling: async (e) => handleServerConnection(),
        });
        dispatch(actions.setConnectionTitle("Connect"));
        dispatch(
          manageWebsocket("disconnect", process.env.NEXT_PUBLIC_SERVER_URL)
        );
      } else if (Object.keys(messageJSON.list).length === 1) {
        //1 DM => autoconnect
        let DMName = Object.values(messageJSON.list)[0];
        let DMMail = Object.keys(messageJSON.list)[0];
        dispatch(websocketActions.setGameId(DMMail));
        dispatch(websocketActions.setDMName(DMName));
        let connectTitle = "Disconnect from " + DMName;
        dispatch(actions.setConnectionTitle("Connected"));
        tempServerList.push({
          itemName: connectTitle,
          itemType: "button",
          itemHandling: async (e) => handleServerConnection(),
        });
        handleDMConnection(DMMail, DMName);
      } else {
        //DMs > 1
        dispatch(actions.setConnectionTitle("Choose DM"));
        for (let DMMail in messageJSON.list) {
          let DMName = messageJSON.list[DMMail];
          let connectTitle = "Connect to " + DMName;
          //console.log("DMName, DMMail " + DMName + " " + DMMail);
          tempServerList.push({
            itemName: connectTitle,
            itemType: "button",
            itemHandling: async () => handleDMConnection(DMMail, DMName),
          });
        }
      }
    } else if (messageJSON.sectionName === "choosemaster") {
      //messageJSON.gameId;
      let DMName = messageJSON.DMName;
      let DMMail = messageJSON.gameId;
      dispatch(websocketActions.setGameId(DMMail));
      dispatch(websocketActions.setDMName(DMName));
      dispatch(actions.setConnectionTitle("Connected"));
      let connectTitle = "Disconnect from " + DMName;
      tempServerList.push({
        itemName: connectTitle,
        itemType: "button",
        itemHandling: async () => handleServerConnection(),
      });
    }

    setServerList(tempServerList);
  }, [serverMessage]);

  function handleDMConnection(DMMail: string, DMName: string) {
    switch (connectionState) {
      case 1:
        //sending message with new gameId
        const messageForServer: MessageFromServer = {
          user: {
            userRole: userRole,
            userName: userName,
            userColor: userColor,
            userEmail: userEmail,
          },
          sectionName: "choosemaster",
          gameId: DMMail,
          DMName: DMName,
        };

        dispatch(
          manageWebsocket(
            "send",
            process.env.NEXT_PUBLIC_SERVER_URL,
            messageForServer
          )
        );
        break;
      case 3:
        //connection closed, need reopening?
        break;
    }
  }

  function toggleWindow(item: string) {
    let currentWindowInfo: LayoutLine | null;
    const windowsList = layout.filter((window) => window.i !== item);

    if (layout.length == windowsList.length) {
      //no such window, show it
      const storedLayout = localStorage.getItem("layout");

      if (storedLayout) {
        const parsedLayout = JSON.parse(storedLayout);
        currentWindowInfo = parsedLayout.find((l: LayoutLine) => l.i === item);
      }

      if (currentWindowInfo) {
        windowsList.push(currentWindowInfo);
      } else {
        const hiddenLayout = localStorage.getItem("hiddenLayout");
        if (hiddenLayout) {
          const parsedHiddenLayout = JSON.parse(hiddenLayout);
          currentWindowInfo = parsedHiddenLayout.find(
            (l: LayoutLine) => l.i === item
          );
          if (currentWindowInfo) {
            windowsList.push(currentWindowInfo);
          } else {
            windowsList.push({
              i: item,
              x: 0,
              y: 0,
              w: 5,
              h: 15,
              minH: 15,
            });
          }
        } else {
          windowsList.push({
            i: item,
            x: 0,
            y: 0,
            w: 5,
            h: 15,
            minH: 15,
          });
        }
      }
    } else {
      //hide window
      const winForHide = layout.find((window) => window.i === item);
      const hiddenLayout = localStorage.getItem("hiddenLayout");
      const parsedHiddenLayout = JSON.parse(hiddenLayout);
      const winInHidden = parsedHiddenLayout.find(
        (window: LayoutLine) => window.i === item
      );
      if (!winInHidden) {
        parsedHiddenLayout.push(winForHide);
      } else {
        parsedHiddenLayout.splice(
          parsedHiddenLayout.indexOf(winInHidden),
          1,
          winForHide
        );
      }
      localStorage.setItem("hiddenLayout", JSON.stringify(parsedHiddenLayout));
    }
    dispatch(actions.setLayout(windowsList));
    localStorage.setItem("layout", JSON.stringify(windowsList));
  }

  async function handleSaveCharsheet() {
    setAddComps(
      <FormWrapperFree formName="Save charsheet" clearForm={setAddComps}>
        <div className="tableTitle">Enter charsheet title</div>
        <form onSubmit={async (e) => await saveCharsheet(e)}>
          <input
            id="charsheetName"
            type="text"
            defaultValue={charsheetState.main.name}
            className="mainInput"
          />
          <button className="mainButton" type="submit">
            Save charsheet
          </button>
        </form>
      </FormWrapperFree>
    );
  }

  async function saveCharsheet(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formInput = form.elements.namedItem(
      "charsheetName"
    ) as HTMLInputElement;
    const charsheetName = formInput.value;

    let response = await fetch("/api/gamedata/saveCharsheet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        title: charsheetName,
        chardata: JSON.stringify(charsheetState),
      }),
    });

    let baseResponse = await response.json();
    if (!response.ok) {
      console.log(baseResponse.message);
      //throw new Error("error in database response");
    }
    setAddComps(null);
  }

  async function handleLoadCharsheet() {
    let response = await fetch("/api/gamedata/getCharsheets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
      }),
    });

    let baseResponse = await response.json();
    if (!response.ok) {
      console.log(baseResponse.message);
      return;
      //throw new Error("error in database response");
    }

    let charsheets: React.ReactNode = <option>...</option>;
    const charsheetsTitles = Object.keys(baseResponse.message);
    if (charsheetsTitles.length > 0) {
      charsheets = charsheetsTitles.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ));
    }

    function loadCharsheet(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formInput = form.elements.namedItem(
        "charsheetName"
      ) as HTMLInputElement;
      const charsheetName = formInput.value;

      const charsheet = baseResponse.message[charsheetName];
      dispatch(charsheetActions.loadCharsheet(charsheet));
      setAddComps(null);
    }

    setAddComps(
      <FormWrapperFree formName="Load charsheet" clearForm={setAddComps}>
        <div className="tableTitle">Choose charsheet</div>
        <form onSubmit={(e) => loadCharsheet(e)}>
          <select id="charsheetName" className="mainInput">
            {charsheets}
          </select>
          <button className="mainButton" type="submit">
            Load charsheet
          </button>
        </form>
      </FormWrapperFree>
    );
  }

  async function handleSaveMap() {
    setAddComps(
      <FormWrapperFree formName="Save nap" clearForm={setAddComps}>
        <div className="tableTitle">Enter map title</div>
        <form onSubmit={async (e) => await saveMap(e)}>
          <input id="mapName" type="text" className="mainInput" />
          <button className="mainButton" type="submit">
            Save map
          </button>
        </form>
      </FormWrapperFree>
    );
  }

  async function saveMap(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formInput = form.elements.namedItem("mapName") as HTMLInputElement;
    const mapName = formInput.value;

    let response = await fetch("/api/gamedata/saveMap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        title: mapName,
        mapdata: mapState,
        mapElemsCounter: mapElemsCounter,
      }),
    });

    let baseResponse = await response.json();
    if (!response.ok) {
      console.log(baseResponse.message);
      //throw new Error("error in database response");
    }
    setAddComps(null);
  }

  async function handleLoadMap() {
    let response = await fetch("/api/gamedata/loadMapList", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
      }),
    });

    let baseResponse = await response.json();
    if (!response.ok) {
      console.log(baseResponse.message);
      return;
      //throw new Error("error in database response");
    }

    let maps: React.ReactNode = <option>...</option>;

    if (baseResponse.message.length > 0) {
      maps = baseResponse.message.map((item) => {
        return (
          <option key={item.id} value={item.id}>
            {item.map_name}
          </option>
        );
      });
    }

    async function loadMap(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formInput = form.elements.namedItem("mapName") as HTMLInputElement;
      const mapId = formInput.value;

      let response = await fetch("/api/gamedata/loadMap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: mapId,
        }),
      });

      let baseResponse = await response.json();
      if (!response.ok) {
        console.log(baseResponse.message);
        return;
        //throw new Error("error in database response");
      }

      dispatch(gameMapActions.loadMapContent(baseResponse.message.map_content));
      dispatch(
        gameMapActions.setMapElemsCounter(
          baseResponse.message.map_elems_counter
        )
      );
      setAddComps(null);
    }

    setAddComps(
      <FormWrapperFree formName="Load map" clearForm={setAddComps}>
        <div className="tableTitle">Choose map</div>
        <form onSubmit={async (e) => await loadMap(e)}>
          <select id="mapName" className="mainInput">
            {maps}
          </select>
          <button className="mainButton" type="submit">
            Load map
          </button>
        </form>
      </FormWrapperFree>
    );
  }

  async function handleSaveGame() {
    setAddComps(
      <FormWrapperFree formName="Save game" clearForm={setAddComps}>
        <div className="tableTitle">Enter game title</div>
        <form onSubmit={async (e) => await saveGame(e)}>
          <input id="gameName" type="text" className="mainInput" />
          <button className="mainButton" type="submit">
            Save game
          </button>
        </form>
      </FormWrapperFree>
    );
  }

  async function saveGame(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formInput = form.elements.namedItem("gameName") as HTMLInputElement;
    const gameName = formInput.value;

    let response = await fetch("/api/gamedata/saveGame", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        title: gameName,
        gamedata: JSON.stringify(gameState),
      }),
    });

    let baseResponse = await response.json();
    if (!response.ok) {
      console.log(baseResponse.message);
      //throw new Error("error in database response");
    }
    setAddComps(null);
  }

  async function handleLoadGame() {
    let response = await fetch("/api/gamedata/loadGame", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
      }),
    });

    let baseResponse = await response.json();
    if (!response.ok) {
      console.log(baseResponse.message);
      return;
      //throw new Error("error in database response");
    }

    let games: React.ReactNode = <option>...</option>;
    const gamesTitles = Object.keys(baseResponse.message);
    if (gamesTitles.length > 0) {
      games = gamesTitles.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ));
    }

    function loadGame(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formInput = form.elements.namedItem("gameName") as HTMLInputElement;
      const gameName = formInput.value;
      const game = baseResponse.message[gameName];
      dispatch(gameTableActions.loadCombatants(game));
      setAddComps(null);
    }

    setAddComps(
      <FormWrapperFree formName="Load game" clearForm={setAddComps}>
        <div className="tableTitle">Choose game</div>
        <form onSubmit={(e) => loadGame(e)}>
          <select id="gameName" className="mainInput">
            {games}
          </select>
          <button className="mainButton" type="submit">
            Load game
          </button>
        </form>
      </FormWrapperFree>
    );
  }

  async function handleChangeName() {
    setAddComps(
      <FormWrapperFree formName="Enter new name" clearForm={setAddComps}>
        <div className="tableTitle">Enter new name</div>
        <form onSubmit={async (e) => await setNewUserName(e)}>
          <input
            id="newName"
            type="text"
            placeholder="Stranger"
            defaultValue={userName}
            className="mainInput"
          />
          <button id="changeName" className="mainButton" type="submit">
            Save name
          </button>
        </form>
      </FormWrapperFree>
    );
  }

  async function setNewUserName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formInput = form.elements.namedItem("newName") as HTMLInputElement;
    const newName = formInput.value;
    dispatch(actions.setUserName(newName));

    let response = await fetch("/api/gamedata/setname", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        name: newName,
      }),
    });

    //TODO: add error handling
    setAddComps(null);
  }

  function chooseGamerColor() {
    const colorsList = [
      "Black",
      "DarkBlue",
      "Blue",
      "DarkViolet",
      "Crimson",
      "Red",
      "Purple",
      "FireBrick",
      "Maroon",
      "SaddleBrown",
      "Chocolate",
      "Tomato",
      "Gold",
      "Silver",
      "Plum",
      "LightCoral",
      "Yellow",
      "Orange",
      "DarkOrange",
      "DarkGreen",
      "Lime",
      "LightGreen",
      "LawnGreen",
      "Aqua",
      "Aquamarine",
      "LightSteelBlue",
      "BlueViolet",
      "DarkTurquoise",
      "White",
    ];
    const tempColorsSet = colorsList.map((item, num) => (
      <li key={num} style={{ color: item, fontWeight: "bold" }}>
        {item}
      </li>
    ));
    setColorsSet(
      <ul className={styles.colorsBlock} onClick={(e) => setColor(e)}>
        {tempColorsSet}
      </ul>
    );

    function setColor(e: React.MouseEvent | React.PointerEvent) {
      const eventTarget = e.target as HTMLElement;
      const myColor = eventTarget.innerText;
      dispatch(actions.setUserColor(myColor));
      localStorage.setItem("userColor", myColor);
      setColorsSet(null);
    }
  }

  const windowsList: MenuItemProps[] = winList[userRole].map((item) => {
    return {
      itemName: item,
      itemType: "switcher",
      itemHandling: () => {
        toggleWindow(item);
      },
      startState: !!layout.find((l) => l.i === item),
    };
  });

  useEffect(() => {
    let connectTitle = "";
    let tempServerList = [];

    switch (connectionState) {
      case 3:
        if (userRole === "Gamer") {
          connectTitle = "Look for DM";
        } else {
          if (userRole === "Master") connectTitle = "Create game";
        }

        tempServerList.push({
          itemName: connectTitle,
          itemType: "button",
          itemHandling: async () => handleServerConnection(),
        });
        break;
      case 2:
        connectTitle = "Disconnecting...";
        tempServerList.push({
          itemName: connectTitle,
          itemType: "button",
          itemHandling: () => {},
        });
        break;
      case 1:
        connectTitle = "Disconnect";
        tempServerList.push({
          itemName: connectTitle,
          itemType: "button",
          itemHandling: async () => handleServerConnection(),
        });
        break;
      case 0:
        connectTitle = "Connecting...";
        tempServerList.push({
          itemName: connectTitle,
          itemType: "button",
          itemHandling: () => {},
        });
        break;
    }

    setServerList(tempServerList);
  }, [userRole, userName, connectionState]);

  function handleServerConnection() {
    switch (connectionState) {
      case 3:
        //checking and opening connection
        const messageForServer: MessageForServer = {
          user: {
            userRole: userRole,
            userName: userName,
            userColor: userColor,
            userEmail: userEmail,
          },
          sectionName: "connection",
          gameId: gameId,
        };

        dispatch(
          manageWebsocket(
            "connect",
            process.env.NEXT_PUBLIC_SERVER_URL,
            messageForServer
          )
        );
        break;
      case 1:
        //closing working connection
        dispatch(
          manageWebsocket("disconnect", process.env.NEXT_PUBLIC_SERVER_URL)
        );
        if (userRole === "Gamer") dispatch(websocketActions.setGameId(null));
        dispatch(actions.setConnectionTitle("Connect"));
        break;
    }
  }

  async function handleLogout() {
    let response = await fetch("/api/auth/deleteauthtoken", {
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
      if (baseResponse.logoutState === 1) {
        dispatch(actions.setLoginState(false));
        dispatch(actions.setUserEmail(""));
      } else {
        console.log(baseResponse.message);
      }
    } else {
      throw new Error("error in database response");
    }
  }

  useEffect(() => {
    switch (connectionState) {
      case 1:
        setMenuStyle("activeStyle");
        break;
      case 3:
        setMenuStyle("passiveStyle");
        break;
      default:
        setMenuStyle("changingStyle");
        break;
    }
  }, [connectionState]);

  return (
    <div id="topPanel" className={styles.topPanel}>
      {loginState && userRole == "Gamer" && (
        <>
          <DropDownMenu
            id="mainMenu"
            title="Main menu"
            itemsList={itemsListGamer}
          />
        </>
      )}
      {loginState && userRole == "Master" && (
        <>
          <DropDownMenu
            id="mainMenu"
            title="Main menu"
            itemsList={itemsListMaster}
          />
        </>
      )}
      <>
        <DropDownMenu id="zoneMenu" title="Interface" itemsList={windowsList} />
      </>

      {loginState && (
        <>
          <DropDownMenu
            id="serverMenu"
            title={connectionTitle}
            itemsList={serverList}
            addStyle={menuStyle}
          />
        </>
      )}
      {loginState && <RoleSwitcher />}
      {loginState && (
        <div
          className={styles.plainMessage}
          style={{ display: "flex", backgroundColor: "#9b9b9b" }}
        >
          <div>
            Hello,{" "}
            <span style={{ fontWeight: "bold", color: userColor }}>
              {userName}
            </span>
            !
          </div>
          <div className={styles.colorCircle} onClick={chooseGamerColor}></div>
          {colorsSet}
        </div>
      )}
      {addComps}
    </div>
  );
}
