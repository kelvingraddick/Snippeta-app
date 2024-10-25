class Color {
  constructor(hexCode, id) {
    this.hexCode = hexCode;
    this.id = id;
  }

  toString() {
    return `${this.hexCode}`;
  };
}

const colors = {
  white: new Color('#fff', 0),
  black: new Color('#000', null),
  gray: new Color('#dfdfdf', null),
  darkGray: new Color('#1d2027', null),
  whiteGray: new Color('#f5f5f5', null),
  lightGray: new Color('#f7f7f7', 6),
  lightYellow: new Color('#fad275', 1),
  lightGreen: new Color('#a9cc8e', 4),
  lightBlue: new Color('#3098c5', 2),
  lightPurple: new Color('#986b9b', 5),
  lightRed: new Color('#fb7477', 3),
  nebulaBlue: new Color('#5c63ff', null),
  turquoise: new Color('#33d9b1', null),
}

const getById = (id) => {
  return Object.keys(colors).map(key => colors[key]).find(color => color.id == id);
}

export default {
  ...colors,
  getById
};