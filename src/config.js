const SPRITE_SIZE = 32;

export const game = {
  // board dimensions
  cols: 6,
  rows: 12,
  hiddenRows: 2,
  // number of frames between block falls one row
  fallSpeed: 15,
  fallSpeedMin: 3,
  fallSpeedupStep: 2,
  fallSpeedupDelay: 1800,
  // block will fall this time faster when drop key pressed
  dropModifier: 10
}

export const display = {
  // currently hardcoded block sprite size
  blockSize: SPRITE_SIZE,
  width: game.cols * SPRITE_SIZE,
  height: game.rows * SPRITE_SIZE,
  menuWidth: 75,
  controlsHeight: 70
}

export const controls = {
  // controls key repeat speed
  repeatDelay: 2,
  initialRepeatDelay: 10
}

export default {
  game,
  display,
  controls
};