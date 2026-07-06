// 스킬 정의(데이터 주도). type별 base 필드:
//  projectile/beam/summon: damage, count, speed, cooldown, pierce
//  orbital: damage, count
//  aura: damage, radius, cooldown(=피해 간격)
//  chain: damage, count, cooldown
// scale: +n(레벨당 가산) 또는 [배열](레벨 인덱스). evolveInto/evolveReq로 진화.
export const SKILLS = {
  // ── 투사체 ──
  blade_orbit: { id:'blade_orbit', name:'검기 투사', type:'projectile', tags:['physical'], color:'#42e6ff',
    base:{ damage:8, count:1, speed:7, cooldown:36, pierce:0 },
    scale:{ damage:+4, count:[1,1,2,2,3], cooldown:-3 }, maxLevel:8,
    evolveInto:'blade_storm', evolveReq:{ passive:'power', level:8 } },
  arcane_bolt: { id:'arcane_bolt', name:'비전 화살', type:'projectile', tags:['arcane'], color:'#c98bff',
    base:{ damage:10, count:1, speed:8, cooldown:44, pierce:1 },
    scale:{ damage:+5, count:[1,1,1,2,2,3], cooldown:-3 }, maxLevel:8,
    evolveInto:'arcane_storm', evolveReq:{ passive:'haste', level:8 } },
  spread_shot: { id:'spread_shot', name:'산탄', type:'projectile', tags:['physical'], color:'#ffd166',
    base:{ damage:6, count:3, speed:6.5, cooldown:52, pierce:0 },
    scale:{ damage:+3, count:[3,3,4,5,6], cooldown:-4 }, maxLevel:8 },
  fireball: { id:'fireball', name:'화염구', type:'projectile', tags:['fire'], color:'#ff6a3d',
    base:{ damage:16, count:1, speed:5.5, cooldown:64, pierce:2 },
    scale:{ damage:+8, cooldown:-5 }, maxLevel:8 },

  // ── 빔 ──
  laser: { id:'laser', name:'레이저', type:'beam', tags:['arcane'], color:'#7cf9ff',
    base:{ damage:12, speed:16, cooldown:40, pierce:99 },
    scale:{ damage:+6, cooldown:-3 }, maxLevel:8,
    evolveInto:'prism_beam', evolveReq:{ passive:'power', level:8 } },
  rail: { id:'rail', name:'레일건', type:'beam', tags:['physical'], color:'#a0f0ff',
    base:{ damage:26, speed:22, cooldown:80, pierce:99 },
    scale:{ damage:+12, cooldown:-6 }, maxLevel:8 },

  // ── 궤도 ──
  orbit_blade: { id:'orbit_blade', name:'회전 검', type:'orbital', tags:['physical'], color:'#ff8be0',
    base:{ damage:7, count:2 }, scale:{ damage:+4, count:[2,2,3,3,4,5] }, maxLevel:8,
    evolveInto:'saw_storm', evolveReq:{ passive:'might_core', level:8 } },
  frost_ring: { id:'frost_ring', name:'서리 고리', type:'orbital', tags:['ice'], color:'#8bd8ff',
    base:{ damage:6, count:3 }, scale:{ damage:+3, count:[3,3,4,4,5,6] }, maxLevel:8 },

  // ── 오라 ──
  frost_aura: { id:'frost_aura', name:'서리 오라', type:'aura', tags:['ice'], color:'#5cd0ff',
    base:{ damage:4, radius:72, cooldown:20 }, scale:{ damage:+3, radius:+8 }, maxLevel:8,
    evolveInto:'blizzard', evolveReq:{ passive:'giant', level:8 } },
  holy_field: { id:'holy_field', name:'신성 장판', type:'aura', tags:['holy'], color:'#ffe58a',
    base:{ damage:5, radius:64, cooldown:24 }, scale:{ damage:+4, radius:+9 }, maxLevel:8 },
  venom_cloud: { id:'venom_cloud', name:'맹독 구름', type:'aura', tags:['poison'], color:'#9cff8b',
    base:{ damage:3, radius:80, cooldown:14 }, scale:{ damage:+2, radius:+7 }, maxLevel:8 },

  // ── 연쇄 ──
  chain_spark: { id:'chain_spark', name:'연쇄 번개', type:'chain', tags:['lightning'], color:'#b28bff',
    base:{ damage:9, count:3, cooldown:56 }, scale:{ damage:+5, count:[3,3,4,4,5,6], cooldown:-4 }, maxLevel:8,
    evolveInto:'tempest', evolveReq:{ passive:'haste', level:8 } },
  arc_whip: { id:'arc_whip', name:'전격 채찍', type:'chain', tags:['lightning'], color:'#8bb8ff',
    base:{ damage:14, count:2, cooldown:70 }, scale:{ damage:+7, count:[2,2,3,3,4], cooldown:-5 }, maxLevel:8 },

  // ── 소환 ──
  turret: { id:'turret', name:'포탑 드론', type:'summon', tags:['physical'], color:'#8effc7',
    base:{ damage:7, speed:9, cooldown:30, pierce:0 }, scale:{ damage:+4, cooldown:-2 }, maxLevel:8 },
  spirit: { id:'spirit', name:'정령 드론', type:'summon', tags:['arcane'], color:'#8be0ff',
    base:{ damage:9, speed:10, cooldown:44, pierce:1 }, scale:{ damage:+5, cooldown:-3 }, maxLevel:8 },

  // ── 진화(강화판) ──
  blade_storm: { id:'blade_storm', name:'폭풍검(진화)', type:'projectile', tags:['physical'], color:'#8ffcff',
    base:{ damage:20, count:5, speed:8, cooldown:22, pierce:2 }, scale:{ damage:+9 }, maxLevel:5 },
  arcane_storm: { id:'arcane_storm', name:'비전 폭풍(진화)', type:'projectile', tags:['arcane'], color:'#e0a0ff',
    base:{ damage:24, count:4, speed:9, cooldown:24, pierce:3 }, scale:{ damage:+11 }, maxLevel:5 },
  prism_beam: { id:'prism_beam', name:'프리즘 빔(진화)', type:'beam', tags:['arcane'], color:'#bff8ff',
    base:{ damage:30, speed:18, cooldown:26, pierce:99 }, scale:{ damage:+14 }, maxLevel:5 },
  saw_storm: { id:'saw_storm', name:'톱날 폭풍(진화)', type:'orbital', tags:['physical'], color:'#ffb0ee',
    base:{ damage:18, count:6 }, scale:{ damage:+9, count:[6,7,8] }, maxLevel:5 },
  blizzard: { id:'blizzard', name:'눈보라(진화)', type:'aura', tags:['ice'], color:'#bfefff',
    base:{ damage:12, radius:120, cooldown:12 }, scale:{ damage:+7, radius:+10 }, maxLevel:5 },
  tempest: { id:'tempest', name:'폭풍우(진화)', type:'chain', tags:['lightning'], color:'#d0b8ff',
    base:{ damage:22, count:7, cooldown:30 }, scale:{ damage:+11 }, maxLevel:5 },
};
export function getSkill(id) { return SKILLS[id]; }
// 진화 스킬은 레벨업 후보 풀에서 제외(진화로만 획득).
export const EVOLUTIONS = new Set(['blade_storm','arcane_storm','prism_beam','saw_storm','blizzard','tempest']);
