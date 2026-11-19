export const MENU_IMAGE_ASPECT = 941 / 1672;

export const MENU_INTRO_CONFIG = {
  tileDurationMs: 720,
  tileStaggerMs: 110,
  cameraDurationMs: 4400,
  resolveDurationMs: 620,
  introFadeDurationMs: 650,
  introLeadMs: 480,
  tableMenuHeightRatio: 0.25,
  revealFragmentFrom: 0.58,
  revealFragmentComplete: 0.9,
  arcDistanceRatio: 0.14,
  maxArcPixels: 76,
  landingSpreadXRatio: 0.13,
  landingSpreadYRatio: 0.085,
  startingCardWidth: 48,
  startingCardHeight: 64,
  startingRotationDegrees: 9,
  skipAnimationForTests:
    process.env.NODE_ENV === 'test' ||
    process.env.EXPO_PUBLIC_SKIP_MENU_INTRO === '1',
} as const;

export const PLAYER_HANDS = [
  { x: 0.5, y: 0.31 },
  { x: 0.29, y: 0.64 },
  { x: 0.71, y: 0.64 },
] as const;

const COLUMN_BOUNDS = [0, 0.23, 0.49, 0.75, 1];
const ROW_BOUNDS = [0, 0.12, 0.27, 0.41, 0.57, 0.71, 0.86, 1];

export type MenuTile = {
  id: string;
  column: number;
  row: number;
  left: number;
  top: number;
  width: number;
  height: number;
};

export const MENU_TILES: MenuTile[] = ROW_BOUNDS.slice(0, -1).flatMap(
  (top, row) =>
    COLUMN_BOUNDS.slice(0, -1).map((left, column) => ({
      id: `${row}-${column}`,
      column,
      row,
      left,
      top,
      width: COLUMN_BOUNDS[column + 1] - left,
      height: ROW_BOUNDS[row + 1] - top,
    })),
);

export const MENU_INTRO_DURATION_MS =
  (MENU_TILES.length - 1) * MENU_INTRO_CONFIG.tileStaggerMs +
  MENU_INTRO_CONFIG.tileDurationMs;

export function getCoverFrame(
  viewportWidth: number,
  viewportHeight: number,
  aspect: number,
) {
  const width = Math.max(Math.min(viewportWidth, viewportHeight * 0.68), viewportHeight * aspect);
  const height = width / aspect;

  return {
    left: (viewportWidth - width) / 2,
    top: (viewportHeight - height) / 2,
    width,
    height,
  };
}

export function getTableFrame(viewportWidth: number, viewportHeight: number) {
  const size = Math.min(viewportWidth, viewportHeight);

  return {
    left: (viewportWidth - size) / 2,
    top: (viewportHeight - size) / 2,
    width: size,
    height: size,
  };
}

export function getMenuFrameOnTable(
  viewportWidth: number,
  viewportHeight: number,
  aspect: number,
) {
  const table = getTableFrame(viewportWidth, viewportHeight);
  const height = table.height * MENU_INTRO_CONFIG.tableMenuHeightRatio;
  const width = height * aspect;

  return {
    left: table.left + (table.width - width) / 2,
    top: table.top + (table.height - height) / 2,
    width,
    height,
  };
}

