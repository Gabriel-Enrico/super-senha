import { Platform } from 'react-native';
import { playSfx } from './sfx';

const hoverControl = '[data-sfx-hover]';

function getControl(target: EventTarget | null) {
  return target instanceof Element ? target.closest(hoverControl) : null;
}

export function listenForHoverSfx() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  const enterControl = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    const control = getControl(event.target);
    if (!control || control === getControl(event.relatedTarget)) return;
    if (control.matches(':disabled, [aria-disabled="true"], [data-sfx-hover="disabled"]')) return;

    playSfx('hover');
  };

  document.addEventListener('pointerover', enterControl, true);
  return () => document.removeEventListener('pointerover', enterControl, true);
}
