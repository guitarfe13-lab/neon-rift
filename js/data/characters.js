// 캐릭터 정의. base는 표준 스탯 키(stats.js STAT_KEYS)와 일치. unlockCost는 소울 해금 비용(기본 캐릭터는 없음).
function base(overrides) {
  return { maxHp:110, hpRegen:0.4, maxMp:50, mpRegen:0.1, damage:12, atkSpeed:1, area:1, projectiles:1, pierce:0,
    crit:0.05, critMult:1.55, moveSpeed:2.4, pickupRange:60, cooldown:1,
    goldGain:1, soulGain:1, xpGain:1, ...overrides };
}
// skillPool: 해당 직업이 레벨업으로 얻을 수 있는 신규 스킬(무작위 아님, 직업별 고정).
export const CHARACTERS = {
  blade: { id:'blade', name:'검사', shape:'triangle', sprite:'knight', color:'#42e6ff', desc:'높은 체력·근접 물리. MP 거의 안 씀.',
    base: base({ maxHp:160, maxMp:40, mpRegen:0.1, damage:12, moveSpeed:2.4 }), startingSkill:'strike', passive:'bulwark',
    skillPool:['strike','blade_orbit','spread_shot','orbit_blade','rail','turret','twin_shot','quake'] },
  mage: { id:'mage', name:'마법사', shape:'diamond', sprite:'mage', color:'#c98bff', desc:'유리 대포·강한 마법. MP 소모 큼.', unlockCost:200,
    base: base({ maxHp:85, maxMp:150, mpRegen:0.38, damage:16, crit:0.08, area:1.1, moveSpeed:2.2 }), startingSkill:'arcane_bolt', passive:'focus',
    skillPool:['arcane_bolt','fireball','laser','chain_spark','frost_aura','ice_shard','flame_aura'] },
  ranger: { id:'ranger', name:'궁수', shape:'triangle', sprite:'ranger', color:'#7cf9ff', desc:'빠른 공속·관통. 중간 MP.', unlockCost:350,
    base: base({ maxHp:100, maxMp:90, mpRegen:0.28, damage:11, atkSpeed:1.25, crit:0.12, moveSpeed:2.6 }), startingSkill:'laser', passive:'eagle',
    skillPool:['laser','rail','arcane_bolt','spread_shot','spirit','twin_shot','ice_shard'] },
  elementalist: { id:'elementalist', name:'정령술사', shape:'square', sprite:'crystal', color:'#5cd0ff', desc:'광역 오라·지속. 높은 MP.', unlockCost:500,
    base: base({ maxHp:125, maxMp:130, mpRegen:0.34, damage:10, area:1.25, moveSpeed:2.2 }), startingSkill:'ice_lance', passive:'attune',
    skillPool:['ice_lance','frost_aura','holy_field','venom_cloud','frost_ring','chain_spark','flame_aura','holy_lance'] },
};
export function getCharacter(id) { return CHARACTERS[id]; }
