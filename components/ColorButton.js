import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const ColorButton = (props) => {
  const { id, color, isSelected, onTapped } = props;
  const ContainerComponent = Array.isArray(color) ? LinearGradient : View;
  const containerProps = Array.isArray(color) ?
    { style: [styles.container, isSelected ? styles.selectedContainer : null], colors: color, start: {x: 0, y: 0}, end: {x: 1, y: 0}, } :
    { style: [styles.container, isSelected ? styles.selectedContainer : null, { backgroundColor: color }], };
  return (
    <TouchableOpacity onPress={() => onTapped(id)}>
      <ContainerComponent {...containerProps} />
    </TouchableOpacity>
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