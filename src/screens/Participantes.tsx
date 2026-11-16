import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { Dupla, Jogador } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Participantes'>;

export default function Participantes({ route, navigation }: Props) {
  const { quantidadeJogadores } = route.params;

  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [nomeJogador, setNomeJogadores] = useState<string>('');

  useEffect(() => {
    if (jogadores.length === quantidadeJogadores) {
      const duplas = jogadores.reduce<Dupla[]>((lista, jogador, index) => {
        if (index % 2 === 0) {
          const jogador2 = jogadores[index + 1];
          if (jogador2) {
            lista.push({ jogador1: jogador, jogador2 });
          }
        }
        return lista;
      }, []);

      navigation.navigate('Categorias', {
        duplas,
      });
    }
  }, [jogadores, navigation, quantidadeJogadores, route.params]);

  const adicionarJogador = () => {
    const listaJogadores = [...jogadores, { nome: nomeJogador }];
    setJogadores(listaJogadores);
    setNomeJogadores('');
  };

  // Se a lista tem tamanho ímpar, o último jogador está "esperando" par
  const aguardandoDupla = jogadores.length % 2 !== 0;
  const jogadorEsperando = jogadores[jogadores.length - 1];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Adicione Jogadores</Text>

      <Text style={styles.subtitle}>É possível embaralhar depois</Text>

      {jogadores.length < quantidadeJogadores && (
        <View style={styles.duplaContainer}>
          <TextInput
            style={styles.input}
            value={nomeJogador}
            onChangeText={(nome) => setNomeJogadores(nome)}
            placeholder={`Nome do jogador`}
            placeholderTextColor="#8D8B96"
            maxLength={30}
          />

          {aguardandoDupla && (
            <Text style={styles.label}>
              Forme dupla com {jogadorEsperando.nome}
            </Text>
          )}

          <TouchableOpacity
            style={styles.counterButton}
            onPress={adicionarJogador}
          >
            <Text>+</Text>
          </TouchableOpacity>
        </View>
      )}

      {jogadores.map((jogador, key) => {
        return <Text key={key}>{jogador.nome}</Text>;
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23212C',
  },

  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
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
    textAlign: 'center',
    marginBottom: 35,
  },

  duplaContainer: {
    width: '100%',
    marginBottom: 25,
  },

  duplaTitle: {
    color: '#F1FECB',
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 15,
  },

  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },

  input: {
    width: '100%',
    height: 52,
    backgroundColor: '#F1FECB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#23212C',
    marginBottom: 15,
  },
  counterButton: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#F1FECB',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
