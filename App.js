import React, { useEffect, useReducer } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import FlashMessage from "react-native-flash-message";
import { ApplicationContext } from './ApplicationContext';
import authenticator from './helpers/authenticator';
import SnippetsScreen from './screens/SnippetsScreen';
import SnippetScreen from './screens/SnippetScreen';

const initialState = {
  user: null,
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
  }, []);

  const loginWithStorage = async () => {
    try {
      dispatch({ type: 'LOGGING_IN' });
      const user = await authenticator.login.withStorage();
      dispatch({ type: 'LOGGED_IN', payload: user });
    } catch (error) {
      console.error('App.js -> login: Logging in user failed with error: ' + error.message);
    }
  };

  const logout = async () => {
    try {
      dispatch({ type: 'LOGGING_OUT' });
      await authenticator.logout();
      dispatch({ type: 'LOGGED_OUT' });
    } catch (error) {
      console.error('App.js -> logout: Logging out user failed with error: ' + error.message);
    }
  };

  return (
    <ApplicationContext.Provider value={{...state, logout}}>
      <ActionSheetProvider>
        <NavigationContainer>
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
          </Stack.Navigator>
          <FlashMessage position="top" />
        </NavigationContainer>
      </ActionSheetProvider>
    </ApplicationContext.Provider>
  );
}

const styles = StyleSheet.create({

});
