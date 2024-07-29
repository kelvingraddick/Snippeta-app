import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showMessage } from "react-native-flash-message";
import { snippetTypes } from '../constants/snippetTypes';
import colors from '../helpers/colors';

const SnippetScreen = ({ route, navigation }) => {
  const snippet = route.params.snippet || {};

  const [isLoading, setIsLoading] = useState([]);

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

  return (
      <ScrollView style={styles.container}>
        <View style={styles.headerView}>
          <View style={styles.titleView}>
            <Pressable onPress={onBackTapped} hitSlop={20}>
              <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={colors.white.hexCode} />
            </Pressable>
            <Text style={styles.title}>New {snippet.type == snippetTypes.SINGLE ? 'snippet' : 'list'}</Text>
            <View style={styles.backIcon} />
          </View>
        </View>
        <View style={styles.snippetsList}>
          <TextInput style={styles.cardDescription} numberOfLines={2}>{snippet.title}</TextInput>
          <TextInput style={styles.cardDescription} numberOfLines={2}>{snippet.content}</TextInput>
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
  settingsIcon: {
    height: 25,
    width: 25,
    marginTop: 2,
  },
  buttonView: {
    backgroundColor: colors.nebulaBlue.hexCode,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 30
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkGray.hexCode
  },
  buttonIcon: {
    opacity: 0.50,
  },
  snippetsList: {
    padding: 20
  },
});

export default SnippetScreen;