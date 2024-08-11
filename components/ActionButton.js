import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import colors from '../helpers/colors';

const ActionButton = (props) => {
  const { iconImageSource, text, color, disabled, onTapped } = props;
  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: color.hexCode, opacity: disabled ? .1 : 1 }]} disabled={disabled} onPress={() => onTapped()}>
      <Image source={iconImageSource} style={styles.icon} tintColor={colors.darkGray.hexCode} />
      <Text style={styles.text}>&nbsp;&nbsp;{text}&nbsp;&nbsp;</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.nebulaBlue.hexCode,
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
    color: colors.darkGray.hexCode
  },
  icon: {
    height: 18,
    width: 18,
    marginTop: 1,
    opacity: 0.50,
  },
});

export default ActionButton;