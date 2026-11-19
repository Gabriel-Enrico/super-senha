import { createContext, useContext, useState, type ReactNode } from 'react';

export const MODES = [
  { id: 'longo', label: 'Longo', description: 'Formato para uma sessão mais extensa.' },
  { id: 'padrao', label: 'Padrão', description: 'Formato principal para uma sessão em duplas.' },
  { id: 'rapido', label: 'Rápido', description: 'Formato para uma sessão mais curta.' },
  { id: 'duelo', label: 'Duelo', description: 'Formato para um confronto direto.' },
] as const;

export const TIMES = [60, 90, 120, 150, 180] as const;

export const CATEGORIES = [
  { id: 'livre', label: 'Livre', description: 'Palavras de assuntos variados', available: true },
  { id: 'basico', label: 'Básico', description: 'Objetos e situações do dia a dia', available: true },
  { id: 'geografia', label: 'Geografia', description: 'Lugares, países e paisagens', available: true },
  { id: 'filmes', label: 'Filmes e séries', description: 'Cinema e televisão', available: false },
  { id: 'futebol', label: 'Futebol', description: 'Times e termos do esporte', available: false },
  { id: 'musica', label: 'Música', description: 'Gêneros, artistas e instrumentos', available: false },
  { id: 'videogames', label: 'Videogames', description: 'Jogos, personagens e consoles', available: false },
] as const;

type Setup = {
  players: number;
  names: string[];
  mode: (typeof MODES)[number]['id'];
  seconds: (typeof TIMES)[number];
  category: (typeof CATEGORIES)[number]['id'];
};

const SetupContext = createContext<{
  setup: Setup;
  update: (patch: Partial<Setup>) => void;
  setName: (index: number, name: string) => void;
} | null>(null);

export function GameSetupProvider({ children }: { children: ReactNode }) {
  const [setup, setSetup] = useState<Setup>({
    players: 2, names: Array<string>(8).fill(''), mode: 'padrao', seconds: 90, category: 'livre',
  });

  return (
    <SetupContext.Provider value={{
      setup,
      update: (patch) => setSetup((current) => ({ ...current, ...patch })),
      setName: (index, name) => setSetup((current) => ({
        ...current,
        names: current.names.map((value, position) => position === index ? name : value),
      })),
    }}>
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
