import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { buscarFallbackAleatorioDoFirebase } from '../services/categoriasService';
import { gerarPalavrasPorTema } from '../services/iaPalavrasService';

type Props = NativeStackScreenProps<RootStackParamList, 'Personalizado'>;

type FallbackPreparado = {
  categoriaId: string;
  palavras: string[];
  mensagem: string;
};

export default function TemaPersonalizado({ route, navigation }: Props) {
  const { duplas } = route.params;
  const [tema, setTema] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [fallbackPreparado, setFallbackPreparado] =
    useState<FallbackPreparado | null>(null);

  const continuarComPalavras = (
    palavras: string[],
    origem: 'ia' | 'firestore-fallback',
    categoriaId?: string,
    mensagemFallback?: string,
  ) => {
    navigation.navigate('Duracao', {
      duplas,
      palavras,
      origem,
      categoriaId,
      tema: tema.trim(),
      mensagemFallback,
    });
  };

  const gerarOuContinuar = async () => {
    if (fallbackPreparado) {
      continuarComPalavras(
        fallbackPreparado.palavras,
        'firestore-fallback',
        fallbackPreparado.categoriaId,
        fallbackPreparado.mensagem,
      );
      return;
    }

    const temaInformado = tema.trim();
    if (!temaInformado) {
      setMensagem('Digite um tema para gerar as palavras.');
      return;
    }
    if (temaInformado.length > 60) {
      setMensagem('O tema pode ter no máximo 60 caracteres.');
      return;
    }

    setMensagem('');
    setCarregando(true);
    try {
      const palavras = await gerarPalavrasPorTema(temaInformado);
      continuarComPalavras(palavras, 'ia');
    } catch (error) {
      const mensagemErro =
        error instanceof Error ? error.message : 'A IA não respondeu.';
      try {
        const fallback = await buscarFallbackAleatorioDoFirebase();
        const mensagemFallback =
          `${mensagemErro} Vamos continuar com palavras do Firebase ` +
          `na categoria “${fallback.categoriaId}”.`;
        setFallbackPreparado({
          categoriaId: fallback.categoriaId,
          palavras: fallback.palavras,
          mensagem: mensagemFallback,
        });
        setMensagem(mensagemFallback);
      } catch {
        setMensagem(
          'Não foi possível acessar a IA nem o Firebase. Confira sua conexão e tente novamente.',
        );
      }
    } finally {
      setCarregando(false);
    }
  };

  const atualizarTema = (novoTema: string) => {
    setTema(novoTema);
    setFallbackPreparado(null);
    setMensagem('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tema personalizado</Text>
      <Text style={styles.subtitle}>
        Escreva um tema e a IA vai sugerir palavras para a rodada.
      </Text>

      <TextInput
        style={styles.input}
        value={tema}
        onChangeText={atualizarTema}
        placeholder="Ex.: animais da Amazônia"
        placeholderTextColor="#8D8B96"
        maxLength={60}
        editable={!carregando}
        accessibilityLabel="Tema personalizado"
      />
      <Text style={styles.helperText}>
        Não inclua nomes ou dados pessoais no tema. Só esse texto será enviado à IA.
      </Text>

      {mensagem ? <Text style={styles.message}>{mensagem}</Text> : null}

      <Pressable
        onPress={() => void gerarOuContinuar()}
        style={[styles.continueButton, carregando && styles.disabledButton]}
        disabled={carregando}
      >
        {carregando ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#23212C" />
            <Text style={styles.continueText}>Gerando palavras…</Text>
          </View>
        ) : (
          <Text style={styles.continueText}>
            {fallbackPreparado ? 'Continuar com Firebase' : 'Gerar palavras'}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23212C',
    paddingHorizontal: 24,
    paddingTop: 70,
  },
  title: {
    color: '#F1FECB',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#B8B7BE',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 54,
    backgroundColor: '#F1FECB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#23212C',
  },
  helperText: {
    color: '#B8B7BE',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  message: {
    color: '#F1FECB',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 24,
    textAlign: 'center',
  },
  continueButton: {
    position: 'absolute',
    bottom: 36,
    left: 24,
    right: 24,
    backgroundColor: '#F1FECB',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  disabledButton: { opacity: 0.5 },
  continueText: { color: '#23212C', fontSize: 17, fontWeight: '700' },
  loadingRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
});
