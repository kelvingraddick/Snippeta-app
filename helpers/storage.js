import AsyncStorage from '@react-native-async-storage/async-storage';
import validator from './validator';
import { colorIds } from '../constants/colorIds';
import { storageKeys } from '../constants/storageKeys';
import { snippetTypes } from '../constants/snippetTypes';

const getCredentials = async () => {
  const item = await AsyncStorage.getItem(storageKeys.CREDENTIALS);
  const credentials = JSON.parse(item);
  console.log(`storage.js -> getCredentials: ${credentials?.emailOrPhone ? `Got credentials for ${credentials.emailOrPhone}` : 'No credentials in storage'}`);
  return credentials;
};

const saveCredentials = async (emailOrPhone, password) => {
  console.log('storage.js -> saveCredentials: Saving credentials for ', emailOrPhone);
  const credentials = { emailOrPhone, password };
  if (validator.isValidCredentials(credentials)) {
    const item = JSON.stringify(credentials);
    await AsyncStorage.setItem(storageKeys.CREDENTIALS, item);
    console.log('storage.js -> saveCredentials: Saved credentials for ', emailOrPhone);
  }
};

const deleteCredentials = async () => {
  await AsyncStorage.removeItem(storageKeys.CREDENTIALS);
  console.log('storage.js -> deleteCredentials: Deleted credentials');
};

const getAuthorizationToken = async () => {
  const credentials = await getCredentials();
  return credentials ? btoa(`${credentials.emailOrPhone}:${credentials.password}`) : null;
};

const getSnippets = async (parentId) => {
  console.log('storage.js -> getSnippets: Getting snippets for parent ID', parentId);
  const allKeys = await AsyncStorage.getAllKeys();
  //console.log('storage.js -> getSnippets: All storage keys:', JSON.stringify(allKeys));
  const snippetKeys = allKeys.filter(key => key.startsWith(storageKeys.SNIPPET));
  //console.log(`storage.js -> getSnippets: Storage keys with parent ID ${parentId}:`);
  const snippets = [];
  for (const snippetKey of snippetKeys) {
    const item = await AsyncStorage.getItem(snippetKey);
    const snippet = JSON.parse(item);
    if (snippet?.parent_id === parentId) {
      snippets.push(snippet);
    }
  }
  console.log(`storage.js -> getSnippets: Got ${snippets.length} snippets for parent ID ${parentId}:`, JSON.stringify(snippets.map(x => x.id)));
  return snippets;
};

const getSnippetGroups = async () => {
  console.log('storage.js -> getSnippetGroups: Getting snippet groups');
  const allKeys = await AsyncStorage.getAllKeys();
  const snippetKeys = allKeys.filter(key => key.startsWith(storageKeys.SNIPPET));
  const snippets = [];
  for (const snippetKey of snippetKeys) {
    const item = await AsyncStorage.getItem(snippetKey);
    const snippet = JSON.parse(item);
    snippets.push(snippet);
  }
  let snippetGroups = [{ id: storageKeys.SNIPPET + 0, type: snippetTypes.MULTIPLE, title: 'Snippets', content: 'Snippets', color_id: colorIds.COLOR_100, order_index: 0 }]; // root snippet group
  snippetGroups = snippetGroups.concat(snippets.filter(x => x.type === snippetTypes.MULTIPLE));
  for (let i = 0; i < snippetGroups.length; i++) {
    snippetGroups[i].snippets = snippetGroups[i].id === storageKeys.SNIPPET + 0 ?
      snippets.filter(x => !x.parent_id) :
      snippets.filter(x => x.parent_id === snippetGroups[i].id)
  }
  console.log(`storage.js -> getSnippetGroups: Got ${snippetGroups.length} snippet groups:`, JSON.stringify(snippetGroups.map(x => x.id)));
  return snippetGroups;
};

const searchSnippets = async (query) => {
  console.log('storage.js -> searchSnippets: Searching snippets for query', query);
  query = query && query.toLowerCase ? query.toLowerCase() : '';
  const allKeys = await AsyncStorage.getAllKeys();
  //console.log('storage.js -> getSnippets: All storage keys:', JSON.stringify(allKeys));
  const snippetKeys = allKeys.filter(key => key.startsWith(storageKeys.SNIPPET));
  console.log(`storage.js -> searchSnippets: Storage keys for query ${query}:`);
  const snippets = [];
  for (const snippetKey of snippetKeys) {
    const item = await AsyncStorage.getItem(snippetKey);
    const snippet = JSON.parse(item);
    if (snippet && (snippet.title?.toLowerCase().includes(query) || snippet.content?.toLowerCase().includes(query))) {
      snippets.push(snippet);
    }
  }
  console.log(`storage.js -> searchSnippets: Got ${snippets.length} snippets for query ${query}:`, JSON.stringify(snippets.map(x => x.id)));
  return snippets;
};

const getSnippet = async (id) => {
  const item = await AsyncStorage.getItem(id);
  return JSON.parse(item);
};

const saveSnippet = async (snippet) => {
  console.log('storage.js -> saveSnippet: Saving snippet with ID', snippet?.id);
  if (validator.isValidSnippet(snippet)) {
    const item = JSON.stringify(snippet);
    await AsyncStorage.setItem(snippet.id, item);
    console.log('storage.js -> saveSnippet: Saved snippet with ID', snippet.id);
  }
};

const deleteSnippet = async (id) => {
  console.log('storage.js -> deleteSnippet: Deleting snippet with ID', id);
  await AsyncStorage.removeItem(id);
  const childSnippets = await getSnippets(id);
  for (const childSnippet of childSnippets) {
    await deleteSnippet(childSnippet.id);
  }
};

const moveSnippet = async (snippet) => {
  console.log('storage.js -> moveSnippet: Moving snippet with ID', snippet?.id);
  if (validator.isValidSnippet(snippet)) {
    let orderIndex = 0;
    snippet.order_index = orderIndex++;
    await saveSnippet(snippet);
    const siblingSnippets = (await getSnippets(snippet?.parent_id)).filter(x => x.id != snippet.id);
    siblingSnippets.sort((a, b) => a.order_index - b.order_index);
    for (const siblingSnippet of siblingSnippets) {
      siblingSnippet.order_index = orderIndex++;
      await saveSnippet(siblingSnippet);
    }
  }
};

const getThemeId = async () => {
  return await AsyncStorage.getItem(storageKeys.THEME_ID);
};

const saveThemeId = async (themeId) => {
  console.log('storage.js -> saveTheme: Saving theme with ID', themeId);
  await AsyncStorage.setItem(storageKeys.THEME_ID, themeId);
  console.log('storage.js -> saveTheme: Saved theme with ID', themeId);
};

export default {
  getCredentials,
  saveCredentials,
  deleteCredentials,
  getAuthorizationToken,
  getSnippets,
  getSnippetGroups,
  searchSnippets,
  getSnippet,
  saveSnippet,
  deleteSnippet,
  moveSnippet,
  getThemeId,
  saveThemeId,
};