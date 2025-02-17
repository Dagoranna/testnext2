'use client';

import styles from './GameMap.module.css';
import { useDrag } from "react-dnd";
import { useRef } from "react";

const ItemType = "BOX";

export default function MapElem({ id, elemModuleStyle, elemStyle, children }) {
  const currentElemStyle = `${styles.MapElem} ${elemModuleStyle.map((item) => styles[item]).join(" ")}`;
  const [, drag] = useDrag(() => ({
    type: ItemType,
    item: { id },
  }), [id]);


  return (
    <div 
      id={ id }
      className={ currentElemStyle } 
      style={elemStyle} 
      ref={drag}
    >
      { children }
    </div>
  );
}

