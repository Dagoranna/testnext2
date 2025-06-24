"use client";

import "./globals.css";
import React from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import MainAppWrapper from "../components/MainAppWrapper";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="favicon1.png" type="image/x-icon"></link>
      </head>
      <body>
        <Provider store={store}>
          <MainAppWrapper>{children}</MainAppWrapper>
        </Provider>
      </body>
    </html>
  );
}
