import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const configure = async function () {
  try {
    await Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    Purchases.configure({ apiKey: (Platform.OS === 'ios' ? 'appl_DPAuKeaWaZokumYNodUGFJebqdQ' : '<revenuecat_project_google_api_key>') });
    console.log('RevenueCat -> configure: in-app purchase library (RevenueCat) configued with app user Id ', await Purchases.getAppUserID());
  } catch (error) {
    console.error('RevenueCat -> configure: in-app purchase library (RevenueCat) configuration failed with error:', error.message);
  }
};

const login = async function (appUserId) {
  try {
    const { customerInfo } = await Purchases.logIn(appUserId);
    console.log(`RevenueCat -> login: logged in RevenueCat with app user ID ${appUserId} / stored: ${await Purchases.getAppUserID()} / original: ${customerInfo?.originalAppUserId} `);
  } catch (error) {
    console.error('RevenueCat -> login: failed with error:', error.message);
  }
};

const getSubscription = async () => {
  let subscription;
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    //console.log('RevenueCat -> getSubscription: customer info:', customerInfo);
    if (typeof customerInfo.entitlements.active['Snippeta Pro'] !== "undefined") {
      console.log('RevenueCat -> getSubscription: Found active in-app subscription:', customerInfo.entitlements.active['Snippeta Pro']);
      subscription = customerInfo.entitlements.active['Snippeta Pro'];
    } else {
      console.log('RevenueCat -> getSubscription: Did not find active in-app subscription:');
    }
  } catch (error) {
    console.error('RevenueCat -> getSubscription: loading subscription failed with error: ' + error.message);
  }
  return subscription;
};

export default {
  configure,
  login,
  getSubscription,
};