import {OneSignal, LogLevel} from 'react-native-onesignal';
import { appSettings } from '../constants/appSettings';

/**
 * OneSignal helper functions for push notifications
 */

/**
 * Initialize OneSignal with app ID and set up notification listeners
 * @param {string} appId - The OneSignal App ID
 * @param {Function} onNotificationClick - Callback for notification clicks
 * @param {Function} onForegroundWillDisplay - Callback for foreground notifications
 */
export const initialize = (appId, onNotificationClick, onForegroundWillDisplay) => {
  try {
    OneSignal.Debug.setLogLevel(LogLevel.Warn);
    OneSignal.initialize(appId);
    console.log('OneSignal: Initialized with app ID and log level:', appId, LogLevel.Warn);
    setupNotificationListeners(onNotificationClick, onForegroundWillDisplay);
    OneSignal.Notifications.requestPermission(true)
  } catch (error) {
    console.error('OneSignal: Error initializing:', error);
  }
};

/**
 * Login user to OneSignal and set user tags
 * @param {string} userId - The user ID to login with
 * @param {Object} tags - Object with key-value pairs for user tags
 */
export const loginUser = async (userId, tags = {}) => {
  try {
    OneSignal.login(userId);
    console.log('OneSignal: Logged in user:', userId);
    
    // Set user tags if provided
    if (Object.keys(tags).length > 0) {
      await setUserTags(tags);
    }
  } catch (error) {
    console.error('OneSignal: Error logging in user:', error);
  }
};

/**
 * Logout user from OneSignal
 */
export const logoutUser = () => {
  try {
    OneSignal.logout();
    console.log('OneSignal: Logged out user');
  } catch (error) {
    console.error('OneSignal: Error logging out user:', error);
  }
};

/**
 * @param {string} key - The tag key
 * @param {string} value - The tag value
 */
export const setUserTag = async (key, value) => {
  try {
    await OneSignal.User.addTag(key, value);
    console.log(`OneSignal: Set tag ${key} = ${value}`);
  } catch (error) {
    console.error('OneSignal: Error setting tag:', error);
  }
};

/**
 * Remove a tag from OneSignal
 * @param {string} key - The tag key to remove
 */
export const removeUserTag = async (key) => {
  try {
    await OneSignal.User.removeTag(key);
    console.log(`OneSignal: Removed tag ${key}`);
  } catch (error) {
    console.error('OneSignal: Error removing tag:', error);
  }
};

/**
 * Set multiple tags at once
 * @param {Object} tags - Object with key-value pairs
 */
export const setUserTags = async (tags) => {
  try {
    await OneSignal.User.addTags(tags);
    console.log('OneSignal: Set multiple tags:', tags);
  } catch (error) {
    console.error('OneSignal: Error setting tags:', error);
  }
};

/**
 * Set user properties for personalization
 * @param {Object} properties - User properties object
 */
export const setUserProperties = async (properties) => {
  try {
    await OneSignal.User.addProperties(properties);
    console.log('OneSignal: Set user properties:', properties);
  } catch (error) {
    console.error('OneSignal: Error setting user properties:', error);
  }
};

/**
 * Request notification permission
 * @returns {Promise<boolean>} - Whether permission was granted
 */
export const requestNotificationPermission = async () => {
  try {
    const permission = await OneSignal.Notifications.requestPermission(true);
    console.log('OneSignal: Notification permission:', permission);
    return permission;
  } catch (error) {
    console.error('OneSignal: Error requesting permission:', error);
    return false;
  }
};

/**
 * Check if notifications are enabled
 * @returns {Promise<boolean>} - Whether notifications are enabled
 */
export const areNotificationsEnabled = async () => {
  try {
    const enabled = await OneSignal.Notifications.hasPermission();
    console.log('OneSignal: Notifications enabled:', enabled);
    return enabled;
  } catch (error) {
    console.error('OneSignal: Error checking notification status:', error);
    return false;
  }
};

/**
 * Get the OneSignal player ID
 * @returns {Promise<string>} - The player ID
 */
export const getPlayerId = async () => {
  try {
    const deviceState = await OneSignal.User.getOnesignalId();
    console.log('OneSignal: Player ID:', deviceState);
    return deviceState;
  } catch (error) {
    console.error('OneSignal: Error getting player ID:', error);
    return null;
  }
};

/**
 * Set up notification event listeners (internal helper function)
 * @param {Function} onNotificationClick - Callback for notification clicks
 * @param {Function} onForegroundWillDisplay - Callback for foreground notifications
 */
const setupNotificationListeners = (onNotificationClick, onForegroundWillDisplay) => {
  try {
    // Notification click listener
    OneSignal.Notifications.addEventListener('click', (event) => {
      console.log('OneSignal: Notification clicked:', event);
      if (onNotificationClick) {
        onNotificationClick(event);
      }
    });

    // Foreground notification listener
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
      console.log('OneSignal: Notification will display in foreground:', event);
      if (onForegroundWillDisplay) {
        onForegroundWillDisplay(event);
      }
    });

    console.log('OneSignal: Event listeners set up successfully');
  } catch (error) {
    console.error('OneSignal: Error setting up event listeners:', error);
  }
};

/**
 * Send a test notification (for development)
 * Note: This requires OneSignal REST API access
 */
export const sendTestNotification = async (message, userId = null) => {
  try {
    // This would typically be done from your backend
    // For now, we'll just log the intent
    console.log('OneSignal: Would send test notification:', { message, userId });
  } catch (error) {
    console.error('OneSignal: Error sending test notification:', error);
  }
};

export default {
  initialize,
  loginUser,
  logoutUser,
  setUserTag,
  removeUserTag,
  setUserTags,
  setUserProperties,
  requestNotificationPermission,
  areNotificationsEnabled,
  getPlayerId,
  sendTestNotification,
};
