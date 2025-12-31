# Airship SDK - Bundle Information API

## Overview

The Airship SDK provides multiple ways to access OTA update and bundle information in your React Native app. This guide explains how to use them.

## Available APIs

### `getBundleMetadata()` - Simple API Function ⭐ NEW

**The simplest way to fetch bundle metadata by hash.**

This function fetches bundle information directly from the Airship API using a bundle hash. Perfect for displaying version info without complex state management.

#### Usage

```tsx
import { getSyncContext, getBundleMetadata, type IBundleMetadata } from '@clinikally/airship-sdk';

function MyComponent() {
  const [bundleMetadata, setBundleMetadata] = useState<IBundleMetadata | null>(null);

  useEffect(() => {
    const fetchBundleInfo = async () => {
      // Get current bundle hash
      const context = await getSyncContext();
      const hash = context?.appliedBundleHash;

      // Fetch metadata
      if (hash) {
        const metadata = await getBundleMetadata(hash);
        setBundleMetadata(metadata);
      }
    };

    fetchBundleInfo();
  }, []);

  return (
    <View>
      {bundleMetadata && (
        <>
          <Text>Version: {bundleMetadata.version}</Text>
          <Text>Release Notes: {bundleMetadata.releaseNotes}</Text>
          <Text>Platform: {bundleMetadata.platform}</Text>
          <Text>Environment: {bundleMetadata.environment}</Text>
        </>
      )}
    </View>
  );
}
```

#### Function Signature

```typescript
getBundleMetadata(bundleHash: string): Promise<IBundleMetadata | null>
```

#### Return Type

```typescript
interface IBundleMetadata {
  id: string;                  // Bundle ID
  version: string;             // Bundle version (e.g., "v2")
  versionNumber: number;       // Numeric version
  platform: string;            // Platform (android/ios)
  environment: string;         // Environment (dev/staging/prod)
  bundleHash: string;          // The bundle hash
  releaseNotes: string;        // Release notes
}
```

#### Example: Complete Component

```tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import {
  getSyncContext,
  getBundleMetadata,
  type IBundleMetadata,
} from '@clinikally/airship-sdk';

function BundleInfo() {
  const [loading, setLoading] = useState(true);
  const [currentHash, setCurrentHash] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<IBundleMetadata | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);

        // Get current bundle hash
        const context = await getSyncContext();
        const hash = context?.appliedBundleHash || null;
        setCurrentHash(hash);

        // Fetch metadata from API
        if (hash) {
          const data = await getBundleMetadata(hash);
          setMetadata(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, []);

  if (loading) return <ActivityIndicator />;

  return (
    <View>
      <Text>Bundle Hash: {currentHash || 'Native'}</Text>
      {metadata && (
        <>
          <Text>Version: {metadata.version}</Text>
          <Text>Release Notes: {metadata.releaseNotes}</Text>
          <Text>Platform: {metadata.platform}</Text>
          <Text>Environment: {metadata.environment}</Text>
        </>
      )}
    </View>
  );
}
```

**Benefits:**
- ✅ Simple Promise-based API
- ✅ No complex state management
- ✅ Always fetches fresh data from server
- ✅ TypeScript support
- ✅ Works anywhere (not limited to React hooks)

---

## Available Hooks

### 1. `useBundleInfo()` - Recommended ✅

**The easiest way to access bundle information with automatic persistence.**

This hook provides a clean, persistent interface to bundle data. It automatically persists the latest update information even when `updateAvailable` becomes `false`.

#### Usage

```tsx
import { useBundleInfo } from '@clinikally/airship-sdk';

function MyComponent() {
  const bundleInfo = useBundleInfo();

  return (
    <View>
      <Text>Current Bundle: {bundleInfo.currentBundleHash || 'Native'}</Text>
      <Text>App Version: {bundleInfo.appVersion}</Text>
      <Text>Platform: {bundleInfo.platform}</Text>
      <Text>Environment: {bundleInfo.environment}</Text>

      {bundleInfo.latestVersion && (
        <View>
          <Text>Latest Version: {bundleInfo.latestVersion}</Text>
          <Text>Latest Hash: {bundleInfo.latestReleaseHash}</Text>
          <Text>Size: {(bundleInfo.latestBundleSize / 1024 / 1024).toFixed(2)} MB</Text>
        </View>
      )}

      {bundleInfo.updateAvailable && (
        <Text>🔄 Update Available!</Text>
      )}
    </View>
  );
}
```

#### Return Value

```typescript
interface IBundleInfo {
  // Current bundle info (always available after first sync)
  currentBundleHash: string | null;      // Currently running bundle hash
  appVersion: string | null;             // App version (e.g., "1.1")
  platform: string | null;               // Platform (ios/android)
  environment: string | null;            // Environment (test-env, prod, etc.)
  projectId: string | null;              // Project ID

  // Latest available update (PERSISTED even when updateAvailable becomes false)
  latestVersion: string | null;          // Latest version (e.g., "v6")
  latestReleaseHash: string | null;      // Latest release hash
  latestEnvironment: string | null;      // Target environment
  latestBundleSize: number | null;       // Bundle size in bytes

  // Status
  updateAvailable: boolean;              // Whether an update is currently available
  loading: boolean;                      // Whether sync is in progress
  error: string | null;                  // Error message if sync failed

  // Actions
  refetch: () => Promise<void>;          // Manually trigger sync
}
```

---

### 2. `useSyncContext()` - Lower Level

**Access raw sync context data from the OTA API.**

