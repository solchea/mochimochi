import Block from './Block.js';
import config from './../config.js';

export default class Mochi {
  constructor(x, y, color1, color2) {
    this.colors = ['blue', 'cyan', 'green', 'purple', 'red'];
    this.block1 = new Block(x, y - 1);
    this.block1.color = color1 ? color1 : this.colors[Math.floor(Math.random() * this.colors.length)];
    this.block2 = new Block(x, y - 2);
    this.block2.color = color2 ? color2 : this.colors[Math.floor(Math.random() * this.colors.length)];
    this.rotations = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    this.rotationCtr = 0;
    this.collision = false;
  }

  updatePosition(x, y, direction) {
    if ((direction === 'left' && (this.block1.x === 0 || this.block2.x === 0)) ||
      (direction === 'right' && (this.block1.x === config.game.cols - 1 || this.block2.x === config.game.cols - 1)) ||
      (this.collision && (direction === 'left' || direction === 'right'))) {} else {

      if (this.block1.status !== 'done') {
        this.block1.updatePosition(x, y);
      }

      if (this.block2.status !== 'done') {
        this.block2.updatePosition(x, y);
      }
    }
  }

  updateBoard(board, sheet, direction) {
    let block1Done = false;
    let block2Done = false;

    if ((direction === 'down' && this.block1.y > this.block2.y) ||
      (direction === 'left' && this.block1.x < this.block2.x) ||
      (direction === 'right' && this.block1.x > this.block2.x)) {
      block1Done = this.updateBlock(board, this.block1, sheet);
      block2Done = this.updateBlock(board, this.block2, sheet);
    } else {
      block2Done = this.updateBlock(board, this.block2, sheet);
      block1Done = this.updateBlock(board, this.block1, sheet);
    }
    if (block1Done || block2Done) {
      this.collision = true;
    }
    return block1Done && block2Done;
  }

  updateBlock(board, block, sheet) {
    if (block.status === 'done') {
      return true;
    }

    if (block.y >= 0 && board[block.x][block.y].color !== block.color && board[block.x][block.y].color === config.game.backgroundColor) {
      board[block.x][block.y].texture = sheet.textures[block.color];
      board[block.x][block.y].color = block.color;

      if (block.oldY >= 0) {
        board[block.oldX][block.oldY].texture = sheet.textures[config.game.backgroundColor];
        board[block.oldX][block.oldY].color = config.game.backgroundColor;
      }

      block.reset();
    } else if (block.y >= 0 && board[block.x][block.y].color !== config.game.backgroundColor) {
      block.x = block.oldX;
      block.y = block.oldY;
    }

    if (block.y >= 0 && this.blockReachesBottom(block, board)) {
      board[block.x][block.y].locked = true;
      block.status = 'done';
      return true;
    }
    return false;
  }

  blockReachesBottom(block, board) {
    if (block.y === (config.game.rows - 1)) {
      return true;
    } else if (board[block.x][block.y + 1].color !== config.game.backgroundColor && board[block.x][block.y + 1].locked) {
      return true;
    }

    return false;
  }

  collidesBoard(board) {
    if (this.block1.collidesTopBoard(board) || this.block2.collidesTopBoard(board)) {
      return true;
    }

    return false;
  }

  rotate() {
    let x = -1;
    let y = 0;
    while (x < 0 || x >= config.game.cols) {
      let rotation = this.rotations[this.rotationCtr];
      x = this.block1.x + rotation[0];
      y = this.block1.y + rotation[1]
      this.rotationCtr = (this.rotationCtr + 1) % 4;
    }
    this.block2.setPosition(x, y);
  }
}