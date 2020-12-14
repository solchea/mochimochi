import { Graphics, Sprite, Texture, Text, TextStyle } from 'pixi.js';
import State from './State';
import TextInput from 'pixi-text-input';
import { basicTextStyle, makeButton, titleTextStyle } from './../utils';

import config from './../config.js';



export default class Waiting extends State {
  constructor(game, app) {
    super();
    this.game = game;
    this.app = app;
    this.players = [];
    this.startButton = false;
    this.game.socket
      .on('start', (game) => {
        console.log('start', game);
        this.countdown.visible = true;

        const timerId = window.setInterval(() => {
          const now = Date.now();
          const timeLeft = Math.floor((game.startsOn - now) / 1000);
          this.countdown.text = `Game starting in\n${timeLeft}\nseconds`;
          if (game.startsOn - now < 0) {
            this.game.setState('play', {});
            window.clearInterval(timerId);
          }
        }, 1000)
      })
      .on('players', (players) => {
        this.players = players;
        this.playersText.text = `Players in game: ${this.players.length}`;
      })

    const gameTitle = new Text('Mochi', titleTextStyle);
    gameTitle.anchor.set(0.5, 0.5);
    gameTitle.x = config.display.width / 2;
    gameTitle.y = config.display.blockSize;

    this.gameTitle = gameTitle;

    const playersText = new Text(`Players in game: ${this.players.length}`, basicTextStyle);
    playersText.anchor.set(0.5, 0.5);
    playersText.x = config.display.width / 2;
    playersText.y = (config.display.blockSize * 2);

    this.playersText = playersText;

    const countdown = new Text(`Game starting in\n5\nseconds`, { ...basicTextStyle, align: 'center' })
    countdown.anchor.set(.5, .5);
    countdown.x = config.display.width / 2;
    countdown.y = (config.display.blockSize * 5);
    countdown.visible = false;
    this.countdown = countdown;

    this.addChild(gameTitle);
    this.addChild(playersText);
    this.addChild(countdown);
  }

  enter(opts) {
    console.log(opts);

    if (opts && opts.host) {
      const startButton = makeButton('Start game');
      startButton.x = config.display.width / 2 - (startButton.width / 2);
      startButton.y = config.display.blockSize * 3;
      startButton.on('pointerdown', () => {
        console.log("heelo", this.game.onlineGameId)
        this.game.socket.emit('start', this.game.onlineGameId);
        this.startButton.visible = false;
      })
      this.startButton = startButton;
      this.addChild(startButton);
    } else {
      const waitingText = new Text('Waiting for host to start game', basicTextStyle);
      waitingText.anchor.set(.5, .5);
      waitingText.position.set(config.display.width / 2, config.display.blockSize * 3);
      this.addChild(waitingText);
    }
    this.gameTitle.text = this.game.onlineGameId;
    this.game.socket.emit('players', this.game.onlineGameId);
  }

  exit(opts) {}

  update(dt) {}

}