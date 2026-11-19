import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// Covers the image-to-component swap, then reveals the interactive menu.
export default function MenuRevealFlash() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(0, {
      duration: 100,
      easing: Easing.out(Easing.quad),
    });
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.flash, animatedStyle]}
    />
  );
}

const styles = StyleSheet.create({
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
  },
});
