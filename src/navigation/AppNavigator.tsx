import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/Home';
import IniciarJogo from '../screens/IniciarJogo';
import Participantes from '../screens/Participantes';
import Duplas from '../screens/Duplas';
import type { Dupla } from '../types';

export type RootStackParamList = {
  Home: undefined;
  Iniciar: undefined;
  Participantes: {
    quantidadeJogadores: number;
  };
  Duplas: {
    duplas: Dupla[];
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Iniciar" component={IniciarJogo} />
      <Stack.Screen name="Participantes" component={Participantes} />
      <Stack.Screen name="Duplas" component={Duplas} />
    </Stack.Navigator>
  );
}
