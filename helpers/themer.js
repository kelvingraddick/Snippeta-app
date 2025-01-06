import { themes } from "../constants/themes";
import { colors } from "../constants/colors";
import { themeAppearances } from "../constants/themeAppearances";

class Themer {
  DEFAULT_THEME_ID = Object.keys(themes)[0];

  constructor(themeId, themeAppearance) {
    this.themeId = themeId;
    this.themeAppearance = themeAppearance;
  }

  getCurrentTheme() {
    return themes[this.themeId]?.[this.themeAppearance] ?? themes[this.themeId]?.[themeAppearances.LIGHT] ?? themes[this.themeId]?.[themeAppearances.DARK] ?? themes[this.themeId];
  }

  getDefaultTheme() {
    return themes[this.DEFAULT_THEME_ID]?.[this.themeAppearance] ?? themes[this.DEFAULT_THEME_ID]?.[themeAppearances.LIGHT] ?? themes[this.DEFAULT_THEME_ID]?.[themeAppearances.DARK] ?? themes[this.DEFAULT_THEME_ID];
  }

  getName() {
    return this.getCurrentTheme()?.name ?? this.getDefaultTheme()?.name ?? 'Undefined';
  }

  getColor(key) {
    return this.getCurrentTheme()?.colors?.[key] ?? this.getDefaultTheme()?.colors?.[key] ?? colors.black;
  }

  getPlaceholderTextColor(key) {
    return this.getColor(key) + 'BF'; // 75% opacity
  }

  getColors() {
    return this.getCurrentTheme()?.colors ?? this.getDefaultTheme()?.colors ?? {};
  }

  getOpacity(key) {
    return this.getCurrentTheme()?.opacities?.[key] ?? this.getDefaultTheme()?.opacities?.[key] ?? 1;
  }
}

export default Themer;