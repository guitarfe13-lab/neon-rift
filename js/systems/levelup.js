// XP/레벨/3택1. 후보 풀은 데이터에서 필터링해 가중 랜덤.
import { SKILLS } from '../data/skills.js';
import { computeStats } from '../engine/stats.js';

export function xpForLevel(level) { return Math.round(8 * Math.pow(level, 1.55) + 4); }

export function addXp(rs, amount) {
  rs.xp += amount; let levels = 0;
  while (rs.xp >= xpForLevel(rs.level)) { rs.xp -= xpForLevel(rs.level); rs.level++; levels++; }
  return { leveled: levels > 0, levels };
}

const PASSIVES = {
  power:   { id:'power',   label:'공격력 +15%', stat:'damage',     kind:'mult', value:0.15 },
  swift:   { id:'swift',   label:'이동속도 +10%',stat:'moveSpeed',  kind:'mult', value:0.10 },
  magnet:  { id:'magnet',  label:'획득범위 +25%',stat:'pickupRange',kind:'mult', value:0.25 },
};
export const PASSIVE_DEFS = PASSIVES;

export function rollChoices(rs, rng, count = 3) {
  const pool = [];
  for (const id of Object.keys(rs.ownedSkills)) {
    const s = SKILLS[id]; if (s && rs.ownedSkills[id] < s.maxLevel)
      pool.push({ kind:'upgrade', id, label:`${s.name} 강화 Lv${rs.ownedSkills[id]+1}`, weight:2 });
  }
  for (const id of Object.keys(SKILLS)) if (!rs.ownedSkills[id])
    pool.push({ kind:'new', id, label:`신규: ${SKILLS[id].name}`, weight:1 });
  for (const id of Object.keys(PASSIVES)) pool.push({ kind:'passive', id, label:PASSIVES[id].label, weight:1 });
  const chosen = []; const used = new Set();
  while (chosen.length < count && pool.some(p => !used.has(p.id))) {
    const avail = pool.filter(p => !used.has(p.id));
    const c = rng.weighted(avail.map(p => ({ value:p, weight:p.weight })));
    used.add(c.id); chosen.push(c);
  }
  return chosen;
}
export function applyChoice(rs, choice) {
  if (choice.kind === 'new') rs.ownedSkills[choice.id] = 1;
  else if (choice.kind === 'upgrade') rs.ownedSkills[choice.id] = (rs.ownedSkills[choice.id]||0) + 1;
  else if (choice.kind === 'passive') rs.passives[choice.id] = (rs.passives[choice.id]||0) + 1;
  const runMods = Object.keys(rs.passives).map(id => ({ ...PASSIVES[id] }));
  rs.stats = computeStats({ charId: rs.charId, metaUpgrades: rs.metaUpgrades, runMods });
}
