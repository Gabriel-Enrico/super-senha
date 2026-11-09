import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import AnimatedButton from '../components/AnimatedButton';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function Home({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <AnimatedButton
        title="Iniciar Jogo"
        onPress={() => navigation.navigate('Iniciar')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#23212C',
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    color: '#F1FECB',
  },
});
