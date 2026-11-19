
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

import { gameStyles, ink } from '../features/game-setup/gameTheme';
import { useAuth } from '../features/auth/AuthProvider';
import { useSuitNavigation } from '../features/suit-transition/suitRoutes';

import type { RootStackParamList } from '../navigation/AppNavigator';
import type { Baralho } from '../types/baralho';

import {
  criarBaralho,
  listarBaralhos,
  atualizarBaralho,
  deletarBaralho,
} from '../services/baralhoService';

import {
  criarPalavra,
} from '../services/palavrasService';

import {
  buscarPalavrasUsadas,
  salvarTema,
} from '../services/temasSalvosService';

import { gerarPalavrasPorTema } from '../services/iaPalavrasService';

export default function BaralhosScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Baralhos'>>();
  const { temaId, tema } = route.params;

  const { user } = useAuth();
  const { go, actionId } = useSuitNavigation();

  const [baralhos, setBaralhos] = useState<Baralho[]>([]);
  const [nomeBaralho, setNomeBaralho] = useState('');
  const [nomeEdicao, setNomeEdicao] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [message, setMessage] = useState('');

  const [baralhoPendenteExclusao, setBaralhoPendenteExclusao] =
    useState<Baralho | null>(null);

  const [excluindoBaralho, setExcluindoBaralho] = useState(false);

  // Lista os baralhos pertencentes ao tema selecionado
  const carregarBaralhos = useCallback(async () => {
    setMessage('');

    if (!user) {
      setBaralhos([]);
      setLoading(false);
      setMessage('Usuário não identificado. Faça login novamente.');
      return;
    }

    setLoading(true);

    try {
      const dados = await listarBaralhos(user.uid, temaId);
      setBaralhos(dados);
    } catch (error) {
      console.error('Erro ao carregar baralhos:', error);
      setBaralhos([]);
      setMessage('Não foi possível carregar os baralhos.');
    } finally {
      setLoading(false);
    }
  }, [user, temaId]);

  useEffect(() => {
    void carregarBaralhos();
  }, [carregarBaralhos]);

  // Gera um novo baralho utilizando a IA
  async function gerarBaralho() {
    if (!user || gerando) return;

    setGerando(true);
    setMessage('');

    let novoId: number | null = null;

    try {
      const palavrasUsadas = await buscarPalavrasUsadas(user.uid, tema);

      const palavras = await gerarPalavrasPorTema(
        tema,
        palavrasUsadas
      );

      const nome = nomeBaralho.trim() || `Baralho ${baralhos.length + 1}`;

      novoId = await criarBaralho({
        usuario_id: user.uid,
        tema_id: temaId,
        nome,
      });

      if (novoId === null) {
        throw new Error('Não foi possível salvar o baralho.');
      }

      const resultados = await Promise.all(
        palavras.map((palavra) =>
          criarPalavra(novoId!, user.uid, palavra)
        )
      );

      if (resultados.some((resultado) => !resultado)) {
        await deletarBaralho(novoId, user.uid);
        throw new Error('Não foi possível salvar todas as palavras.');
      }

      let aviso = '';

      try {
        await salvarTema(user.uid, tema, palavras);
      } catch {
        aviso = 'Baralho salvo, mas não consegui atualizar o histórico da IA.';
      }

      setNomeBaralho('');
      await carregarBaralhos();

      setMessage(
        aviso || 'Baralho gerado e salvo com sucesso!'
      );
    } catch (error) {
      if (novoId !== null) {
        try {
          await deletarBaralho(novoId, user.uid);
        } catch {
          // Mantém o erro original.
        }
      }

      setMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao gerar o baralho.'
      );
    } finally {
      setGerando(false);
    }
  }

  // Inicia a edição do nome
  function iniciarEdicao(baralho: Baralho) {
    if (baralho.id === undefined) return;

    setEditandoId(baralho.id);
    setNomeEdicao(baralho.nome);
  }

  // Salva o novo nome
  async function salvarEdicao() {
    if (!user || editandoId === null || !nomeEdicao.trim()) {
      setMessage('Digite um nome válido.');
      return;
    }

    const resultado = await atualizarBaralho(
      editandoId,
      user.uid,
      nomeEdicao
    );

    if (resultado) {
      setEditandoId(null);
      setNomeEdicao('');
      await carregarBaralhos();
      setMessage('Baralho atualizado com sucesso!');
    } else {
      setMessage('Não foi possível atualizar o baralho.');
    }
  }

  // Prepara a exclusão do baralho
  function confirmarExclusao(baralho: Baralho) {
    if (baralho.id === undefined || !user) return;

    setBaralhoPendenteExclusao(baralho);
    setMessage('');
  }

  // Exclui um baralho e suas palavras
  async function excluirBaralhoSelecionado() {
    if (!user || !baralhoPendenteExclusao || excluindoBaralho) return;

    setExcluindoBaralho(true);
    setMessage('');

    try {
      const resultado = await deletarBaralho(
        baralhoPendenteExclusao.id!,
        user.uid
      );

      if (!resultado) {
        throw new Error('Não foi possível excluir o baralho.');
      }

      const nome = baralhoPendenteExclusao.nome;

      setBaralhoPendenteExclusao(null);
      await carregarBaralhos();

      setMessage(`Baralho "${nome}" excluído com sucesso!`);
    } catch (error) {
      console.error('Erro ao excluir baralho:', error);
      setMessage('Não foi possível excluir o baralho.');
    } finally {
      setExcluindoBaralho(false);
    }
  }

  // Abre a tela das palavras do baralho
  function abrirPalavras(baralho: Baralho) {
    if (baralho.id === undefined) return;

    go('Palavras', actionId, {
      baralhoId: baralho.id,
      baralhoNome: baralho.nome,
      temaId,
      tema,
    });
  }

  return (
    <GameScreenLayout
      title="Baralhos"
      subtitle={`TEMA: ${tema.toUpperCase()}`}
      footer={
        <MenuAction
          title={gerando ? 'GERANDO BARALHO...' : 'GERAR BARALHO COM IA'}
          onPress={() => void gerarBaralho()}
          disabled={gerando}
        />
      }
    >
      <View style={gameStyles.section}>
        <PixelText kind="detail">
          Gere novos conjuntos de palavras para este tema.
        </PixelText>

        <TextInput
          style={gameStyles.input}
          placeholder="Nome do baralho (opcional)"
          placeholderTextColor={ink.dim}
          value={nomeBaralho}
          onChangeText={setNomeBaralho}
          editable={!gerando}
        />

        {gerando && (
          <View style={styles.loading}>
            <ActivityIndicator color={ink.white} />
            <PixelText>Gerando palavras com a IA...</PixelText>
          </View>
        )}

        {message ? (
          <View style={gameStyles.panel}>
            <PixelText>{message}</PixelText>
          </View>
        ) : null}
      </View>

      <View style={gameStyles.section}>
        <PixelText kind="heading">Baralhos salvos</PixelText>

        {loading ? (
          <ActivityIndicator color={ink.white} />
        ) : baralhos.length === 0 ? (
          <View style={gameStyles.panel}>
            <PixelText>
              Você ainda não possui baralhos neste tema.
            </PixelText>
          </View>
        ) : (
          <View style={gameStyles.stack}>
            {baralhos.map((baralho) => (
              <View key={baralho.id} style={gameStyles.panel}>
                {editandoId === baralho.id ? (
                  <>
                    <TextInput
                      style={gameStyles.input}
                      value={nomeEdicao}
                      onChangeText={setNomeEdicao}
                      placeholder="Novo nome"
                      placeholderTextColor={ink.dim}
                    />

                    <View style={styles.actions}>
                      <Acao
                        titulo="SALVAR"
                        onPress={() => void salvarEdicao()}
                      />
                      <Acao
                        titulo="CANCELAR"
                        onPress={() => setEditandoId(null)}
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <PixelText kind="heading">
                      {baralho.nome}
                    </PixelText>

                    <View style={styles.actions}>
                      <Acao
                        titulo="PALAVRAS"
                        onPress={() => abrirPalavras(baralho)}
                      />
                      <Acao
                        titulo="RENOMEAR"
                        onPress={() => iniciarEdicao(baralho)}
                      />
                      <Acao
                        titulo="EXCLUIR"
                        onPress={() => confirmarExclusao(baralho)}
                        danger
                      />
                    </View>
                  </>
                )}

                {/* Confirmação de exclusão */}
                {baralhoPendenteExclusao?.id === baralho.id && (
                  <View style={styles.confirmation}>
                    <PixelText>
                      Deseja realmente excluir "{baralho.nome}" e todas
                      as palavras desse baralho?
                    </PixelText>

                    <View style={styles.actions}>
                      <Pressable
                        accessibilityRole="button"
                        disabled={excluindoBaralho}
                        onPress={() => void excluirBaralhoSelecionado()}
                        style={[styles.actionButton, styles.danger]}
                      >
                        <PixelText kind="label">
                          {excluindoBaralho ? 'EXCLUINDO...' : 'CONFIRMAR'}
                        </PixelText>
                      </Pressable>

                      <Pressable
                        accessibilityRole="button"
                        disabled={excluindoBaralho}
                        onPress={() => setBaralhoPendenteExclusao(null)}
                        style={styles.actionButton}
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

function Acao({
  titulo,
  onPress,
  danger = false,
}: {
  titulo: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        danger && styles.danger,
        pressed && gameStyles.selected,
      ]}
    >
      <PixelText kind="label">
        {titulo}
      </PixelText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    minHeight: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ink.line,
    paddingHorizontal: 10,
  },
  danger: {
    borderColor: '#b65b5b',
  },
  confirmation: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: ink.line,
    gap: 10,
  },
});
