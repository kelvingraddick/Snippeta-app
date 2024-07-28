import React, { useContext, useEffect, useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showMessage, hideMessage } from "react-native-flash-message";
import Clipboard from '@react-native-clipboard/clipboard';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { ApplicationContext } from '../ApplicationContext';
import storage from '../helpers/storage';
import colors from '../helpers/colors';

const SnippetsScreen = ({ route, navigation }) => {
  const parentId = route.params?.parentId || 0;

  const [displayedSnippets, setDisplayedSnippets] = useState([]);

  const { snippets, isSnippetsLoading, loadSnippets } = useContext(ApplicationContext);

  const { showActionSheetWithOptions } = useActionSheet();

  useEffect(() => {
    let displayedSnippets = snippets;
    displayedSnippets.sort((a, b) => a.order_index - b.order_index);
    setDisplayedSnippets(displayedSnippets);
  }, [snippets]);

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
      (selectedIndex) => {
        switch (selectedIndex) {
          case options.Edit:
            navigation.navigate('Snippet', { snippet });
            break;
          case options['Move to top']:
          case options.Delete:
            showMessage({
              message: 'This feature is coming soon!',
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
            break;
          case 2: // Delete

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
          {displayedSnippets.map((snippet, index) => (
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