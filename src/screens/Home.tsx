import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import MenuIntroAnimation from '../features/menu-intro/MenuIntroAnimation';
import MenuArtwork from '../features/menu-intro/MenuArtwork';
import MenuRevealFlash from '../features/menu-intro/MenuRevealFlash';
import { useSuitNavigation } from '../features/suit-transition/suitRoutes';
import {
  getCoverFrame,
  MENU_IMAGE_ASPECT,
  MENU_INTRO_CONFIG,
} from '../features/menu-intro/menuIntroConfig';
import type { LayoutChangeEvent } from 'react-native';

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const { go } = useSuitNavigation();
  const reducedMotion = useReducedMotion();
  const skipIntro = reducedMotion || MENU_INTRO_CONFIG.skipAnimationForTests;
  const frame = getCoverFrame(viewport.width, viewport.height, MENU_IMAGE_ASPECT);
  const finishIntro = useCallback(() => setIntroComplete(true), []);

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
});