```tsx
import { useSyncContext } from '@clinikally/airship-sdk';

function MyComponent() {
  const { syncContext, loading, error, refetch } = useSyncContext();

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View>
      <Text>App Version: {syncContext?.appVersion}</Text>
      <Text>Platform: {syncContext?.platform}</Text>
      <Text>Current Bundle: {syncContext?.appliedBundleHash || 'Native'}</Text>

      {syncContext?.response?.updateAvailable && (
        <View>
          <Text>Version: {syncContext.response.version}</Text>
          <Text>Hash: {syncContext.response.releaseHash}</Text>
          <Text>Environment: {syncContext.response.environment}</Text>
          <Text>Size: {syncContext.response.bundleSize} bytes</Text>
        </View>
      )}
    </View>
  );
}
```

#### Return Value

```typescript
interface IUseSyncContext {
  syncContext: ISyncContext | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface ISyncContext {
  // Request payload
  appVersion?: string;
  platform?: string;
  projectId?: string;
  currentEnvironment?: string;
  appliedBundleHash?: string;

  // OTA API response
  response?: {
    updateAvailable?: boolean;
    downloadUrl?: string;
    releaseHash?: string;
    version?: string;             // e.g., "v6"
    versionNumber?: number;
    environment?: string;
    releaseNotes?: string;
    bundleSize?: number;
  };
}
```

---

### 3. `useStallionUpdate()` - Update Metadata

**Access update metadata and restart status.**

```tsx
import { useStallionUpdate } from '@clinikally/airship-sdk';

function MyComponent() {
  const { isRestartRequired, currentlyRunningBundle, newReleaseBundle } = useStallionUpdate();

  return (
    <View>
      {isRestartRequired && <Text>⚠️ Restart required to apply update</Text>}

      {currentlyRunningBundle && (
        <View>
          <Text>Version: {currentlyRunningBundle.version}</Text>
          <Text>Platform: {currentlyRunningBundle.platform}</Text>
        </View>
      )}

      {newReleaseBundle && (
        <View>
          <Text>New version available: {newReleaseBundle.version}</Text>
        </View>
      )}
    </View>
  );
}
```

---

## Complete Example

```tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { withStallion, useBundleInfo, restart } from '@clinikally/airship-sdk';

function App() {
  const bundleInfo = useBundleInfo();

  return (
    <View>
      <Text>📦 Bundle Information</Text>

      {/* Current Bundle */}
      <View>
        <Text>Current: {bundleInfo.currentBundleHash?.substring(0, 8) || 'Native'}</Text>
        <Text>Version: {bundleInfo.appVersion}</Text>
        <Text>Platform: {bundleInfo.platform}</Text>
        <Text>Environment: {bundleInfo.environment}</Text>
      </View>

      {/* Latest Update Info (Persisted) */}
      {bundleInfo.latestVersion && (
        <View>
          <Text>Latest Version: {bundleInfo.latestVersion}</Text>
          <Text>Hash: {bundleInfo.latestReleaseHash?.substring(0, 8)}...</Text>
          <Text>Size: {(bundleInfo.latestBundleSize! / 1024 / 1024).toFixed(2)} MB</Text>
        </View>
      )}

      {/* Update Available */}
      {bundleInfo.updateAvailable && (
        <View>
          <Text>🔄 Update Available!</Text>
          <Button title="Restart & Update" onPress={() => restart()} />
        </View>
      )}

      {/* Manual Sync */}
      <Button
        title="Check for Updates"
        onPress={() => bundleInfo.refetch()}
        disabled={bundleInfo.loading}
      />
    </View>
  );
}

export default withStallion(App);
```

---

## Key Features

### 1. **Automatic Persistence** ✅
The `useBundleInfo` hook automatically persists the latest update information, so you can display details like version, hash, and bundle size even after `updateAvailable` becomes `false`.

### 2. **Always Available Data** ✅
Current bundle information (`currentBundleHash`, `appVersion`, `platform`, `environment`) is always available after the first sync.

### 3. **Type Safe** ✅
All hooks are fully typed with TypeScript for better developer experience.

### 4. **Easy to Use** ✅
Simple, clean API that handles all the complexity internally.

---

## Best Practices

1. **Use `useBundleInfo()` for most cases** - It provides the cleanest API with persistence
2. **Use `useSyncContext()` if you need raw API response data**
3. **Use `useStallionUpdate()` if you need restart status and internal metadata**
4. **Always wrap your app with `withStallion()`** HOC for OTA updates to work

---

## Common Use Cases

### Display Current Bundle Info
```tsx
const bundleInfo = useBundleInfo();
console.log('Running bundle:', bundleInfo.currentBundleHash);
console.log('App version:', bundleInfo.appVersion);
```

### Check for Updates
```tsx
const bundleInfo = useBundleInfo();

if (bundleInfo.updateAvailable) {
  console.log('New version available:', bundleInfo.latestVersion);
  // Show update prompt
}
```

### Show Last Known Update (Even After Install)
```tsx
const bundleInfo = useBundleInfo();

// This will show the latest version info even when updateAvailable is false
if (bundleInfo.latestVersion) {
  console.log('Latest known version:', bundleInfo.latestVersion);
  console.log('Hash:', bundleInfo.latestReleaseHash);
  console.log('Size:', bundleInfo.latestBundleSize);
}
```

### Manual Sync
```tsx
const bundleInfo = useBundleInfo();

const handleCheckUpdates = async () => {
  await bundleInfo.refetch();
  console.log('Sync complete!');
};
```

---

## Version
SDK Version: 1.4.0+

Last Updated: December 31, 2024
