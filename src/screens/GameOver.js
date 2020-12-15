import { Text, TextStyle } from 'pixi.js';
import State from './State';

import { boldTextStyle, titleTextStyle, makeButton } from './../utils';

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
    restart.y = config.display.blockSize * 3;
    restart.on('pointerdown', () => {
      this.game.setState('play', { restart: true });
    });
    this.addChild(restart);

    this.finalScore = new Text('', boldTextStyle);
    this.finalScore.anchor.set(.5, .5);
    this.finalScore.x = config.display.width / 2;
    this.finalScore.y = config.display.blockSize * 2.2;
    this.addChild(this.finalScore);
  }

  enter(opts) {
    if (opts && opts.score) {
      this.finalScore.text = `Final score: ${opts.score}\nMax combo: ${opts.maxCombo}`;
    }
  }

  exit(opts) {}

  update(dt) {}
}