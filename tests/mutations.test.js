import { test } from 'node:test';
import assert from 'node:assert/strict';
import { abyssTier, applyMutation, MUTATIONS } from '../js/data/mutations.js';

test('abyssTier: 35레벨부터 +5마다 +1', () => {
  assert.equal(abyssTier(34), 0);
  assert.equal(abyssTier(35), 1);
  assert.equal(abyssTier(39), 1);
  assert.equal(abyssTier(40), 2);
  assert.equal(abyssTier(45), 3);
});
test('applyMutation barrier: 보호막·보상 배수 부여', () => {
  const st = { hp:100, xp:10, gold:10, speed:1, damage:5 };
  applyMutation(st, 'barrier', 1);
  assert.equal(st.mutation, 'barrier');
  assert.ok(st.barrier > 0 && st.barrierMax === st.barrier);
  assert.equal(st.xp, Math.round(10 * MUTATIONS.barrier.reward));
  assert.equal(st.gold, Math.round(10 * MUTATIONS.barrier.reward));
});
test('applyMutation frenzy: 속도·피해↑, hp 약간↓', () => {
  const st = { hp:100, xp:10, gold:10, speed:1, damage:10 };
  applyMutation(st, 'frenzy', 1);
  assert.ok(st.speed > 1);
  assert.ok(st.damage > 10);
  assert.ok(st.hp < 100);
});
test('applyMutation blink/volatile: 거동 플래그 설정', () => {
  const a = { hp:10, xp:1, gold:1, speed:1, damage:1 }; applyMutation(a, 'blink', 1);
  assert.equal(a.blink, true);
  const b = { hp:10, xp:1, gold:1, speed:1, damage:1 }; applyMutation(b, 'volatile', 1);
  assert.equal(b.volatile, true);
});
test('applyMutation 무효 id는 무시', () => {
  const st = { hp:10, xp:1, gold:1, speed:1, damage:1 };
  applyMutation(st, 'nope', 1);
  assert.equal(st.mutation, undefined);
});
