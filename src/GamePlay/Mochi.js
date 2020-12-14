import Block from './Block.js';
import config from './../config.js';

export default class Mochi {
  constructor(x, y, color1, color2) {
    this.colors = ['blue', 'cyan', 'green', 'purple', 'red']; // 'orange'];
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
      (this.collision && (direction === 'left' || direction === 'right'))) {
      //console.log('dont move')
    } else {

      if (this.block1.status !== 'done') {
        this.block1.updatePosition(x, y);
      }

      if (this.block2.status !== 'done') {
        this.block2.updatePosition(x, y);
      }
    }

    // console.log('updatepositions', this.block1.oldY, this.block2.oldY);
    // console.log('updatepositions', this.block1.x, this.block2.x);
  }

  updateBoard(board, sheet, direction) {
    let block1Done = false;
    let block2Done = false;
    // console.log('direction', direction, this.block1.x, this.block2.x);
    if ((direction === 'down' && this.block1.y > this.block2.y) ||
      (direction === 'left' && this.block1.x < this.block2.x) ||
      (direction === 'right' && this.block1.x > this.block2.x)) {
      // console.log("b1", this.block1.x);
      block1Done = this.updateBlock(board, this.block1, sheet);
      // console.log("b2", this.block2.x);
      block2Done = this.updateBlock(board, this.block2, sheet);
    } else {
      // console.log("b2", this.block2.x);
      block2Done = this.updateBlock(board, this.block2, sheet);
      // console.log("b1", this.block1.x);
      block1Done = this.updateBlock(board, this.block1, sheet);
    }
    // console.log('update', this.block1.x, this.block2.x);
    if (block1Done || block2Done) {
      this.collision = true;
    }
    return block1Done && block2Done;
  }

  updateBlock(board, block, sheet) {
    if (block.status === 'done') {
      return true;
    }

    if (block.y >= 0 && board[block.x][block.y].color !== block.color && board[block.x][block.y].color === 'black') {
      // console.log('a', board[block.x][block.y].color, block.color);
      board[block.x][block.y].texture = sheet.textures[block.color];
      board[block.x][block.y].color = block.color;

      if (block.oldY >= 0) {
        board[block.oldX][block.oldY].texture = sheet.textures['black'];
        board[block.oldX][block.oldY].color = 'black';
      }

      block.reset();
    } else if (block.y >= 0 && board[block.x][block.y].color !== 'black') {
      // console.log('b', board[block.x][block.y].color, block.color);
      block.x = block.oldX;
      block.y = block.oldY;
    }

    if (block.y >= 0 && this.blockReachesBottom(block, board)) {
      board[block.x][block.y].locked = true;
      block.status = 'done';
      //console.log('done')
      // console.log('c')
      return true;
    }
    // console.log('ub', block.y);
    return false;
  }

  blockReachesBottom(block, board) {
    // console.log("bbottom")
    if (block.y === (config.game.rows - 1)) {
      // console.log("aaa");
      return true;
    } else if (board[block.x][block.y + 1].color !== 'black' && board[block.x][block.y + 1].locked) {
      // console.log("bbbb", board[block.x][block.y + 1].locked);
      return true;
    }

    return false;
  }

  collidesBoard(board) {
    //console.log('color', board[5][0].color, board[5][1].color)
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