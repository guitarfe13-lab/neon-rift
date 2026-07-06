import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeLoop } from '../js/core/loop.js';

test('경과 시간만큼 고정 스텝 update 호출', () => {
  let updates = 0;
  const loop = makeLoop({ update: () => updates++, render: () => {}, step: 10 });
  loop.tick(0); loop.tick(35);
  assert.equal(updates, 3);
});
test('maxFrame로 스파이럴 방지', () => {
  let updates = 0;
  const loop = makeLoop({ update: () => updates++, render: () => {}, step: 10, maxFrame: 50 });
  loop.tick(0); loop.tick(100000);
  assert.equal(updates, 5);
});
