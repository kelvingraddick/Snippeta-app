import React, { useContext } from 'react';
import { Dimensions, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { ApplicationContext } from '../ApplicationContext';

const WidgetScreen = ({ navigation }) => {

  const { themer } = useContext(ApplicationContext);

  const onBackTapped = async () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: themer.getColor('background1') }]}>
      <View style={[styles.headerView, { backgroundColor: themer.getColor('screenHeader1.background') } ]}>
        <View style={styles.titleView}>
          <Pressable onPress={onBackTapped} hitSlop={20}>
            <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={themer.getColor('screenHeader1.foreground')} />
          </Pressable>
          <Text style={[styles.title, { color: themer.getColor('screenHeader1.foreground') }]}>Widget</Text>
          <View style={styles.placeholderIcon} />
        </View>
      </View>
      <Image source={Platform.OS === 'ios' ? require('../assets/images/widget-preview-ios.jpeg') : require('../assets/images/widget-preview-android.jpeg')} style={styles.previewImage} />
      <View style={styles.contentView}>
        <Text style={[styles.titleText, { color: themer.getColor('content2.foreground') }]}>📱 Install the widget</Text>
        <Text style={[styles.descriptionText, { color: themer.getColor('content2.foreground') }]}>..to access snippets from the device home screen</Text>
        { Platform.OS === 'ios' &&
          <>
            <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}>1. Hold down on the Home Screen until the <Text style={{ fontWeight: 'bold' }}>edit mode</Text> appears.*</Text>
            <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}>2. Tap the <Text style={{ fontWeight: 'bold' }}>Edit</Text> button, then the <Text style={{ fontWeight: 'bold' }}>Add Widget</Text> button</Text>
            <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}>3. Search for <Text style={{ fontWeight: 'bold' }}>"Snippeta"</Text> and choose it</Text>
            <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}>4. Swipe to choose the widget type you want and tap <Text style={{ fontWeight: 'bold' }}>Add Widget</Text> to add it to your Home Screen</Text>
          </>
        }
        { Platform.OS === 'android' &&
          <>
            <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}>1. Hold down on the Home Screen until the <Text style={{ fontWeight: 'bold' }}>edit mode</Text> appears.*</Text>
            <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}>2. Tap the option for <Text style={{ fontWeight: 'bold' }}>Widgets</Text> or <Text style={{ fontWeight: 'bold' }}>Add widgets</Text></Text>
            <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}>3. Search for <Text style={{ fontWeight: 'bold' }}>"Snippeta"</Text> and choose it</Text>
            <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}>4. Tap <Text style={{ fontWeight: 'bold' }}>Add</Text> or <Text style={{ fontWeight: 'bold' }}>Add Widget</Text> to add it to your Home Screen</Text>
          </>
        }
        <Text style={[styles.featureText, { color: themer.getColor('content2.foreground'), textAlign: 'center', fontStyle: 'italic', opacity: 0.50, marginTop: 10 }]}>*Go to your device's Home Screen to start</Text>
      </View>
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
    resizeMode: 'cover',
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

export default WidgetScreen;