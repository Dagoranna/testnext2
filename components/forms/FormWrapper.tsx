"use client";

import React from "react";
import { useState } from "react";
import styles from "./FormWrapper.module.css";

type MyProps = {
  formName: string;
  children: React.ReactNode;
  isFormOpen?: boolean;
  addButtonStyle?: Record<string, string>;
  addFormStyle?: Record<string, string>;
  addOnClose?: ((...args: any[]) => void) | null;
  addButtonFunc?: ((...args: any[]) => void) | null;
};

export default function FormWrapper({
  formName,
  children,
  isFormOpen = false,
  addButtonStyle = {},
  addFormStyle = {},
  addOnClose = null,
  addButtonFunc = null,
}: MyProps) {
  const [isOpen, setIsOpen] = useState(isFormOpen);
  // const isOpen = isFormOpen;
  let buttonId = formName.replace(/\s+/g, "") + "Button";
  let closeId = formName.replace(/\s+/g, "") + "FormClose";

  function onClose() {
    if (addOnClose) addOnClose();
    setIsOpen(false);
  }

  function onOpen() {
    setIsOpen(true);
    if (addButtonFunc) addButtonFunc();
  }

  return (
    <>
      {!isOpen && (
        <button
          id={buttonId}
          className="mainButton"
          onClick={() => onOpen()}
          style={{ ...addButtonStyle }}
        >
          {formName}
        </button>
      )}
      {isOpen && (
        <div className={styles.baseTable} style={{ ...addFormStyle }}>
          <button
            id={closeId}
            className={styles.closeButton}
            onClick={() => onClose()}
          >
            &#x2716;
          </button>
          {children}
        </div>
      )}
    </>
  );
}
