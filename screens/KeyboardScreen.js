import React, { useContext, useState } from 'react';
import { Dimensions, Image, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { ApplicationContext } from '../ApplicationContext';
import ActionButton from '../components/ActionButton';

const KeyboardScreen = ({ navigation }) => {

  const { themer, refreshFeatureAlerts } = useContext(ApplicationContext);

  const [isInstructionsShowing, setIsInstructionsShowing] = useState(false);

  const onBackTapped = async () => {
    refreshFeatureAlerts();
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: themer.getColor('background1') }]}>
      <View style={[styles.headerView, { backgroundColor: themer.getColor('screenHeader1.background') } ]}>
        <View style={styles.titleView}>
          <Pressable onPress={onBackTapped} hitSlop={20}>
            <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={themer.getColor('screenHeader1.foreground')} />
          </Pressable>
          <Text style={[styles.title, { color: themer.getColor('screenHeader1.foreground') }]}>Keyboard</Text>
          <View style={styles.placeholderIcon} />
        </View>
      </View>
      { !isInstructionsShowing &&
        <>
          <Image source={Platform.OS === 'ios' ? require('../assets/images/keyboard-demo-ios.gif') : require('../assets/images/keyboard-demo-android.gif')} style={[styles.previewImage, { backgroundColor: Platform.OS === 'ios' ? 'rgb(255, 252, 255)' : '#F7F6FB' }]} />
          <View style={styles.contentView}>
            <Text style={[styles.titleText, { color: themer.getColor('content2.foreground') }]}>⌨️ The Snippeta Keyboard</Text>
            <Text style={[styles.descriptionText, { color: themer.getColor('content2.foreground') }]}>Quickly paste snippets into any other app</Text>
            <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}>• Tap a <Text style={{ fontWeight: 'bold' }}>snippet</Text> to paste it into the app you are in</Text>
            <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}>• Dedicated buttons for <Text style={{ fontWeight: 'bold' }}>space</Text> and <Text style={{ fontWeight: 'bold' }}>backspace</Text></Text>
            <Text style={[styles.featureText, { color: themer.getColor('content2.foreground'), marginBottom: 20 }]}>• After <Text style={{ fontStyle: 'italic' }}>installing</Text>, find it by cycling keyboards with the <Text style={{ fontWeight: 'bold' }}>{Platform.OS === 'ios' ? "globe 🌐" : "keyboard ⌨️"}</Text> button</Text>
            <ActionButton iconImageSource={require('../assets/images/gear-gray.png')} text={'How to install'} foregroundColor={themer.getColor('button2.foreground')} backgroundColor={themer.getColor('button2.background')} onTapped={() => setIsInstructionsShowing(true)} />
          </View>
        </>
      }
      { isInstructionsShowing &&
        <>
          <Image source={Platform.OS === 'ios' ? require('../assets/images/keyboard-install-ios.gif') : require('../assets/images/keyboard-install-android.gif')} style={[styles.previewImage, { backgroundColor: Platform.OS === 'ios' ? 'rgb(242, 242, 247)' : '#EFEEF1' }]} />
          <View style={styles.contentView}>
            <Text style={[styles.titleText, { color: themer.getColor('content2.foreground') }]}>⌨️ Install the keyboard</Text>
            <Text style={[styles.descriptionText, { color: themer.getColor('content2.foreground') }]}>..to quickly paste snippets into any other app</Text>
            { Platform.OS === 'ios' &&
              <>
                <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}>1. Tap the <Text style={{ fontWeight: 'bold' }}>System settings</Text> button below</Text>
                <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}>2. Tap the <Text style={{ fontWeight: 'bold' }}>Keyboards</Text> option</Text>
                <Text style={[styles.featureText, { color: themer.getColor('content2.foreground'), marginBottom: 20 }]}>3. Toggle on the <Text style={{ fontWeight: 'bold' }}>Snippeta Keyboard</Text> option, then also toggle on <Text style={{ fontWeight: 'bold' }}>Allow Full Access</Text></Text>
                <ActionButton iconImageSource={require('../assets/images/gear-gray.png')} text={'System settings'} foregroundColor={themer.getColor('button3.foreground')} backgroundColor={themer.getColor('button3.background')} onTapped={() => Linking.openURL('app-settings:')} />
              </>
            }
            { Platform.OS === 'android' &&
              <>
                <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}>1. Tap the <Text style={{ fontWeight: 'bold' }}>System settings</Text> button below</Text>
                <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}>2. On the settings screen, tap <Text style={{ fontWeight: 'bold' }}>System</Text></Text>
                <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}>3. Tap on <Text style={{ fontWeight: 'bold' }}>Languages & input</Text></Text>
                <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}>4. Tap <Text style={{ fontWeight: 'bold' }}>On-screen keyboard</Text> or <Text style={{ fontWeight: 'bold' }}>Virtual keyboard</Text></Text>
                <Text style={[styles.featureText, { color: themer.getColor('content2.foreground'), marginBottom: 20 }]}>5. Toggle on the <Text style={{ fontWeight: 'bold' }}>Snippeta Keyboard</Text> option</Text>
                <ActionButton iconImageSource={require('../assets/images/gear-gray.png')} text={'System settings'} foregroundColor={themer.getColor('button3.foreground')} backgroundColor={themer.getColor('button3.background')} onTapped={() => Linking.sendIntent('android.settings.SETTINGS')} />
              </>
            }
          </View>
        </>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerView: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backIcon: {
    height: 25,
    width: 25,
    marginTop: 2,
  },
  placeholderIcon: {
    height: 25,
    width: 25,
    marginTop: 2,
  },
  previewImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,
    resizeMode: 'contain',
  },
  contentView: {
    padding: 20,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  featureText: {
    fontSize: 15,
    marginBottom: 3,
  },
});

export default KeyboardScreen;