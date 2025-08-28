import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import storage from '../helpers/storage';
import { featureAlertTypes } from '../constants/featureAlertTypes';

const FeatureAlertsView = ({ themer, user, onAlertDismissed, onActionTapped }) => {
  const [alerts, setAlerts] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const [keyboardDismissed, widgetDismissed] = await Promise.all([
        storage.getIsFeatureAlertDismissed(featureAlertTypes.KEYBOARD),
        storage.getIsFeatureAlertDismissed(featureAlertTypes.WIDGET)
      ]);

      const availableAlerts = [];

      // Keyboard installation alert
      if (!keyboardDismissed) {
        availableAlerts.push({
          id: featureAlertTypes.KEYBOARD,
          type: featureAlertTypes.KEYBOARD,
          title: '⌨️ Install Custom Keyboard',
          description: 'Get the full Snippeta experience with our custom keyboard!',
          actionText: 'Learn More',
          actionScreen: 'Keyboard',
          icon: '⌨️'
        });
      }

      // Widget installation alert
      if (!widgetDismissed) {
        availableAlerts.push({
          id: featureAlertTypes.WIDGET,
          type: featureAlertTypes.WIDGET,
          title: '📱 Add Home Screen Widget',
          description: 'Quick access to your snippets right from your home screen!',
          actionText: 'Learn More',
          actionScreen: 'Widget',
          icon: '📱'
        });
      }

      setAlerts(availableAlerts);
      setIsLoading(false);
    } catch (error) {
      console.error('FeatureAlertsView: Error loading alerts:', error);
      setIsLoading(false);
    }
  };

  const handleDismiss = async (alertId) => {
    try {
      await storage.saveIsFeatureAlertDismissed(alertId, true);
      
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      onAlertDismissed?.(alertId);
    } catch (error) {
      console.error('FeatureAlertsView: Error dismissing alert:', error);
    }
  };

  const handleAction = (alert) => {
    onActionTapped?.(alert);
  };

  if (isLoading || alerts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {alerts.map((alert) => (
        <View key={alert.id} style={[styles.alertContainer, { backgroundColor: themer.getColor('content2.background') }]} onTapped={() => handleAction(alert)}>
          <View style={styles.alertHeader}>
            <Text style={[styles.alertTitle, { color: themer.getColor('content2.foreground') }]}>
              {alert.title}
            </Text>
            <Pressable
              onPress={() => handleDismiss(alert.id)}
              hitSlop={10}
              style={styles.dismissButton}
            >
            <Text style={[styles.dismissText, { color: themer.getColor('content2.foreground') }]}>✕</Text>
            </Pressable>
          </View>  
          <Text style={[styles.alertDescription, { color: themer.getColor('content2.foreground') }]}>
            {alert.description}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  alertContainer: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  dismissButton: {
    padding: 4,
    minWidth: 24,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  dismissText: {
    fontSize: 16,
    fontWeight: 'bold',
    opacity: 0.7,
  },
  alertDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
});

export default FeatureAlertsView;
