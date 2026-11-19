import { Pressable, StyleSheet, View } from 'react-native';
import { GameScreenLayout, MenuAction, PixelText } from '../features/game-setup/GameUI';
import { CATEGORIES, useGameSetup } from '../features/game-setup/gameSetup';
import { gameStyles, ink } from '../features/game-setup/gameTheme';

export default function CategoriesScreen() {
  const { setup, update } = useGameSetup();

  return (
    <GameScreenLayout title="Categorias" subtitle="ESCOLHA UM TEMA"
      footer={<MenuAction title="Continuar" next="Ajustes da partida" />}>
      <View accessibilityRole="radiogroup" style={gameStyles.stack}>
        {CATEGORIES.map((category) => {
          const selected = setup.category === category.id;
          return (
            <Pressable
              key={category.id}
              accessibilityRole="radio"
              accessibilityLabel={category.available ? category.label : `${category.label}, indisponível`}
              aria-checked={selected}
              disabled={!category.available}
              onPress={() => update({ category: category.id })}
              style={[gameStyles.choice, selected && gameStyles.selected]}
            >
              <View style={[styles.marker, selected && styles.markerOn]}>
                <PixelText style={{ color: selected ? '#111' : ink.dim }}>{selected ? '◆' : category.available ? '◇' : '×'}</PixelText>
              </View>
              <View style={gameStyles.grow}>
                <PixelText kind="heading" style={!category.available && styles.unavailable}>{category.label}</PixelText>
                <PixelText kind="detail">{category.available ? category.description : 'Indisponível'}</PixelText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </GameScreenLayout>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 28, height: 28, borderWidth: 1, borderColor: ink.line, alignItems: 'center', justifyContent: 'center',
    transform: [{ skewX: '-10deg' }],
  },
  markerOn: { backgroundColor: ink.white, borderColor: ink.white },
  unavailable: { color: ink.dim },
});
