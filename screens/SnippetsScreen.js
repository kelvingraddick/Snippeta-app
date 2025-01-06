import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, Image, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useActionSheet } from '@expo/react-native-action-sheet';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { ApplicationContext } from '../ApplicationContext';
import { snippetTypes } from '../constants/snippetTypes';
import { snippetSources } from '../constants/snippetSources';
import { storageKeys } from '../constants/storageKeys';
import { colors } from '../constants/colors';
import { colorIds } from '../constants/colorIds';
import { moveSnippetOptions } from '../constants/moveSnippetOptions';
import api from '../helpers/api';
import storage from '../helpers/storage';
import banner from '../helpers/banner';
import ActionButton from '../components/ActionButton';
import SnippetView from '../components/SnippetView';
import SnippetaCloudView from '../components/SnippetaCloudView';

const SnippetsScreen = ({ route, navigation }) => {
  const parentSnippet = route.params?.parentSnippet;
  const isRootSnippetsScreen = !parentSnippet;
  const callbacks = route.params?.callbacks || [];

  const { themer, user, isUserLoading, subscription, onSnippetChanged } = useContext(ApplicationContext);

  const [isLoading, setIsLoading] = useState(true);
  const [snippetSections, setSnippetSections] = useState([]);
  const [isOnDeviceSectionVisible, setIsOnDeviceSectionVisible] = useState(true);
  const [isCloudSectionVisible, setIsCloudSectionVisible] = useState(true);

  const { showActionSheetWithOptions } = useActionSheet();

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
      if (isRootSnippetsScreen || parentSnippet.source == snippetSources.STORAGE) {
        storageSnippets = await storage.getSnippets(parentSnippet?.id);
        storageSnippets.forEach(x => { x.source = snippetSources.STORAGE; });
        storageSnippets.sort((a, b) => a.order_index - b.order_index);
      }
      
      // try to get API snippets for current parent ID
      let apiSnippets = [];
      if (isRootSnippetsScreen || (parentSnippet.source == snippetSources.API && user)) {
        let response = await api.getSnippets(parentSnippet?.id ?? 0, await storage.getAuthorizationToken());
        let responseJson = await response.json();
        apiSnippets = responseJson.child_snippets ?? [];
        apiSnippets.forEach(x => { x.source = snippetSources.API; });
        apiSnippets.sort((a, b) => a.order_index - b.order_index);
        console.log(`SnippetsScreen.js -> getSnippets: Got ${apiSnippets.length} snippets from API for parent ID ${parentSnippet?.id ?? 0}:`, JSON.stringify(apiSnippets.map(x => x.id)));
      }

      // combime storage and API snippets
      let snippetSections = [];
      if (isRootSnippetsScreen) {
        if ((storageSnippets.length > 0 && apiSnippets.length > 0) || storageSnippets.length > 0) { snippetSections.push({ title: snippetSources.STORAGE, data: storageSnippets }, { title: snippetSources.API, data: apiSnippets }); }
        else if (apiSnippets.length > 0) { snippetSections.push({ data: apiSnippets }); }
      } else {
        if (storageSnippets.length > 0 && apiSnippets.length > 0) { snippetSections.push({ title: snippetSources.STORAGE, data: storageSnippets }, { title: snippetSources.API, data: apiSnippets }); }
        else if (storageSnippets.length > 0) { snippetSections.push({ data: storageSnippets }); }
        else if (apiSnippets.length > 0) { snippetSections.push({ data: apiSnippets }); }
      }
      
      // if in root snippet group, and no snippets exist, then populate with tutorial snippets in storage
      if (isRootSnippetsScreen && storageSnippets.length == 0 && apiSnippets.length == 0) {
        console.log('SnippetsScreen.js -> getSnippets: No snippets in root snippet group. Adding tutorial snippets..');
        for (const tutorialSnippet of tutorialSnippets) {
          await storage.saveSnippet(tutorialSnippet);
        }
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

  const deleteSnippet = async (snippet) => {
    try {
      setIsLoading(true);
      // if source is storage, delete storage
      if (snippet.source == snippetSources.STORAGE) {
        await storage.deleteSnippet(snippet.id);
        console.log('SnippetScreen.js -> deleteSnippet: Deleted snippet from storage with ID ' + snippet.id);
      }
      // if source is API, delete via API
      else if (snippet.source == snippetSources.API && user) {
        const response = await api.deleteSnippet(snippet.id, await storage.getAuthorizationToken());
        const responseJson = await response.json();
        if (responseJson && responseJson.success) {
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
        console.log(`SnippetScreen.js -> moveSnippet: Moved snippet in storage with option ${option} and ID ${snippet.id}`);
      }
      // if source is API, move via API
      else if (snippet.source == snippetSources.API && user) {
        const response = await api.moveSnippet(snippet, option, await storage.getAuthorizationToken());
        const responseJson = await response.json();
        if (responseJson && responseJson.success) {
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
    const options = { 'New blank snippet': 0, 'Use text from clipboard': 1, 'Cancel': 2 };
    showActionSheetWithOptions(
      {
        title: 'How would you like to start creating the snippet?',
        options: Object.keys(options),
        cancelButtonIndex: options.Cancel,
      },
      async (selectedIndex) => {
        switch (selectedIndex) {
          case options['New blank snippet']:
            createSnippet(snippetTypes.SINGLE);
            break;
          case options['Use text from clipboard']:
            createSnippet(snippetTypes.SINGLE, await Clipboard.getString());
            break;
        }
      }
    );
  };

  const onNewGroupTapped = async () => {
    // top-level groups are always allowed, but only allow a sub-group with subscription
    if (isRootSnippetsScreen || subscription) {
      createSnippet(snippetTypes.MULTIPLE);
    } else {
      onSettingsTapped();
      banner.showErrorMessage('Creating a sub-group requires a Snippeta Pro subscription — Read this screen to learn more!');
    }
  };
  
  const onSnippetTapped = (snippet) => {
    if (snippet.type == snippetTypes.SINGLE) {
      Clipboard.setString(snippet.content);
      banner.showSuccessMessage('The text was copied to the clipboard', `"${snippet.content}"`);
      triggerHapticFeedback();
    } else { // snippetTypes.MULTIPLE
      navigation.push('Snippets', { parentSnippet: snippet, callbacks: callbacks.concat(getSnippets) });
    }
  };

  const onSnippetMenuTapped = (snippet) => {
    const options = {}; let optionsIndex = 0;
    options.Edit = optionsIndex++;
    Object.values(moveSnippetOptions).forEach(moveSnippetOptionValue => options[moveSnippetOptionNames[moveSnippetOptionValue]] = optionsIndex++);
    options.Delete = optionsIndex++; options.Cancel = optionsIndex++;
    showActionSheetWithOptions(
      {
        options: Object.keys(options),
        cancelButtonIndex: options.Cancel,
        destructiveButtonIndex: options.Delete,
      },
      async (selectedIndex) => {
        switch (selectedIndex) {
          case options.Edit:
            navigation.navigate('Snippet', { snippet, callbacks: callbacks.concat(getSnippets) }); break;
          case options.Delete:
            await deleteSnippet(snippet); break;
          default:
            const moveSnippetOptionValue = Object.values(moveSnippetOptions).find((moveSnippetOptionValue) => options[moveSnippetOptionNames[moveSnippetOptionValue]] === selectedIndex);
            if (Object.values(moveSnippetOptions).includes(moveSnippetOptionValue)) { await moveSnippet(snippet, moveSnippetOptionValue); }
            break;
        }
      }
    );
  }

  const triggerHapticFeedback = () => {
    ReactNativeHapticFeedback.trigger('impactMedium', options = { enableVibrateFallback: true, ignoreAndroidSystemSettings: true, });
  }

  return (
    <View style={[styles.container, { backgroundColor: themer.getColor('background1') }]}>
      <View style={[styles.headerView, { backgroundColor: themer.getColor('screenHeader1.background') } ]}>
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
        <View style={styles.snippetsGroup}>
          {[0, 1, 2, 3, 4, 5].map(x => (
            <SkeletonPlaceholder key={x} borderRadius={10} speed={300}>
              <SkeletonPlaceholder.Item height={80} width={Dimensions.get('window').width - 40 } marginBottom={16} />
            </SkeletonPlaceholder>
          ))}
        </View>
      }
      { (!isLoading && !isUserLoading) && 
        <SectionList
          style={styles.snippetsGroup}
          sections={snippetSections}
          keyExtractor={(item, index) => item.id}
          stickySectionHeadersEnabled={false}
          renderItem={({item, index, section}) => <SnippetView snippet={item} onSnippetTapped={onSnippetTapped} onSnippetMenuTapped={onSnippetMenuTapped} isHidden={item.source == snippetSources.STORAGE ? !isOnDeviceSectionVisible : !isCloudSectionVisible} isTop={index === 0} isBottom={index === section.data.length - 1} themer={themer} />}
          renderSectionHeader={({section: {title}}) => ( title &&
            <>
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
  },
});

export default SnippetsScreen;