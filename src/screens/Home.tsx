import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { signOut } from 'firebase/auth';
import { useReducedMotion } from 'react-native-reanimated';

import MenuIntroAnimation from '../features/menu-intro/MenuIntroAnimation';
import MenuArtwork from '../features/menu-intro/MenuArtwork';
import MenuRevealFlash from '../features/menu-intro/MenuRevealFlash';
import { useSuitNavigation } from '../features/suit-transition/suitRoutes';
import { useGameSetup } from '../features/game-setup/gameSetup';
import {
  getCoverFrame,
  MENU_IMAGE_ASPECT,
  MENU_INTRO_CONFIG,
} from '../features/menu-intro/menuIntroConfig';
import type { LayoutChangeEvent } from 'react-native';
import { useAuth } from '../features/auth/AuthProvider';
import { auth } from '../services/firebaseAuth';

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const { go } = useSuitNavigation();
  const { user } = useAuth();
  const { update } = useGameSetup();
  const reducedMotion = useReducedMotion();
  const skipIntro = reducedMotion || MENU_INTRO_CONFIG.skipAnimationForTests;
  const frame = getCoverFrame(viewport.width, viewport.height, MENU_IMAGE_ASPECT);
  const finishIntro = useCallback(() => setIntroComplete(true), []);
  const leaveAccount = async () => {
    update({
      players: 2,
      names: Array<string>(8).fill(''),
      mode: 'padrao',
      seconds: 90,
      category: '',
      wordSource: 'firestore',
      words: [],
      topic: '',
      fallbackMessage: '',
    });
    await signOut(auth);
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setViewport((current) =>
      current.width === width && current.height === height
        ? current
        : { width, height },
    );
  };

  return (
    <View onLayout={handleLayout} style={styles.screen}>
      <Pressable accessibilityRole="button" onPress={() => void leaveAccount()} style={({ pressed }) => [styles.signOut, pressed && styles.signOutPressed]}>
        <Text numberOfLines={1} style={styles.signOutText}>Sair · {user?.email ?? 'Conta'}</Text>
      </Pressable>
      {introComplete && (
        <MenuArtwork
          frame={frame}
          onNavigate={go}
        />
      )}

      {!introComplete && viewport.width > 0 && viewport.height > 0 && (
        <MenuIntroAnimation
          onComplete={finishIntro}
          viewport={viewport}
          skipAnimation={skipIntro}
        />
      )}
      {introComplete && !skipIntro && (
        <MenuRevealFlash />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    backgroundColor: '#050505',
  },
  signOut: { position: 'absolute', top: 26, right: 14, zIndex: 20, maxWidth: '55%', borderWidth: 1, borderColor: '#67666c', backgroundColor: '#111114', paddingHorizontal: 10, paddingVertical: 7 },
  signOutPressed: { opacity: 0.72 },
  signOutText: { color: '#f7f6f3', fontSize: 12 },
});
