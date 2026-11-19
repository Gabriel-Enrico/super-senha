import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import menuImage from '../../../assets/menu-super-senha-v3.png';
import tableImage from '../../../assets/mesa-poker.png';
import {
  getCoverFrame,
  getMenuFrameOnTable,
  getTableFrame,
  MENU_IMAGE_ASPECT,
  MENU_INTRO_CONFIG,
  MENU_INTRO_DURATION_MS,
  MENU_TILES,
  PLAYER_HANDS,
  type MenuTile,
} from './menuIntroConfig';

type MenuIntroAnimationProps = {
  onComplete: () => void;
  viewport: { width: number; height: number };
  skipAnimation?: boolean;
};

type TileFlightProps = {
  tile: MenuTile;
  index: number;
  frame: ReturnType<typeof getCoverFrame>;
  viewport: { width: number; height: number };
  resolveProgress: SharedValue<number>;
};

const LANDING_ANGLES = [90, -90, 180, 45, -45, 135, -135, 0];
const RESOLVE_START_MS =
  MENU_INTRO_CONFIG.introLeadMs +
  Math.max(MENU_INTRO_CONFIG.cameraDurationMs, MENU_INTRO_DURATION_MS);
const FLASH_START_MS = RESOLVE_START_MS + MENU_INTRO_CONFIG.resolveDurationMs;
const FLASH_IN_MS = 45;

export default function MenuIntroAnimation({
  onComplete,
  viewport,
  skipAnimation = false,
}: MenuIntroAnimationProps) {
  const { width, height } = viewport;
  const cameraProgress = useSharedValue(0);
  const resolveProgress = useSharedValue(0);
  const sceneOpacity = useSharedValue(0);
  const flashOpacity = useSharedValue(0);
  const frame = getMenuFrameOnTable(width, height, MENU_IMAGE_ASPECT);
  const tableFrame = getTableFrame(width, height);
  const finalFrame = getCoverFrame(width, height, MENU_IMAGE_ASPECT);
  const endCameraScale = finalFrame.height / frame.height;
  const skip = skipAnimation || MENU_INTRO_CONFIG.skipAnimationForTests;

  useEffect(() => {
    if (skip) {
      onComplete();
      return;
    }

    sceneOpacity.value = withTiming(1, {
      duration: MENU_INTRO_CONFIG.introFadeDurationMs,
      easing: Easing.inOut(Easing.quad),
    });
    cameraProgress.value = withDelay(
      MENU_INTRO_CONFIG.introLeadMs,
      withTiming(1, {
        duration: MENU_INTRO_CONFIG.cameraDurationMs,
        easing: Easing.bezier(0.6, 0.02, 0.78, 0.98),
      }),
    );
    resolveProgress.value = withDelay(
      RESOLVE_START_MS,
      withTiming(1, {
        duration: MENU_INTRO_CONFIG.resolveDurationMs,
        easing: Easing.inOut(Easing.cubic),
      }),
    );
    flashOpacity.value = withDelay(
      FLASH_START_MS,
      withTiming(1, { duration: FLASH_IN_MS, easing: Easing.out(Easing.quad) }),
    );

    const completionTimer = setTimeout(onComplete, FLASH_START_MS + FLASH_IN_MS);

    return () => {
      clearTimeout(completionTimer);
      cancelAnimation(cameraProgress);
      cancelAnimation(resolveProgress);
      cancelAnimation(sceneOpacity);
      cancelAnimation(flashOpacity);
    };
  }, [cameraProgress, resolveProgress, sceneOpacity, flashOpacity, onComplete, skip]);

  const cameraStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale:
          1 + (endCameraScale - 1) * cameraProgress.value,
      },
    ],
  }));
  const sceneStyle = useAnimatedStyle(() => ({ opacity: sceneOpacity.value }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flashOpacity.value }));
  const assembledStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      resolveProgress.value,
      [0, 0.72, 1],
      [0, 0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  if (skip) return null;

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.overlay, sceneStyle]}
    >
      <Animated.View style={[styles.camera, { width, height }, cameraStyle]}>
        <Image
          source={tableImage}
          resizeMode="stretch"
          style={{
            position: 'absolute',
            width: tableFrame.width,
            height: tableFrame.height,
            left: tableFrame.left,
            top: tableFrame.top,
          }}
        />

        {MENU_TILES.map((tile, index) => (
          <TileFlight
            key={tile.id}
            tile={tile}
            index={index}
            frame={frame}
            viewport={viewport}
            resolveProgress={resolveProgress}
          />
        ))}

        <Animated.Image
          source={menuImage}
          resizeMode="stretch"
          style={[
            styles.assembledMenu,
            {
              left: frame.left,
              top: frame.top,
              width: frame.width,
              height: frame.height,
            },
            assembledStyle,
          ]}
        />
      </Animated.View>
      <Animated.View style={[styles.flash, flashStyle]} />
    </Animated.View>
  );
}

