import React, { useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Platform, Pressable, RefreshControl, SectionList, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import { useFancyActionSheet } from 'react-native-fancy-action-sheet';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { ApplicationContext } from '../ApplicationContext';
import { snippetTypes } from '../constants/snippetTypes';
import { snippetSources } from '../constants/snippetSources';
import { storageKeys } from '../constants/storageKeys';
import { readableErrorMessages } from '../constants/readableErrorMessages';
import { colorIds } from '../constants/colorIds';
import { moveSnippetOptions } from '../constants/moveSnippetOptions';
import api from '../helpers/api';
import storage from '../helpers/storage';
import banner from '../helpers/banner';
import style from '../helpers/style';
import ActionButton from '../components/ActionButton';
import SnippetView from '../components/SnippetView';
import SnippetaCloudView from '../components/SnippetaCloudView';
import FeatureAlertsView from '../components/FeatureAlertsView';
import analytics from '../helpers/analytics';

const SnippetsScreen = ({ route, navigation }) => {
  const parentSnippet = route.params?.parentSnippet;
  const isRootSnippetsScreen = !parentSnippet;
  const callbacks = route.params?.callbacks || [];

  const { themer, user, isUserLoading, subscription, onSnippetChanged } = useContext(ApplicationContext);

  const safeAreaInsets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [snippetSections, setSnippetSections] = useState([]);
  const [isOnDeviceSectionVisible, setIsOnDeviceSectionVisible] = useState(true);
  const [isCloudSectionVisible, setIsCloudSectionVisible] = useState(true);

  const isEligibleForTutorial = useRef(true);

  const { showFancyActionSheet } = useFancyActionSheet();

  const tutorialSnippets = [
    { id: storageKeys.SNIPPET + 1, type: snippetTypes.SINGLE, source: snippetSources.STORAGE, title: 'Welcome to Snippeta!', content: 'Snippeta is the best way to copy, paste, and manage snippets of text! Copy text to your clipboard with a single tap; no highlighting or long-tapping!', color_id: colorIds.COLOR_1, time: new Date(), order_index: 0 },
    { id: storageKeys.SNIPPET + 2, type: snippetTypes.SINGLE, source: snippetSources.STORAGE, title: 'Getting started', content: 'Tap here to copy this snippet to your clipboard, or tap the "Add snippet" button above to create a new snippet!', color_id: colorIds.COLOR_2, time: new Date(), order_index: 1 },
    { id: storageKeys.SNIPPET + 3, type: snippetTypes.MULTIPLE, source: snippetSources.STORAGE, title: 'Organize by creating groups', content: 'Create a snippet group to organize and nest snippets. Tap here to try it out!', color_id: colorIds.COLOR_3, time: new Date(), order_index: 2 },
    { id: storageKeys.SNIPPET + 4, type: snippetTypes.SINGLE, source: snippetSources.STORAGE, title: 'Go PRO to do more!', content: 'Get access to Cloud sync, creating sub-groups, pro themes, and more with a Snippeta Pro subscription!', color_id: colorIds.COLOR_4, time: new Date(), order_index: 3 },
    { id: storageKeys.SNIPPET + 5, type: snippetTypes.SINGLE, source: snippetSources.STORAGE, title: 'Add snippets to this group', content: 'Tap the "Add snippet" button above to try it out!', color_id: colorIds.COLOR_3, time: new Date(), order_index: 0, parent_id: storageKeys.SNIPPET + 3 },
  ];

  const moveSnippetOptionNames = {};
  moveSnippetOptionNames[moveSnippetOptions.TO_TOP] = 'Move to top ⎴';
  moveSnippetOptionNames[moveSnippetOptions.UP] = 'Move up ↑';
  moveSnippetOptionNames[moveSnippetOptions.DOWN] = 'Move down ↓';
  moveSnippetOptionNames[moveSnippetOptions.TO_BOTTOM] = 'Move to bottom ⎵';

  useEffect(() => {
    if (!isUserLoading) {
      console.log(`SnippetsScreen.js -> useEffect: ${user ? `User ${user.id} loaded` : 'No user loaded'}. Getting snippets..`);
      getSnippets();
    }
  }, [user]);

  const getSnippets = async () => {
    try {
      setIsLoading(true);
      
      // try to get storage snippets for current parent ID
      let storageSnippets = [];
      try {
        if (isRootSnippetsScreen || parentSnippet.source == snippetSources.STORAGE) {
          storageSnippets = await storage.getSnippets(parentSnippet?.id, false);
          storageSnippets.forEach(x => { x.source = snippetSources.STORAGE; });
          storageSnippets.sort((a, b) => a.order_index - b.order_index);
        }
      } catch (error) {
        console.error('SnippetsScreen.js -> getSnippets: getting snippets from storage failed with error: ' + error.message);
        banner.showErrorMessage(readableErrorMessages.GET_SNIPPET_DATA_ERROR);
      }
      
      // try to get API snippets for current parent ID
      let apiSnippets = [];
      try {
        if (isRootSnippetsScreen || (parentSnippet.source == snippetSources.API && user)) {
          let response = await api.getSnippets(parentSnippet?.id ?? 0, false, await storage.getAuthorizationToken());
          if (!response?.ok) { throw new Error(`HTTP error with status ${response?.status}`); }
          let responseJson = await response.json();
          apiSnippets = responseJson.child_snippets ?? [];
          apiSnippets.forEach(x => { x.source = snippetSources.API; });
          apiSnippets.sort((a, b) => a.order_index - b.order_index);
          console.log(`SnippetsScreen.js -> getSnippets: Got ${apiSnippets.length} snippets from API for parent ID ${parentSnippet?.id ?? 0}:`, JSON.stringify(apiSnippets.map(x => x.id)));
        }
      } catch (error) {
        console.error('SnippetsScreen.js -> getSnippets: getting snippets from API failed with error: ' + error.message);
        banner.showErrorMessage(readableErrorMessages.GET_SNIPPET_DATA_ERROR);
      }

      // combime storage and API snippets
      let snippetSections = [];
      if (isRootSnippetsScreen) {
        if (storageSnippets.length > 0) { snippetSections.push({ title: snippetSources.STORAGE, data: storageSnippets }, { title: snippetSources.API, data: apiSnippets }); }
        else if (apiSnippets.length > 0) { snippetSections.push({ title: snippetSources.API, data: apiSnippets }); }
      } else {
        if (storageSnippets.length > 0 && apiSnippets.length > 0) { snippetSections.push({ title: snippetSources.STORAGE, data: storageSnippets }, { title: snippetSources.API, data: apiSnippets }); }
        else if (storageSnippets.length > 0) { snippetSections.push({ data: storageSnippets }); }
        else if (apiSnippets.length > 0) { snippetSections.push({ data: apiSnippets }); }
      }
      
      // if in root snippet group, and no snippets exist, then populate with tutorial snippets in storage
      if (isRootSnippetsScreen && isEligibleForTutorial.current && storageSnippets.length == 0 && apiSnippets.length == 0) {
        console.log('SnippetsScreen.js -> getSnippets: No snippets in root snippet group. Adding tutorial snippets..');
        for (const tutorialSnippet of tutorialSnippets) {
          await storage.saveSnippet(tutorialSnippet);
        }
        isEligibleForTutorial.current = false;
        await getSnippets(); onSnippetChanged(); return;
      }

      // set snippets for display
      setSnippetSections(snippetSections);
      setIsLoading(false);
      triggerHapticFeedback();

    } catch (error) {
      console.error('SnippetsScreen.js -> getSnippets: Loading snippets data failed with error: ' + error.message);
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await getSnippets(true);
    setIsRefreshing(false);
  };

  const deleteSnippet = async (snippet) => {
    try {
      setIsLoading(true);
      // if source is storage, delete storage
      if (snippet.source == snippetSources.STORAGE) {
        await storage.deleteSnippet(snippet.id);
        await analytics.logEvent('snippet_deleted', { type: snippet.type, source: snippet.source });
        console.log('SnippetScreen.js -> deleteSnippet: Deleted snippet from storage with ID ' + snippet.id);
      }
      // if source is API, delete via API
      else if (snippet.source == snippetSources.API && user) {
        const response = await api.deleteSnippet(snippet.id, await storage.getAuthorizationToken());
        if (!response?.ok) { throw new Error(`HTTP error with status ${response?.status}`); }
        const responseJson = await response.json();
        if (responseJson && responseJson.success) {
          await analytics.logEvent('snippet_deleted', { type: snippet.type, source: snippet.source });
          console.log('SnippetScreen.js -> deleteSnippet: Deleted snippet via API with ID ' + snippet.id);
        } else {
          const errorMessage = 'Deleting snippet failed with unknown error.';
          console.log('SnippetScreen.js -> deleteSnippet: ' + errorMessage);
          banner.showErrorMessage(errorMessage);
        }
      }
      setIsLoading(false);
      await getSnippets();
      onSnippetChanged();

    } catch (error) {
      const errorMessage = 'Deleting snippet failed with error: ' + error.message;
      console.error('SnippetsScreen.js -> deleteSnippet: ' + errorMessage);
      banner.showErrorMessage(errorMessage);
      setIsLoading(false);
    }
  };

  const createSnippet = async (snippetType, content) => {
    navigation.navigate('Snippet',
      {
        snippet: {
          parent_id: parentSnippet?.id,
          type: snippetType ?? snippetTypes.SINGLE,
          source: parentSnippet?.source,
          content: content,
          color_id: parentSnippet?.color_id ?? colorIds.COLOR_1,
        },
        callbacks: callbacks.concat(getSnippets)
      }
    );
  };

  const moveSnippet = async (snippet, option) => {
    try {
      setIsLoading(true);
      // if source is storage, move in storage
      if (snippet.source == snippetSources.STORAGE) {
        await storage.moveSnippet(snippet, option);
        await analytics.logEvent('snippet_moved', { type: snippet.type, source: snippet.source, option: option });
        console.log(`SnippetScreen.js -> moveSnippet: Moved snippet in storage with option ${option} and ID ${snippet.id}`);
      }
      // if source is API, move via API
      else if (snippet.source == snippetSources.API && user) {
        const response = await api.moveSnippet(snippet, option, await storage.getAuthorizationToken());
        if (!response?.ok) { throw new Error(`HTTP error with status ${response?.status}`); }
        const responseJson = await response.json();
        if (responseJson && responseJson.success) {
          await analytics.logEvent('snippet_moved', { type: snippet.type, source: snippet.source, option: option });
          console.log('SnippetScreen.js -> moveSnippet: Moved snippet via API with ID ' + snippet.id);
        } else {
          const errorMessage = 'Moving snippet in failed with unknown error.';
          console.log('SnippetScreen.js -> moveSnippet: ' + errorMessage);
          banner.showErrorMessage(errorMessage);
        }
      }
      setIsLoading(false);
      await getSnippets();
      onSnippetChanged();

    } catch (error) {
      const errorMessage = 'Moving snippet failed with error: ' + error.message;
      console.error('SnippetsScreen.js -> moveSnippet: ' + errorMessage);
      banner.showErrorMessage(errorMessage);
      setIsLoading(false);
    }
  };

  const onSearchTapped = async () => {
    navigation.navigate('Search', { callbacks: callbacks.concat(getSnippets) });
  };

  const onBackTapped = async () => {
    navigation.goBack();
  };

  const onSettingsTapped = async () => {
    navigation.navigate('Settings');
  };

  const onEditTapped = async () => {
    if (!parentSnippet)
      return;
    navigation.navigate('Snippet', { snippet: parentSnippet, callbacks: callbacks.concat(getSnippets) });
  };

  const onAddSnippetTapped = async () => {
    triggerHapticFeedback();
    const options = [{ id: 'NEW_BLANK_SNIPPET', name: 'New blank snippet' }, { id: 'USE_TEXT_FROM_CLIPBOARD', name: 'Use text from clipboard' }];
    showFancyActionSheet({
      title: '➕ New snippet options ‎ ‎',
      message: 'Start blank, or copy text from the clipboard',
      ...style.getFancyActionSheetStyles(themer),
      options: options,
      onOptionPress: async (option) => {
        switch (option.id) {
          case 'NEW_BLANK_SNIPPET':
            createSnippet(snippetTypes.SINGLE);
            break;
          case 'USE_TEXT_FROM_CLIPBOARD':
            createSnippet(snippetTypes.SINGLE, await Clipboard.getString());
            break;
        }
        await analytics.logEvent('add_snippet_option_tapped', { option_id: option.id });
      },
    });
  };

  const onNewGroupTapped = async () => {
    // top-level groups are always allowed, but only allow a sub-group with subscription
    if (isRootSnippetsScreen || subscription) {
      createSnippet(snippetTypes.MULTIPLE);
    } else {
      onSettingsTapped();
      banner.showErrorMessage('Creating a sub-group requires a Snippeta Pro subscription — Read this screen to learn more!');
    }
    await analytics.logEvent('new_group_tapped', { is_root_snippets_screen: isRootSnippetsScreen, has_subscription: (subscription ? true : false) });
  };
  
  const onSnippetTapped = (snippet) => {
    if (snippet.type == snippetTypes.SINGLE) {
      Clipboard.setString(snippet.content);
      banner.showSuccessMessage('The text was copied to the clipboard', `"${snippet.content}"`);
      triggerHapticFeedback();
      analytics.logEvent('snippet_content_copied', { type: snippet.type, source: snippet.source });
    } else { // snippetTypes.MULTIPLE
      navigation.push('Snippets', { parentSnippet: snippet, callbacks: callbacks.concat(getSnippets) });
    }
  };

  const shareSnippet = async (snippet) => {
    try {
      const shareContent = snippet.type == snippetTypes.SINGLE 
        ? snippet.content 
        : `${snippet.title}\n\nThis is a snippet group. Share individual snippets from within the group.`;
      
      const result = await Share.share({
        message: shareContent,
        title: snippet.title,
      });
      console.log('SnippetsScreen.js -> shareSnippet: Result: ' + JSON.stringify(result));
      
      if (result.action === Share.sharedAction) {
        await analytics.logEvent('snippet_shared', { type: snippet.type, source: snippet.source });
        console.log('SnippetsScreen.js -> shareSnippet: Shared snippet with ID ' + snippet.id);
      }
    } catch (error) {
      console.error('SnippetsScreen.js -> shareSnippet: Sharing snippet failed with error: ' + error.message);
      banner.showErrorMessage('Sharing snippet failed: ' + error.message);
    }
  };

  const onSnippetMenuTapped = (snippet) => {
    triggerHapticFeedback();
    const options = [];
    options.push({ id: 'Edit', name: 'Edit' });
    if (snippet.type == snippetTypes.SINGLE) {
      options.push({ id: 'Share', name: 'Share' });
    }
    options.push(...Object.values(moveSnippetOptions).map(moveSnippetOptionValue => { return { id: moveSnippetOptionValue, name: moveSnippetOptionNames[moveSnippetOptionValue] };}));
    options.push({ id: 'Delete', name: 'Delete' });
    showFancyActionSheet({
      title: '⚙️ Snippet options ‎ ‎',
      message: snippet.type == snippetTypes.SINGLE ? 'Edit, share, move, or delete this snippet' : 'Edit, move, or delete this snippet',
      ...style.getFancyActionSheetStyles(themer),
      options: options,
      destructiveOptionId: 'Delete',
      onOptionPress: async (option) => {
        switch (option.id) {
          case 'Edit':
            navigation.navigate('Snippet', { snippet, callbacks: callbacks.concat(getSnippets) }); break;
          case 'Share':
            setTimeout(async () => { await shareSnippet(snippet); }, 100); break;
          case 'Delete':
            await deleteSnippet(snippet); break;
          default:
            const moveSnippetOptionValue = Object.values(moveSnippetOptions).find((moveSnippetOptionValue) => moveSnippetOptionValue == option.id);
            if (Object.values(moveSnippetOptions).includes(moveSnippetOptionValue)) { await moveSnippet(snippet, moveSnippetOptionValue); }
            break;
        }
      },
    });
  }

  const triggerHapticFeedback = () => {
    ReactNativeHapticFeedback.trigger('impactMedium', options = { enableVibrateFallback: true, ignoreAndroidSystemSettings: true, });
  }

  const onAlertDismissed = (alertId) => {
    analytics.logEvent('feature_alert_dismissed', { alert_id: alertId });
    console.log(`SnippetsScreen.js -> onAlertDismissed: Alert dismissed: ${alertId}`);
  };

  const onAlertActionTapped = (alert) => {
    analytics.logEvent('feature_alert_tapped', { alert_id: alert.id });
    console.log(`SnippetsScreen.js -> onAlertActionTapped: Alert action tapped: ${alert.id}`);
    navigation.navigate(alert.actionScreen);
  };

  return (
    <View style={[styles.container, { backgroundColor: themer.getColor('background1') }]}>
      <View style={[styles.headerView, { backgroundColor: themer.getColor('screenHeader1.background'), paddingTop: Platform.OS === 'ios' ? 60 : (safeAreaInsets.top + 17.5) } ]}>
        <View style={styles.titleView}>
          {isRootSnippetsScreen && 
            <Pressable onPress={onSearchTapped} hitSlop={20}>
              <Image source={require('../assets/images/search.png')} style={styles.searchIcon} tintColor={themer.getColor('screenHeader1.foreground')} />
            </Pressable>
          }
          {isRootSnippetsScreen && 
            <Image source={require('../assets/images/logo.png')} style={styles.logoIcon} tintColor={themer.getColor('screenHeader1.foreground')} resizeMode='contain' />
          }
          {!isRootSnippetsScreen &&
            <Pressable onPress={onBackTapped} hitSlop={20}>
              <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={themer.getColor('screenHeader1.foreground')} />
            </Pressable>
          }
          {!isRootSnippetsScreen &&
            <Text style={[styles.title, { color: themer.getColor('screenHeader1.foreground') }]} numberOfLines={2}>{parentSnippet ? parentSnippet.title : 'Snippeta'}</Text>
          }
          {(!parentSnippet || parentSnippet.type == snippetTypes.SINGLE) &&
            <Pressable onPress={onSettingsTapped} hitSlop={20} disabled={isLoading || isUserLoading}>
              <Image source={require('../assets/images/gear-gray.png')} style={styles.settingsIcon} tintColor={themer.getColor('screenHeader1.foreground')} />
            </Pressable>
          }
          {(parentSnippet && parentSnippet.type == snippetTypes.MULTIPLE) &&
            <Pressable onPress={onEditTapped} hitSlop={20} disabled={isLoading || isUserLoading}>
              <Image source={require('../assets/images/edit.png')} style={styles.editIcon} tintColor={themer.getColor('screenHeader1.foreground')} />
            </Pressable>
          }
        </View>
        {!isRootSnippetsScreen && <View style={{ height: 5 }}></View> }
        <View style={styles.buttonsView}>
          <ActionButton iconImageSource={require('../assets/images/plus.png')} text={'Add snippet'} foregroundColor={themer.getColor('button1.foreground')} backgroundColor={themer.getColor('button1.background')} disabled={isLoading || isUserLoading} isLeft onTapped={() => onAddSnippetTapped()} />
          <ActionButton iconImageSource={require('../assets/images/list-icon.png')} text={isRootSnippetsScreen ? 'New group  ' : 'New sub-group'} foregroundColor={themer.getColor('button1.foreground')} backgroundColor={themer.getColor('button1.background')} disabled={isLoading || isUserLoading} isRight onTapped={() => onNewGroupTapped()} />
        </View>
      </View>
      { (isLoading || isUserLoading) &&
        <View style={styles.placeholderView}>
          {[0, 1, 2, 3, 4, 5].map(x => (
            <SkeletonPlaceholder key={x} borderRadius={10} speed={300}>
              <SkeletonPlaceholder.Item height={80} width={Dimensions.get('window').width - 40 } marginBottom={16} marginHorizontal={20} />
            </SkeletonPlaceholder>
          ))}
        </View>
      }
      { (!isLoading && !isUserLoading && snippetSections.length > 0) && 
        <SectionList
          style={styles.snippetsGroup}
          sections={snippetSections}
          keyExtractor={(item, index) => item.id}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={themer.getColor('screenHeader1.foreground')}
              colors={[themer.getColor('screenHeader1.foreground')]}
            />
          }
          renderItem={({item, index, section}) => <SnippetView snippet={item} onSnippetTapped={onSnippetTapped} onSnippetMenuTapped={onSnippetMenuTapped} isHidden={item.source == snippetSources.STORAGE ? !isOnDeviceSectionVisible : !isCloudSectionVisible} isTop={index === 0} isBottom={index === section.data.length - 1} themer={themer} />}
          renderSectionHeader={({section: {title}}) => ( title &&
            <>
              <View>
              { isRootSnippetsScreen && title == snippetSources.API &&
                <FeatureAlertsView
                  themer={themer}
                  user={user}
                  onAlertDismissed={onAlertDismissed}
                  onActionTapped={onAlertActionTapped}
                />
              }
              </View>
              <Pressable 
                onPress={() => { if (title == snippetSources.STORAGE) { setIsOnDeviceSectionVisible(!isOnDeviceSectionVisible); } else { setIsCloudSectionVisible(!isCloudSectionVisible); }}}
                hitSlop={20}
                disabled={isLoading || isUserLoading}
              >
                <View style={styles.sectionHeaderView}>
                  <Text style={[styles.sectionHeaderText, { color: themer.getColor('listHeader1.foreground') }]}>{title == snippetSources.STORAGE ? '📱' : '☁️'} {title}</Text>
                  <Image
                    source={require('../assets/images/back-arrow.png')}
                    style={[styles.sectionHeaderButtonIcon, { color: themer.getColor('listHeader1.foreground'), transform: [{ rotate: (title == snippetSources.STORAGE ? (isOnDeviceSectionVisible ? '-90deg' : '180deg') : (isCloudSectionVisible ? '-90deg' : '180deg')) }], }]}
                    tintColor={themer.getColor('listHeader1.foreground')}
                  />
                </View>
              </Pressable>
              { ((title == snippetSources.API && snippetSections.find(x => x.title == snippetSources.API)?.data?.length == 0) && isCloudSectionVisible) &&
                <SnippetaCloudView themer={themer} user={user} isLargeLogo={false} isCentered={false}>
                  <ActionButton iconImageSource={require('../assets/images/cloud.png')} text={'Learn more'} foregroundColor={themer.getColor('button1.foreground')} backgroundColor={themer.getColor('button1.background')} disabled={isLoading || isUserLoading} onTapped={() => onSettingsTapped()} />
                </SnippetaCloudView>
              }
            </>
          )}
          renderSectionFooter={() => <View style={{ height: 17 }}></View>}
          ListFooterComponent={() => <View style={{ height: 50 }}></View>}
        />
      }
      { (isRootSnippetsScreen && !isLoading && !isUserLoading && snippetSections.length == 0) && 
        <View style={styles.snippetsGroup}>
          <FeatureAlertsView
            themer={themer}
            user={user}
            onAlertDismissed={onAlertDismissed}
            onActionTapped={onAlertActionTapped}
          />
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
    gap: 20,
    marginBottom: 15,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logoIcon: {
    flex: 1,
    height: 35,
    marginTop: 7,
  },
  searchIcon: {
    height: 25,
    width: 25,
    marginTop: 2,
  },
  backIcon: {
    height: 25,
    width: 25,
    marginTop: 2,
  },
  settingsIcon: {
    height: 25,
    width: 25,
    marginTop: 2,
  },
  editIcon: {
    height: 25,
    width: 25,
    marginTop: 2,
  },
  buttonsView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  placeholderView: {
    paddingTop: 20,
    backgroundColor: 'transparent',
  },
  snippetsGroup: {
    padding: 20
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
  sectionHeaderButtonIcon: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
    opacity: 0.25,
    marginTop: Platform.OS === 'ios' ? 0 : 4,
  },
});

export default SnippetsScreen;