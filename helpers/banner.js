import { Image, Platform, StyleSheet } from 'react-native';
import { showMessage, hideMessage } from "react-native-flash-message";
import { colors } from '../constants/colors';

const statusBarHeight = Platform.OS === 'ios' ? 50 : 10;

const showSuccessMessage = async (message, description, duration) => {
  showMessage({
    message: message,
    description: description,
    duration: duration ?? 5000,
    icon: { icon: () => <Image source={require('../assets/images/checkmark.png')} style={styles.messageIcon} tintColor={colors.lightGreen} />, position: 'right' },
    backgroundColor: colors.white,
    titleStyle: { fontWeight: 'bold', color: colors.darkGray, },
    textStyle: { fontStyle: 'italic', color: colors.darkGray, },
    statusBarHeight: statusBarHeight,
  });
};

const showErrorMessage = async (message, duration) => {
  showMessage({
    message: message,
    duration: duration ?? 5000,
    backgroundColor: colors.lightRed,
    titleStyle: { fontWeight: 'bold', color: colors.darkGray, },
    statusBarHeight: statusBarHeight,
  });
};

const showStatusMessage = async (message, duration, animated) => {
  showMessage({
    message: message,
    hideOnPress: false,
    duration: duration,
    autoHide: duration ? true : false,
    floating: true,
    position: { bottom: 50, },
    animated: animated,
    backgroundColor: colors.white,
    titleStyle: { fontWeight: 'bold', color: colors.darkGray, },
    statusBarHeight: statusBarHeight,
  });
};

const styles = StyleSheet.create({
  messageIcon: {
    height: 20,
    width: 20,
    color: colors.darkGray,
  },
});

export default {
  showSuccessMessage,
  showErrorMessage,
  showStatusMessage,
  hideMessage,
};
