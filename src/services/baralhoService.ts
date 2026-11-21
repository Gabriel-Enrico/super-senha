
import { getDatabase } from '../database/sqlite';
import type { Baralho } from '../types/baralho';

export async function criarBaralho(
  baralho: Omit<Baralho, 'id'>
): Promise<number | null> {
  try {
    const db = await getDatabase();

    const resultado = await db.runAsync(
      'INSERT INTO baralhos (usuario_id, tema_id, nome) VALUES (?, ?, ?)',
      [baralho.usuario_id, baralho.tema_id, baralho.nome.trim()]
    );

    return resultado.lastInsertRowId;
  } catch (error) {
    console.error('Erro ao criar baralho:', error);
    return null;
  }
}

export async function listarBaralhos(
  usuarioId: string,
  temaId: string
): Promise<Baralho[]> {
  const db = await getDatabase();

  return await db.getAllAsync<Baralho>(
    'SELECT * FROM baralhos WHERE usuario_id = ? AND tema_id = ? ORDER BY id DESC',
    [usuarioId, temaId]
  );
}

export async function atualizarBaralho(
  id: number,
  usuarioId: string,
  nome: string
): Promise<boolean> {
  try {
    const db = await getDatabase();

    const resultado = await db.runAsync(
      'UPDATE baralhos SET nome = ? WHERE id = ? AND usuario_id = ?',
      [nome.trim(), id, usuarioId]
    );

    return resultado.changes > 0;
  } catch (error) {
    console.error('Erro ao atualizar baralho:', error);
    return false;
  }
}

export async function deletarBaralho(
  id: number,
  usuarioId: string
): Promise<boolean> {
  try {
    const db = await getDatabase();

    const resultado = await db.runAsync(
      'DELETE FROM baralhos WHERE id = ? AND usuario_id = ?',
      [id, usuarioId]
    );

    return resultado.changes > 0;
  } catch (error) {
    console.error('Erro ao deletar baralho:', error);
    return false;
  }
}

export async function atualizarTemaNosBaralhos(
  usuarioId: string,
  temaIdAntigo: string,
  temaIdNovo: string
): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    'UPDATE baralhos SET tema_id = ? WHERE usuario_id = ? AND tema_id = ?',
    [temaIdNovo, usuarioId, temaIdAntigo]
  );
}

export async function deletarBaralhosDoTema(
  usuarioId: string,
  temaId: string
): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    'DELETE FROM baralhos WHERE usuario_id = ? AND tema_id = ?',
    [usuarioId, temaId]
  );
}