import { TextStyle, Text, Graphics } from 'pixi.js';

import config from './config';

export const basicTextStyle = new TextStyle({
  fontFamily: 'Arial',
  fontSize: Math.floor(config.display.blockSize / 3),
  fill: 0xffffff,
  align: 'right'
});

export const makeButton = (text) => {
  const buttonWidth = config.display.blockSize * 3;
  const buttonHeight = Math.floor(config.display.blockSize);

  var txt = new Text(text, basicTextStyle);
  txt.anchor.set(.5, .5);
  txt.position.set(buttonWidth / 2, buttonHeight / 2);

  const box = new Graphics();
  box.beginFill(0x3496eb, 1);
  box.lineStyle(2, 0xffffff);
  box.drawRect(0, 0, buttonWidth, buttonHeight);
  box.endFill();

  box.addChild(txt);

  box.interactive = true;

  return box;
}

export default {
  basicTextStyle,
  makeButton
};