import React, { useContext, useEffect, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFancyActionSheet } from 'react-native-fancy-action-sheet';
import { ApplicationContext } from '../ApplicationContext';
import storage from '../helpers/storage';
import style from '../helpers/style';
import { useTranslation } from 'react-i18next';
import api from '../helpers/api';
import banner from '../helpers/banner';
import analytics from '../helpers/analytics';
import ActionButton from '../components/ActionButton';

const UserScreen = ({ navigation }) => {
  const { t } = useTranslation(['common', 'auth', 'errors']);
  const { themer, user, isUserLoading, loginWithCredentials, logout } = useContext(ApplicationContext);

  const safeAreaInsets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  const { showFancyActionSheet } = useFancyActionSheet();

  useEffect(() => {
    getPasswordFromStorage();
  }, []);

  const getPasswordFromStorage = async() => {
    const credentials = await storage.getCredentials();
    if (credentials) {
      setEditedUser({ ...editedUser, password: credentials.password, password_confirm: credentials.password });
    }
  };

  const onBackTapped = async () => {
    navigation.goBack();
  };

  const onSaveTapped = async () => {
    try {
      setIsLoading(true);
      if (editedUser.password != editedUser.password_confirm) {
        throw new Error('Password confirmation must match the password entered.');
      }
      const response = await api.saveUser(editedUser, await storage.getAuthorizationToken());
      if (!response?.ok) { throw new Error(`HTTP error with status ${response?.status}`); }
      let responseJson = await response.json();
      if (responseJson && responseJson.success && responseJson.user) {
        await analytics.logEvent('user_edited', { properties: Object.keys(editedUser).filter(key => editedUser[key] !== user[key]).length });
        console.log(`UserScreen.js -> onSaveTapped: User saved. Now logging user in again..`);
        responseJson = await loginWithCredentials(editedUser.email_address, editedUser.password);
        if (responseJson && responseJson.success && responseJson.user) {
          console.log(`UserScreen.js -> onSaveTapped: User logged in. Going back to Settings screen..`);
          navigation.goBack();
        } else {
          banner.showErrorMessage(responseJson?.error_code ? t('auth:login.failed', { error: t(`errors:errorCodes.${responseJson.error_code}`) }) : t('auth:login.failedUnknown'));
        }
      } else {
        banner.showErrorMessage(responseJson?.error_code ? t('auth:user.savingFailed', { error: t(`errors:errorCodes.${responseJson.error_code}`) }) : t('auth:user.savingFailedUnknown'));
      }
      setIsLoading(false);
    } catch(error) {
      console.error('UserScreen.js -> onSaveTapped: Saving user failed with error: ' + error.message);
      banner.showErrorMessage(t('auth:user.savingFailedError', { error: error.message }));
      setIsLoading(false);
    }
  };

  const onDeleteTapped = async () => {
    confirmDelete(0);
  };

  const confirmDelete = async (count) => {
    const options = [{ id: 'DELETE', name: t('common:buttons.delete') }];
    showFancyActionSheet({
      title: t('auth:user.deleteConfirm.title'),
      message: t('auth:user.deleteConfirm.message'),
      ...style.getFancyActionSheetStyles(themer),
      options: options,
      destructiveOptionId: 'DELETE',
      onOptionPress: async (option) => {
        switch (option.id) {
          case 'DELETE':
            if (count > 0) { deleteUser() } else { confirmDelete(++count) }
            break;
        }
      },
    });
  }

  const deleteUser = async () => {
    try {
      setIsLoading(true);
      const response = await api.deleteUser(await storage.getAuthorizationToken());
      if (!response?.ok) { throw new Error(`HTTP error with status ${response?.status}`); }
      let responseJson = await response.json();
      if (responseJson && responseJson.success) {
        await analytics.logEvent('user_deleted');
        console.log(`UserScreen.js -> deleteUser: User deleted. Now logging user out..`);
        navigation.popToTop();
        await logout();
        banner.showSuccessMessage(t('common:messages.loggedOut'));
      } else {
        banner.showErrorMessage(responseJson?.error_code ? t('auth:user.deletingFailed', { error: t(`errors:errorCodes.${responseJson.error_code}`) }) : t('auth:user.deletingFailedUnknown'));
      }
      setIsLoading(false);
    } catch(error) {
      console.error('UserScreen.js -> deleteUser: Deleting user failed with error: ' + error.message);
      banner.showErrorMessage(t('auth:user.deletingFailedError', { error: error.message }));
      setIsLoading(false);
    }
  };

  const onEmailAddressChangeText = async (text) => {
    setEditedUser({ ...editedUser, email_address: text });
  };

  const onPhoneNumberChangeText = async (text) => {
    setEditedUser({ ...editedUser, phone_number: text });
  };

  const onPasswordChangeText = async (text) => {
    setEditedUser({ ...editedUser, password: text });
  };

  const onPasswordConfirmChangeText = async (text) => {
    setEditedUser({ ...editedUser, password_confirm: text });
  };

  const onFirstNameChangeText = async (text) => {
    setEditedUser({ ...editedUser, first_name: text });
  };

  const onLastNameChangeText = async (text) => {
    setEditedUser({ ...editedUser, last_name: text });
  };

  return (
    <View style={[styles.container, { backgroundColor: themer.getColor('background1') }]}>
      <View style={[styles.headerView, { backgroundColor: themer.getColor('screenHeader1.background'), paddingTop: Platform.OS === 'ios' ? 60 : (safeAreaInsets.top + 17.5) } ]}>
        <View style={styles.titleView}>
          <Pressable onPress={onBackTapped} hitSlop={20}>
            <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={themer.getColor('screenHeader1.foreground')} />
          </Pressable>
          <Text style={[styles.title, { color: themer.getColor('screenHeader1.foreground') }]}>{t('auth:user.title')}</Text>
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
            <TextInput style={[styles.input, { color: themer.getColor('textInput1.foreground') }]} placeholder={t('common:placeholders.emailAddress')} placeholderTextColor={themer.getPlaceholderTextColor('textInput1.foreground')} maxLength={50} keyboardType='email-address' autoCapitalize='none' value={editedUser.email_address} onChangeText={onEmailAddressChangeText} />
          </View>
          <View style={[styles.inputView, { backgroundColor: themer.getColor('textInput1.background') }]}>
            <TextInput style={[styles.input, { color: themer.getColor('textInput1.foreground') }]} placeholder={t('common:placeholders.phoneNumber')} placeholderTextColor={themer.getPlaceholderTextColor('textInput1.foreground')} maxLength={50} keyboardType='phone-pad' autoCapitalize='none' value={editedUser.phone_number} onChangeText={onPhoneNumberChangeText} />
          </View>
          <View style={[styles.inputView, { backgroundColor: themer.getColor('textInput1.background') }]}>
            <TextInput style={[styles.input, { color: themer.getColor('textInput1.foreground') }]} placeholder={t('common:placeholders.firstName')} placeholderTextColor={themer.getPlaceholderTextColor('textInput1.foreground')} maxLength={50} keyboardType='default' autoCapitalize='words' value={editedUser.first_name} onChangeText={onFirstNameChangeText} />
          </View>
          <View style={[styles.inputView, { backgroundColor: themer.getColor('textInput1.background') }]}>
            <TextInput style={[styles.input, { color: themer.getColor('textInput1.foreground') }]} placeholder={t('common:placeholders.lastName')} placeholderTextColor={themer.getPlaceholderTextColor('textInput1.foreground')} maxLength={50} keyboardType='default' autoCapitalize='words' value={editedUser.last_name} onChangeText={onLastNameChangeText} />
          </View>
          <View style={[styles.inputView, { backgroundColor: themer.getColor('textInput1.background') }]}>
            <TextInput style={[styles.input, { color: themer.getColor('textInput1.foreground') }]} placeholder={t('common:placeholders.password')} placeholderTextColor={themer.getPlaceholderTextColor('textInput1.foreground')} maxLength={100} secureTextEntry={true} value={editedUser.password} onChangeText={onPasswordChangeText} />
          </View>
          <View style={[styles.inputView, { backgroundColor: themer.getColor('textInput1.background') }]}>
            <TextInput style={[styles.input, { color: themer.getColor('textInput1.foreground') }]} placeholder={t('common:placeholders.passwordConfirm')} placeholderTextColor={themer.getPlaceholderTextColor('textInput1.foreground')} maxLength={100} secureTextEntry={true} value={editedUser.password_confirm} onChangeText={onPasswordConfirmChangeText} />
          </View>
        </View>
        <ActionButton iconImageSource={require('../assets/images/checkmark.png')} text={t('common:buttons.save')} foregroundColor={themer.getColor('button2.foreground')} backgroundColor={themer.getColor('button2.background')} disabled={isLoading} onTapped={() => onSaveTapped()} />
        <ActionButton iconImageSource={require('../assets/images/x.png')} text={t('common:buttons.deleteAccount')} foregroundColor={themer.getColor('button4.foreground')} backgroundColor={themer.getColor('button4.background')} onTapped={() => onDeleteTapped()} />
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

export default UserScreen;