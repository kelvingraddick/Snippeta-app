import React from 'react';
import { Image, View, Text, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar, Button, Card } from 'react-native-paper';
import { showMessage, hideMessage } from "react-native-flash-message";
import Clipboard from '@react-native-clipboard/clipboard';

const sections = [
  { title: 'Morning Inspiration', description: 'Start your day right with motivational quotes and affirmations to fuel your spirit and energize your mind.', color: '#F9C74F' },
  { title: 'Recipe Ideas', description: 'Discover mouthwatering recipes for every occasion, from quick weekday meals to gourmet dinner parties. Let your taste buds explore!', color: '#43AA8B' },
  { title: 'Travel Bucket List', description: 'Dreaming of exotic destinations? Save your travel aspirations here and turn your wanderlust into reality, one destination at a time.', color: '#EEEEFE' },
  { title: 'Productivity Hacks', description: 'Boost your efficiency and get more done in less time with expert tips and tricks to streamline your workflow and crush your goals.', color: '#5C63FF' },
  { title: 'Creative Writing Prompts', description: 'Unleash your imagination with a collection of writing prompts guaranteed to spark creativity and inspire your next masterpiece.', color: '#F9844A' },
];

const SnippetsScreen = () => {
  return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerView}>
          <View style={styles.titleView}>
            <Text style={styles.title}>Snippets</Text>
            <Avatar.Image size={50} source={{ uri: '' }} />
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
                  <Image source={require('../assets/images/copy-white.png')} style={styles.cardTitleIcon} tintColor={'black'} />
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
    backgroundColor: '#EEEEFE',
  },
  headerView: {
    padding: 20,
    paddingTop: 60,
    borderRadius: 30,
    shadowColor: 'black',
    shadowOffset: 4,
    shadowOpacity: 1,
    shadowRadius: 4,
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
  buttonView: {
    backgroundColor: '#5C63FF',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 15,
    marginBottom: 20,
    borderRadius: 5
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    opacity: 0.60
  },
  cardsView: {
    padding: 20
  },
  cardView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 5,
    padding: 20,
    marginBottom: 16,
    shadowColor: 'black',
    shadowOffset: 1,
    shadowOpacity: 0.75,
    shadowRadius: 1,
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
    opacity: 0.60,
  },
  cardTitleText: {
    fontSize: 15,
    fontWeight: 'bold',
    opacity: 0.60,
  },
  cardDescription: {
    fontSize: 15,
    opacity: 0.60,
  },
  cardActionIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    opacity: 0.60,
  }
});

export default SnippetsScreen;