import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanWord,
  shuffleArray,
  generateExercisesForCantiga,
  calculateLessonXP,
  calculateStreak,
  checkMedalUnlocks,
} from './lessonGenerator';
import { Cantiga, ProgressoUsuario } from '../types';

const sampleCantiga: Cantiga = {
  id: 'ogum-teste',
  titulo: 'Ogum Teste',
  orixaId: 'ogum',
  tipoId: 'xire',
  toqueAtabaque: 'Bravum',
  revisada: true,
  ehExemplo: true,
  quandoCantada: 'Momento de teste',
  observacoes: 'Sem observações',
  versos: [
    {
      id: 'v1',
      ordem: 1,
      ioruba: 'Ògún onirê, onirê Ògún',
      pronuncia: 'Ogum onirê, onirê Ogum',
      traducao: 'Ogum, senhor da cidade de Irê',
    },
    {
      id: 'v2',
      ordem: 2,
      ioruba: 'Alákòró onirê, Ògún jà',
      pronuncia: 'Alacorô onirê, Ogum já',
      traducao: 'Dono do capacete de guerreiro',
    },
    {
      id: 'v3',
      ordem: 3,
      ioruba: 'Patakorí Ògún, a kófíyàwó',
      pronuncia: 'Patacorí Ogum, a cofiauô',
      traducao: 'Salve a cabeça de Ogum',
    },
  ],
  criadoEm: '2026-01-01',
  atualizadoEm: '2026-01-01',
};

test('cleanWord strips punctuation and trims correctly', () => {
  assert.equal(cleanWord('mojúbà,'), 'mojúbà');
  assert.equal(cleanWord('"alákòró"'), 'alákòró');
  assert.equal(cleanWord('  èṣù!  '), 'èṣù');
});

test('shuffleArray preserves length and items', () => {
  const original = ['A', 'B', 'C', 'D'];
  const shuffled = shuffleArray(original);
  assert.equal(shuffled.length, original.length);
  assert.deepEqual(new Set(shuffled), new Set(original));
});

test('generateExercisesForCantiga creates required exercise types', () => {
  const exercises = generateExercisesForCantiga(sampleCantiga, [sampleCantiga]);
  assert.ok(exercises.length > 0, 'Should generate exercises');

  const types = exercises.map((e) => e.tipo);
  assert.ok(
    types.includes('ouvir_escolher') ||
    types.includes('completar_palavra') ||
    types.includes('ligar_traducao') ||
    types.includes('ordenar_versos') ||
    types.includes('cantar_junto'),
    'Should include Duolingo exercise types'
  );
});

test('calculateLessonXP gives accurate score and bonuses', () => {
  // Perfect score: 5/5 -> 5*15 + 50 = 125
  assert.equal(calculateLessonXP(5, 5), 125);

  // 4/5 = 80% -> 4*15 + 25 = 85
  assert.equal(calculateLessonXP(4, 5), 85);

  // 2/5 = 40% -> 2*15 + 10 = 40
  assert.equal(calculateLessonXP(2, 5), 40);

  // 0 questions -> 0
  assert.equal(calculateLessonXP(0, 0), 0);
});

test('calculateStreak correctly increments on consecutive day, preserves same day, resets on gap', () => {
  const today = new Date('2026-03-10T12:00:00Z');

  // Same day
  assert.equal(calculateStreak(5, '2026-03-10T08:00:00Z', today), 5);

  // Yesterday -> consecutive day
  assert.equal(calculateStreak(5, '2026-03-09T18:00:00Z', today), 6);

  // 3 days ago -> gap, resets to 1
  assert.equal(calculateStreak(10, '2026-03-05T12:00:00Z', today), 1);
});

test('checkMedalUnlocks identifies newly earned medals', () => {
  const mockProgresso: ProgressoUsuario = {
    usuarioId: 'u1',
    cantigasAprendidas: ['ogum-teste'],
    pontos: 300,
    sequenciaDias: 7,
    ultimaAtividadeData: new Date().toISOString(),
    licoesFeitas: 5,
    medalhasDesbloqueadas: [],
  };

  const unlocked = checkMedalUnlocks(mockProgresso, [sampleCantiga], 1.0);
  assert.ok(unlocked.includes('med-iniciacao'), 'Should unlock First Lesson');
  assert.ok(unlocked.includes('med-ogum'), 'Should unlock Ogum guardian because all Ogum cantigas are learned');
  assert.ok(unlocked.includes('med-fogo'), 'Should unlock Sacred Fire for 7-day streak');
  assert.ok(unlocked.includes('med-ouvido'), 'Should unlock Sharp Ear for 100% accuracy');
});
