import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Duracao'>;
type Duracao = 'rapida' | 'longa';

export default function DuracaoPartida({ route, navigation }: Props) {
  const [duracao, setDuracao] = useState<Duracao>('rapida');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Duração da partida</Text>
      <Text style={styles.subtitle}>Escolha o ritmo do jogo</Text>

      <Pressable
        onPress={() => setDuracao('rapida')}
        style={[styles.option, duracao === 'rapida' && styles.selectedOption]}
      >
        <Text style={[styles.optionTitle, duracao === 'rapida' && styles.selectedText]}>
          Rápida
        </Text>
        <Text style={[styles.optionDescription, duracao === 'rapida' && styles.selectedText]}>
          Uma partida mais curta
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setDuracao('longa')}
        style={[styles.option, duracao === 'longa' && styles.selectedOption]}
      >
        <Text style={[styles.optionTitle, duracao === 'longa' && styles.selectedText]}>
          Longa
        </Text>
        <Text style={[styles.optionDescription, duracao === 'longa' && styles.selectedText]}>
          Uma partida com mais tempo
        </Text>
      </Pressable>

      <Pressable
        onPress={() =>
          navigation.navigate('Duplas', {
            ...route.params,
            duracaoPartida: duracao,
          })
        }
        style={styles.continueButton}
      >
        <Text style={styles.continueText}>Começar partida</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23212C',
    paddingHorizontal: 24,
    paddingTop: 72,
  },
  title: {
    color: '#F1FECB',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#B8B7BE',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 34,
  },
  option: {
    borderColor: '#55535F',
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: '#34323D',
    padding: 20,
    marginBottom: 14,
  },
  selectedOption: { backgroundColor: '#F1FECB', borderColor: '#F1FECB' },
  optionTitle: { color: '#F1FECB', fontSize: 19, fontWeight: '700' },
  optionDescription: { color: '#B8B7BE', fontSize: 14, marginTop: 5 },
  selectedText: { color: '#23212C' },
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
  continueText: { color: '#23212C', fontSize: 17, fontWeight: '700' },
});
