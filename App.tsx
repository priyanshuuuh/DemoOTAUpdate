/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { withStallion } from '@clinikally/airship-sdk';

import type {PropsWithChildren} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  Alert,
  Platform,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
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
  const [debugInfo, setDebugInfo] = useState('');
  const [stallionInfo, setStallionInfo] = useState('');

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  // Auto-check Stallion module on app start
  React.useEffect(() => {
    console.log('🔍 App.tsx useEffect - checking Stallion module...');
    
    setTimeout(() => {
      console.log('🔍 Delayed check for Stallion module...');
      checkStallionModule();
    }, 2000);
  }, []);

  // Debug: Check Stallion native module
  const checkStallionModule = async () => {
    console.log('🔍 checkStallionModule called');
    try {
      const { NativeModules } = require('react-native');
      console.log('🔍 Available NativeModules:', Object.keys(NativeModules));
      
      const stallionModule = NativeModules.Stallion;
      console.log('🔍 Stallion module:', stallionModule);
      
      let info = `Platform: ${Platform.OS}\n`;
      info += `Stallion Module Available: ${stallionModule ? 'YES' : 'NO'}\n`;
      
      if (stallionModule) {
        const methods = Object.keys(stallionModule);
        console.log('🔍 Stallion methods:', methods);
        info += `Methods: ${methods.join(', ')}\n\n`;
        
        // Try to get config info
        try {
          console.log('🔍 Calling getStallionConfig...');
          const config = await stallionModule.getStallionConfig?.();
          console.log('🔍 Config result:', config);
          info += `Config: ${config || 'None'}\n`;
        } catch (e: any) {
          console.log('🔍 Config error:', e);
          info += `Config Error: ${e?.message || 'Unknown'}\n`;
        }
        
        // Try to get bundle info
        try {
          console.log('🔍 Calling getBundleURL...');
          const bundleUrl = stallionModule.getBundleURL?.();
          console.log('🔍 Bundle URL result:', bundleUrl);
          info += `Bundle URL: ${bundleUrl || 'None'}\n`;
        } catch (e: any) {
          console.log('🔍 Bundle error:', e);
          info += `Bundle Error: ${e?.message || 'Unknown'}\n`;
        }
      } else {
        console.log('❌ Stallion module not available');
      }
      
      console.log('🔍 Final info:', info);
      setStallionInfo(info);
    } catch (error: any) {
      console.log('❌ checkStallionModule error:', error);
      setStallionInfo(`Error: ${error?.message || 'Unknown'}`);
    }
  };

  // Debug: Force sync
  const forceSync = async () => {
    try {
      const { NativeModules } = require('react-native');
      const stallionModule = NativeModules.Stallion;
      
      if (stallionModule && stallionModule.sync) {
        setDebugInfo('Calling native sync...');
        await stallionModule.sync();
        setDebugInfo('Sync called successfully');
      } else {
        setDebugInfo('Sync method not available');
      }
    } catch (error) {
      setDebugInfo(`Sync error: ${error.message}`);
    }
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
      <ScrollView
        style={backgroundStyle}>
        <View style={{paddingRight: safePadding}}>
          <Header/>
        </View>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            paddingHorizontal: safePadding,
            paddingBottom: safePadding,
          }}>
          <Section title="🚀 Airship OTA Update Test">
            <Text style={[styles.highlight, {color: '#007AFF', fontSize: 20}]}>
              OTA Update v10.45 clinikally - This is from Airship SDK!
            </Text>
            {'\n'}This change should appear via OTA update, not Metro bundler.
            {'\n\n'}Platform detection and OTA updates are now handled automatically by airship-sdk.
          </Section>
          
          <Section title="🔍 Debug: Stallion Module">
            <Button title="Check Stallion Module" onPress={checkStallionModule} />
            {'\n'}
            <Text style={{fontSize: 12, color: '#666', fontFamily: 'Courier'}}>
              {stallionInfo}
            </Text>
          </Section>
          
          <Section title="🔧 Debug: Force Sync">
            <Button title="Force OTA Sync" onPress={forceSync} />
            {'\n'}
            <Text style={{fontSize: 12, color: '#666', fontFamily: 'Courier'}}>
              {debugInfo}
            </Text>
          </Section>
          
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
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
});

const AppWithAirship = withStallion(App, {
  projectId: 'demo-ota-app',
  environment: 'prod',
  debugMode: true
});

export default AppWithAirship;
