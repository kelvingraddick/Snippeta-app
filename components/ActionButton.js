import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

const ActionButton = (props) => {
  const { iconImageSource, text, foregroundColor, backgroundColor, disabled, onTapped, isLeft, isRight } = props;
  return (
    <TouchableOpacity style={[styles.container, (isLeft ? styles.leftContainer : null), (isRight ? styles.rightContainer : null), { backgroundColor: backgroundColor, opacity: disabled ? .1 : 1 }]} disabled={disabled} onPress={() => onTapped()}>
      <Image source={iconImageSource} style={styles.icon} tintColor={foregroundColor} />
      <Text style={[styles.text, { color: foregroundColor }]}>  {text}{ (!isLeft && !isRight) ? '  ' : isRight ? ' ' : '' }</Text>
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
  leftContainer: {
    flex: 1,
    borderTopEndRadius: 3,
    borderBottomEndRadius: 3,
  },
  rightContainer: {
    flex: 1,
    borderTopStartRadius: 3,
    borderBottomStartRadius: 3,
  },
  text: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: Platform.OS === 'ios' ? 0 : -4,
  },
  icon: {
    height: 14,
    width: 14,
    marginTop: 3,
    opacity: 0.50,
  },
});

export default ActionButton;