/**
 * @format
 */
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

console.log('🚀 App starting without sync for debugging...');

AppRegistry.registerComponent(appName, () => App);