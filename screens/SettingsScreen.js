import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Platform, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFancyActionSheet } from 'react-native-fancy-action-sheet';
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import * as Sentry from '@sentry/react-native';
import { useTranslation, Trans } from 'react-i18next';
import i18n from 'i18next';
import { changeLanguage, getDeviceLanguage } from '../helpers/i18n';
import { ApplicationContext } from '../ApplicationContext';
import banner from '../helpers/banner';
import storage from '../helpers/storage';
import revenueCat from '../helpers/revenueCat';
import analytics from '../helpers/analytics';
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
  const { t } = useTranslation(['common', 'settings', 'errors']);
  const { themer, updateThemer, startThemePreview, endThemePreview, isThemePreview, appearanceMode, updateAppearanceMode, user, isUserLoading, logout, entitlements, updateEntitlements, refreshFeatureAlerts, subscription, } = useContext(ApplicationContext);

  const safeAreaInsets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionPrice, setSubscriptionPrice] = useState();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [storedLanguage, setStoredLanguage] = useState(null);

  const { showFancyActionSheet } = useFancyActionSheet();

  useEffect(() => {
    getSubscriptionPackage();
    initializeLanguage();
    return () => {
      i18n.off('languageChanged', updateLanguage);
    };
  }, []);

  const getSubscriptionPackage = async () => {
    let subscriptionPackage;
    try {
      subscriptionPackage = await revenueCat.getPackage('default', '$rc_monthly');
      let subscriptionPrice = subscriptionPackage?.product?.pricePerMonthString;
      if (subscriptionPrice) {
        setSubscriptionPrice(subscriptionPrice);
        console.log('SettingsScreen.js -> getSubscriptionPackage: got subscription package with price:', subscriptionPrice);
      } else {
        throw new Error('Subscription object was null/undefined.');
      }
    } catch (error) {
      console.error('SettingsScreen.js -> getSubscriptionPackage: Failed to load current subscription price: ' + error.message);
      banner.showErrorMessage(readableErrorMessages.GET_PURCHASE_DATA_ERROR);
      Sentry.captureException(error, { attachments: [{ filename: "subscriptionPackage.json", data: JSON.stringify(subscriptionPackage || {}), contentType: 'application/json' }] });
    }
  };

  const initializeLanguage = async () => {
    const stored = await storage.getLanguage();
    const deviceLanguage = getDeviceLanguage();
    setStoredLanguage(stored);
    setCurrentLanguage(stored || deviceLanguage);
    i18n.on('languageChanged', updateLanguage);
  };

  const updateLanguage = async () => {
    const stored = await storage.getLanguage();
    setStoredLanguage(stored);
    setCurrentLanguage(i18n.language);
  };

  const getCapitalizedWord = (word) => {
    return (word && word.length > 0) ?
      word.charAt(0).toUpperCase() + word.slice(1) :
      word;
  };

  const getSettings = (themer, appearanceMode) => {
    let settings = [];
    try {
      let themeSettings = Object.keys(themes).map(themeId => {
        const theme = themes[themeId];
        const isSelected = themeId == themer.themeId || (!themer.themeId && theme == themes['default-light']);
        return { label: theme.name, isPro: theme.isPro, isSelectable: true, isSelected: isSelected, onTapped: () => { onThemeTapped(themeId); } };
      });     
      const getAppearanceModeName = (mode) => {
        return t(`settings:appearanceModes.${mode}`, { defaultValue: getCapitalizedWord(mode) });
      };
      let appearanceSettings = [
        { label: t('settings:appearanceMode', { mode: getAppearanceModeName(appearanceMode) }), onTapped: () => { onAppearanceModeTapped(); }},
      ];
      const deviceLanguage = getDeviceLanguage();
      const getLanguageName = (langCode) => {
        return t(`settings:languageOptions.languages.${langCode}`, { defaultValue: langCode.toUpperCase() });
      };
      const languageLabel = !storedLanguage 
        ? t('settings:languageOptions.default', { language: getLanguageName(deviceLanguage) })
        : t('settings:language', { language: getLanguageName(currentLanguage) });
      let languageSettings = [
        { label: languageLabel, onTapped: () => { onLanguageTapped(); }},
      ];
      let appExtensionsSettings = !Platform.constants.isMacCatalyst ? [
        { label: t('settings:settings.keyboardExtension'), onTapped: () => { navigation.navigate('Keyboard'); }},
        { label: t('settings:settings.homeScreenWidget'), onTapped: () => { navigation.navigate('Widget'); }},
        { label: t('settings:settings.systemSettings'), onTapped: async () => {  Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings(); await analytics.logEvent('system_settings_tapped'); }},
      ] : [
        { label: t('settings:settings.homeScreenWidget'), onTapped: () => { navigation.navigate('Widget'); }},
        { label: t('settings:settings.systemSettings'), onTapped: async () => { Linking.openURL('app-settings:'); await analytics.logEvent('system_settings_tapped'); }},
      ];
      let notificationSettings = [
        { label: t('settings:settings.resetFeatureAlerts'), onTapped: () => { onResetFeatureAlertsTapped(); }},
      ];
      let inAppPurchaseSettings = [
        { label: t('settings:settings.restorePurchases'), onTapped: () => { onRestorePurchasesTapped(); } },
        { label: t('settings:settings.manageSubscription'), onTapped: async () => { Linking.openURL(Platform.OS === 'ios' ? 'https://apps.apple.com/account/subscriptions' : 'https://play.google.com/store/account/subscriptions'); await analytics.logEvent('manage_subscription_tapped'); } }, // alternative Android: 'https://play.google.com/store/account/subscriptions?sku=YOUR_SUBSCRIPTION_ID&package=YOUR_APP_PACKAGE_NAME'
      ];
      let getInTouchSettings = [
        { label: t('settings:settings.leaveReview'), onTapped: async () => { Linking.openURL(Platform.OS === 'ios' ? 'https://apps.apple.com/app/id1282250868?action=write-review' : 'market://details?id=com.wavelinkllc.snippeta&showAllReviews=true'); await analytics.logEvent('leave_a_review_tapped'); } },
        { label: t('settings:settings.getHelpSupport'), onTapped: async () => { Linking.openURL('mailto:development@wavelinkllc.com?subject=Snippeta%20support%20request'); await analytics.logEvent('get_help_support_tapped'); } },
        { label: t('settings:settings.requestNewFeature'), onTapped: async () => { Linking.openURL('mailto:development@wavelinkllc.com?subject=Snippeta%20feature%20request'); await analytics.logEvent('request_new_feature_tapped'); } },
      ];
      let infoSettings = [
        { label: t('settings:settings.privacyPolicy'), onTapped: async () => { Linking.openURL('https://snippeta.com/privacy-policy/'); await analytics.logEvent('privacy_policy_tapped'); } },
        { label: t('settings:settings.termsAndConditions'), onTapped: async () => { Linking.openURL('https://snippeta.com/terms-and-conditions/'); await analytics.logEvent('terms_and_conditions_tapped'); } },
        { label: t('settings:settings.waveLinkDeveloper'), onTapped: async () => { Linking.openURL('http://www.wavelinkllc.com'); await analytics.logEvent('wave_link_developer_tapped'); } },
        { label: t('settings:settings.kgCodesDeveloper'), onTapped: async () => { Linking.openURL('https://linktr.ee/kg.codes'); await analytics.logEvent('kg_codes_developer_tapped'); } },
      ];
      settings.push({ title: t('settings:sections.theme'), data: themeSettings });
      settings.push({ title: t('settings:sections.appearance'), data: appearanceSettings });
      settings.push({ title: t('settings:sections.language'), data: languageSettings });
      settings.push({ title: t('settings:sections.appExtensions'), data: appExtensionsSettings });   
      settings.push({ title: t('settings:sections.notifications'), data: notificationSettings }); 
      settings.push({ title: t('settings:sections.inAppPurchase'), data: inAppPurchaseSettings }); 
      settings.push({ title: t('settings:sections.getInTouch'), data: getInTouchSettings }); 
      settings.push({ title: t('settings:sections.info'), data: infoSettings });  
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
        const options = [{ id: 'PREVIEW', name: t('settings:proThemeUnlocked.preview') }, { id: 'BUY', name: t('settings:proThemeUnlocked.buy') }, { id: 'SUBSCRIBE', name: t('settings:proThemeUnlocked.subscribe') }];
        showFancyActionSheet({
          title: t('settings:proThemeUnlocked.title'),
          message: t('settings:proThemeUnlocked.message'),
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
      console.error('SettingsScreen.js -> onThemeTapped: Theme selection failed with error: ' + error.message);
      banner.showErrorMessage(t('settings:themeSelectionFailed', { error: error.message }));
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
        await analytics.logEvent('theme_purchased', { theme_id: themeId, entitlement: entitlement });
        await updateEntitlements(user);
        await displayTheme(themeId);
      }
    }
  };

  const displayTheme = async (themeId) => {
    await storage.saveThemeId(themeId);
    await updateThemer(themeId, appearanceMode);
    await analytics.logEvent('theme_displayed', { theme_id: themeId });
  };

  const onAppearanceModeTapped = async () => {
    const getAppearanceModeName = (mode) => {
      return t(`settings:appearanceModes.${mode}`, { defaultValue: getCapitalizedWord(mode) });
    };
    const options = Object.values(appearanceModes).map(appearanceModeValue => { return { id: appearanceModeValue, name: getAppearanceModeName(appearanceModeValue) };});
    showFancyActionSheet({
      title: t('settings:appearanceOptions.title'),
      message: t('settings:appearanceOptions.message'),
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
          await analytics.logEvent('appearance_mode_changed', { appearance_mode: appearanceModeValue });
        }
      },
    });
  }

  const onLanguageTapped = async () => {
    const deviceLanguage = getDeviceLanguage();
    const storedLanguage = await storage.getLanguage();
    const availableLanguages = ['en', 'es'];
    
    const getLanguageName = (langCode) => {
      return t(`settings:languageOptions.languages.${langCode}`, { defaultValue: langCode.toUpperCase() });
    };
    
    // Create options: Default first, then available languages
    const options = [
      { 
        id: null, 
        name: t('settings:languageOptions.default', { language: getLanguageName(deviceLanguage) }),
      },
      ...availableLanguages.map(lang => ({
        id: lang,
        name: getLanguageName(lang),
      }))
    ];

    showFancyActionSheet({
      title: t('settings:languageOptions.title'),
      message: t('settings:languageOptions.message'),
      ...style.getFancyActionSheetStyles(themer),
      options: options,
      onOptionPress: async (option) => {
        triggerHapticFeedback();
        await changeLanguage(option.id);
        // Update stored language state
        setStoredLanguage(option.id);
        // Update current language state - if null, use device language
        const newLanguage = option.id || getDeviceLanguage();
        setCurrentLanguage(newLanguage);
        await analytics.logEvent('language_changed', { language: option.id || 'device_default' });
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
      await analytics.logEvent('subscription_paywall_finished', { result: paywallResult });
      return paywallResult;
    } catch (error) {
      console.error('SettingsScreen.js -> presentPaywallIfNeeded: Paywall failed with error: ' + error.message);
      banner.showErrorMessage(t('settings:paywallFailed', { error: error.message }));
      return null;
    }
  };

  const onAccountTapped = async () => {
    navigation.navigate('User');
  };

  const onLogoutTapped = async () => {
    const options = [{ id: 'LOGOUT', name: t('common:buttons.logout') }];
    showFancyActionSheet({
      title: t('settings:logoutConfirm.title'),
      message: t('settings:logoutConfirm.message'),
      ...style.getFancyActionSheetStyles(themer),
      options: options,
      destructiveOptionId: 'LOGOUT',
      onOptionPress: async (option) => {
        switch (option.id) {
          case 'LOGOUT':
            navigation.popToTop();
            await logout();
            banner.showSuccessMessage(t('common:messages.loggedOut'));
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
          let entitlementNames = entitlements[entitlementIds.SNIPPETA_PRO] ? [t('settings:restorePurchases.snippetaProSubscription')] : [];
          entitlementNames.push(Object.keys(themes).filter((themeId) => entitlements[themeId]).map((themeId) => (`"${themes[themeId]?.name ?? themeId}"` + ' ' + t('settings:restorePurchases.theme'))));
          banner.showSuccessMessage(t('settings:restorePurchases.success', { entitlements: (entitlementNames.length > 0 ? '\n• ' : '') + entitlementNames.join('\n• ') }));
          await analytics.logEvent('purchases_restored');
        } else if (entitlements) { // restoring was successful BUT no entitlements were found
          banner.showSuccessMessage(t('settings:restorePurchases.noPurchases'));
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

  const onResetFeatureAlertsTapped = async () => {
    try {
      setIsLoading(true);
      await storage.resetAllFeatureAlerts();
      refreshFeatureAlerts();
      banner.showSuccessMessage(t('common:messages.featureAlertsReset'));
      await analytics.logEvent('feature_alerts_reset');
      setIsLoading(false);
    } catch (error) {
      console.error('SettingsScreen.js -> onResetFeatureAlertsTapped: resetting feature alerts failed with error: ' + error.message);
      banner.showErrorMessage(t('settings:restoreFailed'));
      setIsLoading(false);
    }
  }

  const triggerHapticFeedback = () => {
    ReactNativeHapticFeedback.trigger('impactMedium', options = { enableVibrateFallback: true, ignoreAndroidSystemSettings: true, });
  }

  return (
    <View style={[styles.container, { backgroundColor: themer.getColor('background1') }]}>
      <View style={[styles.headerView, { backgroundColor: themer.getColor('screenHeader1.background'), paddingTop: Platform.OS === 'ios' ? 60 : (safeAreaInsets.top + 17.5) } ]}>
        <View style={styles.titleView}>
          <Pressable onPress={onBackTapped} disabled={isLoading} hitSlop={20}>
            <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={themer.getColor('screenHeader1.foreground')} />
          </Pressable>
          <Text style={[styles.title, { color: themer.getColor('screenHeader1.foreground') }]}>{t('settings:title')}</Text>
          <View style={styles.placeholderIcon} />
        </View>
        <View style={styles.logoView}>
          <Image source={require('../assets/images/logo.png')} style={styles.logoIcon} tintColor={themer.getColor('screenHeader1.foreground')} resizeMode='contain' />
          <Text style={[styles.subTitle, { color: themer.getColor('screenHeader1.foreground') }]}>{t('settings:pro')}</Text>
        </View>
        { !subscription &&
          <View style={styles.infoView}>
            <Text style={[styles.descriptionText, { color: themer.getColor('screenHeader1.foreground') }]}>{t('settings:subscribeDescription')}</Text>
            <View style={styles.infoView}>
              <Text style={[styles.featureText, { color: themer.getColor('screenHeader1.foreground') }]}><Trans i18nKey="settings:features.cloudSync" components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }} /></Text>
              <Text style={[styles.featureText, { color: themer.getColor('screenHeader1.foreground') }]}><Trans i18nKey="settings:features.proThemes" components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }} /></Text>
              <Text style={[styles.featureText, { color: themer.getColor('screenHeader1.foreground') }]}><Trans i18nKey="settings:features.subGroups" components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }} /></Text>
            </View>
          </View>
        }
        { subscription &&
          <Text style={[styles.descriptionText, { color: themer.getColor('screenHeader1.foreground'), marginBottom: 15 }]}><Trans i18nKey="settings:subscribed" values={{ type: subscription.type }} components={{ bold: <Text style={{ fontWeight: 'bold', color: colors.lightGreen }} /> }} /></Text>
        }
        { !subscription && 
          <ActionButton iconImageSource={require('../assets/images/cart.png')} text={(subscriptionPrice ? t('settings:freeTrial', { price: subscriptionPrice }) : t('settings:freeTrialDefault'))} foregroundColor={themer.getColor('button1.foreground')} backgroundColor={themer.getColor('button1.background')} disabled={isLoading} onTapped={() => onSubscribeTapped()} />
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
                <ActionButton iconImageSource={require('../assets/images/user.png')} text={t('common:buttons.login')} foregroundColor={themer.getColor('button2.foreground')} backgroundColor={themer.getColor('button2.background')} disabled={isLoading} onTapped={() => onLoginTapped()} />
                <ActionButton iconImageSource={require('../assets/images/list-icon.png')} text={t('common:buttons.register')} foregroundColor={themer.getColor('button3.foreground')} backgroundColor={themer.getColor('button3.background')} disabled={isLoading} onTapped={() => onRegisterTapped()} />
              </>
            }
            { user && 
              <>
                <ActionButton iconImageSource={require('../assets/images/user.png')} text={t('common:buttons.account')} foregroundColor={themer.getColor('button2.foreground')} backgroundColor={themer.getColor('button2.background')} disabled={isLoading} onTapped={() => onAccountTapped()} />
                <ActionButton iconImageSource={require('../assets/images/back-arrow.png')} text={t('common:buttons.logout')} foregroundColor={themer.getColor('button4.foreground')} backgroundColor={themer.getColor('button4.background')} disabled={isLoading} onTapped={() => onLogoutTapped()} />
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
          <Trans i18nKey="settings:version" values={{ version: appSettings.VERSION_NUMBER, build: appSettings.BUILD_NUMBER }} components={{ bold: <Text style={{ fontWeight: 'bold' }} />, italic: <Text style={{ fontStyle: 'italic' }} /> }} />
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