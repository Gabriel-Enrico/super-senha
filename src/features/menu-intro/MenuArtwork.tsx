import { useEffect, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import menuImage from '../../../assets/menu-super-senha-v3.png';
import { SuitIcon } from '../game-setup/GameUI';
import { MOTION, suitGlyph, type Suit } from '../suit-transition/motion';
import { backAnchor, routeSuit } from '../suit-transition/suitRoutes';

export type MenuButtonName =
  | 'Iniciar'
  | 'Meus temas'
  | 'Regras'
  | 'Configurações';

type Frame = { left: number; top: number; width: number; height: number };
type Rect = { x: number; y: number; width: number; height: number };
type FloatProfile = {
  horizontal: number;
  vertical: number;
  speed: number;
  phase: number;
  tilt: number;
};
type ButtonArtwork = {
  route: MenuButtonName;
  label: string;
  title: string;
  light: boolean;
  front: Rect;
  rear: Rect;
  frontFloat: FloatProfile;
  rearFloat: FloatProfile;
  fontRatio: number;
};

type Props = {
  frame: Frame;
  onNavigate: (route: MenuButtonName, source: string) => void;
};


const BUTTONS: ButtonArtwork[] = [
  {
    route: 'Iniciar',
    label: 'Iniciar jogo',
    title: 'Iniciar Jogo',
    light: true,
    front: { x: 0.169, y: 0.49, width: 0.69, height: 0.080 },
    rear: { x: 0.147, y: 0.479, width: 0.66, height: 0.088 },
    frontFloat: { horizontal: 4, vertical: 2.7, speed: 1.07, phase: 0.46, tilt: 0.17 },
    rearFloat: { horizontal: 3.1, vertical: 2.1, speed: 0.81, phase: 3.12, tilt: 0.24 },
    fontRatio: 0.060,
  },
  {
    route: 'Meus temas',
    label: 'Meus temas',
    title: 'Meus Temas',
    light: false,
    front: { x: 0.169, y: 0.595, width: 0.69, height: 0.073 },
    rear: { x: 0.147, y: 0.584, width: 0.66, height: 0.081 },
    frontFloat: { horizontal: 3.6, vertical: 3, speed: 0.93, phase: 2.08, tilt: 0.15 },
    rearFloat: { horizontal: 2.7, vertical: 2.5, speed: 1.23, phase: 4.81, tilt: 0.2 },
    fontRatio: 0.054,
  },
  {
    route: 'Regras',
    label: 'Regras',
    title: 'Regras',
    light: false,
    front: { x: 0.181, y: 0.695, width: 0.64, height: 0.070 },
    rear: { x: 0.19, y: 0.686, width: 0.61, height: 0.075 },
    frontFloat: { horizontal: 3.6, vertical: 3, speed: 0.93, phase: 2.08, tilt: 0.15 },
    rearFloat: { horizontal: 2.7, vertical: 2.5, speed: 1.23, phase: 4.81, tilt: 0.2 },
    fontRatio: 0.056,
  },
  {
    route: 'Configurações',
    label: 'Configurações',
    title: 'Configurações',
    light: false,
    front: { x: 0.171, y: 0.795, width: 0.658, height: 0.071 },
    rear: { x: 0.181, y: 0.784, width: 0.625, height: 0.075 },
    frontFloat: { horizontal: 3.8, vertical: 2.9, speed: 1.14, phase: 5.33, tilt: 0.18 },
    rearFloat: { horizontal: 3.3, vertical: 2.3, speed: 0.76, phase: 1.37, tilt: 0.26 },
    fontRatio: 0.050,
  },
];

const SERIF_FONT = Platform.select({
  web: 'Georgia, "Times New Roman", serif',
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
});

export default function MenuArtwork({ frame, onNavigate }: Props) {
  const elapsed = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  // An unwrapped clock avoids resetting the six independent oscillations.
  useFrameCallback(({ timeSinceFirstFrame }) => {
    elapsed.value = timeSinceFirstFrame;
  }, !reducedMotion);

  return (
    <View style={styles.artwork}>
      <ImageBand frame={frame} start={0} end={0.47} />
      <ImageBand frame={frame} start={0.895} end={1} />
      {BUTTONS.map((button) => (
        <FloatingMenuButton
          key={button.route}
          button={button}
          frame={frame}
          elapsed={elapsed}
          onNavigate={onNavigate}
        />
      ))}
    </View>
  );
}

function ImageBand({ frame, start, end }: { frame: Frame; start: number; end: number }) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.imageBand,
        {
          left: frame.left,
          top: frame.top + start * frame.height,
          width: frame.width,
          height: (end - start) * frame.height,
        },
      ]}
    >
      <Image
        source={menuImage}
        resizeMode="stretch"
        style={{
          position: 'absolute',
          left: 0,
          top: -start * frame.height,
          width: frame.width,
          height: frame.height,
        }}
      />
    </View>
  );
}

