import React, { useCallback, useContext, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { ApplicationContext } from '../ApplicationContext';
import banner from '../helpers/banner';
import storage from '../helpers/storage';
import revenueCat from '../helpers/revenueCat';
import { colors } from '../constants/colors';
import { themes } from '../constants/themes';
import { entitlementIds } from '../constants/entitlementIds';
import SnippetaCloudView from '../components/SnippetaCloudView';
import ActionButton from '../components/ActionButton';
import SettingView from '../components/SettingView';

const SettingsScreen = ({ navigation }) => {
  
  const { themer, updateThemer, previewTheme, isThemePreview, user, isUserLoading, logout, entitlements, updateEntitlements, subscription, } = useContext(ApplicationContext);

  const [isLoading, setIsLoading] = useState(false);

  const { showActionSheetWithOptions } = useActionSheet();

  const VERSION = '2.0';

  const getSettings = (themer) => {
    let settings = [];
    try {
      let themeSettings = Object.keys(themes).map(themeId => {
        const theme = themes[themeId];
        const isSelected = themeId == themer.themeId || (!themer.themeId && theme == themes['default-light']);
        return { label: theme.name, isPro: theme.isPro, isSelectable: true, isSelected: isSelected, onTapped: () => { onThemeTapped(themeId); } };
      });      
      let widgetSettings = [{ label: 'Widget', labelIconSource: require('../assets/images/device.png'), onTapped: () => { navigation.navigate('Widget'); } }];
      let infoSettings = [
        { label: 'Privacy Policy', onTapped: () => { Linking.openURL('https://snippeta.com/privacy-policy/'); } },
        { label: 'Terms and Conditions', onTapped: () => { Linking.openURL('https://snippeta.com/terms-and-conditions/'); } },
        { label: 'Wave Link (developer)', onTapped: () => { Linking.openURL('http://www.wavelinkllc.com'); } },
        { label: 'KG.codes (developer)', onTapped: () => { Linking.openURL('https://www.kg.codes'); } },
      ];
      settings.push({ title: '🎨 Theme', data: themeSettings });
      settings.push({ title: '📱 App extensions', data: widgetSettings });   
      settings.push({ title: 'ℹ️ Info', data: infoSettings });  
    } catch (error) {
      console.error('SettingsScreen.js -> getSettings: Loading settings failed with error: ' + error.message);
    }
    return settings;
  };
  const settingSections = getSettings(themer);

  const onThemeTapped = async (themeId) => {
    try {
      if (!isThemePreview) {
        console.log(`SettingsScreen.js -> onThemeTapped: theme selected with ID ${themeId}`);
        triggerHapticFeedback();
        const theme = themes[themeId];
        if (theme.isPro && !subscription && !entitlements[themeId]) {
          setIsLoading(true);
          const options = { 'Preview': 0, 'Buy': 1, 'Subscribe to Snippeta Pro': 2, 'Cancel': 3 };
          showActionSheetWithOptions(
            {
              title: 'This pro theme must be unlocked:\n• You can preview it, buy it now, or subscribe to Snippeta Pro to unlock all pro themes!',
              options: Object.keys(options),
              cancelButtonIndex: options.Cancel,
            },
            async (selectedIndex) => {
              switch (selectedIndex) {
                case options['Preview']:
                  await previewTheme(themeId);
                  break;
                case options['Buy']:
                  const entitlement = await revenueCat.purchasePackage(themeId, themeId, themeId);
                  if (entitlement) {
                    await updateEntitlements(user);
                    await displayTheme(themeId);
                  }
                  break;
                case options['Subscribe to Snippeta Pro']:
                  await presentPaywallIfNeeded().then(async (paywallResult) => {
                    if (paywallResult == PAYWALL_RESULT.PURCHASED || paywallResult == PAYWALL_RESULT.RESTORED) {
                      await displayTheme(themeId);
                    }
                  });
                  break;
              }
              setIsLoading(false);
            }
          );
        } else {
          await displayTheme(themeId);
        }
      } else {
        console.log(`SettingsScreen.js -> onThemeTapped: cannot select theme because theme '${themer.getName()}' is being previewed`);
      }
    } catch (error) {
      const errorMessage = 'Theme selection failed with error: ' + error.message;
      console.error('SettingsScreen.js -> onThemeTapped: ' + errorMessage);
      banner.showErrorMessage(errorMessage);
      setIsLoading(false);
    }
  };

  const displayTheme = async (themeId) => {
    await storage.saveThemeId(themeId);
    await updateThemer(themeId);
  };

  const onBackTapped = async () => {
    navigation.goBack();
  };

  const onSubscribeTapped = async () => {
    setIsLoading(true);
    await presentPaywallIfNeeded().then((paywallResult) => {
      if (paywallResult == PAYWALL_RESULT.PURCHASED || paywallResult == PAYWALL_RESULT.RESTORED) {

      }
      setIsLoading(false);
    });
  };

  const onLoginTapped = async () => {
    navigation.navigate('Login');
  };

  const onRegisterTapped = async () => {
    if (subscription) {
      navigation.navigate('Register');
    } else {
      setIsLoading(true);
      await presentPaywallIfNeeded().then((paywallResult) => {
        if (paywallResult == PAYWALL_RESULT.PURCHASED || paywallResult == PAYWALL_RESULT.RESTORED) {
          navigation.navigate('Register');
        }
        setIsLoading(false);
      });
    }
  };

  const presentPaywallIfNeeded = async () => {
    try {
      const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({ requiredEntitlementIdentifier: entitlementIds.SNIPPETA_PRO });
      console.log('SettingsScreen.js -> presentPaywallIfNeeded: paywall closed result:', paywallResult);
      switch (paywallResult) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          await updateEntitlements(user);
          break;
        // other cases: PAYWALL_RESULT.NOT_PRESENTED, PAYWALL_RESULT.ERROR, PAYWALL_RESULT.CANCELLED
      }
      return paywallResult;
    } catch (error) {
      const errorMessage = 'Paywall failed with error: ' + error.message;
      console.error('SettingsScreen.js -> presentPaywallIfNeeded: ' + errorMessage);
      banner.showErrorMessage(errorMessage);
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
    <View style={[styles.container, { backgroundColor: themer.getColor('background1') }]}>
      <View style={[styles.headerView, { backgroundColor: themer.getColor('screenHeader1.background') } ]}>
        <View style={styles.titleView}>
          <Pressable onPress={onBackTapped} disabled={isLoading} hitSlop={20}>
            <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={themer.getColor('screenHeader1.foreground')} />
          </Pressable>
          <Text style={[styles.title, { color: themer.getColor('screenHeader1.foreground') }]}>Settings</Text>
          <View style={styles.placeholderIcon} />
        </View>
        <View style={styles.logoView}>
          <Image source={require('../assets/images/logo.png')} style={styles.logoIcon} tintColor={themer.getColor('screenHeader1.foreground')} resizeMode='contain' />
          <Text style={[styles.subTitle, { color: themer.getColor('screenHeader1.foreground') }]}>Pro</Text>
        </View>
        { !subscription &&
          <View style={styles.infoView}>
            <Text style={[styles.descriptionText, { color: themer.getColor('screenHeader1.foreground') }]}>Subscribe to access pro-level features</Text>
            <View style={styles.infoView}>
              <Text style={[styles.featureText, { color: themer.getColor('screenHeader1.foreground') }]}>☁️ Sync & backup snippets with <Text style={{ fontWeight: 'bold' }}>Snippeta Cloud</Text></Text>
              <Text style={[styles.featureText, { color: themer.getColor('screenHeader1.foreground') }]}>🎨 Unlock pro-level themes, fonts, & sounds</Text>
              <Text style={[styles.featureText, { color: themer.getColor('screenHeader1.foreground') }]}>📱 Personalize even more with pro <Text style={{ fontWeight: 'bold' }}>app icons</Text></Text>
            </View>
          </View>
        }
        { subscription &&
          <Text style={[styles.descriptionText, { color: themer.getColor('screenHeader1.foreground'), marginBottom: 15 }]}>You are subscribed: <Text style={{ fontWeight: 'bold', color: colors.lightGreen }}>{subscription.type}</Text></Text>
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
            <Text style={[styles.sectionHeaderText, { color: themer.getColor('listHeader1.foreground') }]}>{title}</Text>
          </View>
        )}
        renderItem={({item, index, section}) => <SettingView label={item.label} isPro={item.isPro} onTapped={item.onTapped} isSelectable={item.isSelectable} isSelected={item.isSelected} isSwitchEnabled={item.isSwitchEnabled} onSwitchToggled={item.onSwitchToggled} isTop={index === 0} isBottom={index === section.data.length - 1} themer={themer} />}
        renderSectionFooter={() => <View style={{ height: 20 }}></View>}
        ListFooterComponent={() => <Text style={[styles.footerView, { color: themer.getColor('listHeader1.foreground') }]}>
          <Text style={{ fontWeight: 'bold' }}>Version {VERSION}</Text> • <Text style={{ fontStyle: 'italic' }}>made with 🖤 by Wave Link</Text>
        </Text>}
      />
      { isLoading &&
        <View style={styles.loadingView}>
          <ActivityIndicator size="large" color={colors.white} />
        </View>
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
  footerView: {
    marginBottom: 75,
    fontSize: 15,
    textAlign: 'center',
  },
  loadingView: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, .5)',
  }
});

export default SettingsScreen;