// 스킬 정의(데이터 주도). type별 base 필드:
//  projectile/beam/summon: damage, count, speed, cooldown, pierce
//  orbital: damage, count
//  aura: damage, radius, cooldown(=피해 간격)
//  chain: damage, count, cooldown
// mpCost: 발사(또는 오라 틱/소환 발사)당 MP 소모. 물리 스킬은 0.
// scale: +n(레벨당 가산) 또는 [배열](레벨 인덱스). evolveInto/evolveReq로 진화.
export const SKILLS = {
  // ── 투사체 ──
  // 기본 물리 타격(검사 시작 스킬): 근거리·빠른 단타. life가 짧아 사거리가 짧다.
  strike: { id:'strike', name:'기본 타격', type:'projectile', tags:['physical'], color:'#dfe8ff', mpCost:0,
    base:{ damage:10, count:1, speed:10, cooldown:22, pierce:0, life:40 },
    scale:{ damage:+5, count:[1,1,1,2,2,3], cooldown:-2 }, maxLevel:8 },
  // 검기 투사: 기본 타격 3레벨 달성 후 해금.
  blade_orbit: { id:'blade_orbit', name:'검기 투사', type:'projectile', tags:['physical'], color:'#42e6ff', mpCost:0,
    base:{ damage:8, count:1, speed:7, cooldown:36, pierce:0 },
    scale:{ damage:+4, count:[1,1,2,2,3], cooldown:-3 }, maxLevel:8,
    requires:{ skill:'strike', level:3 },
    evolveInto:'blade_storm', evolveReq:{ passive:'power', level:8 } },
  twin_shot: { id:'twin_shot', name:'쌍발 사격', type:'projectile', tags:['physical'], color:'#8ff0ff', mpCost:0,
    base:{ damage:7, count:2, speed:7.5, cooldown:40, pierce:0 },
    scale:{ damage:+4, count:[2,2,3,3,4], cooldown:-3 }, maxLevel:8 },
  arcane_bolt: { id:'arcane_bolt', name:'비전 화살', type:'projectile', tags:['arcane'], color:'#c98bff', mpCost:3,
    base:{ damage:10, count:1, speed:8, cooldown:44, pierce:1 },
    scale:{ damage:+5, count:[1,1,1,2,2,3], cooldown:-3 }, maxLevel:8,
    evolveInto:'arcane_storm', evolveReq:{ passive:'haste', level:8 } },
  spread_shot: { id:'spread_shot', name:'산탄', type:'projectile', tags:['physical'], color:'#ffd166', mpCost:0,
    base:{ damage:6, count:3, speed:6.5, cooldown:52, pierce:0 },
    scale:{ damage:+3, count:[3,3,4,5,6], cooldown:-4 }, maxLevel:8 },
  fireball: { id:'fireball', name:'화염구', type:'projectile', tags:['fire'], color:'#ff6a3d', mpCost:7,
    base:{ damage:16, count:1, speed:5.5, cooldown:74, pierce:2 },
    scale:{ damage:+8, cooldown:-5 }, maxLevel:8 },
  ice_shard: { id:'ice_shard', name:'얼음 파편', type:'projectile', tags:['ice'], color:'#9fe8ff', mpCost:3, proj:'lance',
    base:{ damage:9, count:1, speed:7, cooldown:42, pierce:1 },
    scale:{ damage:+5, count:[1,1,2,2,3], cooldown:-3 }, maxLevel:8 },
  holy_lance: { id:'holy_lance', name:'신성 창', type:'projectile', tags:['holy'], color:'#ffe58a', mpCost:6, proj:'lance',
    base:{ damage:14, count:1, speed:9, cooldown:66, pierce:3 },
    scale:{ damage:+7, cooldown:-4 }, maxLevel:8 },
  // 얼음창: 정령술사 기본 원거리(관통 얼음 투사체).
  ice_lance: { id:'ice_lance', name:'얼음창', type:'projectile', tags:['ice'], color:'#a9e8ff', mpCost:2, proj:'lance',
    base:{ damage:11, count:1, speed:9, cooldown:38, pierce:2 },
    scale:{ damage:+5, count:[1,1,1,2,2,3], cooldown:-3 }, maxLevel:8 },

  // ── 빔 ──
  laser: { id:'laser', name:'레이저', type:'beam', tags:['arcane'], color:'#7cf9ff', mpCost:4,
    base:{ damage:12, speed:16, cooldown:40, pierce:99 },
    scale:{ damage:+6, cooldown:-3 }, maxLevel:8,
    evolveInto:'prism_beam', evolveReq:{ passive:'power', level:8 } },
  rail: { id:'rail', name:'레일건', type:'beam', tags:['physical'], color:'#a0f0ff', mpCost:0,
    base:{ damage:26, speed:22, cooldown:98, pierce:99 },
    scale:{ damage:+12, cooldown:-6 }, maxLevel:8 },

  // ── 궤도(지속체, MP 무소모) ──
  orbit_blade: { id:'orbit_blade', name:'회전 검', type:'orbital', tags:['physical'], color:'#ff8be0', mpCost:0, proj:'blade',
    base:{ damage:7, count:2 }, scale:{ damage:+4, count:[2,2,3,3,4,5] }, maxLevel:8,
    requires:{ skill:'strike', level:4 },
    evolveInto:'saw_storm', evolveReq:{ passive:'might_core', level:8 } },
  frost_ring: { id:'frost_ring', name:'서리 고리', type:'orbital', tags:['ice'], color:'#8bd8ff', mpCost:0, proj:'crystal',
    base:{ damage:6, count:3 }, scale:{ damage:+3, count:[3,3,4,4,5,6] }, maxLevel:8 },

  // ── 오라(틱당 MP) ──
  frost_aura: { id:'frost_aura', name:'서리 오라', type:'aura', tags:['ice'], color:'#5cd0ff', mpCost:4,
    base:{ damage:13, radius:76, cooldown:84 }, scale:{ damage:+6, radius:+8 }, maxLevel:8,
    evolveInto:'blizzard', evolveReq:{ passive:'giant', level:8 } },
  flame_aura: { id:'flame_aura', name:'화염 오라', type:'aura', tags:['fire'], color:'#ff7a3d', mpCost:4,
    base:{ damage:13, radius:74, cooldown:78 }, scale:{ damage:+6, radius:+8 }, maxLevel:8 },
  holy_field: { id:'holy_field', name:'신성 장판', type:'aura', tags:['holy'], color:'#ffe58a', mpCost:5,
    base:{ damage:18, radius:70, cooldown:96 }, scale:{ damage:+8, radius:+9 }, maxLevel:8 },
  venom_cloud: { id:'venom_cloud', name:'맹독 구름', type:'aura', tags:['poison'], color:'#9cff8b', mpCost:3,
    base:{ damage:8, radius:84, cooldown:60 }, scale:{ damage:+4, radius:+7 }, maxLevel:8 },
  quake: { id:'quake', name:'대지 진동', type:'aura', tags:['physical'], color:'#d9b38c', mpCost:0,
    base:{ damage:22, radius:96, cooldown:120 }, scale:{ damage:+9, radius:+8 }, maxLevel:8,
    requires:{ skill:'strike', level:5 } },

  // ── 연쇄 ──
  chain_spark: { id:'chain_spark', name:'연쇄 번개', type:'chain', tags:['lightning'], color:'#b28bff', mpCost:6,
    base:{ damage:9, count:3, cooldown:56 }, scale:{ damage:+5, count:[3,3,4,4,5,6], cooldown:-4 }, maxLevel:8,
    evolveInto:'tempest', evolveReq:{ passive:'haste', level:8 } },
  arc_whip: { id:'arc_whip', name:'전격 채찍', type:'chain', tags:['lightning'], color:'#8bb8ff', mpCost:7, proj:'whip',
    base:{ damage:14, count:2, cooldown:86 }, scale:{ damage:+7, count:[2,2,3,3,4], cooldown:-5 }, maxLevel:8 },

  // ── 소환(발사당 MP) ──
  turret: { id:'turret', name:'포탑 드론', type:'summon', tags:['physical'], color:'#8effc7', mpCost:0, proj:'turret',
    base:{ damage:7, speed:9, cooldown:30, pierce:0 }, scale:{ damage:+4, cooldown:-2 }, maxLevel:8 },
  spirit: { id:'spirit', name:'정령 드론', type:'summon', tags:['arcane'], color:'#8be0ff', mpCost:3, proj:'wisp',
    base:{ damage:9, speed:10, cooldown:44, pierce:1 }, scale:{ damage:+5, cooldown:-3 }, maxLevel:8 },

  // ── 진화(강화판) ──
  blade_storm: { id:'blade_storm', name:'폭풍검(진화)', type:'projectile', tags:['physical'], color:'#8ffcff', mpCost:0,
    base:{ damage:20, count:5, speed:8, cooldown:32, pierce:2 }, scale:{ damage:+9 }, maxLevel:5 },
  arcane_storm: { id:'arcane_storm', name:'비전 폭풍(진화)', type:'projectile', tags:['arcane'], color:'#e0a0ff', mpCost:9,
    base:{ damage:24, count:4, speed:9, cooldown:34, pierce:3 }, scale:{ damage:+11 }, maxLevel:5 },
  prism_beam: { id:'prism_beam', name:'프리즘 빔(진화)', type:'beam', tags:['arcane'], color:'#bff8ff', mpCost:8,
    base:{ damage:30, speed:18, cooldown:40, pierce:99 }, scale:{ damage:+14 }, maxLevel:5 },
  saw_storm: { id:'saw_storm', name:'톱날 폭풍(진화)', type:'orbital', tags:['physical'], color:'#ffb0ee', mpCost:0, proj:'saw',
    base:{ damage:18, count:6 }, scale:{ damage:+9, count:[6,7,8] }, maxLevel:5 },
  blizzard: { id:'blizzard', name:'눈보라(진화)', type:'aura', tags:['ice'], color:'#bfefff', mpCost:8,
    base:{ damage:28, radius:130, cooldown:88 }, scale:{ damage:+12, radius:+10 }, maxLevel:5 },
  tempest: { id:'tempest', name:'폭풍우(진화)', type:'chain', tags:['lightning'], color:'#d0b8ff', mpCost:9,
    base:{ damage:22, count:7, cooldown:44 }, scale:{ damage:+11 }, maxLevel:5 },
};
export function getSkill(id) { return SKILLS[id]; }
// 진화 스킬은 레벨업 후보 풀에서 제외(진화로만 획득).
export const EVOLUTIONS = new Set(['blade_storm','arcane_storm','prism_beam','saw_storm','blizzard','tempest']);
