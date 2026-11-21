import { useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SfxPressable from '../sfx/SfxPressable';
import { useSuitAnchor } from '../suit-transition/SuitTransition';
import { useSuitNavigation } from '../suit-transition/suitRoutes';
import { suitGlyph, type Suit } from '../suit-transition/motion';
import { gameStyles, ink } from './gameTheme';

const textStyles = StyleSheet.create({
  title: { fontSize: 36, lineHeight: 39, letterSpacing: -0.75 },
  heading: { fontSize: 23, lineHeight: 26 },
  body: { fontSize: 17, lineHeight: 22 },
  detail: { fontSize: 15, lineHeight: 19, color: ink.muted },
  label: { fontSize: 14, lineHeight: 18, letterSpacing: 1.8, color: ink.muted },
});

export function PixelText({ children, kind = 'body', style }: {
  children: ReactNode;
  kind?: keyof typeof textStyles;
  style?: StyleProp<TextStyle>;
}) {
  return <Text selectable={false} style={[styles.pixel, textStyles[kind], style]}>{children}</Text>;
}

export function SuitIcon({ suit, id, size = 27, color = ink.white }: {
  suit: Suit; id: string; size?: number; color?: string;
}) {
  const anchor = useSuitAnchor(id);
  return (
    <View ref={anchor.ref} collapsable={false} pointerEvents="none" style={[
      styles.iconBox, { width: size, height: size, opacity: anchor.hidden ? 0 : 1 },
    ]}>
      <Text selectable={false} allowFontScaling={false} style={[styles.suit, { color, fontSize: size, lineHeight: size }]}>
        {suitGlyph(suit)}
      </Text>
    </View>
  );
}

export function MenuAction({ title, next, onPress, disabled = false }: {
  title: string;
  next?: Parameters<ReturnType<typeof useSuitNavigation>['go']>[0];
  onPress?: () => void;
  disabled?: boolean;
}) {
  const { go, suit, actionId } = useSuitNavigation();
  const [focused, setFocused] = useState(false);
  return (
    <View>
      <View pointerEvents="none" style={styles.actionOffset} />
      <SfxPressable
        accessibilityRole="button"
        accessibilityLabel={title}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onPress={next ? () => go(next, actionId) : onPress}
        style={({ pressed }) => [styles.action, focused && styles.actionFocus, disabled && styles.actionDisabled, pressed && styles.actionPressed]}
      >
        <SuitIcon suit={suit} id={actionId} color="#111" size={25} />
        <PixelText kind="heading" style={styles.actionText}>{title}</PixelText>
        <Text selectable={false} accessible={false} style={styles.arrow}>→</Text>
      </SfxPressable>
    </View>
  );
}

export function GameScreenLayout({ title, subtitle, children, footer, center, showBack = true }: {
  title: string; subtitle: string; children: ReactNode; footer?: ReactNode; center?: boolean; showBack?: boolean;
}) {
  const { back, backId, suit, route } = useSuitNavigation();
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.shell} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          {showBack ? (
            <SfxPressable
              accessibilityRole="button"
              accessibilityLabel={route === 'Iniciar' || route === 'Regras' || route === 'Configurações' ? 'Voltar ao menu' : 'Voltar'}
              onPress={() => back()}
              style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
            >
              <SuitIcon suit={suit} id={backId} />
              <Text selectable={false} accessible={false} style={styles.backArrow}>←</Text>
            </SfxPressable>
          ) : <View style={styles.backPlaceholder} />}
          <View style={styles.rule} />
          <View pointerEvents="none">
            <Text selectable={false} accessible={false} style={styles.headerSuit}>{suitGlyph(suit)}</Text>
          </View>
        </View>
        <ScrollView
          style={gameStyles.grow}
          contentContainerStyle={[styles.scroll, center && styles.scrollCenter]}
          keyboardShouldPersistTaps="handled"
        >
          <View accessibilityRole="header" style={styles.titleBlock}>
            <PixelText kind="title">{title}</PixelText>
            <PixelText kind="label">{subtitle}</PixelText>
          </View>
          {center ? <View style={styles.centerBody}>{children}</View> : children}
        </ScrollView>
        {footer && <View style={styles.footer}>{footer}</View>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function ProgressIndicator({ value, total, label }: { value: number; total: number; label: string }) {
  return (
    <View accessible accessibilityLabel={label} style={styles.progress}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.step, i < value && styles.filledStep]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pixel: { fontFamily: 'Pixelify', color: ink.text, includeFontPadding: false },
  safe: { flex: 1, backgroundColor: ink.background },
  shell: { flex: 1, width: '100%', maxWidth: 550, alignSelf: 'center' },
  header: { paddingHorizontal: 22, paddingTop: 10, flexDirection: 'row', alignItems: 'center', gap: 13 },
  back: {
    minHeight: 46, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 10, backgroundColor: ink.panel, borderColor: ink.line, borderWidth: 1,
  },
  backPressed: { borderColor: ink.white },
  backPlaceholder: { width: 54, height: 46 },
  backArrow: { color: ink.white, fontSize: 19 },
  rule: { height: 1, backgroundColor: ink.line, flex: 1 },
  headerSuit: { fontSize: 28, color: ink.muted },
  iconBox: { alignItems: 'center', justifyContent: 'center' },
  suit: { includeFontPadding: false, textAlign: 'center' },
  scroll: { paddingTop: 18, paddingBottom: 18, paddingHorizontal: 22, gap: 18 },
  scrollCenter: { flexGrow: 1 },
  titleBlock: { gap: 6 },
  centerBody: { flexGrow: 1, justifyContent: 'center', paddingVertical: 12 },
  footer: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 18, gap: 13 },
  actionOffset: {
    ...StyleSheet.absoluteFillObject, top: 5, left: 2,
    borderColor: '#67666c', borderWidth: 1, backgroundColor: ink.panel,
    transform: [{ skewX: '-7deg' }, { rotate: '-1.6deg' }],
  },
  action: {
    minHeight: 51, backgroundColor: ink.white, borderColor: ink.white, borderWidth: 2,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 10,
    transform: [{ skewX: '-7deg' }],
  },
  actionFocus: { borderColor: '#67666c' },
  actionDisabled: { opacity: 0.4 },
  actionPressed: { transform: [{ skewX: '-7deg' }, { scale: 0.98 }] },
  actionText: { flex: 1, textAlign: 'center', color: '#111', transform: [{ skewX: '7deg' }] },
  arrow: { color: '#111', fontSize: 21 },
  progress: { flexDirection: 'row', justifyContent: 'center', gap: 7 },
  step: { height: 7, width: 28, borderWidth: 1, borderColor: ink.line, transform: [{ skewX: '-14deg' }] },
  filledStep: { borderColor: ink.white, backgroundColor: ink.white },
});
