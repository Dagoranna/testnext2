'use client';

import { useState } from "react";
import styles from './FormWrapper.module.css';

export default function FormWrapperFree({ formName,clearForm, children,isFormOpen = true }) {

  const [isOpen, setIsOpen] = useState(isFormOpen);
  let closeId = formName.replace(/\s+/g, '') + 'FormClose';

  const funcClose = () => {
    setIsOpen(false);
    clearForm();
  };

  return (
    isOpen && (
       <div className={styles.baseTable}>
          <button id={ closeId } className={styles.closeButton} onClick={ funcClose }>&#x2716;</button>
          { children }
        </div>
    )
  );
}