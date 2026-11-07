import test from 'node:test';
import assert from 'node:assert/strict';
import { GLOSSARIO_TERMOS } from '../data/glossarioData';
import { SEED_ORIXAS } from '../data/seedData';

test('GLOSSARIO_TERMOS has at least 20 terms and complete liturgical data', () => {
  assert.ok(GLOSSARIO_TERMOS.length >= 20, 'Should have at least 20 terms');

  const orixaIds = SEED_ORIXAS.map((o) => o.id);

  GLOSSARIO_TERMOS.forEach((termo) => {
    assert.ok(termo.id, 'Every term must have an id');
    assert.ok(termo.termo && termo.termo.trim().length > 0, `Term ${termo.id} must have a name`);
    assert.ok(
      termo.pronunciaFonetica && termo.pronunciaFonetica.trim().length > 0,
      `Term ${termo.id} must have a phonetic guide`
    );
    assert.ok(
      termo.traducao && termo.traducao.trim().length > 0,
      `Term ${termo.id} must have a translation`
    );
    assert.ok(
      termo.significadoLiturgico && termo.significadoLiturgico.trim().length > 0,
      `Term ${termo.id} must have a liturgical meaning`
    );
    assert.ok(
      termo.exemploUsoIoruba && termo.exemploUsoIoruba.trim().length > 0,
      `Term ${termo.id} must have an example in Yoruba`
    );
    assert.ok(
      termo.exemploUsoTraducao && termo.exemploUsoTraducao.trim().length > 0,
      `Term ${termo.id} must have an example translation`
    );

    if (termo.orixaRelacionadoId) {
      assert.ok(
        orixaIds.includes(termo.orixaRelacionadoId),
        `Related orixa ${termo.orixaRelacionadoId} must exist in SEED_ORIXAS`
      );
    }
  });
});

test('GLOSSARIO_TERMOS contains required Ketu terms', () => {
  const termosNomes = GLOSSARIO_TERMOS.map((t) => t.termo.toLowerCase());
  assert.ok(termosNomes.some((t) => t.includes('mojúbà') || t.includes('mojuba')));
  assert.ok(termosNomes.some((t) => t.includes('àṣẹ') || t.includes('axé')));
  assert.ok(termosNomes.some((t) => t.includes('kábíyèsílè') || t.includes('kabiyesile')));
  assert.ok(termosNomes.some((t) => t.includes('patakorí') || t.includes('patakori')));
  assert.ok(termosNomes.some((t) => t.includes('tèbíèse') || t.includes('tebiese')));
});
