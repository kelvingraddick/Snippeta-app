import React, { useEffect, useReducer } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FlashMessage from "react-native-flash-message";
import { ApplicationContext } from './ApplicationContext';
import { snippetTypes } from './constants/snippetTypes';
import colors from './helpers/colors';
import storage from './helpers/storage';
import SnippetsScreen from './screens/SnippetsScreen';
import SnippetScreen from './screens/SnippetScreen';

const initialState = {
  snippets: [],
  isSnippetsLoading: true,
}

const reducer = (state, action) => {
  switch(action.type) {
    case 'LOADING_SNIPPETS':
      return { ...state, snippets: [], isSnippetsLoading: true };
    case 'LOADED_SNIPPETS':
      return { ...state, snippets: action.payload, isSnippetsLoading: false };
    default:
      return state;
  }
};

function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const defaultSnippets = [
    { id: storage.keys.SNIPPET + 1, parent_id: storage.keys.SNIPPET + 0, type: snippetTypes.SINGLE, title: 'Welcome to Snippeta!', content: 'Snippeta is the best way to copy, paste, and manage snippets of text! Copy text to your clipboard with a single tap; no highlighting or long-tapping!', color_id: colors.lightYellow.id, time: new Date(), order_index: 0 },
    { id: storage.keys.SNIPPET + 2, parent_id: storage.keys.SNIPPET + 0, type: snippetTypes.SINGLE, title: 'How to use:', content: 'Tap the button above to create a new snippet. Or tap on this snippet to copy it to your clipboard for pasting later!', color_id: colors.lightGreen.id, time: new Date(), order_index: 1 },
    { id: storage.keys.SNIPPET + 3, parent_id: storage.keys.SNIPPET + 0, type: snippetTypes.SINGLE, title: 'Go PRO!', content: 'Want more out of Snippeta? Take your account pro and get access to create lists and more!', color_id: colors.lightBlue.id, time: new Date(), order_index: 2 },
  ];

  useEffect(() => {
    loadSnippets();
  }, []);

  const loadSnippets = async () => {
    try {
      dispatch({ type: 'LOADING_SNIPPETS' });
      let data = await storage.getSnippets(storage.keys.SNIPPET + 0);
      if (!data || data.length == 0) {
        console.log('No snippets in root. Saving default snippets..', data);
        for (const defaultSnippet of defaultSnippets) {
          await storage.saveSnippet(defaultSnippet);
        }
        data = await storage.getSnippets(storage.keys.SNIPPET + 0);
      }
      console.log('LOADED_SNIPPETS: ', `Loaded ${data.length} snippets from storage.`);
      dispatch({ type: 'LOADED_SNIPPETS', payload: data });
    } catch (error) {
      console.error('Loading snippets data failed with error: ' + error.message);
    }
  };

  return (
    <ApplicationContext.Provider value={{...state, loadSnippets}}>
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
            options={{ headerShown: true }}
          />
        </Stack.Navigator>
        <FlashMessage position="top" />
      </NavigationContainer>
    </ApplicationContext.Provider>
  );
}

const styles = StyleSheet.create({

});
