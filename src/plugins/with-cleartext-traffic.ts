import { withAndroidManifest, type ConfigPlugin } from '@expo/config-plugins';

/**
 * Adds android:usesCleartextTraffic="true" to the application tag in
 * AndroidManifest.xml. Needed for the mock API which simulates local
 * HTTP traffic during development builds.
 */
const withCleartextTraffic: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application?.[0];

    if (mainApplication) {
      mainApplication.$['android:usesCleartextTraffic'] = 'true';
    }

    return config;
  });
};

export default withCleartextTraffic;
