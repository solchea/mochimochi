import config from './../config.js';

export default class Block {
  constructor(x, y) {
    this.oldX = x;
    this.x = x;
    this.oldY = y;
    this.y = y;
    this.color = 'black';
    this.status = 'new';
  }

  setPosition(x, y) {
    if (x >= 0 && x < config.game.cols) {
      this.x = x;
    }
    if (y < config.game.rows) {
      this.y = y;
    }
  }

  updatePosition(x, y) {
    const newX = this.x + x;
    const newY = this.y + y;

    if (newX >= 0 && newX < config.game.cols) {
      this.x += x;
    }
    if (newY < config.game.rows) {
      this.y += y;
    }
  }

  needsUpdate() {
    return this.x !== this.oldX || this.y !== this.oldY;
  }

  collidesTopBoard(board) {
    if (this.y <= 0 && (board[this.x][0].color !== 'black' || board[this.x][1].color !== 'black')) {
      return true;
    }
  }

  reset() {
    this.oldX = this.x;
    this.oldY = this.y;
  }
}