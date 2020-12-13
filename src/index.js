import * as PIXI from 'pixi.js';
import config from './config.js';
import Game from './Game';

const app = new PIXI.Application({
  width: config.display.width,
  height: config.display.height
})

document.body.appendChild(app.view)

let mochi = new Game(app);

PIXI.Loader.shared
  .add('./assets/sprites.json')
  .add('left', './assets/left.png')
  .add('right', './assets/right.png')
  .add('rotate', './assets/rotate.png')
  .load(() => mochi.run());