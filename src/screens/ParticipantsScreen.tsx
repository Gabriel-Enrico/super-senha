import { TextInput, View } from 'react-native';
import { GameScreenLayout, MenuAction, PixelText } from '../features/game-setup/GameUI';
import { useGameSetup } from '../features/game-setup/gameSetup';
import { gameStyles, ink } from '../features/game-setup/gameTheme';

export default function ParticipantsScreen() {
  const { setup, setName } = useGameSetup();

  return (
    <GameScreenLayout title="Participantes" subtitle="OS NOMES SÃO OPCIONAIS"
      footer={<MenuAction title="Montar duplas" next="Duplas" />}>
      <View style={gameStyles.section}>
        {Array.from({ length: setup.players }, (_, i) => (
          <View key={i} style={gameStyles.stack}>
            <PixelText kind="detail">Jogador {i + 1}</PixelText>
            <TextInput
              accessibilityLabel={`Nome do jogador ${i + 1}`}
              placeholder={`Jogador ${i + 1}`}
              placeholderTextColor={ink.dim}
              autoCapitalize="words"
              maxLength={36}
              value={setup.names[i]}
              onChangeText={(name) => setName(i, name)}
              style={gameStyles.input}
            />
          </View>
        ))}
      </View>
    </GameScreenLayout>
  );
}
