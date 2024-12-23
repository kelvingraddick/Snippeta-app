import React from 'react';
import { Image, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

const SettingView = (props) => {
  const { label, labelIconSource, isSelectable, isSelected, onTapped, isSwitchEnabled, onSwitchToggled, themer } = props;
  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: themer.getColor('content1.background') }]} onPress={onTapped}>
      <Image
        source={labelIconSource}
        style={styles.labelIcon}
        tintColor={themer.getColor('content1.foreground')}
        resizeMode='stretch'
      />
      <Text style={[styles.labelText, { color: themer.getColor('content1.foreground') }]} numberOfLines={1}>&nbsp;{label}</Text>
      { onSwitchToggled ?
        <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={isSwitchEnabled ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={onSwitchToggled}
          value={isSwitchEnabled}
        />
        : isSelectable ?
          ( isSelected &&
            <Image
              source={require('../assets/images/checkmark.png')}
              style={[styles.checkmarkIcon, { color: themer.getColor('button2.background') }]}
              tintColor={themer.getColor('button2.background')}
            />
          )
        :
        <Image
          source={require('../assets/images/back-arrow.png')}
          style={[styles.arrowIcon, { color: themer.getColor('listHeader1.foreground') }]}
          tintColor={themer.getColor('listHeader1.foreground')}
        />
      }
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 5,
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
  },
  labelIcon: {
    width: 17,
    height: 17,
    opacity: 0.25,
  },
  labelText: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
  },
  checkmarkIcon: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
  },
  arrowIcon: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
    opacity: 0.25,
    transform: [{ rotate: '180deg' }]
  }
});

export default SettingView;