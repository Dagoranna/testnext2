"use client";

import "./globals.css";
import React from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import MainAppWrapper from "../components/MainAppWrapper";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <MainAppWrapper>{children}</MainAppWrapper>
        </Provider>
      </body>
    </html>
  );
}
