const isLight = function (hexCode) {
  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  };

  // Calculate luminance
  const luminance = (r, g, b) => {
    const srgb = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return srgb[0] * 0.2126 + srgb[1] * 0.7152 + srgb[2] * 0.0722;
  };

  // Calculate contrast ratio
  const contrastRatio = (lum1, lum2) => {
    return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
  };

  // Get RGB from hex and calculate luminance of background
  const [r, g, b] = hexToRgb(hexCode);
  const bgLuminance = luminance(r, g, b);

  // Test both white and black text colors
  const whiteLuminance = luminance(255, 255, 255);
  const blackLuminance = luminance(0, 0, 0);

  const whiteContrast = contrastRatio(bgLuminance, whiteLuminance);
  const blackContrast = contrastRatio(bgLuminance, blackLuminance);

  // Return if the color is light
  return whiteContrast < 4.5;
}

export default {
  isLight,
};