
import { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { useRoute, type RouteProp } from '@react-navigation/native';

import {
  GameScreenLayout,
  MenuAction,
  PixelText,
} from '../features/game-setup/GameUI';

import {
  getWordsRequired,
  useGameSetup,
} from '../features/game-setup/gameSetup';

import { gameStyles, ink } from '../features/game-setup/gameTheme';

import { useAuth } from '../features/auth/AuthProvider';
import { useSuitNavigation } from '../features/suit-transition/suitRoutes';

import type { RootStackParamList } from '../navigation/AppNavigator';
import type { Palavra } from '../types/palavras';

import {
  criarPalavra,
  listarPalavras,
  atualizarPalavra,
  deletarPalavra,
} from '../services/palavrasService';

export default function PalavrasScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Palavras'>>();

  const { baralhoId, baralhoNome, tema } = route.params;

  const { user } = useAuth();
  const { setup, update } = useGameSetup();
  const { go, actionId } = useSuitNavigation();

  const [palavras, setPalavras] = useState<Palavra[]>([]);
  const [palavra, setPalavra] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Estados para exclusão de palavras
  const [palavraPendenteExclusao, setPalavraPendenteExclusao] =
    useState<Palavra | null>(null);

  const [excluindoPalavra, setExcluindoPalavra] = useState(false);

  // READ - Carrega as palavras do baralho
  const carregarPalavras = useCallback(async () => {
    if (!user) {
      setPalavras([]);
      setLoading(false);
      setMessage('Usuário não identificado. Faça login novamente.');
      return;
    }

    setLoading(true);

    try {
      const dados = await listarPalavras(baralhoId, user.uid);
      setPalavras(dados);
    } catch (error) {
      console.error('Erro ao carregar palavras:', error);
      setMessage('Não foi possível carregar as palavras.');
    } finally {
      setLoading(false);
    }
  }, [user, baralhoId]);

  useEffect(() => {
    void carregarPalavras();
  }, [carregarPalavras]);

  // CREATE / UPDATE - Salva uma palavra
  async function salvar() {
    if (!user || !palavra.trim()) {
      setMessage('Digite uma palavra válida.');
      return;
    }

    let resultado: boolean;

    if (editandoId !== null) {
      resultado = await atualizarPalavra(
        editandoId,
        baralhoId,
        user.uid,
        palavra
      );
    } else {
      resultado = await criarPalavra(
        baralhoId,
        user.uid,
        palavra
      );
    }

    if (resultado) {
      setPalavra('');
      setEditandoId(null);

      setMessage(
        editandoId !== null
          ? 'Palavra atualizada com sucesso!'
          : 'Palavra cadastrada com sucesso!'
      );

      await carregarPalavras();
    } else {
      setMessage('Não foi possível salvar a palavra.');
    }
  }

  // Prepara uma palavra para edição
  function editar(item: Palavra) {
    if (item.id === undefined) return;

    setEditandoId(item.id);
    setPalavra(item.palavra);
    setMessage('');
  }

  // Cancela a edição
  function cancelarEdicao() {
    setEditandoId(null);
    setPalavra('');
  }

  // Prepara a exclusão da palavra
  function confirmarExclusao(item: Palavra) {
    if (item.id === undefined || !user || excluindoPalavra) return;

    setPalavraPendenteExclusao(item);
    setMessage('');
  }

  // Exclui uma palavra
  async function excluirPalavraSelecionada() {
    if (!user || !palavraPendenteExclusao || excluindoPalavra) return;

    const id = palavraPendenteExclusao.id;

    if (id === undefined) return;

    setExcluindoPalavra(true);
    setMessage('');

    try {
      const resultado = await deletarPalavra(
        id,
        baralhoId,
        user.uid
      );

      if (!resultado) {
        throw new Error('Não foi possível excluir a palavra.');
      }

      const nome = palavraPendenteExclusao.palavra;

      // Atualiza a lista depois da exclusão
      setPalavras((current) =>
        current.filter((item) => item.id !== id)
      );

      setPalavraPendenteExclusao(null);

      // Cancela a edição caso a palavra excluída estivesse sendo editada
      if (editandoId === id) {
        setEditandoId(null);
        setPalavra('');
      }

      setMessage(`Palavra "${nome}" excluída com sucesso!`);
    } catch (error) {
      console.error('Erro ao excluir palavra:', error);
      setMessage('Não foi possível excluir a palavra.');
    } finally {
      setExcluindoPalavra(false);
    }
  }

  // Inicia uma partida com as palavras do baralho
  function jogar() {
    const quantidadeNecessaria = getWordsRequired(setup.mode);

    if (palavras.length < quantidadeNecessaria) {
      setMessage(
        `Este modo precisa de ${quantidadeNecessaria} palavras. Seu baralho possui ${palavras.length}.`
      );
      return;
    }

    update({
      wordSource: 'ia',
      words: palavras.map((item) => item.palavra),
      topic: tema,
      category: '',
      fallbackMessage: '',
    });

    go('Ajustes da partida', actionId);
  }

  const quantidadeNecessaria = getWordsRequired(setup.mode);

  return (
    <GameScreenLayout
      title="Palavras"
      subtitle={baralhoNome.toUpperCase()}
      footer={
        <MenuAction
          title="JOGAR COM ESTE BARALHO"
          onPress={jogar}
          disabled={loading}
        />
      }
    >
      <View style={gameStyles.section}>
        <PixelText kind="detail">
          Adicione ou edite as palavras utilizadas neste baralho.
        </PixelText>

        <TextInput
          style={gameStyles.input}
          placeholder="Digite uma palavra"
          placeholderTextColor={ink.dim}
          value={palavra}
          onChangeText={setPalavra}
        />

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => void salvar()}
            style={styles.primaryButton}
          >
            <PixelText style={styles.primaryText}>
              {editandoId !== null ? 'ATUALIZAR' : 'ADICIONAR'}
            </PixelText>
          </Pressable>

          {editandoId !== null && (
            <Pressable
              accessibilityRole="button"
              onPress={cancelarEdicao}
              style={styles.secondaryButton}
            >
              <PixelText kind="label">CANCELAR</PixelText>
            </Pressable>
          )}
        </View>

        <PixelText kind="detail">
          Palavras cadastradas: {palavras.length}
        </PixelText>

        <PixelText kind="detail">
          Necessárias para o modo atual: {quantidadeNecessaria}
        </PixelText>

        {message ? (
          <View style={gameStyles.panel}>
            <PixelText>{message}</PixelText>
          </View>
        ) : null}
      </View>

      <View style={gameStyles.section}>
        <PixelText kind="heading">Lista de palavras</PixelText>

        {loading ? (
          <ActivityIndicator color={ink.white} />
        ) : palavras.length === 0 ? (
          <View style={gameStyles.panel}>
            <PixelText>
              Este baralho ainda não possui palavras.
            </PixelText>
          </View>
        ) : (
          <View style={gameStyles.stack}>
            {palavras.map((item, index) => (
              <View key={item.id} style={styles.wordCard}>
                <PixelText style={styles.word}>
                  {index + 1}. {item.palavra}
                </PixelText>

                <View style={styles.actions}>
                  <Pressable onPress={() => editar(item)}>
                    <PixelText kind="label">EDITAR</PixelText>
                  </Pressable>

                  <Pressable onPress={() => confirmarExclusao(item)}>
                    <PixelText kind="label" style={styles.deleteText}>
                      EXCLUIR
                    </PixelText>
                  </Pressable>
                </View>

                {/* Confirmação de exclusão */}
                {palavraPendenteExclusao?.id === item.id && (
                  <View style={styles.confirmation}>
                    <PixelText>
                      Deseja realmente excluir "{item.palavra}"?
                    </PixelText>

                    <View style={styles.actions}>
                      <Pressable
                        accessibilityRole="button"
                        disabled={excluindoPalavra}
                        onPress={() => void excluirPalavraSelecionada()}
                        style={[styles.deleteButton, excluindoPalavra && styles.disabled]}
                      >
                        <PixelText kind="label">
                          {excluindoPalavra ? 'EXCLUINDO...' : 'CONFIRMAR'}
                        </PixelText>
                      </Pressable>

                      <Pressable
                        accessibilityRole="button"
                        disabled={excluindoPalavra}
                        onPress={() => setPalavraPendenteExclusao(null)}
                        style={styles.secondaryButton}
                      >
                        <PixelText kind="label">CANCELAR</PixelText>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </GameScreenLayout>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
  },
  primaryButton: {
    minHeight: 42,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ink.white,
  },
  primaryText: {
    color: '#111',
  },
  secondaryButton: {
    minHeight: 42,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ink.line,
  },
  wordCard: {
    backgroundColor: ink.panel,
    borderWidth: 1,
    borderColor: ink.line,
    padding: 12,
    gap: 10,
  },
  word: {
    fontSize: 18,
  },
  deleteText: {
    color: '#e47c7c',
  },
  confirmation: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: ink.line,
    gap: 10,
  },
  deleteButton: {
    minHeight: 42,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b65b5b',
  },
  disabled: {
    opacity: 0.5,
  },
});
