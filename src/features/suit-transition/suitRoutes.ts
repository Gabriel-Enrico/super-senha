import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import type { Suit } from './motion';
import { useSuitTransition } from './SuitTransition';

type RouteName = keyof RootStackParamList;

export function routeSuit(route: RouteName): Suit {
  if (route === 'Regras') return '♦';
  if (route === 'Configurações' || route === 'Ajustes da partida') return '♣';
  if (route === 'Meus temas') return '♥';
  return '♠';
}

export function backAnchor(route: RouteName, suit: Suit) {
  return route === 'Menu' ? `Menu:${suit}` : `${route}:back`;
}

export function useSuitNavigation() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { name: route } = useRoute<{ key: string; name: RouteName }>();
  const { run } = useSuitTransition();
  const suit = routeSuit(route);

  return {
    route,
    suit,
    backId: backAnchor(route, suit),
    actionId: `${route}:continue`,
    go: <T extends Exclude<RouteName, 'Menu'>>(
  to: T,
  from: string,
  params?: RootStackParamList[T]
) =>
  run({
    suit: routeSuit(to),
    from,
    to: backAnchor(to, routeSuit(to)),
    navigate: () => {
      if (to === 'Partida') {
        navigation.reset({ index: 0, routes: [{ name: 'Partida' }] });
        return;
      }

      navigation.navigate({
        name: to,
        params,
      } as never);
    },
  }),
    back: (source = backAnchor(route, suit)) => {
      const state = navigation.getState();
      const previous = state.routes[state.index - 1]?.name;
      if (!previous) return;
      run({
        suit,
        from: source,
        to: backAnchor(previous, suit),
        navigate: () => navigation.goBack(),
      });
    },
  };
}
