// 캐릭터 정의. base는 표준 스탯 키(stats.js STAT_KEYS)와 일치. unlockCost는 소울 해금 비용(기본 캐릭터는 없음).
function base(overrides) {
  return { maxHp:110, hpRegen:0.4, damage:12, atkSpeed:1, area:1, projectiles:1, pierce:0,
    crit:0.05, critMult:2, moveSpeed:2.4, pickupRange:60, cooldown:1,
    goldGain:1, soulGain:1, xpGain:1, ...overrides };
}
export const CHARACTERS = {
  blade: { id:'blade', name:'검사', shape:'triangle', sprite:'knight', color:'#42e6ff', desc:'균형·높은 체력. 회전 검기.',
    base: base({ maxHp:130, damage:12, moveSpeed:2.4 }), startingSkill:'blade_orbit', passive:'bulwark' },
  mage: { id:'mage', name:'마법사', shape:'diamond', sprite:'mage', color:'#c98bff', desc:'유리 대포. 강한 투사체.', unlockCost:200,
    base: base({ maxHp:90, damage:16, crit:0.08, area:1.1, moveSpeed:2.2 }), startingSkill:'arcane_bolt', passive:'focus' },
  ranger: { id:'ranger', name:'궁수', shape:'triangle', sprite:'ranger', color:'#7cf9ff', desc:'빠른 공속·관통 빔.', unlockCost:350,
    base: base({ maxHp:95, damage:11, atkSpeed:1.25, crit:0.12, moveSpeed:2.6 }), startingSkill:'laser', passive:'eagle' },
  elementalist: { id:'elementalist', name:'정령술사', shape:'square', sprite:'crystal', color:'#5cd0ff', desc:'광역 오라·지속 피해.', unlockCost:500,
    base: base({ maxHp:110, damage:10, area:1.25, moveSpeed:2.2 }), startingSkill:'frost_aura', passive:'attune' },
};
export function getCharacter(id) { return CHARACTERS[id]; }
