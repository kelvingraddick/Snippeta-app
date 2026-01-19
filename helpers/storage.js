import AsyncStorage from '@react-native-async-storage/async-storage';
import validator from './validator';
import { colorIds } from '../constants/colorIds';
import { storageKeys } from '../constants/storageKeys';
import { featureAlertTypes } from '../constants/featureAlertTypes';
import { snippetTypes } from '../constants/snippetTypes';
import { moveSnippetOptions } from '../constants/moveSnippetOptions';
import { snippetSources } from '../constants/snippetSources';

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

const getSnippets = async (parentId, includeNestedChildren) => {
  console.log(`storage.js -> getSnippets: Getting snippets for parent ID ${parentId} and include nested children ${includeNestedChildren}`);
  let snippets = [];
  if (includeNestedChildren) {
    const allKeys = await AsyncStorage.getAllKeys();
    //console.log('storage.js -> getSnippets: All storage keys:', JSON.stringify(allKeys));
    const snippetKeys = allKeys.filter(key => key.startsWith(storageKeys.SNIPPET));
    //console.log(`storage.js -> getSnippets: Storage keys with parent ID ${parentId}:`);
    const snippetKeyValues = await AsyncStorage.multiGet(snippetKeys);
    snippets = getChildSnippets(parentId, snippetKeyValues);
    function getChildSnippets(parentId, snippetKeyValues) {
      const childSnippets = [];
      for (const snippetKeyValue of snippetKeyValues) {
        const value = snippetKeyValue[1]; // value
        const childSnippet = JSON.parse(value);
        if (childSnippet?.parent_id === parentId) {
          childSnippet.child_snippets = getChildSnippets(childSnippet.id, snippetKeyValues);
          childSnippets.push(childSnippet);
        }
      }
      return childSnippets;
    }
  } else {
    const allKeys = await AsyncStorage.getAllKeys();
    //console.log('storage.js -> getSnippets: All storage keys:', JSON.stringify(allKeys));
    const snippetKeys = allKeys.filter(key => key.startsWith(storageKeys.SNIPPET));
    //console.log(`storage.js -> getSnippets: Storage keys with parent ID ${parentId}:`);
    for (const snippetKey of snippetKeys) {
      const item = await AsyncStorage.getItem(snippetKey);
      const snippet = JSON.parse(item);
      if (snippet?.parent_id === parentId) {
        snippets.push(snippet);
      }
    }
  }
  console.log(`storage.js -> getSnippets: Got ${snippets.length} snippets for parent ID ${parentId} and include nested children ${includeNestedChildren}:`, JSON.stringify(snippets.map(x => x.id)));
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
  _enrichSnippet(snippet);
  if (validator.isValidSnippet(snippet)) {
    const item = JSON.stringify(snippet);
    await AsyncStorage.setItem(snippet.id, item);
    console.log('storage.js -> saveSnippet: Saved snippet with ID', snippet.id);
  }
};

