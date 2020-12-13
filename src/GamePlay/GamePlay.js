import * as PIXI from 'pixi.js';
import config from './../config.js';

import State from './../screens/State';
import Puyo from './Puyo.js';

export default class GamePlay extends State {
  constructor(game) {
    super();
    this.game = game;
    this.cols = config.game.cols;
    this.rows = config.game.rows;
    this.blockSize = config.display.blockSize;
    this.blockCtr = 0;
    // console.log(PIXI.Loader.shared);
    this.sheet = PIXI.Loader.shared.resources['./assets/sprites.json'].spritesheet;

    this.game.socket.on('attack', (msg) => {
      console.log('attacked', msg);
      if (this.game.socket.id !== msg.attackerId) {
        this.readyForAttack = true;
        this.numRowsDrop = msg.numRows;
      }
    })

    this.board = new Array(this.cols);
    for (let row = 0; row <= this.cols; row++) {
      this.board[row] = new Array(this.rows);
      //this.board[row].fill('black');
    }

    for (let rowCtr = 0; rowCtr < this.rows; rowCtr++) {
      for (let colCtr = 0; colCtr < this.cols; colCtr++) {
        const block = new PIXI.Sprite(this.sheet.textures['black']);
        block.x = colCtr * this.blockSize;
        block.y = rowCtr * this.blockSize;
        block.height = this.blockSize;
        block.width = this.blockSize;
        block.color = 'black';
        block.locked = false;
        this.addChild(block);
        this.board[colCtr][rowCtr] = block;
      }
    }

    this.frameCtr = 0;


    this.gameOver = false;
    this.direction = 'down';

    this.refreshSweep = false;
    this.clearMatches = false;
    this.matches = [];

    this.fallColumns = false;
    this.columnsToFall = [];

    this.readyForAttack = false;
    this.dropBlocks = false;
    this.numRowsDrop = 0;

    this.blocksFalling = false;

    const left = new PIXI.Sprite(PIXI.Loader.shared.resources.left.texture);
    left.x = 5;
    left.y = config.display.height - (config.display.blockSize * 1.75);
    left.width = config.display.blockSize * 1.5;
    left.height = config.display.blockSize * 1.5;
    left.interactive = true;
    left.on('pointerdown', () => {
      this.puyo.updatePosition(-1, 0, 'left');
    });
    const right = new PIXI.Sprite(PIXI.Loader.shared.resources.right.texture);
    right.x = 10 + (config.display.blockSize * 1.5);
    right.y = config.display.height - (config.display.blockSize * 1.75);
    right.height = config.display.blockSize * 1.5;
    right.width = config.display.blockSize * 1.5;
    right.interactive = true;
    right.on('pointerdown', () => {
      this.puyo.updatePosition(1, 0, 'right');
    });
    const rotate = new PIXI.Sprite(PIXI.Loader.shared.resources.rotate.texture);
    rotate.x = config.display.width - (config.display.blockSize * 1.5) - 5;
    rotate.y = config.display.height - (config.display.blockSize * 1.75);
    rotate.height = config.display.blockSize * 1.5;
    rotate.width = config.display.blockSize * 1.5;
    rotate.interactive = true;
    rotate.on('pointerdown', () => {
      this.puyo.rotate();
    });

    this.addChild(rotate);
    this.addChild(left);
    this.addChild(right);

    let leftBorder = new PIXI.Graphics();
    // Move it to the beginning of the line
    leftBorder.position.set(config.display.width - (2 * config.display.blockSize), 0);

    // Draw the line (endPoint should be relative to myGraph's position)
    leftBorder.lineStyle(2, 0xffffff)
      .moveTo(0, 0)
      .lineTo(0, config.display.height - (2 * config.display.blockSize));
    this.addChild(leftBorder);

    let bottomBorder = new PIXI.Graphics();
    // Move it to the beginning of the line
    bottomBorder.position.set(0, config.display.height - (2 * config.display.blockSize));

    // Draw the line (endPoint should be relative to myGraph's position)
    bottomBorder.lineStyle(2, 0xffffff)
      .moveTo(0, 0)
      .lineTo(config.display.width, 0);
    this.addChild(bottomBorder);

  }
  enter(opts) {
    //console.log("gameId", this.game.onlineGameId);
    if (!this.game.onlineGameId) {
      //console.log("no blocks")
      this.puyo = new Puyo(2, 0);
      this.nextPuyo = new Puyo(2, 0);
    } else {
      //console.log("bblocks", this.game.onlineBlocks)
      this.puyo = new Puyo(2, 0, this.game.onlineBlocks[this.blockCtr++], this.game.onlineBlocks[this.blockCtr++]);
      this.nextPuyo = new Puyo(2, 0, this.game.onlineBlocks[this.blockCtr++], this.game.onlineBlocks[this.blockCtr++]);
    }
    this.nextPuyoBlocks = new Array(2);
    this.nextPuyoBlocks[0] = new PIXI.Sprite(this.sheet.textures[this.nextPuyo.block2.color]);
    this.nextPuyoBlocks[0].x = config.display.width - (this.blockSize * 1.5);
    this.nextPuyoBlocks[0].y = 0;
    this.nextPuyoBlocks[0].height = this.blockSize;
    this.nextPuyoBlocks[0].width = this.blockSize;
    this.nextPuyoBlocks[1] = new PIXI.Sprite(this.sheet.textures[this.nextPuyo.block1.color]);
    this.nextPuyoBlocks[1].x = config.display.width - (this.blockSize * 1.5);
    this.nextPuyoBlocks[1].y = this.blockSize;
    this.nextPuyoBlocks[1].height = this.blockSize;
    this.nextPuyoBlocks[1].width = this.blockSize;

    this.addChild(this.nextPuyoBlocks[0])
    this.addChild(this.nextPuyoBlocks[1])
  }

