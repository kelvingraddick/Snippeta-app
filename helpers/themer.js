import { themes } from "../constants/themes";
import colors from "./colors";

class Themer {
  constructor(themeId) {
    this.themeId = themeId;
  }

  getName() {
    return themes[this.themeId]?.name ?? themes['default-light']?.name ?? 'Undefined';
  }

  getColor(key) {
    return themes[this.themeId]?.colors[key] ?? themes['default-light'].colors[key] ?? colors.black;
  }

  getColors() {
    return themes[this.themeId]?.colors ?? themes['default-light'].colors ?? {};
  }
}

export default Themer;