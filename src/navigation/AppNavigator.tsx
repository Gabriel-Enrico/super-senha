import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from '../screens/Home';
import PlayerCountScreen from '../screens/PlayerCountScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import GameSettingsScreen from '../screens/GameSettingsScreen';
import RulesScreen from '../screens/RulesScreen';
import ParticipantsScreen from '../screens/ParticipantsScreen';
import TeamsScreen from '../screens/TeamsScreen';

export type RootStackParamList = {
  Menu: undefined;
  Iniciar: undefined;
  Regras: undefined;
  'Configurações': undefined;
  Categorias: undefined;
  'Ajustes da partida': undefined;
  Participantes: undefined;
  Duplas: undefined;
  Partida: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Menu"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#050505' },
          animation: 'none',
        }}
      >
        <Stack.Screen name="Menu" component={Home} />
        <Stack.Screen name="Iniciar" component={PlayerCountScreen} />
        <Stack.Screen name="Regras" component={RulesScreen} />
        <Stack.Screen name="Configurações" component={GameSettingsScreen} />
        <Stack.Screen name="Categorias" component={CategoriesScreen} />
        <Stack.Screen name="Ajustes da partida" component={GameSettingsScreen} />
        <Stack.Screen name="Participantes" component={ParticipantsScreen} />
        <Stack.Screen name="Duplas" component={TeamsScreen} />
        <Stack.Screen name="Partida" component={TeamsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
