import { Text, TextStyle } from 'pixi.js';
import State from './State';

import { titleTextStyle } from './../utils';

import config from './../config.js';

export default class GamePaused extends State {
  constructor(game) {
    super();
    this.game = game;

    const pausedText = new Text('Paused', titleTextStyle);
    pausedText.anchor.set(0.5, 0.5);
    pausedText.x = config.display.width / 2;
    pausedText.y = config.display.blockSize;
    this.addChild(pausedText)
  }

  enter(opts) {}

  exit(opts) {}

  update(dt) {

    if (this.game.key.escape.trigger() || this.game.key.space.trigger()) {
      this.game.setState('play', {});
    }
  }
}