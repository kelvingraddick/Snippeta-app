import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showMessage } from "react-native-flash-message";
import { snippetTypes } from '../constants/snippetTypes';
import storage from '../helpers/storage';
import colors from '../helpers/colors';
import ColorButton from '../components/ColorButton';

const SnippetScreen = ({ route, navigation }) => {
  const snippetColors = [colors.lightYellow, colors.lightGreen, colors.lightBlue, colors.lightPurple, colors.lightRed, colors.lightGray];

  const getSnippets = route.params.getSnippets;

  const [isLoading, setIsLoading] = useState([]);
  const [snippet, setSnippet] = useState(route.params.snippet || {});

  const onBackTapped = async () => {
    navigation.goBack();
  };

  const onSaveTapped = async () => {
    try {
      setIsLoading(true);
      await storage.saveSnippet({
        ...snippet,
        id: snippet.id ?? (storage.keys.SNIPPET + generateRandomString(10)),
        time: new Date(),
        order_index: snippet.order_index ?? 0
      });
      setIsLoading(false);
      await getSnippets();
      navigation.goBack();
    } catch (error) {
      console.error('SnippetScreen.js -> onSaveTapped: Saving snippet failed with error: ' + error.message);
      showMessage({
        message: 'Saving snippet failed with error: ' + error.message,
        backgroundColor: colors.lightRed.hexCode,
        titleStyle: {
          fontWeight: 'bold',
          color: 'black',
          opacity: 0.60,
        }
      });
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

  const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  return (
      <ScrollView style={styles.container}>
        <View style={styles.headerView}>
          <View style={styles.titleView}>
            <Pressable onPress={onBackTapped} hitSlop={20}>
              <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={colors.white.hexCode} />
            </Pressable>
            <Text style={styles.title}>{`${snippet.id ? 'Edit' : 'New'} ${snippet.type == snippetTypes.SINGLE ? 'snippet' : 'list'}`}</Text>
            <Pressable onPress={onSaveTapped} hitSlop={20} disabled={!snippet.title || snippet.title.length == 0 || !snippet.content || snippet.content.length == 0}>
              <Image source={require('../assets/images/checkmark.png')} style={[styles.saveIcon, { opacity: !snippet.title || snippet.title.length == 0 || !snippet.content || snippet.content.length == 0 ? .1 : 1 }]} tintColor={colors.white.hexCode} />
            </Pressable>
          </View>
          <View style={styles.buttonsView}>
            {snippetColors.map((snippetColor, index) =>
              (<ColorButton key={index} color={snippetColor} isSelected={colors.getById(snippet.color_id) == snippetColor} onTapped={onColorButtonTapped} />)
            )}
          </View>
        </View>
        <View style={[styles.titleInputView, { backgroundColor: colors.getById(snippet.color_id)?.hexCode }]}>
          <TextInput style={styles.titleInput} placeholder={'Type or paste title here..'} placeholderTextColor={colors.darkGray.hexCode} multiline onChangeText={onTitleChangeText}>{snippet.title}</TextInput>
        </View>
        <View style={styles.contentInputView}>
          <TextInput style={styles.contentInput} placeholder={'Type or paste content here..'} placeholderTextColor={colors.darkGray.hexCode} multiline onChangeText={onContentChangeText}>{snippet.content}</TextInput>
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