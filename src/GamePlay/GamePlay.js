import * as PIXI from 'pixi.js';
import config from './../config.js';

import State from './../screens/State';
import Mochi from './Mochi.js';

import { basicTextStyle, boldTextStyle, debounce, titleTextStyle } from './../utils';

export default class GamePlay extends State {
  constructor(game) {
    super();
    this.game = game;
    this.cols = config.game.cols;
    this.rows = config.game.rows;
    this.blockSize = config.display.blockSize;
    this.blockCtr = 0;
    this.inProgress = false;
    this.runningScore = 0;
    this.sheet = PIXI.Loader.shared.resources['./assets/sprites.json'].spritesheet;

    this.moveLeft = debounce(() => {
      this.direction = 'left';
      this.mochi.updatePosition(-1, 0, 'left');
    }, 25);
    this.moveRight = debounce(() => {
      this.direction = 'right'
      this.mochi.updatePosition(1, 0, 'right');
    }, 25);
    this.rotate = debounce(() => {
      this.mochi.rotate();
    }, 25);


    this.game.socket.on('attack', (msg) => {
      if (this.game.socket.id !== msg.attackerId) {
        this.readyForAttack = true;
        this.numRowsDrop = msg.numRows;
      }
    })

    this.board = new Array(this.cols);
    for (let row = 0; row <= this.cols; row++) {
      this.board[row] = new Array(this.rows);
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

    const nextLabel = new PIXI.Text('Next', basicTextStyle);
    nextLabel.anchor.set(.5, .5);
    nextLabel.x = config.display.width - this.blockSize;
    nextLabel.y = this.blockSize / 2;
    this.addChild(nextLabel);

    this.nextMochiBlocks = new Array(2);
    this.nextMochiBlocks[0] = new PIXI.Sprite(this.sheet.textures['blue']);
    this.nextMochiBlocks[0].x = config.display.width - (this.blockSize * 1.5);
    this.nextMochiBlocks[0].y = this.blockSize;
    this.nextMochiBlocks[0].height = this.blockSize;
    this.nextMochiBlocks[0].width = this.blockSize;
    this.nextMochiBlocks[1] = new PIXI.Sprite(this.sheet.textures['blue']);
    this.nextMochiBlocks[1].x = config.display.width - (this.blockSize * 1.5);
    this.nextMochiBlocks[1].y = this.blockSize * 2;
    this.nextMochiBlocks[1].height = this.blockSize;
    this.nextMochiBlocks[1].width = this.blockSize;

    this.addChild(this.nextMochiBlocks[0]);
    this.addChild(this.nextMochiBlocks[1]);

    const scoreLabel = new PIXI.Text('Score', basicTextStyle);
    scoreLabel.anchor.set(.5, .5);
    scoreLabel.x = config.display.width - this.blockSize;
    scoreLabel.y = (this.blockSize * 3) + (this.blockSize / 2);
    this.addChild(scoreLabel);

    this.score = new PIXI.Text('0000000', boldTextStyle);
    this.score.anchor.set(.5, .5);
    this.score.x = config.display.width - this.blockSize;
    this.score.y = (this.blockSize * 4) + (this.blockSize / 2);
    this.addChild(this.score);

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
      this.moveLeft();
    });
    const right = new PIXI.Sprite(PIXI.Loader.shared.resources.right.texture);
    right.x = 10 + (config.display.blockSize * 1.5);
    right.y = config.display.height - (config.display.blockSize * 1.75);
    right.height = config.display.blockSize * 1.5;
    right.width = config.display.blockSize * 1.5;
    right.interactive = true;
    right.on('pointerdown', () => {
      this.moveRight();
    });
    const rotate = new PIXI.Sprite(PIXI.Loader.shared.resources.rotate.texture);
    rotate.x = config.display.width - (config.display.blockSize * 1.5) - 5;
    rotate.y = config.display.height - (config.display.blockSize * 1.75);
    rotate.height = config.display.blockSize * 1.5;
    rotate.width = config.display.blockSize * 1.5;
    rotate.interactive = true;
    rotate.on('pointerdown', () => {
      this.rotate();
    });

    this.addChild(rotate);
    this.addChild(left);
    this.addChild(right);

