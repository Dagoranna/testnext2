'use client';

import styles from './GameMap.module.css';

export default function PaletteElem({ id, elemModuleStyle = null, elemStyle = null, children }) {

  const currentElemStyle = elemModuleStyle ? `${styles.paletteElem} ${elemModuleStyle.map((item) => styles[item]).join(" ")}` : styles.paletteElem;

  return (
    <div 
      id={ id }
      className={ currentElemStyle } 
      style={ elemStyle }
    >
      { children }
    </div>
  );
}

