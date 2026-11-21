import { Platform, Pressable, type PressableProps } from 'react-native';
import { playSfx } from './sfx';

export type ClickSound = 'click' | 'secondary';

const nativeHoverEvents = new WeakSet<object>();

export default function SfxPressable({
  sound = 'click',
  accessibilityRole = 'button',
  disabled,
  onPress,
  onPointerEnter,
  ...props
}: PressableProps & { sound?: ClickSound | false }) {
  const interactive = Boolean(onPress || props.onLongPress);
  const inactive = disabled || props['aria-disabled'] || props.accessibilityState?.disabled;
  const webHover = Platform.OS === 'web' && interactive
    ? { dataSet: { sfxHover: inactive ? 'disabled' : 'enabled' } }
    : undefined;
  return (
    <Pressable
      {...props}
      {...webHover}
      accessibilityRole={accessibilityRole}
      disabled={disabled}
      onPointerEnter={Platform.OS === 'web' ? onPointerEnter : (event) => {
        const pointer = event.nativeEvent;
        if (interactive && !inactive && pointer.pointerType === 'mouse' && !nativeHoverEvents.has(pointer)) {
          nativeHoverEvents.add(pointer);
          playSfx('hover');
        }
        onPointerEnter?.(event);
      }}
      onPress={onPress ? (event) => {
        if (disabled) return;
        if (sound) playSfx(sound);
        onPress(event);
      } : undefined}
    />
  );
}
