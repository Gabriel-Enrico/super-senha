import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GameScreenLayout, MenuAction, PixelText, ProgressIndicator } from '../features/game-setup/GameUI';
import { gameStyles, ink } from '../features/game-setup/gameTheme';
import { useSuitNavigation } from '../features/suit-transition/suitRoutes';

const LESSONS = [
  {
    icon: '♠', title: 'O jogo em duplas',
    paragraphs: ['Uma pessoa recebe uma palavra secreta. A outra tenta descobrir a senha com a ajuda das dicas.'],
  },
  {
    icon: '♦', title: 'Uma palavra por vez',
    paragraphs: ['Dê uma dica de uma palavra sem revelar a senha. Sua dupla responde com uma tentativa de uma palavra.',
      'Se a tentativa estiver errada, dê outra dica enquanto houver tempo na carta.'],
  },
  {
    icon: '♣', title: 'Exemplo de rodada',
    paragraphs: ['Senha: farol', 'Dica: luz → Palpite: lanterna', 'Dica: costa → Palpite: farol!'],
  },
] as const;

export default function RulesScreen() {
  const [index, setIndex] = useState(0);
  const { back, actionId } = useSuitNavigation();
  const current = LESSONS[index];
  const last = index === LESSONS.length - 1;

  return (
    <GameScreenLayout
      title="Regras"
      subtitle="COMO JOGAR"
      center
      footer={
        <>
          <ProgressIndicator total={LESSONS.length} value={index + 1} label={`Página ${index + 1} de ${LESSONS.length}`} />
          {index > 0 && (
            <Pressable accessibilityRole="button" onPress={() => setIndex(index - 1)} style={styles.previous}>
              <PixelText kind="detail">Página anterior</PixelText>
            </Pressable>
          )}
          <MenuAction title={last ? 'Concluir' : 'Próximo'}
            onPress={() => last ? back(actionId) : setIndex(index + 1)} />
        </>
      }
    >
      <View style={styles.lesson} accessibilityLiveRegion="polite">
        <View pointerEvents="none">
          <View style={styles.emblem}><Text style={styles.emblemText}>{current.icon}</Text></View>
        </View>
        <PixelText kind="heading" style={styles.centered}>{current.title}</PixelText>
        {current.paragraphs.map((paragraph) => (
          <PixelText key={paragraph} style={styles.centered}>{paragraph}</PixelText>
        ))}
      </View>
    </GameScreenLayout>
  );
}

const styles = StyleSheet.create({
  lesson: { ...gameStyles.center, gap: 15, paddingHorizontal: 8 },
  emblem: {
    width: 65, height: 84, backgroundColor: ink.white, alignItems: 'center', justifyContent: 'center',
    borderRadius: 4, transform: [{ rotate: '-9deg' }], marginBottom: 6,
  },
  emblemText: { color: '#111', fontSize: 40, lineHeight: 50 },
  centered: { textAlign: 'center' },
  previous: { alignSelf: 'center', paddingHorizontal: 14, minHeight: 35, justifyContent: 'center' },
});
