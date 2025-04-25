"use client";

import { useState } from "react";
import styles from "./FormWrapper.module.css";

type MyProps = {
  formName: string;
  clearForm?: (formContent: React.ReactNode | null) => void;
  children: React.ReactNode;
  isFormOpen?: boolean;
};

export default function FormWrapperFree({
  formName,
  clearForm,
  children,
  isFormOpen = true,
}: MyProps) {
  const [isOpen, setIsOpen] = useState(isFormOpen);
  let closeId = formName.replace(/\s+/g, "") + "FormClose";

  const funcClose = () => {
    setIsOpen(false);
    clearForm?.(null);
  };

  return (
    isOpen && (
      <div className={styles.baseTable}>
        <button id={closeId} className={styles.closeButton} onClick={funcClose}>
          &#x2716;
        </button>
        {children}
      </div>
    )
  );
}
