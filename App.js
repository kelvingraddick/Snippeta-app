import React, { useEffect, useReducer } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import FlashMessage from "react-native-flash-message";
import { ApplicationContext } from './ApplicationContext';
import SnippetsScreen from './screens/SnippetsScreen';
import SnippetScreen from './screens/SnippetScreen';

const initialState = {
  
}

const reducer = (state, action) => {
  switch(action.type) {
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

  useEffect(() => {
    
  }, []);

  return (
    <ApplicationContext.Provider value={{...state}}>
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
              options={{ headerShown: true }}
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
