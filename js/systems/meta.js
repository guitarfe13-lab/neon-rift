// 메타 상점 로직(순수). 소울로 영구 업그레이드 구매 + 캐릭터 해금.
import { META_UPGRADES } from '../data/metaUpgrades.js';
import { CHARACTERS } from '../data/characters.js';

export function upgradeCost(meta, id) {
  const u = META_UPGRADES[id]; if (!u) return null;
  const lvl = meta.upgrades[id] || 0;
  if (lvl >= u.maxLevel) return null;
  return u.cost(lvl);
}
export function canBuy(meta, id) {
  const c = upgradeCost(meta, id); return c != null && meta.souls >= c;
}
export function buyUpgrade(meta, id) {
  if (!canBuy(meta, id)) return meta;
  meta.souls -= upgradeCost(meta, id);
  meta.upgrades[id] = (meta.upgrades[id] || 0) + 1;
  return meta;
}

// 물약(자동 사용 소모품): 소울로 10개 묶음 구매. 런 중 저잔량 시 자동 소비.
export const POTION_BATCH = 10;
const POTION_COST = { hp: 25, mp: 20 };   // 묶음(10개) 가격
export function potionCost(kind) { return POTION_COST[kind] ?? null; }
export function canBuyPotion(meta, kind) { const c = potionCost(kind); return c != null && meta.souls >= c; }
export function buyPotion(meta, kind) {
  if (!canBuyPotion(meta, kind)) return meta;
  meta.souls -= potionCost(kind);
  if (!meta.potions) meta.potions = { hp: 0, mp: 0 };
  meta.potions[kind] = (meta.potions[kind] || 0) + POTION_BATCH;
  return meta;
}

// 황금코인 → 소울 교환. 게임오버 때 적립된 meta.gold를 소울로 환전(GOLD_PER_SOUL:1).
export const GOLD_PER_SOUL = 10;
export function goldToSouls(gold) { return Math.floor(Math.max(0, gold || 0) / GOLD_PER_SOUL); }
export function exchangeGold(meta, souls) {   // souls = 교환할 소울 개수
  const n = Math.min(Math.floor(souls) || 0, goldToSouls(meta.gold));
  if (n <= 0) return meta;
  meta.gold -= n * GOLD_PER_SOUL;
  meta.souls += n;
  return meta;
}
export function exchangeAllGold(meta) { return exchangeGold(meta, goldToSouls(meta.gold)); }

export function characterUnlockCost(id) { return CHARACTERS[id]?.unlockCost ?? null; }
export function isCharUnlocked(meta, id) { return meta.unlockedCharacters.includes(id); }
export function canUnlockChar(meta, id) {
  const c = characterUnlockCost(id);
  return c != null && !isCharUnlocked(meta, id) && meta.souls >= c;
}
export function unlockChar(meta, id) {
  if (!canUnlockChar(meta, id)) return meta;
  meta.souls -= characterUnlockCost(id);
  meta.unlockedCharacters.push(id);
  return meta;
}
