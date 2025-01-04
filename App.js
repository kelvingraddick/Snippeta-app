import React, { useEffect, useReducer } from 'react';
import { Linking, NativeModules } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './RootNavigation';
import navigation from './RootNavigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import FlashMessage from "react-native-flash-message";
import Clipboard from '@react-native-clipboard/clipboard';
import Rate from 'react-native-rate';
import { ApplicationContext } from './ApplicationContext';
import { storageKeys } from './constants/storageKeys';
import { snippetTypes } from './constants/snippetTypes';
import { snippetSources } from './constants/snippetSources';
import { colorIds } from './constants/colorIds';
import { entitlementIds } from './constants/entitlementIds';
import { themes } from './constants/themes';
import { readableErrorMessages } from './constants/readableErrorMessages';
import Themer from './helpers/themer';
import api from './helpers/api';
import storage from './helpers/storage';
import widget from './helpers/widget';
import banner from './helpers/banner';
import RevenueCat from './helpers/revenueCat';
import SnippetsScreen from './screens/SnippetsScreen';
import SnippetScreen from './screens/SnippetScreen';
import SearchScreen from './screens/SearchScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import RegisterScreen from './screens/RegisterScreen';
import UserScreen from './screens/UserScreen';
import WidgetScreen from './screens/WidgetScreen';

const initialState = {
  themer: new Themer('default-light'),
  user: undefined,
  isUserLoading: true,
  entitlements: undefined,
  subscription: undefined,
  isThemePreview: false,
}

const reducer = (state, action) => {
  switch(action.type) {
    case 'UPDATE_THEMER':
      return { ...state, themer: action.payload };
    case 'LOGGING_IN':
      return { ...state, isUserLoading: true };
    case 'LOGGED_IN':
      return { ...state, user: action.payload, isUserLoading: false };
    case 'LOGGING_OUT':
      return { ...state, isUserLoading: true };
    case 'LOGGED_OUT':
      return { ...state, user: null, isUserLoading: false };
    case 'UPDATE_ENTITLEMENTS':
      return { ...state, entitlements: action.payload };
    case 'UPDATE_SUBSCRIPTION':
      return { ...state, subscription: action.payload };
    case 'PREVIEWING_THEME':
      return { ...state, isThemePreview: action.payload };
    default:
      return state;
  }
};

const Stack = createNativeStackNavigator();

