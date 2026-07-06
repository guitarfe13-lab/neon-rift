import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rollChoices, applyChoice } from '../js/systems/levelup.js';
import { makeRng } from '../js/core/rng.js';

function rs() {
  return { charId:'blade', level:9, xp:0, ownedSkills:{ blade_orbit:8 }, passives:{ power:1 }, metaUpgrades:{}, stats:{} };
}
test('최대레벨 스킬 + 요구 패시브면 진화 후보 등장', () => {
  const choices = [];
  for (let i=0;i<40;i++) choices.push(...rollChoices(rs(), makeRng('e'+i), 3));
  assert.ok(choices.some(c => c.kind==='evolve' && c.into==='blade_storm'));
});
test('진화 적용 시 원본 제거 + 진화형 추가', () => {
  const state = rs();
  applyChoice(state, { kind:'evolve', id:'blade_orbit', into:'blade_storm' });
  assert.equal(state.ownedSkills.blade_orbit, undefined);
  assert.equal(state.ownedSkills.blade_storm, 1);
});
