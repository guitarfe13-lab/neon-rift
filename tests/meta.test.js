import { test } from 'node:test';
import assert from 'node:assert/strict';
import { upgradeCost, canBuy, buyUpgrade, canUnlockChar, unlockChar, potionCost, canBuyPotion, buyPotion,
  OATH_COST, canBuyOath, buyOath,
  GOLD_PER_SOUL, goldToSouls, exchangeGold, exchangeAllGold } from '../js/systems/meta.js';
import { defaultMeta } from '../js/core/storage.js';

test('신성의 맹세: 소울 부족이면 구매 불가', () => {
  const m = defaultMeta(); m.souls = OATH_COST - 1;
  assert.equal(canBuyOath(m), false);
  buyOath(m);
  assert.equal(m.relics.oath, 0); assert.equal(m.souls, OATH_COST - 1);
});
test('신성의 맹세: 구매 시 10,000 소울 차감 + 보유 증가(중첩 가능)', () => {
  const m = defaultMeta(); m.souls = OATH_COST * 2 + 5;
  buyOath(m); buyOath(m);
  assert.equal(m.relics.oath, 2); assert.equal(m.souls, 5);
  buyOath(m);                                    // 잔액 부족 → 변화 없음
  assert.equal(m.relics.oath, 2); assert.equal(m.souls, 5);
});

test('골드→소울: 환산은 GOLD_PER_SOUL로 내림', () => {
  assert.equal(goldToSouls(0), 0);
  assert.equal(goldToSouls(GOLD_PER_SOUL - 1), 0);
  assert.equal(goldToSouls(GOLD_PER_SOUL * 3 + 4), 3);
});
test('골드→소울: 교환 시 골드 차감·소울 증가, 잔돈 유지', () => {
  const m = defaultMeta(); m.gold = GOLD_PER_SOUL * 3 + 4; m.souls = 5;   // 3소울 + 4잔돈
  exchangeGold(m, 3);
  assert.equal(m.souls, 8); assert.equal(m.gold, 4);
});
test('골드→소울: 보유 초과 요청은 가능한 만큼만, 전부 교환은 잔돈만 남김', () => {
  const m = defaultMeta(); m.gold = GOLD_PER_SOUL * 2 + 7; m.souls = 0;
  exchangeGold(m, 999);                 // 최대 2소울까지만
  assert.equal(m.souls, 2); assert.equal(m.gold, 7);
  const m2 = defaultMeta(); m2.gold = GOLD_PER_SOUL * 5 + 3;
  exchangeAllGold(m2);
  assert.equal(m2.souls, 5); assert.equal(m2.gold, 3);
});

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
test('물약 구매: 소울 차감 + 10개 묶음 지급', () => {
  const m = defaultMeta(); m.souls = 1000;
  const c = potionCost('hp'); buyPotion(m, 'hp');
  assert.equal(m.potions.hp, 10); assert.equal(m.souls, 1000 - c);
});
test('소울 부족이면 물약 구매 불가', () => {
  const m = defaultMeta(); m.souls = 0;
  assert.equal(canBuyPotion(m, 'hp'), false); buyPotion(m, 'hp');
  assert.equal(m.potions.hp, 0);
});
