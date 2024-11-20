import React, { useContext, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { ApplicationContext } from '../ApplicationContext';
import colors from '../helpers/colors';
import banner from '../helpers/banner';
import ActionButton from '../components/ActionButton';

const SettingsScreen = ({ navigation }) => {
  
  const { user, isUserLoading, logout } = useContext(ApplicationContext);

  const [isLoading, setIsLoading] = useState(true);

  const { showActionSheetWithOptions } = useActionSheet();

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
    const options = { 'Logout': 0, 'Cancel': 1 };
    showActionSheetWithOptions(
      {
        title: 'Are you sure you want to logout of your account?',
        options: Object.keys(options),
        destructiveButtonIndex: options.Logout,
        cancelButtonIndex: options.Cancel,
      },
      async (selectedIndex) => {
        switch (selectedIndex) {
          case options.Logout:
            navigation.popToTop();
            await logout();
            banner.showSuccessMessage('Logged out!');
            break;
        }
      }
    );
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
        <View style={styles.logoView}>
          <Image source={require('../assets/images/logo.png')} style={styles.logoIcon} tintColor={colors.white.hexCode} resizeMode='contain' />
          <Text style={styles.subTitle}>Cloud</Text>
        </View>
        { !user &&
          <View style={styles.infoView}>
            <Text style={styles.descriptionText}>Create an account for <Text style={{ fontWeight: 'bold' }}>more features</Text></Text>
            <View style={styles.infoView}>
              <Text style={styles.featureText}>☁️ Save snippets to the Cloud to never lose them</Text>
              <Text style={styles.featureText}>📱 Access your snippets on different devices</Text>
            </View>
          </View>
        }
        { user && user.first_name && user.last_name &&
          <View style={styles.infoView}>
            <Text style={styles.descriptionText}>You are logged in as <Text style={{ fontWeight: 'bold' }}>{user.first_name} {user.last_name}</Text></Text>
          </View>
        }
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
  logoView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  logoIcon: {
    height: 35,
    width: 150,
    marginTop: 6,
  },
  subTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.white.hexCode,
  },
  descriptionText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    color: colors.white.hexCode,
  },
  featureText: {
    fontSize: 15,
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