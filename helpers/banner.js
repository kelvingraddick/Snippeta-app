import { Image, StyleSheet } from 'react-native';
import { showMessage } from "react-native-flash-message";
import { colors } from '../constants/colors';

const showSuccessMessage = async (message, description) => {
  showMessage({
    message: message,
    description: description,
    icon: { icon: () => <Image source={require('../assets/images/checkmark.png')} style={styles.messageIcon} tintColor={colors.lightGreen} />, position: 'right' },
    backgroundColor: colors.white,
    titleStyle: { fontWeight: 'bold', color: colors.darkGray, },
    textStyle: { fontStyle: 'italic', color: colors.darkGray, },
    statusBarHeight: 50,
  });
};

const showErrorMessage = async (message) => {
  showMessage({
    message: message,
    backgroundColor: colors.lightRed,
    titleStyle: { fontWeight: 'bold', color: colors.darkGray, },
    statusBarHeight: 50,
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
};
