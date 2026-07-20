import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getTrees, chooseTree, nextDueNode, applyNode, describeMods, TECH_UNLOCK_LEVEL, KEYSTONES } from '../js/systems/techtree.js';
import { TECH_TREES } from '../js/data/techTrees.js';
import { CHARACTERS } from '../js/data/characters.js';
import { computeStats } from '../js/engine/stats.js';

function runState(charId, level) {
  return { charId, level, passives: {}, metaUpgrades: {},
    stats: computeStats({ charId, metaUpgrades: {}, runMods: [] }) };
}

test('모든 직업 3계열 × 4노드(진입=lv20 단일, 25/30/35=2택 분기)', () => {
  for (const id of Object.keys(CHARACTERS)) {
    const trees = getTrees(id);
    assert.equal(trees.length, 3, id);
    for (const t of trees) {
      assert.equal(t.nodes.length, 4, t.id);
      assert.equal(t.nodes[0].lv, TECH_UNLOCK_LEVEL, t.id);
      assert.ok(!t.nodes[0].options, t.id + ' 진입 노드는 단일');
      for (let i = 1; i < 4; i++) {
        assert.ok(t.nodes[i].lv > t.nodes[i-1].lv, t.id);
        assert.equal(t.nodes[i].options?.length, 2, t.id + ' 분기는 2택');
      }
    }
  }
});
test('트리 선택 → 진입 노드 자동 적용(스탯 반영), 재선택 불가', () => {
  const rs = runState('blade', 20);
  const before = rs.stats.atkSpeed;
  assert.equal(chooseTree(rs, TECH_TREES.blade[0]), true);       // 피의 광전사
  assert.equal(nextDueNode(rs).lv, 20);
  const opt = applyNode(rs);                                     // 진입: 광폭화(공속+20%)
  assert.equal(opt.name, '광폭화');
  assert.ok(rs.stats.atkSpeed > before);
  assert.equal(nextDueNode(rs), null);                           // lv25 미도달
  assert.equal(chooseTree(rs, TECH_TREES.blade[1]), false);      // 이미 선택
});
test('분기 노드: 선택지에 따라 다른 효과(흡혈 vs 공격력)', () => {
  const mk = () => { const rs = runState('blade', 25); chooseTree(rs, TECH_TREES.blade[0]); applyNode(rs); return rs; };
  const a = mk(); const nodeA = nextDueNode(a);
  assert.equal(nodeA.lv, 25); assert.equal(nodeA.options.length, 2);
  applyNode(a, 0);                                               // 피의 흡수
  assert.ok(a.lifesteal > 0);
  const b = mk(); const dmg0 = b.stats.damage;
  applyNode(b, 1);                                               // 압도(공격 +18%)
  assert.ok(!b.lifesteal); assert.ok(b.stats.damage > dmg0);
});
test('레벨 35: 진입+분기 3회 순차 개방, 투사체 누적', () => {
  const rs = runState('ranger', 35);
  chooseTree(rs, TECH_TREES.ranger[1]);                          // 화살 폭풍
  let applied = 0;
  while (nextDueNode(rs)) { applyNode(rs, 0); applied++; }       // 항상 1번째 옵션
  assert.equal(applied, 4);
  assert.equal(rs.stats.projectiles, 1 + 2);                     // 진입 +1, lv35 '화살비 완성' +1
});
test('모든 트리에 유효한 키스톤(special/name/desc)이 매핑됨', () => {
  const valid = new Set(['siphon','guard','arcCrit','detonate','execute','echo','frostfield','overcharge']);
  for (const id of Object.keys(CHARACTERS)) for (const t of getTrees(id)) {
    const ks = KEYSTONES[t.id];
    assert.ok(ks, t.id + ' 키스톤 존재');
    assert.ok(valid.has(ks.special), t.id + ' 유효 special: ' + ks.special);
    assert.ok(ks.name && ks.desc, t.id + ' 이름·설명');
  }
});
test('chooseTree는 계열 키스톤을 rs에 부여', () => {
  const rs = runState('blade', 20);
  chooseTree(rs, TECH_TREES.blade[1]);                            // 불괴의 수호자 → guard
  assert.equal(rs.keystone, 'guard');
  assert.equal(rs.keystoneName, KEYSTONES.guardian.name);
  assert.equal(rs.keystoneColor, TECH_TREES.blade[1].color);
});
test('describeMods: 효과 요약 문자열', () => {
  assert.equal(describeMods([{stat:'damage',kind:'mult',value:0.2}]), '공격력 +20%');
  assert.equal(describeMods([{stat:'pierce',kind:'flat',value:1}]), '관통 +1');
  assert.equal(describeMods([], { lifesteal:0.06 }), '흡혈 6%');
  assert.equal(describeMods([{stat:'mpCostMul',kind:'mult',value:-0.25}]), '마나 소모 -25%');
});
