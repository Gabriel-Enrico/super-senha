import { Asset } from 'expo-asset';
import { sfxAssets, sfxNames, type SfxName } from './sfxAssets';

type Playback = { gain: GainNode; source?: AudioBufferSourceNode };

let context: AudioContext | undefined;
let unlocking: Promise<void> | undefined;
const buffers = new Map<SfxName, AudioBuffer>();
const loading = new Map<SfxName, Promise<void>>();
const active = new Map<SfxName, Playback>();

function loadBuffer(audio: AudioContext, name: SfxName) {
  const pending = loading.get(name);
  if (pending) return pending;

  const request = Promise.resolve()
    .then(() => fetch(Asset.fromModule(sfxAssets[name]).uri))
    .then((response) => {
      if (!response.ok) throw new Error(`SFX HTTP ${response.status}`);
      return response.arrayBuffer();
    })
    .then((bytes) => audio.decodeAudioData(bytes))
    .then((buffer) => {
      if (context === audio) buffers.set(name, buffer);
    })
    .catch(() => {})
    .finally(() => {
      if (loading.get(name) === request) loading.delete(name);
    });
  loading.set(name, request);
  return request;
}

export function preparePlayback() {
  if (typeof window === 'undefined' || typeof AudioContext === 'undefined') return () => {};
  let audio: AudioContext;
  try {
    audio = new AudioContext();
  } catch {
    return () => {};
  }
  context = audio;
  for (const name of sfxNames) void loadBuffer(audio, name);

  const unlock = (event: Event) => {
    if (!event.isTrusted || audio.state === 'running' || unlocking) return;
    unlocking = audio.resume().catch(() => {}).finally(() => {
      if (context === audio) unlocking = undefined;
    });
  };
  const gestures = ['pointerdown', 'pointerup', 'keydown'] as const;
  for (const gesture of gestures) window.addEventListener(gesture, unlock, true);

  return () => {
    for (const gesture of gestures) window.removeEventListener(gesture, unlock, true);
    for (const name of active.keys()) stopPlayback(name);
    context = undefined;
    unlocking = undefined;
    buffers.clear();
    loading.clear();
    void audio.close().catch(() => {});
  };
}

export function startPlayback(name: SfxName, volume: number) {
  const audio = context;
  if (!audio || (audio.state !== 'running' && !unlocking)) return;

  stopPlayback(name);
  const playback: Playback = { gain: audio.createGain() };
  playback.gain.gain.value = volume;
  active.set(name, playback);

  const start = () => {
    const buffer = buffers.get(name);
    if (active.get(name) !== playback) return;
    if (!buffer || audio.state !== 'running') {
      stopPlayback(name);
      return;
    }
    const source = audio.createBufferSource();
    playback.source = source;
    source.buffer = buffer;
    source.connect(playback.gain).connect(audio.destination);
    source.onended = () => {
      source.disconnect();
      playback.gain.disconnect();
      if (active.get(name) === playback) active.delete(name);
    };
    source.start();
  };
  if (audio.state === 'running' && buffers.has(name)) {
    start();
  } else {
    void Promise.all([unlocking, buffers.has(name) ? undefined : loadBuffer(audio, name)])
      .then(start)
      .catch(() => {
        if (active.get(name) === playback) stopPlayback(name);
      });
  }
}

export function stopPlayback(name: SfxName) {
  const playback = active.get(name);
  active.delete(name);
  if (!playback) return;
  if (playback.source) {
    playback.source.onended = null;
    playback.source.stop();
    playback.source.disconnect();
  }
  playback.gain.disconnect();
}

export function updatePlaybackVolume(name: SfxName, volume: number) {
  const playback = active.get(name);
  if (playback) playback.gain.gain.value = volume;
}
