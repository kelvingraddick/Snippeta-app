import React, { useContext, useState } from 'react';
import { Dimensions, Image, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation, Trans } from 'react-i18next';
import { ApplicationContext } from '../ApplicationContext';
import ActionButton from '../components/ActionButton';
import analytics from '../helpers/analytics';

const KeyboardScreen = ({ navigation }) => {
  const { t } = useTranslation(['common', 'keyboard']);
  const { themer, refreshFeatureAlerts } = useContext(ApplicationContext);

  const safeAreaInsets = useSafeAreaInsets();

  const [isInstructionsShowing, setIsInstructionsShowing] = useState(false);

  const onBackTapped = async () => {
    refreshFeatureAlerts();
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: themer.getColor('background1') }]}>
      <View style={[styles.headerView, { backgroundColor: themer.getColor('screenHeader1.background'), paddingTop: Platform.OS === 'ios' ? 60 : (safeAreaInsets.top + 17.5) } ]}>
        <View style={styles.titleView}>
          <Pressable onPress={onBackTapped} hitSlop={20}>
            <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={themer.getColor('screenHeader1.foreground')} />
          </Pressable>
          <Text style={[styles.title, { color: themer.getColor('screenHeader1.foreground') }]}>{t('keyboard:title')}</Text>
          <View style={styles.placeholderIcon} />
        </View>
      </View>
      { !isInstructionsShowing &&
        <>
          <Image source={Platform.OS === 'ios' ? require('../assets/images/keyboard-demo-ios.gif') : require('../assets/images/keyboard-demo-android.gif')} style={[styles.previewImage, { backgroundColor: Platform.OS === 'ios' ? 'rgb(255, 252, 255)' : '#F7F6FB' }]} />
          <View style={styles.contentView}>
            <Text style={[styles.titleText, { color: themer.getColor('content2.foreground') }]}>{t('keyboard:theSnippetaKeyboard')}</Text>
            <Text style={[styles.descriptionText, { color: themer.getColor('content2.foreground') }]}>{t('keyboard:description')}</Text>
            <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}><Trans i18nKey="keyboard:features.tapSnippet" components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }} /></Text>
            <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}><Trans i18nKey="keyboard:features.spaceBackspace" components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }} /></Text>
            <Text style={[styles.featureText, { color: themer.getColor('content2.foreground'), marginBottom: 20 }]}><Trans i18nKey={Platform.OS === 'ios' ? 'keyboard:features.findKeyboardIos' : 'keyboard:features.findKeyboardAndroid'} components={{ bold: <Text style={{ fontWeight: 'bold' }} />, italic: <Text style={{ fontStyle: 'italic' }} /> }} /></Text>
            <ActionButton iconImageSource={require('../assets/images/gear-gray.png')} text={t('keyboard:howToInstall')} foregroundColor={themer.getColor('button2.foreground')} backgroundColor={themer.getColor('button2.background')} onTapped={() => { setIsInstructionsShowing(true); analytics.logEvent('keyboard_how_to_install_tapped'); }} />
          </View>
        </>
      }
      { isInstructionsShowing &&
        <>
          <Image source={Platform.OS === 'ios' ? require('../assets/images/keyboard-install-ios.gif') : require('../assets/images/keyboard-install-android.gif')} style={[styles.previewImage, { backgroundColor: Platform.OS === 'ios' ? 'rgb(242, 242, 247)' : '#EFEEF1' }]} />
          <View style={styles.contentView}>
            <Text style={[styles.titleText, { color: themer.getColor('content2.foreground') }]}>{t('keyboard:install.title')}</Text>
            <Text style={[styles.descriptionText, { color: themer.getColor('content2.foreground') }]}>{t('keyboard:install.description')}</Text>
            { Platform.OS === 'ios' &&
              <>
                <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}><Trans i18nKey="keyboard:install.ios.step1" components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }} /></Text>
                <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}><Trans i18nKey="keyboard:install.ios.step2" components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }} /></Text>
                <Text style={[styles.featureText, { color: themer.getColor('content2.foreground'), marginBottom: 20 }]}><Trans i18nKey="keyboard:install.ios.step3" components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }} /></Text>
                <ActionButton iconImageSource={require('../assets/images/gear-gray.png')} text={t('keyboard:systemSettings')} foregroundColor={themer.getColor('button3.foreground')} backgroundColor={themer.getColor('button3.background')} onTapped={() => { Linking.openURL('app-settings:'); analytics.logEvent('keyboard_system_settings_tapped'); }} />
              </>
            }
            { Platform.OS === 'android' &&
              <>
                <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}><Trans i18nKey="keyboard:install.android.step1" components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }} /></Text>
                <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}><Trans i18nKey="keyboard:install.android.step2" components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }} /></Text>
                <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}><Trans i18nKey="keyboard:install.android.step3" components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }} /></Text>
                <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}><Trans i18nKey="keyboard:install.android.step4" components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }} /></Text>
                <Text style={[styles.featureText, { color: themer.getColor('content2.foreground'), marginBottom: 20 }]}><Trans i18nKey="keyboard:install.android.step5" components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }} /></Text>
                <ActionButton iconImageSource={require('../assets/images/gear-gray.png')} text={t('keyboard:systemSettings')} foregroundColor={themer.getColor('button3.foreground')} backgroundColor={themer.getColor('button3.background')} onTapped={() => { Linking.sendIntent('android.settings.SETTINGS'); analytics.logEvent('keyboard_system_settings_tapped'); }} />
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