function FloatingMenuButton({
  button,
  frame,
  elapsed,
  onNavigate,
}: {
  button: ButtonArtwork;
  frame: Frame;
  elapsed: SharedValue<number>;
  onNavigate: Props['onNavigate'];
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);
  const scale = useSharedValue(1);
  const size = Math.max(0.75, Math.min(frame.width / 386, 1.65));
  const borderWidth = Math.max(2, frame.width * 0.008);

  useEffect(() => {
    scale.value = withTiming(pressed ? 1.025 : hovered || focused ? 1.055 : 1, {
      duration: pressed ? 110 : hovered || focused ? 210 : 240,
      easing: Easing.out(Easing.cubic),
    });
    return () => cancelAnimation(scale);
  }, [focused, hovered, pressed, scale]);

  const rearStyle = useAnimatedStyle(() => {
    const motion = getFloatingOffset(button.rearFloat, elapsed.value, size);
    return {
      transform: [
        { translateX: motion.x },
        { translateY: motion.y },
        { rotate: `${-4 + motion.tilt}deg` },
      ],
    };
  });

  const frontStyle = useAnimatedStyle(() => {
    const motion = getFloatingOffset(button.frontFloat, elapsed.value, size);
    return {
      transform: [
        { translateX: motion.x },
        { translateY: motion.y },
        { rotate: `${motion.tilt}deg` },
        { skewX: '-8deg' },
        { scale: scale.value },
      ],
    };
  });

  const textColor = button.light ? '#000' : '#fff';
  const suit: Suit = routeSuit(button.route);
  const suitId = backAnchor('Menu', suit);
  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.rearCard,
          position(frame, button.rear),
          { borderWidth, borderRadius: frame.width * 0.025 },
          rearStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.frontCard,
          position(frame, button.front),
          {
            backgroundColor: button.light ? '#fff' : '#000',
            borderColor: '#fff',
            borderWidth: button.light ? 0 : borderWidth,
            borderRadius: frame.width * 0.028,
          },
          frontStyle,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={button.label}
          onHoverIn={() => setHovered(true)}
          onHoverOut={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          onPress={() => onNavigate(button.route, suitId)}
          style={styles.pressable}
        >
          <View style={styles.content}>
            <SuitIcon suit={suit} id={suitId} color={textColor} size={frame.width * 0.068} />
            <Text
              selectable={false}
              numberOfLines={1}
              style={[
                styles.title,
                {
                  color: textColor,
                  fontFamily: SERIF_FONT,
                  fontSize: frame.width * button.fontRatio,
                },
              ]}
            >
              {button.title}
            </Text>
            <Text selectable={false} style={[styles.suit, { color: textColor, fontSize: frame.width * 0.068 }]}>
              {suitGlyph(suit)}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </>
  );
}

function getFloatingOffset(profile: FloatProfile, elapsed: number, size: number) {
  'worklet';
  const time = (elapsed / MOTION.idleMs) * Math.PI * 2 * profile.speed;
  const phase = profile.phase;
  const fade = 1 - (1 - Math.min(elapsed / MOTION.idleEaseInMs, 1)) ** 3;
  return {
    x: (0.82 * Math.sin(time + phase) + 0.18 * Math.sin(0.61 * time + 1.3 * phase))
      * profile.horizontal * size * fade,
    y: (0.78 * Math.cos(0.89 * time + phase) + 0.22 * Math.sin(1.17 * time + 0.7 * phase))
      * profile.vertical * size * fade,
    tilt: Math.sin(0.73 * time + phase + 0.8) * profile.tilt * fade,
  };
}

function position(frame: Frame, rect: Rect) {
  return {
    left: frame.left + rect.x * frame.width,
    top: frame.top + rect.y * frame.height,
    width: rect.width * frame.width,
    height: rect.height * frame.height,
  };
}

const styles = StyleSheet.create({
  artwork: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  imageBand: {
    position: 'absolute',
    overflow: 'hidden',
  },
  rearCard: {
    position: 'absolute',
    borderColor: '#fff',
    backgroundColor: '#000',
  },
  frontCard: {
    position: 'absolute',
    overflow: 'hidden',
  },
  pressable: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    transform: [{ skewX: '8deg' }],
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
  },
  suit: {
    fontWeight: 'bold',
    includeFontPadding: false,
  },
});
