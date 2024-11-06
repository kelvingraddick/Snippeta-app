import React, { useEffect, useReducer } from 'react';
import { Linking, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './RootNavigation';
import navigation from './RootNavigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import FlashMessage from "react-native-flash-message";
import Clipboard from '@react-native-clipboard/clipboard';
import { ApplicationContext } from './ApplicationContext';
import { snippetSources } from './constants/snippetSources';
import api from './helpers/api';
import storage from './helpers/storage';
import widget from './helpers/widget';
import colors from './helpers/colors';
import banner from './helpers/banner';
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
        await getSnippetLists();
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
        await getSnippetLists();
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
    if (path === 'snippets' && param) {
      console.log(`App.js -> handleDeepLink: Navigating to Snippets screen to handle deep link for snippet Id ${param}`);
      navigation.popToTop();
      navigation.push('Snippets', { deepLinkSnippetId: param });
    } else if (path === 'copy' && param) {
      console.log(`App.js -> handleDeepLink: copying to clipboard text ${param}`);
      const content = decodeURI(param);
      Clipboard.setString(content);
      banner.showSuccessMessage('The text was copied to the clipboard', `"${content}"`);
    } else if (path === 'search') {
      console.log(`App.js -> handleDeepLink: Navigating to Search screen to handle deep link`);
      navigation.popToTop();
      navigation.push('Snippets', { deepLinkSearch: true });
    } else if (path === 'add') {
      console.log(`App.js -> handleDeepLink: Navigating to Snippet screen to handle deep link`);
      navigation.popToTop();
      navigation.push('Snippets', { deepLinkAddSnippet: true });
    }
  };

  const getSnippetLists = async () => {
    console.log('App.js -> getSnippetLists: about to get snippet lists for user');

    // try to get storage snippet lists
    let storageSnippetLists = [];
    storageSnippetLists = await storage.getSnippetLists();
    storageSnippetLists.forEach(x => { x.source = snippetSources.STORAGE; });
    storageSnippetLists.sort((a, b) => a.order_index - b.order_index);
    console.log(`App.js -> getSnippetLists: Got ${storageSnippetLists.length} snippet lists from storage:`, JSON.stringify(storageSnippetLists.map(x => x.id)));

    // try to get api snippet lists
    let apiSnippetLists = [];
    let response = await api.getSnippetLists(await storage.getAuthorizationToken());
    let responseJson = await response.json();
    apiSnippetLists = responseJson.lists ?? [];
    apiSnippetLists.forEach(x => { x.source = snippetSources.API; });
    apiSnippetLists.sort((a, b) => a.order_index - b.order_index);
    console.log(`App.js -> getSnippetLists: Got ${apiSnippetLists.length} snippet lists via API:`, JSON.stringify(apiSnippetLists.map(x => x.id)));

    // set snippet lists data for widget
    let snippetLists = [];
    snippetLists = snippetLists.concat(storageSnippetLists).concat(apiSnippetLists);
    await widget.saveData('snippetLists', JSON.stringify(snippetLists));
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
  messageIcon: {
    height: 20,
    width: 20,
    color: colors.darkGray.hexCode,
    opacity: 0.25,
  },
});
