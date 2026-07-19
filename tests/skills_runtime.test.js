import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorld } from '../js/engine/entities.js';
import { updateSkills } from '../js/systems/skills.js';
import { makeRng } from '../js/core/rng.js';

function rsWith(owned) {
  return { charId:'blade', ownedSkills:owned, passives:{},
    stats:{ damage:12, atkSpeed:1, area:1, projectiles:1, crit:0, critMult:2 } };
}

test('오라는 범위 내 적에게 지속 피해', () => {
  const w = createWorld(); w.player.x=0; w.player.y=0;
  const e = w.spawnEnemy({ x:20, y:0, hp:100, radius:10 });
  let dealt=0; const onDmg=(en,d)=>{ en.hp-=d; dealt+=d; };
  for (let i=0;i<200;i++) updateSkills(w, rsWith({ frost_aura:1 }), makeRng('a'), {}, onDmg);
  assert.ok(e.hp < 100 && dealt > 0);
});
test('궤도 스킬은 count개의 orbit 투사체를 만들고 중복 스폰하지 않음', () => {
  const w = createWorld(); const rs = rsWith({ orbit_blade:1 }); const st = {};
  updateSkills(w, rs, makeRng('o'), st, ()=>{});
  assert.equal(w.projectiles.filter(p=>p.orbit).length, 2);
  updateSkills(w, rs, makeRng('o'), st, ()=>{});
  assert.equal(w.projectiles.filter(p=>p.orbit).length, 2);
});
test('연쇄는 인접 적들에게 피해(onDamage 호출)', () => {
  const w = createWorld(); w.player.x=0; w.player.y=0;
  w.spawnEnemy({ x:10,y:0,hp:50,radius:8 }); w.spawnEnemy({ x:20,y:0,hp:50,radius:8 }); w.spawnEnemy({ x:30,y:0,hp:50,radius:8 });
  let calls=0; const st={};
  for (let i=0;i<80;i++) updateSkills(w, rsWith({ chain_spark:1 }), makeRng('c'), st, ()=>calls++);
  assert.ok(calls >= 1);
});
test('연쇄 번개는 스킬 레벨이 높을수록 볼트가 굵어짐(bolt.w↑)', () => {
  const maxBoltW = (level) => {
    const w = createWorld(); w.player.x=0; w.player.y=0;
    w.spawnEnemy({ x:20,y:0,hp:9999,radius:8 }); w.spawnEnemy({ x:40,y:0,hp:9999,radius:8 });
    const st={};
    for (let i=0;i<120;i++) updateSkills(w, rsWith({ chain_spark:level }), makeRng('bw'), st, ()=>{});
    const bolts = w.particles.filter(p=>p.bolt);
    assert.ok(bolts.length > 0, '볼트 파티클이 생성되어야 함');
    return Math.max(...bolts.map(p=>p.w));
  };
  assert.ok(maxBoltW(6) > maxBoltW(1), '레벨6 볼트가 레벨1보다 굵어야 함');
});
test('투사체 스킬은 적이 있을 때 발사', () => {
  const w = createWorld(); w.player.x=0; w.player.y=0;
  w.spawnEnemy({ x:50,y:0,hp:10,radius:8 });
  const st={}; for (let i=0;i<60;i++) updateSkills(w, rsWith({ arcane_bolt:1 }), makeRng('p'), st, ()=>{});
  assert.ok(w.projectiles.some(p=>!p.orbit));
});