const _enrichSnippet = async (snippet) => {
  if (typeof snippet === 'object' && snippet !== null) {
    if (!snippet.source) { snippet.source = snippetSources.STORAGE; }
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

const moveSnippet = async (snippet, option) => {
  console.log(`storage.js -> moveSnippet: request to move snippet with option ${option} and ID ${snippet?.id}`);
  switch (option) {
    case moveSnippetOptions.TO_TOP: await _moveSnippetToTop(snippet); break;
    case moveSnippetOptions.UP: await _moveSnippetUp(snippet); break;
    case moveSnippetOptions.DOWN: await _moveSnippetDown(snippet); break;
    case moveSnippetOptions.TO_BOTTOM: default: await _moveSnippetToBottom(snippet); break;
  };
};

const moveSnippetToGroup = async (snippet, parentId) => {
  console.log(`storage.js -> moveSnippetToGroup: Moving snippet with ID ${snippet?.id} to parent ${parentId}`);
  if (!validator.isValidSnippet(snippet)) return;

  const currentParentId = snippet.parent_id ?? undefined;
  const targetParentId = parentId ?? undefined;
  if (currentParentId === targetParentId) return;

  // Re-index old siblings after removing the snippet
  const oldSiblings = (await getSnippets(currentParentId)).filter(x => x.id !== snippet.id);
  oldSiblings.sort((a, b) => a.order_index - b.order_index);
  let orderIndex = 0;
  for (const oldSibling of oldSiblings) {
    oldSibling.order_index = orderIndex++;
    await saveSnippet(oldSibling);
  }

  // Move snippet to new parent and place at bottom
  const newSiblings = await getSnippets(targetParentId);
  newSiblings.sort((a, b) => a.order_index - b.order_index);
  if (targetParentId === undefined) {
    delete snippet.parent_id;
  } else {
    snippet.parent_id = targetParentId;
  }
  snippet.order_index = newSiblings.length;
  await saveSnippet(snippet);
};

const _moveSnippetToTop = async (snippet) => {
  console.log('storage.js -> _moveSnippetToTop: Moving snippet to top with ID', snippet?.id);
  if (validator.isValidSnippet(snippet)) {
    let orderIndex = 0;
    snippet.order_index = orderIndex++;
    await saveSnippet(snippet);
    const siblingSnippets = (await getSnippets(snippet.parent_id)).filter(x => x.id != snippet.id);
    siblingSnippets.sort((a, b) => a.order_index - b.order_index);
    for (const siblingSnippet of siblingSnippets) {
      siblingSnippet.order_index = orderIndex++;
      await saveSnippet(siblingSnippet);
    }
  }
};

const _moveSnippetUp = async (snippet) => {
  console.log('storage.js -> _moveSnippetUp: Moving snippet up with ID', snippet?.id);
  if (validator.isValidSnippet(snippet)) {
    const snippetAndSiblingSnippets = await getSnippets(snippet.parent_id);
    snippetAndSiblingSnippets.sort((a, b) => a.order_index - b.order_index);
    const snippetIndex = snippetAndSiblingSnippets.findIndex(x => x.id === snippet.id);
    if (snippetIndex <= 0) return;
    const snippetAbove = snippetAndSiblingSnippets[snippetIndex - 1];
    const snippetAboveOrderIndex = snippetAbove.order_index;
    snippetAbove.order_index = snippet.order_index;
    snippet.order_index = snippetAboveOrderIndex;
    await saveSnippet(snippetAbove);
    await saveSnippet(snippet);
  }
};

const _moveSnippetDown = async (snippet) => {
  console.log('storage.js -> _moveSnippetDown: Moving snippet down with ID', snippet?.id);
  if (validator.isValidSnippet(snippet)) {
    const snippetAndSiblingSnippets = await getSnippets(snippet.parent_id);
    snippetAndSiblingSnippets.sort((a, b) => a.order_index - b.order_index);
    const snippetIndex = snippetAndSiblingSnippets.findIndex(x => x.id === snippet.id);
    if (snippetIndex === -1 || snippetIndex === snippetAndSiblingSnippets.length - 1) return;
    const snippetBelow = snippetAndSiblingSnippets[snippetIndex + 1];
    const snippetBelowOrderIndex = snippetBelow.order_index;
    snippetBelow.order_index = snippet.order_index;
    snippet.order_index = snippetBelowOrderIndex;
    await saveSnippet(snippetBelow);
    await saveSnippet(snippet);
  }
};

const _moveSnippetToBottom = async (snippet) => {
  console.log('storage.js -> _moveSnippetToBottom: Moving snippet to bottom with ID', snippet?.id);
  if (validator.isValidSnippet(snippet)) {
    const siblingSnippets = (await getSnippets(snippet.parent_id)).filter(x => x.id != snippet.id);
    siblingSnippets.sort((a, b) => a.order_index - b.order_index);
    let orderIndex = 0;
    for (const siblingSnippet of siblingSnippets) {
      siblingSnippet.order_index = orderIndex++;
      await saveSnippet(siblingSnippet);
    }
    snippet.order_index = orderIndex;
    await saveSnippet(snippet);
  }
}

const getAppearanceMode = async () => {
  return await AsyncStorage.getItem(storageKeys.APPEARANCE_MODE);
};

const saveAppearanceMode = async (appearanceMode) => {
  console.log('storage.js -> saveAppearanceMode: Saving appearance with mode', appearanceMode);
  await AsyncStorage.setItem(storageKeys.APPEARANCE_MODE, appearanceMode);
  console.log('storage.js -> saveAppearanceMode: Saved appearance with mode', appearanceMode);
};

const getThemeId = async () => {
  return await AsyncStorage.getItem(storageKeys.THEME_ID);
};

const saveThemeId = async (themeId) => {
  console.log('storage.js -> saveTheme: Saving theme with ID', themeId);
  await AsyncStorage.setItem(storageKeys.THEME_ID, themeId);
  console.log('storage.js -> saveTheme: Saved theme with ID', themeId);
};

const getLanguage = async () => {
  const language = await AsyncStorage.getItem(storageKeys.LANGUAGE);
  console.log(`storage.js -> getLanguage: ${language ? `Got language '${language}'` : 'No language in storage, using device default'}`);
  return language;
};

const saveLanguage = async (language) => {
  console.log(`storage.js -> saveLanguage: Saving language '${language}'`);
  await AsyncStorage.setItem(storageKeys.LANGUAGE, language);
  console.log(`storage.js -> saveLanguage: Saved language '${language}'`);
};

const getMilestoneNumber = async () => {
  const item = await AsyncStorage.getItem(storageKeys.MILESTONE_NUMBER);
  const milestoneNumber  = JSON.parse(item);
  console.log(`storage.js -> getMilestoneNumber: Got milestone number ${milestoneNumber}`);
  return milestoneNumber;
};

const saveMilestoneNumber = async (milestoneNumber) => {
  const item = JSON.stringify(milestoneNumber);
  await AsyncStorage.setItem(storageKeys.MILESTONE_NUMBER, item);
  console.log('storage.js -> saveMilestoneNumber: Saved milestone number', milestoneNumber);
};

const getLastReviewPromptDate = async () => {
  const item = await AsyncStorage.getItem(storageKeys.LAST_REVIEW_PROMPT_DATE);
  const lastReviewPromptDate = new Date(item);
  console.log(`storage.js -> getLastReviewPromptDate: Got last review prompt date ${lastReviewPromptDate?.toJSON()}`);
  return lastReviewPromptDate;
};

const saveLastReviewPromptDate = async (lastReviewPromptDate) => {
  const item = lastReviewPromptDate?.toJSON();
  await AsyncStorage.setItem(storageKeys.LAST_REVIEW_PROMPT_DATE, item);
  console.log('storage.js -> saveLastReviewPromptDate: Saved last review prompt date', lastReviewPromptDate);
};

const getIsFeatureAlertDismissed = async (alertType) => {
  const storageKey = storageKeys.IS_FEATURE_ALERT_DISMISSED + alertType.toUpperCase();
  
  const item = await AsyncStorage.getItem(storageKey);
  const isDismissed = item === 'true';
  console.log(`storage.js -> getIsFeatureAlertDismissed: Got ${alertType} alert dismissed status: ${isDismissed}`);
  return isDismissed;
};

const saveIsFeatureAlertDismissed = async (alertType, isDismissed) => {
  const storageKey = storageKeys.IS_FEATURE_ALERT_DISMISSED + alertType.toUpperCase();
  
  const item = isDismissed ? 'true' : null;
  if (item === null) {
    await AsyncStorage.removeItem(storageKey);
    console.log(`storage.js -> saveIsFeatureAlertDismissed: Removed ${alertType} alert dismissed flag`);
  } else {
    await AsyncStorage.setItem(storageKey, item);
    console.log(`storage.js -> saveIsFeatureAlertDismissed: Saved ${alertType} alert dismissed status: ${isDismissed}`);
  }
};

const resetAllFeatureAlerts = async () => {
  console.log('storage.js -> resetAllFeatureAlerts: Resetting all feature alerts');
  await Promise.all([
    saveIsFeatureAlertDismissed(featureAlertTypes.KEYBOARD, false),
    saveIsFeatureAlertDismissed(featureAlertTypes.WIDGET, false)
  ]);
  console.log('storage.js -> resetAllFeatureAlerts: Successfully reset all feature alerts');
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
  moveSnippetToGroup,
  getAppearanceMode,
  saveAppearanceMode,
  getThemeId,
  saveThemeId,
  getMilestoneNumber,
  saveMilestoneNumber,
  getLastReviewPromptDate,
  saveLastReviewPromptDate,
  getIsFeatureAlertDismissed,
  saveIsFeatureAlertDismissed,
  resetAllFeatureAlerts,
  getLanguage,
  saveLanguage,
};