    for (let row = 1; row < config.game.rows; row++) {
      const newRow = new PIXI.Graphics();
      newRow.position.set(0, row * config.display.blockSize);
      newRow
        .lineStyle(1, 0xffffff)
        .moveTo(0, 0)
        .lineTo(config.display.blockSize * config.game.cols, 0);
      this.addChild(newRow);
    }

    for (let col = 1; col < config.game.cols; col++) {
      const newCol = new PIXI.Graphics();
      newCol.position.set(col * config.display.blockSize, 0);
      newCol
        .lineStyle(1, 0xffffff)
        .moveTo(0, 0)
        .lineTo(0, config.display.blockSize * config.game.rows);
      this.addChild(newCol);
    }

    let leftBorder = new PIXI.Graphics();
    leftBorder.position.set(config.display.width - (2 * config.display.blockSize), 0);
    leftBorder.lineStyle(2, 0xffffff)
      .moveTo(0, 0)
      .lineTo(0, config.display.height - (2 * config.display.blockSize));
    this.addChild(leftBorder);

    let bottomBorder = new PIXI.Graphics();
    bottomBorder.position.set(0, config.display.height - (2 * config.display.blockSize));
    bottomBorder.lineStyle(2, 0xffffff)
      .moveTo(0, 0)
      .lineTo(config.display.width, 0);
    this.addChild(bottomBorder);

  }
  enter(opts) {
    if (!this.inProgress || (opts && opts.restart)) {

      // reset board
      for (let rowCtr = 0; rowCtr < this.rows; rowCtr++) {
        for (let colCtr = 0; colCtr < this.cols; colCtr++) {
          this.board[colCtr][rowCtr].color = 'black';
          this.board[colCtr][rowCtr].texture = this.sheet.textures['black'];
          this.board[colCtr][rowCtr].locked = false;
        }
      }

      this.blockCtr = 0;
      this.gameOver = true;

      if (!this.game.onlineGameId) {
        this.mochi = new Mochi(2, 0);
        this.nextMochi = new Mochi(2, 0);
      } else {
        this.mochi = new Mochi(2, 0, this.game.onlineBlocks[this.blockCtr++], this.game.onlineBlocks[this.blockCtr++]);
        this.nextMochi = new Mochi(2, 0, this.game.onlineBlocks[this.blockCtr++], this.game.onlineBlocks[this.blockCtr++]);
      }

      this.nextMochiBlocks[0].texture = this.sheet.textures[this.nextMochi.block2.color];
      this.nextMochiBlocks[1].texture = this.sheet.textures[this.nextMochi.block1.color];

      this.inProgress = true;

      //countdown
      const buttonWidth = config.display.blockSize * 6;
      const buttonHeight = config.display.blockSize * 2;

      var txt = new PIXI.Text('5', titleTextStyle);
      txt.anchor.set(.5, .5);
      txt.position.set(buttonWidth / 2, buttonHeight / 2);

      const box = new PIXI.Graphics();
      box.beginFill(0x3496eb, 1);
      box.lineStyle(5, 0xffffff);
      box.drawRect(0, 0, buttonWidth, buttonHeight);
      box.endFill();
      box.y = config.display.blockSize * 5;

      box.addChild(txt);
      this.addChild(box);
      this.countdown = txt;
      this.startTime = Date.now() + 6000;

      const countdownId = window.setInterval(() => {
        const now = Date.now();
        const diff = Math.floor((this.startTime - now) / 1000);

        if (diff === 0) {
          this.frameCtr = 0;
          this.countdown.parent.visible = false;
          this.gameOver = false;
          this.runningScore = 0;
          window.clearInterval(countdownId);
        }

        this.countdown.text = diff;

      }, 900);

    }
  }

  exit(opts) {}

  renderBoard() {
    if (!this.gameOver) {
      if (this.clearMatches || this.fallColumns) {
        if (this.clearMatches && this.refreshSweep) {
          this.clearBlocks(this.matches);
          this.matches = [];
          this.clearMatches = false;
          this.fallColumns = true;
          this.refreshSweep = false;
        } else if (this.fallColumns && this.refreshSweep) {
          this.dropColumns(this.columnsToFall);
          this.refreshSweep = false;
        }
      } else if (this.dropBlocks && this.numRowsDrop > 0) {
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
      } else if (this.blocksFalling) {
        if (this.refreshSweep) {
          let changeDetected = false;
          for (let y = config.game.rows - 2; y >= 0; y--) {
            for (let x = 0; x < config.game.cols; x++) {
              const block = this.board[x][y];
              if (block.color === 'orange' && this.board[x][y + 1].color === 'black') {
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
      } else if (this.mochi.updateBoard(this.board, this.sheet, this.direction)) {
        this.sweepForMatches();

        if (this.matches.length) {
          this.clearMatches = true;
        } else {
          this.runningScore += 10;
          this.score.text = this.runningScore.toString().padStart(7, '0');
          this.mochi = this.nextMochi;
          if (!this.game.onlineGameId) {
            this.nextMochi = new Mochi(2, 0);
          } else {
            this.nextMochi = new Mochi(2, 0, this.game.onlineBlocks[this.blockCtr++], this.game.onlineBlocks[this.blockCtr++]);
          }

          this.nextMochiBlocks[0].texture = this.sheet.textures[this.nextMochi.block2.color];
          this.nextMochiBlocks[1].texture = this.sheet.textures[this.nextMochi.block1.color];

          if (!this.blocksFalling && this.mochi.collidesBoard(this.board)) {
            this.game.setState('gameover', { score: this.runningScore });
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
        const x = match[0];
        this.board[match[0]][match[1]].texture = this.sheet.textures['black'];
        this.board[match[0]][match[1]].color = 'black';
        this.board[match[0]][match[1]].locked = false;
        columnsToFall[x] = true;
      }
    }
    for (const [key, col] of Object.entries(columnsToFall)) {
      this.columnsToFall.push(key);
    }
  }

  checkAdjacentBlocks(x, y, color, matchingBlocks, beenChecked) {
    if (beenChecked[`${x}-${y}`] || color === 'orange') return;

    const currentBlockColor = this.board[x][y].color;
    beenChecked[`${x}-${y}`] = true;

    if (currentBlockColor === color) {
      matchingBlocks.push([x, y]);
    } else {
      return;
    }

    // top
    if (y - 1 > 0 && this.board[x][y - 1].color !== 'black' && !beenChecked[`${x}-${y-1}`]) {
      this.checkAdjacentBlocks(x, (y - 1), color, matchingBlocks, beenChecked);
    }

    // left
    if (x - 1 > 0 && this.board[x - 1][y].color !== 'black' && !beenChecked[`${x-1}-${y}`]) {
      this.checkAdjacentBlocks((x - 1), y, color, matchingBlocks, beenChecked);
    }

    // right
    if (x + 1 < config.game.cols && this.board[x + 1][y].color !== 'black' && !beenChecked[`${x+1}-${y}`]) {
      this.checkAdjacentBlocks((x + 1), y, color, matchingBlocks, beenChecked);
    }

    // bottom
    if (y + 1 < config.game.rows && this.board[x][y + 1].color !== 'black' && !beenChecked[`${x}-${y+1}`]) {
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

    const streakBlocks = {};

    for (let x = 0; x < config.game.cols; x++) {
      for (let y = 0; y < config.game.rows; y++) {
        const currentColor = this.board[x][y].color;
        let beenChecked = {};
        if (!streakBlocks[`${x}-${y}`] && currentColor !== 'black' && currentColor != 'orange') {
          const streak = this.checkAdjacentBlocks(x, y, currentColor, [], beenChecked);

          if (streak.length > 3) {
            this.matches.push(streak);
            for (const temp of streak) {
              streakBlocks[`${temp[0]}-${temp[1]}`] = true;
              const ghostBlocks = this.getGhostBlocks(temp[0], temp[1]);
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
      this.moveLeft();
      this.direction = 'left';
    } else if (this.game.key.right.trigger()) {
      this.moveRight();
      this.direction = 'right';
    } else if (this.game.key.up.trigger()) {
      this.rotate();
    } else if (!this.gameOver && this.frameCtr > config.game.fallSpeed) {
      this.mochi.updatePosition(0, 1, 'down');
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