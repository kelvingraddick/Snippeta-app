import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const configure = async function () {
  try {
    await Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    Purchases.configure({ apiKey: (Platform.OS === 'ios' ? '<revenuecat_project_apple_api_key>' : '<revenuecat_project_google_api_key>') });
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

const getEntitlements = async () => {
  let entitlements;
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    //console.log('RevenueCat -> getEntitlements: customer info:', customerInfo);
    entitlements = customerInfo?.entitlements?.active;
    console.log('RevenueCat -> getEntitlements: ' + (entitlements && Object.keys(entitlements).length > 0) ? `Found active entitlements: ${JSON.stringify(Object.keys(entitlements))}` : 'Found no active entitlements');
  } catch (error) {
    console.error('RevenueCat -> getEntitlements: loading entitlements failed with error: ' + error.message);
    throw error;
  }
  return entitlements;
};

const purchasePackage = async (offeringId, packageId, entitlementId) => {
  let entitlement;
  try {
    const offerings = await Purchases.getOfferings();
    const packageToPurchase = offerings?.all?.[offeringId]?.availablePackages?.find(x => x.identifier == packageId);
    if (packageToPurchase) {
      console.log(`RevenueCat -> purchasePackage: Found package for offering ID ${offeringId} and package ID ${packageId}:`);
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      entitlement = customerInfo.entitlements.active[entitlementId];
      console.log(`RevenueCat -> purchasePackage: Purchase attempt returned entitlement for ID ${entitlementId} with value:`, JSON.stringify(entitlement));
    } else {
      console.log(`RevenueCat -> getPackage: Did not find package for offering ID ${offeringId} and package ID ${packageId}`);
    }
  } catch (error) {
    console.error(`RevenueCat -> purchasePackage: purchasing package failed with error: ` + error.message);
  }
  return entitlement;
};

const restorePurchases = async () => {
  let entitlements;
  const customerInfo = await Purchases.restorePurchases();
  if (customerInfo) {
    entitlements = customerInfo.entitlements?.active;
    console.log('RevenueCat -> restorePurchases: ' + (entitlements && Object.keys(entitlements).length > 0) ? `Restored active entitlements: ${JSON.stringify(Object.keys(entitlements))}` : 'No active entitlements restored');
  }
  return entitlements;
};

export default {
  configure,
  login,
  getEntitlements,
  purchasePackage,
  restorePurchases,
};