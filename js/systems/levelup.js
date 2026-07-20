// XP/레벨/3택1. 후보 풀은 데이터에서 필터링해 가중 랜덤. 진화 후보 포함.
import { SKILLS, EVOLUTIONS } from '../data/skills.js';
import { getCharacter } from '../data/characters.js';
import { computeStats } from '../engine/stats.js';
import { canEvolve } from './skillScaling.js';
import { sigilMods } from './ascension.js';

export function xpForLevel(level) { return Math.round(8 * Math.pow(level, 1.55) + 4); }

export function addXp(rs, amount) {
  rs.xp += amount; let levels = 0;
  while (rs.xp >= xpForLevel(rs.level)) { rs.xp -= xpForLevel(rs.level); rs.level++; levels++; }
  return { leveled: levels > 0, levels };
}

// 패시브 정의(스탯 강화). evolveReq에서 참조하는 id 포함(power/haste/might_core/giant).
const PASSIVES = {
  power:      { id:'power',      label:'공격력 +15%',   stat:'damage',      kind:'mult', value:0.15 },
  might_core: { id:'might_core', label:'힘 코어(공격력 +8)', stat:'damage', kind:'flat', value:8 },
  haste:      { id:'haste',      label:'공격속도 +12%', stat:'atkSpeed',    kind:'mult', value:0.12 },
  giant:      { id:'giant',      label:'범위 +15%',     stat:'area',        kind:'mult', value:0.15 },
  swift:      { id:'swift',      label:'이동속도 +5%',  stat:'moveSpeed',   kind:'mult', value:0.05 },
  magnet:     { id:'magnet',     label:'획득범위 +25%', stat:'pickupRange', kind:'mult', value:0.25 },
};
export const PASSIVE_DEFS = PASSIVES;

// 보유 패시브(레벨 배수) → runMods로 변환.
export function passiveMods(rs) {
  return Object.entries(rs.passives).map(([id, lvl]) => {
    const p = PASSIVES[id]; return { stat:p.stat, kind:p.kind, value:p.value * lvl };
  });
}

// 직업별 레벨 성장(마법계열 maxMp · 물리계열 maxHp) → runMod. 레벨 1은 성장 0, 이후 레벨당 value씩 flat 가산.
export function levelMods(rs) {
  const lg = getCharacter(rs.charId)?.levelGain;
  const steps = Math.max(0, (rs.level || 1) - 1);
  if (!lg || steps === 0) return [];
  return [{ stat: lg.stat, kind: 'flat', value: lg.value * steps }];
}

// 스탯 재계산에 쓰는 모든 런타임 보정(패시브 + 레벨 성장 + 테크트리 + 각인)을 한 곳에서 합성.
// 재계산 지점(레벨업 선택·테크 노드·각인·테스트훅)이 이걸 공유해야 성장이 유실되지 않는다.
export function allRunMods(rs) {
  return passiveMods(rs).concat(levelMods(rs)).concat(rs.treeMods || []).concat(sigilMods(rs));
}

export function rollChoices(rs, rng, count = 3) {
  const pool = [];
  // 진화(최우선): 보유 스킬이 최대레벨 + 요구 패시브 보유 시.
  for (const id of Object.keys(rs.ownedSkills)) {
    const s = SKILLS[id];
    if (s && s.evolveInto && !rs.ownedSkills[s.evolveInto] &&
        canEvolve(s, { ownedSkills: rs.ownedSkills, passives: rs.passives })) {
      pool.push({ kind:'evolve', id, into:s.evolveInto, label:`⚡ 진화: ${SKILLS[s.evolveInto].name}`, weight:6 });
    }
  }
  // 보유 스킬 강화(최대레벨 미만).
  for (const id of Object.keys(rs.ownedSkills)) {
    const s = SKILLS[id]; if (s && rs.ownedSkills[id] < s.maxLevel)
      pool.push({ kind:'upgrade', id, label:`${s.name} 강화 Lv${rs.ownedSkills[id]+1}`, weight:2 });
  }
  // 신규 스킬 — 직업 스킬풀 내에서만(무작위 아님), 진화형 제외·미보유.
  // 진화형을 이미 보유 중이면 그 원본은 다시 제안하지 않음(원본+진화 중복 방지).
  const classPool = getCharacter(rs.charId)?.skillPool || Object.keys(SKILLS);
  for (const id of classPool) { const s = SKILLS[id];
    if (!s || rs.ownedSkills[id] || EVOLUTIONS.has(id)) continue;
    if (s.evolveInto && rs.ownedSkills[s.evolveInto]) continue;
    if (s.requires && (rs.ownedSkills[s.requires.skill] || 0) < s.requires.level) continue; // 선행 스킬 레벨 미달
    pool.push({ kind:'new', id, label:`신규: ${s.name}`, weight:1 }); }
  // 패시브.
  for (const id of Object.keys(PASSIVES)) pool.push({ kind:'passive', id, label:PASSIVES[id].label, weight:1 });

  const chosen = []; const used = new Set();
  while (chosen.length < count && pool.some(p => !used.has(p.kind + p.id))) {
    const avail = pool.filter(p => !used.has(p.kind + p.id));
    const c = rng.weighted(avail.map(p => ({ value:p, weight:p.weight })));
    used.add(c.kind + c.id); chosen.push(c);
  }
  return chosen;
}

export function applyChoice(rs, choice) {
  if (choice.kind === 'new') rs.ownedSkills[choice.id] = 1;
  else if (choice.kind === 'upgrade') rs.ownedSkills[choice.id] = (rs.ownedSkills[choice.id]||0) + 1;
  else if (choice.kind === 'passive') rs.passives[choice.id] = (rs.passives[choice.id]||0) + 1;
  else if (choice.kind === 'evolve') { delete rs.ownedSkills[choice.id]; rs.ownedSkills[choice.into] = 1; }
  rs.stats = computeStats({ charId: rs.charId, metaUpgrades: rs.metaUpgrades,
    runMods: allRunMods(rs) });   // 패시브 + 레벨 성장 + 테크트리 보존
}
