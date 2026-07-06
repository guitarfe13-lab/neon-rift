// 스킬 정의(v1 시작 스킬 하나; 이후 태스크에서 확장).
export const SKILLS = {
  blade_orbit: {
    id:'blade_orbit', name:'검기 투사', type:'projectile', tags:['physical'],
    base:{ damage:8, count:1, speed:7, cooldown:36, pierce:0 },
    scale:{ damage:+4, count:[1,1,2,2,3], cooldown:-3 }, maxLevel:8,
  },
};
export function getSkill(id) { return SKILLS[id]; }
