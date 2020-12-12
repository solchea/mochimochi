import { Container } from 'pixi.js';

export default class State extends Container {
  constructor() {
    super();

    this.visible = false;
  }

  /**
   * action on state enter
   * @param {Object} opts additional options passed on state change
   */
  enter(opts) {}

  /**
   * action on state exit
   * @param {Object} opts additional options passed on state change
   */
  exit(opts) {}

  /**
   * action on state update (game loop)
   * @param {Number} dt PIXI timer deltaTime
   */
  update(dt) {}
}