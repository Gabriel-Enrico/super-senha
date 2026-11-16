import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/Home';
import IniciarJogo from '../screens/IniciarJogo';
import Participantes from '../screens/Participantes';
import Duplas from '../screens/Duplas';
import TemaPersonalizado from '../screens/TemaPersonalizado';
import Categorias from '../screens/Categorias';
import DuracaoPartida from '../screens/DuracaoPartida';
import type { Dupla } from '../types';

type OrigemPalavras = 'firestore' | 'ia' | 'firestore-fallback';

type PreparacaoPartida = {
  duplas: Dupla[];
  categoriaId?: string;
  palavras?: string[];
  origem: OrigemPalavras;
  tema?: string;
  mensagemFallback?: string;
};

export type RootStackParamList = {
  Home: undefined;
  Iniciar: undefined;
  Categorias: { duplas: Dupla[] };
  Personalizado: { duplas: Dupla[] };
  Duracao: PreparacaoPartida;
  Participantes: {
    quantidadeJogadores: number;
  };
  Duplas: PreparacaoPartida & { duracaoPartida: 'rapida' | 'longa' };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Iniciar" component={IniciarJogo} />
      <Stack.Screen name="Categorias" component={Categorias} />
      <Stack.Screen name="Personalizado" component={TemaPersonalizado} />
      <Stack.Screen name="Participantes" component={Participantes} />
      <Stack.Screen name="Duracao" component={DuracaoPartida} />
      <Stack.Screen name="Duplas" component={Duplas} />
    </Stack.Navigator>
  );
}
