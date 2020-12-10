import * as PIXI from 'pixi.js';
import config from './config.js';

import State from './State';
import Puyo from './Puyo.js';

export default class GamePlay extends State {
  constructor(game) {
    super();
    this.game = game;
    this.cols = config.game.cols;
    this.rows = config.game.rows;
    this.blockSize = config.display.blockSize;
    // console.log(PIXI.Loader.shared);
    this.sheet = PIXI.Loader.shared.resources['./assets/sprites.json'].spritesheet;

    this.board = new Array(this.cols);
    for (let row = 0; row <= this.cols; row++) {
      this.board[row] = new Array(this.rows);
      //this.board[row].fill('black');
    }

    for (let rowCtr = 0; rowCtr < this.rows; rowCtr++) {
      for (let colCtr = 0; colCtr < this.cols; colCtr++) {
        const block = new PIXI.Sprite(this.sheet.textures['black']);
        block.x = colCtr * this.blockSize;
        block.y = rowCtr * this.blockSize + config.display.menuHeight;
        block.color = 'black';
        block.locked = false;
        this.addChild(block);
        this.board[colCtr][rowCtr] = block;
      }
    }

    this.frameCtr = 0;
    this.puyo = new Puyo(5, 0);
    this.nextPuyo = new Puyo(5, 0);
    this.nextPuyoBlocks = new Array(2);
    this.nextPuyoBlocks[0] = new PIXI.Sprite(this.sheet.textures[this.nextPuyo.block2.color]);
    this.nextPuyoBlocks[0].x = this.blockSize * (this.cols - 1);
    this.nextPuyoBlocks[0].y = 0;
    this.nextPuyoBlocks[1] = new PIXI.Sprite(this.sheet.textures[this.nextPuyo.block1.color]);
    this.nextPuyoBlocks[1].x = this.blockSize * (this.cols - 1);
    this.nextPuyoBlocks[1].y = this.blockSize;

    this.addChild(this.nextPuyoBlocks[0])
    this.addChild(this.nextPuyoBlocks[1])

    this.gameOver = false;
    this.direction = 'down';

    this.refreshSweep = false;
    this.clearMatches = false;
    this.matches = [];

    this.fallColumns = false;
    this.columnsToFall = [];

    const left = new PIXI.Sprite(PIXI.Loader.shared.resources.left.texture);
    left.x = 10;
    left.y = 570;
    left.interactive = true;
    left.on('mousedown', () => {
      this.game.key.left.onPress();
    }).on('mouseup', () => {
      this.game.key.left.onRelease();
    });
    const right = new PIXI.Sprite(PIXI.Loader.shared.resources.right.texture);
    right.x = 100;
    right.y = 570;
    right.interactive = true;
    right.on('mousedown', () => {
      this.game.key.right.onPress();
    }).on('mouseup', () => {
      this.game.key.right.onRelease();
    });
    const rotate = new PIXI.Sprite(PIXI.Loader.shared.resources.rotate.texture);
    rotate.x = 225;
    rotate.y = 570;
    rotate.interactive = true;
    rotate.on('mousedown', () => {
      this.game.key.up.onPress();
    }).on('mouseup', () => {
      this.game.key.up.onRelease();
    });
    this.addChild(rotate);
    this.addChild(left);
    this.addChild(right);

  }
  enter(opts) {}

  exit(opts) {}

  renderBoard() {
    // console.log('rennnder');
    if (!this.gameOver) {
      //console.log('new', this.board[5][0].color);
      if (this.clearMatches || this.fallColumns) {
        if (this.clearMatches && this.refreshSweep) {
          // console.log("clearing matches");
          // console.log("matches", this.matches);
          this.clearBlocks(this.matches);
          this.matches = [];
          this.clearMatches = false;
          this.fallColumns = true;
          this.refreshSweep = false;
        } else if (this.fallColumns && this.refreshSweep) {
          // console.log("dropping columns", this.columnsToFall);
          this.dropColumns(this.columnsToFall);
          this.refreshSweep = false;
        }
      } else if (this.puyo.updateBoard(this.board, this.sheet, this.direction)) {
        this.sweepForMatches();

        if (this.matches.length) {
          // console.log("we have matches");
          this.clearMatches = true;
        } else {
          this.puyo = this.nextPuyo;
          this.nextPuyo = new Puyo(5, 0);

          this.nextPuyoBlocks[0].texture = this.sheet.textures[this.nextPuyo.block2.color];
          this.nextPuyoBlocks[1].texture = this.sheet.textures[this.nextPuyo.block1.color];

          //console.log('checkfor game over');
          if (this.puyo.collidesBoard(this.board)) {
            console.log("game over")
            this.game.setState('gameover', {});
            this.gameOver = true;
          }
        }
      }

    }
  }

