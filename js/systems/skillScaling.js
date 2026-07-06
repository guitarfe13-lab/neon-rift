// 스킬 레벨 스케일링(순수). +n=레벨당 가산, 배열=레벨 인덱스.
export function runtimeStats(skill, level) {
  const out = { ...skill.base };
  for (const [key, rule] of Object.entries(skill.scale || {})) {
    if (Array.isArray(rule)) out[key] = rule[Math.min(level, rule.length) - 1];
    else out[key] = skill.base[key] + rule * (level - 1);
  }
  return out;
}
export function canEvolve(skill, owned) {
  if (!skill.evolveReq) return false;
  const { passive, level } = skill.evolveReq;
  return (owned.passives?.[passive] || 0) >= 1 && (owned.ownedSkills?.[skill.id] || 0) >= (level || skill.maxLevel);
}
