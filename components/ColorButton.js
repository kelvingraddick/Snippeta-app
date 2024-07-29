import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

const ColorButton = (props) => {
  const { color, isSelected, onTapped } = props;
  return (
    <TouchableOpacity style={[styles.container, isSelected ? styles.selectedContainer : null, { backgroundColor: color.hexCode }]} onPress={() => onTapped(color.id)} />
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    width: 50,
    borderRadius: 25,
    opacity: .50,
  },
  selectedContainer: {
    opacity: 1,
  },
});

export default ColorButton;