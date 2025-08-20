/**
 * @format
 */
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { sync } from '@clinikally/airship-sdk';

// Optional: immediately check for updates on startup
sync?.();

AppRegistry.registerComponent(appName, () => App);