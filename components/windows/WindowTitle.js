'use client';

import styles from './WindowTitle.module.css';

export default function WindowTitle({ title }) {

  return (
    <div className={ `my-drag-handle ${styles.winTitle}` }> 
      { title }
    </div>
  );
}

