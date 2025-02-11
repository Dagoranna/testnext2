'use client';

import styles from './Polydice.module.css';
import { useSelector, useDispatch } from 'react-redux';
import * as actions from '../../../app/store/slices/polydiceSlice';

const diceClick = (dispatch, diceSize) => {
  dispatch(actions.setActiveDice(diceSize));
};

export default function Polydice() {
  const dispatch = useDispatch();
  const activeDice = useSelector((state) => state.polydice.activeDice); 

  return (
    <div className={ styles.diceWrapper }>
      <div className={ styles.diceSet }>
        <button name="dice" className={ `${styles.dice} ${(activeDice === 3) ? styles.switcherOn : styles.switcherOff} ` } onMouseDown={(e) => e.stopPropagation()} onClick={ () => diceClick(dispatch, 3) } >d3</button>
        <button name="dice" className={ `${styles.dice} ${(activeDice === 4) ? styles.switcherOn : styles.switcherOff} ` } onMouseDown={(e) => e.stopPropagation()} onClick={ () => diceClick(dispatch, 4) } >d4</button>
        <button name="dice" className={ `${styles.dice} ${(activeDice === 6) ? styles.switcherOn : styles.switcherOff} ` } onMouseDown={(e) => e.stopPropagation()} onClick={ () => diceClick(dispatch, 6) } >d6</button>
        <button name="dice" className={ `${styles.dice} ${(activeDice === 8) ? styles.switcherOn : styles.switcherOff} ` } onMouseDown={(e) => e.stopPropagation()} onClick={ () => diceClick(dispatch, 8) } >d8</button>
        <button name="dice" className={ `${styles.dice} ${(activeDice === 10) ? styles.switcherOn : styles.switcherOff} ` } onMouseDown={(e) => e.stopPropagation()} onClick={ () => diceClick(dispatch, 10) } >d10</button>
        <button name="dice" className={ `${styles.dice} ${(activeDice === 12) ? styles.switcherOn : styles.switcherOff} ` } onMouseDown={(e) => e.stopPropagation()} onClick={ () => diceClick(dispatch, 12) } >d12</button>
        <button name="dice" className={ `${styles.dice} ${(activeDice === 20) ? styles.switcherOn : styles.switcherOff} ` } onMouseDown={(e) => e.stopPropagation()} onClick={ () => diceClick(dispatch, 20) } >d20</button>
        <button name="dice" className={ `${styles.dice} ${(activeDice === 100) ? styles.switcherOn : styles.switcherOff} ` } onMouseDown={(e) => e.stopPropagation()} onClick={ () => diceClick(dispatch, 100) } >d100</button>
      </div>
      <div className={ styles.rollVariations }></div>
      <div className={ styles.logs }></div>
      <div className={ styles.diceFooter }>
        <button className={ styles.rollButton } onMouseDown={(e) => e.stopPropagation()}>Roll!</button>
      </div>
      
    </div>
  );
}

