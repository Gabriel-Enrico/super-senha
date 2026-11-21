import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export const MODES = [
  { id: 'longo', label: 'Longo', description: 'Cards com 8, 7, 6 e 5 palavras.' },
  { id: 'padrao', label: 'Padrão', description: 'Cards com 8, 7 e 5 palavras.' },
  { id: 'rapido', label: 'Rápido', description: 'Cards com 8, 6 e 5 palavras.' },
  { id: 'duelo', label: 'Duelo', description: 'Cards com 6 e 5 palavras.' },
] as const;

export const TIMES = [60, 90, 120, 150, 180] as const;

export const CARD_SIZES = {
  longo: [8, 7, 6, 5],
  padrao: [8, 7, 5],
  rapido: [8, 6, 5],
  duelo: [6, 5],
} as const;

export function getCardSizes(mode: (typeof MODES)[number]['id']): number[] {
  return [...CARD_SIZES[mode]];
}

export function getWordsRequired(mode: (typeof MODES)[number]['id']): number {
  return getCardSizes(mode).reduce((total, size) => total + size, 0);
}

type Setup = {
  players: number;
  names: string[];
  mode: (typeof MODES)[number]['id'];
  seconds: (typeof TIMES)[number];
  category: string;
  wordSource: 'firestore' | 'ia' | 'firestore-fallback';
  words: string[];
  topic: string;
  fallbackMessage: string;
};

const SetupContext = createContext<{
  setup: Setup;
  update: (patch: Partial<Setup>) => void;
  setName: (index: number, name: string) => void;
} | null>(null);

export function GameSetupProvider({ children }: { children: ReactNode }) {
  const [setup, setSetup] = useState<Setup>({
    players: 2,
    names: Array<string>(8).fill(''),
    mode: 'padrao',
    seconds: 90,
    category: '',
    wordSource: 'firestore',
    words: [],
    topic: '',
    fallbackMessage: '',
  });

  const update = useCallback((patch: Partial<Setup>) => {
    setSetup((current) => ({ ...current, ...patch }));
  }, []);
  const setName = useCallback((index: number, name: string) => {
    setSetup((current) => ({
      ...current,
      names: current.names.map((value, position) => position === index ? name : value),
    }));
  }, []);
  const value = useMemo(() => ({ setup, update, setName }), [setup, update, setName]);

  return (
    <SetupContext.Provider value={value}>
      {children}
    </SetupContext.Provider>
  );
}

export function useGameSetup() {
  const value = useContext(SetupContext);
  if (!value) throw new Error('GameSetupProvider is missing');
  return value;
}

export function getPlayerName(names: string[], index: number) {
  return names[index]?.trim() || `Jogador ${index + 1}`;
}
