"use client";
import styles from "./TopPanel.module.css";
import DropDownMenu from "./DropDownMenu";
import RoleSwitcher from "./RoleSwitcher";
import { useState, useEffect } from "react";
import FormWrapperFree from "./forms/FormWrapperFree";
import { serverMessageHandling } from "../utils/generalUtils";
import { parseJSON } from "../utils/clientUtils";
import { useSelector, useDispatch } from "react-redux";
import * as actions from "../app/store/slices/mainSlice";
import * as websocketActions from "../app/store/slices/websocketSlice";
import { manageWebsocket } from "../app/store/slices/websocketSlice";
import * as charsheetActions from "../app/store/slices/charsheetSlice";
import * as gameMapActions from "../app/store/slices/mapSlice";
import * as gameTableActions from "../app/store/slices/gameTableSlice";

export default function TopPanel() {
  const dispatch = useDispatch();

  const loginState = useSelector((state) => state.main.loginState);
  const userEmail = useSelector((state) => state.main.userEmail);
  const userName = useSelector((state) => state.main.userName);
  const userColor = useSelector((state) => state.main.userColor);
  const userRole = useSelector((state) => state.main.userRole);
  const layout = useSelector((state) => state.main.layout);
  const winList = useSelector((state) => state.main.winList);

  const serverMessage = useSelector((state) => state.websocket.serverMessage);
  const connectionState = useSelector(
    (state) => state.websocket.connectionState
  );
  const connectionTitle = useSelector((state) => state.main.connectionTitle);
  const gameId = useSelector((state) => state.websocket.gameId);

  const charsheetState = useSelector((state) => state.charsheet);
  const gameState = useSelector((state) => state.gameTable);
  const mapState = useSelector((state) => state.map.mapContent);

  const itemsListGamer = [
    {
      itemName: "Change name",
      itemType: "button",
      itemHandling: async (e) => await handleChangeName(),
    },
    {
      itemName: "Save charsheet",
      itemType: "button",
      itemHandling: async (e) => await handleSaveCharsheet(),
    },
    {
      itemName: "Load charsheet",
      itemType: "button",
      itemHandling: async (e) => await handleLoadCharsheet(),
    },
    {
      itemName: "Logout",
      itemType: "button",
      itemHandling: async (e) => await handleLogout(),
    },
  ];

  const itemsListMaster = [
    {
      itemName: "Change name",
      itemType: "button",
      itemHandling: async (e) => await handleChangeName(),
    },
    {
      itemName: "Save map",
      itemType: "button",
      itemHandling: async (e) => await handleSaveMap(),
    },
    {
      itemName: "Load map",
      itemType: "button",
      itemHandling: async (e) => await handleLoadMap(),
    },
    {
      itemName: "Save game",
      itemType: "button",
      itemHandling: async (e) => await handleSaveGame(),
    },
    {
      itemName: "Load game",
      itemType: "button",
      itemHandling: async (e) => await handleLoadGame(),
    },
    {
      itemName: "Logout",
      itemType: "button",
      itemHandling: async (e) => await handleLogout(),
    },
  ];

  const [colorsSet, setColorsSet] = useState(null);
  const [addComps, setAddComps] = useState(null);
  const [menuStyle, setMenuStyle] = useState("");
  const [serverList, setServerList] = useState([]);

  useEffect(() => {
    const gamerColor = localStorage.getItem("userColor");
    if (gamerColor) dispatch(actions.setUserColor(gamerColor));
  }, []);

  useEffect(() => {
    if (!serverMessage) return;
    const messageJSON = parseJSON(serverMessage);
    if (messageJSON === null) {
      if (serverMessage === "connected")
        dispatch(actions.setConnectionTitle("Connected"));
      return;
    }

    if (
      messageJSON.sectionName !== "games" &&
      messageJSON.sectionName !== "choosemaster"
    )
      return;

    let tempServerList = [];
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
      messageJSON.gameId;
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

  function handleDMConnection(DMMail, DMName) {
    switch (connectionState) {
      case 1:
        //sending message with new gameId
        let messageForServer = {
          user: {
            userRole: userRole,
            userName: userName,
            userColor: userColor,
            userEmail: userEmail,
          },
        };
        messageForServer["sectionName"] = "choosemaster";
        messageForServer["gameId"] = DMMail;
        messageForServer["DMName"] = DMName;
        let JSONMessage = JSON.stringify(messageForServer);
        dispatch(
          manageWebsocket(
            "send",
            process.env.NEXT_PUBLIC_SERVER_URL,
            JSONMessage
          )
        );
        break;
      case 3:
        //connection closed, need reopening?
        break;
    }
  }

  function toggleWindow(item) {
    let currentWindowInfo = false;
    const windowsList = layout.filter((window) => window.i !== item);

    if (layout.length == windowsList.length) {
      //no such window, show it
      const storedLayout = localStorage.getItem("layout");

      if (storedLayout) {
        const parsedLayout = JSON.parse(storedLayout);
        currentWindowInfo = parsedLayout.find((l) => l.i === item);
      }

      if (currentWindowInfo) {
        windowsList.push(currentWindowInfo);
      } else {
        const hiddenLayout = localStorage.getItem("hiddenLayout");
        if (hiddenLayout) {
          const parsedHiddenLayout = JSON.parse(hiddenLayout);
          currentWindowInfo = parsedHiddenLayout.find((l) => l.i === item);
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
        (window) => window.i === item
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
        <form
          onSubmit={async (e) =>
            await saveCharsheet(e.target.elements.charsheetName.value, e)
          }
        >
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

  async function saveCharsheet(charsheetName, e) {
    e.preventDefault();
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
    setAddComps();
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

    let charsheets = <option>...</option>;
    const charsheetsTitles = Object.keys(baseResponse.message);
    if (charsheetsTitles.length > 0) {
      charsheets = charsheetsTitles.map((item) => (
        <option key={item} name={item}>
          {item}
        </option>
      ));
    }

    function loadCharsheet(title, e) {
      e.preventDefault();
      const charsheet = baseResponse.message[title];
      dispatch(charsheetActions.loadCharsheet(charsheet));
      setAddComps();
    }

    setAddComps(
      <FormWrapperFree formName="Load charsheet" clearForm={setAddComps}>
        <div className="tableTitle">Choose charsheet</div>
        <form
          onSubmit={(e) =>
            loadCharsheet(e.target.elements.charsheetName.value, e)
          }
        >
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

  /** start */
  async function handleSaveMap() {
    setAddComps(
      <FormWrapperFree formName="Save nap" clearForm={setAddComps}>
        <div className="tableTitle">Enter map title</div>
        <form
          onSubmit={async (e) =>
            await saveMap(e.target.elements.mapName.value, e)
          }
        >
          <input id="mapName" type="text" className="mainInput" />
          <button className="mainButton" type="submit">
            Save map
          </button>
        </form>
      </FormWrapperFree>
    );
  }

  async function saveMap(mapName, e) {
    e.preventDefault();
    let response = await fetch("/api/gamedata/saveMap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        title: mapName,
        mapdata: JSON.stringify(mapState),
      }),
    });

    let baseResponse = await response.json();
    if (!response.ok) {
      console.log(baseResponse.message);
      //throw new Error("error in database response");
    }
    setAddComps();
  }

  async function handleLoadMap() {
    let response = await fetch("/api/gamedata/loadMap", {
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

    let maps = <option>...</option>;
    const mapsTitles = Object.keys(baseResponse.message);
    if (mapsTitles.length > 0) {
      maps = mapsTitles.map((item) => (
        <option key={item} name={item}>
          {item}
        </option>
      ));
    }

    function loadMap(title, e) {
      e.preventDefault();
      const map = baseResponse.message[title];
      console.log(map);
      dispatch(gameMapActions.loadMapContent(map));
      setAddComps();
    }

    setAddComps(
      <FormWrapperFree formName="Load map" clearForm={setAddComps}>
        <div className="tableTitle">Choose map</div>
        <form onSubmit={(e) => loadMap(e.target.elements.mapName.value, e)}>
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

  /** end */

  async function handleSaveGame() {
    setAddComps(
      <FormWrapperFree formName="Save game" clearForm={setAddComps}>
        <div className="tableTitle">Enter game title</div>
        <form
          onSubmit={async (e) =>
            await saveGame(e.target.elements.gameName.value, e)
          }
        >
          <input id="gameName" type="text" className="mainInput" />
          <button className="mainButton" type="submit">
            Save game
          </button>
        </form>
      </FormWrapperFree>
    );
  }

  async function saveGame(gameName, e) {
    e.preventDefault();
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
    setAddComps();
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

    let games = <option>...</option>;
    const gamesTitles = Object.keys(baseResponse.message);
    if (gamesTitles.length > 0) {
      games = gamesTitles.map((item) => (
        <option key={item} name={item}>
          {item}
        </option>
      ));
    }

    function loadGame(title, e) {
      e.preventDefault();
      const game = baseResponse.message[title];
      dispatch(gameTableActions.loadCombatants(game));
      setAddComps();
    }

    setAddComps(
      <FormWrapperFree formName="Load game" clearForm={setAddComps}>
        <div className="tableTitle">Choose game</div>
        <form onSubmit={(e) => loadGame(e.target.elements.gameName.value, e)}>
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
        <form
          onSubmit={async (e) =>
            await setNewUserName(e.target.elements.newName.value, e)
          }
        >
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

  async function setNewUserName(newName, e) {
    e.preventDefault();
    dispatch(actions.setUserName(newName));
    //localStorage.setItem('userName', newName);
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
    setAddComps();
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

    function setColor(e) {
      const myColor = e.target.innerText;
      dispatch(actions.setUserColor(myColor));
      localStorage.setItem("userColor", myColor);
      setColorsSet(null);
    }
  }

  const windowsList = winList[userRole].map((item) => {
    return {
      itemName: item,
      itemType: "switcher",
      itemHandling: () => {
        toggleWindow(item);
      },
      startState: layout.find((l) => l.i === item),
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
          itemHandling: async (e) => handleServerConnection(),
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
          itemHandling: async (e) => handleServerConnection(),
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
        let messageForServer = {
          user: {
            userRole: userRole,
            userName: userName,
            userColor: userColor,
            userEmail: userEmail,
          },
        };
        messageForServer["sectionName"] = "connection";
        messageForServer["gameId"] = gameId;

        dispatch(
          manageWebsocket(
            "connect",
            process.env.NEXT_PUBLIC_SERVER_URL,
            JSON.stringify(messageForServer)
          )
        );
        break;
      case 1:
        //closing working connection
        dispatch(
          manageWebsocket("disconnect", process.env.NEXT_PUBLIC_SERVER_URL)
        );
        if (userRole === "Gamer") dispatch(websocketActions.setGameId(0));
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