  dropColumns(columns) {
    let changeMade = false;
    for (const col of columns) {
      const boardCol = this.board[col];
      const bottomRow = config.game.rows - 1;
      for (let colInd = bottomRow - 1; colInd >= 0; colInd--) {
        if (boardCol[colInd].color !== 'black') {
          //check if it can drop
          if (boardCol[colInd + 1].color === 'black') {
            boardCol[colInd + 1].color = boardCol[colInd].color;
            boardCol[colInd + 1].texture = this.sheet.textures[boardCol[colInd].color];
            boardCol[colInd + 1].locked = true;

            boardCol[colInd].color = 'black';
            boardCol[colInd].texture = this.sheet.textures['black'];
            boardCol[colInd].locked = false;
            changeMade = true;
          }
        }
      }
    }

    if (!changeMade) {
      this.fallColumns = false;
      this.columnsToFall = [];
    }
  }

  clearBlocks(matches) {
    const columnsToFall = {};

    for (const matchSet of matches) {
      for (const match of matchSet) {
        // console.log("match", match)
        const x = match[0];
        this.board[match[0]][match[1]].texture = this.sheet.textures['black'];
        this.board[match[0]][match[1]].color = 'black';
        this.board[match[0]][match[1]].locked = false;
        columnsToFall[x] = true;
      }
    }
    // console.log("columnsToFall", columnsToFall)
    for (const [key, col] of Object.entries(columnsToFall)) {
      this.columnsToFall.push(key);
    }
  }

  checkAdjacentBlocks(x, y, color, matchingBlocks, beenChecked) {
    if (beenChecked[`${x}-${y}`]) return;

    const currentBlockColor = this.board[x][y].color;
    beenChecked[`${x}-${y}`] = true;

    if (currentBlockColor === color) {
      //console.log(x, y, currentBlockColor)
      matchingBlocks.push([x, y]);
    } else {
      return;
    }

    // top
    if (y - 1 > 0 && this.board[x][y - 1].color !== 'black' && !beenChecked[`${x}-${y-1}`]) {
      // if (y - 1 > 0 && !this.beenChecked[`${x}-${y-1}`]) {
      this.checkAdjacentBlocks(x, (y - 1), color, matchingBlocks, beenChecked);
    }

    // left
    if (x - 1 > 0 && this.board[x - 1][y].color !== 'black' && !beenChecked[`${x-1}-${y}`]) {
      // if (x - 1 > 0 && !this.beenChecked[`${x-1}-${y}`]) {
      this.checkAdjacentBlocks((x - 1), y, color, matchingBlocks, beenChecked);
    }

    // right
    if (x + 1 < config.game.cols && this.board[x + 1][y].color !== 'black' && !beenChecked[`${x+1}-${y}`]) {
      // if (x + 1 < config.game.cols - 1 && !this.beenChecked[`${x+1}-${y}`]) {
      this.checkAdjacentBlocks((x + 1), y, color, matchingBlocks, beenChecked);
    }

    // bottom
    if (y + 1 < config.game.rows && this.board[x][y + 1].color !== 'black' && !beenChecked[`${x}-${y+1}`]) {
      // if (y + 1 < config.game.rows - 1 && !this.beenChecked[`${x}-${y+1}`]) {
      this.checkAdjacentBlocks(x, (y + 1), color, matchingBlocks, beenChecked);
    }

    return matchingBlocks;

  }

  sweepForMatches() {
    // console.log("sweep");

    const streakBlocks = {};

    for (let x = 0; x < config.game.cols; x++) {
      for (let y = 0; y < config.game.rows; y++) {
        const currentColor = this.board[x][y].color;
        let beenChecked = {};
        if (!streakBlocks[`${x}-${y}`] && currentColor !== 'black') {
          const streak = this.checkAdjacentBlocks(x, y, currentColor, [], beenChecked);

          if (streak.length > 3) {
            this.matches.push(streak);
            // console.log('streak', x, y, streak);
            for (const temp of streak) {
              streakBlocks[`${temp[0]}-${temp[1]}`] = true;
            }
          }
        }
      }
    }
  }

  update(dt) {
    if (this.game.key.escape.trigger() || this.game.key.space.trigger()) {
      this.game.setState('pause', {});
    } else if (this.game.key.left.trigger()) {
      this.puyo.updatePosition(-1, 0, 'left');
      this.direction = 'left';
    } else if (this.game.key.right.trigger()) {
      this.puyo.updatePosition(1, 0, 'right');
      this.direction = 'right';
    } else if (this.game.key.up.trigger()) {
      this.puyo.rotate();
    } else if (this.frameCtr > config.game.fallSpeed) {
      this.puyo.updatePosition(0, 1, 'down');
      this.frameCtr = 0;
      this.direction = 'down';
      this.refreshSweep = true;
    }

    if (!this.gameOver) {
      this.renderBoard();
    }
    this.frameCtr++;
  }
}