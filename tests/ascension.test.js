import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sigilsEligible, sigilMods, rollSigils, applySigil } from '../js/systems/ascension.js';
import { SIGILS } from '../js/data/sigils.js';
import { makeRng } from '../js/core/rng.js';

test('sigilsEligible: 40레벨부터 +5마다 1개', () => {
  assert.equal(sigilsEligible(39), 0);
  assert.equal(sigilsEligible(40), 1);
  assert.equal(sigilsEligible(44), 1);
  assert.equal(sigilsEligible(45), 2);
  assert.equal(sigilsEligible(50), 3);
});
test('applySigil: 스택이 쌓인다', () => {
  const rs = {};
  applySigil(rs, 'radiance'); applySigil(rs, 'radiance');
  assert.equal(rs.sigils.radiance, 2);
  applySigil(rs, 'nonexistent');   // 무효 id는 무시
  assert.equal(rs.sigils.nonexistent, undefined);
});
test('sigilMods: 스택 수만큼 mods 배수, 거동형(mods 없음)은 미기여', () => {
  const rs = { sigils: { radiance: 2, chain_bolt: 3 } };   // radiance=stat, chain_bolt=behavior
  const mods = sigilMods(rs);
  const crit = mods.find(m => m.stat === 'crit');
  const critMult = mods.find(m => m.stat === 'critMult');
  assert.ok(Math.abs(crit.value - 0.12) < 1e-9);      // 0.06 × 2
  assert.ok(Math.abs(critMult.value - 0.4) < 1e-9);   // 0.2 × 2
  assert.ok(!mods.some(m => m.value === undefined));
  // chain_bolt은 mods가 없으므로 추가 항목 없음(radiance의 2개만)
  assert.equal(mods.length, 2);
});
test('rollSigils: count개 서로 다른 각인 반환', () => {
  const rs = { sigils: {} };
  const picks = rollSigils(rs, makeRng('s'), 3);
  assert.equal(picks.length, 3);
  const ids = picks.map(s => s.id);
  assert.equal(new Set(ids).size, 3);
  assert.ok(ids.every(id => SIGILS[id]));
});
test('rollSigils: 최대 스택에 도달한 각인은 후보에서 제외', () => {
  const rs = { sigils: { multishot: SIGILS.multishot.max } };   // multishot max=3 → 소진
  for (let i = 0; i < 40; i++) {
    const picks = rollSigils(rs, makeRng('r' + i), 3);
    assert.ok(!picks.some(s => s.id === 'multishot'), '소진된 각인은 안 나와야 함');
  }
});
