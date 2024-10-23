import React, { useEffect, useReducer } from 'react';
import { Linking, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './RootNavigation';
import navigation from './RootNavigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import FlashMessage from "react-native-flash-message";
import { ApplicationContext } from './ApplicationContext';
import storage from './helpers/storage';
import api from './helpers/api';
import SnippetsScreen from './screens/SnippetsScreen';
import SnippetScreen from './screens/SnippetScreen';
import SearchScreen from './screens/SearchScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import RegisterScreen from './screens/RegisterScreen';
import UserScreen from './screens/UserScreen';

const initialState = {
  user: undefined,
  isUserLoading: true,
}

const reducer = (state, action) => {
  switch(action.type) {
    case 'LOGGING_IN':
      return { ...state, isUserLoading: true };
    case 'LOGGED_IN':
      return { ...state, user: action.payload, isUserLoading: false };
    case 'LOGGING_OUT':
      return { ...state, isUserLoading: true };
    case 'LOGGED_OUT':
      return { ...state, user: null, isUserLoading: false };
    default:
      return state;
  }
};

const Stack = createNativeStackNavigator();

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    console.log('\n\n\nApp.js -> useEffect: STARTING APP');
    
    loginWithStorage();

    Linking.getInitialURL().then((url) => { if (url) { handleDeepLink({ url }); }}); // handle deep link from app launch
    const urlEventBinding = Linking.addEventListener('url', handleDeepLink);  // handle deep link while app running

    return () => {
      urlEventBinding.remove();
    };
  }, []);

  const loginWithStorage = async () => {
    try {
      console.log('App.js -> loginWithStorage: Attempt to get credentials from storage..');
      const credentials = await storage.getCredentials();
      if (credentials) {
        await loginWithCredentials(credentials.emailOrPhone, credentials.password);
      } else {
        dispatch({ type: 'LOGGED_IN', payload: null });
      }
    } catch (error) {
      console.error('App.js -> loginWithStorage: Logging in user failed with error: ' + error.message);
    }
  };

  const loginWithCredentials = async (emailOrPhone, password) => {
    dispatch({ type: 'LOGGING_IN' });
    let user = null;
    let responseJson;
    try {
      const response = await api.login(emailOrPhone, password);
      responseJson = await response.json();
      if (responseJson && responseJson.success && responseJson.user) {
        user = responseJson.user;
        delete user.password;
        console.log(`App.js -> loginWithCredentials: Login successful with user ID ${user.id}`);
        await storage.saveCredentials(emailOrPhone, password);
      } else {
        console.log('App.js -> loginWithCredentials: Login failed with error code: ' + responseJson?.error_code);
      }
    } catch (error) {
      console.error('App.js -> loginWithCredentials: Login failed with error: ' + error.message);
    }
    dispatch({ type: 'LOGGED_IN', payload: user ?? null });
    return responseJson;
  };

  const logout = async () => {
    dispatch({ type: 'LOGGING_OUT' });
    try {
      await storage.deleteCredentials();
      console.log('App.js -> logout: Deleted credentials from storage..');
    } catch (error) {
      console.error('App.js -> logout: Logging out user failed with error: ' + error.message);
    }
    dispatch({ type: 'LOGGED_OUT' });
  };

  const handleDeepLink = (event) => {
    console.log('App.js -> handleDeepLink: Handling deep link', event?.url);
    const url = event.url;
    const route = url.replace(/.*?:\/\//g, '');
    const [path, param] = route.split('/');
    navigation.popToTop();
    if (path === 'snippets' && param) {
      console.log(`App.js -> handleDeepLink: Navigating to Snippets screen to handle deep link for snippet Id ${param}`);
      navigation.push('Snippets', { deepLinkSnippetId: param });
    } else if (path === 'search') {
      console.log(`App.js -> handleDeepLink: Navigating to Search screen to handle deep link`);
      navigation.push('Snippets', { deepLinkSearch: true });
    } else if (path === 'add') {
      console.log(`App.js -> handleDeepLink: Navigating to Snippet screen to handle deep link`);
      navigation.push('Snippets', { deepLinkAddSnippet: true });
    }
  };

  return (
    <ApplicationContext.Provider value={{...state, loginWithCredentials, logout}}>
      <ActionSheetProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator initialRouteName="Snippets">
            <Stack.Screen
              name="Snippets"
              component={SnippetsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Snippet"
              component={SnippetScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="User"
              component={UserScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
          <FlashMessage position="top" />
        </NavigationContainer>
      </ActionSheetProvider>
    </ApplicationContext.Provider>
  );
}

const styles = StyleSheet.create({

});
