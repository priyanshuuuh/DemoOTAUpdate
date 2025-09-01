#!/usr/bin/env node

/**
 * Test script to validate OTA API endpoint directly
 * This helps debug network issues separate from the mobile app
 */

const https = require('https');

// Configuration matching your app
const config = {
  projectId: 'demo-ota-app',
  appVersion: '1.0',
  platform: 'android',
  appliedBundleHash: null, // Will be empty for first time
  baseUrl: 'https://airship-api.clinikally.shop',
  endpoint: '/api/v1/promoted/get-update-meta'
};

// Test payload matching what the Android code sends
const payload = {
  projectId: config.projectId,
  appVersion: config.appVersion,
  platform: config.platform,
  appliedBundleHash: config.appliedBundleHash
};

console.log('🔍 Testing OTA API Endpoint');
console.log('================================');
console.log('URL:', config.baseUrl + config.endpoint);
console.log('Payload:', JSON.stringify(payload, null, 2));
console.log('================================');

const postData = JSON.stringify(payload);

const options = {
  hostname: 'airship-api.clinikally.shop',
  port: 443,
  path: config.endpoint,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    // Add any required headers here if needed
    // 'x-app-token': 'your-app-token',
    // 'x-sdk-pin-access-token': 'your-sdk-token',
    // 'uid': 'your-device-id'
  }
};

const startTime = Date.now();

const req = https.request(options, (res) => {
  const endTime = Date.now();
  
  console.log('📡 Response received:');
  console.log('Status:', res.statusCode, res.statusMessage);
  console.log('Time:', endTime - startTime, 'ms');
  console.log('Headers:');
  Object.entries(res.headers).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response Body:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      // Analyze response
      console.log('\n🔍 Response Analysis:');
      if (parsed.success) {
        console.log('✅ API call successful');
        
        const responseData = parsed.data;
        if (responseData) {
          console.log('📦 Response data available');
          
          if (responseData.newBundleData) {
            console.log('🆕 New bundle available:');
            console.log('  - Download URL:', responseData.newBundleData.downloadUrl);
            console.log('  - Checksum:', responseData.newBundleData.checksum);
            console.log('  - Target Version:', responseData.newBundleData.targetAppVersion);
          } else {
            console.log('ℹ️ No new bundle available');
          }
          
          if (responseData.appliedBundleData) {
            console.log('📋 Applied bundle info available');
            console.log('  - Is Rolled Back:', responseData.appliedBundleData.isRolledBack);
          }
        } else {
          console.log('⚠️ No data in response');
        }
      } else {
        console.log('❌ API call failed');
        console.log('Error:', parsed.error || 'Unknown error');
      }
    } catch (e) {
      console.log('❌ Failed to parse JSON response');
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  const endTime = Date.now();
  console.log('❌ Request failed:');
  console.log('Time:', endTime - startTime, 'ms');
  console.log('Error:', e.message);
});

console.log('🔄 Sending request...');
req.write(postData);
req.end();