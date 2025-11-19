import React, { useContext, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ApplicationContext } from '../ApplicationContext';
import banner from '../helpers/banner';
import analytics from '../helpers/analytics';
import ActionButton from '../components/ActionButton';

const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation(['common', 'auth', 'errors']);
  const { themer, loginWithCredentials } = useContext(ApplicationContext);

  const safeAreaInsets = useSafeAreaInsets();

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
        await analytics.logEvent('login', { method: 'email' });
        console.log(`LoginScreen.js -> onLoginTapped: User logged in. Going back to Settings screen..`);
        navigation.goBack();
      } else {
        banner.showErrorMessage(responseJson?.error_code ? t('auth:login.failed', { error: t(`errors:errorCodes.${responseJson.error_code}`) }) : t('auth:login.failedUnknown'));
      }
      setIsLoading(false);
    } catch(error) {
      console.error('LoginScreen.js -> onLoginTapped: Login failed with error: ' + error.message);
      banner.showErrorMessage(t('auth:login.failedError', { error: error.message }));
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

  return (
    <View style={[styles.container, { backgroundColor: themer.getColor('background1') }]}>
      <View style={[styles.headerView, { backgroundColor: themer.getColor('screenHeader1.background'), paddingTop: Platform.OS === 'ios' ? 60 : (safeAreaInsets.top + 17.5) } ]}>
        <View style={styles.titleView}>
          <Pressable onPress={onBackTapped} hitSlop={20}>
            <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={themer.getColor('screenHeader1.foreground')} />
          </Pressable>
          <Text style={[styles.title, { color: themer.getColor('screenHeader1.foreground') }]}>{t('auth:login.title')}</Text>
          <View style={styles.placeholderIcon} />
        </View>
      </View>
      <View style={styles.formView}>
        <View style={styles.inputsView}>
          <View style={[styles.inputView, { backgroundColor: themer.getColor('textInput1.background') }]}>
            <TextInput style={[styles.input, { color: themer.getColor('textInput1.foreground') }]} placeholder={t('common:placeholders.emailOrPhone')} placeholderTextColor={themer.getPlaceholderTextColor('textInput1.foreground')} maxLength={50} keyboardType='email-address' textContentType='username' autoCapitalize='none' onChangeText={onEmailOrPhoneChangeText} />
          </View>
          <View style={[styles.inputView, { backgroundColor: themer.getColor('textInput1.background') }]}>
            <TextInput style={[styles.input, { color: themer.getColor('textInput1.foreground') }]} placeholder={t('common:placeholders.password')} placeholderTextColor={themer.getPlaceholderTextColor('textInput1.foreground')} maxLength={100} secureTextEntry={true} textContentType='password' onChangeText={onPasswordChangeText} />
          </View>
        </View>
        <ActionButton iconImageSource={require('../assets/images/user.png')} text={t('common:buttons.login')} foregroundColor={themer.getColor('button2.foreground')} backgroundColor={themer.getColor('button2.background')} disabled={isLoading} onTapped={() => onLoginTapped()} />
        <ActionButton iconImageSource={require('../assets/images/gear-gray.png')} text={t('common:buttons.forgotPassword')} foregroundColor={themer.getColor('button4.foreground')} backgroundColor={themer.getColor('button4.background')} onTapped={() => onForgotPasswordTapped()} />
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

export default LoginScreen;