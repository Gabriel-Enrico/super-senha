const REQUEST_TIMEOUT_MS = 40_000;
const MIN_WORDS = 4;
const MAX_WORDS = 8;
const COOLDOWN_MS = 30_000;

let lastRequestAt = 0;

function normalizeForComparison(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]+/g, ' ')
    .trim();
}

function validateWords(value: unknown, tema: string): string[] {
  if (!Array.isArray(value) || !value.every((word) => typeof word === 'string')) {
    throw new Error('A IA retornou uma lista em formato inválido.');
  }

  const termosDoTema = new Set(normalizeForComparison(tema).split(' '));
  const seen = new Set<string>();
  const palavras = value
    .map((word) => word.trim())
    .filter((word) => {
      const normalized = normalizeForComparison(word);
      if (!/^[a-z]{4,10}$/.test(normalized)) return false;
      if (termosDoTema.has(normalized) || seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    })
    .slice(0, MAX_WORDS);

  if (palavras.length < MIN_WORDS) {
    throw new Error('A IA não retornou palavras suficientes para a rodada.');
  }

  return palavras;
}

export async function gerarPalavrasPorTema(tema: string): Promise<string[]> {
  const trimmedTopic = tema.trim();
  if (!trimmedTopic || trimmedTopic.length > 60) {
    throw new Error('Digite um tema de até 60 caracteres.');
  }

  const workerUrl = process.env.EXPO_PUBLIC_AI_WORKER_URL?.trim();
  if (!workerUrl) {
    throw new Error('O endereço do serviço de IA ainda não foi configurado.');
  }

  const now = Date.now();
  if (now - lastRequestAt < COOLDOWN_MS) {
    throw new Error('Aguarde alguns segundos antes de pedir outro tema à IA.');
  }
  lastRequestAt = now;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tema: trimmedTopic }),
      signal: controller.signal,
    });

    const responseBody = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('A cota gratuita da IA está ocupada.');
      }
      throw new Error(
        typeof responseBody?.error === 'string'
          ? responseBody.error
          : 'O serviço de IA não conseguiu gerar as palavras.',
      );
    }

    return validateWords(responseBody?.palavras, trimmedTopic);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('A IA demorou demais para responder.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
