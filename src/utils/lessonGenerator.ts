import { Cantiga, Exercicio, Licao, Verso, ProgressoUsuario } from '../types';

/**
 * Pure logic utility for generating Duolingo-style interactive exercises
 * from registered Ketu cantigas and calculating progress / achievements.
 */

// Shuffles an array with Fisher-Yates algorithm
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Clean words from punctuation for gap fill
export function cleanWord(w: string): string {
  return w.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, '').trim();
}

/**
 * Generates 5 to 10 Duolingo-style exercises from a Cantiga's verses.
 */
export function generateExercisesForCantiga(cantiga: Cantiga, allCantigas: Cantiga[] = []): Exercicio[] {
  const exercises: Exercicio[] = [];
  const verses = cantiga.versos;

  if (!verses || verses.length === 0) return exercises;

  // 1. Ouvir o trecho e escolher o verso correto
  verses.forEach((v, idx) => {
    // Generate distractors from other verses of the same or other cantigas
    const otherVersesText = allCantigas
      .flatMap((c) => c.versos)
      .filter((other) => other.id !== v.id && other.ioruba !== v.ioruba)
      .map((other) => other.ioruba);

    // Fallback distractors
    const pool = otherVersesText.length >= 2 ? otherVersesText : [
      'Èṣù tirirí l’ònan',
      'Ọ̀ṣọ́ọ̀sì aró lé o, akẹran',
      'Patakorí Ògún, a kófíyàwó',
      'Ìyá omi o, Ọ̀ṣun orí omi',
    ].filter((t) => t !== v.ioruba);

    const distractors = shuffleArray(pool).slice(0, 2);
    const options = shuffleArray([v.ioruba, ...distractors]);

    exercises.push({
      tipo: 'ouvir_escolher',
      id: `ex-ouvir-${cantiga.id}-${idx}`,
      pergunta: 'Ouça a melodia sagrada e selecione o verso em iorubá correspondente:',
      versoAlvo: v,
      opcoes: options,
      respostaCorreta: v.ioruba,
    });
  });

  // 2. Completar a palavra que falta no verso
  verses.forEach((v, idx) => {
    const rawWords = v.ioruba.split(' ');
    const meaningfulWords = rawWords.filter((w) => cleanWord(w).length > 2);
    if (meaningfulWords.length > 0) {
      // Pick target word
      const targetWordWithPunct = meaningfulWords[idx % meaningfulWords.length];
      const targetWord = cleanWord(targetWordWithPunct);
      const escapedTarget = targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|\\s|[.,;!?'"()–—])${escapedTarget}($|\\s|[.,;!?'"()–—])`, 'i');
      const textoComLacuna = v.ioruba.replace(regex, '$1______$2');

      // Distractor words in Yoruba
      const allWords = allCantigas
        .flatMap((c) => c.versos)
        .flatMap((verse) => verse.ioruba.split(' '))
        .map(cleanWord)
        .filter((w) => w.length > 2 && w.toLowerCase() !== targetWord.toLowerCase());

      const fallbackWords = ['onirê', 'alákòró', 'mojúbà', 'wúrà', 'aríwó', 'kàwó', 'ẹwà', 'bàbá'];
      const distractorPool = allWords.length >= 3 ? allWords : fallbackWords;
      const distractorWords = shuffleArray(Array.from(new Set(distractorPool))).slice(0, 3);
      const options = shuffleArray([targetWord, ...distractorWords]);

      exercises.push({
        tipo: 'completar_palavra',
        id: `ex-lacuna-${cantiga.id}-${idx}`,
        pergunta: 'Complete a palavra sagrada que falta no verso:',
        versoOriginal: v,
        textoComLacuna,
        palavraOmitida: targetWord,
        opcoes: options,
      });
    }
  });

  // 3. Ligar o verso em iorubá à sua tradução
  if (verses.length >= 2) {
    const pairs = verses.slice(0, 3).map((v) => ({
      id: v.id,
      ioruba: v.ioruba,
      traducao: v.traducao,
    }));

    exercises.push({
      tipo: 'ligar_traducao',
      id: `ex-ligar-${cantiga.id}`,
      pergunta: 'Faça os pares corretos: ligue cada verso em iorubá à sua tradução em português:',
      pares: pairs,
    });
  }

  // 4. Colocar os versos na ordem certa do ritual
  if (verses.length >= 3) {
    exercises.push({
      tipo: 'ordenar_versos',
      id: `ex-ordenar-${cantiga.id}`,
      pergunta: 'Coloque os versos na ordem litúrgica correta em que são entoados:',
      versosEmbaralhados: shuffleArray(verses),
      ordemCorretaIds: verses.map((v) => v.id),
    });
  }

  // 5. Cantar junto: sincronia guiada de versos
  exercises.push({
    tipo: 'cantar_junto',
    id: `ex-cantar-${cantiga.id}`,
    pergunta: 'Hora do Xirê! Cante junto acompanhando a letra e a cadência dos atabaques:',
    versos: verses,
    duracaoTotalSegundos: Math.max(15, verses.length * 5),
  });

  // Shuffle and limit to 5-8 exercises per session for optimal micro-learning
  const uniqueExercises = shuffleArray(exercises).slice(0, 7);

  // Guarantee 'cantar_junto' is at the climax (last) if present
  const nonSing = uniqueExercises.filter((e) => e.tipo !== 'cantar_junto');
  const sing = exercises.find((e) => e.tipo === 'cantar_junto');
  if (sing) {
    return [...nonSing.slice(0, 5), sing];
  }

  return uniqueExercises;
}

export function buildLesson(cantiga: Cantiga, orixaNome: string, allCantigas: Cantiga[] = []): Licao {
  return {
    cantigaId: cantiga.id,
    tituloCantiga: cantiga.titulo,
    orixaNome: orixaNome,
    exercicios: generateExercisesForCantiga(cantiga, allCantigas),
  };
}

/**
 * Calculates XP earned based on accuracy and completion
 */
export function calculateLessonXP(correctAnswers: number, totalQuestions: number): number {
  if (totalQuestions === 0) return 0;
  const baseScore = correctAnswers * 15;
  const accuracy = correctAnswers / totalQuestions;
  const bonus = accuracy === 1 ? 50 : accuracy >= 0.8 ? 25 : 10;
  return baseScore + bonus;
}

/**
 * Update streak: increments if studied on next day, preserves if same day, resets to 1 if broken
 */
export function calculateStreak(currentStreak: number, lastDateISO: string, nowDate = new Date()): number {
  if (!lastDateISO) return 1;

  const lastDate = new Date(lastDateISO);
  const startOfToday = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()).getTime();
  const startOfLast = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()).getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const diffDays = Math.round((startOfToday - startOfLast) / oneDayMs);

  if (diffDays === 0) {
    // Already studied today
    return Math.max(1, currentStreak);
  } else if (diffDays === 1) {
    // Consecutive day
    return currentStreak + 1;
  } else {
    // Gap day, streak resets to 1
    return 1;
  }
}

