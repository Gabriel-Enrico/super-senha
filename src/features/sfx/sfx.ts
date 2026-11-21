import { sfxNames, type SfxName } from './sfxAssets';
import { preparePlayback, startPlayback, stopPlayback, updatePlaybackVolume } from './sfxPlayback';

const settings: Record<SfxName, { volume: number; group?: 'interaction' }> = {
  cards: { volume: 0.34 },
  introTransition: { volume: 0.34 },
  click: { volume: 0.55, group: 'interaction' },
  hover: { volume: 0.26, group: 'interaction' },
  up: { volume: 0.55, group: 'interaction' },
  down: { volume: 0.55, group: 'interaction' },
  secondary: { volume: 0.55, group: 'interaction' },
  countdown: { volume: 0.42 },
  countdownGo: { volume: 0.42 },
  roundWin: { volume: 0.72 },
  matchWin: { volume: 0.55 },
};

let interaction: SfxName | undefined;
let masterVolume = 1;

export const preloadSfx = preparePlayback;

/** Values run from 0 (muted) to 1 (the default level). */
export function setSfxVolume(volume: number) {
  masterVolume = Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : masterVolume;
  for (const name of sfxNames) {
    try {
      updatePlaybackVolume(name, settings[name].volume * masterVolume);
    } catch {
      // Audio settings must not interrupt the game.
    }
  }
}

export function playSfx(name: SfxName) {
  if (masterVolume === 0) return;
  const { group, volume } = settings[name];
  if (group) {
    if (interaction && interaction !== name) stopSfx(interaction);
    interaction = name;
  }
  try {
    startPlayback(name, volume * masterVolume);
  } catch {
    // A missing audio device or invalid asset shouldn't block the event.
  }
}

export function stopSfx(name: SfxName) {
  if (interaction === name) interaction = undefined;
  try {
    stopPlayback(name);
  } catch {
    // The platform player may already have been released.
  }
}