  exit(opts) {}

  renderBoard() {
    // console.log('rennnder');
    if (!this.gameOver) {
      //console.log('new', this.board[5][0].color);
      if (this.clearMatches || this.fallColumns) {
        //console.log('why am i here', this.clearMatches, this.fallColumns);
        if (this.clearMatches && this.refreshSweep) {
          // console.log("clearing matches");
          // console.log("matches", this.matches);
          this.clearBlocks(this.matches);
          this.matches = [];
          this.clearMatches = false;
          this.fallColumns = true;
          this.refreshSweep = false;
        } else if (this.fallColumns && this.refreshSweep) {
          //console.log("dropping columns", this.columnsToFall);
          this.dropColumns(this.columnsToFall);
          this.refreshSweep = false;
        }
      } else if (this.dropBlocks && this.numRowsDrop > 0) {
        //console.log("drop bblocks")
        for (let y = 0; y < this.numRowsDrop; y++) {
          for (let x = 0; x < config.game.cols; x++) {
            this.board[x][y].color = 'orange';
            this.board[x][y].texture = this.sheet.textures['orange'];
            this.board[x][y].locked = true;
          }
        }

        this.dropBlocks = false;
        this.numRowsDrop = 0;
        this.blocksFalling = true;
        //console.log('end drop blocks', this.dropBlocks, this.blocksFalling)
      } else if (this.blocksFalling) {
        //console.log('blocks falling');
        if (this.refreshSweep) {
          let changeDetected = false;
          for (let y = config.game.rows - 2; y >= 0; y--) {
            for (let x = 0; x < config.game.cols; x++) {
              const block = this.board[x][y];
              //console.log(x, y, block, this.board[x][y + 1]);
              if (block.color === 'orange' && this.board[x][y + 1].color === 'black') {
                //console.log("swap")
                block.color = 'black';
                block.texture = this.sheet.textures['black'];
                block.locked = false;

                this.board[x][y + 1].color = 'orange';
                this.board[x][y + 1].texture = this.sheet.textures['orange'];
                this.board[x][y + 1].locked = true;
                changeDetected = true;
              }
            }
          }

          if (!changeDetected) {
            this.blocksFalling = false;
          }

          this.refreshSweep = false;
        }
      } else if (this.puyo.updateBoard(this.board, this.sheet, this.direction)) {
        this.sweepForMatches();

        if (this.matches.length) {
          //console.log("we have matches", this.matches);
          this.clearMatches = true;
        } else {
          this.puyo = this.nextPuyo;
          if (!this.game.onlineGameId) {
            this.nextPuyo = new Puyo(2, 0);
          } else {
            this.nextPuyo = new Puyo(2, 0, this.game.onlineBlocks[this.blockCtr++], this.game.onlineBlocks[this.blockCtr++]);
          }

          this.nextPuyoBlocks[0].texture = this.sheet.textures[this.nextPuyo.block2.color];
          this.nextPuyoBlocks[1].texture = this.sheet.textures[this.nextPuyo.block1.color];

          //console.log('checkfor game over');
          if (!this.blocksFalling && this.puyo.collidesBoard(this.board)) {
            console.log("game over")
            this.game.setState('gameover', {});
            this.gameOver = true;
          }
        }

        if (this.readyForAttack) {
          this.dropBlocks = true;
          this.readyForAttack = false;
        }


      }

    }
  }

  dropColumns(columns) {
    //console.log("dropColumns")
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
    if (this.game.onlineGameId) {
      this.game.socket.emit('attack', { game: this.game.onlineGameId, num: matches.length })
    }
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
    if (beenChecked[`${x}-${y}`] || color === 'orange') return;

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

  getGhostBlocks(x, y) {
    const ghostBlocks = [];
    if (this.checkForGhostBlocks(x, y - 1)) {
      ghostBlocks.push([x, y - 1]);
    }
    if (this.checkForGhostBlocks(x + 1, y)) {
      ghostBlocks.push([x + 1, y]);
    }
    if (this.checkForGhostBlocks(x, y + 1)) {
      ghostBlocks.push([x, y + 1]);
    }
    if (this.checkForGhostBlocks(x - 1, y)) {
      ghostBlocks.push([x - 1, y]);
    }
    return ghostBlocks;
  }

  checkForGhostBlocks(x, y) {
    if (x >= 0 && x < config.game.cols && y >= 0 && y < config.game.rows) {
      if (this.board[x][y].color === 'orange') {
        return true;
      }
    }

    return false;
  }

  sweepForMatches() {
    // console.log("sweep");

    const streakBlocks = {};

    for (let x = 0; x < config.game.cols; x++) {
      for (let y = 0; y < config.game.rows; y++) {
        const currentColor = this.board[x][y].color;
        let beenChecked = {};
        if (!streakBlocks[`${x}-${y}`] && currentColor !== 'black' && currentColor != 'orange') {
          const streak = this.checkAdjacentBlocks(x, y, currentColor, [], beenChecked);

          if (streak.length > 3) {
            this.matches.push(streak);
            // console.log('streak', x, y, streak);
            for (const temp of streak) {
              streakBlocks[`${temp[0]}-${temp[1]}`] = true;
              const ghostBlocks = this.getGhostBlocks(temp[0], temp[1]);
              //console.log("ghostblocks", ghostBlocks);
              this.matches.push(ghostBlocks);
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