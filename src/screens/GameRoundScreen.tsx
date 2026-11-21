import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { GameScreenLayout, PixelText } from '../features/game-setup/GameUI';
import { getCardSizes, getPlayerName, useGameSetup } from '../features/game-setup/gameSetup';
import { gameStyles, ink } from '../features/game-setup/gameTheme';
import SfxPressable from '../features/sfx/SfxPressable';
import { playSfx, stopSfx } from '../features/sfx/sfx';
import type { RootStackParamList } from '../navigation/AppNavigator';

type TurnStatus = 'countdown' | 'playing' | 'passed' | 'failed' | 'complete' | 'no-cards';

function shuffled<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function drawNewCard(words: string[], size: number, usedCards: Set<string>): string[] | null {
  if (words.length < size) return null;

  for (let attempt = 0; attempt < 300; attempt += 1) {
    const card = shuffled(words).slice(0, size);
    const signature = card
      .map((word) => word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase())
      .sort()
      .join('|');
    if (usedCards.has(signature)) continue;
    usedCards.add(signature);
    return card;
  }

  return null;
}

function findNextTeam(stages: number[], start: number, totalStages: number): number | null {
  for (let offset = 1; offset <= stages.length; offset += 1) {
    const index = (start + offset) % stages.length;
    if (stages[index] < totalStages) return index;
  }
  return null;
}

