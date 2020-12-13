import { Graphics, Sprite, Texture, Text, TextStyle } from 'pixi.js';
import State from './State';
import TextInput from 'pixi-text-input';
import config from './../config';

import { basicTextStyle, makeButton } from './../utils';

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

    const titleText = new Text('Enter game code:', basicTextStyle);
    titleText.anchor.set(.5, .5);
    titleText.position.set(config.display.width / 2, config.display.blockSize)

    const gameCode = new TextInput({
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
    gameCode.x = config.display.width / 2 - gameCode.width / 2;
    gameCode.y = config.display.blockSize * 1.5;
    this.input = gameCode;
    this.addChild(gameCode)

    const joinGameButton = makeButton('Join game');
    joinGameButton.x = config.display.width / 2 - joinGameButton.width / 2;
    joinGameButton.y = config.display.blockSize * 3;
    joinGameButton.on('pointerdown', () => {
      console.log("heelo", this.input.text)
      this.game.socket.emit('join', this.input.text)
    })

    const singlePlayerButton = makeButton('Single Player');
    singlePlayerButton.x = config.display.width / 2 - singlePlayerButton.width / 2;
    singlePlayerButton.y = config.display.blockSize * 4.5;
    singlePlayerButton.on('pointerdown', () => {
      this.game.setState('play', {});
    })

    this.addChild(titleText);
    this.addChild(joinGameButton);
    this.addChild(singlePlayerButton);

  }

  exit(opts) {}

  update(dt) {
    if (this.game.key.escape.trigger() || this.game.key.space.trigger()) {
      this.game.setState('play', {});
    }
  }

}