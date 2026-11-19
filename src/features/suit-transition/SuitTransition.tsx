import {
  createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState,
  type ReactNode, type RefObject,
} from 'react';
import { BackHandler, Keyboard, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  cancelAnimation, Easing, interpolate, useAnimatedStyle, useDerivedValue, useReducedMotion,
  useSharedValue, withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { COIN_SIZE, MOTION, SUIT_REVERSE_COLOR, type Suit, type SuitPose } from './motion';
import SuitFlightVisual from './SuitFlightVisual';

type Point = { x: number; y: number; size: number };
type Anchor = RefObject<View | null>;
type Request = { suit: Suit; from: string; to: string; navigate: () => void };
type Flight = { request: Request; start: Point; end?: Point };
type Transition = {
  run: (request: Request) => void;
  register: (id: string, ref: Anchor) => () => void;
  active: Request | null;
};

const TransitionContext = createContext<Transition | null>(null);

export function useSuitTransition() {
  const value = useContext(TransitionContext);
  if (!value) throw new Error('SuitTransitionProvider is missing');
  return value;
}

export function useSuitAnchor(id: string) {
  const ref = useRef<View>(null);
  const { register, active } = useSuitTransition();

  useLayoutEffect(() => register(id, ref), [id, register]);
  return { ref, hidden: active?.from === id || active?.to === id };
}

function measure(anchor?: Anchor): Promise<Point | undefined> {
  const view = anchor?.current;
  if (!view) return Promise.resolve(undefined);

  return new Promise((resolve) => {
    const deadline = setTimeout(() => resolve(undefined), 80);
    view.measureInWindow((x, y, width, height) => {
      clearTimeout(deadline);
      resolve(width > 0 && height > 0
        ? { x: x + width / 2, y: y + height / 2, size: height }
        : undefined);
    });
  });
}

export function SuitTransitionProvider({ children }: { children: ReactNode }) {
  const [flight, setFlight] = useState<Flight | null>(null);
  const locked = useRef(false);
  const anchors = useRef(new Map<string, Anchor>());
  const { width, height } = useWindowDimensions();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => locked.current);
    return () => subscription.remove();
  }, []);

  const register = useCallback((id: string, ref: Anchor) => {
    anchors.current.set(id, ref);
    return () => {
      if (anchors.current.get(id) === ref) anchors.current.delete(id);
    };
  }, []);

  const finish = useCallback(() => {
    locked.current = false;
    setFlight(null);
  }, []);

  const run = useCallback(async (request: Request) => {
    if (locked.current) return;
    if (reducedMotion) {
      Keyboard.dismiss();
      request.navigate();
      return;
    }

    locked.current = true;
    const start = await measure(anchors.current.get(request.from));
    setFlight({ request, start: start ?? { x: width / 2, y: height * 0.72, size: 28 } });
  }, [height, reducedMotion, width]);

  const changeScreen = useCallback(async (current: Flight) => {
    Keyboard.dismiss();
    current.request.navigate();

    // A native stack screen may need a few frames to mount and lay out its icon.
    let end: Point | undefined;
    for (let frame = 0; frame < 12 && !end; frame++) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      end = await measure(anchors.current.get(current.request.to));
    }
    setFlight({ ...current, end: end ?? { x: 42, y: 52, size: 27 } });
  }, []);

  return (
    <TransitionContext.Provider value={{ active: flight?.request ?? null, register, run }}>
      <View style={styles.root}>
        <View
          style={styles.root}
          pointerEvents={flight ? 'none' : 'auto'}
          aria-hidden={!!flight}
          accessibilityElementsHidden={!!flight}
          importantForAccessibility={flight ? 'no-hide-descendants' : 'auto'}
        >
          {children}
        </View>
        {flight && (
          <SuitFlight
            flight={flight}
            width={width}
            height={height}
            onCovered={changeScreen}
            onLanded={finish}
          />
        )}
      </View>
    </TransitionContext.Provider>
  );
}

function SuitFlight({
  flight, width, height, onCovered, onLanded,
}: {
  flight: Flight;
  width: number;
  height: number;
  onCovered: (flight: Flight) => void;
  onLanded: () => void;
}) {
  const progress = useSharedValue(0);
  const { start, end, request } = flight;
  const boardX = width / 2;
  const boardY = height * 0.32;
  const closeScale = Math.max(4, Math.hypot(width, height) / 38);
  const peakY = Math.min(start.y, boardY) - height * 0.23;

  const covered = useCallback(() => onCovered({ request, start }), [onCovered, request, start]);

  useEffect(() => {
    if (end) {
      progress.value = withTiming(2, { duration: MOTION.suitLandMs, easing: Easing.out(Easing.cubic) },
        (done) => { if (done) scheduleOnRN(onLanded); });
    } else {
      progress.value = withTiming(1, { duration: MOTION.suitRiseMs, easing: Easing.bezier(0.32, 0, 0.32, 1) },
        (done) => { if (done) scheduleOnRN(covered); });
    }
    return () => cancelAnimation(progress);
  }, [covered, end, onLanded, progress]);

  const backdrop = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.65, 0.98, 1.17, 1.61, 2], [0, 0, 1, 1, 0, 0]),
  }));

  const pose = useDerivedValue<SuitPose>(() => {
    const p = progress.value;
    let x = boardX;
    let y = boardY;
    let scale = closeScale;

    if (p < 1) {
      const inverse = 1 - p;
      x = inverse ** 2 * start.x + 2 * inverse * p * (start.x * 0.65 + boardX * 0.35) + p ** 2 * boardX;
      y = inverse ** 2 * start.y + 2 * inverse * p * peakY + p ** 2 * boardY;
      scale = interpolate(p, [0, 0.3, 0.62, 1], [start.size / COIN_SIZE, 0.85, 2.4, closeScale]);
    } else if (end) {
      const t = p - 1;
      x = interpolate(t, [0, 0.76, 1], [boardX, end.x, end.x]);
      y = interpolate(t, [0, 0.17, 0.71, 0.83, 0.93, 1],
        [boardY, Math.min(boardY, end.y) - height * 0.12, end.y - 15, end.y + 4, end.y - 3, end.y]);
      scale = interpolate(t, [0, 0.46, 0.83, 0.94, 1],
        [closeScale, 1.7, end.size / COIN_SIZE * 1.1, end.size / COIN_SIZE * 0.95, end.size / COIN_SIZE]);
    }

    const pitch = interpolate(p, [0, 1, 1.84, 2], [0, 900, 1800, 1800]);
    return { x, y, scale, pitch, roll: Math.sin(p * Math.PI) * 12, front: Math.cos(pitch * Math.PI / 180) >= 0 };
  });

  return (
    <View
      testID="suit-transition"
      style={styles.overlay}
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View style={[styles.veil, backdrop]} />
      <SuitFlightVisual suit={request.suit} width={width} height={height} closeScale={closeScale} pose={pose} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080809' },
  overlay: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', zIndex: 100 },
  veil: { ...StyleSheet.absoluteFillObject, backgroundColor: Platform.OS === 'web' ? SUIT_REVERSE_COLOR : '#39393d' },
});
