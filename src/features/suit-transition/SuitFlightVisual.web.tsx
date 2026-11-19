import { useCallback, useLayoutEffect, useRef } from 'react';
import { useAnimatedReaction } from 'react-native-reanimated';
import type { SuitFlightVisualProps } from './GlyphSuitFlight';
import { COIN_SIZE, SUIT_REVERSE_COLOR, suitGlyph, type SuitPose } from './motion';

// A coin has a visible edge even when it faces sideways. Avoid collapsing
// a viewport-sized glyph into a single diagonal at a quarter turn.
const EDGE_ON_WIDTH = 0.18;

export default function SuitFlightVisual({ suit, width, height, closeScale, pose }: SuitFlightVisualProps) {
  const glyph = useRef<SVGTextElement>(null);

  const paint = useCallback((frame: SuitPose) => {
    const text = glyph.current;
    if (!text) return;

    // Draw the original glyph at its final pixel size. Project the coin's
    // vertical turn by narrowing it in its own plane before applying the tilt.
    const pitch = frame.pitch * Math.PI / 180;
    const turn = Math.hypot(Math.cos(pitch), EDGE_ON_WIDTH * Math.sin(pitch));
    const roll = frame.roll * Math.PI / 180;
    const cos = Math.cos(roll), sin = Math.sin(roll);
    text.setAttribute('transform', `matrix(${turn * cos} ${turn * sin} ${-sin} ${cos} ${frame.x} ${frame.y})`);
    text.setAttribute('font-size', String(COIN_SIZE * frame.scale));
    text.setAttribute('fill', frame.front ? '#fff' : SUIT_REVERSE_COLOR);
    // Keep the dark face readable on black. Its edge merges into the cover
    // at the apex, where the route changes.
    const edge = frame.front ? 0 : Math.min(frame.scale, 1.5) * (1 - frame.scale / closeScale);
    text.setAttribute('stroke-width', String(Math.max(0, edge)));
  }, [closeScale]);

  useLayoutEffect(() => paint(pose.value), [paint, pose]);
  useAnimatedReaction(() => pose.value, (frame) => paint(frame), [paint]);

  return (
    <svg
      data-suit-vector
      aria-hidden="true"
      width={width}
      height={height}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <text
        ref={glyph}
        fontFamily={'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif'}
        textAnchor="middle"
        dominantBaseline="central"
        stroke="#77777d"
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        {suitGlyph(suit)}
      </text>
    </svg>
  );
}
