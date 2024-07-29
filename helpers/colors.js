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
  darkGray: new Color('#1d2027', null),
  whiteGray: new Color('#f5f5f5', null),
  lightGray: new Color('#f7f7f7', 6),
  lightYellow: new Color('#feeaa6', 1),
  lightGreen: new Color('#e9fdd0', 4),
  lightBlue: new Color('#e9f4fe', 2),
  lightPurple: new Color('#f4e8fe', 5),
  lightRed: new Color('#fdeae9', 3),
  nebulaBlue: new Color('#5c63ff', null),
}

const getById = (id) => {
  return Object.keys(colors).map(key => colors[key]).find(color => color.id == id);
}

export default {
  ...colors,
  getById
};