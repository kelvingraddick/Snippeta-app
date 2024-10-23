import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, Image, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { showMessage } from "react-native-flash-message";
import Clipboard from '@react-native-clipboard/clipboard';
import { useActionSheet } from '@expo/react-native-action-sheet';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { ApplicationContext } from '../ApplicationContext';
import { snippetTypes } from '../constants/snippetTypes';
import { snippetSources } from '../constants/snippetSources';
import { storageKeys } from '../constants/storageKeys';
import api from '../helpers/api';
import storage from '../helpers/storage';
import widget from '../helpers/widget';
import colors from '../helpers/colors';
import ActionButton from '../components/ActionButton';
import SnippetView from '../components/SnippetView';

const SnippetsScreen = ({ route, navigation }) => {
  const parentSnippet = route.params?.parentSnippet;
  const isRootSnippetsScreen = !parentSnippet;
  const callbacks = route.params?.callbacks || [];
  const deepLinkSnippetId = route.params?.deepLinkSnippetId;
  const deepLinkSearch = route.params?.deepLinkSearch;
  const deepLinkAddSnippet = route.params?.deepLinkAddSnippet;

  const { user, isUserLoading } = useContext(ApplicationContext);

  const [isLoading, setIsLoading] = useState(true);
  const [snippetSections, setSnippetSections] = useState([]);

  const { showActionSheetWithOptions } = useActionSheet();

  const tutorialSnippets = [
    { id: storageKeys.SNIPPET + 1, type: snippetTypes.SINGLE, source: snippetSources.STORAGE, title: 'Welcome to Snippeta!', content: 'Snippeta is the best way to copy, paste, and manage snippets of text! Copy text to your clipboard with a single tap; no highlighting or long-tapping!', color_id: colors.lightYellow.id, time: new Date(), order_index: 0 },
    { id: storageKeys.SNIPPET + 2, type: snippetTypes.SINGLE, source: snippetSources.STORAGE, title: 'How to use:', content: 'Tap the button above to create a new snippet. Or tap on this snippet to copy it to your clipboard for pasting later!', color_id: colors.lightGreen.id, time: new Date(), order_index: 1 },
    { id: storageKeys.SNIPPET + 3, type: snippetTypes.MULTIPLE, source: snippetSources.STORAGE, title: 'Go PRO!', content: 'Want more out of Snippeta? Take your account pro and get access to create lists and more!', color_id: colors.lightBlue.id, time: new Date(), order_index: 2 },
  ];

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
        console.log(`SnippetsScreen.js -> getSnippets: Got ${storageSnippets.length} snippets from storage for parent ID ${parentSnippet?.id ?? 0}:`, JSON.stringify(storageSnippets.map(x => x.id)));
      }
      
      // try to get api snippets for current parent ID
      let apiSnippets = [];
      if (isRootSnippetsScreen || (parentSnippet.source == snippetSources.API && user)) {
        let response = await api.getSnippets(parentSnippet?.id ?? 0, await storage.getAuthorizationToken());
        let responseJson = await response.json();
        apiSnippets = responseJson.child_snippets ?? [];
        apiSnippets.forEach(x => { x.source = snippetSources.API; });
        apiSnippets.sort((a, b) => a.order_index - b.order_index);
        console.log(`SnippetsScreen.js -> getSnippets: Got ${apiSnippets.length} snippets for parent ID ${parentSnippet?.id ?? 0}:`, JSON.stringify(apiSnippets.map(x => x.id)));
      }

      // combime storage and api snippets
      let snippetSections =
        storageSnippets.length > 0 && apiSnippets.length > 0 ? [{ title: snippetSources.STORAGE, data: storageSnippets }, { title: snippetSources.API, data: apiSnippets }] :
        storageSnippets.length > 0 ? [{ data: storageSnippets }] :
        apiSnippets.length > 0 ? [{ data: apiSnippets }] :
        [];
      
      // if in root snippet list, and no snippets exist, then populate with tutorial snippets in storage
      if (isRootSnippetsScreen && snippetSections.length == 0) {
        console.log('SnippetsScreen.js -> getSnippets: No snippets in root snippet list. Adding tutorial snippets..');
        for (const tutorialSnippet of tutorialSnippets) {
          await storage.saveSnippet(tutorialSnippet);
        }
        snippetSections = [{ data: await storage.getSnippets(parentSnippet?.id) }];
      }

      if (isRootSnippetsScreen) {
        // set snippet data for widget
        let snippetLists = [{ id: '-1', title: 'Snippets' }];
        snippetLists = snippetLists.concat(storageSnippets.concat(apiSnippets).filter(x => x.type == snippetTypes.MULTIPLE).map(x => { return { id: x.id, title: x.title }; }));
        await widget.saveData('snippetLists', JSON.stringify(snippetLists));
      }

      if (deepLinkSnippetId) {
        console.log(`SnippetsScreen.js -> getSnippets: handling deep link to snippet Id ${deepLinkSnippetId}`);
        const snippet = storageSnippets.concat(apiSnippets).find(x => x.id === deepLinkSnippetId);
        if (snippet) {
          console.log(`SnippetsScreen.js -> getSnippets: performing deep link screen navigation to snippet Id ${deepLinkSnippetId}`);
          navigation.push('Snippets', { parentSnippet: snippet, callbacks: callbacks.concat(getSnippets) });
        }
      } else if (deepLinkSearch) {
        console.log(`SnippetsScreen.js -> getSnippets: handling deep link to search`);
        onSearchTapped();
      } else if (deepLinkAddSnippet ) {
        console.log(`SnippetsScreen.js -> getSnippets: handling deep link to add new snippet`);
        onNewSnippetTapped();
      }

      // set snippets for display
      setSnippetSections(snippetSections);
      setIsLoading(false);

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
      // if source is api, delete via api
      else if (snippet.source == snippetSources.API && user) {
        const response = await api.deleteSnippet(snippet.id, await storage.getAuthorizationToken());
        const responseJson = await response.json();
        if (responseJson && responseJson.success) {
          console.log('SnippetScreen.js -> deleteSnippet: Deleted snippet via API with ID ' + snippet.id);
        } else {
          const errorMessage = 'Deleting snippet failed with unknown error.';
          console.log('SnippetScreen.js -> deleteSnippet: ' + errorMessage);
          showErrorMessage(errorMessage);
        }
      }
      setIsLoading(false);
      await getSnippets();

    } catch (error) {
      const errorMessage = 'Deleting snippet failed with error: ' + error.message;
      console.error('SnippetsScreen.js -> deleteSnippet: ' + errorMessage);
      showErrorMessage(errorMessage);
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
          color_id: parentSnippet?.color_id ?? colors.lightYellow.id,
        },
        callbacks: callbacks.concat(getSnippets)
      }
    );
  };

  const moveSnippet = async (snippet) => {
    try {
      setIsLoading(true);
      // if source is storage, move in storage
      if (snippet.source == snippetSources.STORAGE) {
        await storage.moveSnippet(snippet);
        console.log('SnippetScreen.js -> moveSnippet: Moved snippet in storage with ID ' + snippet.id);
      }
      // if source is api, move via api
      else if (snippet.source == snippetSources.API && user) {
        const response = await api.moveSnippet(snippet, await storage.getAuthorizationToken());
        const responseJson = await response.json();
        if (responseJson && responseJson.success) {
          console.log('SnippetScreen.js -> moveSnippet: Moved snippet via API with ID ' + snippet.id);
        } else {
          const errorMessage = 'Moving snippet in failed with unknown error.';
          console.log('SnippetScreen.js -> moveSnippet: ' + errorMessage);
          showErrorMessage(errorMessage);
        }
      }
      setIsLoading(false);
      await getSnippets();

    } catch (error) {
      const errorMessage = 'Moving snippet failed with error: ' + error.message;
      console.error('SnippetsScreen.js -> moveSnippet: ' + errorMessage);
      showErrorMessage(errorMessage);
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

  const onNewSnippetTapped = async () => {
    const options = { 'Snippet (blank)': 0, 'Snippet (from clipboard)': 1, 'List': 2, 'Cancel': 3 };
    showActionSheetWithOptions(
      {
        title: 'What do you want to create?',
        options: Object.keys(options),
        cancelButtonIndex: options.Cancel,
      },
      async (selectedIndex) => {
        switch (selectedIndex) {
          case options['Snippet (blank)']:
            createSnippet(snippetTypes.SINGLE);
            break;
          case options['Snippet (from clipboard)']:
            createSnippet(snippetTypes.SINGLE, await Clipboard.getString());
            break;
          case options['List']:
            createSnippet(snippetTypes.MULTIPLE);
            break;
        }
      }
    );
  };
  
  const onSnippetTapped = (snippet) => {
    if (snippet.type == snippetTypes.SINGLE) {
      Clipboard.setString(snippet.content);
      showMessage({
        message: 'The text was copied to the clipboard',
        description: `"${snippet.content}"`,
        icon: { icon: () => <Image source={require('../assets/images/copy-white.png')} style={styles.messageIcon} tintColor={colors.black.hexCode} />, position: 'right' },
        backgroundColor: colors.getById(snippet.color_id)?.hexCode,
        titleStyle: {
          fontWeight: 'bold',
          color: 'black',
          opacity: 0.60,
        },
        textStyle: {
          fontStyle: 'italic',
          color: 'black',
          opacity: 0.60,
        }
      });
    } else { // snippetTypes.MULTIPLE
      navigation.push('Snippets', { parentSnippet: snippet, callbacks: callbacks.concat(getSnippets) });
    }
  };

  const onSnippetMenuTapped = (snippet) => {
    const options = { 'Edit': 0, 'Move to top': 1, 'Delete': 2, 'Cancel': 3 };
    showActionSheetWithOptions(
      {
        options: Object.keys(options),
        cancelButtonIndex: options.Cancel,
        destructiveButtonIndex: options.Delete,
      },
      async (selectedIndex) => {
        switch (selectedIndex) {
          case options.Edit:
            navigation.navigate('Snippet', { snippet, callbacks: callbacks.concat(getSnippets) });
            break;
          case options['Move to top']:
            await moveSnippet(snippet);
            break;
          case options.Delete:
            await deleteSnippet(snippet);
            break;
        }
      }
    );
  }

  const showErrorMessage = (message) => {
    showMessage({
      message: message,
      backgroundColor: colors.lightRed.hexCode,
      titleStyle: {
        fontWeight: 'bold',
        color: 'black',
        opacity: 0.60,
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerView}>
        <View style={styles.titleView}>
          {isRootSnippetsScreen && 
            <Pressable onPress={onSearchTapped} hitSlop={20}>
              <Image source={require('../assets/images/search.png')} style={styles.searchIcon} tintColor={colors.white.hexCode} />
            </Pressable>
          }
          {isRootSnippetsScreen && 
            <Image source={require('../assets/images/logo.png')} style={styles.logoIcon} tintColor={colors.white.hexCode} resizeMode='contain' />
          }
          {!isRootSnippetsScreen &&
            <Pressable onPress={onBackTapped} hitSlop={20}>
              <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={colors.white.hexCode} />
            </Pressable>
          }
          {!isRootSnippetsScreen &&
            <Text style={styles.title} numberOfLines={2}>{parentSnippet ? parentSnippet.title : 'Snippeta'}</Text>
          }
          {(!parentSnippet || parentSnippet.type == snippetTypes.SINGLE) &&
            <Pressable onPress={onSettingsTapped} hitSlop={20} disabled={isLoading || isUserLoading}>
              <Image source={require('../assets/images/gear-gray.png')} style={styles.settingsIcon} tintColor={colors.white.hexCode} />
            </Pressable>
          }
          {(parentSnippet && parentSnippet.type == snippetTypes.MULTIPLE) &&
            <Pressable onPress={onEditTapped} hitSlop={20} disabled={isLoading || isUserLoading}>
              <Image source={require('../assets/images/edit.png')} style={styles.editIcon} tintColor={colors.white.hexCode} />
            </Pressable>
          }
        </View>
        <ActionButton iconImageSource={require('../assets/images/plus.png')} text={'New snippet or list'} color={colors.nebulaBlue} disabled={isLoading || isUserLoading} onTapped={() => onNewSnippetTapped()} />
      </View>
      { (isLoading || isUserLoading) &&
        <View style={styles.snippetsList}>
          {[0, 1, 2, 3, 4, 5].map(x => (
            <SkeletonPlaceholder borderRadius={10} speed={200}>
              <SkeletonPlaceholder.Item height={100} width={Dimensions.get('window').width - 40 } marginBottom={16} />
            </SkeletonPlaceholder>
          ))}
        </View>
      }
      { (!isLoading && !isUserLoading) && 
        <SectionList
          style={styles.snippetsList}
          sections={snippetSections}
          keyExtractor={(item, index) => item + index}
          stickySectionHeadersEnabled={false}
          renderItem={({item}) => <SnippetView snippet={item} onSnippetTapped={onSnippetTapped} onSnippetMenuTapped={onSnippetMenuTapped} />}
          renderSectionHeader={({section: {title}}) => ( title &&
            <View style={styles.sectionHeaderView}>
              <Image source={title == snippetSources.STORAGE ? require('../assets/images/device.png') : require('../assets/images/cloud.png')} style={styles.sectionHeaderIcon} tintColor={colors.darkGray.hexCode} />
              <Text style={styles.sectionHeaderText}>{title}</Text>
            </View>
          )}
        />
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white.hexCode,
  },
  headerView: {
    padding: 20,
    paddingTop: 60,
    borderRadius: 30,
    backgroundColor: colors.darkGray.hexCode,
  },
  titleView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.white.hexCode
  },
  logoIcon: {
    flex: 1,
    height: 40,
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
  messageIcon: {
    height: 20,
    width: 20,
    color: colors.darkGray.hexCode,
    opacity: 0.25,
  },
  snippetsList: {
    padding: 20
  },
  sectionHeaderView: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    paddingBottom: 7.5,
    marginBottom: 15,
    borderBottomWidth: 4,
    borderColor: 'rgba(29, 32, 39, .1)', // colors.darkGray.hexCode
  }, 
  sectionHeaderIcon: {
    height: 20,
    width: 20,
    color: colors.darkGray.hexCode,
    opacity: 0.25,
  },
  sectionHeaderText: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.darkGray.hexCode,
    opacity: 0.50,
  }
});

export default SnippetsScreen;