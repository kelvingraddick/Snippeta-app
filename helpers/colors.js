class Color {
  constructor(hexCode) {
    this.hexCode = hexCode;
  }

  toString() {
    return `${this.hexCode}`;
  };
}

const colors = {
  white: new Color('#fff'),
  black: new Color('#000'),
  gray: new Color('#dfdfdf'),
  darkGray: new Color('#1d2027'),
  whiteGray: new Color('#f5f5f5'),
  lightGray: new Color('#f7f7f7'),
  lightYellow: new Color('#fad275'),
  lightGreen: new Color('#a9cc8e'),
  lightBlue: new Color('#3098c5'),
  lightPurple: new Color('#986b9b'),
  lightRed: new Color('#fb7477'),
  nebulaBlue: new Color('#5c63ff'),
}

export default {
  ...colors,
};