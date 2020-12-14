import { Text, TextStyle } from 'pixi.js';
import State from './State';

import { titleTextStyle, makeButton } from './../utils';

import config from './../config.js';

export default class GameOver extends State {
  constructor(game) {
    super();
    this.game = game;

    const gameoverText = new Text('Game Over', titleTextStyle);
    gameoverText.anchor.set(0.5, 0.5);
    gameoverText.x = config.display.width / 2;
    gameoverText.y = config.display.blockSize;
    this.addChild(gameoverText);

    const restart = makeButton('Restart');
    restart.x = config.display.width / 2 - restart.width / 2;
    restart.y = config.display.blockSize * 2;
    restart.on('pointerdown', () => {
      this.game.setState('play', { restart: true });
    });
    this.addChild(restart);
  }

  enter(opts) {}

  exit(opts) {}

  update(dt) {}
}