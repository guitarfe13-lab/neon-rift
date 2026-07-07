import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getTrees, chooseTree, applyDueNodes, TECH_UNLOCK_LEVEL } from '../js/systems/techtree.js';
import { TECH_TREES } from '../js/data/techTrees.js';
import { CHARACTERS } from '../js/data/characters.js';
import { computeStats } from '../js/engine/stats.js';

function runState(charId, level) {
  return { charId, level, passives: {}, metaUpgrades: {},
    stats: computeStats({ charId, metaUpgrades: {}, runMods: [] }) };
}

test('모든 직업에 테크트리 2계열 × 4노드(레벨 오름차순, 첫 노드=해금 레벨)', () => {
  for (const id of Object.keys(CHARACTERS)) {
    const trees = getTrees(id);
    assert.equal(trees.length, 2, id);
    for (const t of trees) {
      assert.equal(t.nodes.length, 4, t.id);
      assert.equal(t.nodes[0].lv, TECH_UNLOCK_LEVEL, t.id);
      for (let i = 1; i < t.nodes.length; i++) assert.ok(t.nodes[i].lv > t.nodes[i-1].lv, t.id);
    }
  }
});
test('트리 선택 시 현재 레벨 이하 노드 즉시 개방 + 스탯 반영', () => {
  const rs = runState('blade', 20);
  const before = rs.stats.atkSpeed;
  const applied = chooseTree(rs, TECH_TREES.blade[0]);   // 피의 광전사(lv20: 공속 +20%)
  assert.equal(applied.length, 1);
  assert.ok(rs.stats.atkSpeed > before);
  assert.equal(rs.techTree, 'berserker');
});
test('레벨 도달마다 노드 자동 개방 + 흡혈 특수 부여, 중복 선택 불가', () => {
  const rs = runState('blade', 20);
  chooseTree(rs, TECH_TREES.blade[0]);
  rs.level = 26;
  const applied = applyDueNodes(rs);                     // lv25 피의 흡수(흡혈)
  assert.equal(applied.length, 1);
  assert.ok(rs.lifesteal > 0);
  assert.equal(applyDueNodes(rs).length, 0);             // 같은 레벨 재호출 → 개방 없음
  assert.equal(chooseTree(rs, TECH_TREES.blade[1]).length, 0);  // 이미 선택 → 무시
  assert.equal(rs.techTree, 'berserker');
});
test('레벨 35 도달 시 4노드 전부 개방', () => {
  const rs = runState('ranger', 35);
  const applied = chooseTree(rs, TECH_TREES.ranger[1]);  // 화살 폭풍
  assert.equal(applied.length, 4);
  assert.equal(rs.stats.projectiles, 1 + 2);             // lv20 +1, lv35 +1
});
