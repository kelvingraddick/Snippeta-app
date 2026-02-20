import React, { useContext, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTranslation } from 'react-i18next';
import { ApplicationContext } from '../ApplicationContext';
import api from '../helpers/api';
import banner from '../helpers/banner';
import analytics from '../helpers/analytics';
import ActionButton from '../components/ActionButton';

const RegisterScreen = ({ navigation }) => {
  const { t } = useTranslation(['common', 'auth', 'errors']);
  const { themer, loginWithCredentials } = useContext(ApplicationContext);

  const safeAreaInsets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({});

  const onBackTapped = async () => {
    navigation.goBack();
  };

  const onRegisterTapped = async () => {
    try {
      setIsLoading(true);
      if (user.password != user.password_confirm) {
        throw new Error(t('auth:passwordMismatch'));
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
          banner.showErrorMessage(responseJson?.error_code ? t('auth:login.failed', { error: t(`errors:errorCodes.${responseJson.error_code}`) }) : t('auth:login.failedUnknown'));
        }
      } else {
        banner.showErrorMessage(responseJson?.error_code ? t('auth:register.failed', { error: t(`errors:errorCodes.${responseJson.error_code}`) }) : t('auth:register.failedUnknown'));
      }
      setIsLoading(false);
    } catch(error) {
      console.error('RegisterScreen.js -> onRegisterTapped: Registration failed with error: ' + error.message);
      banner.showErrorMessage(t('auth:register.failedError', { error: error.message }));
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
      <View style={[styles.headerView, { backgroundColor: themer.getColor('screenHeader1.background'), paddingTop: Platform.OS === 'ios' ? 60 : (safeAreaInsets.top + 17.5) } ]}>
        <View style={styles.titleView}>
          <Pressable onPress={onBackTapped} hitSlop={20}>
            <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={themer.getColor('screenHeader1.foreground')} />
          </Pressable>
          <Text style={[styles.title, { color: themer.getColor('screenHeader1.foreground') }]}>{t('auth:register.title')}</Text>
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
            <TextInput style={[styles.input, { color: themer.getColor('textInput1.foreground') }]} placeholder={t('common:placeholders.emailAddress')} placeholderTextColor={themer.getPlaceholderTextColor('textInput1.foreground')} maxLength={50} keyboardType='email-address' autoCapitalize='none' onChangeText={onEmailAddressChangeText} />
          </View>
          <View style={[styles.inputView, { backgroundColor: themer.getColor('textInput1.background') }]}>
            <TextInput style={[styles.input, { color: themer.getColor('textInput1.foreground') }]} placeholder={t('common:placeholders.phoneNumber')} placeholderTextColor={themer.getPlaceholderTextColor('textInput1.foreground')} maxLength={50} keyboardType='phone-pad' autoCapitalize='none' onChangeText={onPhoneNumberChangeText} />
          </View>
          <View style={[styles.inputView, { backgroundColor: themer.getColor('textInput1.background') }]}>
            <TextInput style={[styles.input, { color: themer.getColor('textInput1.foreground') }]} placeholder={t('common:placeholders.firstName')} placeholderTextColor={themer.getPlaceholderTextColor('textInput1.foreground')} maxLength={50} keyboardType='default' autoCapitalize='words' onChangeText={onFirstNameChangeText} />
          </View>
          <View style={[styles.inputView, { backgroundColor: themer.getColor('textInput1.background') }]}>
            <TextInput style={[styles.input, { color: themer.getColor('textInput1.foreground') }]} placeholder={t('common:placeholders.lastName')} placeholderTextColor={themer.getPlaceholderTextColor('textInput1.foreground')} maxLength={50} keyboardType='default' autoCapitalize='words' onChangeText={onLastNameChangeText} />
          </View>
          <View style={[styles.inputView, { backgroundColor: themer.getColor('textInput1.background') }]}>
            <TextInput style={[styles.input, { color: themer.getColor('textInput1.foreground') }]} placeholder={t('common:placeholders.password')} placeholderTextColor={themer.getPlaceholderTextColor('textInput1.foreground')} maxLength={100} secureTextEntry={true} onChangeText={onPasswordChangeText} />
          </View>
          <View style={[styles.inputView, { backgroundColor: themer.getColor('textInput1.background') }]}>
            <TextInput style={[styles.input, { color: themer.getColor('textInput1.foreground') }]} placeholder={t('common:placeholders.passwordConfirm')} placeholderTextColor={themer.getPlaceholderTextColor('textInput1.foreground')} maxLength={100} secureTextEntry={true} onChangeText={onPasswordConfirmChangeText} />
          </View>
        </View>
        <ActionButton iconImageSource={require('../assets/images/list-icon.png')} text={t('common:buttons.register')} foregroundColor={themer.getColor('button3.foreground')} backgroundColor={themer.getColor('button3.background')} disabled={isLoading} onTapped={() => onRegisterTapped()} />
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