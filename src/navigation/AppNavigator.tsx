  import { NavigationContainer } from '@react-navigation/native';
  import { createNativeStackNavigator } from '@react-navigation/native-stack';
  import { ActivityIndicator, View } from 'react-native';
  import Home from '../screens/Home';
  import PlayerCountScreen from '../screens/PlayerCountScreen';
  import CategoriesScreen from '../screens/CategoriesScreen';
  import GameSettingsScreen from '../screens/GameSettingsScreen';
  import RulesScreen from '../screens/RulesScreen';
  import ParticipantsScreen from '../screens/ParticipantsScreen';
  import TeamsScreen from '../screens/TeamsScreen';
  import TemaPersonalizado from '../screens/TemaPersonalizado';
  import GameRoundScreen from '../screens/GameRoundScreen';
  import AuthScreen from '../screens/AuthScreen';
  import SavedTopicsScreen from '../screens/SavedTopicsScreen';
  import { useAuth } from '../features/auth/AuthProvider';
  import { ink } from '../features/game-setup/gameTheme';
  import BaralhosScreen from '../screens/baralhoScreen';
  import PalavrasScreen from '../screens/palavrasScreen';

  export type RootStackParamList = {
    Acesso: undefined;
    Menu: undefined;
    Iniciar: undefined;
    Regras: undefined;
    'Configurações': undefined;
    Categorias: undefined;
    'Ajustes da partida': undefined;
    'Tema personalizado': undefined;
    'Meus temas': undefined;
    Baralhos: {
    temaId: string;
    tema: string;
  };
    Palavras: {
    baralhoId: number;
    baralhoNome: string;
    temaId: string;
    tema: string;
  };
    Participantes: undefined;
    Duplas: undefined;
    Partida: undefined;
  };

  const Stack = createNativeStackNavigator<RootStackParamList>();

  export default function AppNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
      return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: ink.background }}><ActivityIndicator color={ink.white} /></View>;
    }

    return (
      <NavigationContainer>
        <Stack.Navigator
          key={user?.uid ?? 'signed-out'}
          initialRouteName={user ? 'Menu' : 'Acesso'}
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#050505' },
            animation: 'none',
          }}
        >
          {user ? (
            <>
              <Stack.Screen name="Menu" component={Home} />
              <Stack.Screen name="Iniciar" component={PlayerCountScreen} />
              <Stack.Screen name="Regras" component={RulesScreen} />
              <Stack.Screen name="Configurações" component={GameSettingsScreen} />
              <Stack.Screen name="Categorias" component={CategoriesScreen} />
              <Stack.Screen name="Ajustes da partida" component={GameSettingsScreen} />
              <Stack.Screen name="Tema personalizado" component={TemaPersonalizado} />
              <Stack.Screen name="Meus temas" component={SavedTopicsScreen} />
              <Stack.Screen name="Baralhos" component={BaralhosScreen} />
              <Stack.Screen name="Palavras" component={PalavrasScreen} />
              <Stack.Screen name="Participantes" component={ParticipantsScreen} />
              <Stack.Screen name="Duplas" component={TeamsScreen} />
              <Stack.Screen name="Partida" component={GameRoundScreen} options={{ gestureEnabled: false }} />
            </>
          ) : (
            <Stack.Screen name="Acesso" component={AuthScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
