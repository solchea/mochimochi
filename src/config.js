export const game = {
  // board dimensions
  cols: 6,
  rows: 12,
  hiddenRows: 2,
  // number of frames between block falls one row
  fallSpeed: 20,
  fallSpeedMin: 3,
  fallSpeedupStep: 2,
  fallSpeedupDelay: 1800,
  // block will fall this time faster when drop key pressed
  dropModifier: 10,
  backgroundColor: 'black',
  ghostBlockColor: 'orange'
}

const minSpriteWidth = Math.floor(window.innerWidth / (game.cols + 2));
const minSpriteHeight = Math.floor(window.innerHeight / (game.rows + 2));
const SPRITE_SIZE = minSpriteWidth < minSpriteHeight ? minSpriteWidth : minSpriteHeight;

export const display = {
  // currently hardcoded block sprite size
  blockSize: SPRITE_SIZE,
  width: game.cols * SPRITE_SIZE + (SPRITE_SIZE * 2),
  height: game.rows * SPRITE_SIZE + (SPRITE_SIZE * 2)
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