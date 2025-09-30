import React, { useContext, useState } from 'react';
import { Dimensions, Image, Platform, Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useFancyActionSheet } from 'react-native-fancy-action-sheet';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { ApplicationContext } from '../ApplicationContext';
import { snippetTypes } from '../constants/snippetTypes';
import { snippetSources } from '../constants/snippetSources';
import { readableErrorMessages } from '../constants/readableErrorMessages';
import api from '../helpers/api';
import storage from '../helpers/storage';
import banner from '../helpers/banner';
import analytics from '../helpers/analytics';
import style from '../helpers/style';
import SnippetView from '../components/SnippetView';

const SearchScreen = ({ route, navigation }) => {
  const callbacks = route.params.callbacks || [];

  const { themer, user, isUserLoading } = useContext(ApplicationContext);

  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [snippetSections, setSnippetSections] = useState([]);

  const { showFancyActionSheet } = useFancyActionSheet();

  const searchSnippets = async (query) => {
    try {
      setIsLoading(true);
      
      // search storage snippets for current query
      let storageSnippets = [];
      try {
        if (query?.length > 1) {
          storageSnippets = await storage.searchSnippets(query);
          storageSnippets.forEach(x => { x.source = snippetSources.STORAGE; });
          storageSnippets.sort((a, b) => a.order_index - b.order_index);
          console.log(`SearchScreen.js -> searchSnippets: Got ${storageSnippets.length} snippets from storage for query ${query}:`, JSON.stringify(storageSnippets.map(x => x.id)));
        }
      } catch (error) {
        console.error('SearchScreen.js -> searchSnippets: searching snippets in storage failed with error: ' + error.message);
        banner.showErrorMessage(readableErrorMessages.GET_SNIPPET_DATA_ERROR);
      }
      
      // search api snippets for current query
      let apiSnippets = [];
      try {
        if (user && query?.length > 1) {
          let response = await api.searchSnippets(query, await storage.getAuthorizationToken());
          if (!response?.ok) { throw new Error(`HTTP error with status ${response?.status}`); }
          let responseJson = await response.json();
          apiSnippets = responseJson.snippets ?? [];
          apiSnippets.forEach(x => { x.source = snippetSources.API; });
          apiSnippets.sort((a, b) => a.order_index - b.order_index);
          console.log(`SearchScreen.js -> searchSnippets: Got ${apiSnippets.length} snippets for query ${query}:`, JSON.stringify(apiSnippets.map(x => x.id)));
        }
      } catch (error) {
        console.error('SearchScreen.js -> searchSnippets: searching snippets via API failed with error: ' + error.message);
        banner.showErrorMessage(readableErrorMessages.GET_SNIPPET_DATA_ERROR);
      }

      // combine storage and api snippets
      let snippetSections =
        storageSnippets.length > 0 && apiSnippets.length > 0 ? [{ title: snippetSources.STORAGE, data: storageSnippets }, { title: snippetSources.API, data: apiSnippets }] :
        storageSnippets.length > 0 ? [{ data: storageSnippets }] :
        apiSnippets.length > 0 ? [{ data: apiSnippets }] :
        [];
      
      await analytics.logEvent('snippets_searched', { query: query });
      
      // set snippets for display
      setSnippetSections(snippetSections);
      setIsLoading(false);

    } catch (error) {
      console.error('SearchScreen.js -> searchSnippets: Loading snippets data failed with error: ' + error.message);
      banner.showErrorMessage(readableErrorMessages.GET_SNIPPET_DATA_ERROR);
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
      analytics.logEvent('snippet_copied', { type: snippet.type, source: snippet.source });
    } else { // snippetTypes.MULTIPLE
      navigation.push('Snippets', { parentSnippet: snippet, callbacks: callbacks.concat(async () => { await searchSnippets(query); }) });
    }
  };

  const onSnippetMenuTapped = (snippet) => {
    const options = [{ id: 'Edit', name: 'Edit' }];
    showFancyActionSheet({
      title: '⚙️ Snippet options ‎ ‎',
      ...style.getFancyActionSheetStyles(themer),
      options: options,
      onOptionPress: async (option) => {
        switch (option.id) {
          case 'Edit':
            navigation.navigate('Snippet', { snippet, callbacks: callbacks.concat(async () => { await searchSnippets(query); }) }); break;
        }
      },
    });
  }

  const showErrorMessage = (message) => {
    banner.showErrorMessage(message);
  };

  return (
    <View style={[styles.container, { backgroundColor: themer.getColor('background1') }]}>
      <View style={[styles.headerView, { backgroundColor: themer.getColor('screenHeader1.background') } ]}>
        <View style={styles.titleView}>
          <Pressable onPress={onBackTapped} hitSlop={20}>
            <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={themer.getColor('screenHeader1.foreground')} />
          </Pressable>
          <Text style={[styles.title, { color: themer.getColor('screenHeader1.foreground') }]}>Search</Text>
          <View style={styles.placeholderIcon} />
        </View>
        <View style={[styles.inputView, { backgroundColor: themer.getColor('textInput2.background') }]}>
          <TextInput style={[styles.input, { color: themer.getColor('textInput2.foreground') }]} placeholder={'Search text..'} placeholderTextColor={themer.getPlaceholderTextColor('textInput2.foreground')} maxLength={50} autoCapitalize='none' autoFocus value={query} onChangeText={onQueryChangeText} />
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
          keyboardShouldPersistTaps={'handled'}
          renderItem={({item}) => <SnippetView snippet={item} onSnippetTapped={onSnippetTapped} onSnippetMenuTapped={onSnippetMenuTapped} themer={themer} />}
          renderSectionHeader={({section: {title}}) => ( title &&
            <View style={styles.sectionHeaderView}>
              <Text style={[styles.sectionHeaderText, { color: themer.getColor('listHeader1.foreground') }]}>{title == snippetSources.STORAGE ? '📱' : '☁️'} {title}</Text>
            </View>
          )}
          renderSectionFooter={() => <View style={{ height: 10 }}></View>}
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
    paddingTop: Platform.OS === 'ios' ? 60 : 17.5,
    paddingBottom: 5,
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
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 20 : 10,
    borderRadius: 30,
  },
  input: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  snippetsList: {
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

export default SearchScreen;