import React, { useContext, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ApplicationContext } from '../ApplicationContext';
import colors from '../helpers/colors';
import banner from '../helpers/banner';
import ActionButton from '../components/ActionButton';

const SettingsScreen = ({ navigation }) => {
  
  const { user, isUserLoading, logout } = useContext(ApplicationContext);

  const [isLoading, setIsLoading] = useState(true);

  const onBackTapped = async () => {
    navigation.goBack();
  };

  const onLoginTapped = async () => {
    navigation.navigate('Login');
  };

  const onRegisterTapped = async () => {
    navigation.navigate('Register');
  };

  const onAccountTapped = async () => {
    navigation.navigate('User');
  };

  const onLogoutTapped = async () => {
    navigation.popToTop();
    await logout();

    banner.showSuccessMessage('Logged out!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerView}>
        <View style={styles.titleView}>
          <Pressable onPress={onBackTapped} hitSlop={20}>
            <Image source={require('../assets/images/back-arrow.png')} style={styles.backIcon} tintColor={colors.white.hexCode} />
          </Pressable>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.placeholderIcon} />
        </View>
        <View style={styles.infoView}>
          { user && user.email_address && 
            <Text style={styles.title}>{user.email_address}</Text>
          }
          { user && user.phone_number && 
            <Text style={styles.title}>{user.phone_number}</Text>
          }
        </View>
        { user && 
          <ActionButton iconImageSource={require('../assets/images/user.png')} text={'Account'} color={colors.lightGreen} onTapped={() => onAccountTapped()} />
        }
        { !user && 
          <>
            <ActionButton iconImageSource={require('../assets/images/user.png')} text={'Login'} color={colors.lightGreen} onTapped={() => onLoginTapped()} />
            <ActionButton iconImageSource={require('../assets/images/list-icon.png')} text={'Register'} color={colors.lightBlue} onTapped={() => onRegisterTapped()} />
          </>
        }
      </View>
      <ScrollView style={styles.scrollView}>
        { user && 
          <ActionButton iconImageSource={require('../assets/images/back-arrow.png')} text={'Logout'} color={colors.gray} onTapped={() => onLogoutTapped()} />
        }
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray.hexCode,
  },
  headerView: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.darkGray.hexCode,
  },
  titleView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  infoView: {
    marginBottom: 20
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white.hexCode
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
  scrollView: {
    flex: 1,
    padding: 20,
  },
});

export default SettingsScreen;