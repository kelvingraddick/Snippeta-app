import React, { useContext, useState } from 'react';
import { Dimensions, Image, Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useActionSheet } from '@expo/react-native-action-sheet';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { ApplicationContext } from '../ApplicationContext';
import { snippetTypes } from '../constants/snippetTypes';
import { snippetSources } from '../constants/snippetSources';
import api from '../helpers/api';
import storage from '../helpers/storage';
import colors from '../helpers/colors';
import banner from '../helpers/banner';
import SnippetView from '../components/SnippetView';

const SearchScreen = ({ route, navigation }) => {
  const callbacks = route.params.callbacks || [];

  const { user, isUserLoading } = useContext(ApplicationContext);

  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [snippetSections, setSnippetSections] = useState([]);

  const { showActionSheetWithOptions } = useActionSheet();

  const searchSnippets = async (query) => {
    try {
      setIsLoading(true);
      
      // search storage snippets for current query
      let storageSnippets = [];
      if (query?.length > 1) {
        storageSnippets = await storage.searchSnippets(query);
        storageSnippets.forEach(x => { x.source = snippetSources.STORAGE; });
        storageSnippets.sort((a, b) => a.order_index - b.order_index);
        console.log(`SearchScreen.js -> searchSnippets: Got ${storageSnippets.length} snippets from storage for query ${query}:`, JSON.stringify(storageSnippets.map(x => x.id)));
      }
      
      // search api snippets for current query
      let apiSnippets = [];
      if (user && query?.length > 1) {
        let response = await api.searchSnippets(query, await storage.getAuthorizationToken());
        let responseJson = await response.json();
        apiSnippets = responseJson.snippets ?? [];
        apiSnippets.forEach(x => { x.source = snippetSources.API; });
        apiSnippets.sort((a, b) => a.order_index - b.order_index);
        console.log(`SearchScreen.js -> searchSnippets: Got ${apiSnippets.length} snippets for query ${query}:`, JSON.stringify(apiSnippets.map(x => x.id)));
      }

      // combine storage and api snippets
      let snippetSections =
        storageSnippets.length > 0 && apiSnippets.length > 0 ? [{ title: snippetSources.STORAGE, data: storageSnippets }, { title: snippetSources.API, data: apiSnippets }] :
        storageSnippets.length > 0 ? [{ data: storageSnippets }] :
        apiSnippets.length > 0 ? [{ data: apiSnippets }] :
        [];
      
      // set snippets for display
      setSnippetSections(snippetSections);
      setIsLoading(false);

    } catch (error) {
      console.error('SearchScreen.js -> searchSnippets: Loading snippets data failed with error: ' + error.message);
      setIsLoading(false);
    }
  };

  const onQueryChangeText = async (text) => {
    setQuery(text);
    await searchSnippets(text);
  };

  const onBackTapped = async () => {
    navigation.goBack();
  };
  
  const onSnippetTapped = (snippet) => {
    if (snippet.type == snippetTypes.SINGLE) {
      Clipboard.setString(snippet.content);
      banner.showSuccessMessage('The text was copied to the clipboard', `"${snippet.content}"`);
    } else { // snippetTypes.MULTIPLE
      navigation.push('Snippets', { parentSnippet: snippet, callbacks: callbacks.concat(async () => { await searchSnippets(query); }) });
    }
  };

  const onSnippetMenuTapped = (snippet) => {
    const options = { 'Edit': 0, 'Cancel': 1 };
    showActionSheetWithOptions(
      {
        options: Object.keys(options),
        cancelButtonIndex: options.Cancel,
      },
      async (selectedIndex) => {
        switch (selectedIndex) {
          case options.Edit:
            navigation.navigate('Snippet', { snippet, callbacks: callbacks.concat(async () => { await searchSnippets(query); }) });
            break;
        }
      }
    );
  }

  const showErrorMessage = (message) => {
    banner.showErrorMessage(message);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerView}>
        <View style={styles.titleView}>
          <Pressable onPress={onBackTapped} hitSlop={20}>
            <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={colors.white.hexCode} />
          </Pressable>
          <Text style={styles.title}>Search</Text>
          <View style={styles.placeholderIcon} />
        </View>
        <View style={styles.inputView}>
          <TextInput style={styles.input} placeholder={'Search text..'} placeholderTextColor={colors.darkGray.hexCode} maxLength={50} autoCapitalize='none' autoFocus value={query} onChangeText={onQueryChangeText} />
        </View>
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
  inputView: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 30,
    backgroundColor: colors.lightYellow.hexCode,
  },
  input: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.darkGray.hexCode
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

export default SearchScreen;