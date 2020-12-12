import { Graphics, Sprite, Texture, Text, TextStyle } from 'pixi.js';
import State from './State';
import TextInput from 'pixi-text-input';

export const simpleTextStyle = new TextStyle({
  fontFamily: 'Arial',
  fontSize: 10,
  fill: '#F00',
});

export default class Waiting extends State {
  constructor(game, app) {
    super();
    this.game = game;
    this.app = app;
    this.game.socket
      .on('start', (game) => {
        console.log('start', game);

        const timerId = window.setInterval(() => {
          const now = Date.now();
          console.log(Math.floor((game.startsOn - now) / 1000) + ' seconds to go');
          if (game.startsOn - now < 0) {
            this.game.setState('play', {});
            window.clearInterval(timerId);
          }
        }, 1000)
      })
  }

  enter(opts) {
    console.log(opts);

    if (opts.host) {
      const startButton = this.makeButton('Start game');
      startButton.x = 10;
      startButton.y = 200;
      startButton.interactive = true;
      startButton.on('pointerdown', () => {
        console.log("heelo", this.game.onlineGameId)
        this.game.socket.emit('start', this.game.onlineGameId)
      })
      this.addChild(startButton);
    } else {

    }
  }

  exit(opts) {}

  update(dt) {}

  makeButton(text) {
    var txt = new Text(text, {
      fontFamily: 'Roboto',
      fontSize: 12,
      fontWeight: 'bold'
    });
    txt.position.set(7, 7);
    const graficArea = new Graphics()
    graficArea
      .beginFill(0xfbbbbbfbb)
      .lineStyle(2, 5093036)
      .drawRect(0, 0, 130, 30)
      .endFill();
    const spriteArea = new Sprite(this.app.renderer.generateTexture(graficArea));
    spriteArea.position.set(300, 300); // edit me
    spriteArea.addChild(txt);
    return spriteArea;
  }
}