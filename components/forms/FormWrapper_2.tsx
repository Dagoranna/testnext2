"use client";

import { useState, useMemo } from "react";
import styles from "./FormWrapper.module.css";

type MyProps = {
  formName: string;
  children: React.ReactNode;
  addButtonStyle?: Record<string, string>;
  addFormStyle?: Record<string, string>;
};

export default function FormWrapper_2({
  formName,
  children,
  addButtonStyle = {},
  addFormStyle = {},
}: MyProps) {
  let buttonId = formName.replace(/\s+/g, "") + "Button";
  let closeId = formName.replace(/\s+/g, "") + "FormClose";
  const [isOpen, setIsOpen] = useState(false);
  const memoizedChildren = useMemo(() => children, [children]);
  return (
    <>
      {!isOpen && (
        <button
          id={buttonId}
          className="mainButton"
          onClick={() => setIsOpen(true)}
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
            onClick={() => setIsOpen(false)}
          >
            &#x2716;
          </button>
          {memoizedChildren}
        </div>
      )}
    </>
  );
}
