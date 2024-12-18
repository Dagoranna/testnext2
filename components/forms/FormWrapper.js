'use client';

import { useState } from "react";
import styles from './FormWrapper.module.css';

export default function formWrapper({ formName,children,isFormOpen = false }) {
  const [isOpen, setIsOpen] = useState(isFormOpen);
  let buttonId = formName.replace(/\s+/g, '') + 'Button';
  let closeId = formName.replace(/\s+/g, '') + 'FormClose';

  return (
    <>
      {(!isOpen) && (
        <button id={ buttonId } className="mainButton" onClick={() => setIsOpen(true)}>{ formName }</button>
      )}
      {(isOpen) && (
        <div className={styles.baseTable}>
          <button id={ closeId } className={styles.closeButton} onClick={() => setIsOpen(false)}>&#x2716;</button>
          { children }
        </div>
      )}
    </>
  );
}