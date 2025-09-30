import React, { useContext, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ApplicationContext } from '../ApplicationContext';
import { errorCodeMessages } from '../constants/errorCodeMessages';
import api from '../helpers/api';
import banner from '../helpers/banner';
import analytics from '../helpers/analytics';
import ActionButton from '../components/ActionButton';

const RegisterScreen = ({ navigation }) => {

  const { themer, loginWithCredentials } = useContext(ApplicationContext);

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
      const response = await api.register(user);
      if (!response?.ok) { throw new Error(`HTTP error with status ${response?.status}`); }
      let responseJson = await response.json();
      if (responseJson && responseJson.success && responseJson.user) {
        await analytics.logEvent('signup', { user_id: responseJson.user.id });
        console.log(`RegisterScreen.js -> onRegisterTapped: User registered with email address ${user.email_address}. Now logging user in..`);
        responseJson = await loginWithCredentials(user.email_address, user.password);
        if (responseJson && responseJson.success && responseJson.user) {
          console.log(`RegisterScreen.js -> onRegisterTapped: User logged in. Going back to Settings screen..`);
          navigation.goBack();
        } else {
          banner.showErrorMessage(responseJson?.error_code ? 'Login failed: ' + errorCodeMessages[responseJson.error_code] : 'Login failed with unknown error.');
        }
      } else {
        banner.showErrorMessage(responseJson?.error_code ? 'Registration failed: ' + errorCodeMessages[responseJson.error_code] : 'Registration failed with unknown error.');
      }
      setIsLoading(false);
    } catch(error) {
      const errorMessage = 'Registration failed with error: ' + error.message;
      console.error('RegisterScreen.js -> onRegisterTapped: ' + errorMessage);
      banner.showErrorMessage(errorMessage);
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

  return (
    <View style={[styles.container, { backgroundColor: themer.getColor('background1') }]}>
      <View style={[styles.headerView, { backgroundColor: themer.getColor('screenHeader1.background') } ]}>
        <View style={styles.titleView}>
          <Pressable onPress={onBackTapped} hitSlop={20}>
            <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={themer.getColor('screenHeader1.foreground')} />
          </Pressable>
          <Text style={[styles.title, { color: themer.getColor('screenHeader1.foreground') }]}>Register</Text>
          <View style={styles.placeholderIcon} />
        </View>
      </View>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.formView}
        extraHeight={100}
        enableOnAndroid={true}
        keyboardShouldPersistTaps={'handled'}
      >
        <View style={styles.inputsView}>
          <View style={[styles.inputView, { backgroundColor: themer.getColor('textInput1.background') }]}>
            <TextInput style={[styles.input, { color: themer.getColor('textInput1.foreground') }]} placeholder={'Email address..'} placeholderTextColor={themer.getPlaceholderTextColor('textInput1.foreground')} maxLength={50} keyboardType='email-address' autoCapitalize='none' onChangeText={onEmailAddressChangeText} />
          </View>
          <View style={[styles.inputView, { backgroundColor: themer.getColor('textInput1.background') }]}>
            <TextInput style={[styles.input, { color: themer.getColor('textInput1.foreground') }]} placeholder={'Phone number..'} placeholderTextColor={themer.getPlaceholderTextColor('textInput1.foreground')} maxLength={50} keyboardType='phone-pad' autoCapitalize='none' onChangeText={onPhoneNumberChangeText} />
          </View>
          <View style={[styles.inputView, { backgroundColor: themer.getColor('textInput1.background') }]}>
            <TextInput style={[styles.input, { color: themer.getColor('textInput1.foreground') }]} placeholder={'First name..'} placeholderTextColor={themer.getPlaceholderTextColor('textInput1.foreground')} maxLength={50} keyboardType='default' autoCapitalize='words' onChangeText={onFirstNameChangeText} />
          </View>
          <View style={[styles.inputView, { backgroundColor: themer.getColor('textInput1.background') }]}>
            <TextInput style={[styles.input, { color: themer.getColor('textInput1.foreground') }]} placeholder={'Last name..'} placeholderTextColor={themer.getPlaceholderTextColor('textInput1.foreground')} maxLength={50} keyboardType='default' autoCapitalize='words' onChangeText={onLastNameChangeText} />
          </View>
          <View style={[styles.inputView, { backgroundColor: themer.getColor('textInput1.background') }]}>
            <TextInput style={[styles.input, { color: themer.getColor('textInput1.foreground') }]} placeholder={'Password..'} placeholderTextColor={themer.getPlaceholderTextColor('textInput1.foreground')} maxLength={100} secureTextEntry={true} onChangeText={onPasswordChangeText} />
          </View>
          <View style={[styles.inputView, { backgroundColor: themer.getColor('textInput1.background') }]}>
            <TextInput style={[styles.input, { color: themer.getColor('textInput1.foreground') }]} placeholder={'Password confirm..'} placeholderTextColor={themer.getPlaceholderTextColor('textInput1.foreground')} maxLength={100} secureTextEntry={true} onChangeText={onPasswordConfirmChangeText} />
          </View>
        </View>
        <ActionButton iconImageSource={require('../assets/images/list-icon.png')} text={'Register'} foregroundColor={themer.getColor('button3.foreground')} backgroundColor={themer.getColor('button3.background')} disabled={isLoading} onTapped={() => onRegisterTapped()} />
      </KeyboardAwareScrollView>
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

export default RegisterScreen;