import { themes } from "../constants/themes";
import { colors } from "../constants/colors";

class Themer {
  DEFAULT_THEME_ID = Object.keys(themes)[0];

  constructor(themeId) {
    this.themeId = themeId;
  }

  getName() {
    return themes[this.themeId]?.name ?? themes[this.DEFAULT_THEME_ID]?.name ?? 'Undefined';
  }

  getColor(key) {
    return themes[this.themeId]?.colors?.[key] ?? themes[this.DEFAULT_THEME_ID]?.colors?.[key] ?? colors.black;
  }

  getColors() {
    return themes[this.themeId]?.colors ?? themes[this.DEFAULT_THEME_ID]?.colors ?? {};
  }

  getOpacity(key) {
    return themes[this.themeId]?.opacities?.[key] ?? themes[this.DEFAULT_THEME_ID]?.opacities?.[key] ?? 1;
  }
}

export default Themer;