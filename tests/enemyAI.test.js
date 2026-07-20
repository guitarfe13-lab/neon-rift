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
test('스케일된 분열체의 분열자는 부모 성장 배율을 승계(후반 순삭 방지)', () => {
  const w = createWorld();
  const base = getEnemy('splitter');
  // 후반 스폰처럼 hp 5배·damage 2배로 성장한 분열체
  const e = { ...base, x:0, y:0, alive:true, hp:0, maxHp: base.hp*5, damage: base.damage*2 };
  onEnemyDeath(e, w, makeRng('s'));
  const mini = getEnemy(base.splitInto);
  for (const m of w.enemies) {
    assert.equal(m.maxHp, Math.round(mini.hp * 5));
    assert.equal(m.damage, Math.round(mini.damage * 2));
  }
});
test('아케인 반격 쿨(_retCd)은 프레임당 감소', () => {
  const w = createWorld(); w.player.x = 500; w.player.y = 0;
  const e = { ...getEnemy('grunt'), x:0, y:0, alive:true, _retCd: 10 };
  for (let i=0;i<10;i++) stepEnemy(e, w, makeRng('r'));
  assert.equal(e._retCd, 0);
});
// 아케인 몹 자동 시전(보라 마법) — 침묵 여부에 따른 발사 제어
const purpleCount = (silence) => {
  const w = createWorld(); w.player.x = 500; w.player.y = 0;
  const e = { ...getEnemy('grunt'), arcane:true, x:0, y:0, alive:true };
  if (silence != null) e._silence = silence;
  const rng = makeRng('arc-cast');
  for (let i=0;i<3000;i++) stepEnemy(e, w, rng);
  return w.hazards.filter(h => h.color === '#c98bff').length;
};
test('아케인 몹은 침묵이 아니면 자동 마법(보라)을 시전', () => {
  assert.ok(purpleCount(null) > 0, '침묵 아닌 아케인 몹은 보라 마법을 발사해야 함');
});
test('침묵(_silence)된 아케인 몹은 자동 마법을 시전하지 않는다', () => {
  assert.equal(purpleCount(100000), 0, '침묵 중엔 보라 마법이 나가면 안 됨');
});
test('_silence는 프레임당 감소(침묵 자동 해제)', () => {
  const w = createWorld(); w.player.x = 500; w.player.y = 0;
  const e = { ...getEnemy('grunt'), x:0, y:0, alive:true, _silence: 12 };
  for (let i=0;i<12;i++) stepEnemy(e, w, makeRng('s'));
  assert.equal(e._silence, 0);
});
test('감속(_slow)된 적은 더 느리게 이동하고 _slow는 프레임당 감소(서리장 키스톤)', () => {
  const mv = (slow) => {
    const w = createWorld(); w.player.x = 1000; w.player.y = 0;
    const e = { ...getEnemy('grunt'), x:0, y:0, alive:true }; if (slow) e._slow = 999;
    stepEnemy(e, w, makeRng('m'));
    return e.x;   // 1프레임 이동 거리(플레이어 쪽 +x)
  };
  assert.ok(mv(true) < mv(false), '감속 적이 덜 이동해야 함');
  const e = { ...getEnemy('grunt'), x:0, y:0, alive:true, _slow: 5 };
  const w = createWorld(); w.player.x = 1000; w.player.y = 0;
  for (let i=0;i<5;i++) stepEnemy(e, w, makeRng('m'));
  assert.equal(e._slow, 0);
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
