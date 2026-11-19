import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { GameScreenLayout, MenuAction, PixelText } from '../features/game-setup/GameUI';
import { useGameSetup } from '../features/game-setup/gameSetup';
import { gameStyles, ink } from '../features/game-setup/gameTheme';
import { useAuth } from '../features/auth/AuthProvider';
import { useSuitNavigation } from '../features/suit-transition/suitRoutes';
import { buscarFallbackAleatorioDoFirebase } from '../services/categoriasService';
import { gerarPalavrasPorTema } from '../services/iaPalavrasService';
import { buscarPalavrasUsadas, salvarTema } from '../services/temasSalvosService';

export default function TemaPersonalizado() {
  const { user } = useAuth();
  const { update } = useGameSetup();
  const { go, actionId } = useSuitNavigation();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [fallbackReady, setFallbackReady] = useState(false);
  const [continueWithoutSave, setContinueWithoutSave] = useState(false);

  const continueToSettings = () => go('Ajustes da partida', actionId);

  const generate = async () => {
    const value = topic.trim();
    if (!value) {
      setMessage('Digite um tema para gerar as palavras.');
      return;
    }
    if (value.length > 60) {
      setMessage('O tema pode ter no máximo 60 caracteres.');
      return;
    }

    setLoading(true);
    setMessage('');
    setFallbackReady(false);
    setContinueWithoutSave(false);
    try {
      let previouslyUsed: string[] = [];
      if (user) {
        try {
          previouslyUsed = await buscarPalavrasUsadas(user.uid, value);
        } catch {
          // A geração continua mesmo que o histórico ainda não possa ser lido.
        }
      }
      const words = await gerarPalavrasPorTema(value, previouslyUsed);
      let saveWarning = '';
      try {
        if (!user) throw new Error('missing-user');
        await salvarTema(user.uid, value, words);
      } catch {
        saveWarning = 'Tema gerado, mas não consegui salvá-lo. Confira as regras do Firestore; você pode jogar sem salvar.';
      }
      update({
        wordSource: 'ia',
        words,
        topic: value,
        category: '',
        fallbackMessage: saveWarning,
      });
      if (saveWarning) {
        setContinueWithoutSave(true);
        setMessage(saveWarning);
        return;
      }
      continueToSettings();
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'A IA não respondeu.';
      try {
        const fallback = await buscarFallbackAleatorioDoFirebase();
        update({
          wordSource: 'firestore-fallback',
          words: fallback.palavras,
          topic: value,
          category: fallback.categoriaId,
          fallbackMessage: `${reason} Continuaremos com palavras do Firebase (${fallback.categoriaId}).`,
        });
        setFallbackReady(true);
        setMessage(`${reason} Você pode continuar com palavras do Firebase ou tentar outro tema.`);
      } catch {
        setMessage(`${reason} Também não foi possível carregar palavras do Firebase. Confira a conexão e tente novamente.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const changeTopic = (value: string) => {
    setTopic(value);
    setMessage('');
    setFallbackReady(false);
  };

  return (
    <GameScreenLayout
      title="Tema personalizado"
      subtitle="PALAVRAS GERADAS PELA IA"
      footer={
        continueWithoutSave ? (
          <MenuAction title="Continuar sem salvar" onPress={continueToSettings} />
        ) : fallbackReady ? (
          <>
            <MenuAction title="Continuar com Firebase" onPress={continueToSettings} />
            <Pressable
              accessibilityRole="button"
              disabled={loading}
              onPress={() => void generate()}
              style={({ pressed }) => [styles.secondary, pressed && gameStyles.selected]}
            >
              <PixelText kind="label" style={styles.secondaryText}>TENTAR A IA NOVAMENTE</PixelText>
            </Pressable>
          </>
        ) : (
          <>
            <MenuAction
              title={loading ? 'Gerando palavras…' : 'Gerar palavras'}
              onPress={() => void generate()}
              disabled={loading}
            />
            <Pressable
              accessibilityRole="button"
              disabled={loading}
              onPress={() => go('Meus temas', actionId)}
              style={({ pressed }) => [styles.secondary, pressed && gameStyles.selected]}
            >
              <PixelText kind="label" style={styles.secondaryText}>MEUS TEMAS SALVOS</PixelText>
            </Pressable>
          </>
        )
      }
    >
      <View style={gameStyles.section}>
        <PixelText kind="detail">Digite qualquer tema, por exemplo: animais da Amazônia.</PixelText>
        <TextInput
          accessibilityLabel="Tema para gerar palavras"
          value={topic}
          onChangeText={changeTopic}
          placeholder="Seu tema (até 60 caracteres)"
          placeholderTextColor={ink.dim}
          maxLength={60}
          editable={!loading}
          returnKeyType="done"
          onSubmitEditing={() => void generate()}
          style={gameStyles.input}
        />
        <PixelText kind="detail">A IA recebe o tema e palavras sugeridas antes para evitar repetições. Não inclua dados pessoais.</PixelText>
        {loading && (
          <View style={styles.status}>
            <ActivityIndicator color={ink.white} />
            <PixelText>Pedindo sugestões à IA…</PixelText>
          </View>
        )}
        {message ? (
          <View style={gameStyles.panel} accessibilityLiveRegion="polite">
            <PixelText>{message}</PixelText>
          </View>
        ) : null}
      </View>
    </GameScreenLayout>
  );
}

const styles = StyleSheet.create({
  status: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  secondary: {
    minHeight: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: ink.line,
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  secondaryText: { color: ink.white, textAlign: 'center' },
});
