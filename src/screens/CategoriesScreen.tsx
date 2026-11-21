import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GameScreenLayout, MenuAction, PixelText } from '../features/game-setup/GameUI';
import { useGameSetup } from '../features/game-setup/gameSetup';
import { gameStyles, ink } from '../features/game-setup/gameTheme';
import SfxPressable from '../features/sfx/SfxPressable';
import { useSuitNavigation } from '../features/suit-transition/suitRoutes';
import { listarCategorias, type Categoria } from '../services/categoriasService';

export default function CategoriesScreen() {
  const { setup, update } = useGameSetup();
  const { go, actionId } = useSuitNavigation();
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await listarCategorias();
      setCategories(result);
      const currentExists = result.some(({ id }) => id === setup.category);
      if (!currentExists && result[0]) {
        update({ category: result[0].id });
      }
    } catch {
      setError('Não foi possível carregar as categorias do Firebase.');
    } finally {
      setLoading(false);
    }
  }, [setup.category, update]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const chooseCategory = (category: string) => {
    update({
      category,
      wordSource: 'firestore',
      words: [],
      topic: '',
      fallbackMessage: '',
    });
  };

  const continueWithCategory = () => {
    update({
      wordSource: 'firestore',
      words: [],
      topic: '',
      fallbackMessage: '',
    });
    go('Ajustes da partida', actionId);
  };

  const canContinue = !loading && !error && Boolean(setup.category);

  return (
    <GameScreenLayout
      title="Categorias"
      subtitle="ESCOLHA UM TEMA"
      footer={
        <>
          <MenuAction title="Continuar" onPress={continueWithCategory} disabled={!canContinue} />
          <SfxPressable
            accessibilityRole="button"
            onPress={() => {
              update({ words: [], topic: '', fallbackMessage: '', wordSource: 'ia' });
              go('Tema personalizado', actionId);
            }}
            style={({ pressed }) => [styles.aiButton, pressed && gameStyles.selected]}
          >
            <PixelText kind="label" style={styles.aiLabel}>GERAR TEMA PERSONALIZADO COM IA</PixelText>
          </SfxPressable>
          <SfxPressable
            accessibilityRole="button"
            onPress={() => go('Meus temas', actionId)}
            style={({ pressed }) => [styles.aiButton, pressed && gameStyles.selected]}
          >
            <PixelText kind="label" style={styles.aiLabel}>JOGAR UM TEMA PERSONALIZADO SALVO</PixelText>
          </SfxPressable>
        </>
      }
    >
      {loading ? (
        <ActivityIndicator color={ink.white} />
      ) : error ? (
        <View style={gameStyles.panel}>
          <PixelText>{error}</PixelText>
          <SfxPressable sound="secondary" onPress={() => void loadCategories()}>
            <PixelText kind="heading">Tentar novamente</PixelText>
          </SfxPressable>
        </View>
      ) : categories.length === 0 ? (
        <PixelText>Nenhuma categoria foi encontrada no Firebase.</PixelText>
      ) : (
        <View accessibilityRole="radiogroup" style={gameStyles.stack}>
          {categories.map((category) => {
            const selected = setup.category === category.id;
            return (
              <SfxPressable
                key={category.id}
                sound="secondary"
                accessibilityRole="radio"
                accessibilityLabel={category.nome}
                aria-checked={selected}
                onPress={() => chooseCategory(category.id)}
                style={[gameStyles.choice, selected && gameStyles.selected]}
              >
                <View style={[styles.marker, selected && styles.markerOn]}>
                  <PixelText style={{ color: selected ? '#111' : ink.dim }}>
                    {selected ? '◆' : '◇'}
                  </PixelText>
                </View>
                <View style={gameStyles.grow}>
                  <PixelText kind="heading" style={styles.categoryName}>
                    {category.nome.replace(/[-_]/g, ' ')}
                  </PixelText>
                  <PixelText kind="detail">Palavras do Firebase</PixelText>
                </View>
              </SfxPressable>
            );
          })}
        </View>
      )}
    </GameScreenLayout>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: ink.line,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ skewX: '-10deg' }],
  },
  markerOn: { backgroundColor: ink.white, borderColor: ink.white },
  categoryName: { textTransform: 'capitalize' },
  aiButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: ink.line,
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  aiLabel: { color: ink.white, textAlign: 'center', letterSpacing: 1.2 },
});
