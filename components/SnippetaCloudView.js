import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import colors from '../helpers/colors';

const SnippetaCloudView = (props) => {
  const { children, user, isLargeLogo, isCentered } = props;
  return (
    <View style={[styles.container, { alignItems: isCentered ? 'center' : 'stretch', }]}>
      <View style={isLargeLogo ? styles.largeLogoView : styles.smallLogoView}>
        <Image source={require('../assets/images/logo.png')} style={isLargeLogo ? styles.largeLogoIcon : styles.smallLogoIcon} tintColor={colors.darkGray.hexCode} resizeMode='contain' />
        <Text style={isLargeLogo ? styles.largeTitleText : styles.smallTitleText}>Cloud</Text>
      </View>
      { !user && 
        <View style={styles.contentView}>
          <Text style={[styles.descriptionText,{ textAlign: isCentered ? 'center' : 'auto', }]}>Create an account for more features*</Text>
          <Text style={styles.featureText}>☁️ Sync & backup snippets to the Cloud</Text>
          <Text style={styles.featureText}>📱 Access your snippets on different devices</Text>
          <Text style={styles.featureText}>🛒 Unlock <Text style={{ fontWeight: 'bold' }}>Snippeta Pro</Text> on multiple devices</Text>
          <Text style={[styles.featureText, { textAlign: 'center', fontStyle: 'italic', opacity: 0.50, marginTop: 5 }]}>*Requires a Snippeta Pro subscription</Text>
        </View>
      }
      { user && user.first_name && user.last_name &&
        <Text style={styles.descriptionText}>You are logged in as <Text style={{ fontWeight: 'bold' }}>{user.first_name} {user.last_name}</Text></Text>
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
    backgroundColor: colors.white.hexCode,
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
    marginTop: 1,
  },
  largeTitleText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.darkGray.hexCode,
  },
  smallTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.darkGray.hexCode,
  },
  contentView: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    color: colors.darkGray.hexCode,
  },
  featureText: {
    fontSize: 15,
    color: colors.darkGray.hexCode,
    marginBottom: 3,
  },
  buttonsView: {
    alignSelf: 'stretch',
    justifyContent: 'space-evenly',
  },
});

export default SnippetaCloudView;