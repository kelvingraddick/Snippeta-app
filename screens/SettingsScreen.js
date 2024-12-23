import React, { useContext, useEffect, useState } from 'react';
import { Image, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { ApplicationContext } from '../ApplicationContext';
import colors from '../helpers/colors';
import banner from '../helpers/banner';
import storage from '../helpers/storage';
import { themes } from '../constants/themes';
import SnippetaCloudView from '../components/SnippetaCloudView';
import ActionButton from '../components/ActionButton';
import SettingView from '../components/SettingView';

const SettingsScreen = ({ navigation }) => {
  
  const { themer, updateThemer, user, isUserLoading, logout, subscription, updateSubscriptionStatus } = useContext(ApplicationContext);

  const [isLoading, setIsLoading] = useState(false);
  const [settingSections, setSettingSections] = useState([]);

  const { showActionSheetWithOptions } = useActionSheet();

  useEffect(() => {
    console.log(`SettingsScreen.js -> useEffect: themer set with ID ${themer?.themeId}`);
    getSettings();
  }, [themer]);

  const getSettings = async () => {
    try {
      let themeSettings = Object.keys(themes).map(themeId => {
        const theme = themes[themeId];
        const isSelected = themeId == themer.themeId || (!themer.themeId && theme == themes['default-light']);
        return { label: theme.name, labelIconSource: require('../assets/images/copy-white.png'), isSelectable: true, isSelected: isSelected, onTapped: () => { onThemeTapped(themeId); } };
      });      
      let settingSections = [{ title: '🎨 Theme', data: themeSettings }];
      // set settings for display
      setSettingSections(settingSections);
    } catch (error) {
      console.error('SettingsScreen.js -> getSettings: Loading settings failed with error: ' + error.message);
    }
  };

  const onThemeTapped = async (themeId) => {
    console.log(`SettingsScreen.js -> onThemeTapped: theme selected with ID ${themeId}`);
    await storage.saveThemeId(themeId);
    await updateThemer(themeId);
    triggerHapticFeedback();
  };

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

  const triggerHapticFeedback = () => {
    ReactNativeHapticFeedback.trigger('impactMedium', options = { enableVibrateFallback: true, ignoreAndroidSystemSettings: true, });
  }

  return (
    <View style={[styles.container, { backgroundColor: themer.getColor('background1').hexCode }]}>
      <View style={[styles.headerView, { backgroundColor: themer.getColor('screenHeader1.background').hexCode } ]}>
        <View style={styles.titleView}>
          <Pressable onPress={onBackTapped} disabled={isLoading} hitSlop={20}>
            <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={themer.getColor('screenHeader1.foreground').hexCode} />
          </Pressable>
          <Text style={[styles.title, { color: themer.getColor('screenHeader1.foreground').hexCode }]}>Settings</Text>
          <View style={styles.placeholderIcon} />
        </View>
        <View style={styles.logoView}>
          <Image source={require('../assets/images/logo.png')} style={styles.logoIcon} tintColor={themer.getColor('screenHeader1.foreground').hexCode} resizeMode='contain' />
          <Text style={[styles.subTitle, { color: themer.getColor('screenHeader1.foreground').hexCode }]}>Pro</Text>
        </View>
        { !subscription &&
          <View style={styles.infoView}>
            <Text style={[styles.descriptionText, { color: themer.getColor('screenHeader1.foreground').hexCode }]}>Subscribe to access pro-level features</Text>
            <View style={styles.infoView}>
              <Text style={[styles.featureText, { color: themer.getColor('screenHeader1.foreground').hexCode }]}>☁️ Sync & backup snippets with <Text style={{ fontWeight: 'bold' }}>Snippeta Cloud</Text></Text>
              <Text style={[styles.featureText, { color: themer.getColor('screenHeader1.foreground').hexCode }]}>🎨 Unlock pro-level themes, fonts, & sounds</Text>
              <Text style={[styles.featureText, { color: themer.getColor('screenHeader1.foreground').hexCode }]}>📱 Personalize even more with pro <Text style={{ fontWeight: 'bold' }}>app icons</Text></Text>
            </View>
          </View>
        }
        { subscription &&
          <Text style={[styles.descriptionText, { color: themer.getColor('screenHeader1.foreground').hexCode, marginBottom: 15 }]}>You are subscribed: <Text style={{ fontWeight: 'bold', color: colors.lightGreen.hexCode }}>{subscription.type}</Text></Text>
        }
        { !subscription && 
          <ActionButton iconImageSource={require('../assets/images/cart.png')} text={'Free trial • $1.99/month'} foregroundColor={themer.getColor('button1.foreground')} backgroundColor={themer.getColor('button1.background')} disabled={isLoading} onTapped={() => onSubscribeTapped()} />
        }
      </View>
      <SectionList
        style={styles.settingsList}
        sections={settingSections}
        keyExtractor={(item, index) => index}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={() => 
          <SnippetaCloudView themer={themer} user={user} isLargeLogo={true} isCentered={true}>
            { !user && 
              <>
                <ActionButton iconImageSource={require('../assets/images/user.png')} text={'Login'} foregroundColor={themer.getColor('button2.foreground')} backgroundColor={themer.getColor('button2.background')} disabled={isLoading} onTapped={() => onLoginTapped()} />
                <ActionButton iconImageSource={require('../assets/images/list-icon.png')} text={'Register'} foregroundColor={themer.getColor('button3.foreground')} backgroundColor={themer.getColor('button3.background')} disabled={isLoading} onTapped={() => onRegisterTapped()} />
              </>
            }
            { user && 
              <>
                <ActionButton iconImageSource={require('../assets/images/user.png')} text={'Account'} foregroundColor={themer.getColor('button2.foreground')} backgroundColor={themer.getColor('button2.background')} disabled={isLoading} onTapped={() => onAccountTapped()} />
                <ActionButton iconImageSource={require('../assets/images/back-arrow.png')} text={'Logout'} foregroundColor={themer.getColor('button4.foreground')} backgroundColor={themer.getColor('button4.background')} disabled={isLoading} onTapped={() => onLogoutTapped()} />
              </>
            }
          </SnippetaCloudView>
        }
        renderSectionHeader={({section: {title}}) => ( title &&
          <View style={styles.sectionHeaderView}>
            <Text style={[styles.sectionHeaderText, { color: themer.getColor('listHeader1.foreground').hexCode }]}>{title}</Text>
          </View>
        )}
        renderItem={({item}) => <SettingView label={item.label} labelIconSource={item.labelIconSource} onTapped={item.onTapped} isSelectable={item.isSelectable} isSelected={item.isSelected} isSwitchEnabled={item.isSwitchEnabled} onSwitchToggled={item.onSwitchToggled} themer={themer} />}
        renderSectionFooter={() => <View style={{ height: 10 }}></View>}
        ListFooterComponent={() => <View style={{ height: 50 }}></View>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerView: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
  },
  titleView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoView: {
    marginBottom: 10
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
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
  settingsList: {
    flex: 1,
    padding: 20,
  },
  sectionHeaderView: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    marginBottom: 15,
  },
  sectionHeaderText: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;