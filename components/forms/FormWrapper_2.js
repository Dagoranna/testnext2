"use client";

import { useState } from "react";
import styles from "./FormWrapper.module.css";

export default function FormWrapper_2({
  formName,
  children,
  isFormOpen,
  addButtonStyle = {},
  addFormStyle = {},
}) {
  let buttonId = formName.replace(/\s+/g, "") + "Button";
  let closeId = formName.replace(/\s+/g, "") + "FormClose";

  return (
    <>
      {!isFormOpen && (
        <button
          id={buttonId}
          className="mainButton"
          onClick={() => (isFormOpen = true)}
          style={{ ...addButtonStyle }}
        >
          {formName}
        </button>
      )}
      {isFormOpen && (
        <div className={styles.baseTable} style={{ ...addFormStyle }}>
          <button
            id={closeId}
            className={styles.closeButton}
            onClick={() => (isFormOpen = false)}
          >
            &#x2716;
          </button>
          {children}
        </div>
      )}
    </>
  );
}
