
import { getDatabase } from '../database/sqlite';
import type { Palavra } from '../types/palavras';

export async function criarPalavra(
  baralhoId: number,
  usuarioId: string,
  palavra: string
): Promise<boolean> {
  try {
    const db = await getDatabase();

    if (!palavra.trim()) return false;

    const resultado = await db.runAsync(
      `INSERT INTO palavras (baralho_id, palavra)
       SELECT id, ? FROM baralhos
       WHERE id = ? AND usuario_id = ?`,
      [palavra.trim(), baralhoId, usuarioId]
    );

    return resultado.changes > 0;
  } catch (error) {
    console.error('Erro ao criar palavra:', error);
    return false;
  }
}

export async function listarPalavras(
  baralhoId: number,
  usuarioId: string
): Promise<Palavra[]> {
  const db = await getDatabase();

  return await db.getAllAsync<Palavra>(
    `SELECT palavras.*
     FROM palavras
     INNER JOIN baralhos ON baralhos.id = palavras.baralho_id
     WHERE palavras.baralho_id = ? AND baralhos.usuario_id = ?
     ORDER BY palavras.id ASC`,
    [baralhoId, usuarioId]
  );
}

export async function atualizarPalavra(
  id: number,
  baralhoId: number,
  usuarioId: string,
  palavra: string
): Promise<boolean> {
  try {
    const db = await getDatabase();

    if (!palavra.trim()) return false;

    const resultado = await db.runAsync(
      `UPDATE palavras
       SET palavra = ?
       WHERE id = ?
       AND baralho_id = ?
       AND EXISTS (
         SELECT 1 FROM baralhos
         WHERE baralhos.id = palavras.baralho_id
         AND baralhos.usuario_id = ?
       )`,
      [palavra.trim(), id, baralhoId, usuarioId]
    );

    return resultado.changes > 0;
  } catch (error) {
    console.error('Erro ao atualizar palavra:', error);
    return false;
  }
}

export async function deletarPalavra(
  id: number,
  baralhoId: number,
  usuarioId: string
): Promise<boolean> {
  try {
    const db = await getDatabase();

    const resultado = await db.runAsync(
      `DELETE FROM palavras
       WHERE id = ?
       AND baralho_id = ?
       AND EXISTS (
         SELECT 1 FROM baralhos
         WHERE baralhos.id = palavras.baralho_id
         AND baralhos.usuario_id = ?
       )`,
      [id, baralhoId, usuarioId]
    );

    return resultado.changes > 0;
  } catch (error) {
    console.error('Erro ao deletar palavra:', error);
    return false;
  }
}
