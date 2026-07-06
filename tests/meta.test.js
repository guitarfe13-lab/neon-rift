import { test } from 'node:test';
import assert from 'node:assert/strict';
import { upgradeCost, canBuy, buyUpgrade, canUnlockChar, unlockChar, potionCost, canBuyPotion, buyPotion } from '../js/systems/meta.js';
import { defaultMeta } from '../js/core/storage.js';

test('소울 부족이면 구매 불가', () => {
  const m = defaultMeta(); m.souls = 0;
  assert.equal(canBuy(m, 'might'), false);
});
test('구매 시 소울 차감 + 레벨 증가', () => {
  const m = defaultMeta(); m.souls = 1000;
  const cost = upgradeCost(m, 'might'); buyUpgrade(m, 'might');
  assert.equal(m.upgrades.might, 1); assert.equal(m.souls, 1000 - cost);
});
test('최대 레벨이면 cost는 null, 구매 불가', () => {
  const m = defaultMeta(); m.souls = 1e9; m.upgrades.might = 10;
  assert.equal(upgradeCost(m, 'might'), null);
  assert.equal(canBuy(m, 'might'), false);
});
test('캐릭터 해금: 소울 충분+미보유면 가능, 해금 후 목록 추가', () => {
  const m = defaultMeta(); m.souls = 1000;
  assert.equal(canUnlockChar(m, 'mage'), true);
  unlockChar(m, 'mage');
  assert.ok(m.unlockedCharacters.includes('mage'));
  assert.equal(canUnlockChar(m, 'mage'), false); // 이미 보유
});
test('기본 캐릭터(blade)는 해금 대상 아님', () => {
  const m = defaultMeta(); m.souls = 1e9;
  assert.equal(canUnlockChar(m, 'blade'), false);
});
test('물약 구매: 소울 차감 + 보유량 증가', () => {
  const m = defaultMeta(); m.souls = 1000;
  const c = potionCost('hp'); buyPotion(m, 'hp');
  assert.equal(m.potions.hp, 1); assert.equal(m.souls, 1000 - c);
});
test('소울 부족이면 물약 구매 불가', () => {
  const m = defaultMeta(); m.souls = 0;
  assert.equal(canBuyPotion(m, 'hp'), false); buyPotion(m, 'hp');
  assert.equal(m.potions.hp, 0);
});
