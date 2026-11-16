import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Iniciar'>;

export default function IniciarJogo({ navigation }: Props) {
  const [quantidadeJogadores, setQuantidadeJogadores] = useState(2);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quantidade de jogadores</Text>
      <Text style={styles.subtitle}>Escolha quantas pessoas irão jogar</Text>

      <View style={styles.counter}>
        <Pressable
          style={[styles.counterButton, quantidadeJogadores === 2 && styles.disabledButton]}
          onPress={() =>
            setQuantidadeJogadores((current) => Math.max(current - 2, 2))
          }
          disabled={quantidadeJogadores === 2}
        >
          <Text style={styles.counterButtonText}>−</Text>
        </Pressable>

        <View style={styles.numberContainer}>
          <Text style={styles.number}>{quantidadeJogadores}</Text>
          <Text style={styles.playerLabel}>jogadores</Text>
        </View>

        <Pressable
          style={[styles.counterButton, quantidadeJogadores === 8 && styles.disabledButton]}
          onPress={() =>
            setQuantidadeJogadores((current) => Math.min(current + 2, 8))
          }
          disabled={quantidadeJogadores === 8}
        >
          <Text style={styles.counterButtonText}>+</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() =>
          navigation.navigate('Participantes', {
            quantidadeJogadores,
          })
        }
        style={styles.continueButton}
      >
        <Text style={styles.continueText}>Continuar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23212C',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
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
    marginBottom: 48,
  },
  counter: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  counterButton: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#F1FECB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: { opacity: 0.35 },
  counterButtonText: {
    color: '#23212C',
    fontSize: 32,
    fontWeight: '500',
    lineHeight: 34,
  },
  numberContainer: { alignItems: 'center', justifyContent: 'center' },
  number: { color: '#F1FECB', fontSize: 64, fontWeight: '700' },
  playerLabel: { color: '#B8B7BE', fontSize: 14, marginTop: -4 },
  continueButton: {
    position: 'absolute',
    bottom: 40,
    width: '90%',
    backgroundColor: '#F1FECB',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueText: { color: '#23212C', fontSize: 17, fontWeight: '700' },
});
