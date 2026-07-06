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
