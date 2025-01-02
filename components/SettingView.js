import React from 'react';
import { Image, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

const SettingView = (props) => {
  const { label, labelIconSource, isPro, isSelectable, isSelected, onTapped, isSwitchEnabled, onSwitchToggled, isTop, isBottom, themer } = props;
  return (
    <TouchableOpacity style={[styles.container, (isTop ? styles.topContainer : null), (isBottom ? styles.bottomContainer : null), { backgroundColor: themer.getColor('content2.background') }]} onPress={onTapped}>
      <View style={[styles.labelView, {}]}>
        <Text style={[styles.labelText, { color: themer.getColor('content2.foreground') }]} numberOfLines={1}>&nbsp;{label}</Text>
        { isPro && <Text style={[styles.labelTag, { color: themer.getColor('content2.background'), backgroundColor: themer.getColor('content2.foreground'), }]} numberOfLines={1}>PRO</Text> }
      </View>
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 5,
    borderRadius: 3,
    padding: 15,
    marginBottom: 3,
  },
  topContainer: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  bottomContainer: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  labelView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  labelText: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  labelTag: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
    overflow: 'hidden',
    fontSize: 12,
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