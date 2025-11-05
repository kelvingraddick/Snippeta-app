const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const SentryMetroPlugin = require('@sentry/react-native/metro');

const defaultConfig = getDefaultConfig(__dirname);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const metroConfig = {transformer: SentryMetroPlugin.create  (defaultConfig.transformer, {
  // Options for the Sentry Metro plugin if needed
}),};

module.exports = mergeConfig(defaultConfig, metroConfig);