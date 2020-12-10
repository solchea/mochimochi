import { Text, TextStyle } from 'pixi.js';
import State from './State';

export const simpleTextStyle = new TextStyle({
  fontFamily: 'Arial',
  fontSize: 18,
  fill: '#FFF1E9',
  stroke: '#000000',
  strokeThickness: 4
});

export default class GamePaused extends State {
  constructor(game) {
    super();
    this.game = game;
  }

  enter(opts) {
    const text = new Text('Paused', simpleTextStyle);
    text.x = 5;
    text.y = 5;
    this.addChild(text)
  }

  exit(opts) {}

  update(dt) {

    if (this.game.key.escape.trigger() || this.game.key.space.trigger()) {
      this.game.setState('play', {});
    }
  }
}