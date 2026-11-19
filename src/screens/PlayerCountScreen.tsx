import { Pressable, StyleSheet, View } from 'react-native';
import { GameScreenLayout, MenuAction, PixelText, ProgressIndicator } from '../features/game-setup/GameUI';
import { useGameSetup } from '../features/game-setup/gameSetup';
import { gameStyles, ink } from '../features/game-setup/gameTheme';

export default function PlayerCountScreen() {
  const { setup: { players }, update } = useGameSetup();
  const pairs = players / 2;
  const pairLabel = pairs === 1 ? '1 dupla' : `${pairs} duplas`;

  return (
    <GameScreenLayout
      title="Número de jogadores"
      subtitle="SEMPRE EM DUPLAS"
      center
      footer={<MenuAction title="Continuar" next="Categorias" />}
    >
      <View style={gameStyles.center}>
        <View style={styles.controls}>
          <StepButton symbol="−" label="Diminuir jogadores" disabled={players <= 2}
            onPress={() => update({ players: Math.max(2, players - 2) })} />
          <View style={styles.number} accessibilityLiveRegion="polite">
            <View pointerEvents="none"><PixelText style={styles.count}>{players}</PixelText></View>
            <PixelText kind="detail">jogadores</PixelText>
          </View>
          <StepButton symbol="+" label="Aumentar jogadores" disabled={players >= 8}
            onPress={() => update({ players: Math.min(8, players + 2) })} />
        </View>
        <ProgressIndicator total={4} value={pairs} label={pairLabel} />
        <PixelText kind="label">{pairLabel.toUpperCase()}</PixelText>
      </View>
    </GameScreenLayout>
  );
}

function StepButton({ symbol, label, disabled, onPress }: {
  symbol: string; label: string; disabled: boolean; onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.step, disabled && styles.disabled, pressed && gameStyles.selected]}>
      <PixelText kind="heading">{symbol}</PixelText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, alignSelf: 'stretch' },
  step: {
    width: 52, height: 52, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: ink.line, backgroundColor: ink.panel, transform: [{ skewX: '-7deg' }],
  },
  disabled: { opacity: 0.43 },
  number: { minWidth: 98, alignItems: 'center' },
  count: { fontSize: 108, lineHeight: 107, color: ink.white },
});
