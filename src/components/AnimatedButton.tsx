import { MotiView } from 'moti';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type AnimatedButtonProps = {
  title: string;
  onPress: () => void;
  // style?: StyleProp<ViewStyle>;
};

export default function AnimatedButton({
  title,
  onPress,
  // style,
}: AnimatedButtonProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <MotiView
        animate={{ scale: pressed ? 0.95 : 1 }}
        transition={{ type: 'timing', duration: 100 }}
        style={[styles.button]}
      >
        <Text style={styles.text}>{title}</Text>
      </MotiView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#F1FECB',
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignSelf: 'center',
    borderRadius: 12,
  },
  text: {
    color: '#000',
    textAlign: 'center',
    fontWeight: '600',
  },
});
