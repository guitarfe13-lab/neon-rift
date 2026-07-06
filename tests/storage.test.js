import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultMeta, loadMeta, saveMeta, resetMeta } from '../js/core/storage.js';

function fakeStore() {
  const m = new Map();
  return { getItem:k=>m.has(k)?m.get(k):null, setItem:(k,v)=>m.set(k,String(v)), removeItem:k=>m.delete(k) };
}
test('저장 없으면 기본값 반환', () => {
  const s = fakeStore();
  assert.deepEqual(loadMeta(s), defaultMeta());
});
test('저장 후 로드 왕복', () => {
  const s = fakeStore(); const meta = defaultMeta(); meta.souls = 42;
  saveMeta(meta, s);
  assert.equal(loadMeta(s).souls, 42);
});
test('누락 필드는 기본값으로 병합(마이그레이션)', () => {
  const s = fakeStore(); s.setItem('neonrift.meta', JSON.stringify({ version:1, souls:5 }));
  const loaded = loadMeta(s);
  assert.equal(loaded.souls, 5);
  assert.equal(loaded.settings.master, 0.8);
  assert.ok(Array.isArray(loaded.unlockedCharacters));
});
test('깨진 JSON이면 기본값 폴백', () => {
  const s = fakeStore(); s.setItem('neonrift.meta', '{not json');
  assert.deepEqual(loadMeta(s), defaultMeta());
});
test('reset은 저장 삭제', () => {
  const s = fakeStore(); saveMeta(defaultMeta(), s); resetMeta(s);
  assert.equal(s.getItem('neonrift.meta'), null);
});
