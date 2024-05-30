import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar, Button, Card } from 'react-native-paper';

const sections = [
  { title: 'Morning Inspiration', description: 'Start your day right with motivational quotes and affirmations to fuel your...', color: '#FFEB3B' },
  { title: 'Recipe Ideas', description: 'Discover mouthwatering recipes for every occasion, from quick weekday...', color: '#4CAF50' },
  { title: 'Travel Bucket List', description: 'Dreaming of exotic destinations? Save your travel aspirations here and turn...', color: '#E0E0E0' },
  { title: 'Productivity Hacks', description: 'Boost your efficiency and get more done in less time with expert tips and...', color: '#3F51B5' },
  { title: 'Creative Writing Prompts', description: 'Unleash your imagination with a collection of writing prompts guarante...', color: '#FF5722' },
];

const SnippetsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Snippets</Text>
        <Avatar.Image size={48} source={{ uri: 'https://via.placeholder.com/150' }} />
      </View>
      <Button mode="contained" onPress={() => {}} style={styles.button}>
        + New snippet / list
      </Button>
      {sections.map((section, index) => (
        <TouchableOpacity key={index} style={[styles.card, { backgroundColor: section.color }]}>
          <Text style={styles.cardTitle}>{section.title}</Text>
          <Text style={styles.cardDescription}>{section.description}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  button: {
    marginBottom: 16,
    backgroundColor: '#6200EE',
  },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
  },
});

export default SnippetsScreen;