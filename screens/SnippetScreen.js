import React, { useContext, useRef, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFancyActionSheet } from 'react-native-fancy-action-sheet';
import { ApplicationContext } from '../ApplicationContext';
import { storageKeys } from '../constants/storageKeys';
import { snippetTypes } from '../constants/snippetTypes';
import storage from '../helpers/storage';
import api from '../helpers/api';
import banner from '../helpers/banner';
import style from '../helpers/style';
import { snippetSources } from '../constants/snippetSources';
import { errorCodeMessages } from '../constants/errorCodeMessages';
import { moveSnippetOptions } from '../constants/moveSnippetOptions';
import { colorIds } from '../constants/colorIds';
import ColorButton from '../components/ColorButton';

const SnippetScreen = ({ route, navigation }) => {
  const callbacks = route.params.callbacks || [];

  const { themer, user, isUserLoading, onSnippetChanged } = useContext(ApplicationContext);

  const snippetColorOptions = [
    { id: colorIds.COLOR_1, color: themer.getColor(colorIds.COLOR_1) }, { id: colorIds.COLOR_2, color: themer.getColor(colorIds.COLOR_2) }, { id: colorIds.COLOR_3, color: themer.getColor(colorIds.COLOR_3) },
    { id: colorIds.COLOR_4, color: themer.getColor(colorIds.COLOR_4) }, { id: colorIds.COLOR_5, color: themer.getColor(colorIds.COLOR_5) }, { id: colorIds.COLOR_6, color: themer.getColor(colorIds.COLOR_6) },
  ];

  const [isLoading, setIsLoading] = useState(false);
  const [snippet, setSnippet] = useState(route.params.snippet || {});
  const contentCursorLineIndex = useRef();

  const { showFancyActionSheet } = useFancyActionSheet();

  const onBackTapped = async () => {
    navigation.goBack();
  };

  const onSaveTapped = async () => {
    try {
      setIsLoading(true);

      let snippetSource = snippet.source;
      if (!snippetSource) {  // if source is not pre-determined by parent, then let the user choose, or default to storage
        if (user) {
          snippetSource = await selectSnippetSource();
          if (!snippetSource) { setIsLoading(false); return; }
        } else {
          snippetSource = snippetSources.STORAGE;
        }
      }

      // if source is storage, save in storage
      if (snippetSource == snippetSources.STORAGE) {
        const isNew = (snippet.id == null || snippet.id == undefined) ? true : false;
        const id = snippet.id ?? (storageKeys.SNIPPET + generateRandomString(10));
        const snippetToSave = {
          ...snippet,
          id: id,
          source: snippetSource,
          title: snippet.title?.trim(),
          content: snippet.content?.trim(),
          time: snippet.time ?? new Date(),
          order_index: snippet.order_index ?? 0,
        };
        if (isNew) { await storage.moveSnippet(snippetToSave, moveSnippetOptions.TO_BOTTOM); } 
        else { await storage.saveSnippet(snippetToSave); }
        console.log('SnippetScreen.js -> onSaveTapped: Saved snippet to storage with ID ' + id);
      }
      // if source is api, save via api
      else if (snippetSource == snippetSources.API && user) {
        const id = snippet.id ?? 0;
        const response = await api.saveSnippet(
          {
            ...snippet,
            id: id,
            parent_id: snippet.parent_id ?? 0,
            source: snippetSource,
            title: snippet.title?.trim(),
            content: snippet.content?.trim(),
            time: snippet.time ?? new Date(),
            order_index: snippet.order_index ?? 0,
          },
          await storage.getAuthorizationToken()
        );
        if (!response?.ok) { throw new Error(`HTTP error with status ${response?.status}`); }
        const responseJson = response && await response.json();
        if (responseJson && responseJson.success) {
          console.log('SnippetScreen.js -> onSaveTapped: Saved snippet via API with ID ' + id);
        } else {
          const errorMessage = responseJson?.error_code ? 'Saving snippet failed: ' + errorCodeMessages[responseJson.error_code] : 'Saving snippet failed with unknown error.';
          console.log('SnippetScreen.js -> onSaveTapped: ' + errorMessage);
          banner.showErrorMessage(errorMessage);
          setIsLoading(false); return;
        }
      }

      setIsLoading(false);
      callbacks.forEach(async callback => { await callback(); });
      navigation.goBack();
      onSnippetChanged();

    } catch (error) {
      const errorMessage = 'Saving snippet failed with error: ' + error.message;
      console.error('SnippetScreen.js -> onSaveTapped: ' + errorMessage);
      banner.showErrorMessage(errorMessage);
      setIsLoading(false);
    }
  };

  const onColorButtonTapped = async (colorId) => {
    setSnippet({ ...snippet, color_id: colorId });
    route.params.snippet.color_id = colorId;
  };

  const onTitleChangeText = async (text) => {
    setSnippet({ ...snippet, title: text });
    route.params.snippet.title = text;
  };

  const onContentChangeText = async (text) => {
    const content = getFormattedContent(snippet?.content, text);
    setSnippet({ ...snippet, content: content });
    route.params.snippet.content = content;
  };

  const onContentSelectionChange = async ({ nativeEvent: { selection } }) => {
    const { start } = selection; // Get the cursor position
    const lines = snippet?.content?.split('\n') ?? []; // Split text into lines
    let characterCount = 0;
    for (let i = 0; i < lines.length; i++) {
      characterCount += lines[i].length + 1; // +1 for the newline character
      if (start < characterCount) {
        contentCursorLineIndex.current = i;
        break;
      }
    }
  };

  const selectSnippetSource = async () => {
    return new Promise((resolve, reject) => {
      const options = [{ id: snippetSources.API, name: snippetSources.API }, { id: snippetSources.STORAGE, name: snippetSources.STORAGE }];
      showFancyActionSheet({
        title: '💾 Snippet saving options ‎ ‎',
        message: 'It can be stored on this device, or in Snippeta Cloud',
        ...style.getFancyActionSheetStyles(themer),
        options: options,
        onOptionPress: async (option) => {
          switch (option.id) {
            case snippetSources.API:
              resolve(snippetSources.API); break;
            case snippetSources.STORAGE:
              resolve(snippetSources.STORAGE); break;
            default:
              resolve(null);
          }
        },
      });
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

  const getFormattedContent = (oldText, newText) => {
    try {
      let isNewLineProcessed = false;
      const oldLines = oldText?.split('\n') ?? [];
      const newLines = newText?.split('\n') ?? [];
      if (newLines.length === oldLines.length + 1) { // Only format if there is exactly one new line
        return newLines
          .map((newLine, index) => {
            // Find the index of the newly added line based on last cursor position
            if (!isNewLineProcessed && index == contentCursorLineIndex.current + 1) {
              isNewLineProcessed = true;
              const previousLine = newLines[index - 1];
              if (newLine.length === 0 && previousLine) {
                // 1. Continue unordered dashed list if the previous line was a (non-empty) list item
                if (previousLine.startsWith('- ') && previousLine.trim() !== '-') {
                  return '- ';
                }
                // 2. Continue unordered bullet-point list if the previous line was a (non-empty) list item
                if (previousLine.startsWith('• ') && previousLine.trim() !== '•') {
                  return '• ';
                }
                // 3. Continue ordered list if the previous line was ordered
                if (/^\d+\.\s/.test(previousLine) && !/^\d+\.$/.test(previousLine.trim())) {
                  const previousNumber = parseInt(previousLine.match(/\d+/)[0], 10);
                  return `${previousNumber + 1}. `;
                }
              }
            }
            // 4. return unchanged line
            return newLine;
          })
          .join('\n');
      }
    } catch (error) {
      const errorMessage = 'Formatting snippet content failed with error: ' + error.message;
      console.error('SnippetScreen.js -> onSaveTapped: ' + errorMessage);
      banner.showErrorMessage(errorMessage);
    }
    return newText;  // return unmodified code if more than one new line
  };

  return (
      <KeyboardAwareScrollView style={[styles.container, { backgroundColor: themer.getColor('background2') }]} keyboardShouldPersistTaps={'handled'}>
        <View style={[styles.headerView, { backgroundColor: themer.getColor('screenHeader1.background') } ]}>
          <View style={styles.titleView}>
            <Pressable onPress={onBackTapped} hitSlop={20}>
              <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={themer.getColor('screenHeader1.foreground')} />
            </Pressable>
            <Text style={[styles.title, { color: themer.getColor('screenHeader1.foreground') }]}>{`${snippet.id ? 'Edit' : 'New'} ${snippet.type == snippetTypes.SINGLE ? 'snippet' : (snippet.parent_id ? 'sub-group' : 'group')}`}</Text>
            <Pressable onPress={onSaveTapped} hitSlop={20} disabled={isLoading || !snippet.title || snippet.title.length == 0 || !snippet.content || snippet.content.length == 0}>
              <Image source={require('../assets/images/checkmark.png')} style={[styles.saveIcon, { opacity: isLoading || !snippet.title || snippet.title.length == 0 || !snippet.content || snippet.content.length == 0 ? .1 : 1 }]} tintColor={themer.getColor('screenHeader1.foreground')} />
            </Pressable>
          </View>
          <View style={styles.buttonsView}>
            {snippetColorOptions.map((snippetColorOption, index) =>
              (<ColorButton key={index} id={snippetColorOption.id} color={snippetColorOption.color} isSelected={snippet.color_id == snippetColorOption.id} onTapped={onColorButtonTapped} />)
            )}
          </View>
        </View>
        <View style={[styles.titleInputView, { backgroundColor: themer.getColor('textInput3.background') }]}>
          <TextInput style={[styles.titleInput, { color: themer.getColor('textInput3.foreground') }]} placeholder={`Type ${snippet.type == snippetTypes.SINGLE ? 'title' : `title of ${(snippet.parent_id ? 'sub-group' : 'group')}`} here..`} placeholderTextColor={themer.getPlaceholderTextColor('textInput3.foreground')} multiline maxLength={50} autoFocus onChangeText={onTitleChangeText}>{snippet.title}</TextInput>
        </View>
        <View style={styles.contentInputView}>
          <TextInput style={[styles.contentInput, { color: themer.getColor('textArea1.foreground') }]} placeholder={`Type ${snippet.type == snippetTypes.SINGLE ? 'content' : `description of ${(snippet.parent_id ? 'sub-group' : 'group')}`} here..`} placeholderTextColor={themer.getPlaceholderTextColor('textArea1.foreground')} multiline scrollEnabled={false} maxLength={1000} onChangeText={onContentChangeText} onSelectionChange={onContentSelectionChange}>{snippet.content}</TextInput>
        </View>
      </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerView: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 17.5,
    paddingBottom: 15,
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
  },
  contentInputView: {
    margin: 20,
    marginTop: 0,
  },
  contentInput: {
    fontSize: 17,
  }
});

export default SnippetScreen;