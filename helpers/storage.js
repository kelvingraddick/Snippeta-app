import AsyncStorage from '@react-native-async-storage/async-storage';
import Prefixes from '../constants/prefixes';

const getSnippets = async (parentId) => {
  const allKeys = await AsyncStorage.getAllKeys();
  const snippetKeys = allKeys.filter(key => key.startsWith(Prefixes.SNIPPET));
  const snippets = [];
  for (const snippetKey of snippetKeys) {
    const value = await AsyncStorage.getItem(snippetKey);
    const snippet = JSON.parse(value);
    if (snippet?.parent_id === parentId) {
      snippets.push(snippet);
    }
  }
  return snippets;
};

const getSnippet = async (id) => {
  const value = await AsyncStorage.getItem(id);
  return JSON.parse(value);
};

const saveSnippet = async (snippet) => {
  if (isValidSnippet(snippet)) {
    const value = JSON.stringify(snippet);
    await AsyncStorage.setItem(snippet.id, value);
  } else {
    throw new Error('The snippet data is not valid.')
  }
  return snippet;
};

const deleteSnippet = async (id) => {
  await AsyncStorage.removeItem(id);
};

const isValidSnippet = (snippet) => {
  return snippet &&
    snippet.id &&
    snippet.id.startsWith(Prefixes.SNIPPET) &&
    snippet.parent_id &&
    snippet.type &&
    snippet.title &&
    snippet.content &&
    snippet.color_id &&
    snippet.time &&
    snippet.order_index;
}

module.exports = {
  getSnippets: getSnippets,
  getSnippet: getSnippet,
  saveSnippet: saveSnippet,
  deleteSnippet: deleteSnippet,
};