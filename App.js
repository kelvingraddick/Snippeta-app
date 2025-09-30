import React, { useEffect, useReducer, useRef } from 'react';
import { Linking, NativeModules, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './RootNavigation';
import navigation from './RootNavigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { FancyActionSheetProvider } from 'react-native-fancy-action-sheet';
import FlashMessage from "react-native-flash-message";
import Clipboard from '@react-native-clipboard/clipboard';
import Rate from 'react-native-rate';
import * as Sentry from '@sentry/react-native';
import OneSignal from './helpers/oneSignal';
import { ApplicationContext } from './ApplicationContext';
import { appSettings } from './constants/appSettings';
import { storageKeys } from './constants/storageKeys';
import { snippetTypes } from './constants/snippetTypes';
import { snippetSources } from './constants/snippetSources';
import { colorIds } from './constants/colorIds';
import { entitlementIds } from './constants/entitlementIds';
import { themes } from './constants/themes';
import { readableErrorMessages } from './constants/readableErrorMessages';
import { appearanceModes } from './constants/appearanceModes';
import { useThemer }from './helpers/themer';
import api from './helpers/api';
import storage from './helpers/storage';
import widget from './helpers/widget';
import banner from './helpers/banner';
import RevenueCat from './helpers/revenueCat';
import analytics from './helpers/analytics';
import SnippetsScreen from './screens/SnippetsScreen';
import SnippetScreen from './screens/SnippetScreen';
import SearchScreen from './screens/SearchScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import RegisterScreen from './screens/RegisterScreen';
import UserScreen from './screens/UserScreen';
import KeyboardScreen from './screens/KeyboardScreen';
import WidgetScreen from './screens/WidgetScreen';

Sentry.init({
  enabled: appSettings.SENTRY_ENABLED,
  dsn: appSettings.SENTRY_DSN_URL,
  debug: false,
  release: appSettings.VERSION_NUMBER,
  dist: appSettings.BUILD_NUMBER,
  attachScreenshot: true,
  enableUserInteractionTracing: true,
  tracesSampleRate: 0.05,
});

const initialState = {
  user: undefined,
  isUserLoading: true,
  entitlements: undefined,
  subscription: undefined,
  appearanceMode: undefined,
  isThemePreview: false,
  featureAlertsRefreshTime: undefined,
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
    case 'UPDATE_ENTITLEMENTS':
      return { ...state, entitlements: action.payload };
    case 'UPDATE_SUBSCRIPTION':
      return { ...state, subscription: action.payload };
    case 'UPDATE_APPEARANCE_MODE':
      return { ...state, appearanceMode: action.payload };
    case 'PREVIEWING_THEME':
      return { ...state, isThemePreview: action.payload };
    case 'REFRESH_FEATURE_ALERTS':
      return { ...state, featureAlertsRefreshTime: new Date() };
    default:
      return state;
  }
};

const Stack = createNativeStackNavigator();

