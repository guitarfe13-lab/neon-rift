import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorld } from '../js/engine/entities.js';
import { updateSkills } from '../js/systems/skills.js';
import { makeRng } from '../js/core/rng.js';

function mageRs(owned, mp) {
  return { charId:'mage', ownedSkills:owned, passives:{}, mp,
    stats:{ damage:12, atkSpeed:1, area:1, projectiles:1, crit:0, critMult:2 } };
}
const enemy = (w) => w.spawnEnemy({ x:40, y:0, hp:100, radius:8, alive:true });

test('마법 스킬은 발사 시 MP를 소모', () => {
  const w = createWorld(); w.player.x=0; w.player.y=0; enemy(w);
  const r = mageRs({ arcane_bolt:1 }, 50);
  for (let i=0;i<80;i++) updateSkills(w, r, makeRng('m'), {}, ()=>{}, ()=>{});
  assert.ok(r.mp < 50);
});
test('MP가 부족하면 마법 스킬은 발사되지 않음', () => {
  const w = createWorld(); w.player.x=0; w.player.y=0; enemy(w);
  const r = mageRs({ arcane_bolt:1 }, 0);
  for (let i=0;i<80;i++) updateSkills(w, r, makeRng('m'), {}, ()=>{}, ()=>{});
  assert.equal(w.projectiles.length, 0);
});
test('물리 스킬은 MP 0이어도 발사', () => {
  const w = createWorld(); w.player.x=0; w.player.y=0; enemy(w);
  const r = { charId:'blade', ownedSkills:{ blade_orbit:1 }, passives:{}, mp:0,
    stats:{ damage:12, atkSpeed:1, area:1, projectiles:1, crit:0, critMult:2 } };
  for (let i=0;i<80;i++) updateSkills(w, r, makeRng('b'), {}, ()=>{}, ()=>{});
  assert.ok(w.projectiles.some(p=>!p.orbit));
});
