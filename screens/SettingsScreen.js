import React, { useCallback, useContext, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useFancyActionSheet } from 'react-native-fancy-action-sheet';
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { ApplicationContext } from '../ApplicationContext';
import banner from '../helpers/banner';
import storage from '../helpers/storage';
import revenueCat from '../helpers/revenueCat';
import style from '../helpers/style';
import { appSettings } from '../constants/appSettings';
import { colors } from '../constants/colors';
import { themes } from '../constants/themes';
import { entitlementIds } from '../constants/entitlementIds';
import { readableErrorMessages } from '../constants/readableErrorMessages';
import { appearanceModes } from '../constants/appearanceModes';
import SnippetaCloudView from '../components/SnippetaCloudView';
import ActionButton from '../components/ActionButton';
import SettingView from '../components/SettingView';

const SettingsScreen = ({ navigation }) => {
  
  const { themer, updateThemer, startThemePreview, endThemePreview, isThemePreview, appearanceMode, updateAppearanceMode, user, isUserLoading, logout, entitlements, updateEntitlements, subscription, } = useContext(ApplicationContext);

  const [isLoading, setIsLoading] = useState(false);

  const { showFancyActionSheet } = useFancyActionSheet();

  const getSettings = (themer, appearanceMode) => {
    let settings = [];
    try {
      let themeSettings = Object.keys(themes).map(themeId => {
        const theme = themes[themeId];
        const isSelected = themeId == themer.themeId || (!themer.themeId && theme == themes['default-light']);
        return { label: theme.name, isPro: theme.isPro, isSelectable: true, isSelected: isSelected, onTapped: () => { onThemeTapped(themeId); } };
      });     
      let appearanceSettings = [
        { label: `Light/dark mode: ${appearanceMode}`, onTapped: () => { onAppearanceModeTapped(); }},
      ]; 
      let appExtensionsSettings = [
        { label: 'Home screen widget', onTapped: () => { navigation.navigate('Widget'); }},
        { label: 'System settings', onTapped: () => { Linking.openURL('app-settings:'); }},
      ];
      let inAppPurchaseSettings = [
        { label: 'Restore purchases', onTapped: () => { onRestorePurchasesTapped(); } },
        { label: 'Manage subscription', onTapped: () => { Linking.openURL('https://apps.apple.com/account/subscriptions'); } },
      ];
      let getInTouchSettings = [
        { label: 'Leave a review', onTapped: () => { Linking.openURL('https://apps.apple.com/app/id1282250868?action=write-review'); } },
        { label: 'Get help / support', onTapped: () => { Linking.openURL('mailto:development@wavelinkllc.com?subject=Snippeta%20support%20request'); } },
        { label: 'Request new feature', onTapped: () => { Linking.openURL('mailto:development@wavelinkllc.com?subject=Snippeta%20feature%20request'); } },
      ];
      let infoSettings = [
        { label: 'Privacy Policy', onTapped: () => { Linking.openURL('https://snippeta.com/privacy-policy/'); } },
        { label: 'Terms and Conditions', onTapped: () => { Linking.openURL('https://snippeta.com/terms-and-conditions/'); } },
        { label: 'Wave Link (developer)', onTapped: () => { Linking.openURL('http://www.wavelinkllc.com'); } },
        { label: 'KG.codes (developer)', onTapped: () => { Linking.openURL('https://linktr.ee/kg.codes'); } },
      ];
      settings.push({ title: '🎨 Theme', data: themeSettings });
      settings.push({ title: '🌗 Appearance', data: appearanceSettings });
      settings.push({ title: '📱 App extensions', data: appExtensionsSettings });   
      settings.push({ title: '🛒 In-app purchase', data: inAppPurchaseSettings }); 
      settings.push({ title: '📝 Get in touch', data: getInTouchSettings }); 
      settings.push({ title: 'ℹ️ Info', data: infoSettings });  
    } catch (error) {
      console.error('SettingsScreen.js -> getSettings: Loading settings failed with error: ' + error.message);
    }
    return settings;
  };
  const settingSections = getSettings(themer, appearanceMode);

  const onThemeTapped = async (themeId) => {
    try {
      console.log(`SettingsScreen.js -> onThemeTapped: theme selected with ID ${themeId}`);
      triggerHapticFeedback();
      if (isThemePreview) { await endThemePreview(); }
      const theme = themes[themeId];
      if (theme.isPro && !subscription && !entitlements?.[themeId]) {
        setIsLoading(true);
        const options = [{ id: 'PREVIEW', name: 'Preview' }, { id: 'BUY', name: 'Buy' }, { id: 'SUBSCRIBE', name: 'Subscribe to Snippeta Pro' }];
        showFancyActionSheet({
          title: '🔒 This pro theme must be unlocked',
          message: 'You can preview it, buy it now, or subscribe to Snippeta Pro to unlock all pro themes!',
          ...style.getFancyActionSheetStyles(themer),
          options: options,
          onOptionPress: async (option) => {
            switch (option.id) {
              case 'PREVIEW':
                await startThemePreview(themeId);
                break;
              case 'BUY':
                await buyTheme(themeId);
                break;
              case 'SUBSCRIBE':
                await presentPaywallIfNeeded().then(async (paywallResult) => {
                  if (paywallResult == PAYWALL_RESULT.PURCHASED || paywallResult == PAYWALL_RESULT.RESTORED) {
                    await displayTheme(themeId);
                  }
                });
                break;
            }
            setIsLoading(false);
          },
        });
      } else {
        await displayTheme(themeId);
      }
    } catch (error) {
      const errorMessage = 'Theme selection failed with error: ' + error.message;
      console.error('SettingsScreen.js -> onThemeTapped: ' + errorMessage);
      banner.showErrorMessage(errorMessage);
      setIsLoading(false);
    }
  };

  const buyTheme = async (themeId) => {
    let entitlement;
    try {
      entitlement = await revenueCat.purchasePackage(themeId, themeId, themeId);
    } catch (error) {
      console.error('SettingsScreen.js -> buyTheme: buying theme failed with error: ' + error.message);
      banner.showErrorMessage(readableErrorMessages.PURCHASE_ERROR);
    } finally {
      if (entitlement) {
        await updateEntitlements(user);
        await displayTheme(themeId);
      }
    }
  };

  const displayTheme = async (themeId) => {
    await storage.saveThemeId(themeId);
    await updateThemer(themeId, appearanceMode);
  };

  const onAppearanceModeTapped = async () => {
    const options = Object.values(appearanceModes).map(appearanceModeValue => { return { id: appearanceModeValue, name: getCapitalizedWord(appearanceModeValue) };});
    showFancyActionSheet({
      title: '🌗 Theme appearance options ‎ ‎',
      message: 'Select light, dark, or have it automatically controlled by the device\'s system setting',
      ...style.getFancyActionSheetStyles(themer),
      options: options,
      onOptionPress: async (option) => {
        const appearanceModeValue = Object.values(appearanceModes).find((appearanceModeValue) => appearanceModeValue == option.id);
        if (Object.values(appearanceModes).includes(appearanceModeValue)) { 
          triggerHapticFeedback();
          await storage.saveAppearanceMode(appearanceModeValue);
          if (isThemePreview) {
            await endThemePreview();
          } else {
            await updateAppearanceMode(appearanceModeValue);
            await updateThemer(themer.themeId, appearanceModeValue);
          }
        }
      },
    });
  }

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
    const options = [{ id: 'LOGOUT', name: 'Logout' }];
    showFancyActionSheet({
      title: '⚠️ Are you sure you want to logout?',
      message: 'Cloud snippets will not be available, and some other functionality will be disabled.',
      ...style.getFancyActionSheetStyles(themer),
      options: options,
      destructiveOptionId: 'LOGOUT',
      onOptionPress: async (option) => {
        switch (option.id) {
          case 'LOGOUT':
            navigation.popToTop();
            await logout();
            banner.showSuccessMessage('Logged out!');
            break;
        }
      },
    });
  };

  const onRestorePurchasesTapped = async () => {
    try {
      setIsLoading(true);
      await revenueCat.restorePurchases().then(async (entitlements) => {
        if (entitlements && Object.keys(entitlements).length > 0) { // restoring was successful and entitlements were found
          await updateEntitlements(user);
          let entitlementNames = entitlements[entitlementIds.SNIPPETA_PRO] ? ['Snippeta Pro subscription'] : [];
          entitlementNames.push(Object.keys(themes).filter((themeId) => entitlements[themeId]).map((themeId) => (`"${themes[themeId]?.name ?? themeId}"` + ' theme')));
          banner.showSuccessMessage(`Successfully restored purchases for: ${(entitlementNames.length > 0 ? '\n• ' : '') + entitlementNames.join('\n• ')}`);
        } else if (entitlements) { // restoring was successful BUT no entitlements were found
          banner.showSuccessMessage('No subscription or purchases found to restore.');
        } else { // restoring was NOT successful
          throw new Error('In-app subscription/purchase service did not return any data.');
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error('SettingsScreen.js -> onRestorePurchasesTapped: restoring purchases failed with error: ' + error.message);
      banner.showErrorMessage(readableErrorMessages.RESTORE_PURCHASES_ERROR);
      setIsLoading(false);
    }
  }

  const triggerHapticFeedback = () => {
    ReactNativeHapticFeedback.trigger('impactMedium', options = { enableVibrateFallback: true, ignoreAndroidSystemSettings: true, });
  }

  const getCapitalizedWord = (word) => {
    return (word && word.length > 0) ?
      word.charAt(0).toUpperCase() + word.slice(1) :
      word;
  };

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
              <Text style={[styles.featureText, { color: themer.getColor('screenHeader1.foreground') }]}>🎨 Unlock <Text style={{ fontWeight: 'bold' }}>pro themes</Text> to find your own style</Text>
              <Text style={[styles.featureText, { color: themer.getColor('screenHeader1.foreground') }]}>🧠 Organize better with nested <Text style={{ fontWeight: 'bold' }}>sub-groups</Text></Text>
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
          <Text style={{ fontWeight: 'bold' }}>Version {appSettings.VERSION_NUMBER}</Text> (<Text style={{ fontStyle: 'italic' }}>b{appSettings.BUILD_NUMBER}</Text>) • made with 🖤 by Wave Link
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