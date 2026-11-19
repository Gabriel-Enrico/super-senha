import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { GameScreenLayout, MenuAction, PixelText } from '../features/game-setup/GameUI';
import { useGameSetup } from '../features/game-setup/gameSetup';
import { gameStyles, ink } from '../features/game-setup/gameTheme';
import { useAuth } from '../features/auth/AuthProvider';
import { useSuitNavigation } from '../features/suit-transition/suitRoutes';
import { gerarPalavrasPorTema } from '../services/iaPalavrasService';
import { listarTemasSalvos, salvarTema, type TemaSalvo } from '../services/temasSalvosService';

export default function SavedTopicsScreen() {
  const { user } = useAuth();
  const { update } = useGameSetup();
  const { go, actionId } = useSuitNavigation();
  const [topics, setTopics] = useState<TemaSalvo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState('');
  const [message, setMessage] = useState('');

  const loadTopics = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setMessage('');
    try {
      setTopics(await listarTemasSalvos(user.uid));
    } catch {
      setMessage('Não consegui carregar seus temas. Confira as regras do Firestore e tente de novo.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { void loadTopics(); }, [loadTopics]);

  const playTopic = async (savedTopic: TemaSalvo) => {
    if (!user || activeId) return;
    setActiveId(savedTopic.id);
    setMessage('');
    try {
      const words = await gerarPalavrasPorTema(savedTopic.tema, savedTopic.palavrasUsadas);
      try {
        await salvarTema(user.uid, savedTopic.tema, words);
      } catch {
        // A rodada ainda pode começar mesmo se o registro não puder ser atualizado.
      }
      update({
        wordSource: 'ia',
        words,
        topic: savedTopic.tema,
        category: '',
        fallbackMessage: '',
      });
      go('Ajustes da partida', actionId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não consegui gerar palavras para esse tema.');
    } finally {
      setActiveId('');
    }
  };

  return (
    <GameScreenLayout
      title="Meus temas"
      subtitle="SUAS IDEIAS SALVAS"
      footer={<MenuAction title="Criar outro tema" next="Tema personalizado" />}
    >
      {loading ? <ActivityIndicator color={ink.white} /> : topics.length === 0 ? (
        <View style={gameStyles.panel}>
          <PixelText>Você ainda não salvou temas personalizados.</PixelText>
          {message ? <PixelText kind="detail">{message}</PixelText> : null}
        </View>
      ) : (
        <View style={gameStyles.stack}>
          {topics.map((savedTopic) => (
            <View key={savedTopic.id} style={gameStyles.panel}>
              <PixelText kind="heading">{savedTopic.tema}</PixelText>
              <Pressable
                accessibilityRole="button"
                disabled={Boolean(activeId)}
                onPress={() => void playTopic(savedTopic)}
                style={({ pressed }) => [styles.playButton, pressed && gameStyles.selected, Boolean(activeId) && styles.disabled]}
              >
                {activeId === savedTopic.id
                  ? <ActivityIndicator color={ink.white} />
                  : <PixelText kind="label" style={styles.playLabel}>GERAR PALAVRAS NOVAS E JOGAR</PixelText>}
              </Pressable>
            </View>
          ))}
        </View>
      )}
      {message && topics.length > 0 ? <View style={gameStyles.panel}><PixelText>{message}</PixelText></View> : null}
    </GameScreenLayout>
  );
}

const styles = StyleSheet.create({
  playButton: { minHeight: 44, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: ink.line, paddingHorizontal: 8 },
  playLabel: { color: ink.white, textAlign: 'center' },
  disabled: { opacity: 0.45 },
});
