import React, { useContext } from 'react';
import { Dimensions, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation, Trans } from 'react-i18next';
import { ApplicationContext } from '../ApplicationContext';

const WidgetScreen = ({ navigation }) => {
  const { t } = useTranslation(['common', 'widget']);
  const { themer, refreshFeatureAlerts } = useContext(ApplicationContext);

  const safeAreaInsets = useSafeAreaInsets();

  const onBackTapped = async () => {
    refreshFeatureAlerts();
    navigation.goBack();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: themer.getColor('background1') }]}>
      <View style={[styles.headerView, { backgroundColor: themer.getColor('screenHeader1.background'), paddingTop: Platform.OS === 'ios' ? 60 : (safeAreaInsets.top + 17.5) } ]}>
        <View style={styles.titleView}>
          <Pressable onPress={onBackTapped} hitSlop={20}>
            <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={themer.getColor('screenHeader1.foreground')} />
          </Pressable>
          <Text style={[styles.title, { color: themer.getColor('screenHeader1.foreground') }]}>{t('widget:title')}</Text>
          <View style={styles.placeholderIcon} />
        </View>
      </View>
      <Image source={Platform.OS === 'ios' ? require('../assets/images/widget-preview-ios.jpeg') : require('../assets/images/widget-preview-android.jpeg')} style={styles.previewImage} />
      <View style={styles.contentView}>
        <Text style={[styles.titleText, { color: themer.getColor('content2.foreground') }]}>{t('widget:install.title')}</Text>
        <Text style={[styles.descriptionText, { color: themer.getColor('content2.foreground') }]}>{t('widget:install.description')}</Text>
        { Platform.OS === 'ios' &&
          <>
            <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}><Trans i18nKey="widget:install.ios.step1" components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }} /></Text>
            <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}><Trans i18nKey="widget:install.ios.step2" components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }} /></Text>
            <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}><Trans i18nKey="widget:install.ios.step3" components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }} /></Text>
            <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}><Trans i18nKey="widget:install.ios.step4" components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }} /></Text>
          </>
        }
        { Platform.OS === 'android' &&
          <>
            <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}><Trans i18nKey="widget:install.android.step1" components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }} /></Text>
            <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}><Trans i18nKey="widget:install.android.step2" components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }} /></Text>
            <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}><Trans i18nKey="widget:install.android.step3" components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }} /></Text>
            <Text style={[styles.featureText, { color: themer.getColor('content2.foreground') }]}><Trans i18nKey="widget:install.android.step4" components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }} /></Text>
          </>
        }
        <Text style={[styles.featureText, { color: themer.getColor('content2.foreground'), textAlign: 'center', fontStyle: 'italic', opacity: 0.50, marginTop: 10 }]}>{t('widget:install.note')}</Text>
      </View>
    </ScrollView>
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
    alignSelf: 'center',
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