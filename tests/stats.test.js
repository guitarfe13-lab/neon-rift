import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeStats, baseStats } from '../js/engine/stats.js';

test('기본 스탯은 캐릭터 base를 반영', () => {
  const s = baseStats('blade');
  assert.ok(s.maxHp > 0 && s.damage > 0);
});
test('flat과 mult 누적: (base+flat)*(1+mult)', () => {
  const s = computeStats({
    charId: 'blade',
    metaUpgrades: {},
    runMods: [
      { stat: 'damage', kind: 'flat', value: 10 },
      { stat: 'damage', kind: 'mult', value: 0.5 },
    ],
  });
  const base = baseStats('blade').damage;
  assert.equal(s.damage, (base + 10) * 1.5);
});
test('메타 업그레이드 레벨이 스탯에 적용', () => {
  const s0 = computeStats({ charId:'blade', metaUpgrades:{}, runMods:[] });
  const s1 = computeStats({ charId:'blade', metaUpgrades:{ might: 3 }, runMods:[] });
  assert.ok(s1.damage > s0.damage);
});
