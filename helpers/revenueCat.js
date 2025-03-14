import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { appSettings } from '../constants/appSettings';

const configure = async function () {
  try {
    await Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    Purchases.configure({ apiKey: (Platform.OS === 'ios' ? appSettings.REVENUE_CAT_APPLE_API_KEY : appSettings.REVENUE_CAT_GOOGLE_API_KEY) });
    console.log('RevenueCat -> configure: in-app purchase library (RevenueCat) configued with app user Id ', await Purchases.getAppUserID());
  } catch (error) {
    console.error('RevenueCat -> configure: in-app purchase library (RevenueCat) configuration failed with error:', error.message);
  }
};

const login = async function (appUserId) {
  try {
    if (!(await Purchases.isConfigured())) { await configure(true); }
    const { customerInfo } = await Purchases.logIn(appUserId);
    console.log(`RevenueCat -> login: logged in RevenueCat with app user ID ${appUserId} / stored: ${await Purchases.getAppUserID()} / original: ${customerInfo?.originalAppUserId} `);
  } catch (error) {
    console.error('RevenueCat -> login: failed with error:', error.message);
    throw error;
  }
};

const getEntitlements = async () => {
  let entitlements;
  try {
    if (!(await Purchases.isConfigured())) { await configure(true); }
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

const getPackage = async (offeringId, packageId) => {
  let foundPackage;
  try {
    if (!(await Purchases.isConfigured())) { await configure(true); }
    const offerings = await Purchases.getOfferings();
    foundPackage = offerings?.all?.[offeringId]?.availablePackages?.find(x => x.identifier == packageId);
    if (foundPackage) {
      console.log(`RevenueCat -> getPackage: Found package for offering ID ${offeringId} and package ID ${packageId}:`);
    } else {
      throw new Error(`Did not find package for offering ID ${offeringId} and package ID ${packageId}`);
    }
  } catch (error) {
    console.error(`RevenueCat -> getPackage: getting package failed with error: ` + error.message);
    throw error;
  }
  return foundPackage;
};

const purchasePackage = async (offeringId, packageId, entitlementId) => {
  let entitlement;
  try {
    if (!(await Purchases.isConfigured())) { await configure(true); }
    const offerings = await Purchases.getOfferings();
    const packageToPurchase = offerings?.all?.[offeringId]?.availablePackages?.find(x => x.identifier == packageId);
    if (packageToPurchase) {
      console.log(`RevenueCat -> purchasePackage: Found package for offering ID ${offeringId} and package ID ${packageId}:`);
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      entitlement = customerInfo.entitlements.active[entitlementId];
      console.log(`RevenueCat -> purchasePackage: Purchase attempt returned entitlement for ID ${entitlementId} with value:`, JSON.stringify(entitlement));
    } else {
      throw new Error(`Did not find package for offering ID ${offeringId} and package ID ${packageId}`);
    }
  } catch (error) {
    console.error(`RevenueCat -> purchasePackage: purchasing package failed with error: ` + error.message);
    throw error;
  }
  return entitlement;
};

const restorePurchases = async () => {
  let entitlements;
  try {
    if (!(await Purchases.isConfigured())) { await configure(true); }
    const customerInfo = await Purchases.restorePurchases();
    if (customerInfo) {
      entitlements = customerInfo.entitlements?.active;
      console.log('RevenueCat -> restorePurchases: ' + (entitlements && Object.keys(entitlements).length > 0) ? `Restored active entitlements: ${JSON.stringify(Object.keys(entitlements))}` : 'No active entitlements restored');
    }
  } catch (error) {
    console.error(`RevenueCat -> restorePurchases: restoring purchases failed with error: ` + error.message);
    throw error;
  }
  return entitlements;
};

export default {
  configure,
  isConfigured: Purchases.isConfigured,
  login,
  getEntitlements,
  getPackage,
  purchasePackage,
  restorePurchases,
};