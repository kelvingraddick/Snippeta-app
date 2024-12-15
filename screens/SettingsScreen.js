import React, { useContext, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { ApplicationContext } from '../ApplicationContext';
import colors from '../helpers/colors';
import banner from '../helpers/banner';
import SnippetaCloudView from '../components/SnippetaCloudView';
import ActionButton from '../components/ActionButton';

const SettingsScreen = ({ navigation }) => {
  
  const { user, isUserLoading, logout, subscription, updateSubscriptionStatus } = useContext(ApplicationContext);

  const [isLoading, setIsLoading] = useState(false);

  const { showActionSheetWithOptions } = useActionSheet();

  const onBackTapped = async () => {
    navigation.goBack();
  };

  const onSubscribeTapped = async () => {
    await presentPaywallIfNeeded();
  };

  const onLoginTapped = async () => {
    navigation.navigate('Login');
  };

  const onRegisterTapped = async () => {
    if (subscription) {
      navigation.navigate('Register');
    } else {
      await presentPaywallIfNeeded().then((paywallResult) => {
        if (paywallResult == PAYWALL_RESULT.PURCHASED || paywallResult == PAYWALL_RESULT.RESTORED) {
          navigation.navigate('Register');
        }
      });
    }
  };

  const presentPaywallIfNeeded = async () => {
    try {
      const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({ requiredEntitlementIdentifier: 'Snippeta Pro' });
      console.log('SettingsScreen.js -> presentPaywallIfNeeded: paywall closed result:', paywallResult);
      switch (paywallResult) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          setIsLoading(true);
          await updateSubscriptionStatus(user);
          setIsLoading(false);
          break;
        // other cases: PAYWALL_RESULT.NOT_PRESENTED, PAYWALL_RESULT.ERROR, PAYWALL_RESULT.CANCELLED
      }
      return paywallResult;
    } catch (error) {
      const errorMessage = 'Paywall failed with error: ' + error.message;
      console.error('SettingsScreen.js -> presentPaywallIfNeeded: ' + errorMessage);
      banner.showErrorMessage(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  const onAccountTapped = async () => {
    navigation.navigate('User');
  };

  const onLogoutTapped = async () => {
    const options = { 'Logout': 0, 'Cancel': 1 };
    showActionSheetWithOptions(
      {
        title: 'Are you sure you want to logout of your account?',
        options: Object.keys(options),
        destructiveButtonIndex: options.Logout,
        cancelButtonIndex: options.Cancel,
      },
      async (selectedIndex) => {
        switch (selectedIndex) {
          case options.Logout:
            navigation.popToTop();
            await logout();
            banner.showSuccessMessage('Logged out!');
            break;
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerView}>
        <View style={styles.titleView}>
          <Pressable onPress={onBackTapped} disabled={isLoading} hitSlop={20}>
            <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={colors.white.hexCode} />
          </Pressable>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.placeholderIcon} />
        </View>
        <View style={styles.logoView}>
          <Image source={require('../assets/images/logo.png')} style={styles.logoIcon} tintColor={colors.white.hexCode} resizeMode='contain' />
          <Text style={styles.subTitle}>Pro</Text>
        </View>
        { !subscription &&
          <View style={styles.infoView}>
            <Text style={styles.descriptionText}>Subscribe to access pro-level features</Text>
            <View style={styles.infoView}>
              <Text style={styles.featureText}>☁️ Sync & backup snippets with <Text style={{ fontWeight: 'bold' }}>Snippeta Cloud</Text></Text>
              <Text style={styles.featureText}>🎨 Unlock pro-level themes, fonts, & sounds</Text>
              <Text style={styles.featureText}>📱 Personalize even more with pro <Text style={{ fontWeight: 'bold' }}>app icons</Text></Text>
            </View>
          </View>
        }
        { subscription &&
          <View style={styles.infoView}>
            <Text style={styles.descriptionText}>You are subscibed: <Text style={{ fontWeight: 'bold', color: colors.lightGreen.hexCode }}>{subscription.type}</Text></Text>
          </View>
        }
        { !subscription && 
          <ActionButton iconImageSource={require('../assets/images/cart.png')} text={'Free trial • $1.99/month'} color={colors.nebulaBlue} disabled={isLoading} onTapped={() => onSubscribeTapped()} />
        }
      </View>
      <ScrollView style={styles.scrollView}>
        <SnippetaCloudView user={user} isLargeLogo={true} isCentered={true}>
          { !user && 
            <>
              <ActionButton iconImageSource={require('../assets/images/user.png')} text={'Login'} color={colors.lightGreen} disabled={isLoading} onTapped={() => onLoginTapped()} />
              <ActionButton iconImageSource={require('../assets/images/list-icon.png')} text={'Register'} color={colors.lightBlue} disabled={isLoading} onTapped={() => onRegisterTapped()} />
            </>
          }
          { user && 
            <>
              <ActionButton iconImageSource={require('../assets/images/user.png')} text={'Account'} color={colors.lightGreen} disabled={isLoading} onTapped={() => onAccountTapped()} />
              <ActionButton iconImageSource={require('../assets/images/back-arrow.png')} text={'Logout'} color={colors.gray} disabled={isLoading} onTapped={() => onLogoutTapped()} />
            </>
          }
        </SnippetaCloudView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray.hexCode,
  },
  headerView: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.darkGray.hexCode,
  },
  titleView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  infoView: {
    marginBottom: 10
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white.hexCode
  },
  logoView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  logoIcon: {
    height: 35,
    width: 150,
    marginTop: 6,
  },
  subTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.white.hexCode,
  },
  descriptionText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    color: colors.white.hexCode,
  },
  featureText: {
    fontSize: 15,
    color: colors.white.hexCode,
    marginBottom: 3,
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
  scrollView: {
    flex: 1,
    padding: 20,
  },
});

export default SettingsScreen;