import { Graphics, Sprite, Texture, Text, TextStyle } from 'pixi.js';
import State from './State';
import TextInput from 'pixi-text-input';

export const simpleTextStyle = new TextStyle({
  fontFamily: 'Arial',
  fontSize: 10,
  fill: '#F00',
});

export default class Welcome extends State {
  constructor(game, app) {
    super();
    this.game = game;
    this.app = app;

    this.game.socket
      .on('wait', (game) => {
        this.game.onlineGameId = game.id;
        this.game.onlineBlocks = game.blocks;
        console.log("waitinig for host to start", game);
        this.game.setState('waiting', {});
      })
      .on('host', (game) => {
        this.game.onlineGameId = game.id;
        this.game.onlineBlocks = game.blocks;
        console.log("now the host", game);
        this.game.setState('waiting', { host: true });
      })
  }

  enter(opts) {
    const text = new TextInput({
      input: {
        fontSize: '12px',
        padding: '10px',
        width: '200px',
        color: '#26272E'
      },
      box: {
        default: { fill: 0xE8E9F3, rounded: 12, stroke: { color: 0xCBCEE0, width: 3 } },
        focused: { fill: 0xE1E3EE, rounded: 12, stroke: { color: 0xABAFC6, width: 3 } },
        disabled: { fill: 0xDBDBDB, rounded: 12 }
      }
    });
    text.x = 5;
    text.y = 5;
    this.input = text;
    this.addChild(text)

    var sprite = new Sprite(Texture.WHITE);
    sprite.width = 200;
    sprite.height = 50;
    sprite.x = 5;
    sprite.y = 100;

    let buttonText = new Text('Join game', simpleTextStyle);
    //this.addChild(buttonText);

    //this.addChild(sprite);

    const button = this.makeButton('Join game');
    button.x = 10;
    button.y = 200;
    button.interactive = true;
    button.on('pointerdown', () => {
      console.log("heelo", this.input.text)
      this.game.socket.emit('join', this.input.text)
    })

    const singlePlayerButton = this.makeButton('Start single player game');
    singlePlayerButton.x = 10;
    singlePlayerButton.y = 250;
    singlePlayerButton.interactive = true;
    singlePlayerButton.on('pointerdown', () => {
      this.game.setState('play', {});
      // console.log('starting');
      // this.game.socket.emit('start', 'mochi')
    })

    this.addChild(singlePlayerButton);
    this.addChild(button);
  }

  exit(opts) {}

  update(dt) {
    if (this.game.key.escape.trigger() || this.game.key.space.trigger()) {
      this.game.setState('play', {});
    }
  }

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