import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { sfxAssets, sfxNames, type SfxName } from './sfxAssets';

const players = new Map<SfxName, AudioPlayer>();
const started = new Set<SfxName>();

function getPlayer(name: SfxName) {
  let player = players.get(name);
  if (!player) {
    player = createAudioPlayer(sfxAssets[name]);
    players.set(name, player);
  }
  return player;
}

export function preparePlayback() {
  void setAudioModeAsync({ interruptionMode: 'mixWithOthers' }).catch(() => {});
  for (const name of sfxNames) {
    try {
      getPlayer(name);
    } catch {
      // A failed asset can be retried when requested.
    }
  }
  return () => {
    for (const player of players.values()) player.remove();
    players.clear();
    started.clear();
  };
}

export function startPlayback(name: SfxName, volume: number) {
  const player = getPlayer(name);
  player.volume = volume;
  if (started.has(name)) void player.seekTo(0, 0, 0).catch(() => {});
  player.play();
  started.add(name);
}

export function stopPlayback(name: SfxName) {
  players.get(name)?.pause();
}

export function updatePlaybackVolume(name: SfxName, volume: number) {
  const player = players.get(name);
  if (player) player.volume = volume;
}
