import React, { useContext, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { showMessage } from "react-native-flash-message";
import { useActionSheet } from '@expo/react-native-action-sheet';
import { ApplicationContext } from '../ApplicationContext';
import { storageKeys } from '../constants/storageKeys';
import { snippetTypes } from '../constants/snippetTypes';
import storage from '../helpers/storage';
import api from '../helpers/api';
import colors from '../helpers/colors';
import { snippetSources } from '../constants/snippetSources';
import { errorCodeMessages } from '../constants/errorCodeMessages';
import ColorButton from '../components/ColorButton';

const SnippetScreen = ({ route, navigation }) => {
  const snippetColors = [colors.lightYellow, colors.lightGreen, colors.lightBlue, colors.lightPurple, colors.lightRed, colors.lightGray];

  const getSnippets = route.params.getSnippets;

  const { user, isUserLoading } = useContext(ApplicationContext);

  const [isLoading, setIsLoading] = useState(false);
  const [snippet, setSnippet] = useState(route.params.snippet || {});

  const { showActionSheetWithOptions } = useActionSheet();

  const onBackTapped = async () => {
    navigation.goBack();
  };

  const onSaveTapped = async () => {
    try {
      setIsLoading(true);

      // if no source selected, let the user choose, or default to storage
      if (!snippet.source) {
        let snippetSource = snippetSources.STORAGE;
        if (user) {
          snippetSource = await selectSnippetSource();
          if (!snippetSource) { setIsLoading(false); return; }
        }
        snippet.source = snippetSource;
        setSnippet({...snippet, source: snippetSource});
      }

      // if source is storage, save in storage
      if (snippet.source == snippetSources.STORAGE) {
        const id = snippet.id ?? (storageKeys.SNIPPET + generateRandomString(10));
        await storage.saveSnippet({
          ...snippet,
          id: id,
          time: snippet.time ?? new Date(),
          order_index: snippet.order_index ?? 0,
        });
        console.log('SnippetScreen.js -> onSaveTapped: Saved snippet to storage with ID ' + id);
      }
      // if source is api, save via api
      else if (snippet.source == snippetSources.API && user) {
        const id = snippet.id ?? 0;
        const response = await api.saveSnippet(
          {
            ...snippet,
            id: id,
            parent_id: snippet.parent_id ?? 0,
            time: snippet.time ?? new Date(),
            order_index: snippet.order_index ?? 0,
          },
          await storage.getAuthorizationToken()
        );
        const responseJson = response && await response.json();
        if (responseJson && responseJson.success) {
          console.log('SnippetScreen.js -> onSaveTapped: Saved snippet via API with ID ' + id);
        } else {
          const errorMessage = responseJson?.error_code ? 'Saving snippet failed: ' + errorCodeMessages[responseJson.error_code] : 'Saving snippet failed with unknown error.';
          console.log('SnippetScreen.js -> onSaveTapped: ' + errorMessage);
          showErrorMessage(errorMessage);
          setIsLoading(false); return;
        }
      }

      setIsLoading(false);
      await getSnippets();
      navigation.goBack();

    } catch (error) {
      const errorMessage = 'Saving snippet failed with error: ' + error.message;
      console.error('SnippetScreen.js -> onSaveTapped: ' + errorMessage);
      showErrorMessage(errorMessage);
      setIsLoading(false);
    }
  };

  const onColorButtonTapped = async (colorId) => {
    setSnippet({ ...snippet, color_id: colorId });
  };

  const onTitleChangeText = async (text) => {
    setSnippet({ ...snippet, title: text });
  };

  const onContentChangeText = async (text) => {
    setSnippet({ ...snippet, content: text });
  };

  const selectSnippetSource = async () => {
    return new Promise((resolve, reject) => {
      const options = {}; options[snippetSources.API] = 0; options[snippetSources.STORAGE] = 1; options.Cancel = 2;
      showActionSheetWithOptions(
        {
          title: 'Where do you want to store this snippet?',
          options: Object.keys(options),
          cancelButtonIndex: options.Cancel,
        },
        async (selectedIndex) => {
          switch (selectedIndex) {
            case options[snippetSources.API]:
              resolve(snippetSources.API); break;
            case options[snippetSources.STORAGE]:
              resolve(snippetSources.STORAGE); break;
            default:
              resolve(null);
          }
        }
      );
    });
  };

  const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

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
      <ScrollView style={styles.container}>
        <View style={styles.headerView}>
          <View style={styles.titleView}>
            <Pressable onPress={onBackTapped} hitSlop={20}>
              <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={colors.white.hexCode} />
            </Pressable>
            <Text style={styles.title}>{`${snippet.id ? 'Edit' : 'New'} ${snippet.type == snippetTypes.SINGLE ? 'snippet' : 'list'}`}</Text>
            <Pressable onPress={onSaveTapped} hitSlop={20} disabled={isLoading || !snippet.title || snippet.title.length == 0 || !snippet.content || snippet.content.length == 0}>
              <Image source={require('../assets/images/checkmark.png')} style={[styles.saveIcon, { opacity: isLoading || !snippet.title || snippet.title.length == 0 || !snippet.content || snippet.content.length == 0 ? .1 : 1 }]} tintColor={colors.white.hexCode} />
            </Pressable>
          </View>
          <View style={styles.buttonsView}>
            {snippetColors.map((snippetColor, index) =>
              (<ColorButton key={index} color={snippetColor} isSelected={colors.getById(snippet.color_id) == snippetColor} onTapped={onColorButtonTapped} />)
            )}
          </View>
        </View>
        <View style={[styles.titleInputView, { backgroundColor: colors.getById(snippet.color_id)?.hexCode }]}>
          <TextInput style={styles.titleInput} placeholder={'Type or paste title here..'} placeholderTextColor={colors.darkGray.hexCode} multiline maxLength={50} onChangeText={onTitleChangeText}>{snippet.title}</TextInput>
        </View>
        <View style={styles.contentInputView}>
          <TextInput style={styles.contentInput} placeholder={'Type or paste content here..'} placeholderTextColor={colors.darkGray.hexCode} multiline maxLength={1000} onChangeText={onContentChangeText}>{snippet.content}</TextInput>
        </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white.hexCode,
  },
  headerView: {
    padding: 20,
    paddingTop: 60,
    borderRadius: 30,
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
  saveIcon: {
    height: 25,
    width: 25,
    marginTop: 2,
  },
  buttonsView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleInputView: {
    marginTop: 20,
    marginBottom: 15,
    marginHorizontal: 10,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    borderRadius: 30,
  },
  titleInput: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.darkGray.hexCode
  },
  contentInputView: {
    margin: 20,
    marginTop: 0,
  },
  contentInput: {
    fontSize: 17,
    color: colors.darkGray.hexCode
  }
});

export default SnippetScreen;