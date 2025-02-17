import React from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';

const SnippetaCloudView = (props) => {
  const { children, themer, user, isLargeLogo, isCentered } = props;
  return (
    <View style={[styles.container, { backgroundColor: themer.getColor('content2.background'), alignItems: isCentered ? 'center' : 'stretch', }]}>
      <View style={isLargeLogo ? styles.largeLogoView : styles.smallLogoView}>
        <Image source={require('../assets/images/logo.png')} style={isLargeLogo ? styles.largeLogoIcon : styles.smallLogoIcon} tintColor={themer.getColor('content2.foreground')} resizeMode='contain' />
        <Text style={[isLargeLogo ? styles.largeTitleText : styles.smallTitleText, { color: themer.getColor('content2.foreground') }]}>Cloud</Text>
      </View>
      { !user && 
        <View style={styles.contentView}>
          <Text style={[styles.descriptionText, { color: themer.getColor('content2.foreground'), textAlign: isCentered ? 'center' : 'auto', }]}>Create an account for more features*</Text>
          <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}>☁️ Sync & backup snippets to the Cloud</Text>
          <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}>📱 Access your snippets on different devices</Text>
          <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}>🛒 Unlock <Text style={{ fontWeight: 'bold' }}>Snippeta Pro</Text> on multiple devices</Text>
          <Text style={[styles.featureText, { color: themer.getColor('content2.foreground'), textAlign: 'center', fontStyle: 'italic', opacity: 0.50, marginTop: 5 }]}>*Requires a Snippeta Pro subscription</Text>
        </View>
      }
      { user && user.first_name && user.last_name &&
        <Text style={[styles.descriptionText, { color: themer.getColor('content2.foreground') }]}>You are logged in as <Text style={{ fontWeight: 'bold' }}>{user.first_name} {user.last_name}</Text></Text>
      }
      <View style={styles.buttonsView}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  largeLogoView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  smallLogoView: {
    flexDirection: 'row',
    left: -3,
    marginBottom: 2,
  },
  largeLogoIcon: {
    height: 35,
    width: 150,
    marginTop: 6,
  },
  smallLogoIcon: {
    height: 25,
    width: 105,
    marginTop: Platform.OS === 'ios' ? 1 : 5,
  },
  largeTitleText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  smallTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentView: {
    marginBottom: 20,
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
  buttonsView: {
    alignSelf: 'stretch',
    justifyContent: 'space-evenly',
  },
});

export default SnippetaCloudView;