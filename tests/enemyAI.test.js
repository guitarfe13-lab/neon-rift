import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stepEnemy, onEnemyDeath } from '../js/engine/enemyAI.js';
import { createWorld } from '../js/engine/entities.js';
import { getEnemy } from '../js/data/enemies.js';
import { getBoss } from '../js/data/bosses.js';
import { makeRng } from '../js/core/rng.js';

test('분열체 사망 시 미니 적 2기 생성', () => {
  const w = createWorld();
  const e = { ...getEnemy('splitter'), x:0, y:0, alive:true };
  onEnemyDeath(e, w, makeRng('s'));
  assert.equal(w.enemies.length, 2);
});
test('슈터는 사거리 내에서 hazard 발사', () => {
  const w = createWorld(); w.player.x=0; w.player.y=0;
  const e = { ...getEnemy('shooter'), x:100, y:0, alive:true };
  for (let i=0;i<200;i++) stepEnemy(e, w, makeRng('x'));
  assert.ok(w.hazards.length > 0);
});
test('보스는 패턴으로 hazard 다수 발사', () => {
  const w = createWorld(); w.player.x=0; w.player.y=0;
  const b = getBoss('warden');
  const e = { ...b, x:0, y:-200, alive:true, maxHp:b.hp };
  for (let i=0;i<200;i++) stepEnemy(e, w, makeRng('b'));
  assert.ok(w.hazards.length >= b.shotCount);
});
test('보스 스킬은 시전 시 스킬탄(주황) 발사 + 스킬명 표시', () => {
  const w = createWorld(); w.player.x=0; w.player.y=0;
  const b = getBoss('warden');
  const e = { ...b, x:0, y:-200, alive:true, maxHp:b.hp, skillTier:0 };
  for (let i=0;i<220;i++) stepEnemy(e, w, makeRng('s0'));
  const skillShots = w.hazards.filter(h => h.color === '#ff7a2e').length;
  assert.ok(skillShots > 0, '스킬탄이 발사되어야 함');
  assert.equal(e._skillName, b.skill.name);
});
test('보스 스킬 티어가 높을수록 광역(스킬탄 수↑)', () => {
  const shots = (tier) => {
    const w = createWorld(); w.player.x=0; w.player.y=0;
    const b = getBoss('colossus');
    const e = { ...b, x:0, y:-200, alive:true, maxHp:b.hp, skillTier:tier };
    for (let i=0;i<Math.floor((b.skill.cd*0.55)+2);i++) stepEnemy(e, w, makeRng('t'));
    return w.hazards.filter(h => h.color === '#ff7a2e').length;
  };
  assert.ok(shots(3) > shots(0), '티어3이 티어0보다 스킬탄이 많아야 함');
});
test('일반 적은 플레이어 쪽으로 이동', () => {
  const w = createWorld(); w.player.x=100; w.player.y=0;
  const e = { ...getEnemy('grunt'), x:0, y:0, alive:true };
  stepEnemy(e, w, makeRng('m'));
  assert.ok(e.x > 0);
});
