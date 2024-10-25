import React, { useContext, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { showMessage } from "react-native-flash-message";
import { ApplicationContext } from '../ApplicationContext';
import { errorCodeMessages } from '../constants/errorCodeMessages';
import colors from '../helpers/colors';
import ActionButton from '../components/ActionButton';

const LoginScreen = ({ navigation }) => {
  
  const { loginWithCredentials } = useContext(ApplicationContext);

  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState(true);

  const onBackTapped = async () => {
    navigation.goBack();
  };

  const onLoginTapped = async () => {
    try {
      setIsLoading(true);
      const responseJson = await loginWithCredentials(credentials?.emailOrPhone, credentials?.password);
      if (responseJson && responseJson.success && responseJson.user) {
        console.log(`LoginScreen.js -> onLoginTapped: User logged in. Going back to Settings screen..`);
        navigation.goBack();
      } else {
        showErrorMessage(responseJson?.error_code ? 'Login failed: ' + errorCodeMessages[responseJson.error_code] : 'Login failed with unknown error.');
      }
      setIsLoading(false);
    } catch(error) {
      const errorMessage = 'Login failed with error: ' + error.message;
      console.error('LoginScreen.js -> onLoginTapped: ' + errorMessage);
      showErrorMessage(errorMessage);
      setIsLoading(false);
    }
  };

  const onForgotPasswordTapped = async () => {
    navigation.navigate('ForgotPassword');
  };

  const onEmailOrPhoneChangeText = async (text) => {
    setCredentials({ ...credentials, emailOrPhone: text });
  };

  const onPasswordChangeText = async (text) => {
    setCredentials({ ...credentials, password: text });
  };

  const showErrorMessage = (message) => {
    showMessage({
      message: message,
      backgroundColor: colors.lightRed.hexCode,
      titleStyle: {
        fontWeight: 'bold',
        color: 'black',
        opacity: 0.60,
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerView}>
        <View style={styles.titleView}>
          <Pressable onPress={onBackTapped} hitSlop={20}>
            <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={colors.white.hexCode} />
          </Pressable>
          <Text style={styles.title}>Login</Text>
          <View style={styles.placeholderIcon} />
        </View>
      </View>
      <View style={styles.inputsView}>
        <View style={styles.inputView}>
          <TextInput style={styles.input} placeholder={'Email or phone..'} placeholderTextColor={colors.darkGray.hexCode} maxLength={50} keyboardType='email-address' textContentType='username' autoCapitalize='none' onChangeText={onEmailOrPhoneChangeText} />
        </View>
        <View style={styles.inputView}>
          <TextInput style={styles.input} placeholder={'Password..'} placeholderTextColor={colors.darkGray.hexCode} maxLength={100} secureTextEntry={true} textContentType='password' onChangeText={onPasswordChangeText} />
        </View>
        <ActionButton iconImageSource={require('../assets/images/user.png')} text={'Login'} color={colors.lightGreen} disabled={isLoading} onTapped={() => onLoginTapped()} />
        <ActionButton iconImageSource={require('../assets/images/gear-gray.png')} text={'Forgot Password'} color={colors.gray} onTapped={() => onForgotPasswordTapped()} />
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

export default LoginScreen;