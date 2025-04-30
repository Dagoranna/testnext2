"use client";

export function isPC() {
  return (
    window.matchMedia("(hover: hover)").matches &&
    window.matchMedia("(pointer: fine)").matches
  );
}

export function isValidJSON(str: string) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

export function parseJSON(str: string): unknown {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

export function getRealLeftTopFromCenter(
  elem: HTMLElement,
  mapRef: HTMLDivElement
): { left: number; top: number } {
  const elemRect = elem.getBoundingClientRect();
  const mapRect = mapRef.getBoundingClientRect();

  const centerX = elemRect.left + elemRect.width / 2;
  const centerY = elemRect.top + elemRect.height / 2;

  const left =
    centerX - elem.offsetWidth / 2 - mapRect.left + mapRef.scrollLeft;
  const top = centerY - elem.offsetHeight / 2 - mapRect.top + mapRef.scrollTop;

  return { left, top };
}
