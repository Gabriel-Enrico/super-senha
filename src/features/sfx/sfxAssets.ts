// The short WAV cues use the original recordings, with leading silence removed
// and, for the card flight, only the first throw retained.
export const sfxAssets = {
  cards: require('../../../assets/sfx/trowingcards-launch.wav'),
  introTransition: require('../../../assets/sfx/newIntroSound-reveal.wav'),
  click: require('../../../assets/sfx/general_button_click.wav'),
  hover: require('../../../assets/sfx/general_hover_sound.wav'),
  up: require('../../../assets/sfx/Up.mp3'),
  down: require('../../../assets/sfx/down.mp3'),
  secondary: require('../../../assets/sfx/secondbuttonclick.wav'),
  // Two contiguous sections of matchCountdown.mp3, split at the start of play.
  countdown: require('../../../assets/sfx/matchCountdown-ready.wav'),
  countdownGo: require('../../../assets/sfx/matchCountdown-go.wav'),
  roundWin: require('../../../assets/sfx/roundWin.mp3'),
  matchWin: require('../../../assets/sfx/Win.mp3'),
};

export type SfxName = keyof typeof sfxAssets;
export const sfxNames = Object.keys(sfxAssets) as SfxName[];
