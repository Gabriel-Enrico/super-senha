import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../../config_firebase';

export type TemaSalvo = { id: string; tema: string; palavrasUsadas: string[] };
const MAX_WORD_HISTORY = 200;

function temaCollection(uid: string) {
  return collection(db, 'users', uid, 'temas');
}

function temaDocument(uid: string, tema: string) {
  const id = encodeURIComponent(tema.trim().toLocaleLowerCase('pt-BR'));
  return doc(temaCollection(uid), id);
}

function normalizeWord(word: string) {
  return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export async function buscarPalavrasUsadas(uid: string, tema: string): Promise<string[]> {
  const snapshot = await getDoc(temaDocument(uid, tema));
  const words = snapshot.data()?.palavrasUsadas;
  return Array.isArray(words) ? words.filter((word): word is string => typeof word === 'string') : [];
}

export async function salvarTema(uid: string, tema: string, novasPalavras: string[] = []) {
  const reference = temaDocument(uid, tema);
  const previous = await getDoc(reference);
  const previousWords = previous.data()?.palavrasUsadas;
  const history = Array.isArray(previousWords)
    ? previousWords.filter((word): word is string => typeof word === 'string')
    : [];
  const unique = new Map<string, string>();
  [...history, ...novasPalavras].forEach((word) => {
    const trimmed = word.trim();
    if (trimmed) unique.set(normalizeWord(trimmed), trimmed);
  });

  await setDoc(reference, {
    tema: tema.trim(),
    palavrasUsadas: [...unique.values()].slice(-MAX_WORD_HISTORY),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function listarTemasSalvos(uid: string): Promise<TemaSalvo[]> {
  const snapshot = await getDocs(query(temaCollection(uid), orderBy('updatedAt', 'desc')));
  return snapshot.docs.flatMap((savedTopic) => {
    const tema = savedTopic.data().tema;
    return typeof tema === 'string' && tema.trim()
      ? [{
          id: savedTopic.id,
          tema,
          palavrasUsadas: Array.isArray(savedTopic.data().palavrasUsadas)
            ? savedTopic.data().palavrasUsadas.filter((word: unknown): word is string => typeof word === 'string')
            : [],
        }]
      : [];
  });
}

export async function atualizarTema(
  uid: string,
  id: string,
  novoTema: string
): Promise<string> {
  const nome = novoTema.trim();

  if (!nome) {
    throw new Error('O nome do tema não pode ficar vazio.');
  }

  const referenciaAntiga = doc(temaCollection(uid), id);
  const documentoAntigo = await getDoc(referenciaAntiga);

  if (!documentoAntigo.exists()) {
    throw new Error('Tema não encontrado.');
  }

  const novoId = encodeURIComponent(
    nome.toLocaleLowerCase('pt-BR')
  );

  const referenciaNova = doc(temaCollection(uid), novoId);

  const historicoAntigo = documentoAntigo.data().palavrasUsadas;

  if (novoId === id) {
    await setDoc(referenciaAntiga, {
      tema: nome,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return novoId;
  }

  const documentoNovo = await getDoc(referenciaNova);
  const historicoNovo = documentoNovo.data()?.palavrasUsadas;

  const palavras = [
    ...(Array.isArray(historicoAntigo) ? historicoAntigo : []),
    ...(Array.isArray(historicoNovo) ? historicoNovo : []),
  ];

  const unicas = new Map<string, string>();

  palavras.forEach((palavra) => {
    if (typeof palavra === 'string' && palavra.trim()) {
      const limpa = palavra.trim();
      unicas.set(normalizeWord(limpa), limpa);
    }
  });

  await setDoc(referenciaNova, {
    tema: nome,
    palavrasUsadas: [...unicas.values()].slice(-MAX_WORD_HISTORY),
    updatedAt: serverTimestamp(),
  }, { merge: true });

  await deleteDoc(referenciaAntiga);

  return novoId;
}

export async function deletarTema(
  uid: string,
  id: string
): Promise<void> {
  await deleteDoc(doc(temaCollection(uid), id));
}