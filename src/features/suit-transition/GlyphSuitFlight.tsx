import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { COIN_SIZE, PERSPECTIVE, suitGlyph, type Suit, type SuitPose } from './motion';

export type SuitFlightVisualProps = {
  suit: Suit;
  width: number;
  height: number;
  closeScale: number;
  pose: SharedValue<SuitPose>;
};

export default function GlyphSuitFlight({ suit, closeScale, pose }: SuitFlightVisualProps) {
  const renderSize = COIN_SIZE * closeScale;
  const faceSize = { fontSize: renderSize, lineHeight: renderSize };

  const movement = useAnimatedStyle(() => {
    const { x, y, scale, pitch, roll } = pose.value;
    return {
      transform: [
        { translateX: x - renderSize / 2 },
        { translateY: y - renderSize / 2 },
        { scale: scale / closeScale },
        { rotateZ: `${roll}deg` },
        { perspective: PERSPECTIVE * closeScale },
        { rotateY: `${pitch}deg` },
      ],
    };
  });
  const face = useAnimatedStyle(() => ({ opacity: pose.value.front ? 1 : 0 }));
  const reverse = useAnimatedStyle(() => ({ opacity: pose.value.front ? 0 : 1 }));

  return (
    <Animated.View style={[styles.coin, { width: renderSize, height: renderSize }, movement]}>
      <Animated.View style={[styles.side, face]}>
        <Text allowFontScaling={false} style={[styles.glyph, faceSize, styles.white]}>{suitGlyph(suit)}</Text>
      </Animated.View>
      <Animated.View style={[styles.side, reverse, styles.reverse]}>
        <Text allowFontScaling={false} style={[
          styles.glyph,
          faceSize,
          { color: '#111114', textShadowColor: '#77777d', textShadowRadius: 2 * closeScale },
        ]}>
          {suitGlyph(suit)}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  coin: { position: 'absolute', left: 0, top: 0 },
  side: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  reverse: { transform: [{ rotateY: '180deg' }] },
  glyph: { includeFontPadding: false },
  white: { color: '#fff' },
});
