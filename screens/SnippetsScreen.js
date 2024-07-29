import React, { useContext, useEffect, useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showMessage, hideMessage } from "react-native-flash-message";
import Clipboard from '@react-native-clipboard/clipboard';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { ApplicationContext } from '../ApplicationContext';
import { snippetTypes } from '../constants/snippetTypes';
import storage from '../helpers/storage';
import colors from '../helpers/colors';

const SnippetsScreen = ({ route, navigation }) => {
  const parentId = route.params?.parentId;

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
      let snippets = await storage.getSnippets(parentId);
      // if in root snippet list, and no snippets exist, then populate with tutorial snippets
      if (!parentId && snippets.length == 0) {
        console.log('SnippetsScreen.js -> loadSnippets: No snippets in root snippet list. Adding tutorial snippets..');
        for (const tutorialSnippet of tutorialSnippets) {
          await storage.saveSnippet(tutorialSnippet);
        }
        snippets = await storage.getSnippets();
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
    navigation.navigate('Snippet', { snippet: { parent_id: parentId, type: 0, color_id: 1 } });
  
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
    Clipboard.setString(snippet.content);
    showMessage({
      message: 'The text was copied to the clipboard',
      description: `"${snippet.content}"`,
      icon: { icon: () => <Image source={require('../assets/images/copy-white.png')} style={styles.cardTitleIcon} tintColor={'black'} />, position: 'right' },
      backgroundColor: colors.getById(snippet.color_id).hexCode,
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
            navigation.navigate('Snippet', { snippet });
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerView}>
          <View style={styles.titleView}>
            <Text style={styles.title}>Snippets</Text>
            <Pressable onPress={onSettingsTapped} hitSlop={20}>
              <Image source={require('../assets/images/gear-gray.png')} style={styles.settingsIcon} tintColor={'white'} />
            </Pressable>
          </View>
          <TouchableOpacity style={styles.buttonView} onPress={() => onNewSnippetTapped()}>
            <Text style={styles.buttonText}>+ New snippet / list</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cardsView}>
          {snippets.map((snippet, index) => (
            <TouchableOpacity key={index} style={[styles.cardView, { backgroundColor: colors.getById(snippet.color_id).hexCode }]} onPress={() => onSnippetTapped(snippet)}>
              <View style={styles.cardContentView}>
                <View style={styles.cardTitleView}>
                  <Image source={require('../assets/images/copy-white.png')} style={styles.cardTitleIcon} tintColor={'#1d2027'} />
                  <Text style={styles.cardTitleText}>&nbsp;{snippet.title}</Text>
                </View>
                <Text style={styles.cardDescription} numberOfLines={2}>{snippet.content}</Text>
              </View>
              <TouchableOpacity onPress={() => onSnippetMenuTapped(snippet)} hitSlop={40}>
                <Text style={styles.cardActionIcon}>&middot;&middot;&middot;</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerView: {
    padding: 20,
    paddingTop: 60,
    borderRadius: 30,
    backgroundColor: '#1d2027',
  },
  titleView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white'
  },
  settingsIcon: {
    height: 25,
    width: 25,
    marginTop: 2,
  },
  buttonView: {
    backgroundColor: '#5C63FF',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 30
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1d2027',
  },
  cardsView: {
    padding: 20
  },
  cardView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
  },
  cardContentView: {
    flexDirection: 'column',
    gap: 5,
    marginRight: 20
  },
  cardTitleView: {
    flexDirection: 'row',
    gap: 5
  },
  cardTitleIcon: {
    height: 20,
    width: 20,
    color: '#1d2027',
    opacity: 0.25
  },
  cardTitleText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1d2027'
  },
  cardDescription: {
    fontSize: 15,
    color: '#1d2027'
  },
  cardActionIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1d2027'
  }
});

export default SnippetsScreen;