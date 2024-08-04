import AsyncStorage from '@react-native-async-storage/async-storage';
import validator from './validator';
import { storageKeys } from '../constants/storageKeys';

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

const getSnippets = async (parentId) => {
  console.log('storage.js -> getSnippets: Getting snippets for parent ID', parentId);
  const allKeys = await AsyncStorage.getAllKeys();
  //console.log('storage.js -> getSnippets: All storage keys:', JSON.stringify(allKeys));
  const snippetKeys = allKeys.filter(key => key.startsWith(storageKeys.SNIPPET));
  console.log(`storage.js -> getSnippets: Storage keys with parent ID ${parentId}:`);
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
  await AsyncStorage.removeItem(id);
  const childSnippets = await getSnippets(id);
  for (const childSnippet of childSnippets) {
    await deleteSnippet(childSnippet.id);
  }
};

export default {
  getCredentials,
  saveCredentials,
  deleteCredentials,
  getSnippets,
  getSnippet,
  saveSnippet,
  deleteSnippet,
};