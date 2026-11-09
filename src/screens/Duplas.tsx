import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Duplas'>;

export default function Duplas({ route }: Props) {
  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={route.params.duplas}
        keyExtractor={(_, index) => String(index)}
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
