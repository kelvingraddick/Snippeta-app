import { NativeModules, Platform } from 'react-native';

const { KeyboardNativeModule } = NativeModules;

/**
 * Check if the Snippeta custom keyboard is installed and enabled
 * @returns {Promise<boolean>} True if keyboard is installed, false otherwise
 */
export const isKeyboardInstalled = async () => {
  try {
    if (!KeyboardNativeModule) {
      console.error('KeyboardNativeModule native module not available');
      return false;
    }
    
    const isInstalled = await KeyboardNativeModule.isKeyboardInstalled();
    console.log(`Keyboard detection: Keyboard is ${isInstalled ? 'installed' : 'not installed'}`);
    return isInstalled;
  } catch (error) {
    console.error('Error checking keyboard installation:', error);
    return false;
  }
}
