import * as PIXI from 'pixi.js';

import io from 'socket.io-client';

import Keyboard from './Keyboard';
import GamePlay from './GamePlay/GamePlay';
import GameOver from './screens/GameOver';
import GamePaused from './screens/GamePaused';
import Welcome from './screens/Welcome';
import Waiting from './screens/Waiting';


/**
 * Represent whole game and handles state changes
 */
export default class Game {
  constructor(app) {
    this.app = app;

    this.gameStates = {};
    this.state = null;
    this.socket = io();
    this.onlineGameId = false;
    this.onlineBlocks = false;
  }

  /**
   * start game, execute after all assets are loaded
   */
  run() {
    // let background = new PIXI.extras.TilingSprite(
    //   PIXI.loader.resources.blocks.textures.background,
    //   this.app.renderer.width,
    //   this.app.renderer.height);
    // this.app.stage.addChild(background);

    this.key = new Keyboard();
    // this.scores = new ScoreTable();

    // define available game states
    this.addState('play', new GamePlay(this));
    this.addState('pause', new GamePaused(this));
    // this.addState('menu', new GameMenu(this));
    this.addState('gameover', new GameOver(this));
    this.addState('welcome', new Welcome(this, this.app));
    this.addState('waiting', new Waiting(this, this.app));

    // set initial state
    this.setState('welcome');

    // start the updates
    this.app.ticker.add(this.update, this);
  }

  /**
   * Add new state
   * @param {String} stateName
   * @param {State} state     new state instance
   */
  addState(stateName, state) {
    this.gameStates[stateName] = state;
    this.app.stage.addChild(state);
  }

  /**
   * Handle game update
   * @param {Number} dt PIXI timer deltaTime
   */
  update(dt) {
    if (this.state) {
      this.state.update(dt);
    }
  }

  /**
   * changes current state
   * @param {String} stateName
   * @param {Object} opts additional options passed by previous state
   */
  setState(stateName, opts) {
    let oldState = this.state;

    this.state = null;

    if (oldState) {
      if (!opts.keepVisible) {
        oldState.visible = false;
      }
      oldState.exit(opts);
    }

    let newState = this.gameStates[stateName];
    newState.enter(opts);
    newState.visible = true;
    this.state = newState;
  }
}