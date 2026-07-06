import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashString, makeRng } from '../js/core/rng.js';

test('같은 시드는 같은 수열(결정성)', () => {
  const a = makeRng('seed-1'); const b = makeRng('seed-1');
  const sa = [a.next(), a.next(), a.next()];
  const sb = [b.next(), b.next(), b.next()];
  assert.deepEqual(sa, sb);
});
test('다른 시드는 다른 수열', () => {
  const a = makeRng('seed-1'); const b = makeRng('seed-2');
  assert.notEqual(a.next(), b.next());
});
test('int(lo,hi)는 경계 포함 정수', () => {
  const r = makeRng('x'); const vals = new Set();
  for (let i=0;i<500;i++){ const v=r.int(1,3); assert.ok(v>=1&&v<=3&&Number.isInteger(v)); vals.add(v); }
  assert.deepEqual([...vals].sort(), [1,2,3]);
});
test('weighted는 가중치 0 항목을 절대 뽑지 않음', () => {
  const r = makeRng('w');
  for (let i=0;i<200;i++){
    const v = r.weighted([{value:'a',weight:1},{value:'z',weight:0}]);
    assert.equal(v,'a');
  }
});
test('hashString은 결정적 uint32', () => {
  assert.equal(hashString('abc'), hashString('abc'));
  assert.ok(hashString('abc') >= 0 && hashString('abc') <= 0xffffffff);
});
