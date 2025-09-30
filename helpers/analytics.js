import { getAnalytics, logEvent, logScreenView, setUserProperty, setUserId, resetAnalyticsData, setAnalyticsCollectionEnabled } from '@react-native-firebase/analytics';

class AnalyticsHelper {
  constructor() {
    this.isEnabled = true;
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    setAnalyticsCollectionEnabled(getAnalytics(), enabled);
  }

  async logScreenView(screenName, screenClass = null) {
    if (!this.isEnabled) return;
    
    try {
      await logEvent(getAnalytics(), 'screen_view', {
        firebase_screen: screenName, 
        firebase_screen_class: screenClass || screenName,
      });
      console.log(`anayltics.js -> AnalyticsHelper -> logScreenView: Screen view logged - ${screenName}`);
    } catch (error) {
      console.error('anayltics.js -> AnalyticsHelper -> logScreenView: Failed to log screen view:', error);
    }
  }

  async logEvent(eventName, parameters = {}) {
    if (!this.isEnabled) return;
    
    try {
      await logEvent(getAnalytics(), eventName, parameters);
      console.log(`anayltics.js -> AnalyticsHelper -> logEvent: Event logged - ${eventName}`, parameters);
    } catch (error) {
      console.error('anayltics.js -> AnalyticsHelper -> logEvent: Failed to log event:', error);
    }
  }

  async setUserProperty(name, value) {
    if (!this.isEnabled) return;
    
    try {
      await setUserProperty(getAnalytics(), name, value);
      console.log(`anayltics.js -> AnalyticsHelper -> setUserProperty: User property set - ${name}: ${value}`);
    } catch (error) {
      console.error('anayltics.js -> AnalyticsHelper -> setUserProperty: Failed to set user property:', error);
    }
  }

  async setUserProperties(properties) {
    if (!this.isEnabled) return;
    
    try {
      for (const [name, value] of Object.entries(properties)) {
        await setUserProperty(getAnalytics(), name, value);
        console.log(`anayltics.js -> AnalyticsHelper -> setUserProperty: User property set - ${name}: ${value}`);
      }
    } catch (error) {
      console.error('anayltics.js -> AnalyticsHelper -> setUserProperties: Failed to set user properties:', error);
    }
  }

  async setUserId(userId) {
    if (!this.isEnabled) return;
    
    try {
      await setUserId(getAnalytics(), userId);
      console.log(`anayltics.js -> AnalyticsHelper -> setUserId: User ID set - ${userId}`);
    } catch (error) {
      console.error('anayltics.js -> AnalyticsHelper -> setUserId: Failed to set user ID:', error);
    }
  }

  async resetAnalyticsData() {
    if (!this.isEnabled) return;
    
    try {
      await resetAnalyticsData(getAnalytics());
      console.log('anayltics.js -> AnalyticsHelper -> resetAnalyticsData: Analytics data reset');
    } catch (error) {
      console.error('anayltics.js -> AnalyticsHelper -> resetAnalyticsData: Failed to reset analytics data:', error);
    }
  }
}

export default new AnalyticsHelper();
