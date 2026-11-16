import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { listarCategorias, type Categoria } from '../services/categoriasService';

type Props = NativeStackScreenProps<RootStackParamList, 'Categorias'>;

export default function Categorias({ route, navigation }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selecionada, setSelecionada] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarCategorias = async () => {
    setCarregando(true);
    setErro('');
    try {
      const lista = await listarCategorias();
      setCategorias(lista);
      setSelecionada((atual) =>
        lista.some((categoria) => categoria.id === atual)
          ? atual
          : lista[0]?.id ?? '',
      );
    } catch {
      setErro(
        'Não foi possível carregar as categorias. Confira sua conexão com o Firestore.',
      );
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregarCategorias();
  }, []);

  const continuarComCategoria = () => {
    if (!selecionada) return;
    navigation.navigate('Duracao', {
      duplas: route.params.duplas,
      categoriaId: selecionada,
      origem: 'firestore',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha uma categoria</Text>
      <Text style={styles.subtitle}>As palavras vêm do Firebase</Text>

      {carregando ? (
        <ActivityIndicator style={styles.loading} color="#F1FECB" />
      ) : erro ? (
        <View style={styles.errorBlock}>
          <Text style={styles.errorText}>{erro}</Text>
          <Pressable onPress={() => void carregarCategorias()}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : categorias.length === 0 ? (
        <Text style={styles.errorText}>Nenhuma categoria foi encontrada.</Text>
      ) : (
        <ScrollView style={styles.categoryList}>
          {categorias.map((categoria) => (
            <Pressable
              key={categoria.id}
              onPress={() => setSelecionada(categoria.id)}
              style={[
                styles.categoryOption,
                selecionada === categoria.id && styles.selectedCategory,
              ]}
            >
              <Text
                style={[
                  styles.categoryOptionText,
                  selecionada === categoria.id && styles.selectedCategoryText,
                ]}
              >
                {categoria.nome}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View style={styles.actions}>
        <Pressable
          onPress={continuarComCategoria}
          style={[styles.primaryButton, !selecionada && styles.disabledButton]}
          disabled={!selecionada || carregando}
        >
          <Text style={styles.primaryButtonText}>Continuar com categoria</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('Personalizado', route.params)}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Gerar tema personalizado com IA</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23212C',
    paddingHorizontal: 24,
    paddingTop: 44,
    paddingBottom: 18,
  },
  title: {
    color: '#F1FECB',
    fontSize: 27,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#B8B7BE',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  loading: { flex: 1 },
  categoryList: { flex: 1 },
  categoryOption: {
    backgroundColor: '#34323D',
    borderRadius: 10,
    marginBottom: 9,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectedCategory: { backgroundColor: '#F1FECB' },
  categoryOptionText: {
    color: '#F1FECB',
    fontSize: 16,
    textTransform: 'capitalize',
  },
  selectedCategoryText: { color: '#23212C', fontWeight: '700' },
  errorBlock: { flex: 1, justifyContent: 'center' },
  errorText: { color: '#F2C6C6', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  retryText: {
    color: '#F1FECB',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
  },
  actions: { gap: 10, paddingTop: 16 },
  primaryButton: {
    backgroundColor: '#F1FECB',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#23212C', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    borderColor: '#F1FECB',
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#F1FECB', fontSize: 15, fontWeight: '700' },
  disabledButton: { opacity: 0.45 },
});
