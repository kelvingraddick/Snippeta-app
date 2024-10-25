import React, { useContext, useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { showMessage } from "react-native-flash-message";
import { useActionSheet } from '@expo/react-native-action-sheet';
import { ApplicationContext } from '../ApplicationContext';
import storage from '../helpers/storage';
import { errorCodeMessages } from '../constants/errorCodeMessages';
import api from '../helpers/api';
import colors from '../helpers/colors';
import ActionButton from '../components/ActionButton';

const UserScreen = ({ navigation }) => {

  const { user, isUserLoading, loginWithCredentials, logout } = useContext(ApplicationContext);

  const [isLoading, setIsLoading] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  const { showActionSheetWithOptions } = useActionSheet();

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
      let responseJson = await response.json();
      if (responseJson && responseJson.success && responseJson.user) {
        console.log(`UserScreen.js -> onSaveTapped: User saved. Now logging user in again..`);
        responseJson = await loginWithCredentials(editedUser.email_address, editedUser.password);
        if (responseJson && responseJson.success && responseJson.user) {
          console.log(`UserScreen.js -> onSaveTapped: User logged in. Going back to Settings screen..`);
          navigation.goBack();
        } else {
          showErrorMessage(responseJson?.error_code ? 'Login failed: ' + errorCodeMessages[responseJson.error_code] : 'Login failed with unknown error.');
        }
      } else {
        showErrorMessage(responseJson?.error_code ? 'Saving failed: ' + errorCodeMessages[responseJson.error_code] : 'Saving failed with unknown error.');
      }
      setIsLoading(false);
    } catch(error) {
      const errorMessage = 'Saving failed with error: ' + error.message;
      console.error('UserScreen.js -> onSaveTapped: ' + errorMessage);
      showErrorMessage(errorMessage);
      setIsLoading(false);
    }
  };

  const onDeleteTapped = async () => {
    confirmDelete(0);
  };

  const confirmDelete = async (count) => {
    const options = { 'Delete': 0, 'Cancel': 1 };
    showActionSheetWithOptions(
      {
        title: 'This is a permanent action. Are you sure you want to delete your account?',
        options: Object.keys(options),
        destructiveButtonIndex: options.Delete,
        cancelButtonIndex: options.Cancel,
      },
      async (selectedIndex) => {
        switch (selectedIndex) {
          case options.Delete:
            if (count > 0) { deleteUser() } else { confirmDelete(++count) }
            break;
        }
      }
    );
  }

  const deleteUser = async () => {
    try {
      setIsLoading(true);
      const response = await api.deleteUser(await storage.getAuthorizationToken());
      let responseJson = await response.json();
      if (responseJson && responseJson.success) {
        console.log(`UserScreen.js -> deleteUser: User deleted. Now logging user out..`);
        navigation.popToTop();
        await logout();
        showMessage({
          message: 'Logged out!',
          titleStyle: {
            fontWeight: 'bold',
            color: 'black',
            opacity: 0.60,
          },
          textStyle: {
            fontStyle: 'italic',
            color: 'black',
            opacity: 0.60,
          }
        });
      } else {
        showErrorMessage(responseJson?.error_code ? 'Deleting failed: ' + errorCodeMessages[responseJson.error_code] : 'Deleting failed with unknown error.');
      }
      setIsLoading(false);
    } catch(error) {
      const errorMessage = 'Deleting failed with error: ' + error.message;
      console.error('UserScreen.js -> deleteUser: ' + errorMessage);
      showErrorMessage(errorMessage);
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
          <Text style={styles.title}>Account</Text>
          <View style={styles.placeholderIcon} />
        </View>
      </View>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.inputsView}
        extraHeight={100}
        enableOnAndroid={true}
      >
        <View>
          <View style={styles.inputView}>
            <TextInput style={styles.input} placeholder={'Email address..'} placeholderTextColor={colors.darkGray.hexCode} maxLength={50} keyboardType='email-address' autoCapitalize='none' value={editedUser.email_address} onChangeText={onEmailAddressChangeText} />
          </View>
          <View style={styles.inputView}>
            <TextInput style={styles.input} placeholder={'Phone number..'} placeholderTextColor={colors.darkGray.hexCode} maxLength={50} keyboardType='phone-pad' autoCapitalize='none' value={editedUser.phone_number} onChangeText={onPhoneNumberChangeText} />
          </View>
          <View style={styles.inputView}>
            <TextInput style={styles.input} placeholder={'First name..'} placeholderTextColor={colors.darkGray.hexCode} maxLength={50} keyboardType='default' autoCapitalize='words' value={editedUser.first_name} onChangeText={onFirstNameChangeText} />
          </View>
          <View style={styles.inputView}>
            <TextInput style={styles.input} placeholder={'Last name..'} placeholderTextColor={colors.darkGray.hexCode} maxLength={50} keyboardType='default' autoCapitalize='words' value={editedUser.last_name} onChangeText={onLastNameChangeText} />
          </View>
          <View style={styles.inputView}>
            <TextInput style={styles.input} placeholder={'Password..'} placeholderTextColor={colors.darkGray.hexCode} maxLength={100} secureTextEntry={true} value={editedUser.password} onChangeText={onPasswordChangeText} />
          </View>
          <View style={styles.inputView}>
            <TextInput style={styles.input} placeholder={'Password confirm..'} placeholderTextColor={colors.darkGray.hexCode} maxLength={100} secureTextEntry={true} value={editedUser.password_confirm} onChangeText={onPasswordConfirmChangeText} />
          </View>
          <ActionButton iconImageSource={require('../assets/images/checkmark.png')} text={'Save'} color={colors.nebulaBlue} disabled={isLoading} onTapped={() => onSaveTapped()} />
        </View>
        <View style={styles.deleteButtonView}>
          <ActionButton iconImageSource={require('../assets/images/x.png')} text={'Delete account'} color={colors.gray} onTapped={() => onDeleteTapped()} />
        </View> 
      </KeyboardAwareScrollView>
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
    justifyContent: 'space-between',
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

export default UserScreen;