function TileFlight({
  tile,
  index,
  frame,
  viewport,
  resolveProgress,
}: TileFlightProps) {
  const progress = useSharedValue(0);
  const launchOpacity = useSharedValue(0);
  const delay =
    MENU_INTRO_CONFIG.introLeadMs +
    index * MENU_INTRO_CONFIG.tileStaggerMs;
  const duration = MENU_INTRO_CONFIG.tileDurationMs;
  const tileLeft = frame.left + tile.left * frame.width;
  const tileTop = frame.top + tile.top * frame.height;
  const tileWidth = tile.width * frame.width;
  const tileHeight = tile.height * frame.height;

  const hand = PLAYER_HANDS[index % PLAYER_HANDS.length];
  const tableFrame = getTableFrame(viewport.width, viewport.height);
  const handX = tableFrame.left + hand.x * tableFrame.width;
  const handY = tableFrame.top + hand.y * tableFrame.height;
  const startX = handX;
  const startY = handY;
  const endX = tileLeft + tileWidth / 2;
  const endY = tileTop + tileHeight / 2;
  const scatterX =
    (((index * 7) % 11) / 5 - 1) *
    MENU_INTRO_CONFIG.landingSpreadXRatio *
    frame.width;
  const scatterY =
    (((index * 5) % 13) / 6 - 1) *
    MENU_INTRO_CONFIG.landingSpreadYRatio *
    frame.height;
  const landingX = endX + scatterX;
  const landingY = endY + scatterY;
  const directionX = landingX - startX;
  const directionY = landingY - startY;
  const distance =
    Math.sqrt(directionX * directionX + directionY * directionY) || 1;
  const arc =
    (index % 2 === 0 ? -1 : 1) *
    Math.min(
      distance * MENU_INTRO_CONFIG.arcDistanceRatio,
      MENU_INTRO_CONFIG.maxArcPixels,
    );
  const controlX = (startX + landingX) / 2 - (directionY / distance) * arc;
  const controlY = (startY + landingY) / 2 + (directionX / distance) * arc;
  const startScaleX = Math.min(
    5,
    MENU_INTRO_CONFIG.startingCardWidth / Math.max(tileWidth, 1),
  );
  const startScaleY = Math.min(
    5,
    MENU_INTRO_CONFIG.startingCardHeight / Math.max(tileHeight, 1),
  );
  const startingRotation =
    index % 2 === 0
      ? -MENU_INTRO_CONFIG.startingRotationDegrees
      : MENU_INTRO_CONFIG.startingRotationDegrees;
  const landingRotation = LANDING_ANGLES[index % LANDING_ANGLES.length];

  useEffect(() => {
    launchOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 90, easing: Easing.out(Easing.quad) }),
    );
    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      }),
    );

    return () => {
      cancelAnimation(progress);
      cancelAnimation(launchOpacity);
    };
  }, [delay, duration, launchOpacity, progress]);

  const flightStyle = useAnimatedStyle(() => {
    const value = progress.value;
    const inverse = 1 - value;
    const x =
      inverse * inverse * startX +
      2 * inverse * value * controlX +
      value * value * landingX;
    const y =
      inverse * inverse * startY +
      2 * inverse * value * controlY +
      value * value * landingY;
    const settle = resolveProgress.value;
    const rotation =
      (startingRotation * inverse + landingRotation * value) * (1 - settle);

    return {
      transform: [
        { translateX: x - endX - scatterX * settle },
        { translateY: y - endY - scatterY * settle },
        { rotate: `${rotation}deg` },
        { scaleX: startScaleX + (1 - startScaleX) * value },
        { scaleY: startScaleY + (1 - startScaleY) * value },
      ],
    };
  });
  const cardEdgeStyle = useAnimatedStyle(() => ({
    opacity: 1 - resolveProgress.value,
  }));
  const launchStyle = useAnimatedStyle(() => ({
    opacity: launchOpacity.value,
  }));
  const fragmentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, MENU_INTRO_CONFIG.revealFragmentFrom, MENU_INTRO_CONFIG.revealFragmentComplete],
      [0, 0, 1],
      Extrapolation.CLAMP,
    ),
  }));
  return (
    <Animated.View
      style={[
        styles.tile,
        {
          left: tileLeft,
          top: tileTop,
          width: tileWidth,
          height: tileHeight,
        },
        flightStyle,
        launchStyle,
      ]}
    >
      <View style={styles.crop}>
        <Animated.Image
          source={menuImage}
          resizeMode="stretch"
          style={[
            {
              position: 'absolute',
              width: frame.width,
              height: frame.height,
              left: -tile.left * frame.width,
              top: -tile.top * frame.height,
            },
            fragmentStyle,
          ]}
        />
      </View>
      <Animated.View style={[styles.cardEdge, cardEdgeStyle]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#050505',
  },
  camera: {
    position: 'absolute',
    left: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tile: {
    position: 'absolute',
    overflow: 'visible',
    zIndex: 2,
  },
  assembledMenu: {
    position: 'absolute',
    zIndex: 3,
  },
  crop: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  cardEdge: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 0.5,
    borderColor: '#FFFFFF',
    borderRadius: 1,
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
  },
});
