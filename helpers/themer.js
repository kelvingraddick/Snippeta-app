import { useColorScheme } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import { themes } from "../constants/themes";
import { colors } from "../constants/colors";
import { appearanceModes } from "../constants/appearanceModes";
import { themeAppearances } from "../constants/themeAppearances";

export const useThemer = (initialThemeId, initialAppearanceMode) => {
  const DEFAULT_THEME_ID = Object.keys(themes)[0];
  const systemThemeAppearance = useColorScheme();

  const [themeId, setThemeId] = useState(initialThemeId || DEFAULT_THEME_ID);
  const [appearanceMode, setAppearanceMode] = useState(initialAppearanceMode);
  const themeAppearance = (appearanceMode === appearanceModes.SYSTEM) ? (systemThemeAppearance || themeAppearances.LIGHT) : appearanceMode;

  const getCurrentTheme = useMemo(() => {
    const currentTheme = themes[themeId];
    return (
      currentTheme?.[themeAppearance] ??
      currentTheme?.[themeAppearances.LIGHT] ??
      currentTheme?.[themeAppearances.DARK] ??
      currentTheme
    );
  }, [themeId, themeAppearance]);

  const getDefaultTheme = useMemo(() => {
    const defaultTheme = themes[DEFAULT_THEME_ID];
    return (
      defaultTheme?.[themeAppearance] ??
      defaultTheme?.[themeAppearances.LIGHT] ??
      defaultTheme?.[themeAppearances.DARK] ??
      defaultTheme
    );
  }, [DEFAULT_THEME_ID, themeAppearance]);

  const getName = () => themes[themeId]?.name ?? themes[DEFAULT_THEME_ID]?.name ?? 'Undefined';

  const getColor = (key) => getCurrentTheme?.colors?.[key] ?? getDefaultTheme?.colors?.[key] ?? colors.black;

  const getPlaceholderTextColor = (key) => getColor(key) + 'BF'; // 75% opacity

  const getColors = () => getCurrentTheme?.colors ?? getDefaultTheme?.colors ?? {};

  const getOpacity = (key) => getCurrentTheme?.opacities?.[key] ?? getDefaultTheme?.opacities?.[key] ?? 1;

  return {
    themeId,
    appearanceMode,
    themeAppearance,
    setThemeId,
    setAppearanceMode,
    getName,
    getColor,
    getPlaceholderTextColor,
    getColors,
    getOpacity,
  };
};