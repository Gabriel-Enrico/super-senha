export const MOTION = {
  idleMs: 12000,
  idleEaseInMs: 700,
  suitRiseMs: 680,
  suitLandMs: 740,
} as const;

export type Suit = '♠' | '♦' | '♣' | '♥';
export const COIN_SIZE = 64;
export const SUIT_REVERSE_COLOR = '#111114';
export const PERSPECTIVE = 360;

export type SuitPose = {
  x: number;
  y: number;
  scale: number;
  pitch: number;
  roll: number;
  front: boolean;
};

export function suitGlyph(suit: Suit) {
  return suit + '\uFE0E';
}
