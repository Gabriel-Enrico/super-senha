import {
  collection,
  doc,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../config_firebase';

export type Categoria = {
  id: string;
  nome: string;
};

const wordFieldNames = ['palavra', 'palavras', 'word', 'words', 'nome', 'name'];
const metadataFieldNames = [
  'categoria',
  'category',
  'descricao',
  'description',
  'titulo',
  'title',
  'id',
  'createdat',
  'updatedat',
];

function stringsFromValue(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value.trim()].filter(Boolean);
  }

  if (Array.isArray(value)) {
    return value.flatMap(stringsFromValue);
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const matchingFields = Object.entries(record)
      .filter(([key]) => wordFieldNames.includes(key.toLowerCase()))
      .flatMap(([, fieldValue]) => stringsFromValue(fieldValue));

    if (matchingFields.length > 0) {
      return matchingFields;
    }

    return Object.values(record).flatMap(stringsFromValue);
  }

  return [];
}

function uniqueWords(words: string[]): string[] {
  return [...new Set(words.map((word) => word.trim()).filter(Boolean))];
}

export async function listarCategorias(): Promise<Categoria[]> {
  const snapshot = await getDocs(collection(db, 'categorias'));

  return snapshot.docs
    .map((categoryDocument) => ({
      id: categoryDocument.id,
      nome: categoryDocument.id,
    }))
    .sort((first, second) => first.nome.localeCompare(second.nome, 'pt-BR'));
}

export async function buscarPalavrasDaCategoria(
  categoriaId: string,
): Promise<string[]> {
  const categoryReference = doc(db, 'categorias', categoriaId);
  const categorySnapshot = await getDoc(categoryReference);

  if (!categorySnapshot.exists()) {
    throw new Error('Essa categoria não foi encontrada no Firestore.');
  }

  const categoryData = categorySnapshot.data();
  const fieldWords = uniqueWords(
    Object.entries(categoryData)
      .filter(([key]) => wordFieldNames.includes(key.toLowerCase()))
      .flatMap(([, value]) => stringsFromValue(value)),
  );

  if (fieldWords.length > 0) {
    return fieldWords;
  }

  // Também aceita estruturas simples como palavra1, palavra2 ou campos numéricos.
  const otherFieldWords = uniqueWords(
    Object.entries(categoryData)
      .filter(([key]) => !metadataFieldNames.includes(key.toLowerCase()))
      .flatMap(([, value]) => stringsFromValue(value)),
  );

  if (otherFieldWords.length > 0) {
    return otherFieldWords;
  }

  // Também aceita palavras salvas como documentos em categorias/{id}/palavras.
  const wordsSnapshot = await getDocs(
    collection(db, 'categorias', categoriaId, 'palavras'),
  );
  const subcollectionWords = wordsSnapshot.docs.flatMap((wordDocument) => {
    const dataWords = stringsFromValue(wordDocument.data());
    return dataWords.length > 0 ? dataWords : [wordDocument.id];
  });
  const words = uniqueWords(subcollectionWords);

  if (words.length === 0) {
    throw new Error(
      `A categoria “${categoriaId}” não tem palavras em uma lista ou na subcoleção “palavras”.`,
    );
  }

  return words;
}

export async function buscarFallbackAleatorioDoFirebase(): Promise<{
  categoriaId: string;
  palavras: string[];
}> {
  const categorias = await listarCategorias();
  const categoriaLivreIndex = categorias.findIndex(
    (categoria) => categoria.id.toLocaleLowerCase('pt-BR') === 'livre',
  );
  const categoriaLivre = categoriaLivreIndex >= 0
    ? categorias.splice(categoriaLivreIndex, 1)[0]
    : undefined;
  for (let index = categorias.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [categorias[index], categorias[randomIndex]] = [
      categorias[randomIndex],
      categorias[index],
    ];
  }
  if (categoriaLivre) categorias.unshift(categoriaLivre);

  for (const categoria of categorias) {
    try {
      const palavras = await buscarPalavrasDaCategoria(categoria.id);
      if (palavras.length >= 26) {
        const embaralhadas = [...palavras];
        for (let index = embaralhadas.length - 1; index > 0; index -= 1) {
          const randomIndex = Math.floor(Math.random() * (index + 1));
          [embaralhadas[index], embaralhadas[randomIndex]] = [
            embaralhadas[randomIndex],
            embaralhadas[index],
          ];
        }

        return {
          categoriaId: categoria.id,
          palavras: embaralhadas.slice(0, 26),
        };
      }
    } catch {
      // Tenta outra categoria; a tela mostrará erro se nenhuma puder ser lida.
    }
  }

  throw new Error('Não foi encontrada uma categoria do Firebase com pelo menos 26 palavras.');
}
