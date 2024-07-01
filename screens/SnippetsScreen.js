import React from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showMessage, hideMessage } from "react-native-flash-message";
import Clipboard from '@react-native-clipboard/clipboard';

const sections = [
  { title: 'Morning Inspiration', description: 'Start your day right with motivational quotes and affirmations to fuel your spirit and energize your mind.', color: '#feeaa6' },
  { title: 'Recipe Ideas', description: 'Discover mouthwatering recipes for every occasion, from quick weekday meals to gourmet dinner parties. Let your taste buds explore!', color: '#e9fdd0' },
  { title: 'Travel Bucket List', description: 'Dreaming of exotic destinations? Save your travel aspirations here and turn your wanderlust into reality, one destination at a time.', color: '#e9f4fe' },
  { title: 'Productivity Hacks', description: 'Boost your efficiency and get more done in less time with expert tips and tricks to streamline your workflow and crush your goals.', color: '#f4e8fe' },
  { title: 'Creative Writing Prompts', description: 'Unleash your imagination with a collection of writing prompts guaranteed to spark creativity and inspire your next masterpiece.', color: '#fdeae9' },
  { title: 'Other snippets', description: 'Random snippets that don\'t fit another category.', color: '#f7f7f7' },
];

const SnippetsScreen = () => {
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
          {sections.map((section, index) => (
            <TouchableOpacity key={index} style={[styles.cardView, { backgroundColor: section.color }]} onPress={() => onSnippetTapped(section)}>
              <View style={styles.cardContentView}>
                <View style={styles.cardTitleView}>
                  <Image source={require('../assets/images/copy-white.png')} style={styles.cardTitleIcon} tintColor={'#1d2027'} />
                  <Text style={styles.cardTitleText}>{section.title}</Text>
                </View>
                <Text style={styles.cardDescription} numberOfLines={2}>{section.description}</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.cardActionIcon}>&middot;&middot;&middot;</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
  );
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
};

const onSnippetTapped = (snippet) => {
  Clipboard.setString(snippet.description);
  showMessage({
    message: 'The text was copied to the clipboard',
    description: `"${snippet.description}"`,
    icon: { icon: () => <Image source={require('../assets/images/copy-white.png')} style={styles.cardTitleIcon} tintColor={'black'} />, position: 'right' },
    backgroundColor: snippet.color,
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
    color: '#1d2027'
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