/**
 * Checks which medals can be unlocked after lesson completion
 */
export function checkMedalUnlocks(
  progresso: ProgressoUsuario,
  allCantigas: Cantiga[],
  lastLessonAccuracy: number
): string[] {
  const newMedals: string[] = [];
  const learnedIds = new Set(progresso.cantigasAprendidas);

  // 1. Iniciação ao Xirê
  if (progresso.licoesFeitas >= 1 && !progresso.medalhasDesbloqueadas.includes('med-iniciacao')) {
    newMedals.push('med-iniciacao');
  }

  // 2. Guardião de Ogum (todas as cantigas revisadas de Ogum)
  const ogumSongs = allCantigas.filter((c) => c.orixaId === 'ogum' && c.revisada);
  const learnedOgum = ogumSongs.every((c) => learnedIds.has(c.id));
  if (ogumSongs.length > 0 && learnedOgum && !progresso.medalhasDesbloqueadas.includes('med-ogum')) {
    newMedals.push('med-ogum');
  }

  // 3. Filho das Águas (Oxum e Iemanjá)
  const hasOxum = allCantigas.some((c) => c.orixaId === 'oxum' && learnedIds.has(c.id));
  const hasIemanjaOrNana = allCantigas.some((c) => (c.orixaId === 'iemanja' || c.orixaId === 'oxum') && learnedIds.has(c.id));
  if (hasOxum && hasIemanjaOrNana && !progresso.medalhasDesbloqueadas.includes('med-aguas')) {
    newMedals.push('med-aguas');
  }

  // 4. Fogo Sagrado (Streak 7+)
  if (progresso.sequenciaDias >= 7 && !progresso.medalhasDesbloqueadas.includes('med-fogo')) {
    newMedals.push('med-fogo');
  }

  // 5. Ouvido de Alagbê (100% no teste)
  if (lastLessonAccuracy >= 1 && !progresso.medalhasDesbloqueadas.includes('med-ouvido')) {
    newMedals.push('med-ouvido');
  }

  // 6. Mestre da Roda (5+ cantigas)
  if (progresso.cantigasAprendidas.length >= 5 && !progresso.medalhasDesbloqueadas.includes('med-mestre')) {
    newMedals.push('med-mestre');
  }

  return newMedals;
}