export default function GameRoundScreen() {
  const { setup } = useGameSetup();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  const cardSizes = useMemo(() => getCardSizes(setup.mode), [setup.mode]);
  const teamCount = setup.players / 2;
  const usedCards = useRef(new Set<string>());
  const turnResolved = useRef(false);

  const [teamStages, setTeamStages] = useState<number[]>(() => Array(teamCount).fill(0));
  const [teamIndex, setTeamIndex] = useState(0);
  const [nextTeamIndex, setNextTeamIndex] = useState<number | null>(null);
  const [winner, setWinner] = useState('');
  const [cardWords, setCardWords] = useState<string[]>(() => {
    const firstSize = getCardSizes(setup.mode)[0];
    return drawNewCard(setup.words, firstSize, usedCards.current) ?? [];
  });
  const [checkedWords, setCheckedWords] = useState<Set<number>>(() => new Set());
  const [timeRemaining, setTimeRemaining] = useState<number>(setup.seconds);
  const [countdown, setCountdown] = useState(3);
  const [status, setStatus] = useState<TurnStatus>('countdown');

  const stageIndex = teamStages[teamIndex] ?? 0;
  const stageNumber = stageIndex + 1;
  const stageSize = cardSizes[stageIndex];
  const target = Math.min(5, stageSize ?? 0);
  const readerName = getPlayerName(setup.names, teamIndex * 2);
  const guesserName = getPlayerName(setup.names, teamIndex * 2 + 1);
  const teamName = `${readerName} e ${guesserName}`;
  const allCardsHaveWords = cardSizes.every((size) => setup.words.length >= size);
  const hasPlayableCard = allCardsHaveWords && cardWords.length > 0;
  const startingCountdown = status === 'countdown' && countdown === 3;

  const finishTurn = useCallback((passed: boolean) => {
    if (turnResolved.current) return;
    turnResolved.current = true;
    const updatedStages = [...teamStages];
    if (passed) {
      playSfx('roundWin');
      updatedStages[teamIndex] += 1;
    }
    setTeamStages(updatedStages);

    if (passed && updatedStages[teamIndex] >= cardSizes.length) {
      setWinner(teamName);
      setStatus('complete');
      return;
    }

    setNextTeamIndex(findNextTeam(updatedStages, teamIndex, cardSizes.length));
    setStatus(passed ? 'passed' : 'failed');
  }, [cardSizes.length, teamIndex, teamStages]);

  useEffect(() => {
    if (!isFocused || !hasPlayableCard || !startingCountdown) return;
    const start = setTimeout(() => {
      stopSfx('countdownGo');
      playSfx('countdown');
    }, 0);
    return () => clearTimeout(start);
  }, [hasPlayableCard, isFocused, startingCountdown]);

  useEffect(() => {
    if (!isFocused || !hasPlayableCard || status !== 'complete') return;
    playSfx('matchWin');
    return () => stopSfx('matchWin');
  }, [hasPlayableCard, isFocused, status]);

  useFocusEffect(useCallback(() => () => {
    stopSfx('countdown');
    stopSfx('countdownGo');
    stopSfx('roundWin');
  }, []));

  useEffect(() => {
    if (status !== 'countdown') return undefined;
    const timeout = setTimeout(() => {
      if (countdown <= 1) {
        if (hasPlayableCard && navigation.isFocused()) playSfx('countdownGo');
        setCountdown(0);
        setStatus('playing');
      } else {
        setCountdown((value) => value - 1);
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [countdown, hasPlayableCard, navigation, status]);

  useEffect(() => {
    if (status !== 'playing') return undefined;
    const interval = setInterval(() => {
      setTimeRemaining((remaining) => Math.max(0, remaining - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status === 'playing' && timeRemaining === 0) {
      finishTurn(checkedWords.size >= target);
    }
  }, [checkedWords.size, finishTurn, status, target, timeRemaining]);

  useEffect(() => {
    if (status === 'playing' && checkedWords.size >= target) {
      finishTurn(true);
    }
  }, [checkedWords.size, finishTurn, status, target]);

  const toggleWord = (index: number) => {
    if (status !== 'playing') return;
    const updated = new Set(checkedWords);
    if (updated.has(index)) updated.delete(index);
    else updated.add(index);
    setCheckedWords(updated);
  };

  const startNextCard = () => {
    stopSfx('roundWin');
    const nextTeam = nextTeamIndex ?? teamIndex;
    const nextStage = teamStages[nextTeam];
    const nextSize = cardSizes[nextStage];
    const newCard = drawNewCard(setup.words, nextSize, usedCards.current);
    if (!newCard) {
      setStatus('no-cards');
      return;
    }

    setTeamIndex(nextTeam);
    setCardWords(newCard);
    setCheckedWords(new Set());
    setTimeRemaining(setup.seconds);
    setCountdown(3);
    turnResolved.current = false;
    setStatus('countdown');
  };

  if (!hasPlayableCard) {
    return (
      <GameScreenLayout title="Baralho incompleto" subtitle="NÃO HÁ PALAVRAS SUFICIENTES" showBack={false}>
        <View style={gameStyles.panel}>
          <PixelText>Este modo precisa de pelo menos {Math.max(...cardSizes)} palavras para montar cada card.</PixelText>
        </View>
      </GameScreenLayout>
    );
  }

  return (
    <GameScreenLayout
      title={status === 'complete' ? 'Vitória!' : status === 'passed' ? 'Fase concluída' : status === 'failed' ? 'Tempo encerrado' : status === 'no-cards' ? 'Sem novos cards' : `Fase ${stageNumber}/${cardSizes.length}`}
      subtitle={status === 'playing' || status === 'countdown' ? `VEZ DE ${teamName.toLocaleUpperCase('pt-BR')}` : 'SUPER SENHA'}
      showBack={false}
      footer={status === 'complete' ? (
        <>
          <RoundButton
            title="Voltar ao menu"
            onPress={() => {
              stopSfx('matchWin');
              navigation.reset({ index: 0, routes: [{ name: 'Menu' }] });
            }}
          />
          <RoundButton
            title="Jogar novamente"
            onPress={() => {
              stopSfx('matchWin');
              navigation.reset({ index: 0, routes: [{ name: 'Partida' }] });
            }}
          />
        </>
      ) : status === 'passed' || status === 'failed' ? (
        <RoundButton
          title="Continuar"
          onPress={startNextCard}
        />
      ) : undefined}
    >
      {status === 'countdown' ? (
        <View style={styles.readyContent}>
          <View style={gameStyles.panel}>
            <PixelText kind="label">LÊ O CARD E MARCA OS ACERTOS</PixelText>
            <PixelText kind="heading">{readerName}</PixelText>
            <PixelText kind="label">ADIVINHA AS PALAVRAS</PixelText>
            <PixelText kind="heading">{guesserName}</PixelText>
          </View>
          <PixelText kind="title" style={styles.countdown}>{countdown}</PixelText>
        </View>
      ) : status === 'playing' ? (
        <View style={styles.content}>
          <PixelText kind="heading" style={[styles.timer, timeRemaining <= 10 && styles.timerUrgent]}>
            {Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </PixelText>

          <View style={gameStyles.stack} accessible accessibilityLabel="Palavras do card">
            {cardWords.map((word, index) => {
              const checked = checkedWords.has(index);
              return (
                <SfxPressable
                  sound="secondary"
                  key={`${word}-${index}`}
                  accessibilityRole="checkbox"
                  accessibilityLabel={word}
                  aria-checked={checked}
                  onPress={() => toggleWord(index)}
                  style={({ pressed }) => [styles.wordRow, checked && styles.wordChecked, pressed && styles.wordPressed]}
                >
                  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                    {checked ? <PixelText style={styles.checkmark}>✓</PixelText> : null}
                  </View>
                  <PixelText kind="heading" style={[styles.wordText, checked && styles.wordTextChecked]}>
                    {word}
                  </PixelText>
                </SfxPressable>
              );
            })}
          </View>
        </View>
      ) : status === 'passed' ? (
        <View style={gameStyles.panel}>
          <PixelText kind="heading">A dupla avançou para a próxima fase.</PixelText>
        </View>
      ) : status === 'failed' ? (
        <View style={gameStyles.panel}>
          <PixelText kind="heading">{nextTeamIndex !== teamIndex ? 'A vez passou para a próxima dupla.' : 'A dupla continua nesta fase.'}</PixelText>
        </View>
      ) : status === 'no-cards' ? (
        <View style={gameStyles.panel}>
          <PixelText kind="heading">Não consegui montar outro card sem repetir a combinação.</PixelText>
          <PixelText kind="detail">Inicie uma nova partida ou carregue mais palavras para continuar.</PixelText>
        </View>
      ) : (
        <View style={gameStyles.panel}>
          <PixelText kind="label">DUPLA VENCEDORA</PixelText>
          <PixelText kind="title" style={styles.winner}>{winner}</PixelText>
        </View>
      )}
    </GameScreenLayout>
  );
}

function RoundButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <SfxPressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <PixelText kind="heading" style={styles.buttonText}>{title}</PixelText>
    </SfxPressable>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12 },
  readyContent: { flex: 1, justifyContent: 'center', gap: 22 },
  countdown: { fontSize: 88, lineHeight: 96, textAlign: 'center' },
  timer: { textAlign: 'center' },
  timerUrgent: { color: '#ff7777' },
  winner: { textAlign: 'center' },
  wordRow: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: ink.line,
    backgroundColor: ink.panel,
    paddingHorizontal: 14,
  },
  wordChecked: { borderColor: ink.white, backgroundColor: '#25252a' },
  wordPressed: { opacity: 0.75 },
  checkbox: {
    width: 25,
    height: 25,
    borderWidth: 1,
    borderColor: ink.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: ink.white, borderColor: ink.white },
  checkmark: { color: '#111', fontSize: 18 },
  wordText: { flex: 1, textTransform: 'capitalize' },
  wordTextChecked: { color: ink.white },
  button: {
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ink.white,
    borderColor: ink.white,
    borderWidth: 2,
    paddingHorizontal: 10,
    transform: [{ skewX: '-7deg' }],
  },
  buttonText: { color: '#111', textAlign: 'center' },
  buttonPressed: { opacity: 0.72 },
});
