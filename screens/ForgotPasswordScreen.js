import React, { useContext, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ApplicationContext } from '../ApplicationContext';
import { errorCodeMessages } from '../constants/errorCodeMessages';
import colors from '../helpers/colors';
import banner from '../helpers/banner';
import ActionButton from '../components/ActionButton';
import api from '../helpers/api';

const ForgotPasswordScreen = ({ navigation }) => {

  const [isLoading, setIsLoading] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState();

  const onBackTapped = async () => {
    navigation.goBack();
  };

  const onSendPasswordResetEmailTapped = async () => {
    try {
      setIsLoading(true);
      const response = await api.sendPasswordResetEmail(emailOrPhone);
      let responseJson = await response.json();
      if (responseJson && responseJson.success) {
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
    <View style={styles.container}>
      <View style={styles.headerView}>
        <View style={styles.titleView}>
          <Pressable onPress={onBackTapped} hitSlop={20}>
            <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={colors.white.hexCode} />
          </Pressable>
          <Text style={styles.title}>Forgot Password</Text>
          <View style={styles.placeholderIcon} />
        </View>
      </View>
      <View style={styles.inputsView}>
        <View style={styles.inputView}>
          <TextInput style={styles.input} placeholder={'Email or phone..'} placeholderTextColor={colors.darkGray.hexCode} maxLength={50} keyboardType='email-address' textContentType='username' autoCapitalize='none' onChangeText={onEmailOrPhoneChangeText} />
        </View>
        <ActionButton iconImageSource={require('../assets/images/gear-gray.png')} text={'Send password reset email'} color={colors.lightGreen} disabled={isLoading} onTapped={() => onSendPasswordResetEmailTapped()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray.hexCode,
  },
  headerView: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.darkGray.hexCode,
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
    color: colors.white.hexCode
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
  inputsView: {
    flex: 1,
    padding: 20,
  },
  inputView: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 30,
    backgroundColor: colors.whiteGray.hexCode,
  },
  input: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.darkGray.hexCode
  },
});

export default ForgotPasswordScreen;