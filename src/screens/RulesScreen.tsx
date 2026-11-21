import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GameScreenLayout, MenuAction, PixelText, ProgressIndicator } from '../features/game-setup/GameUI';
import { gameStyles, ink } from '../features/game-setup/gameTheme';
import SfxPressable from '../features/sfx/SfxPressable';
import { useSuitNavigation } from '../features/suit-transition/suitRoutes';

const LESSONS = [
  {
    icon: '♠', title: 'O jogo em duplas',
    paragraphs: ['Em cada dupla, uma pessoa lê as palavras do card e marca os acertos. A outra tenta adivinhar as palavras.'],
  },
  {
    icon: '♦', title: 'Como avançar',
    paragraphs: ['A dupla pode escolher qualquer palavra do card para começar. Marque cada palavra quando ela for acertada.',
      'A dupla avança ao acertar cinco palavras. No card final, precisa acertar todas as palavras.'],
  },
  {
    icon: '♣', title: 'Exemplo de rodada',
    paragraphs: ['Quem lê anuncia uma palavra do card e acompanha os acertos.',
      'A outra pessoa diz seus palpites. Quando acertar, quem lê marca a palavra e passa para outra.'],
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
            <SfxPressable onPress={() => setIndex(index - 1)} style={styles.previous}>
              <PixelText kind="detail">Página anterior</PixelText>
            </SfxPressable>
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
