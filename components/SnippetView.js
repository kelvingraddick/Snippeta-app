import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { snippetTypes } from '../constants/snippetTypes';

const SnippetView = (props) => {
  const { snippet, onSnippetTapped, onSnippetMenuTapped, isHidden, isTop, isBottom, themer } = props;
  const ContainerComponent = Array.isArray(themer.getColor(snippet.color_id)) ? LinearGradient : View;
  const containerProps = Array.isArray(themer.getColor(snippet.color_id)) ?
    { style: [styles.container, (isTop ? styles.topContainer : null), (isBottom ? styles.bottomContainer : null)], colors: themer.getColor(snippet.color_id), start: {x: 0, y: 0}, end: {x: 1, y: 0}, } :
    { style: [styles.container, (isTop ? styles.topContainer : null), (isBottom ? styles.bottomContainer : null), { backgroundColor: themer.getColor(snippet.color_id) }], };
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    !isHidden &&
    <TouchableOpacity onPress={() => onSnippetTapped(snippet)}>
      <ContainerComponent {...containerProps}>
        <Image
          source={snippet.type == snippetTypes.SINGLE ? require('../assets/images/copy-white.png') : require('../assets/images/list-icon.png')}
          style={[styles.titleIcon, snippet.type == snippetTypes.SINGLE ? styles.copyIcon : styles.listIcon, { opacity: themer.getOpacity('content1.icon1') }]}
          tintColor={themer.getColor('content1.foreground')}
          resizeMode='stretch'
        />
        <View style={styles.contentView}>
          <Text style={[styles.titleText, { color: themer.getColor('content1.foreground') }]} numberOfLines={1}>&nbsp;&nbsp;{snippet.title}</Text>
          { !isCollapsed && <Text style={[styles.contentText, { color: themer.getColor('content1.foreground'), opacity: themer.getOpacity('content1.text2') }]} numberOfLines={1}>&nbsp;&nbsp;{snippet.content}</Text> }
        </View>
        <TouchableOpacity onPress={() => onSnippetMenuTapped(snippet)} hitSlop={40}>
          <Text style={[styles.menuIcon, { color: themer.getColor('content1.foreground'), opacity: themer.getOpacity('content1.icon2') }]}>&middot;&middot;&middot;</Text>
        </TouchableOpacity>
      </ContainerComponent>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 5,
    borderRadius: 3,
    paddingLeft: 15,
    paddingRight: 15,
    paddingVertical: 15,
    marginBottom: 3,
  },
  topContainer: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  bottomContainer: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  contentView: {
    flex: 1,
    flexDirection: 'column',
    gap: 2,
    top: -1,
  },
  titleIcon: {
    width: 17,
    top: -1
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
  },
  contentText: {
    flex: 1,
    fontSize: 15,
  },
  menuIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    top: -2
  }
});

export default SnippetView;