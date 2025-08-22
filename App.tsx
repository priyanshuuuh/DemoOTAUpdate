/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
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
  const [otaStatus, setOtaStatus] = useState('Initializing...');
  const [lastUpdate, setLastUpdate] = useState('Never');
  const [debugInfo, setDebugInfo] = useState('');
  const [sdkDebugInfo, setSdkDebugInfo] = useState('');
  const [bundleInfo, setBundleInfo] = useState('');

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  // Function to check SDK internal state
  const checkSDKState = async () => {
    setSdkDebugInfo('Checking Airship SDK state...');
    
    try {
      // Check what native modules are available
      const { NativeModules } = require('react-native');
      const stallionModule = NativeModules.Stallion;
      
      console.log('🔍 Available NativeModules:', Object.keys(NativeModules).filter(key => key.toLowerCase().includes('stallion')));
      console.log('🔍 Stallion module:', stallionModule);
      console.log('🔍 Stallion methods:', stallionModule ? Object.keys(stallionModule) : 'undefined');
      
      // Try to access SDK methods if available
      const bundleUrl = stallionModule?.getBundleURL?.();
      const sdkStatus = stallionModule?.getUpdateStatus?.();
      const lastCheck = stallionModule?.getLastUpdateCheck?.();
      
      // Try to get SDK configuration and metadata
      let configInfo = '';
      let metaInfo = '';
      
      try {
        const config = await stallionModule?.getStallionConfig?.();
        configInfo = `Config: ${config || 'None'}`;
        console.log('🔧 Stallion Config:', config);
      } catch (error) {
        configInfo = `Config Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
      
      try {
        const meta = await stallionModule?.getStallionMeta?.();
        metaInfo = `Meta: ${meta || 'None'}`;
        console.log('📊 Stallion Meta:', meta);
      } catch (error) {
        metaInfo = `Meta Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
      
      let sdkInfo = 'SDK Internal State:\n';
      sdkInfo += `Bundle URL: ${bundleUrl || 'None'}\n`;
      sdkInfo += `Update Status: ${sdkStatus || 'Unknown'}\n`;
      sdkInfo += `Last Check: ${lastCheck || 'Never'}\n`;
      sdkInfo += `${configInfo}\n`;
      sdkInfo += `${metaInfo}\n`;
      
      // Check if this is an OTA bundle or embedded bundle
      if (bundleUrl) {
        const isOTABundle = bundleUrl.includes('Documents') || bundleUrl.includes('Library') && !bundleUrl.includes('.app/');
        const isEmbeddedBundle = bundleUrl.includes('.app/main.jsbundle');
        sdkInfo += `Bundle Type: ${isOTABundle ? '🟢 OTA Downloaded' : isEmbeddedBundle ? '🔴 Embedded/Fallback' : '🟡 Unknown'}\n`;
      }
      
      // Check if there's a downloaded bundle
      if (bundleUrl) {
        setBundleInfo(`Current Bundle: ${bundleUrl}`);
      } else {
        setBundleInfo('No OTA bundle loaded');
      }
      
      setSdkDebugInfo(sdkInfo);
    } catch (error) {
      setSdkDebugInfo(`SDK Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Function to force SDK update check and restart
  const forceSDKUpdate = async () => {
    setSdkDebugInfo('Forcing native SDK sync...');
    
    try {
      const { NativeModules } = require('react-native');
      const stallionModule = NativeModules.Stallion;
      
      if (stallionModule && stallionModule.sync) {
        // First ensure the SDK is properly initialized by calling onLaunch
        console.log('🔧 Initializing SDK with onLaunch...');
        await stallionModule.onLaunch('debug-launch');
        
        console.log('🔄 Triggering native Stallion sync...');
        await stallionModule.sync();
        console.log('✅ Native sync call completed');
        
        // Wait a bit for sync to complete, then restart to load OTA bundle
        setTimeout(async () => {
          console.log('🔄 Restarting app to apply OTA bundle...');
          setSdkDebugInfo('Restarting app to apply OTA bundle...');
          await stallionModule.restart();
        }, 5000);
        
        setSdkDebugInfo('Sync completed - restarting in 5 seconds to apply OTA bundle...');
      } else {
        setSdkDebugInfo('Native Stallion sync method not available');
      }
    } catch (error) {
      console.log('❌ Native sync failed:', error);
      setSdkDebugInfo(`Native sync error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Function to force rollback from corrupted OTA bundle
  const forceRollback = async () => {
    setSdkDebugInfo('Forcing rollback to default bundle...');
    
    try {
      const { NativeModules } = require('react-native');
      const stallionModule = NativeModules.Stallion;
      
      if (stallionModule && stallionModule.toggleStallionSwitch) {
        // Get current meta to see state
        const metaString = await stallionModule.getStallionMeta();
        const meta = JSON.parse(metaString);
        console.log('📊 Current meta before rollback:', meta);
        
        // Clear any corrupted state by switching to stage then back to prod
        // This should trigger the rollback mechanism
        console.log('🔄 Switching to STAGE mode...');
        await stallionModule.toggleStallionSwitch('STAGE');
        
        setTimeout(async () => {
          console.log('🔄 Switching back to PROD mode...');
          await stallionModule.toggleStallionSwitch('PROD');
          
          setTimeout(async () => {
            console.log('✅ Rollback completed, restarting...');
            setSdkDebugInfo('Rollback completed - restarting app...');
            await stallionModule.restart();
          }, 1000);
        }, 1000);
        
        setSdkDebugInfo('Rollback in progress - restarting in 3 seconds...');
      } else {
        setSdkDebugInfo('Native Stallion toggleStallionSwitch method not available');
      }
    } catch (error) {
      console.log('❌ Rollback failed:', error);
      setSdkDebugInfo(`Rollback error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Function to manually check for updates
  const checkForUpdates = async () => {
    setOtaStatus('Checking for updates...');
    setDebugInfo('Making API request to check for updates...');
    
    try {
      // Since we can't directly access the Airship SDK's internal methods,
      // let's make a direct API call to see what the SDK should be getting
      const response = await fetch('http://localhost:8000/api/v1/promoted/get-update-meta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: 'demo-ota-app',
          platform: 'ios',
          appVersion: '1.0',
          currentEnvironment: 'prod'
        }),
      });
      
      const data = await response.json();
      
      setDebugInfo(`API Response: ${JSON.stringify(data, null, 2)}`);
      
      if (data.updateAvailable) {
        setOtaStatus(`Update Available: ${data.version}`);
        setLastUpdate(`Available: ${data.version} (${data.bundleSize} bytes)`);
        
        // Also check SDK state after API call
        setTimeout(checkSDKState, 1000);
      } else {
        setOtaStatus('No updates available');
        setLastUpdate('Up to date');
      }
    } catch (error) {
      setOtaStatus('Update check failed');
      setDebugInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('OTA Update check error:', error);
    }
  };

  useEffect(() => {
    // Check for updates when the app starts
    checkForUpdates();
    
    // Also check SDK state initially
    setTimeout(checkSDKState, 2000);
    
    // Listen for native Stallion events
    const { NativeModules, NativeEventEmitter } = require('react-native');
    const stallionModule = NativeModules.Stallion;
    
    if (stallionModule) {
      const eventEmitter = new NativeEventEmitter(stallionModule);
      const subscription = eventEmitter.addListener('STALLION_NATIVE_EVENT', (event: any) => {
        console.log('📡 Native Stallion Event:', event);
        
        // Parse the event if it's a JSON string
        try {
          const eventData = typeof event === 'string' ? JSON.parse(event) : event;
          if (eventData.type === 'SYNC_DEBUG') {
            console.log('🔧 Native Sync Debug:', eventData.message);
            setSdkDebugInfo(prev => prev + '\n' + eventData.message);
          }
        } catch (error) {
          console.log('Event parsing error:', error);
        }
      });
      
      // Clean up subscription
      return () => {
        subscription.remove();
      };
    }
    
    // Check every 30 seconds for demo purposes
    const interval = setInterval(() => {
      checkForUpdates();
      checkSDKState();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

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
              OTA Update v9.5 clinikally - This is from Airship SDK!
            </Text>
            {'\n'}This change should appear via OTA update, not Metro bundler.
          </Section>
          
          <Section title="🔍 OTA Debug Info">
            <Text style={[styles.highlight, {color: '#FF6B35', fontSize: 16}]}>
              Status: {otaStatus}
            </Text>
            {'\n'}
            <Text style={{color: isDarkMode ? Colors.light : Colors.dark}}>
              Last Update Check: {lastUpdate}
            </Text>
            {'\n'}
            <Button title="Check for Updates Now" onPress={checkForUpdates} />
            {'\n'}
            <Text style={{fontSize: 12, color: '#666', fontFamily: 'Courier'}}>
              {debugInfo}
            </Text>
          </Section>
          
          <Section title="⚙️ Airship SDK Debug">
            <Text style={[styles.highlight, {color: '#9B59B6', fontSize: 16}]}>
              Bundle Status: {bundleInfo || 'Checking...'}
            </Text>
            {'\n'}
            <Button title="Check SDK State" onPress={checkSDKState} />
            {' '}
            <Button title="Force SDK Update" onPress={forceSDKUpdate} />
            {' '}
            <Button title="Force Rollback" onPress={forceRollback} />
            {'\n'}
            <Text style={{fontSize: 12, color: '#666', fontFamily: 'Courier'}}>
              {sdkDebugInfo}
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

const AppWithAirship = withStallion(App);

export default AppWithAirship;
