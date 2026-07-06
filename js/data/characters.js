// 캐릭터 정의. base는 표준 스탯 키(stats.js STAT_KEYS)와 일치.
export const CHARACTERS = {
  blade: {
    id: 'blade', name: '검사', shape: 'triangle', color: '#42e6ff',
    base: { maxHp: 120, hpRegen: 0.4, damage: 12, atkSpeed: 1, area: 1, projectiles: 1,
      pierce: 0, crit: 0.05, critMult: 2, moveSpeed: 2.4, pickupRange: 60, cooldown: 1,
      goldGain: 1, soulGain: 1, xpGain: 1 },
    startingSkill: 'blade_orbit', passive: 'bulwark',
  },
};
export function getCharacter(id) { return CHARACTERS[id]; }
