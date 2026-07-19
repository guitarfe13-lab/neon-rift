import { test } from 'node:test';
import assert from 'node:assert/strict';
import { xpForLevel, addXp, rollChoices, levelMods, allRunMods } from '../js/systems/levelup.js';
import { getCharacter } from '../js/data/characters.js';
import { computeStats } from '../js/engine/stats.js';
import { makeRng } from '../js/core/rng.js';

function runState() {
  return { charId:'blade', level:1, xp:0, ownedSkills:{ blade_orbit:1 }, passives:{}, stats:{}, metaUpgrades:{} };
}
test('xpForLevel은 단조 증가', () => {
  assert.ok(xpForLevel(2) > xpForLevel(1));
});
test('임계치 넘으면 레벨업', () => {
  const rs = runState(); const r = addXp(rs, xpForLevel(1) + 1);
  assert.equal(r.leveled, true); assert.ok(rs.level >= 2);
});
test('rollChoices는 정확히 count개, 중복 없는 id', () => {
  const rs = runState(); const choices = rollChoices(rs, makeRng('c'), 3);
  assert.equal(choices.length, 3);
  const ids = choices.map(c=>c.id); assert.equal(new Set(ids).size, ids.length);
});
test('선행 조건 미달 스킬은 신규 후보에서 제외(검사 검기 해금)', () => {
  const withStrike = (lv) => ({ charId:'blade', level:5, xp:0, ownedSkills:{ strike:lv }, passives:{}, metaUpgrades:{}, stats:{} });
  const offers = (rs) => { for (let i=0;i<60;i++) for (const c of rollChoices(rs, makeRng('r'+i),3)) if (c.kind==='new' && c.id==='blade_orbit') return true; return false; };
  assert.equal(offers(withStrike(2)), false); // strike 2레벨 → 검기 미해금
  assert.equal(offers(withStrike(3)), true);  // strike 3레벨 → 검기 해금
});
test('신규 스킬 후보는 직업 스킬풀 내에서만 등장', () => {
  const rs = { charId:'mage', level:2, xp:0, ownedSkills:{ arcane_bolt:1 }, passives:{}, metaUpgrades:{}, stats:{} };
  const pool = getCharacter('mage').skillPool;
  const news = [];
  for (let i=0;i<40;i++) for (const c of rollChoices(rs, makeRng('p'+i), 3)) if (c.kind==='new') news.push(c.id);
  assert.ok(news.length > 0 && news.every(id => pool.includes(id)));
});
test('레벨 성장: 레벨1은 성장 없음, 이후 레벨당 value씩 누적', () => {
  assert.deepEqual(levelMods({ charId:'blade', level:1 }), []);
  const m = levelMods({ charId:'blade', level:11 });   // 10레벨 성장
  assert.deepEqual(m, [{ stat:'maxHp', kind:'flat', value:60 }]);   // blade 6×10
});
test('물리계열(검사)은 레벨업 시 maxHp만 성장, maxMp 불변', () => {
  const mk = (level) => computeStats({ charId:'blade', metaUpgrades:{}, runMods: allRunMods({ charId:'blade', level, passives:{} }) });
  const lo = mk(1), hi = mk(21);
  assert.ok(hi.maxHp > lo.maxHp);            // HP 성장
  assert.equal(hi.maxMp, lo.maxMp);          // MP 불변
  assert.equal(hi.maxHp - lo.maxHp, 6 * 20); // 레벨당 +6
});
test('마법계열(마법사)은 레벨업 시 maxMp만 성장, maxHp 불변', () => {
  const mk = (level) => computeStats({ charId:'mage', metaUpgrades:{}, runMods: allRunMods({ charId:'mage', level, passives:{} }) });
  const lo = mk(1), hi = mk(21);
  assert.ok(hi.maxMp > lo.maxMp);            // MP 성장
  assert.equal(hi.maxHp, lo.maxHp);          // HP 불변
  assert.equal(hi.maxMp - lo.maxMp, 4 * 20); // 레벨당 +4
});
test('레벨 성장은 패시브·테크 보정과 함께 합성', () => {
  const rs = { charId:'blade', level:11, passives:{ power:2 }, treeMods:[{ stat:'maxHp', kind:'mult', value:0.3 }] };
  const mods = allRunMods(rs);
  assert.ok(mods.some(m => m.stat==='damage'));                          // 패시브(power)
  assert.ok(mods.some(m => m.stat==='maxHp' && m.kind==='flat' && m.value===60));  // 레벨 성장
  assert.ok(mods.some(m => m.stat==='maxHp' && m.kind==='mult'));        // 테크(강철 피부)
});
