import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FirebaseAuth from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { app } from '../../config_firebase';

// Firebase publica essa função no bundle React Native; o cast mantém o tipo
// independente da condição de resolução escolhida pelo TypeScript no desktop.
const getReactNativePersistence = (FirebaseAuth as typeof FirebaseAuth & {
  getReactNativePersistence: (storage: typeof AsyncStorage) => FirebaseAuth.Persistence;
}).getReactNativePersistence;

let nativeAuth: Auth;
try {
  nativeAuth = FirebaseAuth.initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // Fast Refresh pode inicializar o mesmo app mais de uma vez.
  nativeAuth = FirebaseAuth.getAuth(app);
}

export const auth = nativeAuth;
