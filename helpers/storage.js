import AsyncStorage from '@react-native-async-storage/async-storage';
import { snippetTypes } from '../constants/snippetTypes';
import colors from './colors';

const keys = {
  SNIPPET: 'SNIPPET_',
};

const getSnippets = async (parentId) => {
  console.log('storage.js -> getSnippets: Getting snippets for parent ID', parentId);
  const allKeys = await AsyncStorage.getAllKeys();
  console.log('storage.js -> getSnippets: All storage keys:', JSON.stringify(allKeys));
  const snippetKeys = allKeys.filter(key => key.startsWith(keys.SNIPPET));
  console.log(`storage.js -> getSnippets: Storage keys with parent Id ${parentId}:`, JSON.stringify(allKeys));
  const snippets = [];
  for (const snippetKey of snippetKeys) {
    const value = await AsyncStorage.getItem(snippetKey);
    const snippet = JSON.parse(value);
    if (snippet?.parent_id === parentId) {
      snippets.push(snippet);
    }
  }
  console.log(`storage.js -> getSnippets: Got ${snippets.length} snippets for parent ID ${parentId}`);
  return snippets;
};

const getSnippet = async (id) => {
  const value = await AsyncStorage.getItem(id);
  return JSON.parse(value);
};

const saveSnippet = async (snippet) => {
  console.log('storage.js -> saveSnippet: Saving snippet with ID', snippet?.id);
  if (isValidSnippet(snippet)) {
    const value = JSON.stringify(snippet);
    await AsyncStorage.setItem(snippet.id, value);
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

const isValidSnippet = (snippet) => {
  let errorMessages = [];
  if (!snippet) {
    errorMessages.push('snippet object cannot be null.');
  }
  if (!snippet.id || !snippet.id.startsWith(keys.SNIPPET)) {
    errorMessages.push(`snippet.id must start with '${keys.SNIPPET}.'`);
  }
  if (snippet.parent_id && !snippet.parent_id.startsWith(keys.SNIPPET)) {
    errorMessages.push(`snippet.parent_id must start with '${keys.SNIPPET}.'`);
  }
  if (!Object.values(snippetTypes).includes(snippet.type)) {
    errorMessages.push(`snippet.type must be one of: ${Object.values(snippetTypes).join(', ')}.'`);
  }
  if (!snippet.title ) {
    errorMessages.push('snippet.title must not be empty.');
  }
  if (!snippet.content) {
    errorMessages.push('snippet.content must not be empty.');
  }
  if (!colors.getById(snippet.color_id)) {
    errorMessages.push(`snippet.color_id must be a valid one of the valid color IDs (0-4).'`);
  }
  if (Object.prototype.toString.call(snippet.time) !== '[object Date]') {
    errorMessages.push('snippet.time must be a valid datetime.');
  }
  if (typeof(snippet.order_index) !== 'number') {
    errorMessages.push('snippet.order_index must be a valid number.');
  }
  if (errorMessages.length > 0) {
    throw new Error(`The snippet data for ID ${snippet?.id} is not valid: ${errorMessages.join(' ')}`);
  }
  return true;
}

export default {
  getSnippets,
  getSnippet,
  saveSnippet,
  deleteSnippet,
  keys
};