import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../helpers/colors';
import { snippetTypes } from '../constants/snippetTypes';

const SnippetView = (props) => {
  const { snippet, onSnippetTapped, onSnippetMenuTapped, isHidden } = props;
  return (
    !isHidden &&
    <TouchableOpacity style={[styles.container, { backgroundColor: colors.white.hexCode }]} onPress={() => onSnippetTapped(snippet)}>
      <View style={[styles.barView, { backgroundColor: colors.getById(snippet.color_id)?.hexCode }]}></View>
      <View style={styles.contentView}>
        <View style={styles.titleView}>
          <Image
            source={snippet.type == snippetTypes.SINGLE ? require('../assets/images/copy-white.png') : require('../assets/images/list-icon.png')}
            style={[styles.titleIcon, snippet.type == snippetTypes.SINGLE ? styles.copyIcon : styles.listIcon]}
            tintColor={colors.darkGray.hexCode}
            resizeMode='stretch'
          />
          <Text style={styles.titleText} numberOfLines={1}>&nbsp;{snippet.title}</Text>
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
    gap: 5,
    borderRadius: 5,
    paddingRight: 20,
    marginBottom: 10,
  },
  barView: {
    width: 20,
    alignSelf: 'stretch',
    borderStartStartRadius: 5,
    borderEndStartRadius: 5,
  },
  contentView: {
    flex: 1,
    flexDirection: 'column',
    gap: 5,
    paddingVertical: 20,
    paddingLeft: 10, 
  },
  titleView: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  titleIcon: {
    width: 17,
    opacity: 0.25,
  },
  copyIcon: {
    height: 17,
  },
  listIcon: {
    height: 16,
  },
  titleText: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.darkGray.hexCode
  },
  contentText: {
    flex: 1,
    fontSize: 15,
    color: colors.darkGray.hexCode
  },
  menuIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.darkGray.hexCode,
    opacity: 0.50,
  }
});

export default SnippetView;