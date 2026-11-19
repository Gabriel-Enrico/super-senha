import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { GameScreenLayout, MenuAction, PixelText } from '../features/game-setup/GameUI';
import { getWordsRequired, MODES, getPlayerName, useGameSetup } from '../features/game-setup/gameSetup';
import { gameStyles, ink } from '../features/game-setup/gameTheme';
import { useSuitNavigation } from '../features/suit-transition/suitRoutes';
import { buscarPalavrasDaCategoria } from '../services/categoriasService';

const TEAM_SUITS = ['♠', '♦', '♣', '♥'];

export default function TeamsScreen() {
  const { setup, update } = useGameSetup();
  const { route, back, actionId } = useSuitNavigation();
  const reviewing = route === 'Partida';
  const mode = MODES.find(({ id }) => id === setup.mode);
  const requiredWords = getWordsRequired(setup.mode);
  const tooFewWords = setup.words.length > 0 && setup.words.length < requiredWords;
  const [loadingWords, setLoadingWords] = useState(false);
  const [wordError, setWordError] = useState('');

  const loadWords = useCallback(async () => {
    if (!setup.category) {
      setWordError('Escolha uma categoria antes de montar a mesa.');
      return;
    }
    setLoadingWords(true);
    setWordError('');
    try {
      const words = await buscarPalavrasDaCategoria(setup.category);
      update({ words, wordSource: 'firestore', fallbackMessage: '' });
    } catch (error) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String(error.code)
          : '';
      setWordError(
        code === 'permission-denied'
          ? 'O Firebase não permitiu ler as palavras. Confira as regras do Firestore.'
          : error instanceof Error
            ? error.message
            : 'Não foi possível carregar as palavras do Firebase.',
      );
    } finally {
      setLoadingWords(false);
    }
  }, [setup.category, update]);

  useEffect(() => {
    if (setup.wordSource !== 'firestore') {
      setWordError('');
      return;
    }
    if (route === 'Duplas' && setup.words.length === 0) {
      void loadWords();
    }
  }, [loadWords, route, setup.wordSource, setup.words.length]);

  const categoryLabel = setup.wordSource === 'ia'
    ? `Tema: ${setup.topic}`
    : `Categoria: ${setup.category.replace(/[-_]/g, ' ')}`;

  return (
    <GameScreenLayout
      title={reviewing ? 'Mesa pronta' : 'Duplas'}
      subtitle={reviewing ? 'RESUMO DA PARTIDA' : 'CONFIRA A FORMAÇÃO'}
      footer={reviewing
        ? <MenuAction title="Voltar às duplas" onPress={() => back(actionId)} />
        : <MenuAction title="Preparar mesa" next="Partida" disabled={loadingWords || Boolean(wordError) || tooFewWords || setup.words.length === 0} />}
    >
      {reviewing && (
        <View style={gameStyles.section}>
          <View style={gameStyles.panel}>
            <PixelText kind="heading">{mode?.label} · {setup.seconds} s por carta</PixelText>
            <PixelText kind="detail">{categoryLabel} · {setup.players} jogadores</PixelText>
            <PixelText kind="detail">
              {setup.wordSource === 'ia' ? 'Palavras fornecidas pela IA' : 'Palavras carregadas do Firebase'}
            </PixelText>
          </View>
          {setup.fallbackMessage ? (
            <View style={gameStyles.panel}>
              <PixelText>{setup.fallbackMessage}</PixelText>
            </View>
          ) : null}
          {loadingWords ? (
            <View style={styles.status}><ActivityIndicator color={ink.white} /><PixelText>Carregando palavras…</PixelText></View>
          ) : wordError ? (
            <View style={gameStyles.panel}>
              <PixelText>{wordError}</PixelText>
              <Pressable accessibilityRole="button" onPress={() => void loadWords()}>
                <PixelText kind="heading">Tentar novamente</PixelText>
              </Pressable>
            </View>
          ) : setup.words.length > 0 ? (
            <View style={gameStyles.panel}>
              <PixelText kind="heading">Baralho pronto · {setup.words.length} palavras</PixelText>
              <PixelText kind="detail">A tela da rodada será conectada na próxima etapa.</PixelText>
              <PixelText>{setup.words.join(' · ')}</PixelText>
            </View>
          ) : null}
        </View>
      )}
      {!reviewing && loadingWords && (
        <View style={styles.status}><ActivityIndicator color={ink.white} /><PixelText>Carregando palavras do Firebase…</PixelText></View>
      )}
      {!reviewing && wordError ? (
        <View style={gameStyles.panel}>
          <PixelText>{wordError}</PixelText>
          <Pressable accessibilityRole="button" onPress={() => void loadWords()}>
            <PixelText kind="heading">Tentar novamente</PixelText>
          </Pressable>
        </View>
      ) : null}
      {!reviewing && tooFewWords ? (
        <View style={gameStyles.panel}>
          <PixelText>Esta categoria tem {setup.words.length} palavras, mas o modo {mode?.label} precisa de {requiredWords}. Escolha outra categoria.</PixelText>
        </View>
      ) : null}
      {!reviewing && setup.words.length > 0 ? (
        <View style={gameStyles.panel}>
          <PixelText kind="detail">
            {setup.wordSource === 'ia' ? `${setup.words.length} palavras geradas para “${setup.topic}”` : `Firebase carregado · ${setup.words.length} palavras`}
          </PixelText>
        </View>
      ) : null}
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
  status: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
});
