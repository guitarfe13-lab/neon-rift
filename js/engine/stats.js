// 파생 스탯 계산(순수). base + Σflat, 그다음 ×(1+Σmult).
import { getCharacter } from '../data/characters.js';
import { META_UPGRADES } from '../data/metaUpgrades.js';

export const STAT_KEYS = ['maxHp','hpRegen','damage','atkSpeed','area','projectiles','pierce',
  'crit','critMult','moveSpeed','pickupRange','cooldown','goldGain','soulGain','xpGain'];

export function baseStats(charId) { return { ...getCharacter(charId).base }; }

export function computeStats({ charId, metaUpgrades = {}, runMods = [] }) {
  const flat = {}; const mult = {};
  for (const k of STAT_KEYS) { flat[k] = 0; mult[k] = 0; }
  for (const [id, lvl] of Object.entries(metaUpgrades)) {
    const u = META_UPGRADES[id]; if (!u || !lvl) continue;
    if (u.kind === 'flat') flat[u.stat] += u.perLevel * lvl;
    else mult[u.stat] += u.perLevel * lvl;
  }
  for (const m of runMods) {
    if (m.kind === 'flat') flat[m.stat] = (flat[m.stat] || 0) + m.value;
    else mult[m.stat] = (mult[m.stat] || 0) + m.value;
  }
  const base = baseStats(charId); const out = {};
  for (const k of STAT_KEYS) out[k] = (base[k] + (flat[k] || 0)) * (1 + (mult[k] || 0));
  return out;
}
