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

  const itemsListGamer = [
    {
      itemName: "Change name",
      itemType: "button",
      itemHandling: async (e) => await handleChangeName(),
    },
    {
      itemName: "Create charsheet",
      itemType: "button",
      itemHandling: (e) => console.log("Create charsheet"),
    },
    {
      itemName: "Load charsheet",
      itemType: "button",
      itemHandling: (e) => console.log("Load charsheet"),
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
      itemName: "Create map",
      itemType: "button",
      itemHandling: (e) => console.log("Create map"),
    },
    {
      itemName: "Load map",
      itemType: "button",
      itemHandling: (e) => console.log("Load map"),
    },
    {
      itemName: "Save map",
      itemType: "button",
      itemHandling: (e) => console.log("Save map"),
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
    ///{"sectionName":"games","list":{"icywizard1@gmail.com":"IcyWizard"}}
    if (!serverMessage) return;
    console.log("serverMessage:");
    console.log(serverMessage);
    const messageJSON = parseJSON(serverMessage);
    if (messageJSON === null) {
      if (serverMessage === "connected")
        dispatch(actions.setConnectionTitle("Connected"));
      return;
    }

    console.log("messageJSON.sectionName" + messageJSON.sectionName);
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
