"use client";

import styles from "./FormErrors.module.css";

type FormErrorsProps = {
  formErrors: Set<string>;
};

export default function FormErrors({
  formErrors,
}: FormErrorsProps): React.ReactElement {
  const formErrorsArray = [...formErrors];

  const listItems = formErrorsArray.map((errorText: string, id: number) => (
    <li key={id}>{errorText}</li>
  ));

  return <ul className={styles.errorList}>{listItems}</ul>;
}
