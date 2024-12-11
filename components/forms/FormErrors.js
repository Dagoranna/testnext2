'use client';

import styles from './FormErrors.module.css';

export default function FormErrors({ formErrors }) {
  const listItems = formErrors.map((errorText,id) =>
    <li key={id}>
      {errorText}
    </li>
  );
  

  return (
    <ul className={ styles.errorList } >
      { listItems }
    </ul>
  );
}