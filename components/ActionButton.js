import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

const ActionButton = (props) => {
  const { iconImageSource, text, foregroundColor, backgroundColor, disabled, onTapped } = props;
  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: backgroundColor, opacity: disabled ? .1 : 1 }]} disabled={disabled} onPress={() => onTapped()}>
      <Image source={iconImageSource} style={styles.icon} tintColor={foregroundColor} />
      <Text style={[styles.text, { color: foregroundColor }]}>&nbsp;&nbsp;{text}&nbsp;&nbsp;</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 30
  },
  text: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  icon: {
    height: 14,
    width: 14,
    marginTop: 3,
    opacity: 0.50,
  },
});

export default ActionButton;