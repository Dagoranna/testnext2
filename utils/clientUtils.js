'use client';

export function isPC() {
  return (
    window.matchMedia('(hover: hover)').matches && 
    window.matchMedia('(pointer: fine)').matches
  );
}