const { WidgetNativeModule } = NativeModules;

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    console.log('\n\n\nApp.js -> useEffect: STARTING APP');

    RevenueCat.configure()
      .then(loadThemeFromStorage())
      .then(loginWithStorage());

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
        await updateEntitlements();
        await updateSnippetGroups();
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
        await loginToRevenueCat(user.id);
        await updateEntitlements(user);
        await updateSnippetGroups();
      } else {
        console.log('App.js -> loginWithCredentials: Login failed with error code: ' + responseJson?.error_code);
      }
    } catch (error) {
      console.error('App.js -> loginWithCredentials: Login failed with error: ' + error.message);
    }
    dispatch({ type: 'LOGGED_IN', payload: user ?? null });
    return responseJson;
  };
  
  const loginToRevenueCat = async (userId) => {
    try { await RevenueCat.login(userId); }
    catch (error) { 
      console.error('App.js -> loginToRevenueCat: RevenueCat login failed with error: ' + error.message);
      banner.showErrorMessage(readableErrorMessages.GET_PURCHASE_DATA_ERROR);
    }
  };

  const logout = async () => {
    dispatch({ type: 'LOGGING_OUT' });
    try {
      await storage.deleteCredentials();
      await updateEntitlements();
      await updateSnippetGroups();
      console.log('App.js -> logout: Deleted credentials from storage..');
    } catch (error) {
      console.error('App.js -> logout: Logging out user failed with error: ' + error.message);
    }
    dispatch({ type: 'LOGGED_OUT' });
  };

  const refresh = async () => {
    console.log('App.js -> refresh: Refreshing login, snippets, widgets, etc.');
    loginWithStorage();
  };

  const handleDeepLink = async (event) => {
    console.log('App.js -> handleDeepLink: Handling deep link', event?.url);
    const url = event.url;
    const route = url.replace(/.*?:\/\//g, '');
    const [path, param] = route.split('/');
    if ((path === 'snippets' || path === 'copy') && param) {
      console.log(`App.js -> handleDeepLink: Getting shared data for snippet Id ${param}`);
      const snippetGroups = await widget.getData('snippetGroups');
      const snippet = snippetGroups?.reduce((result, group) => result || group.snippets?.find(snippet => snippet.id == param) || (group.id == param ? group : null), null);
      if (snippet) {
        if (path === 'snippets') {
          console.log(`App.js -> handleDeepLink: Navigating to Snippets screen to handle deep link for snippet Id ${param}`);
          navigation.popToTop();
          if (snippet.id !== (storageKeys.SNIPPET + 0)) {
            navigation.push('Snippets', { parentSnippet: snippet, callbacks: [refresh] });
          }
        } else { // path === 'copy'
          console.log(`App.js -> handleDeepLink: copy for snippet ID ${param}`);
          Clipboard.setString(snippet.content);
          banner.showSuccessMessage('The text was copied to the clipboard', `"${snippet.content}"`);
        }
      } else {
        console.warn(`App.js -> handleDeepLink: could not find snippet for ID ${param}`);
      }
    } else if (path === 'search') {
      console.log(`App.js -> handleDeepLink: Navigating to Search screen to handle deep link`);
      navigation.popToTop();
      navigation.navigate('Search', { callbacks: [refresh] });
    } else if (path === 'add') {
      console.log(`App.js -> handleDeepLink: Navigating to Snippet screen to handle deep link`);
      navigation.popToTop();
      navigation.navigate('Snippet', { snippet: { type: snippetTypes.SINGLE, color_id: colorIds.COLOR_1, }, callbacks: [refresh], });
    }
  };

  const updateSnippetGroups = async () => {
    try {
      console.log('App.js -> updateSnippetGroups: about to get snippet groups for user');

      // try to get storage snippet groups
      let storageSnippetGroups = [];
      storageSnippetGroups = await storage.getSnippetGroups();
      storageSnippetGroups.forEach(x => { x.source = snippetSources.STORAGE; x.snippets.forEach(y => { y.source = snippetSources.STORAGE; }) });
      storageSnippetGroups.sort((a, b) => a.order_index - b.order_index);

      // try to get API snippet groups
      let apiSnippetGroups = [];
      let response = await api.getSnippetGroups(await storage.getAuthorizationToken());
      if (!response?.ok) { throw new Error(`HTTP error with status: ${response?.status}`); }
      let responseJson = await response.json();
      apiSnippetGroups = responseJson.groups ?? [];
      apiSnippetGroups.forEach(x => { x.source = snippetSources.API; x.snippets.forEach(y => { y.source = snippetSources.API; }) });
      apiSnippetGroups.sort((a, b) => a.order_index - b.order_index);
      console.log(`App.js -> updateSnippetGroups: Got ${apiSnippetGroups.length} snippet groups via API:`, JSON.stringify(apiSnippetGroups.map(x => x.id)));

      // set snippet groups data for widget
      let snippetGroups = [];
      snippetGroups = snippetGroups.concat(storageSnippetGroups).concat(apiSnippetGroups);
      await widget.saveData('snippetGroups', snippetGroups);
      updateWidgets();
    } catch (error) {
      console.error('App.js -> updateSnippetGroups: updating snippet groups failed with error: ' + error.message);
      banner.showErrorMessage(readableErrorMessages.UPDATE_WIDGET_ERROR);
    }
  };

  const loadThemeFromStorage = async () => {
    console.log('App.js -> loadThemeFromStorage: about to load theme Id from storage and set in app..');
    const themeId = await storage.getThemeId();
    await updateThemer(themeId);
  };

  const updateThemer = async (themeId) => {
    try {
      const themer = new Themer(themeId);
      console.log(`App.js -> updateThemer: ${themeId ? `updated themer with id '${themeId}' and name '${themer.getName()}'` : `no theme found; using default '${themer.getName()}'`}`);
      await widget.saveData('colors', themer.getColors());
      updateWidgets();
      dispatch({ type: 'UPDATE_THEMER', payload: themer });
    } catch (error) {
      console.error('App.js -> updateThemer: updating themer failed with error: ' + error.message);
    }
  }

  const previewTheme = async (themeId) => {
    try {
      if (state.isThemePreview) {
        console.log(`App.js -> previewTheme: can't preview theme because already previewing for ID ${state.themer.themeId}`);
      } else {
        console.log(`App.js -> previewTheme: preview theme set with ID ${themeId}`);
        dispatch({ type: 'PREVIEWING_THEME', payload: true });
        let intervalId;
        await updateThemer(themeId);
        let seconds = 60;
        const getStatusMessage = (seconds) => `Previewing the '${themes[themeId]?.name}' theme for ${seconds} seconds.`;
        banner.showStatusMessage(getStatusMessage(seconds), null, true);
        intervalId = setInterval(async () => {
          if (seconds > 1) {
            seconds--;
            banner.showStatusMessage(getStatusMessage(seconds), null, false);
          } else {
            dispatch({ type: 'PREVIEWING_THEME', payload: false });
            clearInterval(intervalId);
            banner.hideMessage();
            await loadThemeFromStorage();
          }
        }, 1000);
      }
    } catch (error) {
      console.error('App.js -> previewTheme: previewing theme failed with error: ' + error.message);
    }
  }

  const updateEntitlements = async (user) => {
    // 1. fetch entitlements from RevenueCat
    let entitlements;
    try {  
      entitlements = await RevenueCat.getEntitlements();
      dispatch({ type: 'UPDATE_ENTITLEMENTS', payload: entitlements });
    } catch (error) {
      console.error('App.js -> updateEntitlements: syncing entitlements failed with error: ' + error.message);
      banner.showErrorMessage(readableErrorMessages.GET_PURCHASE_DATA_ERROR);
    }
    // 2. determine subscription status based on entitlements and current user
    try {  
      const inAppSubscription = { type: 'IN-APP', data: entitlements?.[entitlementIds.SNIPPETA_PRO], };
      const snippetaCloudSubscription = { type: 'SNIPPETA-CLOUD', data: (user?.type == 1 ? {} : null), };
      console.log('App.js -> updateEntitlements: ' + (snippetaCloudSubscription?.data ? 'Found' : 'Did not find') + ' active Snippeta Cloud subscription');
      const activeSubscription = inAppSubscription.data ? inAppSubscription : (snippetaCloudSubscription.data ? snippetaCloudSubscription : null);
      console.log('App.js -> updateEntitlements: Active subscription type: ' + (activeSubscription?.type ?? 'No active subscription'));
      dispatch({ type: 'UPDATE_SUBSCRIPTION', payload: activeSubscription });
    } catch (error) {
      console.error('App.js -> updateEntitlements: syncing entitlements failed with error: ' + error.message);
      banner.showErrorMessage(readableErrorMessages.GET_PURCHASE_DATA_ERROR);
    }
  };

  const updateWidgets = () => {
    try {
      WidgetNativeModule.updateWidgets();
      console.log('App.js -> updateWidgets: refreshing home screen widgets was successful');
    } catch (error) {
      console.error('App.js -> updateWidgets: failed with error: ' + error.message);
    }
  };

  const promptReviewIfReady = async () => {
    try {
      let milestoneNumber = await storage.getMilestoneNumber() ?? 0;
      milestoneNumber++;
      await storage.saveMilestoneNumber(milestoneNumber);

      const lastReviewPromptDate = await storage.getLastReviewPromptDate();
      const currentDate = new Date();
      const REVIEW_PROMPT_MILESTONE_NUMBERS = [6, 26, 51];
      const REVIEW_PROMPT_INTERVAL_MILLISECONDS = 604800000; // 7 days
      
      // decide whether to show review prompt
      if (REVIEW_PROMPT_MILESTONE_NUMBERS.includes(milestoneNumber) && (!lastReviewPromptDate || ((currentDate.getTime() - lastReviewPromptDate.getTime()) > REVIEW_PROMPT_INTERVAL_MILLISECONDS))) {
        console.log(`App.js -> updateMilestones: About to prompt app review at milestone number ${milestoneNumber} and last review prompt time ${JSON.stringify(lastReviewPromptDate)}`);
        const options = {
          AppleAppID: '1282250868',
          GooglePackageName: 'com.wavelinkllc.snippeta',
          preferInApp: true,
          openAppStoreIfInAppFails: true,
          fallbackPlatformURL: 'https://apps.apple.com/us/app/snippeta-copy-manage-paste/id1282250868',
        };
        Rate.rate(options, async (success, errorMessage) => {
          if (success) { // this technically only tells us if the user successfully went to the Review Page. Whether they actually did anything, we do not know.
            await storage.saveLastReviewPromptDate(new Date());
            console.log(`App.js -> updateMilestones: Successfully prompt app review`);
          }
          if (errorMessage) { // errorMessage comes from the native code. Useful for debugging, but probably not for users to view
            console.error('App.js -> updateMilestones: Rate call failed with error: ' + errorMessage);
          }
        });
      } else {
        console.log(`App.js -> updateMilestones: Not ready to prompt app review at milestone number ${milestoneNumber} and last review prompt time ${lastReviewPromptDate && JSON.stringify(lastReviewPromptDate)}`);
      }
    } catch (error) {
      console.error('App.js -> updateMilestones: failed with error: ' + error.message);
    }
  };

  const onSnippetChanged = async () => {
    console.log('App.js -> onSnippetChanged: snippet(s) was changed and need to refresh related state..');
    await updateSnippetGroups();
    await promptReviewIfReady();
  };

  return (
    <ApplicationContext.Provider value={{...state, onSnippetChanged, updateThemer, previewTheme, loginWithCredentials, logout, updateEntitlements}}>
      <ActionSheetProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator initialRouteName="Snippets">
            <Stack.Group>
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
            </Stack.Group>
            <Stack.Group screenOptions={{ presentation: 'modal' }}>
              <Stack.Screen
                name="Widget"
                component={WidgetScreen}
                options={{ headerShown: false }}
              />
            </Stack.Group>
          </Stack.Navigator>
          <FlashMessage position="top" />
        </NavigationContainer>
      </ActionSheetProvider>
    </ApplicationContext.Provider>
  );
}
