import { StyleSheet, Text, View } from 'react-native';
import { GameScreenLayout, MenuAction, PixelText } from '../features/game-setup/GameUI';
import { CATEGORIES, MODES, getPlayerName, useGameSetup } from '../features/game-setup/gameSetup';
import { gameStyles, ink } from '../features/game-setup/gameTheme';
import { useSuitNavigation } from '../features/suit-transition/suitRoutes';

const TEAM_SUITS = ['♠', '♦', '♣', '♥'];

export default function TeamsScreen() {
  const { setup } = useGameSetup();
  const { route, back, actionId } = useSuitNavigation();
  const reviewing = route === 'Partida';
  const mode = MODES.find(({ id }) => id === setup.mode);
  const category = CATEGORIES.find(({ id }) => id === setup.category);

  return (
    <GameScreenLayout
      title={reviewing ? 'Mesa pronta' : 'Duplas'}
      subtitle={reviewing ? 'RESUMO DA PARTIDA' : 'CONFIRA A FORMAÇÃO'}
      footer={reviewing
        ? <MenuAction title="Voltar às duplas" onPress={() => back(actionId)} />
        : <MenuAction title="Preparar mesa" next="Partida" />}
    >
      {reviewing && (
        <View style={gameStyles.panel}>
          <PixelText kind="heading">{mode?.label} · {setup.seconds} s por carta</PixelText>
          <PixelText kind="detail">Categoria: {category?.label} · {setup.players} jogadores</PixelText>
          <PixelText kind="detail">As rodadas estarão disponíveis quando o baralho de palavras for integrado.</PixelText>
        </View>
      )}
      <View style={gameStyles.stack}>
        {Array.from({ length: setup.players / 2 }, (_, i) => (
          <View key={i} style={[gameStyles.panel, styles.team]}>
            <Text style={styles.suit}>{TEAM_SUITS[i]}</Text>
            <View style={gameStyles.grow}>
              <PixelText kind="label">DUPLA {i + 1}</PixelText>
              <PixelText>{getPlayerName(setup.names, i * 2)} e {getPlayerName(setup.names, i * 2 + 1)}</PixelText>
            </View>
          </View>
        ))}
      </View>
    </GameScreenLayout>
  );
}

const styles = StyleSheet.create({
  team: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  suit: { color: ink.white, fontSize: 30, lineHeight: 35 },
});
