import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GameScreenLayout, MenuAction, PixelText } from '../features/game-setup/GameUI';
import { MODES, TIMES, useGameSetup } from '../features/game-setup/gameSetup';
import { gameStyles, ink } from '../features/game-setup/gameTheme';
import SfxPressable from '../features/sfx/SfxPressable';
import { useSuitNavigation } from '../features/suit-transition/suitRoutes';

export default function GameSettingsScreen() {
  const { setup, update } = useGameSetup();
  const { route, back, actionId } = useSuitNavigation();
  const [openInfo, setOpenInfo] = useState<(typeof MODES)[number]['id'] | null>(null);
  const inSetup = route === 'Ajustes da partida';

  return (
    <GameScreenLayout
      title="Configurações"
      subtitle="TEMPO E MODO DA PARTIDA"
      footer={inSetup
        ? <MenuAction title="Continuar" next="Participantes" />
        : <MenuAction title="Continuar" onPress={() => back(actionId)} />}
    >
      <View style={gameStyles.section}>
        <PixelText kind="heading">Modo de jogo</PixelText>
        <View accessibilityRole="radiogroup" style={gameStyles.stack}>
          {MODES.map((mode) => {
            const selected = setup.mode === mode.id;
            const expanded = openInfo === mode.id;
            return (
              <View key={mode.id} style={[styles.mode, selected && gameStyles.selected]}>
                <View style={gameStyles.row}>
                  <SfxPressable sound="secondary" accessibilityRole="radio" accessibilityLabel={mode.label} aria-checked={selected}
                    onPress={() => update({ mode: mode.id })} style={styles.modeChoice}>
                    <View style={[styles.mark, selected && styles.markChecked]}>
                      <PixelText style={{ color: selected ? '#111' : ink.muted }}>{selected ? '◆' : '·'}</PixelText>
                    </View>
                    <PixelText kind="heading" style={gameStyles.grow}>{mode.label}</PixelText>
                  </SfxPressable>
                  <SfxPressable sound="secondary" accessibilityLabel={`Sobre o modo ${mode.label}`}
                    aria-expanded={expanded} style={styles.info}
                    onPress={() => setOpenInfo(expanded ? null : mode.id)}>
                    <PixelText style={styles.infoLabel}>i</PixelText>
                  </SfxPressable>
                </View>
                {expanded && <PixelText kind="detail" style={styles.description}>{mode.description}</PixelText>}
              </View>
            );
          })}
        </View>
      </View>
      <View style={gameStyles.section}>
        <PixelText kind="heading">Segundos por carta</PixelText>
        <View accessibilityRole="radiogroup" style={styles.times}>
          {TIMES.map((seconds) => {
            const selected = setup.seconds === seconds;
            return (
              <SfxPressable key={seconds} sound="secondary" accessibilityRole="radio" accessibilityLabel={`${seconds} segundos`}
                aria-checked={selected} onPress={() => update({ seconds })}
                style={[styles.time, selected && styles.timeSelected]}>
                <PixelText style={selected && styles.timeSelectedText}>{seconds}</PixelText>
              </SfxPressable>
            );
          })}
        </View>
      </View>
    </GameScreenLayout>
  );
}

const styles = StyleSheet.create({
  mode: { borderWidth: 1, borderColor: ink.line, backgroundColor: ink.panel, paddingRight: 5 },
  modeChoice: {
    ...gameStyles.row, flex: 1, minHeight: 49, paddingHorizontal: 9,
  },
  description: { paddingHorizontal: 12, paddingBottom: 10 },
  mark: {
    borderWidth: 1, borderColor: ink.line, width: 23, height: 25, alignItems: 'center', justifyContent: 'center',
  },
  markChecked: { backgroundColor: ink.white, borderColor: ink.white },
  info: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { color: ink.white, borderColor: ink.line, borderWidth: 1, minWidth: 19, textAlign: 'center' },
  times: { flexDirection: 'row', borderWidth: 1, borderColor: ink.line },
  time: { flex: 1, minHeight: 46, alignItems: 'center', justifyContent: 'center' },
  timeSelected: { backgroundColor: ink.white },
  timeSelectedText: { color: '#111' },
});
