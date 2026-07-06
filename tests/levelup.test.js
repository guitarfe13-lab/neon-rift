import { test } from 'node:test';
import assert from 'node:assert/strict';
import { xpForLevel, addXp, rollChoices } from '../js/systems/levelup.js';
import { getCharacter } from '../js/data/characters.js';
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
