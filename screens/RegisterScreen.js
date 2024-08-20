import React, { useContext, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { showMessage } from "react-native-flash-message";
import { ApplicationContext } from '../ApplicationContext';
import { errorCodeMessages } from '../constants/errorCodeMessages';
import api from '../helpers/api';
import colors from '../helpers/colors';
import ActionButton from '../components/ActionButton';

const RegisterScreen = ({ navigation }) => {

  const { loginWithCredentials } = useContext(ApplicationContext);

  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({});

  const onBackTapped = async () => {
    navigation.goBack();
  };

  const onRegisterTapped = async () => {
    try {
      setIsLoading(true);
      if (user.password != user.password_confirm) {
        throw new Error('Password confirmation must match the password entered.');
      }
      const response= await api.register(user);
      let responseJson = await response.json();
      if (responseJson && responseJson.success && responseJson.user) {
        console.log(`RegisterScreen.js -> onRegisterTapped: User registered with email address ${user.email_address}. Now logging user in..`);
        responseJson = await loginWithCredentials(user.email_address, user.password);
        if (responseJson && responseJson.success && responseJson.user) {
          console.log(`RegisterScreen.js -> onRegisterTapped: User logged in. Going back to Settings screen..`);
          navigation.goBack();
        } else {
          showErrorMessage(responseJson?.error_code ? 'Login failed: ' + errorCodeMessages[responseJson.error_code] : 'Login failed with unknown error.');
        }
      } else {
        showErrorMessage(responseJson?.error_code ? 'Registration failed: ' + errorCodeMessages[responseJson.error_code] : 'Registration failed with unknown error.');
      }
      setIsLoading(false);
    } catch(error) {
      const errorMessage = 'Registration failed with error: ' + error.message;
      console.error('RegisterScreen.js -> onRegisterTapped: ' + errorMessage);
      showErrorMessage(errorMessage);
      setIsLoading(false);
    }
  };

  const onEmailAddressChangeText = async (text) => {
    setUser({ ...user, email_address: text });
  };

  const onPhoneNumberChangeText = async (text) => {
    setUser({ ...user, phone_number: text });
  };

  const onPasswordChangeText = async (text) => {
    setUser({ ...user, password: text });
  };

  const onPasswordConfirmChangeText = async (text) => {
    setUser({ ...user, password_confirm: text });
  };

  const onFirstNameChangeText = async (text) => {
    setUser({ ...user, first_name: text });
  };

  const onLastNameChangeText = async (text) => {
    setUser({ ...user, last_name: text });
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
          <Text style={styles.title}>Register</Text>
          <View style={styles.placeholderIcon} />
        </View>
      </View>
      <View style={styles.inputsView}>
        <View style={styles.inputView}>
          <TextInput style={styles.input} placeholder={'Email address..'} placeholderTextColor={colors.darkGray.hexCode} maxLength={50} keyboardType='email-address' autoCapitalize='none' onChangeText={onEmailAddressChangeText} />
        </View>
        <View style={styles.inputView}>
          <TextInput style={styles.input} placeholder={'Phone number..'} placeholderTextColor={colors.darkGray.hexCode} maxLength={50} keyboardType='phone-pad' autoCapitalize='none' onChangeText={onPhoneNumberChangeText} />
        </View>
        <View style={styles.inputView}>
          <TextInput style={styles.input} placeholder={'First name..'} placeholderTextColor={colors.darkGray.hexCode} maxLength={50} keyboardType='default' autoCapitalize='words' onChangeText={onFirstNameChangeText} />
        </View>
        <View style={styles.inputView}>
          <TextInput style={styles.input} placeholder={'Last name..'} placeholderTextColor={colors.darkGray.hexCode} maxLength={50} keyboardType='default' autoCapitalize='words' onChangeText={onLastNameChangeText} />
        </View>
        <View style={styles.inputView}>
          <TextInput style={styles.input} placeholder={'Password..'} placeholderTextColor={colors.darkGray.hexCode} maxLength={100} secureTextEntry={true} onChangeText={onPasswordChangeText} />
        </View>
        <View style={styles.inputView}>
          <TextInput style={styles.input} placeholder={'Password confirm..'} placeholderTextColor={colors.darkGray.hexCode} maxLength={100} secureTextEntry={true} onChangeText={onPasswordConfirmChangeText} />
        </View>
        <ActionButton iconImageSource={require('../assets/images/user.png')} text={'Register'} color={colors.turquoise} disabled={isLoading} onTapped={() => onRegisterTapped()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white.hexCode,
  },
  headerView: {
    padding: 20,
    paddingTop: 60,
    borderRadius: 30,
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
    backgroundColor: colors.lightYellow.hexCode,
  },
  input: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.darkGray.hexCode
  },
});

export default RegisterScreen;