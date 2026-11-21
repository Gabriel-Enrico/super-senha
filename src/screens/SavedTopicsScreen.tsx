
import { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import {
  GameScreenLayout,
  MenuAction,
  PixelText,
} from '../features/game-setup/GameUI';

import { gameStyles, ink } from '../features/game-setup/gameTheme';
import { useAuth } from '../features/auth/AuthProvider';
import SfxPressable from '../features/sfx/SfxPressable';
import { useSuitNavigation } from '../features/suit-transition/suitRoutes';

import {
  listarTemasSalvos,
  deletarTema,
  atualizarTema,
  type TemaSalvo,
} from '../services/temasSalvosService';

import {
  deletarBaralhosDoTema,
  atualizarTemaNosBaralhos,
} from '../services/baralhoService';  

export default function SavedTopicsScreen() {
  const { user } = useAuth();
  const { go, actionId } = useSuitNavigation();

  const [topics, setTopics] = useState<TemaSalvo[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [temaPendenteExclusao, setTemaPendenteExclusao] =
    useState<TemaSalvo | null>(null);

  const [excluindoTema, setExcluindoTema] = useState(false);

  const [editandoTemaId, setEditandoTemaId] =
    useState<string | null>(null);

  const [nomeTemaEdicao, setNomeTemaEdicao] = useState('');
  const [salvandoTema, setSalvandoTema] = useState(false);

  // Carrega os temas salvos pelo usuário
  const loadTopics = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setMessage('');

    try {
      setTopics(await listarTemasSalvos(user.uid));
    } catch {
      setMessage('Não consegui carregar seus temas. Confira as regras do Firestore e tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadTopics();
  }, [loadTopics]);

  // Abre os baralhos do tema selecionado
  function abrirBaralhos(savedTopic: TemaSalvo) {
    go('Baralhos', actionId, {
      temaId: savedTopic.id,
      tema: savedTopic.tema,
    });
  }
// Exclui o tema e todos os seus baralhos e palavras
async function excluirTemaSelecionado() {
  if (!user || !temaPendenteExclusao || excluindoTema) return;

  const tema = temaPendenteExclusao;

  setExcluindoTema(true);
  setMessage('');

  try {
    // Exclui os baralhos e suas palavras do SQLite
    await deletarBaralhosDoTema(user.uid, tema.id);

    // Exclui o tema e seu histórico do Firestore
    await deletarTema(user.uid, tema.id);

    // Atualiza a lista na tela
    setTopics((current) =>
      current.filter((item) => item.id !== tema.id)
    );

    setTemaPendenteExclusao(null);

    setMessage(
      `Tema "${tema.tema}" e seus baralhos e palavras foram excluídos!`
    );
  } catch (error) {
    console.error('Erro ao excluir tema:', error);

    setMessage(
      'Não foi possível concluir a exclusão. Verifique a conexão e tente novamente.'
    );
  } finally {
    setExcluindoTema(false);
  }
}

// Inicia a edição do tema
function iniciarEdicaoTema(savedTopic: TemaSalvo) {
  setEditandoTemaId(savedTopic.id);
  setNomeTemaEdicao(savedTopic.tema);
  setTemaPendenteExclusao(null);
  setMessage('');
}

// Salva o novo nome do tema
async function salvarEdicaoTema(savedTopic: TemaSalvo) {
  if (!user || salvandoTema) return;

  const novoNome = nomeTemaEdicao.trim();

  if (!novoNome) {
    setMessage('Digite um nome válido para o tema.');
    return;
  }

  if (novoNome === savedTopic.tema.trim()) {
    setEditandoTemaId(null);
    setNomeTemaEdicao('');
    return;
  }

  const novoId = encodeURIComponent(
    novoNome.toLocaleLowerCase('pt-BR')
  );

  setSalvandoTema(true);
  setMessage('');

  let sqliteAtualizado = false;

  try {
    // Atualiza primeiro os baralhos no SQLite.
    await atualizarTemaNosBaralhos(
      user.uid,
      savedTopic.id,
      novoId
    );

    sqliteAtualizado = true;

    // Atualiza o tema no Firestore.
    const idSalvo = await atualizarTema(
      user.uid,
      savedTopic.id,
      novoNome
    );

    setTopics((current) =>
      current.map((item) =>
        item.id === savedTopic.id
          ? { ...item, id: idSalvo, tema: novoNome }
          : item
      )
    );

    setEditandoTemaId(null);
    setNomeTemaEdicao('');

    setMessage('Tema renomeado com sucesso!');
  } catch (error) {
    console.error('Erro ao renomear tema:', error);

    // Tenta restaurar os IDs dos baralhos caso o Firestore falhe.
    if (sqliteAtualizado) {
      try {
        await atualizarTemaNosBaralhos(
          user.uid,
          novoId,
          savedTopic.id
        );
      } catch (rollbackError) {
        console.error('Erro ao restaurar baralhos:', rollbackError);
      }
    }

    setMessage('Não foi possível renomear o tema. Tente novamente.');
  } finally {
    setSalvandoTema(false);
  }
}

return (
    <GameScreenLayout
      title="Meus temas"
      subtitle="SUAS IDEIAS SALVAS"
      footer={
        <MenuAction
          title="Criar outro tema"
          next="Tema personalizado"
        />
      }
    >
      {loading ? (
        <ActivityIndicator color={ink.white} />
      ) : topics.length === 0 ? (
        <View style={gameStyles.panel}>
          <PixelText>
            Você ainda não salvou temas personalizados.
          </PixelText>

          {message ? (
            <PixelText kind="detail">{message}</PixelText>
          ) : null}
        </View>
      ) : (
        <View style={gameStyles.stack}>
          {topics.map((savedTopic) => (
            <View key={savedTopic.id} style={gameStyles.panel}>
             {editandoTemaId === savedTopic.id ? (
  <View style={{ gap: 10 }}>
    <TextInput
      style={gameStyles.input}
      value={nomeTemaEdicao}
      onChangeText={setNomeTemaEdicao}
      placeholder="Novo nome do tema"
      placeholderTextColor={ink.dim}
      editable={!salvandoTema}
    />

    <View style={styles.actions}>
      <SfxPressable
        accessibilityRole="button"
        disabled={salvandoTema}
        onPress={() => void salvarEdicaoTema(savedTopic)}
        style={styles.playButton}
      >
        <PixelText kind="label">
          {salvandoTema ? 'SALVANDO...' : 'SALVAR'}
        </PixelText>
      </SfxPressable>

      <SfxPressable
        accessibilityRole="button"
        disabled={salvandoTema}
        onPress={() => {
          setEditandoTemaId(null);
          setNomeTemaEdicao('');
        }}
        style={styles.playButton}
      >
        <PixelText kind="label">CANCELAR</PixelText>
      </SfxPressable>
    </View>
  </View>
) : (
  <PixelText kind="heading">
    {savedTopic.tema}
  </PixelText>
)}
    <SfxPressable
      sound="secondary"
      accessibilityRole="button"
      onPress={() => abrirBaralhos(savedTopic)}
      style={({ pressed }) => [
        styles.playButton,
        pressed && gameStyles.selected,
      ]}
    >
      <PixelText kind="label" style={styles.playLabel}>
        ABRIR BARALHOS
      </PixelText>
    </SfxPressable>
    
    <SfxPressable
      sound="secondary"
      accessibilityRole="button"
      disabled={excluindoTema || salvandoTema}
      onPress={() => iniciarEdicaoTema(savedTopic)}
      style={({ pressed }) => [
        styles.playButton,
        pressed && gameStyles.selected,
      ]}
    >
      <PixelText kind="label" style={styles.playLabel}>
        RENOMEAR TEMA
      </PixelText>
          </SfxPressable>

            <SfxPressable
  sound="secondary"
  accessibilityRole="button"
  disabled={excluindoTema}
  onPress={() => setTemaPendenteExclusao(savedTopic)}
  style={({ pressed }) => [
    styles.deleteButton,
    pressed && gameStyles.selected,
  ]}
>
  <PixelText kind="label" style={{ color: '#ff7777' }}>
    EXCLUIR TEMA
  </PixelText>
</SfxPressable>

{temaPendenteExclusao?.id === savedTopic.id && (
  <View style={styles.confirmation}>
    <PixelText>
      Tem certeza? Todos os baralhos e palavras associados
      também serão excluídos. Essa ação não pode ser desfeita.
    </PixelText>

    <View style={styles.actions}>
      <SfxPressable
        accessibilityRole="button"
        disabled={excluindoTema}
        onPress={() => void excluirTemaSelecionado()}
        style={styles.deleteButton}
      >
        <PixelText kind="label">
          {excluindoTema ? 'EXCLUINDO...' : 'CONFIRMAR EXCLUSÃO'}
        </PixelText>
      </SfxPressable>

      <SfxPressable
        accessibilityRole="button"
        disabled={excluindoTema}
        onPress={() => setTemaPendenteExclusao(null)}
        style={styles.playButton}
      >
        <PixelText kind="label">CANCELAR</PixelText>
      </SfxPressable>
    </View>
  </View>
)}
            </View>
          ))}
          
        </View>
      )}

      {message && topics.length > 0 ? (
        <View style={gameStyles.panel}>
          <PixelText>{message}</PixelText>
        </View>
      ) : null}
    </GameScreenLayout>
  );
}


const styles = StyleSheet.create({
  playButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ink.line,
    paddingHorizontal: 8,
  },

  playLabel: {
    color: ink.white,
    textAlign: 'center',
  },

  deleteButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b65b5b',
    paddingHorizontal: 10,
  },

  confirmation: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: ink.line,
    gap: 10,
  },

  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});

