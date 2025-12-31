/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import {
  withStallion,
  getSyncContext,
  getBundleMetadata,
  type IBundleMetadata,
} from '@clinikally/airship-sdk';

import type { PropsWithChildren } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ActivityIndicator,
} from 'react-native';

import { Colors, Header, LearnMoreLinks } from 'react-native/Libraries/NewAppScreen';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({ children, title }: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [loading, setLoading] = useState(true);
  const [currentBundleHash, setCurrentBundleHash] = useState<string | null>(null);
  const [bundleMetadata, setBundleMetadata] = useState<IBundleMetadata | null>(null);

  useEffect(() => {
    const fetchBundleInfo = async () => {
      try {
        setLoading(true);

        // Get current bundle hash from sync context
        const context = await getSyncContext();
        const hash = context?.appliedBundleHash || null;
        setCurrentBundleHash(hash);

        // If we have a hash, fetch metadata
        if (hash) {
          const metadata = await getBundleMetadata(hash);
          setBundleMetadata(metadata);
          console.log('Bundle Metadata:', metadata);
        }
      } catch (error) {
        console.error('Error fetching bundle info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBundleInfo();
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  /*
   * To keep the template simple and small we're adding padding to prevent view
   * from rendering under the System UI.
   * For bigger apps the recommendation is to use `react-native-safe-area-context`:
   * https://github.com/AppAndFlow/react-native-safe-area-context
   *
   * You can read more about it here:
   * https://github.com/react-native-community/discussions-and-proposals/discussions/827
   */
  const safePadding = '5%';

  return (
    <View style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView style={backgroundStyle}>
        <View style={{ paddingRight: safePadding }}>
          <Header />
        </View>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            paddingHorizontal: safePadding,
            paddingBottom: safePadding,
          }}>
          <Section title="🚀 Airship OTA Update Demo">
            <Text style={[styles.highlight, { color: '#007AFF', fontSize: 20 }]}>
              OTA Update v11.12 - test ota Clinikally Airship SDK
            </Text>
            {'\n'}This app demonstrates over-the-air updates using the Airship SDK.
            {'\n\n'}Updates are handled automatically in the background.
          </Section>

          <Section title="📊 Current Bundle Information">
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={{ marginLeft: 10, color: isDarkMode ? Colors.light : Colors.dark }}>
                  Loading bundle information...
                </Text>
              </View>
            ) : (
              <View style={styles.contextContainer}>
                <Text style={[styles.contextItem, { color: isDarkMode ? Colors.light : Colors.dark }]}>
                  <Text style={styles.contextLabel}>Bundle Hash: </Text>
                  {currentBundleHash ? `${currentBundleHash.substring(0, 12)}...` : 'Native'}
                </Text>

                {bundleMetadata && (
                  <>
                    <Text style={[styles.contextItem, { color: isDarkMode ? Colors.light : Colors.dark }]}>
                      <Text style={styles.contextLabel}>Bundle Version: </Text>
                      {bundleMetadata.version}
                    </Text>
                    <Text style={[styles.contextItem, { color: isDarkMode ? Colors.light : Colors.dark }]}>
                      <Text style={styles.contextLabel}>Release Notes: </Text>
                      {bundleMetadata.releaseNotes}
                    </Text>
                    <Text style={[styles.contextItem, { color: isDarkMode ? Colors.light : Colors.dark }]}>
                      <Text style={styles.contextLabel}>Platform: </Text>
                      {bundleMetadata.platform}
                    </Text>
                    <Text style={[styles.contextItem, { color: isDarkMode ? Colors.light : Colors.dark }]}>
                      <Text style={styles.contextLabel}>Environment: </Text>
                      {bundleMetadata.environment}
                    </Text>
                  </>
                )}
              </View>
            )}
          </Section>

          <Section title="Learn More">Read the docs to discover what to do next:</Section>
          <LearnMoreLinks />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  contextContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  contextItem: {
    fontSize: 14,
    marginVertical: 4,
    lineHeight: 20,
  },
  contextLabel: {
    fontWeight: '600',
    color: '#007AFF',
  },
});

const AppWithAirship = withStallion(App);

export default AppWithAirship;
