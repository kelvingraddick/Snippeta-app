import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../helpers/colors';
import { snippetTypes } from '../constants/snippetTypes';

const SnippetView = (props) => {
  const { snippet, onSnippetTapped, onSnippetMenuTapped } = props;
  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: colors.getById(snippet.color_id).hexCode }]} onPress={() => onSnippetTapped(snippet)}>
      <View style={styles.contentView}>
        <View style={styles.titleView}>
          <Image
            source={snippet.type == snippetTypes.SINGLE ? require('../assets/images/copy-white.png') : require('../assets/images/list-white.png')}
            style={[styles.titleIcon, snippet.type == snippetTypes.SINGLE ? styles.copyIcon : styles.listIcon]}
            tintColor={'#1d2027'}
            resizeMode='stretch'
          />
          <Text style={styles.titleText}>&nbsp;{snippet.title}</Text>
        </View>
        <Text style={styles.contentText} numberOfLines={2}>{snippet.content}</Text>
      </View>
      <TouchableOpacity onPress={() => onSnippetMenuTapped(snippet)} hitSlop={40}>
        <Text style={styles.menuIcon}>&middot;&middot;&middot;</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
  },
  contentView: {
    flexDirection: 'column',
    gap: 5,
    marginRight: 20
  },
  titleView: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  titleIcon: {
    width: 20,
    height: 20,
    color: '#1d2027',
    opacity: 0.25,
  },
  copyIcon: {
    height: 20,
  },
  listIcon: {
    height: 17,
  },
  titleText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1d2027'
  },
  contentText: {
    fontSize: 15,
    color: '#1d2027'
  },
  menuIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1d2027'
  }
});

export default SnippetView;