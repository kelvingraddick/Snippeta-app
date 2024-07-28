import React, { useState, useEffect } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showMessage, hideMessage } from "react-native-flash-message";
import Clipboard from '@react-native-clipboard/clipboard';
import { storage } from '../helpers/storage';
import { colors } from '../helpers/colors';

const SnippetScreen = ({ route, navigation }) => {
  const snippet = route.params.snippet || {};

  const [isLoading, setIsLoading] = useState([]);

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
    navigation.navigate('Snippet', { parentId: parentId });
  
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

  return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerView}>
          <View style={styles.titleView}>
            <Text style={styles.title}>New snippet</Text>
          </View>
          {snippet.type == 1 &&
            <TouchableOpacity style={styles.buttonView} onPress={() => onNewSnippetTapped()}>
              <Text style={styles.buttonText}>+ New snippet / list</Text>
            </TouchableOpacity>
          }
        </View>
        <View style={styles.cardsView}>
          <TextInput style={styles.cardDescription} numberOfLines={2}>{snippet.title}</TextInput>
          <TextInput style={styles.cardDescription} numberOfLines={2}>{snippet.content}</TextInput>
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

export default SnippetScreen;