import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native'; // Import LogBox from react-native

import App from './App';

// Ignore all log notifications (suppress warnings)
//LogBox.ignoreAllLogs();

// Register the root component
registerRootComponent(App);
