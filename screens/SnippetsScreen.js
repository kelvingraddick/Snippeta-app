import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showMessage } from "react-native-flash-message";
import Clipboard from '@react-native-clipboard/clipboard';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { snippetTypes } from '../constants/snippetTypes';
import storage from '../helpers/storage';
import colors from '../helpers/colors';
import SnippetView from '../components/SnippetView';

const SnippetsScreen = ({ route, navigation }) => {
  const parentSnippet = route.params?.parentSnippet;

  const [isLoading, setIsLoading] = useState(true);
  const [snippets, setSnippets] = useState([]);

  const { showActionSheetWithOptions } = useActionSheet();

  const tutorialSnippets = [
    { id: storage.keys.SNIPPET + 1, type: snippetTypes.SINGLE, title: 'Welcome to Snippeta!', content: 'Snippeta is the best way to copy, paste, and manage snippets of text! Copy text to your clipboard with a single tap; no highlighting or long-tapping!', color_id: colors.lightYellow.id, time: new Date(), order_index: 0 },
    { id: storage.keys.SNIPPET + 2, type: snippetTypes.SINGLE, title: 'How to use:', content: 'Tap the button above to create a new snippet. Or tap on this snippet to copy it to your clipboard for pasting later!', color_id: colors.lightGreen.id, time: new Date(), order_index: 1 },
    { id: storage.keys.SNIPPET + 3, type: snippetTypes.MULTIPLE, title: 'Go PRO!', content: 'Want more out of Snippeta? Take your account pro and get access to create lists and more!', color_id: colors.lightBlue.id, time: new Date(), order_index: 2 },
  ];

  useEffect(() => {
    getSnippets();
  }, []);

  const getSnippets = async () => {
    try {
      setIsLoading(true);
      // try to get snippets for current parent ID
      let snippets = await storage.getSnippets(parentSnippet?.id);
      // if in root snippet list, and no snippets exist, then populate with tutorial snippets
      if (!parentSnippet && snippets.length == 0) {
        console.log('SnippetsScreen.js -> loadSnippets: No snippets in root snippet list. Adding tutorial snippets..');
        for (const tutorialSnippet of tutorialSnippets) {
          await storage.saveSnippet(tutorialSnippet);
        }
        snippets = await storage.getSnippets(parentSnippet?.id);
      }
      // sort snippets by order index
      snippets.sort((a, b) => a.order_index - b.order_index);
      // set snippets for display
      setSnippets(snippets);
      setIsLoading(false);
    } catch (error) {
      console.error('SnippetsScreen.js -> loadSnippets: Loading snippets data failed with error: ' + error.message);
    }
  };

  const deleteSnippet = async (id) => {
    try {
      setIsLoading(true);
      // try to delete snippets for current ID
      await storage.deleteSnippet(id);
      setIsLoading(false);
      await getSnippets();
    } catch (error) {
      console.error('SnippetsScreen.js -> deleteSnippet: Deleting snippet failed with error: ' + error.message);
    }
  };

  const onBackTapped = async () => {
    navigation.goBack();
  };

  const onSettingsTapped = async () => {
    showMessage({
      message: 'The settings button was tapped!',
      titleStyle: {
        fontWeight: 'bold',
        color: 'black',
        opacity: 0.60,
      },
      textStyle: {
        fontStyle: 'italic',
        color: 'black',
        opacity: 0.60,
      }
    });
  };

  const onNewSnippetTapped = async () => {
    navigation.navigate('Snippet', { snippet: { parent_id: parentSnippet?.id, type: snippetTypes.SINGLE, color_id: colors.lightYellow.id }, getSnippets: getSnippets });
  
    /*
    var message = await Clipboard.getString();
    showMessage({
      message: 'This text was taken from the clipboard',
      description: `"${message}"`,
      icon: { icon: () => <Image source={require('../assets/images/copy-white.png')} style={styles.cardTitleIcon} tintColor={'black'} />, position: 'right' },
      titleStyle: {
        fontWeight: 'bold',
        color: 'black',
        opacity: 0.60,
      },
      textStyle: {
        fontStyle: 'italic',
        color: 'black',
        opacity: 0.60,
      }
    });
    */
  };
  
  const onSnippetTapped = (snippet) => {
    if (snippet.type == snippetTypes.SINGLE) {
      Clipboard.setString(snippet.content);
      showMessage({
        message: 'The text was copied to the clipboard',
        description: `"${snippet.content}"`,
        icon: { icon: () => <Image source={require('../assets/images/copy-white.png')} style={styles.messageIcon} tintColor={colors.black.hexCode} />, position: 'right' },
        backgroundColor: colors.getById(snippet.color_id)?.hexCode,
        titleStyle: {
          fontWeight: 'bold',
          color: 'black',
          opacity: 0.60,
        },
        textStyle: {
          fontStyle: 'italic',
          color: 'black',
          opacity: 0.60,
        }
      });
    } else { // snippetTypes.MULTIPLE
      navigation.push('Snippets', { parentSnippet: snippet });
    }
  };

  const onSnippetMenuTapped = (snippet) => {
    const options = { 'Edit': 0, 'Move to top': 1, 'Delete': 2, 'Cancel': 3 };
    showActionSheetWithOptions(
      {
        options: Object.keys(options),
        cancelButtonIndex: options.Cancel,
        destructiveButtonIndex: options.Delete,
      },
      async (selectedIndex) => {
        switch (selectedIndex) {
          case options.Edit:
            navigation.navigate('Snippet', { snippet, getSnippets });
            break;
          case options['Move to top']:
          case options.Delete:
            await deleteSnippet(snippet.id);
            break;
        }
      }
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerView}>
        <View style={styles.titleView}>
          {!parentSnippet && 
            <View style={styles.backIcon} />
          }
          {!parentSnippet && 
            <Image source={require('../assets/images/logo.png')} style={styles.logoIcon} tintColor={colors.white.hexCode} resizeMode='contain' />
          }
          {parentSnippet &&
            <Pressable onPress={onBackTapped} hitSlop={20}>
              <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={colors.white.hexCode} />
            </Pressable>
          }
          {parentSnippet &&
            <Text style={styles.title} numberOfLines={2}>{parentSnippet ? parentSnippet.title : 'Snippeta'}</Text>
          }
          <Pressable onPress={onSettingsTapped} hitSlop={20}>
            <Image source={require('../assets/images/gear-gray.png')} style={styles.settingsIcon} tintColor={colors.white.hexCode} />
          </Pressable>
        </View>
        <TouchableOpacity style={styles.buttonView} onPress={() => onNewSnippetTapped()}>
          <Image source={require('../assets/images/plus.png')} style={styles.buttonIcon} tintColor={colors.darkGray.hexCode} />
          <Text style={styles.buttonText}>&nbsp;&nbsp;New snippet or list&nbsp;&nbsp;</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        style={styles.snippetsList}
        data={snippets}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => <SnippetView snippet={item} onSnippetTapped={onSnippetTapped} onSnippetMenuTapped={onSnippetMenuTapped} />}
      />
    </View>
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
    gap: 20,
    marginBottom: 20
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white.hexCode
  },
  logoIcon: {
    flex: 1,
    height: 40,
    marginTop: 7,
  },
  backIcon: {
    height: 25,
    width: 25,
    marginTop: 2,
  },
  settingsIcon: {
    height: 25,
    width: 25,
    marginTop: 2,
  },
  messageIcon: {
    height: 20,
    width: 20,
    color: colors.darkGray.hexCode,
    opacity: 0.25,
  },
  buttonView: {
    backgroundColor: colors.nebulaBlue.hexCode,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 30
  },
  buttonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.darkGray.hexCode
  },
  buttonIcon: {
    height: 18,
    width: 18,
    marginTop: 1,
    opacity: 0.50,
  },
  snippetsList: {
    padding: 20
  },
});

export default SnippetsScreen;