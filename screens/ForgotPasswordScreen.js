import React, { useContext, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ApplicationContext } from '../ApplicationContext';
import { errorCodeMessages } from '../constants/errorCodeMessages';
import banner from '../helpers/banner';
import ActionButton from '../components/ActionButton';
import api from '../helpers/api';
import analytics from '../helpers/analytics';
const ForgotPasswordScreen = ({ navigation }) => {

  const { themer } = useContext(ApplicationContext);

  const [isLoading, setIsLoading] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState();

  const onBackTapped = async () => {
    navigation.goBack();
  };

  const onSendPasswordResetEmailTapped = async () => {
    try {
      setIsLoading(true);
      const response = await api.sendPasswordResetEmail(emailOrPhone);
      if (!response?.ok) { throw new Error(`HTTP error with status ${response?.status}`); }
      let responseJson = await response.json();
      if (responseJson && responseJson.success) {
        analytics.logEvent('password_reset_email_sent');
        console.log(`ForgotPasswordScreen.js -> onSubmitTapped: Password reset email sent. Going back to Login screen..`);
        navigation.goBack();
        banner.showSuccessMessage('Email sent. Please check your email to continue resetting the password.');
      } else {
        console.log(responseJson);
        banner.showErrorMessage(responseJson?.error_code ? 'Password reset email failed: ' + errorCodeMessages[responseJson.error_code] : 'Password reset email failed with unknown error.');
      }
      setIsLoading(false);
    } catch(error) {
      const errorMessage = 'Password reset email failed with error: ' + error.message;
      console.error('ForgotPasswordScreen.js -> onSubmitTapped: ' + errorMessage);
      banner.showErrorMessage(errorMessage);
      setIsLoading(false);
    }
  };

  const onEmailOrPhoneChangeText = async (text) => {
    setEmailOrPhone(text);
  };

  return (
    <View style={[styles.container, { backgroundColor: themer.getColor('background1') }]}>
      <View style={[styles.headerView, { backgroundColor: themer.getColor('screenHeader1.background') } ]}>
        <View style={styles.titleView}>
          <Pressable onPress={onBackTapped} hitSlop={20}>
            <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={themer.getColor('screenHeader1.foreground')} />
          </Pressable>
          <Text style={[styles.title, { color: themer.getColor('screenHeader1.foreground') }]}>Forgot Password</Text>
          <View style={styles.placeholderIcon} />
        </View>
      </View>
      <View style={styles.formView}>
        <View style={styles.inputsView}>
          <View style={[styles.inputView, { backgroundColor: themer.getColor('textInput1.background') }]}>
            <TextInput style={[styles.input, { color: themer.getColor('textInput1.foreground') }]} placeholder={'Email or phone..'} placeholderTextColor={themer.getPlaceholderTextColor('textInput1.foreground')} maxLength={50} keyboardType='email-address' textContentType='username' autoCapitalize='none' onChangeText={onEmailOrPhoneChangeText} />
          </View>
        </View>
        <ActionButton iconImageSource={require('../assets/images/gear-gray.png')} text={'Send password reset email'} foregroundColor={themer.getColor('button2.foreground')} backgroundColor={themer.getColor('button2.background')} disabled={isLoading} onTapped={() => onSendPasswordResetEmailTapped()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerView: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 17.5,
  },
  titleView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backIcon: {
    height: 25,
    width: 25,
    marginTop: 2,
  },
  placeholderIcon: {
    height: 25,
    width: 25,
    marginTop: 2,
  },
  formView: {
    flex: 1,
    padding: 20,
  },
  inputsView: {
    marginBottom: 10,
  },
  inputView: {
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 20 : 10,
    borderRadius: 30,
    marginBottom: 10,
  },
  input: {
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;