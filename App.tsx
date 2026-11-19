import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { GameSetupProvider } from './src/features/game-setup/gameSetup';
import { SuitTransitionProvider } from './src/features/suit-transition/SuitTransition';
import { AuthProvider } from './src/features/auth/AuthProvider';

export default function App() {
  const [loaded, error] = useFonts({ Pixelify: require('./assets/PixelifySans.ttf') });
  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar style="light" />
      <GameSetupProvider>
        <AuthProvider>
          <SuitTransitionProvider>
            <AppNavigator />
          </SuitTransitionProvider>
        </AuthProvider>
      </GameSetupProvider>
    </SafeAreaProvider>
  );
}