const { WidgetNativeModule } = NativeModules;

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const themer = useThemer(Object.keys(themes)[0], appearanceModes.SYSTEM);
  const themePreviewStatusIntervalId = useRef();
  const routeNameRef = useRef();

  useEffect(() => {
    console.log('\n\n\nApp.js -> useEffect: STARTING APP');

    RevenueCat.configure()
      .then(() => loadThemeAppearanceFromStorage()
      .then(() => loginWithStorage()));

    OneSignal.initialize(appSettings.ONESIGNAL_APP_ID, handleNotificationClick, handleForegroundNotification);

    Linking.getInitialURL().then((url) => { if (url) { handleDeepLink({ url }); }}); // handle deep link from app launch
    const urlEventBinding = Linking.addEventListener('url', handleDeepLink);  // handle deep link while app running

    analytics.setUserProperties({ app_version: appSettings.VERSION_NUMBER, build_number: appSettings.BUILD_NUMBER.toString() });

    return () => {
      urlEventBinding.remove();
    };
  }, []);

  useEffect(() => {
    console.log(`App.js -> useEffect: ${themer.themeId ? `updated themer with id '${themer.themeId}', name '${themer.getName()}', and appearance '${themer.themeAppearance}'` : `no theme found; using default '${themer.getName()}'`}`);
    widget.saveData('colors', themer.getColors()).then(() => updateWidgets());
  }, [themer.themeId, themer.appearanceMode]);

  const loginWithStorage = async () => {
    try {
      console.log('App.js -> loginWithStorage: Attempt to get credentials from storage..');
      const credentials = await storage.getCredentials();
      if (credentials) {
        await loginWithCredentials(credentials.emailOrPhone, credentials.password);
      } else {
        await updateEntitlements();
        await updateDataForWidgets();
        await updateDataForKeyboard();
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
      if (!response?.ok) { throw new Error(`HTTP error with status ${response?.status}`); }
      responseJson = await response.json();
      if (responseJson && responseJson.success && responseJson.user) {
        user = responseJson.user;
        delete user.password;
        console.log(`App.js -> loginWithCredentials: Login successful with user ID ${user.id}`);
        await storage.saveCredentials(emailOrPhone, password);
        await loginToRevenueCat(user.id);
        await OneSignal.loginUser(user.id, { 'app_version': appSettings.VERSION_NUMBER, 'build_number': appSettings.BUILD_NUMBER.toString() });
        await updateEntitlements(user);
        await updateDataForWidgets();
        await updateDataForKeyboard();
        Sentry.setUser({ id: user.id, email: user.email_address });
        await analytics.setUserId(user.id);
        await analytics.setUserProperty('type', user.type?.toString());
      } else {
        console.log('App.js -> loginWithCredentials: Login failed with error code: ' + responseJson?.error_code);
      }
    } catch (error) {
      console.error('App.js -> loginWithCredentials: Login failed with error: ' + error.message);
      banner.showErrorMessage(readableErrorMessages.LOGIN_ERROR);
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
      OneSignal.logoutUser();  
      await updateEntitlements();
      await updateDataForWidgets();
      await updateDataForKeyboard();
      Sentry.setUser(null);
      await analytics.logEvent('logout');
      await analytics.resetAnalyticsData(); 
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

  const handleNotificationClick = async (event) => {
    console.log('App.js -> handleNotificationClick: Handling notification click', event);
    const notification = event.notification;
    const additionalData = notification.additionalData;
    if (additionalData) {
      // Handle different notification types based on additional data
      if (additionalData.snippetId) {
        console.log(`App.js -> handleNotificationClick: Navigating to snippet ${additionalData.snippetId}`);
        navigation.popToTop();
        navigation.navigate('Snippets', { callbacks: [refresh] });
      } else if (additionalData.action === 'open_settings') {
        console.log('App.js -> handleNotificationClick: Opening settings');
        navigation.popToTop();
        navigation.navigate('Settings', { callbacks: [refresh] });
      } else if (additionalData.action === 'open_search') {
        console.log('App.js -> handleNotificationClick: Opening search');
        navigation.popToTop();
        navigation.navigate('Search', { callbacks: [refresh] });
      } else if (additionalData.action === 'open_add_snippet') {
        console.log('App.js -> handleNotificationClick: Opening add snippet');
        navigation.popToTop();
        navigation.navigate('Snippet', { 
          snippet: { type: snippetTypes.SINGLE, color_id: colorIds.COLOR_1 }, 
          callbacks: [refresh] 
        });
      }
      await analytics.logEvent('notification_clicked', { action: additionalData.action });
    }
  };

  const handleForegroundNotification = (event) => {
    console.log('OneSignal: notification will display in foreground:', event);
    event.preventDefault();
  }

  const handleDeepLink = async (event) => {
    console.log('App.js -> handleDeepLink: Handling deep link', event?.url);
    await analytics.logEvent('deep_linked', { url: event?.url });
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
          await analytics.logEvent('snippet_copied', { type: snippet.type, source: snippet.source });
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

  const updateDataForWidgets = async () => {
    try {
      console.log('App.js -> updateDataForWidgets: about to get snippet groups for user');

      // 1. try to get storage snippet groups
      let storageSnippetGroups = [];
      try {
        storageSnippetGroups = await storage.getSnippetGroups();
        storageSnippetGroups.forEach(x => { x.source = snippetSources.STORAGE; x.snippets.forEach(y => { y.source = snippetSources.STORAGE; }) });
        storageSnippetGroups.sort((a, b) => a.order_index - b.order_index);
      } catch (error) {
        console.error('App.js -> updateDataForWidgets: getting snippet groups from storage failed with error: ' + error.message);
        banner.showErrorMessage(readableErrorMessages.UPDATE_WIDGET_ERROR);
      }

      // 2. try to get API snippet groups
      let apiSnippetGroups = [];
      try {
        let response = await api.getSnippetGroups(await storage.getAuthorizationToken());
        if (!response?.ok) { throw new Error(`HTTP error with status ${response?.status}`); }
        let responseJson = await response.json();
        apiSnippetGroups = responseJson.groups ?? [];
        apiSnippetGroups.forEach(x => { x.source = snippetSources.API; x.snippets.forEach(y => { y.source = snippetSources.API; }) });
        apiSnippetGroups.sort((a, b) => a.order_index - b.order_index);
        console.log(`App.js -> updateDataForWidgets: Got ${apiSnippetGroups.length} snippet groups via API:`, JSON.stringify(apiSnippetGroups.map(x => x.id)));
      } catch (error) {
        console.error('App.js -> updateDataForWidgets: getting snippet groups from API failed with error: ' + error.message);
        banner.showErrorMessage(readableErrorMessages.UPDATE_WIDGET_ERROR);
      }

      // 4. combine data from storage and API
      let snippetGroups = [];
      snippetGroups = snippetGroups.concat(storageSnippetGroups).concat(apiSnippetGroups);
      let storageRootSnippetGroup = snippetGroups.find(x => x.id === (storageKeys.SNIPPET + 0));
      let apiRootSnippetGroup = snippetGroups.find(x => x.id === 0);
      let combinedRootSnippetGroup = { id: 0, type: snippetTypes.MULTIPLE, source: snippetSources.STORAGE, title: 'Snippets', content: 'Snippets', color_id: colorIds.COLOR_100, order_index: 0, snippets: [...(storageRootSnippetGroup?.snippets || []), ...(apiRootSnippetGroup?.snippets || [])] };
      snippetGroups = snippetGroups.filter(x => x.id !== (storageKeys.SNIPPET + 0) && x.id !== 0);
      snippetGroups.unshift(combinedRootSnippetGroup);
      console.log(`App.js -> updateDataForWidgets: Combined ${snippetGroups.length} snippet groups from storage and API:`, JSON.stringify(snippetGroups.map(x => x.id)));

      // 5. set snippet groups data for widget
      await widget.saveData('snippetGroups', snippetGroups);
      updateWidgets();
    } catch (error) {
      console.error('App.js -> updateDataForWidgets: updating snippet groups failed with error: ' + error.message);
      banner.showErrorMessage(readableErrorMessages.UPDATE_WIDGET_ERROR);
    }
  };

  const updateDataForKeyboard = async () => {
    try {
      console.log('App.js -> updateDataForKeyboard: about to get snippets for user');

      // 1. try to get storage snippets
      let storageSnippets = [];
      try {
        storageSnippets = await storage.getSnippets(undefined, true);
        _updateMetadata(storageSnippets, snippetSources.STORAGE);
        await analytics.setUserProperty('storage_snippet_count', storageSnippets.length.toString());
      } catch (error) {
        console.error('App.js -> updateDataForKeyboard: getting snippets from storage failed with error: ' + error.message);
        banner.showErrorMessage(readableErrorMessages.UPDATE_KEYBOARD_ERROR);
      }

      // 2. try to get API snippets
      let apiSnippets = [];
      try {
        let response = await api.getSnippets(0, true, await storage.getAuthorizationToken());
        if (!response?.ok) { throw new Error(`HTTP error with status ${response?.status}`); }
        let responseJson = await response.json();
        apiSnippets = responseJson.child_snippets ?? [];
        _updateMetadata(apiSnippets, snippetSources.API);
        await analytics.setUserProperty('api_snippet_count', apiSnippets.length.toString());
        console.log(`App.js -> updateDataForKeyboard: Got ${apiSnippets.length} snippets via API:`, JSON.stringify(apiSnippets.map(x => x.id)));
      } catch (error) {
        console.error('App.js -> updateDataForKeyboard: getting snippets from API failed with error: ' + error.message);
        banner.showErrorMessage(readableErrorMessages.UPDATE_KEYBOARD_ERROR);
      }
        
      // 4. combine data from storage and API
      let snippets = [];
      snippets = snippets.concat(storageSnippets).concat(apiSnippets);
      await analytics.setUserProperty('total_snippet_count', snippets.length.toString());
      await analytics.setUserProperty('total_snippet_group_count', snippets.filter(x => x.type === snippetTypes.MULTIPLE).length.toString());
      console.log(`App.js -> updateDataForKeyboard: Combined  ${snippets.length} snippets from storage and API:`, JSON.stringify(snippets.map(x => x.id)));

      // 5. set snippets data for keyboard
      await widget.saveData('snippets', snippets);
    } catch (error) {
      console.error('App.js -> updateDataForKeyboard: updating snippets failed with error: ' + error.message);
      banner.showErrorMessage(readableErrorMessages.UPDATE_KEYBOARD_ERROR);
    }

    function _updateMetadata(snippets, source) {
      snippets.forEach(x => { x.source = source; _updateMetadata(x.child_snippets, source); });
      snippets.sort((a, b) => a.order_index - b.order_index);
    }
  };

  const loadThemeAppearanceFromStorage = async () => {
    const themeId = await storage.getThemeId();
    const appearanceMode = await storage.getAppearanceMode() ?? appearanceModes.SYSTEM;
    await analytics.setUserProperties({ theme_id: themeId, appearance_mode: appearanceMode });
    console.log(`App.js -> loadThemeAppearanceFromStorage: found theme Id '${themeId}' and appearance mode '${appearanceMode}' in storage and about to set them in app..`);
    await updateThemer(themeId, appearanceMode);
    await updateAppearanceMode(appearanceMode);
  };

  const updateThemer = async (themeId, appearanceMode) => {
    try {
      themer.setThemeId(themeId);
      themer.setAppearanceMode(appearanceMode);
    } catch (error) {
      console.error('App.js -> updateThemer: updating themer failed with error: ' + error.message);
    }
  }

  const updateAppearanceMode = async (appearanceMode) => {
    try {
      dispatch({ type: 'UPDATE_APPEARANCE_MODE', payload: appearanceMode });
      console.log(`App.js -> updateAppearanceMode: updated appearance mode to '${appearanceMode}'`);
    } catch (error) {
      console.error('App.js -> updateAppearanceMode: updating appearance mode failed with error: ' + error.message);
    }
  }

  const startThemePreview = async (themeId) => {
    try {
      if (state.isThemePreview || themePreviewStatusIntervalId.current) { await endThemePreview(); }
      console.log(`App.js -> startThemePreview: request to preview theme with ID ${themeId}`);
      dispatch({ type: 'PREVIEWING_THEME', payload: true });
      await updateThemer(themeId, state.appearanceMode);
      let seconds = 60;
      const getStatusMessage = (seconds) => `Previewing the '${themes[themeId]?.name}' theme for ${seconds} seconds.`;
      banner.showStatusMessage(getStatusMessage(seconds), null, true);
      themePreviewStatusIntervalId.current = setInterval(async () => {
        if (seconds > 1) {
          seconds--;
          banner.showStatusMessage(getStatusMessage(seconds), null, false);
        } else {
          await endThemePreview();
        }
      }, 1000);
    } catch (error) {
      console.error('App.js -> startThemePreview: previewing theme failed with error: ' + error.message);
      banner.showErrorMessage(readableErrorMessages.THEME_PREVIEW_ERROR);
    }
  }

  const endThemePreview = async () => {
    try {
      if (state.isThemePreview || themePreviewStatusIntervalId.current) { 
        console.log('App.js -> endThemePreview: request to end current theme preview');
        dispatch({ type: 'PREVIEWING_THEME', payload: false });
        clearInterval(themePreviewStatusIntervalId.current);
        themePreviewStatusIntervalId.current = undefined;
        banner.hideMessage();
        await loadThemeAppearanceFromStorage();
      }
    } catch (error) {
      console.error('App.js -> endThemePreview: ending theme preview failed with error: ' + error.message);
    }
  };

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
      await analytics.setUserProperties({ subscription_type: activeSubscription?.type ?? 'No active subscription', entitlements: JSON.stringify(entitlements) });
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
          fallbackPlatformURL: Platform.OS === 'ios' ? 'https://apps.apple.com/us/app/snippeta-copy-manage-paste/id1282250868' : 'market://details?id=com.wavelinkllc.snippeta&showAllReviews=true',
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
        await analytics.logEvent('review_prompt_shown', { milestone_number: milestoneNumber.toString() });
      } else {
        console.log(`App.js -> updateMilestones: Not ready to prompt app review at milestone number ${milestoneNumber} and last review prompt time ${lastReviewPromptDate && JSON.stringify(lastReviewPromptDate)}`);
      }
    } catch (error) {
      console.error('App.js -> updateMilestones: failed with error: ' + error.message);
    }
  };

  const onSnippetChanged = async () => {
    console.log('App.js -> onSnippetChanged: snippet(s) was changed and need to refresh related state..');
    await updateDataForWidgets();
    await updateDataForKeyboard();
    await promptReviewIfReady();
  };

  const refreshFeatureAlerts = () => {
    console.log('App.js -> refreshFeatureAlerts: Triggering feature alerts refresh');
    dispatch({ type: 'REFRESH_FEATURE_ALERTS' });
  };

  return (
    <Sentry.TouchEventBoundary>
      <ApplicationContext.Provider value={{...state, themer, onSnippetChanged, updateThemer, startThemePreview, endThemePreview, updateAppearanceMode, loginWithCredentials, logout, updateEntitlements, refreshFeatureAlerts}}>
        <ActionSheetProvider>
          <FancyActionSheetProvider>
            <NavigationContainer 
              ref={navigationRef}
              onReady={() => { routeNameRef.current = navigationRef.current.getCurrentRoute().name; }}
              onStateChange={async () => {
                const previousRouteName = routeNameRef.current;
                const currentRouteName = navigationRef.current.getCurrentRoute().name;
                if (previousRouteName !== currentRouteName) {
                  await analytics.logScreenView(currentRouteName);
                }
                routeNameRef.current = currentRouteName;
              }}
            >
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
                <Stack.Group screenOptions={{ presentation: Platform.isPad ? 'fullScreenModal' : 'modal' }}>
                  <Stack.Screen
                    name="Keyboard"
                    component={KeyboardScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="Widget"
                    component={WidgetScreen}
                    options={{ headerShown: false }}
                  />
                </Stack.Group>
              </Stack.Navigator>
              <FlashMessage position="top" />
            </NavigationContainer>
          </FancyActionSheetProvider>
        </ActionSheetProvider>
      </ApplicationContext.Provider>
    </Sentry.TouchEventBoundary>
  );
}
