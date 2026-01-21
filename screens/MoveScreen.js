import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ApplicationContext } from '../ApplicationContext';
import { moveSnippetOptions } from '../constants/moveSnippetOptions';
import { readableErrorMessages } from '../constants/readableErrorMessages';
import { snippetSources } from '../constants/snippetSources';
import { snippetTypes } from '../constants/snippetTypes';
import { storageKeys } from '../constants/storageKeys';
import api from '../helpers/api';
import analytics from '../helpers/analytics';
import banner from '../helpers/banner';
import storage from '../helpers/storage';

const MoveScreen = ({ route, navigation }) => {
  const { t } = useTranslation(['common', 'snippets', 'errors']);
  const { themer, user, isUserLoading, onSnippetChanged } = useContext(ApplicationContext);
  const safeAreaInsets = useSafeAreaInsets();

  const snippet = route.params?.snippet;
  const callbacks = route.params?.callbacks || [];

  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadGroups();
  }, [user]);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      let result = [];
      if (snippet?.source == snippetSources.STORAGE) {
        result = await storage.getSnippetGroups();
        result.forEach(group => {
          group.source = snippetSources.STORAGE;
          group.isRoot = group.id === (storageKeys.SNIPPET + 0);
        });
      } else if (snippet?.source == snippetSources.API && user) {
        const response = await api.getSnippetGroups(await storage.getAuthorizationToken());
        if (!response?.ok) { throw new Error(`HTTP error with status ${response?.status}`); }
        const responseJson = await response.json();
        result = responseJson.groups ?? [];
        result.forEach(group => {
          group.source = snippetSources.API;
          group.isRoot = group.id === 0;
        });
        if (!result.find(group => group.id === 0)) {
          result.unshift({
            id: 0,
            type: snippetTypes.MULTIPLE,
            title: t('snippets:moveToGroup.rootGroup'),
            content: '',
            order_index: 0,
            snippets: [],
            source: snippetSources.API,
            isRoot: true,
          });
        }
      }

      result = filterInvalidGroups(result, snippet);

      setGroups(result);
      setIsLoading(false);
    } catch (error) {
      console.error('MoveScreen.js -> loadGroups: Loading groups failed with error: ' + error.message);
      banner.showErrorMessage(t(`errors:${readableErrorMessages.GET_SNIPPET_DATA_ERROR}`));
      setIsLoading(false);
    }
  };

  const filterInvalidGroups = (groups, snippetToMove) => {
    const rootGroupId = snippetToMove?.source == snippetSources.STORAGE
      ? (storageKeys.SNIPPET + 0)
      : 0;
    const currentGroupId = snippetToMove?.parent_id ?? rootGroupId;

    const groupsById = groups.reduce((map, group) => {
      map[group.id] = group;
      return map;
    }, {});

    const isDescendantOfSnippet = (targetGroupId) => {
      if (snippetToMove?.type !== snippetTypes.MULTIPLE) return false;
      let currentId = targetGroupId;
      const visited = new Set();
      while (currentId !== undefined && currentId !== null && !visited.has(currentId)) {
        visited.add(currentId);
        const currentGroup = groupsById[currentId];
        const parentId = currentGroup?.parent_id;
        if (parentId === snippetToMove?.id) return true;
        if (parentId === undefined || parentId === null) return false;
        if (parentId === 0 || parentId === (storageKeys.SNIPPET + 0)) return false;
        currentId = parentId;
      }
      return false;
    };

    const filteredGroups = groups
      .filter(group => group.type === snippetTypes.MULTIPLE)
      .filter(group => group.id !== snippetToMove?.id && group.id !== currentGroupId)
      .filter(group => !isDescendantOfSnippet(group.id))
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

    return orderGroupsWithDepth(filteredGroups, rootGroupId);
  };

  const orderGroupsWithDepth = (groups, rootGroupId) => {
    const rootGroup = groups.find(group => group.id === rootGroupId);
    const groupsWithoutRoot = rootGroup ? groups.filter(group => group.id !== rootGroupId) : groups;
    const childrenByParent = new Map();

    groupsWithoutRoot.forEach(group => {
      const parentId = group.parent_id ?? rootGroupId;
      if (!childrenByParent.has(parentId)) {
        childrenByParent.set(parentId, []);
      }
      childrenByParent.get(parentId).push(group);
    });

    for (const [, children] of childrenByParent) {
      children.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    }

    const ordered = [];
    const addChildren = (parentId, depth) => {
      const children = childrenByParent.get(parentId) || [];
      children.forEach(child => {
        ordered.push({ ...child, listDepth: depth });
        addChildren(child.id, depth + 1);
      });
    };

    if (rootGroup) {
      ordered.push({ ...rootGroup, listDepth: 0 });
    }
    addChildren(rootGroupId, 0);

    return ordered;
  };

  const onBackTapped = () => {
    navigation.goBack();
  };

  const onGroupTapped = async (group) => {
    try {
      setIsLoading(true);
      if (snippet?.source == snippetSources.STORAGE) {
        const parentId = group.isRoot ? undefined : group.id;
        await storage.moveSnippetToGroup(snippet, parentId);
      } else if (snippet?.source == snippetSources.API && user) {
        const groupId = group.isRoot ? 0 : group.id;
        const response = await api.moveSnippet(snippet, moveSnippetOptions.TO_GROUP, groupId, await storage.getAuthorizationToken());
        if (!response?.ok) { throw new Error(`HTTP error with status ${response?.status}`); }
        const responseJson = await response.json();
        if (!responseJson?.success) {
          console.log('MoveScreen.js -> onGroupTapped: Failed to move snippet via API with unknown error');
          banner.showErrorMessage(t('snippets:movingFailedUnknown'));
          setIsLoading(false);
          return;
        }
      }

      await analytics.logEvent('snippet_moved', { type: snippet?.type, source: snippet?.source, option: moveSnippetOptions.TO_GROUP });
      callbacks.forEach(async callback => { await callback(); });
      navigation.goBack();
      onSnippetChanged();
    } catch (error) {
      console.error('MoveScreen.js -> onGroupTapped: Moving snippet failed with error: ' + error.message);
      banner.showErrorMessage(t('snippets:movingFailed', { error: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const getGroupTitle = (group) => {
    return group?.isRoot ? t('snippets:moveToGroup.rootGroup') : group?.title;
  };

  return (
    <View style={[styles.container, { backgroundColor: themer.getColor('background1') }]}>
      <View style={[styles.headerView, { backgroundColor: themer.getColor('screenHeader1.background'), paddingTop: Platform.OS === 'ios' ? 60 : (safeAreaInsets.top + 17.5) } ]}>
        <View style={styles.titleView}>
          <Pressable onPress={onBackTapped} hitSlop={20} disabled={isLoading}>
            <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={themer.getColor('screenHeader1.foreground')} />
          </Pressable>
          <Text style={[styles.title, { color: themer.getColor('screenHeader1.foreground') }]} numberOfLines={2}>{t('snippets:moveToGroup.title')}</Text>
          <View style={styles.placeholderIcon} />
        </View>
        <Text style={[styles.subtitle, { color: themer.getColor('screenHeader1.foreground') }]}>{t('snippets:moveToGroup.message')}</Text>
      </View>
      {(isLoading || isUserLoading) &&
        <View style={styles.loadingView}>
          <ActivityIndicator size="small" color={themer.getColor('screenHeader1.foreground')} />
        </View>
      }
      {(!isLoading && !isUserLoading && groups.length === 0) &&
        <View style={styles.emptyView}>
          <Text style={[styles.emptyText, { color: themer.getColor('textInput3.foreground') }]}>{t('snippets:moveToGroup.empty')}</Text>
        </View>
      }
      {(!isLoading && !isUserLoading && groups.length > 0) &&
        <ScrollView style={styles.groupList} contentContainerStyle={styles.groupListContent} keyboardShouldPersistTaps={'handled'}>
          {groups.map(group => {
            const rowMarginLeft = (group.listDepth ?? 0) * 12;
            return (
            <Pressable key={group.id} onPress={() => onGroupTapped(group)} disabled={isLoading}>
              <View style={[styles.groupRow, { backgroundColor: themer.getColor('textInput3.background'), marginLeft: rowMarginLeft }]}>
                <Text style={[styles.groupTitle, { color: themer.getColor('textInput3.foreground') }]} numberOfLines={1}>{getGroupTitle(group)}</Text>
                {!!group?.content &&
                  <Text style={[styles.groupSubtitle, { color: themer.getColor('textInput3.foreground'), opacity: themer.getOpacity('content1.text2') }]} numberOfLines={1}>{group.content}</Text>
                }
              </View>
            </Pressable>
          )})}
        </ScrollView>
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
    marginBottom: 10,
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
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.9,
  },
  loadingView: {
    paddingTop: 30,
  },
  emptyView: {
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  groupList: {
    padding: 20,
  },
  groupListContent: {
    paddingBottom: 40,
  },
  groupRow: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
    marginBottom: 12,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  groupSubtitle: {
    marginTop: 3,
    fontSize: 14,
  },
});

export default MoveScreen;
