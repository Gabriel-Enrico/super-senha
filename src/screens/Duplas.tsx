import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { buscarPalavrasDaCategoria } from '../services/categoriasService';

type Props = NativeStackScreenProps<RootStackParamList, 'Duplas'>;

export default function Duplas({ route }: Props) {
  const { categoriaId, origem, tema, mensagemFallback, duracaoPartida } =
    route.params;
  const [palavras, setPalavras] = useState<string[]>(route.params.palavras ?? []);
  const [carregandoPalavras, setCarregandoPalavras] = useState(
    !route.params.palavras?.length,
  );
  const [erroPalavras, setErroPalavras] = useState('');

  useEffect(() => {
    let active = true;

    async function carregarPalavras() {
      if (route.params.palavras?.length) {
        setPalavras(route.params.palavras);
        setCarregandoPalavras(false);
        return;
      }

      if (!categoriaId) {
        setErroPalavras('Não foi informada uma categoria para buscar palavras.');
        setCarregandoPalavras(false);
        return;
      }

      setCarregandoPalavras(true);
      setErroPalavras('');

      try {
        const lista = await buscarPalavrasDaCategoria(categoriaId);
        if (active) setPalavras(lista);
      } catch (error) {
        if (!active) return;
        const code =
          error && typeof error === 'object' && 'code' in error
            ? String(error.code)
            : '';
        const message =
          code === 'permission-denied' || code === 'unavailable'
            ? 'Não foi possível ler as palavras. Confira sua conexão e as regras de leitura do Firestore.'
            : error instanceof Error
              ? error.message
              : 'Erro desconhecido ao carregar as palavras.';
        setErroPalavras(message);
      } finally {
        if (active) setCarregandoPalavras(false);
      }
    }

    void carregarPalavras();
    return () => {
      active = false;
    };
  }, [categoriaId, route.params.palavras]);

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={route.params.duplas}
        keyExtractor={(_, index) => String(index)}
        ListHeaderComponent={
          <View style={styles.wordsSection}>
            <Text style={styles.sectionTitle}>
              {origem === 'ia'
                ? `Tema personalizado: ${tema}`
                : `Palavras do Firebase: ${categoriaId}`}
            </Text>
            <Text style={styles.durationText}>
              Duração escolhida: {duracaoPartida === 'rapida' ? 'Rápida' : 'Longa'}
            </Text>
            {mensagemFallback ? (
              <Text style={styles.fallbackText}>{mensagemFallback}</Text>
            ) : null}
            {carregandoPalavras ? (
              <ActivityIndicator color="#F1FECB" />
            ) : erroPalavras ? (
              <Text style={styles.errorText}>{erroPalavras}</Text>
            ) : (
              <View>
                <Text style={styles.wordsText}>
                  {origem === 'ia'
                    ? `${palavras.length} palavras geradas pela IA`
                    : `${palavras.length} palavras carregadas do Firestore`}
                </Text>
                <Text style={styles.wordsSample}>
                  Exemplo: {palavras.slice(0, 8).join(' • ')}
                </Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.duplaItem}>
            <Text style={styles.duplaNumber}>Dupla {index + 1}</Text>
            <Text style={styles.duplaNames}>
              {item.jogador1.nome} e {item.jogador2.nome}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23212C',
  },
  content: {
    padding: 24,
    gap: 12,
  },
  wordsSection: {
    backgroundColor: '#34323D',
    borderRadius: 12,
    marginBottom: 8,
    padding: 18,
  },
  sectionTitle: {
    color: '#F1FECB',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  durationText: {
    color: '#B8B7BE',
    fontSize: 14,
    marginBottom: 10,
  },
  wordsText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 23,
  },
  wordsSample: {
    color: '#B8B7BE',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
  },
  errorText: {
    color: '#F2C6C6',
    fontSize: 14,
    lineHeight: 20,
  },
  fallbackText: {
    color: '#F1FECB',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },
  duplaItem: {
    backgroundColor: '#F1FECB',
    borderRadius: 12,
    padding: 18,
  },
  duplaNumber: {
    color: '#62654F',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  duplaNames: {
    color: '#23212C',
    fontSize: 18,
    fontWeight: '700',
  },
});
