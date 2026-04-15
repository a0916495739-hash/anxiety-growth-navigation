// Module-level store for navigation direction
// 1 = forward (swipe left / next tab)
// -1 = backward (swipe right / prev tab)
// 0 = vertical / neutral
let _dir = 0;
export const getNavDirection = () => _dir;
export const setNavDirection = (d) => { _dir = d; };
